import { useState, useEffect } from "react";

const TABS = [
  { key: "text", label: "Paste Text" },
  { key: "url", label: "URL" },
  { key: "file", label: "Upload PDF" },
];

const PROVIDERS = [
  { key: "anthropic", label: "Claude (Sonnet + Opus)" },
  { key: "openai", label: "OpenAI (GPT-5 mini + GPT-5.2)" },
];

export default function InputForm({ onSubmit }) {
  const [tab, setTab] = useState("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [provider, setProvider] = useState(() => localStorage.getItem("smtm_provider") || "anthropic");
  const [anthropicKey, setAnthropicKey] = useState(() => localStorage.getItem("smtm_api_key_anthropic") || "");
  const [openaiKey, setOpenaiKey] = useState(() => localStorage.getItem("smtm_api_key_openai") || "");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (anthropicKey) localStorage.setItem("smtm_api_key_anthropic", anthropicKey);
  }, [anthropicKey]);

  useEffect(() => {
    if (openaiKey) localStorage.setItem("smtm_api_key_openai", openaiKey);
  }, [openaiKey]);

  useEffect(() => {
    localStorage.setItem("smtm_provider", provider);
  }, [provider]);

  const activeKey = provider === "openai" ? openaiKey : anthropicKey;

  const hasInput =
    (tab === "text" && text.trim().length > 0) ||
    (tab === "url" && url.trim().length > 0) ||
    (tab === "file" && file !== null);

  const canSubmit = hasInput && activeKey.trim().length > 0 && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        text: tab === "text" ? text : undefined,
        url: tab === "url" ? url : undefined,
        file: tab === "file" ? file : undefined,
        email: email || undefined,
        apiKey: activeKey,
        provider,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const [lookupId, setLookupId] = useState("");

  const handleLookup = (e) => {
    e.preventDefault();
    const id = lookupId.trim();
    if (id) {
      window.location.hash = `#/results/${id}`;
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8">
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Workflow</label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        >
          {PROVIDERS.map((p) => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* API Keys — both always visible */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Anthropic API Key
            {provider === "anthropic" && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold align-middle">
                ACTIVE
              </span>
            )}
          </label>
          <input
            type="password"
            value={anthropicKey}
            onChange={(e) => setAnthropicKey(e.target.value)}
            placeholder="sk-ant-..."
            className={`w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${
              provider === "anthropic" ? "border-blue-300 bg-white" : "border-gray-200 bg-gray-50 text-gray-500"
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            OpenAI API Key
            {provider === "openai" && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold align-middle">
                ACTIVE
              </span>
            )}
          </label>
          <input
            type="password"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="sk-..."
            className={`w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${
              provider === "openai" ? "border-blue-300 bg-white" : "border-gray-200 bg-gray-50 text-gray-500"
            }`}
          />
        </div>
      </div>
      <p className="text-xs text-gray-400 -mt-4">
        Stored in your browser only. Sent only to the selected provider.
      </p>

      {/* Tabs */}
      <div>
        <div className="flex gap-1 border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
                tab === t.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {tab === "text" && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              placeholder="Paste the essay or article text here..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-y"
            />
          )}

          {tab === "url" && (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          )}

          {tab === "file" && (
            <div className="flex items-center gap-3">
              <label className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Choose PDF
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0] || null)}
                />
              </label>
              <span className="text-sm text-gray-500">
                {file ? file.name : "No file selected"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email (optional)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Get notified when analysis is complete"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? "Submitting..." : "Analyze"}
      </button>
    </form>

    {/* Lookup previous analysis */}
    <div className="border-t border-gray-200 pt-6">
      <p className="text-sm font-medium text-gray-700 mb-2">Look up a previous analysis</p>
      <form onSubmit={handleLookup} className="flex gap-2">
        <input
          type="text"
          value={lookupId}
          onChange={(e) => setLookupId(e.target.value)}
          placeholder="Enter analysis ID"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!lookupId.trim()}
          className="rounded-md bg-gray-100 border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Look up
        </button>
      </form>
    </div>
    </div>
  );
}
