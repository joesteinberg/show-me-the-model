const SECTIONS = [
  { id: "overview", label: "Overview", icon: "◉" },
  { id: "assumptions", label: "Assumptions", icon: "⚙" },
  { id: "annotations", label: "Annotations", icon: "◆" },
  { id: "contradictions", label: "Contradictions", icon: "⚡" },
  { id: "strengths", label: "Strengths", icon: "✓" },
  { id: "alternative", label: "Rigorous Alternative", icon: "↗" },
];

export default function SideNav({ activeSection }) {
  const handleClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="sticky top-24 flex flex-col gap-0.5">
      {SECTIONS.map((s) => {
        const active = activeSection === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => handleClick(e, s.id)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg no-underline text-[13px] font-body transition-all duration-150 border-l-[3px]"
            style={{
              color: active ? "var(--smtm-nav-active-text)" : "var(--smtm-nav-inactive-text)",
              background: active ? "var(--smtm-nav-active-bg)" : "transparent",
              borderLeftColor: active ? "var(--smtm-nav-active-border)" : "transparent",
              fontWeight: active ? 600 : 400,
            }}
          >
            <span className="text-xs w-4 text-center opacity-70">{s.icon}</span>
            {s.label}
          </a>
        );
      })}
    </nav>
  );
}
