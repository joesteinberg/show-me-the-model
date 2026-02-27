# Summary Dashboard v4 — Implementation Plan

**Purpose:** Step-by-step instructions for Claude Code CLI to replace the current overview dashboard (severity bar + stat cards from Phase 1 of the original plan) with the interactive summary dashboard designed in `summary-dashboard-v4.jsx`.

**Reference artifact:** `summary-dashboard-v4.jsx` — the working prototype with real Pettis essay data.

**Scope:** This plan covers ONLY the summary area above the Bottom Line box. It assumes the rest of the results page redesign (Phases 2–10 of the original `IMPLEMENTATION_PLAN.md`) is already implemented or will be implemented separately.

---

## ⚠️ Backend Changes Required — Overview

This dashboard requires **five new fields** from the backend that likely do not exist yet. These are listed here for quick reference and detailed in Phase 1 below.

| New Field | Where It Lives | Type | Example |
|-----------|---------------|------|---------|
| `assumption.plausibility` | Each assumption object | `enum: "Weak" \| "Contested" \| "Mixed" \| "Reasonable"` | `"Weak"` |
| `assumption.load_bearing` | Each assumption object | `boolean` | `true` |
| `annotation.hint` | Each annotation object | `string` (≤15 words) | `"Policy remedy contradicts 'powerlessness' premise"` |
| `strength.hint` | Each strength object | `string` (≤15 words) | `"Unit-labor-cost framing corrects widespread misconception"` |
| `contradiction.hint` | Each contradiction object | `string` (≤15 words) | `"Can't control inflows, yet recommends refusing them"` |

Additionally, the `assumption.stated` field (which likely already exists as a boolean or `"Stated"`/`"Unstated"` string) will be **relabeled** to "Explicit" / "Implicit" in the frontend. No backend change needed for this — it's a display-layer rename.

---

## Phase 1: Backend — New Fields

### 1.1 — Assumption plausibility rating

**🔴 BACKEND CHANGE REQUIRED**

Each assumption currently has a `title` (or `description`), a `stated` flag, and an `assessment` paragraph. We need to add a structured `plausibility` rating.

**Where to change:** The synthesis prompt that generates the `assumptions` array. Find the prompt template and the corresponding JSON schema / Pydantic model.

```
grep -r "assumptions" src/ --include="*.py" --include="*.yaml" --include="*.json" -l
grep -r "assumption" prompts/ --include="*.txt" --include="*.md" --include="*.yaml" -l
```

**Schema addition:**

```python
class Assumption(BaseModel):
    title: str
    stated: bool
    assessment: str
    plausibility: Literal["Weak", "Contested", "Mixed", "Reasonable"]  # NEW
    load_bearing: bool  # NEW
```

**Prompt addition** (append to the assumption-generation instructions):

```
For each assumption, also provide:
- "plausibility": Rate how empirically defensible this assumption is.
  - "Weak": Contradicted by mainstream evidence or standard theory, or assumed without justification where evidence exists
  - "Contested": Active empirical or theoretical debate; serious scholars disagree
  - "Mixed": Some evidence supports it, but important qualifications are missing
  - "Reasonable": Well-supported by standard theory and available evidence
- "load_bearing": true if the essay's central conclusion would not hold without this assumption, false if relaxing it would only modify the conclusion at the margin.
```

**Validation:** Run the backend on the Pettis essay and verify each assumption now has `plausibility` and `load_bearing` fields. Spot-check against the prototype data:
- Assumption 1 ("investment constrained by weak demand") should be `Weak` + `load_bearing: true`
- Assumption 5 ("surplus countries are primary driver") should be `Mixed` + `load_bearing: false`

### 1.2 — Annotation hints (one-liner tooltips)

**🔴 BACKEND CHANGE REQUIRED**

Each annotation currently has a `title` and a multi-paragraph `explanation`. We need a new `hint` field: a single sentence, ≤15 words, suitable for a hover tooltip.

**Schema addition:**

```python
class Annotation(BaseModel):
    # ... existing fields ...
    hint: str  # NEW — max 15 words, one-sentence summary for tooltip display
```

**Prompt addition** (append to annotation-generation instructions):

```
For each annotation, also provide:
- "hint": A single sentence of at most 15 words summarizing the core finding. This will be shown in a tooltip, so it must be extremely concise. Examples:
  - "Policy remedy contradicts 'powerlessness' premise"
  - "Dollar appreciation channel actually benefits households"
  - "Investment unresponsiveness assumed, never demonstrated"
```

### 1.3 — Strength hints

**🔴 BACKEND CHANGE REQUIRED**

Same pattern as annotations. Each strength item needs a `hint` field.

**Schema addition:**

```python
class Strength(BaseModel):
    title: str
    text: str
    hint: str  # NEW — max 15 words
```

**Prompt addition:**

```
For each strength, also provide:
- "hint": A single sentence of at most 15 words summarizing the contribution. Examples:
  - "Unit-labor-cost framing corrects widespread misconception"
  - "Debunks 'culture of thrift' with structural income-distribution logic"
```

**Note:** If strengths are currently generated as part of the `synthesis` blob rather than as discrete objects, you'll need to restructure them into an array of `{title, text, hint}` objects. Check the current data shape:

```
grep -r "strength\|gets_right\|essay_gets_right" src/ --include="*.py" --include="*.yaml" -l
```

### 1.4 — Contradiction hints

**🔴 BACKEND CHANGE REQUIRED**

Same pattern. Each contradiction needs a `hint` field.

**Schema addition:**

```python
class Contradiction(BaseModel):
    name: str
    annotation_refs: list[int]
    summary: str
    hint: str  # NEW — max 15 words
```

**Prompt addition:**

```
For each internal contradiction, also provide:
- "hint": A single sentence of at most 15 words capturing the paradox. Begin with the contradiction name. Examples:
  - "Powerlessness–Agency: can't control inflows, yet recommends refusing them"
  - "Dollar Appreciation: primary channel benefits the households it claims are harmed"
```

**Note:** If contradictions are not yet structured as an array of objects (see Phase 6 of the original implementation plan), that restructuring must happen first. This plan assumes it has been done.

### 1.5 — Verify all backend changes

Run the full pipeline on the Pettis essay. The output JSON should now include:

```json
{
  "assumptions": [
    {
      "title": "...",
      "stated": true,
      "assessment": "...",
      "plausibility": "Weak",
      "load_bearing": true,
      "hint": "..."  // optional — assumptions use title in tooltip, not hint
    }
  ],
  "annotations": [
    {
      "id": 1,
      "severity": "Critical",
      "title": "...",
      "hint": "Policy remedy contradicts 'powerlessness' premise",
      "explanation": "...",
      "types": ["Contradiction", "Exog/Endo Confusion"],
      "quoted_passage": "..."
    }
  ],
  "synthesis": {
    "strengths": [
      { "title": "...", "text": "...", "hint": "Unit-labor-cost framing corrects widespread misconception" }
    ],
    "contradictions": [
      { "name": "The Powerlessness–Agency Paradox", "annotation_refs": [1], "summary": "...", "hint": "Can't control inflows, yet recommends refusing them" }
    ]
  }
}
```

Run on at least one additional essay to verify the new fields generalize properly and the plausibility ratings are sensible.

---

## Phase 2: Frontend — Data Layer & Types

### 2.1 — Update TypeScript types / PropTypes

If using TypeScript, update the interface definitions:

```typescript
interface Assumption {
  id: number;
  title: string;
  stated: boolean;          // will display as "Explicit" / "Implicit"
  assessment: string;
  plausibility: "Weak" | "Contested" | "Mixed" | "Reasonable";  // NEW
  load_bearing: boolean;    // NEW (note: snake_case from backend, camelCase in frontend)
}

interface Annotation {
  // ... existing fields ...
  hint: string;             // NEW
}

interface Strength {
  title: string;
  text: string;
  hint: string;             // NEW
}

interface Contradiction {
  name: string;
  annotation_refs: number[];
  summary: string;
  hint: string;             // NEW
}
```

### 2.2 — Normalize backend data

Create or update a data normalization layer that maps `snake_case` backend fields to `camelCase` frontend fields. In particular:

- `load_bearing` → `loadBearing`
- `annotation_refs` → `annotationRefs`

Also add **fallback defaults** for the new fields in case the backend hasn't been updated yet or an older cached result is loaded:

```javascript
function normalizeAssumption(raw) {
  return {
    ...raw,
    loadBearing: raw.load_bearing ?? false,
    plausibility: raw.plausibility ?? "Mixed",  // safe default
  };
}

function normalizeAnnotation(raw) {
  return {
    ...raw,
    hint: raw.hint ?? raw.title,  // fall back to full title if hint missing
  };
}
```

This ensures the dashboard degrades gracefully on old data.

---

## Phase 3: Frontend — Shared Components

### 3.1 — Create `Tip` tooltip component

**File:** `src/components/ui/Tip.jsx`

A lightweight tooltip that positions itself above the trigger element. Takes `text` (React node) as content. Uses fixed positioning calculated from `getBoundingClientRect()` on mouse enter.

Key specs from the prototype:
- Dark background (`#0F172A`), light text (`#E2E8F0`)
- `fontSize: 12`, `lineHeight: 1.45`, `padding: 7px 11px`
- `borderRadius: 7`, `width: 300`
- `boxShadow: 0 8px 24px rgba(0,0,0,0.3)`
- Clamped horizontally to stay within viewport (min 8px from edges)
- `pointerEvents: none` so it doesn't interfere with mouse events

If you already have a tooltip component in the codebase, you can use it instead — just ensure it supports React node content (not just strings) and positions correctly near small 22×22 targets.

### 3.2 — Create `Square` component

**File:** `src/components/results/Square.jsx`

A generic 22×22 rounded square used by issues, strengths, and contradictions rows. Props: `bg`, `border`, `borderTop` (optional override), `shadow`, `tip` (content for Tip), `dim` (boolean for filter dimming).

### 3.3 — Create design tokens for plausibility palette

Add to `src/styles/tokens.js`:

```javascript
export const PLAUS_ORDER = ["Weak", "Contested", "Mixed", "Reasonable"];

export const plausibility = {
  Weak:       { fill: "#EF4444", bg: "#FEE2E2", border: "#EF4444", text: "#991B1B" },
  Contested:  { fill: "#818CF8", bg: "#E0E7FF", border: "#818CF8", text: "#3730A3" },
  Mixed:      { fill: "#F59E0B", bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" },
  Reasonable: { fill: "#34D399", bg: "#D1FAE5", border: "#34D399", text: "#065F46" },
};
```

Also update the severity tokens — contradictions now use the same red as Critical:

```javascript
export const contradictions = {
  color: "#DC2626",
  bg: "#FEE2E2",
  border: "#FCA5A5",
};
```

---

## Phase 4: Frontend — Issues Row

### 4.1 — Create `IssuesRow` component

**File:** `src/components/results/IssuesRow.jsx`

**Layout:** Single flex row:
- Large number (28px, Newsreader, black) + "Issues" label
- Row of 22×22 squares, one per annotation, grouped by severity (Critical → Moderate → Minor)
- Each square: light severity background, colored top border (3px), severity-tinted side borders
- Each square wrapped in `<Tip>` showing: **"Critical — Policy remedy contradicts 'powerlessness' premise"**
- Right-aligned severity legend: colored dot + count + label

**Data required per annotation:** `severity` and `hint`.

### 4.2 — Wire into dashboard

Replace the old `SeverityBar` + `StatCard` row (from the original Phase 1 implementation) with `<IssuesRow>`.

---

## Phase 5: Frontend — Assumptions Matrix

### 5.1 — Create `AssumptionBead` component

**File:** `src/components/results/AssumptionBead.jsx`

A 22×22 rounded square representing one assumption. Visual encoding:

- **Color** = plausibility (from `plausibility` palette tokens)
- **Filled vs outline** = load-bearing vs not
  - Load-bearing: `background: plausibility.fill`, `border: 2.5px solid plausibility.border`, subtle drop shadow
  - Not load-bearing: `background: plausibility.bg` (light tint), `border: 2.5px solid plausibility.border`
- Dim state: `opacity: 0.18` when filtered out
- Hover tooltip shows: `#id: [title]` + metadata line `Explicit · Weak · Load-bearing`

### 5.2 — Create `AssumptionsMatrix` component

**File:** `src/components/results/AssumptionsMatrix.jsx`

**Structure:**
1. **Header line:** Large "10" + "Assumptions" (no filter chips — filtering happens via the row labels and legend)
2. **Gray container** (`background: #FAFBFC`, rounded, 1px border):
   - **Explicit row:** "Explicit" label (blue, clickable as filter toggle) | vertical divider | row of beads
   - **Implicit row:** "Implicit" label (amber, clickable) | vertical divider | row of beads
   - **Legend footer** (below thin divider):
     - Plausibility swatches: Weak, Contested, Mixed, Reasonable — each clickable as filter
     - Divider pip
     - "Filled = load-bearing" with solid swatch — clickable as filter
     - Auto-generated insight text in red italic (right-aligned)

**Sorting:** Within each row (Explicit / Implicit), beads are sorted by:
1. Plausibility severity: Weak → Contested → Mixed → Reasonable
2. Within same plausibility: load-bearing first, then non-load-bearing

```javascript
const sortFn = (a, b) => {
  const p = PLAUS_ORDER.indexOf(a.plausibility) - PLAUS_ORDER.indexOf(b.plausibility);
  if (p !== 0) return p;
  return (b.loadBearing ? 1 : 0) - (a.loadBearing ? 1 : 0);
};
```

**Filtering:** Single-select toggle state. When a filter is active, non-matching beads dim to 18% opacity. Filter sources:
- Click "Explicit" label → only explicit assumptions highlighted
- Click "Implicit" label → only implicit highlighted
- Click any plausibility legend item → only that rating highlighted
- Click "Filled = load-bearing" → only load-bearing highlighted
- Click same filter again → deactivate (show all)

**Insight text generation:**

```javascript
const loadBearing = assumptions.filter(a => a.loadBearing);
const loadBearingWeak = loadBearing.filter(a => a.plausibility === "Weak").length;

let insight = "";
if (loadBearing.length > 0 && loadBearingWeak === loadBearing.length) {
  insight = "Every load-bearing assumption is rated Weak.";
} else if (loadBearingWeak > 1) {
  insight = `${loadBearingWeak} of ${loadBearing.length} load-bearing assumptions are rated Weak.`;
}
```

This is computed client-side from the data — no backend change needed for the insight text.

### 5.3 — Handle the "Reasonable" category gracefully

The "Reasonable" plausibility value may not appear in every essay (it doesn't appear in the Pettis analysis). When absent, the legend item renders at `opacity: 0.4` and is non-interactive. This signals the category exists but wasn't assigned.

If an essay is well-constructed, it might have several "Reasonable" beads and zero "Weak" ones — the same system naturally communicates a very different story.

---

## Phase 6: Frontend — Strengths + Contradictions Row

### 6.1 — Create `BalanceRow` component

**File:** `src/components/results/BalanceRow.jsx`

Single flex row with two groups separated by a vertical divider:

**Strengths group:**
- Large number (28px, Newsreader, **black**) + "Strengths" label
- Row of 22×22 green squares (bg: `#D1FAE5`, border: `#86EFAC`)
- Each square has a hover tooltip: **"Strength — [hint text]"**

**Contradictions group:**
- Large number (28px, Newsreader, **black**) + "Contradictions" label
- Row of 22×22 **red** squares (bg: `#FEE2E2`, border: `#FCA5A5`)
- Each square has a hover tooltip: **"Contradiction — [hint text]"**

**Colors note:** Contradictions use red, NOT purple. This aligns them conceptually with problems/issues rather than implying a separate neutral category.

### 6.2 — Data wiring

Strengths data comes from `synthesis.strengths` (array of objects with `hint` field).
Contradiction data comes from `synthesis.contradictions` (array of objects with `hint` field).

If either array is empty, still show the row but with "0" and no squares — the zero is informative.

---

## Phase 7: Frontend — Compose the Dashboard

### 7.1 — Create `SummaryDashboard` component

**File:** `src/components/results/SummaryDashboard.jsx`

Composes the three rows inside a white card:

```jsx
<div className="dashboard-card">  {/* white bg, rounded, subtle shadow */}
  <IssuesRow annotations={annotations} />
  <Divider />
  <AssumptionsMatrix assumptions={assumptions} />
  <Divider />
  <BalanceRow strengths={strengths} contradictions={contradictions} />
</div>
```

`<Divider>` is a 1px `#E5E7EB` horizontal line with 14px vertical margin.

### 7.2 — Replace old overview components

Remove or deprecate:
- `SeverityBar` component (from original Phase 1)
- `StatCard` component (from original Phase 1)
- `OverviewDashboard` component (from original Phase 1)

Replace with the new `<SummaryDashboard>` in the results page, positioned between the article title and the Bottom Line card.

### 7.3 — Verify

Run the app. Confirm:
- All three rows render with correct data
- Hover tooltips appear on all squares across all three rows
- Assumption filters work (click labels, click legend items, click to deactivate)
- Insight text appears when load-bearing assumptions are disproportionately Weak
- "Reasonable" appears dimmed in legend when not present in data
- Beads sort correctly: plausibility left-to-right (worst → best), load-bearing before non-load-bearing within each plausibility group

---

## Phase 8: Edge Cases & Fallbacks

### 8.1 — Missing backend fields

If a user loads a cached analysis that predates the backend changes, the new fields will be absent. The normalization layer (Phase 2.2) handles this:

- Missing `plausibility` → default to `"Mixed"`
- Missing `load_bearing` → default to `false`
- Missing `hint` → fall back to `title` (for annotations) or first 15 words of `text` (for strengths/contradictions)

This means the dashboard will still render, just with less information. All beads will be the same color (amber/Mixed) and none will be filled — which is an accurate representation of "we don't know."

### 8.2 — Zero items

- 0 annotations → Issues row shows "0 Issues" with no squares and no legend
- 0 assumptions → Assumptions section shows "0 Assumptions" with empty gray box
- 0 strengths → "0 Strengths" with no squares
- 0 contradictions → "0 Contradictions" with no squares
- All assumptions are Reasonable → insight text is empty (which is itself informative — no red-italic warning)

### 8.3 — Many items

- 20+ assumptions → the bead rows will wrap. The flex container uses `flexWrap: "wrap"` and `gap: 6`, so this is handled. Test with a long essay to confirm wrapping looks clean.
- 15+ annotations → the issues row wrapping may look dense. Consider adding a second row or reducing square size to 18×18 if counts regularly exceed ~12. Test and decide.

### 8.4 — Mobile

On small screens (<640px):
- The three-row layout should stack naturally (flex-wrap handles it)
- The strengths/contradictions row may split into two stacked lines — this is acceptable
- Hover tooltips should still work on touch (show on tap, hide on tap elsewhere)
- If touch tooltips are problematic, consider making squares tappable to scroll to the corresponding detail section instead

---

## Testing Checklist

### Backend
- [ ] Pettis "Bad Trade" — verify plausibility ratings match expected values (see prototype data)
- [ ] Pettis — verify load_bearing flags are assigned to the right assumptions (expect 4)
- [ ] Pettis — verify hints are ≤15 words and capture the core finding
- [ ] Second essay — verify plausibility and load_bearing generalize sensibly
- [ ] Essay with no critical issues — verify hints still generated for moderate/minor
- [ ] Well-argued essay — verify some assumptions get "Reasonable" rating

### Frontend
- [ ] Dashboard renders with real backend data
- [ ] All hover tooltips work on issues, assumptions, strengths, contradictions
- [ ] Filter: click "Explicit" → only explicit beads highlighted
- [ ] Filter: click "Weak" in legend → only weak beads highlighted
- [ ] Filter: click "Filled = load-bearing" → only load-bearing beads highlighted
- [ ] Filter: click active filter again → deactivates, all beads restored
- [ ] Insight text appears when appropriate, absent when not
- [ ] "Reasonable" legend item is dimmed when no assumptions have that rating
- [ ] Sort order: Weak load-bearing → Weak non-load-bearing → Contested load-bearing → ... within each row
- [ ] Fallback: old cached data without new fields still renders (all beads amber, no fill)
- [ ] Mobile: layout doesn't break at 375px width

---

## File Inventory

### New files
| File | Phase | Purpose |
|------|-------|---------|
| `src/components/ui/Tip.jsx` | 3.1 | Tooltip component |
| `src/components/results/Square.jsx` | 3.2 | Generic 22×22 bead |
| `src/components/results/AssumptionBead.jsx` | 5.1 | Assumption-specific bead with plausibility encoding |
| `src/components/results/IssuesRow.jsx` | 4.1 | Issues summary row |
| `src/components/results/AssumptionsMatrix.jsx` | 5.2 | Interactive assumptions block |
| `src/components/results/BalanceRow.jsx` | 6.1 | Strengths + contradictions row |
| `src/components/results/SummaryDashboard.jsx` | 7.1 | Composer for the full dashboard card |

### Modified files
| File | Phase | Change |
|------|-------|--------|
| `src/styles/tokens.js` | 3.3 | Add plausibility palette + contradiction colors |
| Results page entry point | 7.2 | Replace old overview with `SummaryDashboard` |
| Backend assumption schema | 1.1 | Add `plausibility` + `load_bearing` fields |
| Backend annotation schema | 1.2 | Add `hint` field |
| Backend strength schema | 1.3 | Add `hint` field |
| Backend contradiction schema | 1.4 | Add `hint` field |
| Backend synthesis prompt | 1.1–1.4 | Add generation instructions for all new fields |
| Data normalization layer | 2.2 | Add fallback defaults for new fields |

### Removed / deprecated
| File | Phase | Reason |
|------|-------|--------|
| `SeverityBar.jsx` | 7.2 | Replaced by IssuesRow |
| `StatCard.jsx` | 7.2 | No longer needed |
| `OverviewDashboard.jsx` | 7.2 | Replaced by SummaryDashboard |

---

## Execution Notes for Claude Code

1. **Start with the backend (Phase 1).** The frontend depends entirely on the new fields. Without them you'll be working with fallback defaults, which makes testing meaningless.
2. **Test the backend independently** before touching the frontend. Run the pipeline, inspect the JSON, confirm the new fields are present and sensible.
3. **The prototype JSX is the pixel-perfect spec.** Every color value, font size, spacing value, border radius, and opacity level is encoded in `summary-dashboard-v4.jsx`. When in doubt, copy the values from there.
4. **The sort function matters.** Get it right: plausibility severity first (Weak < Contested < Mixed < Reasonable), then load-bearing before non-load-bearing within the same plausibility. Test with the Pettis data to verify the Explicit row shows: filled-red, outline-red, outline-red, outline-yellow, outline-red (IDs 1, 6, 10, 5, 7 — wait, re-sort properly from the data).
5. **Commit after each phase.** Backend changes and frontend changes should be separate commits so they can be reviewed and rolled back independently.
