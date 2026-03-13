const STAGE_META = {
  decomposition: {
    label: "Decomposition",
    description: "Breaking down the argument into thesis, claims, and causal chains",
  },
  stage2: {
    label: "Analysis Passes",
    description: "Running six parallel analytical lenses on the argument",
  },
  dedup: {
    label: "Dedup & Merge",
    description: "Consolidating overlapping findings into distinct annotations",
  },
  synthesis: {
    label: "Synthesis",
    description: "Generating the final analytical report",
  },
};

function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      style={{ color: "var(--smtm-progress-active)" }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function Checkmark() {
  return (
    <svg className="h-5 w-5" style={{ color: "var(--smtm-progress-done)" }} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PendingDot() {
  return <div className="h-5 w-5 rounded-full border-2" style={{ borderColor: "var(--smtm-progress-pending-border)" }} />;
}

import { useState } from "react";

export default function ProgressTracker({ stages, stageOrder, jobId }) {
  const completedSet = new Set(Object.keys(stages));

  // Find the current (first incomplete) stage
  let currentStage = null;
  for (const s of stageOrder) {
    if (!completedSet.has(s)) {
      currentStage = s;
      break;
    }
  }

  const [copied, setCopied] = useState(false);
  const copyJobId = () => {
    if (jobId) {
      navigator.clipboard.writeText(jobId).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm mb-4" style={{ color: "var(--smtm-text-muted)" }}>
        Analysis in progress. This typically takes 5–10 minutes.
      </p>
      {jobId && (
        <div
          className="rounded-lg px-4 py-3 mb-4 border"
          style={{
            background: "var(--smtm-bg-surface)",
            borderColor: "var(--smtm-border-default)",
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium font-body" style={{ color: "var(--smtm-text-muted)" }}>
              Job ID
            </span>
            <button
              onClick={copyJobId}
              className="px-2 py-0.5 rounded font-mono text-xs transition-colors cursor-pointer border"
              style={{
                background: "var(--smtm-bg-surface-raised)",
                color: "var(--smtm-text-primary)",
                borderColor: "var(--smtm-border-default)",
              }}
            >
              {copied ? "Copied!" : jobId}
            </button>
          </div>
          <p className="text-xs leading-relaxed m-0" style={{ color: "var(--smtm-text-muted)" }}>
            Save this ID for your records. If you get disconnected, the analysis will still complete in the background. Once it finishes, you'll receive a shareable analysis ID on the results page.
          </p>
        </div>
      )}
      <div className="space-y-3">
        {stageOrder.map((key) => {
          const meta = STAGE_META[key];
          const done = completedSet.has(key);
          const active = key === currentStage;

          return (
            <div key={key} className="flex items-start gap-3">
              <div className="mt-0.5">
                {done ? <Checkmark /> : active ? <Spinner /> : <PendingDot />}
              </div>
              <div>
                <p
                  className="text-sm font-medium font-body"
                  style={{
                    color: done
                      ? "var(--smtm-progress-done)"
                      : active
                      ? "var(--smtm-progress-active)"
                      : "var(--smtm-text-muted)",
                  }}
                >
                  {meta.label}
                </p>
                {active && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--smtm-text-muted)" }}>
                    {meta.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
