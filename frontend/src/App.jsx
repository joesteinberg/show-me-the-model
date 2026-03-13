import { useState, useCallback, useEffect } from "react";
import { submitJob, connectSSE, fetchResult } from "./api";
import InputForm from "./components/InputForm";
import ProgressTracker from "./components/ProgressTracker";
import ResultsView from "./components/ResultsView";
import ErrorMessage from "./components/ErrorMessage";
import ThemeSwitcher from "./components/ThemeSwitcher";
import { useTheme } from "./context/ThemeContext";

const STAGE_ORDER = ["decomposition", "stage2", "dedup", "synthesis"];

function parseHashRoute() {
  const match = window.location.hash.match(/^#\/results\/([A-Za-z0-9_-]{6,12})$/);
  return match ? match[1] : null;
}

export default function App() {
  const [phase, setPhase] = useState("idle"); // idle | running | done | error
  const [jobId, setJobId] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [stages, setStages] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Navigate to a result by ID, or reset to idle if no hash
  const navigateToHash = useCallback(() => {
    const hashId = parseHashRoute();
    if (hashId) {
      setPhase("running");
      setError(null);
      fetchResult(hashId)
        .then((data) => {
          setResult(data);
          setAnalysisId(data.analysis_id || hashId);
          setPhase("done");
        })
        .catch((err) => {
          setError({ message: `Failed to load analysis: ${err.message}` });
          setPhase("error");
        });
    } else {
      setPhase("idle");
      setJobId(null);
      setAnalysisId(null);
      setStages({});
      setResult(null);
      setError(null);
    }
  }, []);

  // Handle initial load and back/forward navigation
  useEffect(() => {
    const hashId = parseHashRoute();
    const params = new URLSearchParams(window.location.search);

    if (hashId) {
      navigateToHash();
    } else if (params.get("demo") === "true") {
      fetch("/sample-result.json")
        .then((res) => res.json())
        .then((data) => {
          setResult(data);
          setPhase("done");
        })
        .catch((err) => {
          setError({ message: `Failed to load demo data: ${err.message}` });
          setPhase("error");
        });
    }

    window.addEventListener("popstate", navigateToHash);
    return () => window.removeEventListener("popstate", navigateToHash);
  }, [navigateToHash]);

  const reset = useCallback(() => {
    setPhase("idle");
    setJobId(null);
    setAnalysisId(null);
    setStages({});
    setResult(null);
    setError(null);
    window.history.pushState(null, "", window.location.pathname + window.location.search);
  }, []);

  const handleSubmit = useCallback(async (formData) => {
    setPhase("running");
    setStages({});
    setResult(null);
    setError(null);

    try {
      const { job_id } = await submitJob(formData);
      setJobId(job_id);

      connectSSE(job_id, {
        onStageComplete: (data) => {
          setStages((prev) => ({ ...prev, [data.stage]: data }));
        },
        onDone: (data) => {
          setResult(data.result);
          if (data.analysis_id) {
            setAnalysisId(data.analysis_id);
            window.history.pushState(null, "", `#/results/${data.analysis_id}`);
          }
          setPhase("done");
        },
        onError: (data) => {
          setError(data);
          setPhase("error");
        },
      });
    } catch (err) {
      setError({ message: err.message });
      setPhase("error");
    }
  }, []);

  // ResultsView renders its own full-page layout with header
  if (phase === "done") {
    return <ResultsView result={result} analysisId={analysisId} onReset={reset} />;
  }

  return (
    <div className="min-h-screen relative" style={{ background: "var(--smtm-bg-page)" }}>
      {/* Theme switcher — top right corner */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeSwitcher />
      </div>

      {/* Title — same width as the form (max-w-4xl = 896px) */}
      <div
        className="mx-auto max-w-4xl px-4 pt-14 pb-8 text-center"
        onClick={phase === "idle" ? undefined : reset}
        style={{ cursor: phase === "idle" ? "default" : "pointer" }}
      >
        <h1
          className="font-display font-800 leading-[1.05] tracking-tight m-0"
          style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", color: "var(--smtm-title-primary)" }}
        >
          Show Me the Model!
        </h1>
        <p
          className="font-mono font-medium uppercase tracking-[0.2em] mt-2 mb-0"
          style={{ fontSize: "clamp(0.75rem, 1.8vw, 1.1rem)", color: "var(--smtm-title-secondary)" }}
        >
          Economics Slop Detector
        </p>
      </div>

      <main className="mx-auto max-w-4xl px-4 pb-8">
        {phase === "idle" && <InputForm onSubmit={handleSubmit} />}

        {phase === "running" && (
          <ProgressTracker stages={stages} stageOrder={STAGE_ORDER} />
        )}

        {phase === "error" && (
          <ErrorMessage error={error} onRetry={reset} />
        )}
      </main>
    </div>
  );
}
