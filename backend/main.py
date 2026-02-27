"""FastAPI backend for Show Me the Model."""

import asyncio
import json
import logging
import os
from pathlib import Path

from anthropic import AsyncAnthropic
from fastapi import FastAPI, Header, HTTPException, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sse_starlette.sse import EventSourceResponse

from backend.jobs import JobStore, JobStatus
from backend.pipeline import run_pipeline
from backend.text_extract import extract_from_url, extract_from_pdf, validate_text
from backend.email_notify import send_results_email

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Show Me the Model", version="0.1.0")

# CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

store = JobStore()

# Stage metadata for SSE events
STAGE_NAMES = {
    "decomposition": "Decomposition",
    "stage2": "Analysis Passes",
    "dedup": "Dedup & Merge",
    "synthesis": "Synthesis",
}


# --- Cleanup task ---

async def _cleanup_loop():
    """Periodically remove expired jobs."""
    while True:
        await asyncio.sleep(3600)
        store.cleanup_expired()


@app.on_event("startup")
async def startup():
    asyncio.create_task(_cleanup_loop())


# --- Request models ---

class AnalyzeRequest(BaseModel):
    text: str | None = None
    url: str | None = None
    email: str | None = None


# --- Pipeline background task ---

async def _run_job(job_id: str, api_key: str, base_url: str):
    """Run the pipeline in the background, pushing events to the job's queue."""
    job = store.get(job_id)
    if not job:
        return

    job.status = JobStatus.RUNNING

    def on_stage_complete(stage_name: str, result):
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
        client = AsyncAnthropic(api_key=api_key)
        result = await run_pipeline(
            client, job.source_text, on_stage_complete=on_stage_complete
        )
        job.final_result = result
        job.status = JobStatus.COMPLETED
        job.queue.put_nowait(("done", {"job_id": job.id, "result": result}))

        # Save result to disk for offline iteration
        results_dir = Path(__file__).resolve().parent.parent / "results"
        results_dir.mkdir(exist_ok=True)
        result_path = results_dir / f"{job.id}.json"
        result_path.write_text(json.dumps(result, indent=2))
        logger.info("Saved result to %s", result_path)

        if job.email:
            await send_results_email(job.email, job.id, base_url)

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
        job.queue.put_nowait(
            ("error", {"message": str(exc), "stage": failed_stage})
        )
    finally:
        # Signal end-of-stream
        job.queue.put_nowait(None)


# --- Routes ---

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze(
    request: Request,
    text: str | None = Form(None),
    url: str | None = Form(None),
    email: str | None = Form(None),
    file: UploadFile | None = File(None),
    x_api_key: str | None = Header(None),
):
    """Submit text for analysis. Accepts JSON body or multipart form (for PDF upload)."""
    api_key = x_api_key

    # If no form fields were provided, try parsing as JSON body
    if text is None and url is None and file is None:
        try:
            body = await request.json()
            text = body.get("text")
            url = body.get("url")
            email = body.get("email")
        except Exception:
            pass

    if not api_key:
        raise HTTPException(status_code=401, detail="X-Api-Key header is required")

    # Validate exactly one input source
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

    # Extract text from the input source
    try:
        if text:
            source_text = validate_text(text)
        elif url:
            source_text = await extract_from_url(url)
        else:
            pdf_bytes = await file.read()
            source_text = await extract_from_pdf(pdf_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    # Create job and spawn background task
    job = store.create(source_text=source_text, email=email)
    base_url = str(request.base_url).rstrip("/")
    asyncio.create_task(_run_job(job.id, api_key, base_url))

    return {
        "job_id": job.id,
        "stream_url": f"/jobs/{job.id}/stream",
    }


@app.get("/jobs/{job_id}/stream")
async def stream_job(job_id: str):
    """SSE stream of pipeline progress events."""
    job = store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    async def event_generator():
        while True:
            msg = await job.queue.get()
            if msg is None:
                # End of stream
                break
            event_type, data = msg
            yield {"event": event_type, "data": json.dumps(data)}

    return EventSourceResponse(event_generator())


@app.get("/jobs/{job_id}")
async def get_job(job_id: str):
    """Poll for current job state."""
    job = store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job.to_dict()
