export default function SectionHeader({ id, title, subtitle, icon }) {
  return (
    <div id={id} className="mb-4 pt-6 scroll-mt-20">
      <div className="flex items-center gap-2.5">
        <span className="text-xl opacity-80">{icon}</span>
        <h2
          className="text-[22px] font-bold font-display tracking-tight"
          style={{ color: "var(--smtm-text-primary)" }}
        >
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-[13px] mt-1 ml-[30px] font-body" style={{ color: "var(--smtm-text-muted)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
