import { useState } from "react";
import { useT } from "../i18n/index.jsx";

const COLOR_PRESETS = [
  { name: "Azul Google / Google Blue", c: "#1a73e8" },
  { name: "Verde / Green",             c: "#188038" },
  { name: "Naranja / Orange",          c: "#e37400" },
  { name: "Rojo / Red",                c: "#d93025" },
  { name: "Morado / Purple",           c: "#7c3aed" },
  { name: "Gris oscuro / Dark gray",   c: "#3c4043" },
  { name: "Negro / Black",             c: "#202124" },
  { name: "Dorado / Gold",             c: "#b45309" },
];

const BRAND_KEY = "vent_brand";

export function loadBrand(defaults) {
  try {
    const raw = localStorage.getItem(BRAND_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

export function saveBrand(brand) {
  localStorage.setItem(BRAND_KEY, JSON.stringify(brand));
}

export default function BrandSettings({ brand, onSave, onClose }) {
  const { t } = useT();
  const [form, setForm] = useState({ ...brand });
  const sf = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  function handleLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) {
      alert(t("brand.logoSizeError"));
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, logo: ev.target.result }));
    reader.readAsDataURL(file);
  }

  function save() {
    saveBrand(form);
    onSave(form);
    onClose();
  }

  return (
    <div className="modal-bd" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-hdr">
          <div className="modal-ttl">🎨 {t("brand.title")}</div>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-bdy">
          <div style={{ background: "var(--sur2)", borderRadius: "var(--r-sm)", padding: "12px 14px", marginBottom: 16, fontSize: 12, color: "var(--on-sur3)" }}>
            {t("brand.description")}
          </div>

          {/* Logo upload */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--on-sur3)", marginBottom: 10 }}>{t("brand.logoLabel")}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 72, height: 72, borderRadius: 12, background: form.logo ? "transparent" : form.colorPri, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "2px solid var(--out)", flexShrink: 0 }}>
                {form.logo
                  ? <img src={form.logo} style={{ width: "100%", height: "100%", objectFit: "contain" }} alt="logo" />
                  : <span style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{(form.iniciales || "ME").slice(0, 2)}</span>}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", background: "var(--pri-lt)", color: "var(--pri)", border: "1px solid var(--pri-lt2)", borderRadius: "var(--rfull)", padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "center", marginBottom: 8 }}>
                  📁 {t("brand.uploadLogo")}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogo} />
                </label>
                {form.logo && (
                  <button style={{ width: "100%", background: "var(--err-lt)", color: "var(--err)", border: "1px solid #fad2cf", borderRadius: "var(--rfull)", padding: "6px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} onClick={() => setForm(f => ({ ...f, logo: "" }))}>
                    🗑️ {t("brand.removeLogo")}
                  </button>
                )}
                <div style={{ fontSize: 11, color: "var(--on-sur4)", marginTop: 6, textAlign: "center" }}>{t("brand.logoFallback")}</div>
              </div>
            </div>
          </div>

          <div className="fgrid f2" style={{ gap: 14 }}>
            <div className="fld" style={{ gridColumn: "1/-1" }}>
              <label>{t("brand.companyName")} *</label>
              <input value={form.nombre} onChange={sf("nombre")} placeholder="Aluminios del Norte SRL" />
            </div>
            <div className="fld" style={{ gridColumn: "1/-1" }}>
              <label>{t("brand.slogan")}</label>
              <input value={form.slogan} onChange={sf("slogan")} placeholder="Fabricación de Ventanas y Puertas" />
            </div>
            <div className="fld">
              <label>{t("brand.initials")}</label>
              <input value={form.iniciales} onChange={sf("iniciales")} placeholder="AN" maxLength={3} />
            </div>
            <div className="fld">
              <label>{t("brand.primaryColor")}</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="color" value={form.colorPri} onChange={sf("colorPri")} style={{ width: 44, height: 36, padding: 2, borderRadius: 6, border: "1px solid var(--out)", cursor: "pointer" }} />
                <input value={form.colorPri} onChange={sf("colorPri")} placeholder="#1a73e8" style={{ flex: 1, fontFamily: "'JetBrains Mono',monospace" }} />
              </div>
            </div>

            {/* Color presets */}
            <div style={{ gridColumn: "1/-1" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--on-sur3)", marginBottom: 8 }}>{t("brand.quickPalettes")}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {COLOR_PRESETS.map(p => (
                  <button
                    key={p.c}
                    title={p.name}
                    style={{ width: 28, height: 28, borderRadius: "50%", background: p.c, border: form.colorPri === p.c ? "3px solid var(--on-sur)" : "3px solid transparent", cursor: "pointer", transition: "border .15s" }}
                    onClick={() => setForm(f => ({ ...f, colorPri: p.c }))}
                  />
                ))}
              </div>
            </div>

            {/* Live preview */}
            <div style={{ gridColumn: "1/-1", background: "var(--sur2)", borderRadius: "var(--r-sm)", padding: "14px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--on-sur3)", marginBottom: 10 }}>{t("brand.menuPreview")}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#202124", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: form.logo ? "transparent" : form.colorPri, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                  {form.logo
                    ? <img src={form.logo} style={{ width: "100%", height: "100%", objectFit: "contain" }} alt="logo" />
                    : <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{(form.iniciales || "ME").slice(0, 2)}</span>}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{form.nombre || t("brand.companyNamePlaceholder")}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: 2, marginTop: 2 }}>{form.slogan || t("brand.sloganPlaceholder")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-ftr">
          <button className="btn btn-text" onClick={onClose}>{t("common.cancel")}</button>
          <button className="btn btn-filled" style={{ background: form.colorPri }} onClick={save}>{t("brand.saveApply")}</button>
        </div>
      </div>
    </div>
  );
}
