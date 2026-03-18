import { useState, useEffect } from "react";

const STORAGE_KEY_PROVIDER = "smtm_provider";
const STORAGE_KEY_ANTHROPIC = "smtm_api_key_anthropic";
const STORAGE_KEY_OPENAI = "smtm_api_key_openai";

/**
 * Manages API key and provider selection state with localStorage persistence.
 *
 * @returns {{
 *   anthropicKey: string,
 *   setAnthropicKey: (key: string) => void,
 *   openaiKey: string,
 *   setOpenaiKey: (key: string) => void,
 *   provider: string,
 *   setProvider: (provider: string) => void,
 *   activeKey: string,
 * }}
 */
export default function useApiSettings() {
  const [provider, setProvider] = useState(
    () => localStorage.getItem(STORAGE_KEY_PROVIDER) || "anthropic"
  );
  const [anthropicKey, setAnthropicKey] = useState(
    () => localStorage.getItem(STORAGE_KEY_ANTHROPIC) || ""
  );
  const [openaiKey, setOpenaiKey] = useState(
    () => localStorage.getItem(STORAGE_KEY_OPENAI) || ""
  );

  useEffect(() => {
    if (anthropicKey) localStorage.setItem(STORAGE_KEY_ANTHROPIC, anthropicKey);
  }, [anthropicKey]);

  useEffect(() => {
    if (openaiKey) localStorage.setItem(STORAGE_KEY_OPENAI, openaiKey);
  }, [openaiKey]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROVIDER, provider);
  }, [provider]);

  const activeKey = provider === "openai" ? openaiKey : anthropicKey;

  return { anthropicKey, setAnthropicKey, openaiKey, setOpenaiKey, provider, setProvider, activeKey };
}
