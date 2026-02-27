# Show Me the Model — Session Handoff

## What we did this session (Feb 25, 2026)

Built the React frontend end-to-end:

- **Stack**: React 18 + Vite + Tailwind CSS v4 (separate dev server on :5173, proxies `/api` → backend on :8000)
- **State machine**: idle → running → done | error
- **SSE integration**: Real-time progress tracking through all 4 pipeline stages
- **Synthesis-first results layout**:
  - Bottom line (headline verdict, blue callout)
  - Central claim summary
  - Key assumptions table (stated/unstated badges, assessments)
  - What the essay gets right
  - Internal consistency analysis
  - Rigorous alternative
  - Annotations (expandable cards, sorted by severity: Critical=red, Moderate=amber, Minor=gray)
  - Strengths section with category badges
  - Decomposition (collapsible Stage 1 details)
- **Input form**: 3 tabs (paste text / URL / PDF upload), API key persisted in localStorage, optional email
- **Tested live**: Full pipeline run completed successfully through the frontend

Committed and pushed to `master` as `9141c92`.

## What to do next: Save results for layout iteration

**Problem**: Every layout tweak requires a fresh ~10 min pipeline run.

**Solution**: Save the combined result JSON to disk on job completion, and add a way to load saved results directly in the frontend.

### Steps

1. **Backend: save results to disk on completion**
   - In `_run_job()` in `backend/main.py`, after `job.final_result = result`, write the result dict to a JSON file
   - Save location: `results/{job_id}.json` or similar
   - The result dict has shape: `{ decomposition, stage2_results, merged_annotations, synthesis }`

2. **Frontend: add "Load saved result" option**
   - During dev, place a result JSON in `frontend/public/` (e.g. `sample-result.json`)
   - Add a dev-mode button or query param (e.g. `?demo=true`) that fetches `/sample-result.json` and skips straight to the `done` phase
   - This lets us iterate on ResultsView, SynthesisSection, AnnotationCard, etc. without running the pipeline

3. **Alternatively / additionally**: assemble a combined result from existing eval outputs
   - We already have `eval/outputs/pettis/20260225_113322/stage{1,2,2_5,3}.json`
   - A quick script or manual step to combine them into the `{ decomposition, stage2_results, merged_annotations, synthesis }` shape would give us immediate test data

### Existing eval output locations
```
eval/outputs/pettis/20260225_113322/   (latest Pettis run)
eval/outputs/citrini/20260224_210826/
eval/outputs/cass/20260224_213336/
```

## How to run

```bash
# Backend
cd /path/to/show-me-the-model
uvicorn backend.main:app --reload   # :8000

# Frontend
cd frontend
npm run dev                          # :5173

# Open http://localhost:5173
```
