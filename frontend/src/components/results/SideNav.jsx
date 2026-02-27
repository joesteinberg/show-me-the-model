const SECTIONS = [
  { id: "overview", label: "Overview", icon: "◉" },
  { id: "strengths", label: "Strengths", icon: "✓" },
  { id: "assumptions", label: "Assumptions", icon: "⚙" },
  { id: "annotations", label: "Annotations", icon: "◆" },
  { id: "contradictions", label: "Contradictions", icon: "⚡" },
  { id: "alternative", label: "Rigorous Alternative", icon: "↗" },
];

export default function SideNav({ activeSection }) {
  return (
    <nav className="sticky top-24 flex flex-col gap-0.5">
      {SECTIONS.map((s) => {
        const active = activeSection === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg no-underline text-[13px] font-body transition-all duration-150 border-l-[3px] ${
              active
                ? "text-blue-800 bg-blue-50 font-semibold border-blue-600"
                : "text-gray-500 bg-transparent font-normal border-transparent hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="text-xs w-4 text-center opacity-70">{s.icon}</span>
            {s.label}
          </a>
        );
      })}
    </nav>
  );
}
