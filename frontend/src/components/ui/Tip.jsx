import { useState } from "react";

export default function Tip({ children, text }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState(null);

  const handleEnter = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ left: r.left + r.width / 2, top: r.top });
    setShow(true);
  };

  return (
    <span
      onMouseEnter={handleEnter}
      onMouseLeave={() => setShow(false)}
      className="relative inline-flex"
    >
      {children}
      {show && pos && (
        <span
          className="fixed z-[999] font-body font-normal pointer-events-none"
          style={{
            left: Math.max(8, Math.min(pos.left - 150, window.innerWidth - 308)),
            top: pos.top - 8,
            transform: "translateY(-100%)",
            background: "var(--smtm-tooltip-bg)",
            color: "var(--smtm-tooltip-text)",
            fontSize: 12,
            lineHeight: 1.45,
            padding: "7px 11px",
            borderRadius: 7,
            width: 300,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}
