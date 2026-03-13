const STAGE_LABELS = {
  decomposition: "Decomposition",
  stage2: "Analysis Passes",
  dedup: "Dedup & Merge",
  synthesis: "Synthesis",
};

export default function ErrorMessage({ error, onRetry }) {
  return (
    <div
      className="rounded-lg border p-6"
      style={{
        background: "var(--smtm-error-bg)",
        borderColor: "var(--smtm-error-border)",
      }}
    >
      <h2 className="text-lg font-semibold font-display" style={{ color: "var(--smtm-error-title)" }}>
        Analysis Failed
      </h2>
      {error.stage && (
        <p className="mt-1 text-sm" style={{ color: "var(--smtm-error-text)" }}>
          Failed during: {STAGE_LABELS[error.stage] || error.stage}
        </p>
      )}
      <p className="mt-3 text-sm" style={{ color: "var(--smtm-error-text)" }}>{error.message}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
        style={{
          background: "var(--smtm-error-btn-bg)",
          color: "var(--smtm-error-btn-text)",
        }}
      >
        Try Again
      </button>
    </div>
  );
}
