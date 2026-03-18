import { useState, useCallback } from "react";
import { submitJob, connectSSE } from "../api";

/**
 * Manages the SSE job connection and overall job lifecycle state machine.
 *
 * @returns {{
 *   phase: 'idle' | 'running' | 'done' | 'error',
 *   jobId: string | null,
 *   analysisId: string | null,
 *   stages: Object,
 *   result: Object | null,
 *   error: Object | null,
 *   handleSubmit: (formData: Object) => Promise<void>,
 *   reset: (opts?: { pushHistory?: boolean }) => void,
 *   setPhase: (phase: string) => void,
 *   setResult: (result: Object) => void,
 *   setAnalysisId: (id: string) => void,
 *   setError: (error: Object) => void,
 * }}
 */
export default function useJobStream() {
  const [phase, setPhase] = useState("idle"); // idle | running | done | error
  const [jobId, setJobId] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [stages, setStages] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const reset = useCallback(({ pushHistory = true } = {}) => {
    setPhase("idle");
    setJobId(null);
    setAnalysisId(null);
    setStages({});
    setResult(null);
    setError(null);
    if (pushHistory) {
      window.history.pushState(null, "", window.location.pathname + window.location.search);
    }
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

  return {
    phase,
    jobId,
    analysisId,
    stages,
    result,
    error,
    handleSubmit,
    reset,
    setPhase,
    setResult,
    setAnalysisId,
    setError,
  };
}
