"""FastAPI backend for Show Me the Model."""

import asyncio
import json
import logging
import os
import re
import secrets
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

from anthropic import AsyncAnthropic
from fastapi import FastAPI, File, Form, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from openai import AsyncOpenAI
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sse_starlette.sse import EventSourceResponse
from starlette.middleware.base import BaseHTTPMiddleware

from backend.email_notify import send_results_email
from backend.jobs import STAGE_NAMES, JobStatus, JobStore
from backend.pipeline import run_pipeline
from backend.text_extract import extract_from_pdf, extract_from_url, validate_text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

store = JobStore()
limiter = Limiter(key_func=get_remote_address)

EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


# --- Cleanup task ---


async def _cleanup_loop() -> None:
    """Periodically remove expired jobs."""
    while True:
        await asyncio.sleep(3600)
        store.cleanup_expired()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    asyncio.create_task(_cleanup_loop())
    yield


app = FastAPI(title="Show Me the Model", version="0.1.0", lifespan=lifespan)
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def _rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please try again later."},
    )


# Security headers
CSP_POLICY = (
    "default-src 'self'; "
    "script-src 'self'; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' https://fonts.gstatic.com; "
    "connect-src 'self'; "
    "img-src 'self' data:; "
    "frame-ancestors 'none'"
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Content-Security-Policy"] = CSP_POLICY
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        return response


app.add_middleware(SecurityHeadersMiddleware)

# CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
allowed_origins = [o.strip() for o in allowed_origins if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=bool(allowed_origins),  # only with explicit origins
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Helpers ---


async def _resolve_source_text(
    text: str | None,
    url: str | None,
    file: UploadFile | None,
    body: dict,
) -> tuple[str, str, str | None]:
    """Resolve whichever input source was provided.

    Returns (source_text, input_mode, source_url).
    """
    if text is None and url is None and file is None:
        text = body.get("text")
        url = body.get("url")

    sources = sum(1 for s in [text, url, file] if s is not None)
    if sources == 0:
        raise HTTPException(
            status_code=400,
            detail="Provide exactly one input: text, url, or file (PDF upload)",
        )
    if sources > 1:
        raise HTTPException(
            status_code=400,
            detail="Provide exactly one input: text, url, or file (PDF upload)",
        )

    try:
        if text:
            return validate_text(text), "text", None
        elif url:
            return await extract_from_url(url), "url", url
        else:
            pdf_bytes = await file.read()
            return await extract_from_pdf(pdf_bytes), "pdf", None
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


# --- Pipeline background task ---


async def _run_job(job_id: str, api_key: str, base_url: str, provider: str) -> None:
    """Run the pipeline in the background, pushing events to the job's queue."""
    job = store.get(job_id)
    if not job:
        return

    job.status = JobStatus.RUNNING

    def on_stage_complete(stage_name: str, result: object) -> None:
        """Synchronous callback invoked by run_pipeline."""
        job.stages_completed.append(stage_name)
        job.partial_results[stage_name] = result
        event = {
            "stage": stage_name,
            "name": STAGE_NAMES.get(stage_name, stage_name),
            "result": result,
        }
        job.queue.put_nowait(("stage_complete", event))

    try:
        if provider == "openai":
            client = AsyncOpenAI(api_key=api_key)
        else:
            client = AsyncAnthropic(api_key=api_key)
        result = await run_pipeline(
            client,
            job.source_text,
            provider=provider,
            on_stage_complete=on_stage_complete,
        )
        # Inject metadata from decomposition + job context
        decomp = result.get("decomposition", {})
        result["metadata"] = {
            "workflow": provider,
            "estimated_cost": result.get("estimated_cost"),
            "essay_title": decomp.get("essay_title"),
            "essay_author": decomp.get("essay_author"),
            "essay_source": decomp.get("essay_source"),
            "source_url": job.source_url,
            "input_mode": job.input_mode,
        }
        # Generate short shareable ID and save result
        analysis_id = secrets.token_urlsafe(6)  # 8-char URL-safe string
        result["analysis_id"] = analysis_id

        job.final_result = result
        job.status = JobStatus.COMPLETED
        job.queue.put_nowait(
            ("done", {"job_id": job.id, "analysis_id": analysis_id, "result": result})
        )

        # Save result to disk
        results_dir = Path(__file__).resolve().parent.parent / "results"
        results_dir.mkdir(exist_ok=True)
        result_path = results_dir / f"{analysis_id}.json"
        result_path.write_text(json.dumps(result, indent=2))
        logger.info("Saved result to %s (analysis_id=%s)", result_path, analysis_id)

        if job.email:
            await send_results_email(job.email, analysis_id, base_url)

    except Exception as exc:
        logger.exception("Pipeline failed for job %s", job_id)
        job.status = JobStatus.FAILED
        job.error = str(exc)
        # Try to figure out which stage failed based on what completed
        completed = set(job.stages_completed)
        stage_order = ["decomposition", "stage2", "dedup", "synthesis"]
        failed_stage = None
        for s in stage_order:
            if s not in completed:
                failed_stage = s
                break
        job.error_stage = failed_stage
        job.queue.put_nowait(("error", {"message": str(exc), "stage": failed_stage}))
    finally:
        # Signal end-of-stream
        job.queue.put_nowait(None)


# --- Routes ---


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analyze")
@limiter.limit("10/minute")
async def analyze(
    request: Request,
    text: str | None = Form(None),
    url: str | None = Form(None),
    email: str | None = Form(None),
    file: UploadFile | None = File(None),
    x_api_key: str | None = Header(None),
    x_provider: str | None = Header(None),
) -> dict[str, str]:
    """Submit text for analysis. Accepts JSON body or multipart form (for PDF upload)."""
    api_key = x_api_key
    provider = (x_provider or "anthropic").strip().lower()
    if provider not in {"anthropic", "openai"}:
        raise HTTPException(status_code=400, detail="X-Provider must be one of: anthropic, openai")

    body: dict = {}
    if text is None and url is None and file is None:
        try:
            body = await request.json()
            email = email or body.get("email")
        except Exception:
            pass

    if not api_key:
        raise HTTPException(status_code=401, detail="X-Api-Key header is required")

    if email and not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Invalid email address format")

    source_text, input_mode, source_url = await _resolve_source_text(text, url, file, body)

    # Create job and spawn background task
    job = store.create(
        source_text=source_text,
        email=email,
        source_url=source_url,
        input_mode=input_mode,
    )
    base_url = os.getenv("BASE_URL", str(request.base_url).rstrip("/"))
    asyncio.create_task(_run_job(job.id, api_key, base_url, provider))

    return {
        "job_id": job.id,
        "stream_url": f"/jobs/{job.id}/stream",
    }


@app.get("/jobs/{job_id}/stream")
async def stream_job(job_id: str) -> EventSourceResponse:
    """SSE stream of pipeline progress events."""
    job = store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    async def event_generator() -> AsyncGenerator[dict, None]:
        while True:
            msg = await job.queue.get()
            if msg is None:
                # End of stream
                break
            event_type, data = msg
            yield {"event": event_type, "data": json.dumps(data)}

    return EventSourceResponse(event_generator())


@app.get("/jobs/{job_id}")
async def get_job(job_id: str) -> dict:
    """Poll for current job state."""
    job = store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job.to_dict()


@app.get("/results/{analysis_id}")
async def get_result(analysis_id: str) -> JSONResponse:
    """Fetch a saved analysis result by its short ID."""
    # Validate ID format to prevent path traversal
    if not re.match(r"^[A-Za-z0-9_-]{6,12}$", analysis_id):
        raise HTTPException(status_code=400, detail="Invalid analysis ID format")

    results_dir = Path(__file__).resolve().parent.parent / "results"
    result_path = results_dir / f"{analysis_id}.json"

    if not result_path.is_file():
        raise HTTPException(status_code=404, detail="Analysis not found")

    data = json.loads(result_path.read_text())
    return JSONResponse(content=data)
