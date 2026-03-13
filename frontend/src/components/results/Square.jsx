import Tip from "../ui/Tip";

export default function Square({ bg, border, borderTop, borderTopWidth, shadow, tip, dim }) {
  return (
    <Tip text={tip}>
      <span
        className="inline-block rounded-[5px] cursor-default transition-opacity duration-150"
        style={{
          width: 22,
          height: 22,
          background: bg,
          border: `2px solid ${border}`,
          borderTop: borderTop ? `${borderTopWidth || "2px"} solid ${borderTop}` : `2px solid ${border}`,
          opacity: dim ? 0.18 : 1,
          boxShadow: shadow || "none",
        }}
      />
    </Tip>
  );
}
