import { useState, useCallback, useEffect } from "react";
import { submitJob, connectSSE } from "./api";
import InputForm from "./components/InputForm";
import ProgressTracker from "./components/ProgressTracker";
import ResultsView from "./components/ResultsView";
import ErrorMessage from "./components/ErrorMessage";

const STAGE_ORDER = ["decomposition", "stage2", "dedup", "synthesis"];

export default function App() {
  const [phase, setPhase] = useState("idle"); // idle | running | done | error
  const [jobId, setJobId] = useState(null);
  const [stages, setStages] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Demo mode: load saved result from /sample-result.json when ?demo=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "true") {
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
  }, []);

  const reset = useCallback(() => {
    setPhase("idle");
    setJobId(null);
    setStages({});
    setResult(null);
    setError(null);
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
    return <ResultsView result={result} onReset={reset} />;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <h1
            className="text-xl font-semibold tracking-tight cursor-pointer"
            onClick={phase === "idle" ? undefined : reset}
          >
            Show Me the Model
          </h1>
          <p className="text-sm text-gray-500">
            Rigorous structural analysis of economic arguments
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
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
