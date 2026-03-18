# API Reference

The backend exposes a small HTTP API. Analysis is submitted via `POST /analyze`, which returns a job ID and a stream URL. Progress is delivered as Server-Sent Events over the stream URL.

---

## Endpoints

### `GET /health`

Returns `{"status": "ok"}` if the server is running.

---

### `POST /analyze`

Submit text for analysis. The pipeline runs as a background job.

**Request headers**

| Header | Required | Description |
|--------|----------|-------------|
| `X-Api-Key` | Yes | Your Anthropic or OpenAI API key. The key is used server-side and never stored. |
| `X-Provider` | No | `anthropic` (default) or `openai`. |

**Request body**

Accepts either a JSON body or a multipart form upload. Exactly one of the following input sources must be provided:

| Field | Type | Description |
|-------|------|-------------|
| `text` | string | Raw text to analyze. |
| `url` | string | URL of an article. The backend fetches and extracts the text. |
| `file` | file upload | A PDF file. The backend extracts the text from the PDF. |
| `email` | string | Optional. If provided, an email is sent when the analysis is complete. |

**Response**

```json
{
  "job_id": "abc123",
  "stream_url": "/jobs/abc123/stream"
}
```

---

### `GET /jobs/{job_id}/stream`

SSE stream of pipeline progress events. Connect to this URL immediately after receiving the `job_id` from `/analyze`.

The stream emits events until the pipeline completes or fails. See [SSE event schema](#sse-event-schema) below.

---

### `GET /jobs/{job_id}`

Poll for the current job state. Returns a JSON object with `status` (`pending`, `running`, `completed`, `failed`), `stages_completed` (list of stage names), and `final_result` (present when status is `completed`).

---

### `GET /results/{analysis_id}`

Fetch a saved analysis result by its short shareable ID (e.g. `GET /results/xK3m9A`). Returns the full result JSON. The `analysis_id` is included in the `done` SSE event and in the final result object.

---

## SSE event schema

Each SSE message has an `event` field (the event type) and a `data` field (a JSON string).

### `stage_complete`

Emitted when each pipeline stage finishes. There are four of these events per successful run, one for each stage: `decomposition`, `stage2`, `dedup`, `synthesis`.

```json
{
  "stage": "decomposition",
  "name": "Decomposition",
  "result": { ... }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `stage` | string | Internal stage key: `decomposition`, `stage2`, `dedup`, or `synthesis`. |
| `name` | string | Human-readable stage label: `"Decomposition"`, `"Analysis Passes"`, `"Dedup & Merge"`, or `"Synthesis"`. |
| `result` | object | The parsed JSON output of the stage. See [Result JSON schema](#result-json-schema) for the shape of each stage's output. |

### `done`

Emitted once when the entire pipeline completes successfully.

```json
{
  "job_id": "abc123",
  "analysis_id": "xK3m9A",
  "result": { ... }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `job_id` | string | The job ID originally returned by `/analyze`. |
| `analysis_id` | string | A short URL-safe ID (8 characters) that can be used to retrieve the result via `GET /results/{analysis_id}`. |
| `result` | object | The complete result object. See [Result JSON schema](#result-json-schema). |

### `error`

Emitted if the pipeline fails at any stage.

```json
{
  "message": "Error description",
  "stage": "decomposition"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | A description of the error. |
| `stage` | string or null | The stage at which the pipeline failed (`decomposition`, `stage2`, `dedup`, `synthesis`), or `null` if the stage could not be determined. |

---

## Result JSON schema

The complete result object (returned in the `done` event's `result` field and from `GET /results/{analysis_id}`) has the following top-level shape:

```json
{
  "workflow": "anthropic",
  "estimated_cost": 0.1234,
  "analysis_id": "xK3m9A",
  "metadata": { ... },
  "decomposition": { ... },
  "stage2_results": { ... },
  "merged_annotations": { ... },
  "synthesis": { ... }
}
```

### Top-level fields

| Field | Type | Description |
|-------|------|-------------|
| `workflow` | string | Provider used: `"anthropic"` or `"openai"`. |
| `estimated_cost` | float | Estimated API cost in USD, based on token counts and per-model pricing. |
| `analysis_id` | string | Short shareable ID for this result. |
| `metadata` | object | See below. |
| `decomposition` | object | Stage 1 output. |
| `stage2_results` | object | Stage 2 output (keyed by pass name). |
| `merged_annotations` | object | Stage 2.5 output. |
| `synthesis` | object | Stage 3 output. |

### `metadata`

```json
{
  "workflow": "anthropic",
  "estimated_cost": 0.1234,
  "essay_title": "Title or null",
  "essay_author": "Author or null",
  "essay_source": "Publication or null",
  "source_url": "https://... or null",
  "input_mode": "text | url | pdf"
}
```

### `decomposition`

The Stage 1 output. Key fields:

| Field | Type | Description |
|-------|------|-------------|
| `essay_title` | string or null | Title of the essay. |
| `essay_author` | string or null | Author(s). |
| `essay_source` | string or null | Publication or outlet. |
| `document_type` | string | One of: `article`, `thread`, `speech`, `report`, `policy_doc`, `interview`, `other`. |
| `field` | string | Primary economic field: `macro_fiscal`, `trade`, `micro_io`, `finance`, or `labor`. |
| `secondary_fields` | array of strings | Zero to two additional fields. |
| `central_thesis` | string | 1-2 sentence summary of the author's main argument. |
| `load_bearing_claim_ids` | array of strings | IDs of the 3-6 most important claims (e.g. `["C1", "C3"]`). |
| `key_claims` | array of objects | Each claim has `claim_id`, `claim`, `quoted_passage`, `supporting_chunk_indices`, and `role_in_argument` (`premise`, `mechanism`, `prediction`, `policy`, `evidence`). |
| `stated_assumptions` | array of strings | Assumptions the author explicitly acknowledges. |
| `causal_chain` | string | The author's causal logic as an A → B → C chain. |
| `policy_or_shock` | string | The exogenous driver the author treats as given. |
| `notable_ambiguities` | array of strings | Up to 3 interpretive ambiguities. |
| `text_chunks` | array of objects | Each chunk has `index` and `text` (a paragraph-sized excerpt of the original). |

### `stage2_results`

An object with one key per pass. Each key maps to the raw output of that pass.

| Key | Description |
|-----|-------------|
| `identities` | Accounting identities and adding-up conditions pass. Contains `{"annotations": [...]}`. |
| `general_eq` | General equilibrium / partial-equilibrium pass. Contains `{"annotations": [...]}`. |
| `exog_endog` | Exogenous vs. endogenous reasoning pass. Contains `{"annotations": [...]}`. |
| `quantitative` | Quantitative plausibility pass. Contains `{"annotations": [...]}`. |
| `consistency` | Internal consistency pass. Contains `{"annotations": [...]}`. |
| `steelman` | Steelman / strengths pass. Contains `{"strengths": [...]}` rather than `annotations`. |

Each annotation in the `identities`, `general_eq`, `exog_endog`, `quantitative`, and `consistency` passes has:

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Short descriptive title (5-10 words). |
| `quoted_passage` | string | Exact text from the source. |
| `issue_types` | array of strings | One or two tags from the taxonomy (e.g. `IDENTITY_VIOLATION`, `PARTIAL_EQUILIBRIUM`). |
| `severity` | string | `Critical`, `Moderate`, or `Minor`. |
| `claim_ids` | array of strings | Stage 1 claim IDs this annotation relates to. |
| `chunk_indices` | array of integers | Stage 1 chunk indices for the quoted passage. |
| `distinctive_angle` | string | One sentence on what this pass adds that another pass might miss. |
| `explanation` | string | 2-4 paragraph explanation for a lay reader. |
| `dig_deeper` | string or null | Optional technical treatment for readers with economics training. |

Each strength in the `steelman` pass has:

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Short descriptive title. |
| `quoted_passage` | string or null | Relevant passage. |
| `category` | string | One of: `legitimate_concern`, `conditionally_sound`, `institutional_accuracy`, `right_question`, `underappreciated_insight`. |
| `claim_ids` | array of strings | Relevant Stage 1 claim IDs. |
| `chunk_indices` | array of integers | Relevant chunk indices. |
| `explanation` | string | 2-4 paragraph explanation. |
| `conditionality` | string or null | Conditions under which the strength holds. |

### `merged_annotations`

The Stage 2.5 output. Contains merged and deduplicated annotations from all six Stage 2 passes.

| Field | Type | Description |
|-------|------|-------------|
| `annotations` | array | Merged annotations, ordered by severity (Critical first). |
| `strengths` | array | Steelman strengths, passed through unchanged from Stage 2. |
| `merge_log` | array of strings | Notes on what was merged and why, for debugging. |

Each merged annotation has all the fields of a Stage 2 annotation, plus:

| Field | Type | Description |
|-------|------|-------------|
| `number` | integer | Sequential annotation number (1, 2, 3, ...). Referenced by the synthesis. |
| `hint` | string | Single sentence (max 15 words) for tooltip display. |
| `dominant_issue` | string | One-sentence statement of the core error. |
| `source_passes` | array of strings | Which Stage 2 passes contributed to this merged annotation. |

### `synthesis`

The Stage 3 output.

| Field | Type | Description |
|-------|------|-------------|
| `central_claim_summary` | string | 1-2 sentence summary of what the author is arguing. |
| `key_assumptions` | array of objects | 6-12 assumptions the argument depends on (both stated and unstated). |
| `internal_consistency` | array of objects | Named contradictions between the essay's own claims. Empty array if none. |
| `what_the_essay_gets_right` | string | 2-4 paragraphs on the essay's genuine strengths. |
| `rigorous_alternative` | string | 3-5 paragraphs sketching how an economist would approach the same question. |
| `bottom_line` | string | 2-3 sentence summary of the overall assessment. |

Each `key_assumptions` entry has:

| Field | Type | Description |
|-------|------|-------------|
| `number` | integer | Sequential number. |
| `assumption` | string | The assumption. |
| `stated_or_unstated` | string | `Stated` or `Unstated`. |
| `plausibility` | string | `Weak`, `Contested`, `Mixed`, or `Reasonable`. |
| `critical` | boolean | `true` if the argument collapses when this assumption fails. |
| `assessment` | string | 1-2 sentences on plausibility. |
| `hinge` | string | The key condition or evidence that would most change this rating. |

Each `internal_consistency` entry has:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Concrete label stating the conflict (e.g. `"Saving Can't Rise While Asset Prices Fall"`). |
| `annotation_refs` | array of integers | Merged annotation numbers this contradiction relates to. |
| `hint` | string | Single sentence (max 15 words) for tooltip display. |
| `summary` | string | 2-4 sentences explaining the contradiction for a lay reader. |
