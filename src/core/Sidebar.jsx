import { useState } from "react";
import { useModules } from "./ModuleProvider.jsx";
import { getModuleById } from "./ModuleRegistry.js";
import { logout } from "../api.js";
import { DEFAULT_BRAND } from "../shared/LoginScreen.jsx";
import { useT } from "../i18n/index.jsx";

export default function Sidebar({ page, onNav, expanded, setExpanded, onLogout, onOpenBrand, brand: brandProp }) {
  const { modulosActivos, esAdmin, empresa } = useModules();
  const { t } = useT();

  const brand = brandProp || {
    nombre:   empresa?.nombre || DEFAULT_BRAND.nombre,
    slogan:   empresa?.slogan || DEFAULT_BRAND.slogan,
    logo:     empresa?.logo_url || DEFAULT_BRAND.logo,
    colorPri: empresa?.color_primario || DEFAULT_BRAND.colorPri,
    iniciales:empresa?.iniciales || DEFAULT_BRAND.iniciales,
  };

  // Build the visible module list: active modules, minus admin-only ones
  // unless this empresa is flagged as admin.
  const visibleModules = modulosActivos
    .map(getModuleById)
    .filter(Boolean)
    .filter((m) => !m.soloAdmin || esAdmin);

  // Group by category, preserving insertion order
  const grouped = {};
  for (const m of visibleModules) {
    if (!grouped[m.categoria]) grouped[m.categoria] = [];
    grouped[m.categoria].push(m);
  }

  const brandStyle = { "--pri": brand.colorPri };

  return (
    <nav className={`nav-rail${expanded ? " expanded" : ""}`} style={brandStyle}>
      <div className="rail-header">
        <div
          className="rail-logo"
          onClick={() => setExpanded((e) => !e)}
          title={expanded ? "Colapsar menú" : "Expandir menú"}
          style={{ background: brand.logo ? "transparent" : brand.colorPri, overflow: "hidden" }}
        >
          {brand.logo
            ? <img src={brand.logo} style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%" }} alt="logo" />
            : <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{brand.iniciales.slice(0, 2)}</span>}
        </div>
        {expanded && (
          <div>
            <div className="rail-wordmark">{brand.nombre}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", letterSpacing: 1, marginTop: 1 }}>{brand.slogan}</div>
          </div>
        )}
      </div>

      <div className="sb-nav" style={{ width: "100%", padding: "4px 8px", flex: 1, overflowY: "auto" }}>
        {Object.entries(grouped).map(([categoria, mods]) => (
          <div key={categoria}>
            {expanded && <div className="nav-cat-label">{t(`categories.${categoria.toLowerCase()}`) || categoria}</div>}
            {mods.map((m) => (
              <div
                key={m.id}
                className={"ni" + (page === m.id ? " on" : "")}
                onClick={() => onNav(m.id)}
                title={t(`modules.${m.id}`) || m.nombre}
              >
                <span className="ni-icon">{m.icono}</span>
                <span className="ni-lbl">{t(`modules.${m.id}`) || m.nombre}</span>
              </div>
            ))}
          </div>
        ))}
        {visibleModules.length === 0 && expanded && (
          <div style={{ padding: "16px 12px", color: "rgba(255,255,255,.4)", fontSize: 12 }}>
            {t("shell.noModules")}
          </div>
        )}
      </div>

      <div className="sb-user-row">
        {expanded && (
          <button
            onClick={onOpenBrand}
            style={{ width: "100%", padding: "8px 10px", background: "transparent", border: "1px dashed rgba(255,255,255,.2)", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 11, color: "rgba(255,255,255,.4)", marginBottom: 6, display: "flex", alignItems: "center", gap: 8, transition: "all .2s" }}
          >
            🎨 <span>{t("common.customize")}</span>
          </button>
        )}
        <div className="sb-user" onClick={() => { logout(); onLogout(); }}>
          <div className="sb-av" style={{ background: brand.colorPri, overflow: "hidden" }}>
            {brand.logo ? <img src={brand.logo} style={{ width: "100%", height: "100%", objectFit: "contain" }} alt="logo" /> : <span style={{ fontSize: 11 }}>{brand.iniciales.slice(0, 2)}</span>}
          </div>
          <div className="sb-info">
            <div className="sb-un">{brand.nombre}</div>
            <div className="sb-ur">{t("common.logout")}</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
