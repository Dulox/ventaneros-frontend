import { useState, lazy, Suspense } from "react";
import Sidebar from "./Sidebar.jsx";
import { useModules } from "./ModuleProvider.jsx";
import { getModuleById } from "./ModuleRegistry.js";
import { DEFAULT_BRAND } from "../shared/LoginScreen.jsx";
import LanguageSelector from "./LanguageSelector.jsx";
import { useT } from "../i18n/index.jsx";
import BrandSettings, { loadBrand, saveBrand } from "../shared/BrandSettings.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

// Lazy-loaded module components — each module only downloads when visited.
// To add a new module: add its entry here AND in ModuleRegistry.js.
const MODULE_COMPONENTS = {
  agenda:       lazy(() => import("../modules/agenda/index.jsx")),
  dashboard:    lazy(() => import("../modules/dashboard/index.jsx")),
  calculadoras: lazy(() => import("../modules/calculadoras/index.jsx")),
  ordenes: lazy(() => import("../modules/ordenes/index.jsx")),
  clientes: lazy(() => import("../modules/clientes/index.jsx")),
  presupuestos: lazy(() => import("../modules/presupuestos/index.jsx")),
  facturacion: lazy(() => import("../modules/facturacion/index.jsx")),
  proveedores: lazy(() => import("../modules/proveedores/index.jsx")),
  inventario: lazy(() => import("../modules/inventario/index.jsx")),
  precios: lazy(() => import("../modules/precios/index.jsx")),
  "cuentas-por-pagar": lazy(() => import("../modules/cuentas-por-pagar/index.jsx")),
  caja: lazy(() => import("../modules/caja/index.jsx")),
  contabilidad: lazy(() => import("../modules/contabilidad/index.jsx")),
  despachos: lazy(() => import("../modules/despachos/index.jsx")),
  instalaciones: lazy(() => import("../modules/instalaciones/index.jsx")),
  licencias:     lazy(() => import("../modules/licencias/index.jsx")),
  usuarios:      lazy(() => import("../modules/licencias/usuarios.jsx")),
  configuracion: lazy(() => import("../modules/configuracion/index.jsx")),
  referidos:     lazy(() => import("../modules/referidos/index.jsx")),
};

function ModuleLoading() {
  return <div style={{ padding: 40, textAlign: "center", color: "var(--on-sur4)" }}>Cargando módulo...</div>;
}

function NoAccess({ moduleName }) {
  return (
    <div style={{ padding: 40, textAlign: "center", color: "var(--on-sur4)" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Módulo no disponible</div>
      <div>{moduleName} no está activo en tu plan. Contacta a soporte para activarlo.</div>
    </div>
  );
}

export default function Shell({ onLogout }) {
  const { modulosActivos, esAdmin, empresa, loading, error } = useModules();
  const { t } = useT();
  const [page, setPage] = useState("dashboard");
  const [expanded, setExpanded] = useState(true);
  const [showBrand, setShowBrand] = useState(false);

  // Brand: loaded from localStorage, falls back to empresa data from DB, then DEFAULT_BRAND
  const [brand, setBrand] = useState(() => loadBrand({
    nombre:    empresa?.nombre   || DEFAULT_BRAND.nombre,
    slogan:    empresa?.slogan   || DEFAULT_BRAND.slogan,
    logo:      empresa?.logo_url || DEFAULT_BRAND.logo,
    colorPri:  empresa?.color_primario || DEFAULT_BRAND.colorPri,
    iniciales: empresa?.iniciales || DEFAULT_BRAND.iniciales,
  }));

  const brandStyle = { "--pri": brand.colorPri, "--pri-dk": brand.colorPri, "--pri-lt": brand.colorPri + "22", "--pri-lt2": brand.colorPri + "44" };

  if (loading) {
    return <div style={{ padding: 60, textAlign: "center" }}>{t("shell.loadingAccount")}</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "#dc2626" }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{t("shell.errorCompany")}</div>
        <div>{error}</div>
      </div>
    );
  }

  const currentModule = getModuleById(page);
  const hasAccess = modulosActivos.includes(page) && (!currentModule?.soloAdmin || esAdmin);
  const ModuleComponent = MODULE_COMPONENTS[page];

  return (
    <div className="shell" style={brandStyle}>
      <Sidebar
        page={page}
        onNav={setPage}
        expanded={expanded}
        setExpanded={setExpanded}
        onLogout={onLogout}
        onOpenBrand={() => setShowBrand(true)}
        brand={brand}
      />
      <div className="main">
        <div className="topbar">
          <div className="topbar-title">{t(`modules.${page}`) || currentModule?.nombre || "Ventaneros"}</div>
          <div className="topbar-search">
            <span style={{ color: "var(--on-sur4)", fontSize: 16 }}>🔍</span>
            <input placeholder={t("shell.searchPlaceholder").replace("{nombre}", brand.nombre)} />
          </div>
          <LanguageSelector />
          <ThemeToggle />
          <button className="icon-btn" title={t("common.notifications")}>🔔</button>
          <div
            onClick={() => setShowBrand(true)}
            title={t("common.customize")}
            style={{ width: 36, height: 36, borderRadius: "50%", background: brand.logo ? "transparent" : brand.colorPri, overflow: "hidden", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            {brand.logo ? <img src={brand.logo} style={{ width: "100%", height: "100%", objectFit: "contain" }} alt="logo" /> : <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{brand.iniciales.slice(0, 2)}</span>}
          </div>
        </div>
        <div className="content">
          <div style={{ height: 16 }} />
          {!hasAccess ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--on-sur4)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{t("common.noAccess")}</div>
              <div>{currentModule?.nombre || page} {t("common.noAccessMsg")}</div>
            </div>
          ) : (
            <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "var(--on-sur4)" }}>{t("shell.loadingModule")}</div>}>
              {ModuleComponent ? <ModuleComponent onNav={setPage} /> : null}
            </Suspense>
          )}
        </div>
      </div>
      {showBrand && (
        <BrandSettings
          brand={brand}
          onSave={setBrand}
          onClose={() => setShowBrand(false)}
        />
      )}
    </div>
  );
}
