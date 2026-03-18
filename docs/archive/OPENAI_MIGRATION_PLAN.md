# OpenAI Migration Plan (Sonnet+Opus Pipeline → GPT-5 Family)

## Goal
Migrate the existing Anthropic-based multi-stage pipeline to an OpenAI-based architecture that preserves analysis quality while improving cost/latency control:

- **Specialist passes:** `gpt-5-mini`
- **Synthesis:** `gpt-5.2`
- **Escalation-only fallback:** `gpt-5.2-pro`
- **Long-context preprocessing (optional):** `gpt-4.1-mini` / `gpt-4.1`

This plan is tailored to the current codebase structure (`backend/pipeline.py`, YAML prompts, eval harness, FastAPI job orchestration).

---

## Current State (Repo Scan)

### Pipeline topology today
- Stage 1 decomposition, Stage 2 parallel specialist passes, Stage 2.5 dedup merge, Stage 3 synthesis are already implemented and orchestrated asynchronously in `backend/pipeline.py`.
- Anthropic integration is currently hardcoded via `AsyncAnthropic` and `_call_claude(...)` in both runtime pipeline and eval runner.
- Prompt/model settings live in YAML prompt files and are loaded by `backend/prompt_loader.py`.

### Why this makes migration straightforward
- The stage boundaries and structured JSON outputs are already explicit.
- Model selection is mostly data-driven (per-YAML `model` field), so moving model routing into config is natural.
- Eval harness (`eval/eval_runner.py`) can be reused with provider abstraction and minimal flow changes.

---

## Target Architecture

## 1) Add a provider-agnostic LLM client layer
Create a thin backend abstraction so the pipeline logic is not tied to Anthropic SDK objects.

### New module
- `backend/llm_client.py`

### Proposed interface
- `class LLMClient(Protocol)` with one async method like:
  - `generate_json(stage_name, model, system_prompt, user_prompt, temperature, max_tokens, response_schema=None, reasoning_effort=None, verbosity=None) -> dict`
- Concrete implementations:
  - `AnthropicClientAdapter` (compatibility / rollback)
  - `OpenAIResponsesAdapter` (default target)

### Why
- Enables phased migration and A/B eval without branching pipeline code.
- Keeps future model/provider changes localized.

---

## 2) Move Stage execution to schema-first Structured Outputs
The current pipeline asks for JSON and then repairs malformed JSON. With OpenAI Responses + Structured Outputs, move to schema-validated responses per stage.

### New assets
- `prompts/schemas/stage1_decomposition.schema.json`
- `prompts/schemas/stage2_annotations.schema.json`
- `prompts/schemas/stage2_5_dedup.schema.json`
- `prompts/schemas/stage3_synthesis.schema.json`

### Pipeline changes
- Replace `_call_claude` + `_extract_json` retry-repair loop with:
  1. send schema with each call,
  2. parse strict JSON output,
  3. validate against schema (server-side guardrail).

### Benefit
- Fewer malformed output retries.
- Cleaner failure modes (schema mismatch vs parse exception).
- Better determinism for downstream UI rendering.

---

## 3) Introduce model routing policy (not hardcoded in prompt YAML)
Keep prompts for content; move model selection and per-stage runtime knobs into environment-aware config.

### New module/config
- `backend/model_policy.py`
- Optional YAML/JSON config: `backend/model_policy.yaml`

### Suggested policy fields
- per-stage default model (`stage1`, `stage2_*`, `stage2_5`, `stage3`)
- `reasoning_effort` (low/medium/high)
- `verbosity` (low/medium/high)
- escalation thresholds
- max retries/timeouts

### Initial mapping
- Stage 1 decomposition: `gpt-5-mini`
- Stage 2 passes: `gpt-5-mini`
- Stage 2.5 dedup: `gpt-5-mini` (or `gpt-5.2` if quality requires)
- Stage 3 synthesis: `gpt-5.2`
- Escalation rerun: `gpt-5.2-pro` only when policy triggers

### Why
- Decouples prompt iteration from cost/performance routing.
- Supports rapid tuning without editing every prompt file.

---

## 4) Add disagreement/quality gating before Pro escalation
Implement explicit escalation logic instead of always using a top-tier model.

### New module
- `backend/escalation.py`

### Suggested triggers
- Stage 2 pass disagreement score above threshold (e.g., conflicting severity/top claims).
- Stage 3 confidence flag below threshold (add confidence rubric to synthesis schema).
- Hard parse/schema failures on synthesis after bounded retries.

### Behavior
- First run synthesis on `gpt-5.2`.
- Only rerun synthesis on `gpt-5.2-pro` if trigger conditions met.
- Persist both outputs + escalation metadata for auditability.

---

## 5) Add long-context preprocessor path (optional, but planned)
For essays above a token threshold, add an extraction/distillation stage before the existing stage flow.

### New module
- `backend/long_context.py`

### Flow
1. Estimate token count for source text.
2. If above threshold (configurable), run extraction on `gpt-4.1-mini` / `gpt-4.1`:
   - claims
   - evidence quotes
   - chunk summaries
   - argument map
3. Feed distilled artifact into Stage 1–3 prompts instead of full text.

### Why
- Keeps flagship reasoning stages inside context limits.
- Preserves quality on very large documents without forcing expensive models everywhere.

---

## 6) Preserve UX/API contract while expanding provider inputs
Current frontend posts `X-Api-Key`; backend assumes Anthropic semantics.

### Backend API adjustments
- Keep `X-Api-Key` for BYOK compatibility.
- Add optional `X-Provider` header (default `openai`) for controlled fallback.
- Update validation and error messaging for provider-specific failures.

### Frontend changes (minimal)
- `frontend/src/api.js`: optionally include provider selection in headers/body.
- Optionally add provider dropdown only for internal/testing mode.

---

## 7) Update prompts for OpenAI reasoning controls
Keep prompt content largely intact, but add concise instructions that reduce verbosity and unnecessary chain-of-thought-like expansion.

### Prompt edits
- Keep existing specialist lens instructions.
- Tighten output length and citation expectations in each stage prompt.
- Add explicit direction to avoid unnecessary prose in JSON fields.

### Runtime controls via policy
- lower reasoning effort for Stage 2 mini calls.
- moderate/higher effort for Stage 3 synthesis.

---

## 8) Eval and regression plan before switching defaults
Use current gold-standard eval assets to compare Anthropic baseline vs OpenAI candidate configs.

### Eval upgrades
- Extend `eval/eval_runner.py` with provider/model-policy flags:
  - `--provider anthropic|openai`
  - `--policy <name>`
  - `--escalation on|off`
- Save per-stage metadata:
  - model used
  - latency
  - estimated token usage
  - cost estimate

### Metrics to track
- Annotation precision/recall against gold standards (qualitative + simple overlap stats).
- Synthesis quality rubric (coverage, consistency, pedagogy, actionable clarity).
- Cost per essay and p95 latency.

### Acceptance thresholds (first pass)
- No regression on critical-issue detection vs baseline.
- ≥30% lower blended cost per essay in default mode.
- Comparable or better end-to-end latency.

---

## 9) Rollout strategy

### Phase A — plumbing (no behavior change)
1. Add provider abstraction + OpenAI adapter behind feature flag.
2. Keep Anthropic as default.
3. Add stage schemas and validation in non-strict logging mode.

### Phase B — shadow eval
1. Run eval suite on all gold texts with Anthropic baseline and OpenAI candidate.
2. Compare outputs and tune prompts/policy.

### Phase C — controlled production switch
1. Default provider to OpenAI for internal users.
2. Keep Anthropic fallback route for incident rollback.
3. Monitor quality/cost/latency dashboards.

### Phase D — optimization
1. Enable escalation path.
2. Enable long-context preprocessing for oversized documents.
3. Trim retries and reasoning settings for cost efficiency.

---

## 10) Concrete file-level implementation checklist

### Backend core
- [ ] `backend/llm_client.py` (provider abstraction + adapters)
- [ ] `backend/pipeline.py` (switch to provider-agnostic calls, schema-based outputs)
- [ ] `backend/main.py` (provider selection wiring)
- [ ] `backend/model_policy.py` (stage routing and reasoning knobs)
- [ ] `backend/escalation.py` (disagreement/confidence triggers)
- [ ] `backend/long_context.py` (optional preprocessing route)

### Prompts and schemas
- [ ] Add `prompts/schemas/*.schema.json`
- [ ] Remove hardcoded `model` dependence in prompt YAML usage path (keep model field only as fallback)
- [ ] Update stage prompts for concise structured output under OpenAI models

### Eval tooling
- [ ] `eval/eval_runner.py` provider/policy CLI flags
- [ ] Add cost+latency metadata capture in eval outputs
- [ ] Add simple report script comparing baseline vs candidate runs

### Frontend / API integration
- [ ] `frontend/src/api.js` optional provider header support
- [ ] Optional internal UI control for provider/model policy selection

### Documentation
- [ ] Update setup docs for `OPENAI_API_KEY`
- [ ] Add migration/runbook with rollback steps

---

## 11) Risks and mitigations

- **Risk: output shape drift despite schema prompts.**
  - Mitigation: enforce strict schema validation and explicit retry strategy per stage.

- **Risk: overuse of expensive synthesis model settings.**
  - Mitigation: central policy caps + telemetry + escalation-only Pro path.

- **Risk: quality drop on nuanced economic synthesis.**
  - Mitigation: keep Stage 3 on `gpt-5.2`, use rubric-based eval gate before cutover.

- **Risk: long documents exceed practical context/cost bounds.**
  - Mitigation: long-context extraction tier and token-threshold routing.

---

## 12) Suggested first implementation sprint (5–7 working days)

1. Build `llm_client.py` + OpenAI adapter.
2. Refactor `pipeline.py` to use provider abstraction without changing stage semantics.
3. Add schema for Stage 1 + one Stage 2 pass + Stage 3; prove end-to-end on one eval text.
4. Add policy routing defaults (`gpt-5-mini` stage passes, `gpt-5.2` synthesis).
5. Extend eval runner for provider switch and basic cost telemetry.
6. Run baseline/candidate on `citrini` and compare outputs.

If this sprint is successful, proceed to full schema coverage, escalation logic, and long-context path.
