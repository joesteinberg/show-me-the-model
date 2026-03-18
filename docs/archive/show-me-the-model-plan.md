# Show Me the Model — Project Plan

## 1. Product Vision

**One-liner:** A web app that applies rigorous economic reasoning to popular writing, making implicit assumptions explicit and surfacing logical flaws in a way that's academically sound but accessible to a lay audience.

**Target audience (v1):** Journalists, policy analysts, educated laypeople — people who encounter economic arguments in Substack posts, op-eds, and policy proposals but lack the training to evaluate them rigorously.

**North star for tone:** A patient professor who teaches you *why* the reasoning is wrong, not just *that* it's wrong. Your economist colleagues should nod along; the journalist reading it should learn something.

---

## 2. Output Design

The output combines two complementary views, drawing on the Refine.ink model but going beyond it.

### View 1: Annotated Text (passage-level)

Inspired by Refine's two-pane layout. The original text appears on the left; on the right, specific passages are flagged with annotations. Each annotation includes:

- **The quoted passage** from the original text
- **Issue type** — a tag from a controlled vocabulary (see Section 4 below)
- **Severity** — Critical / Moderate / Minor
- **Explanation** — 2–4 paragraphs written for a lay reader: what's wrong, *why* it matters, and what a more careful treatment would look like. No citations to academic literature in the main text (the audience can't access it), but the tool can reference well-known results by name (e.g., "standard trade theory tells us..." or "this is an example of what economists call the *composition fallacy*").
- **"Dig Deeper" expandable footnotes** (optional) — For annotations that involve technical nuance beyond the lay explanation, a collapsible section provides a more rigorous treatment. For example, the lay explanation might say "whether cheaper AI reduces the labor share depends on how substitutable AI and labor are," while the Dig Deeper section walks through the Cobb-Douglas invariance result and the role of the elasticity of substitution being above or below one. This serves the dual audience: journalists see the accessible explanation by default; economists and grad students can expand the technical detail.

### View 2: Synthesis Report (document-level)

This is where the tool goes beyond Refine. After the passage-level annotations, a separate section works through the *overarching* implications of the issues identified:

- **Central claim summary** — What is the author arguing? (1–2 sentences)
- **Key assumptions inventory** — A numbered list of the critical assumptions (stated and unstated) the argument depends on. For each: is it plausible? What does the evidence say?
- **Internal consistency check** — Do the assumptions and conclusions hang together? This is where national-accounting-identity violations, sign errors in general equilibrium, etc., get synthesized into a coherent narrative.
- **What a rigorous version would look like** — A brief sketch of how an economist would approach the same question: What model would you write down? What are the key parameters? What would the conclusions depend on? This is the most pedagogically valuable section — it shows the reader what good economic reasoning looks like by contrast.
- **Bottom line** — A 2–3 sentence verdict. Not "this is wrong" but "this conclusion depends on assumptions X and Y, which are [implausible / internally contradictory / partial-equilibrium only]. A more complete analysis would likely find Z."

---

## 3. AI Architecture: Multi-Stage Pipeline

A single monolithic prompt won't work well here. The analysis requires different types of economic reasoning, and the synthesis needs to draw on all of them. I recommend a **three-stage pipeline** with parallelized analysis passes.

### Stage 1: Decomposition (1 API call)

**Input:** Raw text of the article/essay.

**Output (structured JSON):**
- `central_thesis`: 1–2 sentence summary of the main argument
- `key_claims`: Array of specific claims with their location in the text
- `stated_assumptions`: Assumptions the author makes explicitly
- `causal_chain`: The author's implicit causal logic (A → B → C → conclusion)
- `policy_or_shock`: What is the exogenous driver? (if identifiable)
- `text_chunks`: The full text broken into ~paragraph-sized chunks with indices (for annotation anchoring)

**Model:** Claude Sonnet (fast, structured extraction task).

### Stage 2: Parallel Analysis (3–5 API calls, run concurrently)

Each analysis pass gets the full text *plus* the Stage 1 decomposition, and returns structured annotations. These run in parallel to minimize latency.

| Pass | Focus | Key questions |
|------|-------|---------------|
| **Accounting Identities** | National income identities, budget constraints, balance of payments | Does GDP = C + I + G + NX hold? Are stock-flow relationships respected? If consumption falls, what adjusts to allow GDP to rise? |
| **General Equilibrium** | PE vs. GE reasoning, missing feedback loops | Does the author hold constant things that would change in equilibrium? Are relative prices allowed to adjust? Are there missing markets or missing agents? |
| **Exogenous vs. Endogenous** | Causal identification | What is the author treating as a given that is actually an equilibrium outcome? Are they assuming a result (e.g., labor share falls) rather than deriving it from primitives (e.g., a change in the elasticity of substitution)? |
| **Quantitative Plausibility** | Magnitudes, elasticities, empirical grounding | Are the implied magnitudes reasonable? Do the numbers pass a smell test? Are there well-known empirical estimates that contradict the claims? |
| **Internal Consistency** | Logic, contradictions | Do the stated assumptions lead to the stated conclusions? Are there hidden contradictions? Does the argument's own logic undermine its conclusions? |

**Model:** Claude Sonnet for each pass. Each returns a JSON array of annotations, each tied to a specific text chunk from Stage 1.

### Stage 3: Synthesis (1 API call)

**Input:** The Stage 1 decomposition + all Stage 2 annotations.

**Output:** The Synthesis Report (Section 2, View 2 above), written in accessible prose. This is the most important call — it needs to weave the individual findings into a coherent narrative.

**Model:** Claude Opus. This is the call where reasoning quality matters most, and it's only one call, so the cost is manageable.

### Latency & Cost Estimates

Assuming a ~5,000-word input article:

| Stage | Calls | Model | Est. latency | Est. cost (input + output) |
|-------|-------|-------|-------------|---------------------------|
| Decomposition | 1 | Sonnet | ~5s | ~$0.02 |
| Analysis passes | 5 (parallel) | Sonnet | ~10s | ~$0.15 |
| Synthesis | 1 | Opus | ~30s | ~$0.30 |
| **Total** | **7** | | **~45s** | **~$0.50** |

These are rough estimates. Actual costs depend on the Anthropic API pricing at time of implementation. With BYOK, the user bears these costs directly.

---

## 4. Issue Taxonomy

A controlled vocabulary of issue types, used for tagging annotations:

| Tag | Description | Example from Citrini |
|-----|-------------|---------------------|
| `IDENTITY_VIOLATION` | Violates a national accounting identity or budget constraint | GDP rises while consumption falls — what's the offset? |
| `PARTIAL_EQUILIBRIUM` | Treats as fixed something that would adjust in general equilibrium | Assumes wages don't respond to a massive labor demand shift |
| `EXOG_ENDO_CONFUSION` | Treats an endogenous outcome as if it were an exogenous assumption | "The labor share will fall" stated as premise rather than derived from a technological change |
| `MISSING_MECHANISM` | Asserts a causal link without specifying the mechanism | "AI → lower labor share" without specifying through what channel |
| `COMPOSITION_FALLACY` | What's true for one agent/sector isn't true in aggregate | Assumes firm-level logic scales to macro without aggregation effects |
| `QUANTITATIVE_IMPLAUSIBILITY` | Implied magnitudes are unreasonable given known estimates | Growth effects that imply implausible elasticities |
| `INTERNAL_CONTRADICTION` | The argument's own assumptions contradict its conclusions | Assumes both lower consumption AND higher GDP without identifying the wedge |
| `MISSING_AGENT` | Ignores a key economic actor whose response would matter | Ignores government budget constraint, foreign sector response, etc. |
| `CETERIS_NON_PARIBUS` | Holds "other things equal" when they wouldn't be | Assumes no price adjustment in a market experiencing a large supply shift |
| `QUANTITATIVE_COMPOSSIBILITY` | Individual claims are each plausible, but the magnitudes required to make them simultaneously true are implausible | GDP grows while consumption (70% of GDP) collapses — requires investment to roughly double |
| `SUTVA_VIOLATION` | Treats a shock as uniformly negative without considering that GE price adjustments can benefit other sectors or agents | AI displaces white-collar workers, but cheaper labor benefits manufacturing, healthcare, and other non-AI-exposed sectors |
| `LUCAS_CRITIQUE` | Treats policy parameters, behavioral relationships, or institutional rules as fixed when they would change in response to the shock | Assumes tax revenue collapses without considering that governments would adjust tax policy in response to income redistribution |

This taxonomy emerged from the Citrini gold-standard exercise and will likely continue to expand as more essays are evaluated. It serves both as a tagging system for the UI and as a checklist for prompt engineering.

---

## 5. Tech Stack

### Backend: Python + Flask/FastAPI

You're comfortable with Flask; I'd nudge you slightly toward **FastAPI** for this project because:

- Native `async/await` support — critical for running the 5 parallel analysis calls in Stage 2 without blocking
- Built-in request validation with Pydantic models (useful for structured API responses)
- Auto-generated API docs (nice for debugging during development)
- Deployment story is identical to Flask

If you prefer Flask, it still works — you'd use `asyncio` + `aiohttp` or `concurrent.futures` for the parallel calls.

### Frontend: HTML + Vanilla JS + Tailwind CSS (or Alpine.js)

For v1, I'd avoid React/Next.js. The UI is relatively straightforward (two panes + a report), and keeping it in plain HTML/JS means:

- No build step, no Node.js toolchain to learn
- Flask/FastAPI can serve the templates directly (Jinja2)
- Easier for you to maintain and iterate on
- Tailwind via CDN for styling without writing CSS from scratch

If you later want a richer interactive experience (e.g., clicking an annotation scrolls to the passage, collapsible sections, etc.), **Alpine.js** gives you reactive behavior in HTML attributes without a build system.

The two-pane annotation view can be implemented with a simple CSS grid or flexbox layout. Each annotation on the right links to a highlighted passage on the left.

### Text Extraction

For handling the three input types:

| Input type | Library |
|-----------|---------|
| PDF upload | `pymupdf` (fitz) — fast, reliable text extraction |
| URL / link | `trafilatura` — excellent at extracting article body text from web pages, strips nav/ads/boilerplate |
| Raw text paste | No processing needed |

### API Client

`anthropic` Python SDK for Claude API calls. Use `asyncio.gather()` for the parallel Stage 2 calls.

### Hosting: Railway or Render

Both are PaaS platforms that deploy Python apps from a Git repo with minimal configuration:

- **Railway** — slightly simpler UX, generous free tier, good for prototyping. Push to GitHub, it deploys.
- **Render** — more mature, free tier available, straightforward Flask/FastAPI deployment.

Either one avoids the overhead of managing a VPS. You `git push` and it deploys. Both support environment variables for API keys (for a future hosted-key mode) and custom domains.

**Recommendation:** Start with **Railway** for fastest iteration. Migrate to a VPS later only if you need to (e.g., for cost reasons at scale).

---

## 6. BYOK (Bring Your Own Key) Implementation

For v1, the user provides their own Anthropic API key. Key design decisions:

- **Key is never stored server-side.** It lives in the browser (sessionStorage or a JS variable) and is sent with each request.
- **Key is transmitted over HTTPS** to the backend, used for the API calls, then discarded.
- The backend proxies the calls to Anthropic's API using the user's key.
- A clear notice on the UI explains what the key is used for and that it's not stored.

**Future upgrade path:** Add a "hosted" mode where you provide the key and charge per analysis (Stripe integration), or add rate-limited free access.

---

## 7. Prompt Engineering Strategy

The prompts are the core IP of this project. Some principles:

### System Prompts

Each analysis pass gets a system prompt that:

1. Establishes the persona: "You are a professor of economics at a research university, with expertise in macroeconomics, trade, and general-equilibrium modeling."
2. Defines the specific analytical lens for that pass (e.g., "Your task is to identify places where the author's reasoning violates or is inconsistent with national accounting identities").
3. Specifies the output format (structured JSON with fields for passage reference, issue type, severity, and explanation).
4. Sets the tone: "Write explanations that a journalist or policy analyst could understand without consulting the academic literature. Be specific about *what* is wrong and *why* it matters. Avoid jargon where possible; when technical terms are necessary, define them in plain language."
5. Includes 1–2 worked examples of good annotations (few-shot prompting). **The Citrini essay is your source for these examples.**
6. Instructs the model to generate optional "Dig Deeper" technical footnotes when an annotation involves nuance that a lay explanation necessarily simplifies (e.g., conditions under which a result holds, relevant empirical evidence, formal definitions). The few-shot examples should include at least one annotation with and one without a Dig Deeper section.

### The Gold Standard Test

Before building the app, I strongly recommend:

1. Take the Citrini essay text.
2. Write (by hand) the 5–10 annotations and synthesis you'd want the tool to produce.
3. Use those as few-shot examples in the prompts and as an evaluation benchmark.
4. Iterate on the prompts until the model's output on Citrini matches your gold standard.

This "eval-driven prompt engineering" is by far the most effective approach and is where your domain expertise is most valuable.

### Prompt Versioning

Store prompts as versioned text files (or in a simple YAML config), not hardcoded in the app. This lets you iterate on prompts without redeploying, and makes it easy to A/B test different prompt strategies.

---

## 8. Development Roadmap

### Phase 0: Gold Standard & Prompt Development (1–2 weeks)

**Goal:** Nail the prompts before writing any app code.

- [x] Extract the Citrini essay text
- [x] Write your gold-standard annotations and synthesis by hand (11 annotations + synthesis report) — see `gold-standard-citrini.md`
- [x] Refine the issue taxonomy based on what comes up (added `QUANTITATIVE_COMPOSSIBILITY`, `SUTVA_VIOLATION`, `LUCAS_CRITIQUE`)
- [x] Write second gold-standard evaluation for Pettis FT essay (6 annotations + synthesis) — see `gold-standard-pettis.md`
- [x] Write third gold-standard evaluation for Cass/American Compass tariff proposal (8 annotations + synthesis) — see `gold-standard-cass.md`
- [ ] Set up project directory structure (see Section 11)
- [ ] Set up a Jupyter notebook or simple Python script to call the Claude API
- [ ] Iterate on each analysis pass prompt until output quality is satisfactory on all three gold standards
- [ ] Write eval runner to compare pipeline output to gold standards

### Phase 1: Backend MVP (1–2 weeks)

**Goal:** A working API that takes text in and returns structured analysis.

- [ ] FastAPI app with a single `/analyze` endpoint
- [ ] Text extraction pipeline (PDF, URL, raw text)
- [ ] Three-stage pipeline implementation with async parallel calls
- [ ] BYOK: accept API key in request header
- [ ] Return structured JSON response

### Phase 2: Frontend MVP (1–2 weeks)

**Goal:** A usable (not beautiful) web interface.

- [ ] Landing page with input options (paste text, upload PDF, enter URL)
- [ ] API key input field with explanation
- [ ] Loading state with progress indicators (Stage 1... Stage 2... Stage 3...)
- [ ] Two-pane annotation view (scrollable original text + linked annotations)
- [ ] Collapsible "Dig Deeper" sections on annotations that have technical footnotes
- [ ] Synthesis report section below
- [ ] Basic responsive design (Tailwind)

### Phase 3: Polish & Beta (2–3 weeks)

**Goal:** Ready for economist friends to test and give feedback.

- [ ] Error handling (bad PDFs, paywalled URLs, rate limits, malformed text)
- [ ] Refine annotation UX (click annotation → scroll to passage, highlight colors by severity)
- [ ] Add "Share" functionality (generate a permalink to results)
- [ ] Prompt refinements based on beta tester feedback
- [ ] Edge cases: very short texts, very long texts (chunking strategy), non-English text
- [ ] Deploy to Railway with custom domain

### Phase 4: Public Launch

- [ ] Landing page explaining what the tool does (with Citrini as a worked example)
- [ ] Consider hosted-key mode with rate limits or payment
- [ ] Add ability for users to flag bad annotations (feedback loop for prompt improvement)
- [ ] Expand scope beyond macro/trade as prompted by user demand
- [ ] Consider a "model suggestion" feature: "To properly analyze this question, you'd want a model with features X, Y, Z — here's a starting point."

---

## 9. Key Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| **LLM confidently produces wrong economics** | Gold-standard eval set; your domain expertise in the prompt; explicit instructions to flag uncertainty rather than guess |
| **Annotations are too vague or generic** | Few-shot examples in prompts; require specific passage references; severity levels force prioritization |
| **Latency too high for good UX** | Parallel Stage 2 calls; streaming Stage 3 output; progress indicators |
| **Cost per analysis too high** | Sonnet for most passes (cheap); Opus only for synthesis; BYOK offloads cost in v1 |
| **Text extraction fails on complex PDFs** | Fallback to raw text paste; user can pre-extract text |
| **Scope creep into micro/labor/IO** | v1 explicitly scoped to macro/trade; expand only after core quality is proven |

---

## 10. Open Questions for You

1. **Branding & domain:** Do you have a name beyond "Show Me the Model"? Do you want to register a domain?

2. **Open source or proprietary?** Open-sourcing the app (but not the prompts) could build credibility in the econ community. The prompts themselves are the IP.

3. **Collaboration model:** Do you want co-developers, or is this a solo project where friends just test and give feedback?

4. **The Pettis/Cass test case:** Would you be willing to write up a second gold-standard output for that exchange? Having 2–3 diverse eval cases will make prompt engineering much more robust.

5. **Scope of "pedagogical":** When the tool explains a GE feedback loop to a lay reader, how much detail is right? Should it sketch a simple supply-and-demand diagram in words? Reference Econ 101 concepts? Or stay more abstract?

---

## 11. Project Directory Structure

The project should be structured for development in Claude Code CLI, with clear separation between prompts (the core IP), application code, gold standards (eval data), and configuration.

```
show-me-the-model/
├── README.md                       # Project overview, setup instructions
├── .env.example                    # Template for environment variables (API keys, etc.)
├── .gitignore
│
├── prompts/                        # Core IP — versioned prompt templates
│   ├── stage1_decomposition.yaml   # Stage 1: claim/assumption extraction
│   ├── stage2_identities.yaml      # Stage 2 pass: accounting identities
│   ├── stage2_general_eq.yaml      # Stage 2 pass: GE vs PE reasoning
│   ├── stage2_exog_endog.yaml      # Stage 2 pass: exogenous/endogenous confusion
│   ├── stage2_quantitative.yaml    # Stage 2 pass: quantitative plausibility
│   ├── stage2_consistency.yaml     # Stage 2 pass: internal consistency
│   ├── stage3_synthesis.yaml       # Stage 3: Opus synthesis report
│   └── shared/
│       ├── taxonomy.yaml           # Issue type definitions & descriptions
│       ├── few_shot_examples.yaml  # Curated annotation examples for few-shot prompting
│       └── persona.yaml            # Shared persona/tone instructions
│
├── eval/                           # Gold standards & evaluation
│   ├── gold_standards/
│   │   ├── citrini.md              # Gold standard: Citrini AI crisis essay
│   │   ├── pettis.md               # Gold standard: Pettis FT imports essay
│   │   └── cass.md                 # Gold standard: Cass/American Compass tariff proposal
│   ├── source_texts/
│   │   ├── citrini.txt             # Raw source text for each test case
│   │   ├── pettis.txt
│   │   └── cass.txt
│   ├── eval_runner.py              # Script to run pipeline on test cases & compare to gold
│   └── eval_rubric.md              # Scoring criteria for eval (what counts as a match, etc.)
│
├── backend/                        # FastAPI application
│   ├── main.py                     # FastAPI app entrypoint, /analyze endpoint
│   ├── pipeline.py                 # Orchestrates the 3-stage pipeline
│   ├── stages/
│   │   ├── decomposition.py        # Stage 1 logic
│   │   ├── analysis.py             # Stage 2 logic (parallel pass dispatcher)
│   │   └── synthesis.py            # Stage 3 logic
│   ├── extractors/
│   │   ├── pdf.py                  # PDF text extraction (pymupdf)
│   │   ├── url.py                  # URL text extraction (trafilatura)
│   │   └── text.py                 # Raw text passthrough / cleanup
│   ├── models.py                   # Pydantic models for request/response schemas
│   ├── prompt_loader.py            # Loads & templates prompts from /prompts
│   └── config.py                   # App configuration (model names, timeouts, etc.)
│
├── frontend/                       # Static HTML + Tailwind + vanilla JS
│   ├── index.html                  # Landing page with input form
│   ├── results.html                # Two-pane annotation view + synthesis report
│   ├── css/
│   │   └── styles.css              # Tailwind + custom styles
│   ├── js/
│   │   ├── app.js                  # Main app logic (form submission, API calls)
│   │   ├── annotator.js            # Two-pane annotation rendering & scrolling
│   │   └── synthesis.js            # Synthesis report rendering
│   └── assets/                     # Logo, favicon, etc.
│
├── scripts/                        # Dev & utility scripts
│   ├── test_pipeline.py            # Quick script to run pipeline on a single text
│   ├── compare_output.py           # Diff pipeline output against gold standard
│   └── extract_text.py             # Standalone text extraction utility
│
├── requirements.txt                # Python dependencies
├── Procfile                        # Railway deployment config
└── railway.toml                    # Railway settings (if needed)
```

### Key Design Decisions

**Prompts as YAML files, not hardcoded.** Each prompt file contains the system prompt, any few-shot examples, and metadata (model to use, temperature, max_tokens). This lets you iterate on prompts without touching application code, version them in git, and A/B test different strategies. The `prompt_loader.py` module reads these files and templates in dynamic content (the source text, Stage 1 output, etc.).

**Eval as a first-class directory.** Gold standards, source texts, and the eval runner live together. The workflow is: edit a prompt → run `eval_runner.py` → compare output to gold standards → iterate. This is the core development loop.

**Frontend is static files, not a build system.** No React, no npm, no webpack. Just HTML + Tailwind CDN + vanilla JS. The frontend calls the backend API and renders the response. This keeps complexity minimal and deployment simple.

**Scripts for development convenience.** `test_pipeline.py` lets you run the full pipeline from the command line on a text file or URL — useful for rapid iteration without spinning up the full web app.

### Claude Code CLI Workflow

For development in Claude Code, the recommended workflow is:

1. **Start in `/prompts` and `/eval`.** Copy the gold standards into the project, write the initial prompt YAML files, and get the eval runner working.
2. **Build `backend/pipeline.py` and `backend/stages/`.** Get the three-stage pipeline producing output that matches gold standards.
3. **Add `backend/main.py` and the extractors.** Wrap the pipeline in a FastAPI endpoint.
4. **Build the frontend last.** The pipeline is the product; the frontend is just a skin.

This order ensures you're always testing against gold standards and never building UI for a pipeline that doesn't work yet.
