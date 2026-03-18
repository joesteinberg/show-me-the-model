import useJobStream from "./hooks/useJobStream";
import useResultRouting from "./hooks/useResultRouting";
import InputForm from "./components/InputForm";
import ProgressTracker from "./components/ProgressTracker";
import ResultsView from "./components/ResultsView";
import ErrorMessage from "./components/ErrorMessage";
import ThemeSwitcher from "./components/ThemeSwitcher";

const STAGE_ORDER = ["decomposition", "stage2", "dedup", "synthesis"];

export default function App() {
  const { phase, jobId, analysisId, stages, result, error, handleSubmit, reset,
          setPhase, setResult, setAnalysisId, setError } = useJobStream();

  useResultRouting({ setPhase, setResult, setAnalysisId, setError, reset });

  // ResultsView renders its own full-page layout with header
  if (phase === "done") {
    return <ResultsView result={result} analysisId={analysisId} onReset={reset} />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-200">
      <ThemeSwitcher />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <header className="text-center mb-10">
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--color-heading)]">
            Show Me the Model
          </h1>
          <p className="mt-3 text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto font-body">
            AI-powered analysis of economic reasoning
          </p>
        </header>

        {phase === "idle" && <InputForm onSubmit={handleSubmit} />}

        {phase === "running" && (
          <ProgressTracker stages={stages} stageOrder={STAGE_ORDER} />
        )}

        {phase === "error" && (
          <ErrorMessage error={error} stages={stages} stageOrder={STAGE_ORDER} onRetry={reset} />
        )}
      </div>
    </div>
  );
}
