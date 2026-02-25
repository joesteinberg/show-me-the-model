#!/usr/bin/env python3
"""
Eval runner: runs the analysis pipeline on source texts and saves all outputs.

Usage:
    # Run on all source texts:
    python -m eval.eval_runner

    # Run on a specific source text:
    python -m eval.eval_runner --source citrini

    # Run only up to a specific stage:
    python -m eval.eval_runner --source citrini --stage 1
    python -m eval.eval_runner --source citrini --stage 2
    python -m eval.eval_runner --source citrini --stage 2.5
    python -m eval.eval_runner --source citrini --stage 3

    # Resume from a previous partial run (loads saved intermediate outputs):
    python -m eval.eval_runner --source citrini --resume
"""

import argparse
import asyncio
import json
import logging
import os
import sys
import time
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from anthropic import AsyncAnthropic

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.pipeline import (
    run_stage1,
    run_stage2,
    run_stage2_5,
    run_stage3,
)

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

EVAL_DIR = Path(__file__).parent
SOURCE_DIR = EVAL_DIR / "source-texts"
OUTPUT_DIR = EVAL_DIR / "outputs"

SOURCES = ["citrini", "pettis", "cass"]


def load_source_text(name: str) -> str:
    path = SOURCE_DIR / f"{name}.txt"
    if not path.exists():
        raise FileNotFoundError(f"Source text not found: {path}")
    return path.read_text()


def get_run_dir(name: str) -> Path:
    """Create a timestamped output directory for this run."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    run_dir = OUTPUT_DIR / name / timestamp
    run_dir.mkdir(parents=True, exist_ok=True)
    return run_dir


def get_latest_run_dir(name: str) -> Path | None:
    """Find the most recent run directory for a source text."""
    source_dir = OUTPUT_DIR / name
    if not source_dir.exists():
        return None
    runs = sorted(source_dir.iterdir())
    return runs[-1] if runs else None


def save_output(run_dir: Path, stage: str, data: dict):
    """Save stage output as formatted JSON."""
    path = run_dir / f"{stage}.json"
    with open(path, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    logger.info(f"  Saved {path.name}")


def load_output(run_dir: Path, stage: str) -> dict | None:
    """Load a previously saved stage output."""
    path = run_dir / f"{stage}.json"
    if path.exists():
        with open(path) as f:
            return json.load(f)
    return None


async def run_eval(
    name: str,
    max_stage: float = 3,
    resume: bool = False,
):
    """Run the pipeline on a source text and save all outputs."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        logger.error("ANTHROPIC_API_KEY not set. Copy .env.example to .env and add your key.")
        sys.exit(1)

    client = AsyncAnthropic(api_key=api_key)
    source_text = load_source_text(name)

    # Resume from previous run or create new
    if resume:
        run_dir = get_latest_run_dir(name)
        if not run_dir:
            logger.warning(f"No previous run found for {name}, starting fresh.")
            run_dir = get_run_dir(name)
    else:
        run_dir = get_run_dir(name)

    logger.info(f"=== Eval: {name} ===")
    logger.info(f"Output dir: {run_dir}")
    logger.info(f"Source text: {len(source_text.split())} words")
    logger.info(f"Max stage: {max_stage}")

    total_start = time.time()

    # Stage 1
    decomposition = load_output(run_dir, "stage1") if resume else None
    if decomposition:
        logger.info("Stage 1: loaded from previous run")
    else:
        start = time.time()
        logger.info("Stage 1: Decomposition...")
        decomposition = await run_stage1(client, source_text)
        elapsed = time.time() - start
        logger.info(f"Stage 1: done ({elapsed:.1f}s)")
        save_output(run_dir, "stage1", decomposition)

    if max_stage < 2:
        logger.info(f"Stopping at stage {max_stage}")
        return run_dir

    # Stage 2
    stage2_results = load_output(run_dir, "stage2") if resume else None
    if stage2_results:
        logger.info("Stage 2: loaded from previous run")
    else:
        start = time.time()
        logger.info("Stage 2: Parallel analysis passes...")
        stage2_results = await run_stage2(client, source_text, decomposition)
        elapsed = time.time() - start
        logger.info(f"Stage 2: done ({elapsed:.1f}s) — {len(stage2_results)} passes")
        save_output(run_dir, "stage2", stage2_results)

    if max_stage < 2.5:
        logger.info(f"Stopping at stage {max_stage}")
        return run_dir

    # Stage 2.5
    merged = load_output(run_dir, "stage2_5") if resume else None
    if merged:
        logger.info("Stage 2.5: loaded from previous run")
    else:
        start = time.time()
        logger.info("Stage 2.5: Dedup & merge...")
        merged = await run_stage2_5(client, decomposition, stage2_results)
        elapsed = time.time() - start
        logger.info(f"Stage 2.5: done ({elapsed:.1f}s)")
        save_output(run_dir, "stage2_5", merged)

    if max_stage < 3:
        logger.info(f"Stopping at stage {max_stage}")
        return run_dir

    # Stage 3
    start = time.time()
    logger.info("Stage 3: Synthesis (Opus)...")
    synthesis = await run_stage3(client, source_text, decomposition, merged)
    elapsed = time.time() - start
    logger.info(f"Stage 3: done ({elapsed:.1f}s)")
    save_output(run_dir, "stage3", synthesis)

    total_elapsed = time.time() - total_start
    logger.info(f"=== Complete: {name} ({total_elapsed:.1f}s total) ===")

    return run_dir


def main():
    parser = argparse.ArgumentParser(description="Run eval pipeline on source texts")
    parser.add_argument(
        "--source",
        choices=SOURCES,
        help="Run on a specific source text (default: all)",
    )
    parser.add_argument(
        "--stage",
        type=float,
        default=3,
        choices=[1, 2, 2.5, 3],
        help="Run up to this stage (default: 3 = full pipeline)",
    )
    parser.add_argument(
        "--resume",
        action="store_true",
        help="Resume from the most recent partial run",
    )
    args = parser.parse_args()

    sources = [args.source] if args.source else SOURCES

    async def run_all():
        for name in sources:
            await run_eval(name, max_stage=args.stage, resume=args.resume)

    asyncio.run(run_all())


if __name__ == "__main__":
    main()
