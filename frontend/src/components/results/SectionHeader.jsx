export default function SectionHeader({ id, title, subtitle, icon }) {
  return (
    <div id={id} className="mb-4 pt-6 scroll-mt-20">
      <div className="flex items-center gap-2.5">
        <span className="text-xl opacity-80">{icon}</span>
        <h2 className="text-[22px] font-bold text-slate-900 font-display tracking-tight">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-[13px] text-gray-500 mt-1 ml-[30px] font-body">
          {subtitle}
        </p>
      )}
    </div>
  );
}
