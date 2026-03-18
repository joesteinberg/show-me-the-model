import { useEffect, useCallback } from "react";
import { fetchResult } from "../api";

/**
 * Parses the URL hash and returns an analysis ID if present.
 *
 * @returns {string | null}
 */
function parseHashRoute() {
  const match = window.location.hash.match(/^#\/results\/([A-Za-z0-9_-]{6,12})$/);
  return match ? match[1] : null;
}

/**
 * Handles hash-based routing for shareable result links.
 * Reads window.location.hash on mount and listens for popstate events.
 *
 * @param {{
 *   setPhase: (phase: string) => void,
 *   setResult: (result: Object) => void,
 *   setAnalysisId: (id: string) => void,
 *   setError: (error: Object) => void,
 *   reset: (opts?: { pushHistory?: boolean }) => void,
 * }} handlers
 */
export default function useResultRouting({ setPhase, setResult, setAnalysisId, setError, reset }) {
  const loadResultById = useCallback(
    (hashId) => {
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
    },
    [setPhase, setResult, setAnalysisId, setError]
  );

  const navigateToHash = useCallback(() => {
    const hashId = parseHashRoute();
    if (hashId) {
      loadResultById(hashId);
    } else {
      reset({ pushHistory: false });
    }
  }, [loadResultById, reset]);

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
  }, [navigateToHash, setPhase, setResult, setError]);

  return { loadResultById };
}
