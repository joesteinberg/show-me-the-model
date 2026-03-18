# Show Me the Model — Results Page Redesign Implementation Plan

**Purpose:** Step-by-step instructions for Claude Code CLI to implement the UI redesign of the analysis results page. Each phase is a self-contained unit of work that can be completed and tested independently.

**Reference artifact:** `show-me-the-model-redesign.jsx` — a working React prototype containing the target layout with real Pettis essay data. Use it as the visual spec throughout.

---

## Prerequisites

Before starting, Claude Code should:

1. Read this entire file to understand the full scope
2. Read the prototype artifact (`show-me-the-model-redesign.jsx`) to understand the target design
3. Explore the current codebase to map existing components to the plan below:
   - Find the results page entry point (likely something like `ResultsPage.jsx` or `AnalysisResults.jsx`)
   - Identify all child components: `AnnotationCard`, `SynthesisSection`, assumption cards, etc.
   - Check the CSS/styling approach (Tailwind, CSS modules, styled-components, or inline)
   - Identify where the backend JSON data gets consumed — what fields are available on `synthesis`, `annotations`, `assumptions`, `text_chunks`, etc.
   - Check the router setup to understand how results are rendered
4. Run the app locally to confirm it works before making changes

```
# Suggested exploration commands:
find src -name "*.jsx" -o -name "*.tsx" | head -30
grep -r "AnnotationCard\|SynthesisSection\|BottomLine\|KeyAssumption" src/ --include="*.jsx" --include="*.tsx" -l
grep -r "annotations\|synthesis\|assumptions\|bottom_line" src/ --include="*.jsx" --include="*.tsx" -l
cat package.json | grep -E "tailwind|styled|emotion|css"
```

---

## Phase 0: Fonts & Design Tokens

**Goal:** Establish the typographic foundation and color system before touching layout.

### 0.1 — Add Google Fonts

Add to `index.html` or the app's `<head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;0,700;1,400&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

**Rationale:** Newsreader (serif) gives editorial authority to headings and the Bottom Line. IBM Plex Sans is the workhorse body font — neutral, highly legible, excellent at small sizes. IBM Plex Mono for annotation numbers and code-like elements.

### 0.2 — Create design tokens file

Create `src/styles/tokens.js` (or equivalent for your styling approach):

```js
export const fonts = {
  display: "'Newsreader', Georgia, serif",
  body: "'IBM Plex Sans', -apple-system, sans-serif",
  mono: "'IBM Plex Mono', 'Fira Code', monospace",
};

export const severity = {
  Critical: {
    bg: "#FEF2F2",
    border: "#DC2626",
    text: "#991B1B",
    badge: "#DC2626",
    badgeText: "#fff",
  },
  Moderate: {
    bg: "#FFFBEB",
    border: "#D97706",
    text: "#92400E",
    badge: "#D97706",
    badgeText: "#fff",
  },
  Minor: {
    bg: "#F0FDF4",
    border: "#16A34A",
    text: "#166534",
    badge: "#E5E7EB",
    badgeText: "#374151",
  },
};

export const colors = {
  slate900: "#0F172A",
  slate700: "#334155",
  slate500: "#64748B",
  slate400: "#94A3B8",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray500: "#6B7280",
  blue600: "#2563EB",
  blue100: "#EFF6FF",
  violet100: "#F5F3FF",
  violet600: "#7C3AED",
  green50: "#F0FDF4",
  green200: "#BBF7D0",
  green700: "#166534",
  amber50: "#FFF7ED",
  amber200: "#FED7AA",
  amber800: "#9A3412",
};
```

If using Tailwind, instead extend the theme in `tailwind.config.js` with the font families and ensure the severity color palette is available.

### 0.3 — Verify

Confirm fonts load by temporarily applying `font-family: 'Newsreader', serif` to a heading. Should render in the serif editorial style. Revert after confirming.

---

## Phase 1: Severity Bar & Stats Dashboard

**Goal:** Add the visual executive summary at the top of the results page — the single highest-impact change.

### 1.1 — Create `SeverityBar` component

**File:** `src/components/results/SeverityBar.jsx`

This component takes the annotation counts and renders a horizontal stacked bar:
- Red segment for Critical, amber for Moderate, green for Minor
- Above the bar: count labels with large numerals ("**4** Critical · **2** Moderate · **2** Minor")
- Bar height: ~10px, border-radius for rounded ends
- Segments proportional to count, with smooth width transitions

**Data source:** Compute counts from the annotations array:
```js
const critical = annotations.filter(a => a.severity === "Critical").length;
const moderate = annotations.filter(a => a.severity === "Moderate").length;
const minor = annotations.filter(a => a.severity === "Minor").length;
```

### 1.2 — Create `StatCard` component

**File:** `src/components/results/StatCard.jsx`

Small card with a large numeral and a label below. Takes `value`, `label`, `color` props.

### 1.3 — Create `OverviewDashboard` component

**File:** `src/components/results/OverviewDashboard.jsx`

Composes `SeverityBar` + a row of `StatCard`s:
- **Issues** (total annotation count, red)
- **Unstated** (count of unstated assumptions, amber)
- **Strengths** (count of strengths items, green)
- **Contradictions** (count of internal_consistency items, violet)

Layout: SeverityBar on the left (flex: 1), stat cards on the right in a row.

### 1.4 — Wire into results page

Place `OverviewDashboard` immediately after the article title/meta and **before** the Bottom Line box. The reading order is now:

1. Title + author + source
2. Severity bar + stat cards ← NEW
3. Bottom Line
4. (everything else)

### 1.5 — Verify

Run the app. The dashboard should appear with correct counts derived from the actual backend data. Check with multiple essay outputs if available to confirm it scales.

---

## Phase 2: Bottom Line Redesign

**Goal:** Replace the current blue-left-border box with a dark, authoritative card.

### 2.1 — Restyle the Bottom Line container

Current: Light background, blue left border, blue "BOTTOM LINE" header text.

Target:
- Background: `#0F172A` (slate-900)
- Left accent: 5px gradient stripe (`#3B82F6` → `#8B5CF6`)
- Header: "BOTTOM LINE" in `#60A5FA`, 11px, uppercase, letter-spacing 1.5px
- Body text: `#CBD5E1` (slate-300), Newsreader serif, 15px, line-height 1.75
- Border-radius: 12px
- Padding: 20px 24px

### 2.2 — Verify

The Bottom Line should now be the most visually commanding element on the page, after the severity bar. It should read as a "verdict" card.

---

## Phase 3: Section Reordering

**Goal:** Change the reading order so strengths come before critique.

### 3.1 — Map current section order

Current order (from PDF):
1. Bottom Line
2. Central Claim
3. Key Assumptions (10 numbered cards)
4. What the Essay Gets Right
5. Internal Consistency
6. Rigorous Alternative
7. Annotations (8 cards)
8. Decomposition (Stage 1, collapsed)

### 3.2 — Implement new order

Target order:
1. Overview Dashboard (new, from Phase 1)
2. Bottom Line (restyled, from Phase 2)
3. Central Claim (compact, minor restyle — see 3.3)
4. **What the Essay Gets Right** ← moved UP
5. Key Assumptions ← now a compact table (Phase 4)
6. Annotations ← grouped by severity (Phase 5)
7. **Internal Contradictions** ← extracted as own section (Phase 6)
8. **Rigorous Alternative** ← distinct container (Phase 7)
9. Decomposition (keep collapsed, unchanged)

### 3.3 — Compact Central Claim

The Central Claim is currently a full-width section with a bold heading. Reduce its visual weight:
- Wrap in a simple white card with 1px border
- Use an 11px uppercase "CENTRAL CLAIM" label instead of a large heading
- Body text at 13.5px, IBM Plex Sans
- This signals "reference info" rather than "primary content"

### 3.4 — Restyle Strengths section

Move "What the Essay Gets Right" to position 4 (after Central Claim, before Assumptions).

Restyle with a green identity:
- Container: `background: #F0FDF4`, `border: 1px solid #BBF7D0`, `border-radius: 12px`
- Each strength item separated by a `1px solid #BBF7D0` divider
- Titles in Newsreader serif, green (#166534)
- Body text in IBM Plex Sans, standard gray

### 3.5 — Verify

Load results page. Confirm the new reading order feels natural: dashboard → verdict → strengths → detailed critique. The "acknowledge, then critique" flow should feel more persuasive.

---

## Phase 4: Assumptions Table

**Goal:** Replace the 10 individual assumption cards (currently ~4 pages of scrolling) with a compact, scannable table.

### 4.1 — Create `AssumptionsTable` component

**File:** `src/components/results/AssumptionsTable.jsx`

Renders all assumptions in a `<table>` with columns:

| # | Assumption | Stated | Plausible | ▾ |
|---|-----------|--------|-----------|---|

- **#** — Assumption number, monospace gray
- **Assumption** — Title text, 13px. If the assumption is load-bearing / critical, show a small `KEY` badge (red-tinted)
- **Stated** — Colored dot: blue (#3B82F6) for stated, amber (#F59E0B) for unstated. NOT a text label.
- **Plausible** — Small badge: "Weak" (red bg), "Mixed" (yellow bg), "Contested" (gray bg)
- **▾** — Expand chevron

### 4.2 — Row expansion

Clicking a row toggles an expanded state that shows the assessment paragraph below the row (as a full-width sub-row or slide-down panel). This is the text that's currently always visible in each card.

### 4.3 — Legend footer

Below the table, add a small legend row:
- 🔵 Stated · 🟠 Unstated · `KEY` Load-bearing

### 4.4 — Data mapping

The backend's `assumptions` array should have:
- `title` or `description` — the assumption text
- `stated` — boolean or "Stated"/"Unstated" string
- `assessment` — the paragraph currently shown in each card

You may need to derive `plausible` and `critical` fields. Check the backend synthesis JSON. If these aren't present, you have two options:
1. Add them to the backend prompt/schema (ideal)
2. Derive heuristically — e.g., assumptions referenced in Critical annotations could be flagged as `critical: true`

### 4.5 — Replace current assumption cards

Remove the old numbered assumption card components. Replace with `<AssumptionsTable>` in the results page.

### 4.6 — Verify

The assumptions section should now occupy roughly half a screen instead of 4 pages. All 10 assumptions visible at a glance. Click to expand any row and see the full assessment.

---

## Phase 5: Annotation Cards Redesign

**Goal:** Add severity grouping, color-coded borders, and visual hierarchy to annotations.

### 5.1 — Group annotations by severity

In the results page, partition the annotations array:

```js
const critical = annotations.filter(a => a.severity === "Critical");
const moderate = annotations.filter(a => a.severity === "Moderate");
const minor = annotations.filter(a => a.severity === "Minor");
```

Render three groups, each with a section header:

```
● Critical Issues (4)
─────────────────────
[card] [card] [card] [card]

● Moderate Issues (2)
─────────────────────
[card] [card]

● Minor / Positive Notes (2)
─────────────────────────────
[card] [card]
```

Header format: colored dot + bold label + count, with a thin colored underline.

### 5.2 — Add severity left-border to AnnotationCard

Modify the existing `AnnotationCard` component:
- Add a 4px left border colored by severity (red/amber/green)
- When collapsed: white background
- When expanded: tinted background matching severity (`severity[sev].bg`)
- Transition both on expand/collapse

### 5.3 — Restyle severity badge

Current: light tinted background (`bg-red-100`) with colored text.

Target for Critical: **filled red badge** — `background: #DC2626`, `color: white`, 11px, uppercase, bold. This makes Critical annotations visually "shout."

Keep Moderate and Minor as lighter badges.

### 5.4 — Promote quoted passage

Currently the `quoted_passage` appears inside the expanded annotation as a blockquote. Make it more prominent:
- Render it as the FIRST element in the expanded view, before the explanation
- Use a slightly tinted background matching the severity color at low opacity
- Serif font (Newsreader), italic, slightly larger than the body text
- Left border matching severity color

### 5.5 — Default first Critical annotation to open

The first Critical annotation should render expanded by default, so the reader immediately sees what a full annotation looks like. All others default to collapsed.

### 5.6 — Verify

Annotations should now have clear visual hierarchy. A user scrolling quickly sees red-bordered cards clustered under "Critical Issues" and can immediately focus their attention. The expanded annotation should show: quoted passage (serif, tinted) → explanation (sans-serif) → Dig Deeper.

---

## Phase 6: Internal Contradictions as Named Cards

**Goal:** Extract the Internal Consistency section from `SynthesisSection` and give each named contradiction its own card.

### 6.1 — Identify the data source

The current Internal Consistency section is rendered as prose paragraphs inside `SynthesisSection`. The backend synthesis JSON likely has an `internal_consistency` field that contains the named contradictions. Check the structure:

```
grep -r "internal_consistency\|contradiction\|paradox" src/ --include="*.jsx" --include="*.tsx" --include="*.json" -l
```

Each contradiction should have:
- A name (e.g., "The Powerlessness–Agency Paradox")
- Cross-references to annotation numbers
- An explanatory paragraph

If the backend currently returns this as a single prose block rather than structured items, this will need a backend change (see Phase 6.2a). If it's already structured, skip to 6.2b.

### 6.2a — Backend: Structure contradictions (if needed)

In the synthesis prompt, request that `internal_consistency` return an array of objects:

```json
{
  "internal_consistency": [
    {
      "name": "The Powerlessness-Agency Paradox",
      "annotation_refs": [1],
      "summary": "The essay establishes that the U.S. has no control over capital inflows, then recommends..."
    }
  ]
}
```

Update the JSON schema / Pydantic model accordingly.

### 6.2b — Frontend: Create `ContradictionCard` component

**File:** `src/components/results/ContradictionCard.jsx`

Design:
- Amber container: `background: #FFF7ED`, `border: 1px solid #FED7AA`, rounded
- ⚡ icon + contradiction name (Newsreader, bold, amber-800)
- Annotation ref badges: small red pills showing `#1`, `#2`, etc.
- Click to expand the summary paragraph
- Summary text in IBM Plex Sans, warm brown (#78350F)

### 6.3 — Create Contradictions section

New section between Annotations and Rigorous Alternative. Section header: "Internal Contradictions" with ⚡ icon.

Render one `ContradictionCard` per contradiction.

### 6.4 — Remove from SynthesisSection

The Internal Consistency paragraphs should no longer render inside the old `SynthesisSection` component. If `SynthesisSection` now only renders `rigorous_alternative` and `what_the_essay_gets_right`, consider whether it's still needed as a wrapper or if those sections should be standalone.

### 6.5 — Verify

The contradictions should appear as a distinctive section with their own visual identity. Each card should show annotation cross-references. Opening a card reveals the explanation.

---

## Phase 7: Rigorous Alternative Container

**Goal:** Give the "how an economist would do this properly" section a distinct visual identity.

### 7.1 — Restyle the container

Current: Rendered as plain paragraphs with no visual distinction.

Target:
- Container: `background: linear-gradient(135deg, #EFF6FF, #F5F3FF)` (blue → violet), rounded 12px, 1px border `#C7D2FE`
- Padding: 24px 28px
- Optional: A faint decorative `∂` symbol in the top-right corner (large, ~40px, opacity 0.08, Newsreader font) as a subtle math/economics motif
- Body paragraphs in IBM Plex Sans, 14px, dark slate (#1E293B), generous line-height (1.75)

### 7.2 — Section header

Use the shared `SectionHeader` component:
- Title: "Rigorous Alternative"
- Subtitle: "How an economist would approach the same question"
- Icon: ↗

### 7.3 — Verify

This section should visually "pop" as different from the critique sections. It should feel like a constructive coda — "here's the better path."

---

## Phase 8: Sticky Sidebar Navigation

**Goal:** Add a persistent sidebar nav on desktop that shows the section outline and highlights the current section.

### 8.1 — Create `SideNav` component

**File:** `src/components/results/SideNav.jsx`

A vertical nav with section links:
- Overview (◉)
- Strengths (✓)
- Assumptions (⚙)
- Annotations (◆)
- Contradictions (⚡)
- Rigorous Alternative (↗)

Each link is a hash anchor (`#overview`, etc.) with:
- Active state: blue text, blue-100 background, 3px blue left-border
- Inactive state: gray text, transparent background
- `position: sticky; top: 24px`

### 8.2 — Add section IDs

Every section in the results page needs a corresponding `id` attribute and `scroll-margin-top: 80px` (to account for the sticky header).

### 8.3 — Intersection Observer for active state

Use an `IntersectionObserver` to track which section is currently in view and highlight the corresponding nav item:

```js
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length > 0) setActiveSection(visible[0].target.id);
    },
    { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
  );
  // observe each section element
}, []);
```

### 8.4 — Layout: sidebar + main content

Wrap the results page in a flex container:
- Sidebar: 180px fixed width, `flex-shrink: 0`
- Main content: `flex: 1`, `max-width: 840px`
- Gap: 32px

### 8.5 — Responsive: hide sidebar on mobile

At screen widths below 768px, hide the sidebar entirely. The main content should go full-width. Consider adding a horizontal section indicator or a floating "jump to" button on mobile as a follow-up.

### 8.6 — Verify

On desktop, the sidebar should stick to the left while scrolling. The active section should highlight as you scroll. Clicking a nav item should smooth-scroll to that section. On mobile, the sidebar should not appear.

---

## Phase 9: Header Refinements

**Goal:** Polish the page header and "Analyze another" button.

### 9.1 — Dark header

Restyle the page header:
- Background: `#0F172A` (matches Bottom Line card)
- Title: white, Newsreader serif, 18px
- Subtitle: slate-500, IBM Plex Sans, 12px
- Make it `position: sticky; top: 0; z-index: 50`
- Bottom border: `1px solid #1E293B`

### 9.2 — Article title bar

Below the sticky nav header, add a prominent article title area:
- `Analysis: "Bad Trade"` — Newsreader, 28px, bold
- `by Michael Pettis · American Compass` — IBM Plex Sans, 14px, gray

### 9.3 — CTA button

"Analyze another" button in the header:
- Styled as a dark ghost button: border `#334155`, bg `#1E293B`, text `#E2E8F0`
- Consider also adding a second instance at the bottom of the page

---

## Phase 10: Polish & Edge Cases

### 10.1 — Issue type pills with tooltips

The pills on annotation cards (e.g., `Partial Equilibrium`, `Exog/Endo Confusion`) should show a tooltip on hover explaining the term. This helps non-economist readers.

If your app already has a tooltip component, wrap each pill. If not, use a simple `title` attribute as MVP, or add a lightweight tooltip library.

Tooltip content can come from the `taxonomy.yaml` file that defines these issue types.

### 10.2 — "Dig Deeper" restyle

The `<details>` expand inside annotations currently shows raw source pass labels. Restyle:
- Indented box with `#F8FAFC` background
- "Technical Details" or "Dig Deeper" as header
- Source pass labels as small gray pills

### 10.3 — Decomposition section

Keep collapsed by default. Add a subtle note: "Stage 1 decomposition — the raw text chunks and initial analysis. Expand for debugging or deeper inspection." This signals that it's a power-user feature, not primary content.

### 10.4 — Empty state handling

Ensure all new components handle edge cases:
- Essay with 0 Critical annotations → "Critical Issues" group header doesn't render
- Essay with 0 contradictions → Contradictions section shows a note like "No internal contradictions identified"
- Essay with 0 strengths → Strengths section shows "No specific strengths highlighted"
- Very short essay (few annotations) → layout still looks balanced

### 10.5 — Transition animations

Add subtle transitions:
- Annotation card expand/collapse: height transition + opacity fade on content
- Severity bar segments: width transition on load (animate from 0 to actual width)
- Section fade-in on scroll (optional, use `IntersectionObserver` + CSS)

---

## Testing Checklist

After all phases, verify with multiple essay outputs:

- [ ] Pettis "Bad Trade" essay — the reference case (8 annotations, 4 critical, 4 contradictions)
- [ ] A shorter essay with fewer annotations — verify layout doesn't feel sparse
- [ ] An essay with mostly moderate/minor issues — verify the severity bar doesn't look broken when there are 0 critical items
- [ ] An essay with many strengths — verify the strengths section scales
- [ ] Mobile viewport (375px) — sidebar hidden, content readable
- [ ] Tablet viewport (768px) — sidebar may show or hide depending on your breakpoint choice

---

## File Inventory (New Components)

| File | Phase | Purpose |
|------|-------|---------|
| `src/styles/tokens.js` | 0 | Design tokens: fonts, colors, severity map |
| `src/components/results/SeverityBar.jsx` | 1 | Horizontal stacked severity bar |
| `src/components/results/StatCard.jsx` | 1 | Single stat numeral + label |
| `src/components/results/OverviewDashboard.jsx` | 1 | Composes SeverityBar + StatCards |
| `src/components/results/AssumptionsTable.jsx` | 4 | Compact expandable table |
| `src/components/results/ContradictionCard.jsx` | 6 | Named contradiction card |
| `src/components/results/SideNav.jsx` | 8 | Sticky sidebar navigation |

**Modified components** (existing):
- Results page entry point — section reordering, layout wrapper
- `AnnotationCard` — severity border, badge restyle, quote prominence
- `SynthesisSection` — extract contradictions, restyle rigorous alternative
- Page header — dark theme, sticky positioning
- Strengths section — green container restyle

---

## Execution Notes for Claude Code

1. **Work phase by phase.** Each phase produces a testable result. Don't try to do everything in one pass.
2. **Read the prototype JSX first.** The file `show-me-the-model-redesign.jsx` contains the exact target styling for every component. When in doubt about a color, font size, spacing, or layout detail, refer to that file.
3. **Preserve all existing functionality.** The expand/collapse behavior on annotations, the "Dig Deeper" sections, the decomposition toggle — these all need to keep working. We're restyling and reorganizing, not removing features.
4. **Commit after each phase** with a message like `redesign: Phase 1 - severity bar and stats dashboard`.
5. **If a backend schema change is needed** (Phase 6.2a for structured contradictions, Phase 4.4 for plausibility ratings), flag it clearly and implement the frontend to handle both the old unstructured format and the new structured format gracefully.
