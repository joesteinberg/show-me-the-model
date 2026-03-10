#!/usr/bin/env python3
"""Migrate old result files to short-ID format and produce an index."""

import json
import secrets
import shutil
from pathlib import Path

RESULTS_DIR = Path(__file__).resolve().parent.parent / "results"
# Match old naming patterns: {uuid}-{provider}.json or other non-short-ID names
SHORT_ID_PATTERN = r"^[A-Za-z0-9_-]{8}$"  # what the new system produces


def is_new_format(stem: str) -> bool:
    """Return True if the filename already looks like a short ID."""
    import re
    return bool(re.match(SHORT_ID_PATTERN, stem))


def migrate():
    if not RESULTS_DIR.exists():
        print("No results directory found.")
        return

    files = sorted(RESULTS_DIR.glob("*.json"))
    old_files = [f for f in files if not is_new_format(f.stem)]

    if not old_files:
        print("No old-format result files to migrate.")
        return

    lines = []
    for old_path in old_files:
        short_id = secrets.token_urlsafe(6)
        new_path = RESULTS_DIR / f"{short_id}.json"

        # Inject analysis_id into the result JSON
        data = json.loads(old_path.read_text())
        data["analysis_id"] = short_id
        new_path.write_text(json.dumps(data, indent=2))

        # Remove the old file
        old_path.unlink()

        title = (data.get("metadata") or {}).get("essay_title") or "Untitled"
        line = f"{short_id}  {title}  (was {old_path.name})"
        lines.append(line)
        print(f"  {old_path.name} -> {new_path.name}")

    # Write index file
    index_path = RESULTS_DIR / "migrated_index.txt"
    header = "# Migrated analyses — use ID or URL to view\n#\n"
    header += "# ID        Title                                     Original filename\n"
    header += "# " + "-" * 70 + "\n"
    index_path.write_text(header + "\n".join(lines) + "\n")

    print(f"\nMigrated {len(lines)} file(s). Index written to {index_path}")


if __name__ == "__main__":
    migrate()
