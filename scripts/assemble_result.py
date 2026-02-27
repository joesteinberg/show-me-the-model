#!/usr/bin/env python3
"""Assemble eval stage outputs into the combined result shape the frontend expects.

Usage:
    python scripts/assemble_result.py eval/outputs/pettis/20260225_113322

Writes to results/<essay>_<timestamp>.json and optionally copies to
frontend/public/sample-result.json for dev mode.
"""

import json
import sys
from pathlib import Path


def assemble(run_dir: Path) -> dict:
    stage1 = json.loads((run_dir / "stage1.json").read_text())
    stage2 = json.loads((run_dir / "stage2.json").read_text())
    stage2_5 = json.loads((run_dir / "stage2_5.json").read_text())
    stage3 = json.loads((run_dir / "stage3.json").read_text())

    return {
        "decomposition": stage1,
        "stage2_results": stage2,
        "merged_annotations": stage2_5,
        "synthesis": stage3,
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/assemble_result.py <run_dir>")
        sys.exit(1)

    run_dir = Path(sys.argv[1])
    if not run_dir.is_dir():
        print(f"Error: {run_dir} is not a directory")
        sys.exit(1)

    result = assemble(run_dir)

    # Save to results/
    project_root = Path(__file__).resolve().parent.parent
    results_dir = project_root / "results"
    results_dir.mkdir(exist_ok=True)

    # Name from directory structure: e.g. pettis_20260225_113322
    parts = run_dir.resolve().parts
    name = f"{parts[-2]}_{parts[-1]}"
    out_path = results_dir / f"{name}.json"
    out_path.write_text(json.dumps(result, indent=2))
    print(f"Wrote {out_path}")

    # Also copy to frontend/public for dev mode
    (project_root / "frontend" / "public").mkdir(exist_ok=True)
    sample_path = project_root / "frontend" / "public" / "sample-result.json"
    sample_path.write_text(json.dumps(result, indent=2))
    print(f"Wrote {sample_path}")


if __name__ == "__main__":
    main()
