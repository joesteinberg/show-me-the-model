"""In-memory job store with per-job asyncio.Queue for SSE streaming."""

import asyncio
import time
import uuid
import logging
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

logger = logging.getLogger(__name__)

JOB_TTL_SECONDS = 24 * 60 * 60  # 24 hours


class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class Job:
    id: str
    status: JobStatus
    source_text: str
    created_at: float
    email: str | None = None
    stages_completed: list[str] = field(default_factory=list)
    partial_results: dict[str, Any] = field(default_factory=dict)
    final_result: dict | None = None
    error: str | None = None
    error_stage: str | None = None
    queue: asyncio.Queue = field(default_factory=asyncio.Queue)

    def to_dict(self) -> dict:
        """Serialize job state for JSON response (excludes queue)."""
        d = {
            "job_id": self.id,
            "status": self.status.value,
            "stages_completed": self.stages_completed,
            "created_at": self.created_at,
        }
        if self.final_result is not None:
            d["result"] = self.final_result
        if self.error is not None:
            d["error"] = self.error
            if self.error_stage:
                d["error_stage"] = self.error_stage
        if self.partial_results:
            d["partial_results"] = self.partial_results
        return d


class JobStore:
    """Thread-safe in-memory job store."""

    def __init__(self):
        self._jobs: dict[str, Job] = {}

    def create(self, source_text: str, email: str | None = None) -> Job:
        job_id = uuid.uuid4().hex[:12]
        job = Job(
            id=job_id,
            status=JobStatus.PENDING,
            source_text=source_text,
            created_at=time.time(),
            email=email,
        )
        self._jobs[job_id] = job
        return job

    def get(self, job_id: str) -> Job | None:
        return self._jobs.get(job_id)

    def cleanup_expired(self):
        """Remove jobs older than TTL."""
        now = time.time()
        expired = [
            jid
            for jid, job in self._jobs.items()
            if now - job.created_at > JOB_TTL_SECONDS
        ]
        for jid in expired:
            del self._jobs[jid]
        if expired:
            logger.info("Cleaned up %d expired jobs", len(expired))
