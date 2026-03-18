# Prompts

This directory contains the YAML prompt files that drive the multi-stage analysis pipeline, plus shared building blocks in `shared/`.

---

## YAML file structure

Every prompt file is a YAML document with the following top-level fields:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Human-readable name for this pass (e.g. `"Decomposition"`). |
| `version` | string | Prompt version string. Increment when you change the prompt in a semantically meaningful way. |
| `stage` | number | Which pipeline stage this file belongs to (`1`, `2`, `2.5`, or `3`). |
| `model` | string | The model to use for this call (e.g. `"claude-sonnet-4-6"`, `"claude-opus-4-6"`). |
| `temperature` | float | Sampling temperature. Lower values (0.1) produce more deterministic output; higher values (0.3–0.4) allow more varied prose. |
| `max_tokens` | int | Maximum completion length. If the model hits this limit the response will be truncated; the pipeline has a best-effort JSON repair step but large outputs should use a generous limit. |
| `system_prompt` | string | The system message. May contain `{{ shared_variable }}` placeholders that are resolved at load time (before the API call). |
| `user_prompt_template` | string | The user message. May contain `{{ runtime_variable }}` placeholders that are resolved at call time. |

---

## How shared variables work

The `{{ variable_name }}` syntax is resolved by `backend/prompt_loader.py` in two passes.

**Pass 1 — shared resolution (load time).** When `load_prompt()` is called, it reads every `*.yaml` file in `prompts/shared/` and builds a lookup table of all string-valued fields. It then substitutes those values into `system_prompt`. This is how `{{ persona }}` and `{{ tone_guidelines }}` get resolved — both are defined in `prompts/shared/persona.yaml`.

Field-specific example blocks (e.g. `{{ identities_examples }}`) are loaded separately from `prompts/shared/examples/<field>.yaml` by `load_field_examples(field)` in `pipeline.py`, and passed as runtime variables.

**Pass 2 — runtime resolution (call time).** When `render_prompt()` is called with keyword arguments, the remaining placeholders in both `system_prompt` and `user_prompt_template` are substituted with the supplied values. Any placeholder that is not resolved in either pass is left unchanged in the string.

Unrecognised placeholders do **not** raise an error; they are silently left as `{{ name }}` in the rendered output.

---

## Shared files

| File | Provides |
|------|----------|
| `shared/persona.yaml` | `{{ persona }}` — the economist persona injected into every system prompt; `{{ tone_guidelines }}` — style rules (no em-dashes, no "equilibrium", conciseness, etc.). |
| `shared/taxonomy.yaml` | The controlled vocabulary of issue type tags (e.g. `IDENTITY_VIOLATION`, `PARTIAL_EQUILIBRIUM`, `EXOG_ENDO_CONFUSION`). This file is documentation for prompt authors; it is not directly injected by the template system. |
| `shared/examples/<field>.yaml` | Field-specific few-shot example annotations for each Stage 2 pass. Keys match the template variables used in Stage 2 prompts (e.g. `identities_examples`, `general_eq_examples`). The field is determined by the Stage 1 `field` classification (`macro_fiscal`, `trade`, `micro_io`, `finance`, `labor`). Defaults to `macro_fiscal` if the field is unknown. |

---

## Runtime template variables

These are the variables passed to `render_prompt()` at call time. Which variables are available depends on the stage.

| Variable | Type | Available in | Description |
|----------|------|--------------|-------------|
| `source_text` | string | Stage 1, Stage 2, Stage 3 | The raw source text being analyzed. |
| `decomposition` | string (JSON) | Stage 2, Stage 2.5 | The JSON output of Stage 1, serialised as a formatted string. |
| `identities_output` | string (JSON) | Stage 2.5 | Output of the `stage2_identities` pass. |
| `general_eq_output` | string (JSON) | Stage 2.5 | Output of the `stage2_general_eq` pass. |
| `exog_endog_output` | string (JSON) | Stage 2.5 | Output of the `stage2_exog_endog` pass. |
| `quantitative_output` | string (JSON) | Stage 2.5 | Output of the `stage2_quantitative` pass. |
| `consistency_output` | string (JSON) | Stage 2.5 | Output of the `stage2_consistency` pass. |
| `steelman_output` | string (JSON) | Stage 2.5 | Output of the `stage2_steelman` pass. |
| `merged_annotations` | string (JSON) | Stage 3 | The JSON output of Stage 2.5, serialised as a formatted string. |
| `identities_examples` | string | Stage 2 identities pass | Field-specific few-shot examples, loaded by `load_field_examples()`. |
| `general_eq_examples` | string | Stage 2 general-eq pass | Same, for the general-equilibrium pass. |
| *(other `*_examples`)* | string | Stage 2 passes | Each pass has a corresponding examples key in the field YAML. |

---

## Stage files

| File | Stage | Model | Focus |
|------|-------|-------|-------|
| `stage1_decomposition.yaml` | 1 | claude-sonnet-4-6 | Extracts the structural skeleton of the argument: `essay_title`, `central_thesis`, `key_claims` (with `claim_id`, `quoted_passage`, `role_in_argument`), `causal_chain`, `policy_or_shock`, `text_chunks`, and field classification. |
| `stage2_identities.yaml` | 2 | claude-sonnet-4-6 | Checks whether the argument respects macroeconomic accounting identities (GDP identity, balance of payments, saving-investment identity) and microeconomic adding-up conditions (profit arithmetic, market-share constraints, zero-profit logic). |
| `stage2_general_eq.yaml` | 2 | claude-sonnet-4-6 | Checks for partial-equilibrium reasoning — places where the author holds other markets or prices fixed when the shock is large enough that they would adjust. |
| `stage2_exog_endog.yaml` | 2 | claude-sonnet-4-6 | Checks whether variables the author treats as exogenous assumptions are actually endogenous outcomes that should be derived from primitives. |
| `stage2_quantitative.yaml` | 2 | claude-sonnet-4-6 | Checks whether the implied magnitudes, elasticities, or multipliers are quantitatively plausible given known empirical estimates. |
| `stage2_consistency.yaml` | 2 | claude-sonnet-4-6 | Checks whether the argument's own assumptions contradict its conclusions — internal contradictions in the causal logic. |
| `stage2_steelman.yaml` | 2 | claude-sonnet-4-6 | Identifies the essay's genuine strengths: legitimate concerns, conditionally sound arguments, underappreciated insights. Produces a `strengths` array rather than an `annotations` array. |
| `stage2_5_dedup.yaml` | 2.5 | claude-sonnet-4-6 | Merges overlapping annotations from the six Stage 2 passes into a clean, numbered set. Orders by severity. Passes steelman strengths through unchanged. |
| `stage3_synthesis.yaml` | 3 | claude-opus-4-6 | Produces the final Synthesis Report: `central_claim_summary`, `key_assumptions` inventory, `internal_consistency` contradictions, `what_the_essay_gets_right`, `rigorous_alternative`, and `bottom_line`. |

---

## How to modify an existing prompt

1. Edit the relevant YAML file.
2. Run the eval suite on the affected benchmark to check that output quality is maintained or improved:
   ```
   python -m eval.eval_runner --source citrini --stage 3
   ```
3. Compare the new output in `eval/outputs/citrini/<timestamp>/` against the gold standard in `eval/gold-standard/citrini.md`.
4. Open a PR. The PR description should note which stage was changed, why, and what improvement is expected.

---

## How to add a new analysis pass

A new Stage 2 pass requires changes in two places.

**1. Create a prompt file.**

Create `prompts/stage2_<name>.yaml` following the structure of an existing Stage 2 file. Your `user_prompt_template` should include `{{ source_text }}` and `{{ decomposition }}`. Include `{{ <name>_examples }}` if you want field-specific few-shot examples (add the corresponding key to each file in `prompts/shared/examples/`).

Your `system_prompt` should specify:
- The analytical lens (what class of errors this pass looks for).
- The relevant issue type tags from `shared/taxonomy.yaml`.
- The output format: a JSON object with an `"annotations"` array where each annotation has `title`, `quoted_passage`, `issue_types`, `severity`, `claim_ids`, `chunk_indices`, `distinctive_angle`, `explanation`, and `dig_deeper`.

**2. Register it in `pipeline.py`.**

Add an entry to the `STAGE2_PASSES` list in `backend/pipeline.py`:

```python
STAGE2_PASSES = [
    ("stage2_identities.yaml", "identities"),
    ("stage2_general_eq.yaml", "general_eq"),
    # ... existing passes ...
    ("stage2_<name>.yaml", "<name>"),   # add your pass here
]
```

Add a corresponding keyword argument to the `load_and_render(...)` call in `run_stage2_5()`:

```python
prompt = load_and_render(
    "stage2_5_dedup.yaml",
    ...
    <name>_output=json.dumps(stage2_results["<name>"], indent=2),
)
```

And add the placeholder to the `user_prompt_template` in `stage2_5_dedup.yaml` so the dedup pass receives the new pass's output.
