/**
 * API layer for communicating with the backend.
 */

/**
 * Submit a job for analysis.
 * @param {Object} params
 * @param {string} params.apiKey
 * @param {string} params.provider - 'anthropic' | 'openai'
 * @param {string} [params.text]
 * @param {string} [params.url]
 * @param {File} [params.file]
 * @param {string} [params.email]
 * @returns {Promise<{job_id: string}>}
 */
export async function submitJob({ text, url, file, email, apiKey, provider }) {
  const headers = { "X-Api-Key": apiKey, "X-Provider": provider || "anthropic" };

  let body;
  if (file) {
    body = new FormData();
    body.append("file", file);
    if (email) body.append("email", email);
  } else {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify({ text: text || undefined, url: url || undefined, email: email || undefined });
  }

  const res = await fetch("/api/analyze", { method: "POST", headers, body });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Open an SSE stream for a running job and register event callbacks.
 * @param {string} jobId - The job ID returned by submitJob.
 * @param {Object} handlers
 * @param {(data: Object) => void} handlers.onStageComplete - Called when a pipeline stage finishes.
 * @param {(data: Object) => void} handlers.onDone - Called when the job completes successfully.
 * @param {(data: Object) => void} handlers.onError - Called on job-level or connection errors.
 * @returns {() => void} Cleanup function that closes the EventSource.
 */
export function connectSSE(jobId, { onStageComplete, onDone, onError }) {
  const evtSource = new EventSource(`/api/jobs/${jobId}/stream`);

  evtSource.addEventListener("stage_complete", (e) => {
    const data = JSON.parse(e.data);
    onStageComplete(data);
  });

  evtSource.addEventListener("done", (e) => {
    const data = JSON.parse(e.data);
    onDone(data);
    evtSource.close();
  });

  evtSource.addEventListener("error", (e) => {
    if (e.data) {
      const data = JSON.parse(e.data);
      onError(data);
    } else {
      onError({ message: "Connection lost" });
    }
    evtSource.close();
  });

  // Handle connection-level errors (e.g. network drop)
  evtSource.onerror = () => {
    if (evtSource.readyState === EventSource.CLOSED) return;
    onError({ message: "Connection lost. You can check results by refreshing." });
    evtSource.close();
  };

  return () => evtSource.close();
}

/**
 * Fetch the current status of a job.
 * @param {string} jobId
 * @returns {Promise<Object>}
 */
export async function fetchJob(jobId) {
  const res = await fetch(`/api/jobs/${jobId}`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Fetch a previously saved analysis result by its ID.
 * @param {string} analysisId
 * @returns {Promise<Object>}
 */
export async function fetchResult(analysisId) {
  const res = await fetch(`/api/results/${analysisId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}
