import { useState, useEffect } from "react";

const TABS = [
  { key: "text", label: "Paste Text" },
  { key: "url", label: "URL" },
  { key: "file", label: "Upload PDF" },
];

const PROVIDERS = [
  { key: "anthropic", label: "Claude (Sonnet + Opus)", placeholder: "sk-ant-..." },
  { key: "openai", label: "OpenAI (GPT-5 mini + GPT-5.2)", placeholder: "sk-..." },
];

export default function InputForm({ onSubmit }) {
  const [tab, setTab] = useState("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [provider, setProvider] = useState(() => localStorage.getItem("smtm_provider") || "anthropic");
  const [apiKey, setApiKey] = useState(() =>
    localStorage.getItem(`smtm_api_key_${localStorage.getItem("smtm_provider") || "anthropic"}`) || ""
  );
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(`smtm_api_key_${provider}`, apiKey);
    }
  }, [apiKey, provider]);

  useEffect(() => {
    localStorage.setItem("smtm_provider", provider);
    setApiKey(localStorage.getItem(`smtm_api_key_${provider}`) || "");
  }, [provider]);

  const hasInput =
    (tab === "text" && text.trim().length > 0) ||
    (tab === "url" && url.trim().length > 0) ||
    (tab === "file" && file !== null);

  const canSubmit = hasInput && apiKey.trim().length > 0 && !submitting;
  const selectedProvider = PROVIDERS.find((p) => p.key === provider) || PROVIDERS[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        text: tab === "text" ? text : undefined,
        url: tab === "url" ? url : undefined,
        file: tab === "file" ? file : undefined,
        email: email || undefined,
        apiKey,
        provider,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {provider === "openai" ? "OpenAI API Key" : "Anthropic API Key"}
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={selectedProvider.placeholder}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-400">
          Stored in your browser only. Sent only to the selected model provider through this backend.
        </p>
      </div>

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
  );
}
