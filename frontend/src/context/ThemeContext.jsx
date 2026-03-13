import { createContext, useContext, useState, useEffect } from "react";

const THEMES = [
  { key: "dark", label: "Dark" },
  { key: "light", label: "Light" },
];

const STORAGE_KEY = "smtm_theme";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Migrate old neon theme keys
    if (stored === "neon-dark" || stored === "neon-midnight") return "dark";
    if (stored === "neon-light") return "light";
    return stored || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
