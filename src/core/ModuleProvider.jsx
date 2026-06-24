import { createContext, useContext, useState, useEffect } from "react";
import { getAccessToken, getEmpresaInfo } from "../api.js";

const ModuleContext = createContext(null);

export function ModuleProvider({ children }) {
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getEmpresaInfo();
        if (!cancelled) setEmpresa(data);
      } catch (e) {
        if (!cancelled) setError(e.message || "No se pudo cargar la información de la empresa.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (getAccessToken()) load();
    else setLoading(false);
    return () => { cancelled = true; };
  }, []);

  const modulosActivos = empresa?.modulos_activos || [];
  const esAdmin = !!empresa?.es_admin;

  function hasModule(id) {
    return modulosActivos.includes(id);
  }

  return (
    <ModuleContext.Provider value={{ empresa, setEmpresa, modulosActivos, esAdmin, hasModule, loading, error }}>
      {children}
    </ModuleContext.Provider>
  );
}

export function useModules() {
  const ctx = useContext(ModuleContext);
  if (!ctx) throw new Error("useModules debe usarse dentro de ModuleProvider");
  return ctx;
}
