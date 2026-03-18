# Contributing to Show Me the Model

Thank you for your interest in contributing. This document explains how to work with the codebase, keep changes consistent, and get your PR merged smoothly.

---

## Getting started

Follow the local dev setup in [README.md](./README.md) to get the backend and frontend running before making changes.

---

## Branch workflow

Always branch from `master`:

```bash
git checkout master
git pull origin master
git checkout -b <prefix>/<short-description>
```

Use one of the following prefixes:

| Prefix | When to use |
|--------|-------------|
| `feature/` | New functionality |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `prompt/` | Changes to prompts or prompt configs |

Examples: `feature/export-pdf`, `fix/sse-timeout`, `docs/eval-readme`, `prompt/tighten-synthesis`

---

## Commit messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) spirit with these rules:

- **Imperative mood, present tense**: "Add retry logic" not "Added retry logic"
- **Subject line**: max 72 characters, no trailing period
- **Blank line** between subject and body
- **Body**: explain *why*, not *what* (the diff shows what)

```
Add cost tracking to pipeline stage responses

Without per-stage cost data, it was impossible to know which prompt
stages were driving API spend. This threads token counts through
the SSE stream so the frontend can display a running cost total.
```

---

## Before opening a PR

Work through this checklist before requesting review:

- [ ] **Linting passes locally** — `ruff check backend/` and `cd frontend && npm run lint`
- [ ] **Type hints** on any new Python functions (parameters and return value)
- [ ] **Docs updated** if this changes any behavior, API surface, or prompt format
- [ ] **No secrets or API keys** in the diff — run `git diff` and check carefully
- [ ] **Prompt changes described** — if you touched `prompts/`, state which stage(s) changed and what the change is in the PR description
- [ ] **Tests pass** — `pytest backend/tests/` exits 0

---

## Code style

### Python

We use [ruff](https://docs.astral.sh/ruff/) for linting and formatting. Configuration lives in `pyproject.toml`.

```bash
# Check
ruff check backend/

# Auto-fix
ruff check --fix backend/

# Format
ruff format backend/
```

All new Python functions must include type hints:

```python
# Good
def extract_text(file_path: str) -> str:
    ...

# Bad
def extract_text(file_path, return_raw=False):
    ...
```

### JavaScript / JSX

The frontend uses ESLint and Prettier. Configs live at the repo root.

```bash
cd frontend
npm run lint       # ESLint
npm run format     # Prettier
```

---

## Working with prompts

All prompt templates live in [`prompts/`](./prompts/). See [`prompts/README.md`](./prompts/README.md) for how stages are structured, how variables are interpolated, and how to add a new stage.

**Important:**

- **Eval testing required**: any change to a prompt file must be validated with the eval suite before merging. See [`eval/README.md`](./eval/README.md) for how to run it. Include eval results (score before vs. after) in the PR description.
- **CODEOWNERS**: `prompts/` is owned by @joesteinberg. PRs touching those files will automatically request his review.

---

## Testing

### Backend unit tests

```bash
pytest backend/tests/
```

### Eval suite

The eval suite runs the full pipeline against gold-standard inputs and scores outputs:

```bash
python -m eval.eval_runner
```

Results are written to `eval/results/`. Include a before/after summary in your PR description when prompts change.

---

## PR review process

- A maintainer will review your PR within a few days. If it has been more than a week with no activity, leave a comment to ping.
- Respond to review feedback by **pushing new commits** — never force-push a PR branch. Force-pushing rewrites history and makes it harder to track what changed between review rounds.
- If a requested change is out of scope, say so in a comment rather than silently ignoring it.
- Once approved, a maintainer will merge.

---

## What makes a good PR

The easier a PR is to review, the faster it gets merged.

- **Small and focused**: one concern per PR. Split unrelated changes into separate PRs.
- **Clear description**: explain what changed, why, and any tradeoffs or alternatives considered.
- **Link to an issue** if one exists: "Closes #42" in the PR body will auto-close it on merge.
- **No drive-by changes**: resist fixing unrelated style issues in the same diff — open a separate `fix/` or `docs/` PR for those.
- **Tests and docs included**: a PR that adds a feature but omits tests or docs will be asked to add them before merging.
