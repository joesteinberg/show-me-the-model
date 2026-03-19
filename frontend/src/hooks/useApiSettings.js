import { useState, useEffect } from "react";

const STORAGE_KEY_PROVIDER = "smtm_provider";
const STORAGE_KEY_ANTHROPIC = "smtm_api_key_anthropic";
const STORAGE_KEY_OPENAI = "smtm_api_key_openai";
const STORAGE_KEY_REMEMBER = "smtm_remember_keys";

// Check localStorage first (remembered / legacy keys), then sessionStorage.
function readKey(key) {
  return localStorage.getItem(key) || sessionStorage.getItem(key) || "";
}

/**
 * Manages API key and provider selection state.
 *
 * Keys live in sessionStorage by default (cleared when the tab closes).
 * The "remember" toggle copies them to localStorage so they persist across
 * sessions. Existing users who already have keys in localStorage are
 * detected and default to remember=true so nothing breaks.
 */
export default function useApiSettings() {
  const [rememberKeys, setRememberKeysRaw] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY_REMEMBER);
    if (stored !== null) return stored === "true";
    // Legacy: keys already in localStorage from before this change
    return !!(localStorage.getItem(STORAGE_KEY_ANTHROPIC) || localStorage.getItem(STORAGE_KEY_OPENAI));
  });

  const [provider, setProvider] = useState(
    () => localStorage.getItem(STORAGE_KEY_PROVIDER) || "anthropic"
  );
  const [anthropicKey, setAnthropicKey] = useState(() => readKey(STORAGE_KEY_ANTHROPIC));
  const [openaiKey, setOpenaiKey] = useState(() => readKey(STORAGE_KEY_OPENAI));

  function setRememberKeys(remember) {
    setRememberKeysRaw(remember);
    localStorage.setItem(STORAGE_KEY_REMEMBER, String(remember));
    if (remember) {
      if (anthropicKey) localStorage.setItem(STORAGE_KEY_ANTHROPIC, anthropicKey);
      if (openaiKey) localStorage.setItem(STORAGE_KEY_OPENAI, openaiKey);
    } else {
      localStorage.removeItem(STORAGE_KEY_ANTHROPIC);
      localStorage.removeItem(STORAGE_KEY_OPENAI);
    }
  }

  useEffect(() => {
    if (anthropicKey) {
      sessionStorage.setItem(STORAGE_KEY_ANTHROPIC, anthropicKey);
      if (rememberKeys) localStorage.setItem(STORAGE_KEY_ANTHROPIC, anthropicKey);
    } else {
      sessionStorage.removeItem(STORAGE_KEY_ANTHROPIC);
      localStorage.removeItem(STORAGE_KEY_ANTHROPIC);
    }
  }, [anthropicKey, rememberKeys]);

  useEffect(() => {
    if (openaiKey) {
      sessionStorage.setItem(STORAGE_KEY_OPENAI, openaiKey);
      if (rememberKeys) localStorage.setItem(STORAGE_KEY_OPENAI, openaiKey);
    } else {
      sessionStorage.removeItem(STORAGE_KEY_OPENAI);
      localStorage.removeItem(STORAGE_KEY_OPENAI);
    }
  }, [openaiKey, rememberKeys]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROVIDER, provider);
  }, [provider]);

  const activeKey = provider === "openai" ? openaiKey : anthropicKey;

  return { anthropicKey, setAnthropicKey, openaiKey, setOpenaiKey, provider, setProvider, activeKey, rememberKeys, setRememberKeys };
}
