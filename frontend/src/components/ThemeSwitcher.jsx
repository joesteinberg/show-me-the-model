import { useTheme } from "../context/ThemeContext";

const ICONS = {
  dark: "☾",
  light: "☀",
};

export default function ThemeSwitcher({ compact }) {
  const { theme, cycleTheme, themes } = useTheme();
  const current = themes.find((t) => t.key === theme);

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-body font-medium cursor-pointer transition-all duration-150"
      style={{
        background: "var(--smtm-btn-secondary-bg)",
        color: "var(--smtm-text-secondary)",
        border: `1px solid var(--smtm-border-default)`,
      }}
      title={`Current: ${current?.label}. Click to switch.`}
    >
      <span className="text-sm">{ICONS[theme] || "◐"}</span>
      {!compact && <span>{current?.label}</span>}
    </button>
  );
}
