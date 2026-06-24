import { useState, useRef, useEffect } from "react";
import { useT } from "../i18n/index.jsx";

export default function LanguageSelector() {
  const { lang, setLang, languages } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = languages.find(l => l.code === lang) || languages[0];

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Language / Idioma"
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 10px", borderRadius: "var(--r-full)",
          border: "1px solid var(--out)", background: "var(--sur)",
          cursor: "pointer", fontFamily: "inherit", fontSize: 13,
          color: "var(--on-sur)", transition: "background .15s",
        }}
      >
        <span style={{ fontSize: 16 }}>{current.flag}</span>
        <span style={{ fontWeight: 500 }}>{current.code.toUpperCase()}</span>
        <span style={{ fontSize: 10, opacity: .6 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 6px)",
          background: "var(--sur)", border: "1px solid var(--out)",
          borderRadius: "var(--r-md)", boxShadow: "var(--sh3)",
          overflow: "hidden", minWidth: 140, zIndex: 999,
        }}>
          {languages.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "10px 14px",
                border: "none", background: lang === l.code ? "var(--pri-lt)" : "transparent",
                cursor: "pointer", fontFamily: "inherit", fontSize: 13,
                color: lang === l.code ? "var(--pri)" : "var(--on-sur)",
                fontWeight: lang === l.code ? 600 : 400,
                transition: "background .1s",
              }}
            >
              <span style={{ fontSize: 18 }}>{l.flag}</span>
              <span>{l.label}</span>
              {lang === l.code && <span style={{ marginLeft: "auto", fontSize: 12 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
