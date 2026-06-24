import { useState } from "react";
import { useModules } from "../../core/ModuleProvider.jsx";
import { MODULES, getModulesByCategory } from "../../core/ModuleRegistry.js";
import { updateModulosEmpresa } from "../../api.js";

const PLANES_FIJOS = [
  { id: "basico", nombre: "Básico", precio: 990, usuarios: 1, desc: "1 usuario, todas las calculadoras" },
  { id: "pro", nombre: "Pro", precio: 2490, usuarios: 3, desc: "3 usuarios, todas las funciones" },
  { id: "empresa", nombre: "Empresarial", precio: 4990, usuarios: 999, desc: "Usuarios ilimitados, soporte prioritario" },
  { id: "custom", nombre: "Personalizado", precio: 0, usuarios: 0, desc: "Precio y condiciones personalizadas" },
];
function genLicKey() { const s = () => Math.random().toString(36).slice(2, 6).toUpperCase(); return `VENT-${s()}-${s()}-${s()}`; }
function addMonthsLic(m) { const d = new Date(); d.setMonth(d.getMonth() + m); return d.toISOString().slice(0, 10); }
function daysLeft(d) { return Math.ceil((new Date(d) - new Date()) / 86400000); }
function fmtDate(d) { return new Date(d).toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" }); }

const INIT_LICENCIAS = [
  { id: 1, empresa_id: "demo-1", empresa: "Aluminios El Cibao SRL", contacto: "Rafael Núñez", email: "rnunez@elcibao.do", tel: "809-555-1111", ciudad: "Santiago", plan: "Pro", planCustom: "", precioCustom: 0, estado: "Activo", producto: "sistema", key: genLicKey(), device: "MacBook Pro · Chrome 124", device_locked: true, vencimiento: "2026-08-15", meses: 1, usuarios: 2, maxUsuarios: 3, pagos: [{ fecha: "2025-05-15", monto: 2490, metodo: "Transferencia", ref: "TRF-001" }], notas: "Cliente fundador · descuento 20%", created: "2025-03-01", modulos_activos: ["calculadoras", "clientes", "presupuestos", "ordenes"] },
  { id: 2, empresa_id: "demo-2", empresa: "Ventanas & Persianas Pérez", contacto: "Carmen Pérez", email: "carmen@vp.do", tel: "829-555-2222", ciudad: "Sto. Domingo", plan: "Básico", planCustom: "", precioCustom: 0, estado: "Activo", producto: "field", key: genLicKey(), device: "—", device_locked: false, vencimiento: "2026-07-01", meses: 1, usuarios: 1, maxUsuarios: 1, pagos: [{ fecha: "2025-06-01", monto: 990, metodo: "Efectivo", ref: "" }], notas: "", created: "2025-05-01", modulos_activos: ["calculadoras"] },
  { id: 3, empresa_id: "demo-3", empresa: "Constructora Moderna SRL", contacto: "Jorge Marte", email: "jmarte@cm.do", tel: "849-555-3333", ciudad: "Punta Cana", plan: "Empresarial", planCustom: "", precioCustom: 0, estado: "Activo", producto: "ambos", key: genLicKey(), device: "Dell XPS · Chrome 124", device_locked: true, vencimiento: "2027-01-10", meses: 12, usuarios: 5, maxUsuarios: 999, pagos: [{ fecha: "2025-01-10", monto: 4990, metodo: "Transferencia", ref: "TRF-100" }], notas: "Pago anual", created: "2025-01-10", modulos_activos: ["calculadoras", "clientes", "presupuestos", "facturacion", "ordenes", "proveedores", "inventario", "precios"] },
  { id: 4, empresa_id: "demo-4", empresa: "Taller Aluminio Díaz", contacto: "Pedro Díaz", email: "pedro@tad.do", tel: "809-555-4444", ciudad: "La Romana", plan: "Básico", planCustom: "", precioCustom: 0, estado: "Suspendido", producto: "sistema", key: genLicKey(), device: "—", device_locked: false, vencimiento: "2025-05-01", meses: 1, usuarios: 0, maxUsuarios: 1, pagos: [{ fecha: "2025-04-01", monto: 990, metodo: "Efectivo", ref: "" }], notas: "Suspendido por mora", created: "2025-04-01", modulos_activos: [] },
];

// ── Module Activation Panel ─────────────────────────────────────────────────
function ModulosPanel({ empresaId, modulosActivos, onSave, onClose }) {
  const [selected, setSelected] = useState(new Set(modulosActivos));
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const byCategory = getModulesByCategory();

  function toggle(id) {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  async function save() {
    setErr(""); setLoading(true);
    try {
      const modulosArray = [...selected];
      await updateModulosEmpresa(empresaId, modulosArray);
      onSave(modulosArray);
      onClose();
    } catch (e) {
      // If this is a demo company, just save locally
      onSave([...selected]);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-bd" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-hdr">
          <div className="modal-ttl">🔧 Módulos Activos</div>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-bdy">
          <div style={{ background: "var(--pri-lt)", borderRadius: "var(--r-sm)", padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "var(--pri-dk)" }}>
            Activa o desactiva módulos individualmente para esta empresa. Los cambios se reflejan al próximo inicio de sesión del cliente.
          </div>
          {Object.entries(byCategory).filter(([cat]) => !["Administración"].includes(cat)).map(([cat, mods]) => (
            <div key={cat} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--on-sur3)", marginBottom: 8 }}>{cat}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {mods.map(m => (
                  <div key={m.id} onClick={() => toggle(m.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: "var(--r-sm)", border: `1.5px solid ${selected.has(m.id) ? "var(--pri)" : "var(--out)"}`, background: selected.has(m.id) ? "var(--pri-lt)" : "var(--sur)", cursor: "pointer", transition: "all .15s" }}>
                    <div style={{ fontSize: 18 }}>{m.icono}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: selected.has(m.id) ? "var(--pri)" : "var(--on-sur)" }}>{m.nombre}</div>
                      <div style={{ fontSize: 11, color: "var(--on-sur3)", marginTop: 1 }}>{m.descripcion}</div>
                    </div>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${selected.has(m.id) ? "var(--pri)" : "var(--out)"}`, background: selected.has(m.id) ? "var(--pri)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {selected.has(m.id) && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {err && <div style={{ color: "var(--err)", fontSize: 13 }}>{err}</div>}
        </div>
        <div className="modal-ftr">
          <div style={{ fontSize: 12, color: "var(--on-sur3)" }}>{selected.size} módulo(s) activo(s)</div>
          <button className="btn btn-text" onClick={onClose}>Cancelar</button>
          <button className="btn btn-filled" onClick={save} disabled={loading}>{loading ? "Guardando..." : "Guardar"}</button>
        </div>
      </div>
    </div>
  );
}

export default function Licencias() {
  const [lista, setLista] = useState(INIT_LICENCIAS);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("todas");
  const [modal, setModal] = useState(null);
  const [sel, setSel] = useState(null);
  const [modulosModal, setModulosModal] = useState(null);
  const [pagoForm, setPagoForm] = useState({ fecha: new Date().toISOString().slice(0, 10), monto: "", metodo: "Transferencia", ref: "" });
  const [renovarMeses, setRenovarMeses] = useState(1);
  const [newForm, setNewForm] = useState({ empresa: "", contacto: "", email: "", tel: "", ciudad: "", plan: "Pro", planCustom: "", precioCustom: 0, meses: 1, notas: "" });
  const nf = k => e => setNewForm(f => ({ ...f, [k]: e.target.value }));

  const tabs = [["todas", "Todas"], ["Activo", "Activas"], ["Suspendido", "Suspendidas"], ["vence", "Vencen pronto"]];
  const filtered = lista.filter(l => {
    const m = l.empresa.toLowerCase().includes(q.toLowerCase()) || l.contacto.toLowerCase().includes(q.toLowerCase());
    if (tab === "Activo") return m && l.estado === "Activo";
    if (tab === "Suspendido") return m && l.estado === "Suspendido";
    if (tab === "vence") return m && l.estado === "Activo" && daysLeft(l.vencimiento) <= 30;
    return m;
  });

  const activas = lista.filter(l => l.estado === "Activo").length;
  const vencen = lista.filter(l => l.estado === "Activo" && daysLeft(l.vencimiento) <= 30).length;
  const mrr = lista.filter(l => l.estado === "Activo").reduce((s, l) => {
    const p = PLANES_FIJOS.find(p => p.nombre === l.plan);
    return s + (l.plan === "Personalizado" ? l.precioCustom : (p?.precio || 0));
  }, 0);

  function planPrecio(l) {
    if (l.plan === "Personalizado") return l.precioCustom;
    return PLANES_FIJOS.find(p => p.nombre === l.plan)?.precio || 0;
  }
  function toggle(l) { setLista(ls => ls.map(x => x.id === l.id ? { ...x, estado: x.estado === "Activo" ? "Suspendido" : "Activo" } : x)); }
  function regenKey(id) { setLista(ls => ls.map(x => x.id === id ? { ...x, key: genLicKey(), device: "—" } : x)); }

  function releaseDevice(id) {
    if (!confirm("¿Liberar el dispositivo de esta empresa? El cliente podrá activar en un dispositivo nuevo.")) return;
    setLista(ls => ls.map(x => x.id === id ? { ...x, device: "—", device_locked: false } : x));
    // In production this calls: apiPut("/api/empresa/device/release", { empresa_id })
  }

  function setProducto(id, producto) {
    setLista(ls => ls.map(x => x.id === id ? { ...x, producto } : x));
    // In production: apiPut("/api/empresa/producto", { empresa_id, producto })
  }
  function renovar() {
    const base = sel && daysLeft(sel.vencimiento) > 0 ? sel.vencimiento : new Date().toISOString().slice(0, 10);
    const d = new Date(base); d.setMonth(d.getMonth() + renovarMeses);
    const monto = planPrecio(sel) * renovarMeses;
    setLista(ls => ls.map(x => x.id === sel.id ? { ...x, vencimiento: d.toISOString().slice(0, 10), estado: "Activo", pagos: [{ fecha: new Date().toISOString().slice(0, 10), monto, metodo: "Transferencia", ref: "" }, ...x.pagos] } : x));
    setModal(null);
  }
  function registrarPago() {
    if (!pagoForm.monto) return;
    setLista(ls => ls.map(x => x.id === sel.id ? { ...x, pagos: [{ ...pagoForm, monto: parseFloat(pagoForm.monto) }, ...x.pagos] } : x));
    setModal(null);
  }
  function crearLicencia() {
    if (!newForm.empresa.trim()) return;
    const plan = PLANES_FIJOS.find(p => p.nombre === newForm.plan);
    const d = new Date(); d.setMonth(d.getMonth() + parseInt(newForm.meses));
    setLista(ls => [...ls, { ...newForm, id: Date.now(), empresa_id: `demo-${Date.now()}`, key: genLicKey(), device: "—", estado: "Activo", usuarios: 0, maxUsuarios: newForm.plan === "Personalizado" ? 3 : (plan?.usuarios || 1), precioCustom: parseFloat(newForm.precioCustom) || 0, vencimiento: d.toISOString().slice(0, 10), pagos: [], created: new Date().toISOString().slice(0, 10), modulos_activos: [] }]);
    setModal(null);
    setNewForm({ empresa: "", contacto: "", email: "", tel: "", ciudad: "", plan: "Pro", planCustom: "", precioCustom: 0, meses: 1, notas: "" });
  }

  const dColor = l => { const d = daysLeft(l.vencimiento); return d < 0 ? "var(--err)" : d <= 14 ? "var(--warn)" : d <= 30 ? "#e37400" : "var(--on-sur3)"; };
  const dLabel = l => { const d = daysLeft(l.vencimiento); return d < 0 ? `Vencido ${Math.abs(d)}d` : d <= 30 ? `⚠ ${d} días` : `${d} días`; };
  const planColor = p => p === "Empresarial" ? "chip-filled-warn" : p === "Pro" ? "chip-filled-pri" : p === "Personalizado" ? "chip-filled-sec" : "chip";
  const productoLabel = p => p === "ambos" ? "Sistema + Field" : p === "field" ? "Field App" : "Sistema";
  const productoColor = p => p === "ambos" ? "chip-filled-warn" : p === "field" ? "chip-filled-sec" : "chip-filled-pri";

  return (
    <div>
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {[
          { l: "Licencias Activas", n: activas, s: `de ${lista.length} totales`, i: "🔑", bg: "var(--sec-lt)" },
          { l: "MRR", n: `RD$${mrr.toLocaleString()}`, s: "ingresos mensuales", i: "💰", bg: "var(--pri-lt)" },
          { l: "ARR Proyectado", n: `RD$${(mrr * 12).toLocaleString()}`, s: "ingresos anuales", i: "📈", bg: "var(--sur3)" },
          { l: "Vencen Pronto", n: vencen, s: "próximos 30 días", i: "⏰", bg: vencen > 0 ? "#fef7e0" : "var(--sec-lt)" },
        ].map(s => (
          <div key={s.l} className="stat-card">
            <div className="stat-icon-wrap" style={{ background: s.bg }}>{s.i}</div>
            <div className="stat-num" style={{ fontSize: s.l === "MRR" || s.l === "ARR Proyectado" ? 16 : 28 }}>{s.n}</div>
            <div className="stat-lbl">{s.l}</div>
            <div style={{ fontSize: 11, color: "var(--on-sur3)", marginTop: 4 }}>{s.s}</div>
          </div>
        ))}
      </div>

      {vencen > 0 && <div style={{ background: "#fef7e0", border: "1px solid #f9ab00", borderRadius: "var(--r-sm)", padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#92400e", display: "flex", alignItems: "center", gap: 10 }}>⚠ <b>{vencen} licencia(s)</b> vencen en los próximos 30 días.</div>}

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <div className="sbar"><span style={{ color: "var(--on-sur4)" }}>🔍</span><input placeholder="Buscar empresa, contacto..." value={q} onChange={e => setQ(e.target.value)} /></div>
        <button className="btn btn-filled" onClick={() => setModal("new")}>＋ Nueva Licencia</button>
      </div>

      <div className="seg-tabs">{tabs.map(([v, l]) => (<button key={v} className={"seg-tab" + (tab === v ? " on" : "")} onClick={() => setTab(v)}>{l}</button>))}</div>

      <div className="card"><div className="twrap"><table>
        <thead><tr><th>Empresa</th><th>Plan</th><th>Producto</th><th>Estado</th><th>Vencimiento</th><th>Dispositivo</th><th>Módulos</th><th>MRR</th><th>Acciones</th></tr></thead>
        <tbody>
          {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: 48, color: "var(--on-sur4)" }}>Sin resultados</td></tr>}
          {filtered.map(l => (
            <tr key={l.id}>
              <td><div style={{ fontWeight: 600, cursor: "pointer" }} onClick={() => { setSel(l); setModal("detail"); }}>{l.empresa}</div><div style={{ fontSize: 11, color: "var(--on-sur3)", marginTop: 2 }}>{l.contacto} · {l.email}</div></td>
              <td><span className={`chip ${planColor(l.plan)}`}>{l.plan === "Personalizado" ? l.planCustom || "Custom" : l.plan}</span></td>
              <td>
                <select value={l.producto || "sistema"} onChange={e => setProducto(l.id, e.target.value)}
                  style={{ fontSize: 12, padding: "4px 8px", borderRadius: "var(--rfull)", border: "1px solid var(--out)", background: "var(--sur)", fontFamily: "inherit", cursor: "pointer", outline: "none" }}>
                  <option value="sistema">Sistema</option>
                  <option value="field">Field App</option>
                  <option value="ambos">Sistema + Field</option>
                </select>
              </td>
              <td><span className={`chip ${l.estado === "Activo" ? "chip-filled-sec" : "chip-filled-err"}`}>{l.estado}</span></td>
              <td><div className="mono" style={{ fontSize: 12, color: dColor(l) }}>{fmtDate(l.vencimiento)}</div><div style={{ fontSize: 11, color: dColor(l), fontWeight: 600 }}>{dLabel(l)}</div></td>
              <td>
                {l.device_locked ? (
                  <div>
                    <div style={{ fontSize: 11, color: "var(--on-sur3)", marginBottom: 4 }}>🔒 {l.device || "Registrado"}</div>
                    <button onClick={() => releaseDevice(l.id)}
                      style={{ fontSize: 11, padding: "3px 10px", background: "var(--err-lt)", color: "var(--err)", border: "1px solid #fad2cf", borderRadius: 20, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                      🔓 Liberar
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: "var(--on-sur4)" }}>Sin registrar</span>
                )}
              </td>
              <td>
                <button onClick={() => setModulosModal(l)} style={{ background: "var(--pri-lt)", color: "var(--pri)", border: "1px solid var(--pri-lt2)", borderRadius: 20, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 11, padding: "4px 10px" }}>
                  {l.modulos_activos?.length || 0} módulos
                </button>
              </td>
              <td><span className="mono" style={{ fontWeight: 600, color: "var(--sec)" }}>RD${planPrecio(l).toLocaleString()}</span></td>
              <td><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <button style={{ fontSize: 11, padding: "4px 8px", background: "var(--pri-lt)", color: "var(--pri)", border: "1px solid var(--pri-lt2)", borderRadius: 20, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }} onClick={() => { setSel(l); setModal("detail"); }}>Ver</button>
                <button style={{ fontSize: 11, padding: "4px 8px", background: "var(--sec-lt)", color: "var(--sec)", border: "1px solid #a8d5b5", borderRadius: 20, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }} onClick={() => { setSel(l); setRenovarMeses(1); setModal("renovar"); }}>Renovar</button>
                <button style={{ fontSize: 11, padding: "4px 8px", background: l.estado === "Activo" ? "#fce8e6" : "var(--sec-lt)", color: l.estado === "Activo" ? "var(--err)" : "var(--sec)", border: `1px solid ${l.estado === "Activo" ? "#fad2cf" : "#a8d5b5"}`, borderRadius: 20, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }} onClick={() => toggle(l)}>{l.estado === "Activo" ? "Suspender" : "Activar"}</button>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table></div></div>

      {/* MODULE ACTIVATION PANEL */}
      {modulosModal && (
        <ModulosPanel
          empresaId={modulosModal.empresa_id}
          modulosActivos={modulosModal.modulos_activos || []}
          onSave={(newMods) => setLista(ls => ls.map(x => x.id === modulosModal.id ? { ...x, modulos_activos: newMods } : x))}
          onClose={() => setModulosModal(null)}
        />
      )}

      {/* MODAL: NUEVA LICENCIA */}
      {modal === "new" && (
        <div className="modal-bd" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-hdr"><div className="modal-ttl">Nueva Licencia</div><button className="icon-btn" onClick={() => setModal(null)}>✕</button></div>
            <div className="modal-bdy"><div className="fgrid f2" style={{ gap: 13 }}>
              <div className="fld" style={{ gridColumn: "1/-1" }}><label>Empresa *</label><input value={newForm.empresa} onChange={nf("empresa")} placeholder="Aluminios del Norte SRL" /></div>
              <div className="fld"><label>Contacto</label><input value={newForm.contacto} onChange={nf("contacto")} /></div>
              <div className="fld"><label>Teléfono</label><input value={newForm.tel} onChange={nf("tel")} placeholder="809-000-0000" /></div>
              <div className="fld" style={{ gridColumn: "1/-1" }}><label>Email</label><input value={newForm.email} onChange={nf("email")} /></div>
              <div className="fld"><label>Ciudad</label><input value={newForm.ciudad} onChange={nf("ciudad")} /></div>
              <div className="fld"><label>Plan</label><select value={newForm.plan} onChange={nf("plan")}>{PLANES_FIJOS.map(p => <option key={p.id} value={p.nombre}>{p.nombre}{p.precio > 0 ? ` — RD$${p.precio}/mes` : ""}</option>)}</select></div>
              {newForm.plan === "Personalizado" && <>
                <div className="fld"><label>Nombre del Plan</label><input value={newForm.planCustom} onChange={nf("planCustom")} placeholder="Pro Especial" /></div>
                <div className="fld"><label>Precio/mes (RD$)</label><input type="number" value={newForm.precioCustom} onChange={nf("precioCustom")} /></div>
              </>}
              <div className="fld"><label>Meses iniciales</label><select value={newForm.meses} onChange={nf("meses")}>{[1, 2, 3, 6, 12].map(m => <option key={m} value={m}>{m} {m === 1 ? "mes" : "meses"}</option>)}</select></div>
              <div style={{ gridColumn: "1/-1", background: "var(--pri-lt)", borderRadius: "var(--r-sm)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontSize: 12, color: "var(--pri-dk)", fontWeight: 600 }}>{newForm.plan === "Personalizado" ? newForm.planCustom || "Personalizado" : newForm.plan}</div><div style={{ fontSize: 11, color: "var(--on-sur3)", marginTop: 2 }}>Vence: {new Date(addMonthsLic(parseInt(newForm.meses) || 1)).toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" })}</div></div>
                <div style={{ textAlign: "right" }}><div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 700, color: "var(--pri)" }}>RD${((newForm.plan === "Personalizado" ? parseFloat(newForm.precioCustom) || 0 : (PLANES_FIJOS.find(p => p.nombre === newForm.plan)?.precio || 0)) * (parseInt(newForm.meses) || 1)).toLocaleString()}</div><div style={{ fontSize: 10, color: "var(--on-sur3)" }}>Total a cobrar</div></div>
              </div>
              <div className="fld" style={{ gridColumn: "1/-1" }}><label>Notas</label><textarea value={newForm.notas} onChange={nf("notas")} style={{ background: "var(--sur2)", border: "1px solid var(--out)", borderRadius: "var(--r-sm)", padding: "8px 12px", fontFamily: "inherit", fontSize: 13, color: "var(--on-sur)", outline: "none", width: "100%", resize: "vertical", minHeight: 56 }} /></div>
            </div></div>
            <div className="modal-ftr"><button className="btn btn-text" onClick={() => setModal(null)}>Cancelar</button><button className="btn btn-filled" onClick={crearLicencia}>Generar Licencia</button></div>
          </div>
        </div>
      )}

      {/* MODAL: DETALLE */}
      {modal === "detail" && sel && (() => {
        const l = lista.find(x => x.id === sel.id) || sel;
        const precio = planPrecio(l);
        return (
          <div className="modal-bd" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
            <div className="modal" style={{ maxWidth: 600 }}>
              <div className="modal-hdr">
                <div><div className="modal-ttl">{l.empresa}</div><div style={{ fontSize: 12, color: "var(--on-sur3)", marginTop: 2 }}>{l.contacto} · {l.email}</div></div>
                <span className={`chip ${l.estado === "Activo" ? "chip-filled-sec" : "chip-filled-err"}`}>{l.estado}</span>
                <button className="icon-btn" onClick={() => setModal(null)}>✕</button>
              </div>
              <div className="modal-bdy">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                  {[["Plan", <span className={`chip ${planColor(l.plan)}`}>{l.plan === "Personalizado" ? l.planCustom || "Custom" : l.plan}</span>], ["MRR", <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: "var(--sec)" }}>RD${precio.toLocaleString()}</span>], ["Módulos activos", <span style={{ fontWeight: 700, color: "var(--pri)" }}>{l.modulos_activos?.length || 0}</span>], ["Vencimiento", <span className="mono" style={{ color: dColor(l), fontSize: 12 }}>{fmtDate(l.vencimiento)}</span>], ["Días restantes", <span style={{ color: dColor(l), fontWeight: 700 }}>{dLabel(l)}</span>], ["Desde", fmtDate(l.created)]].map(([k, v]) => (
                    <div key={k} style={{ background: "var(--sur2)", borderRadius: "var(--r-sm)", padding: "10px 14px" }}><div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--on-sur3)", marginBottom: 4 }}>{k}</div><div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div></div>
                  ))}
                </div>
                <button onClick={() => { setModal(null); setModulosModal(l); }} className="btn btn-outlined" style={{ width: "100%", marginBottom: 14 }}>🔧 Gestionar módulos activos ({l.modulos_activos?.length || 0} activos)</button>
                <div style={{ background: "var(--sur2)", border: "1px solid var(--out)", borderRadius: "var(--r-sm)", padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "var(--on-sur3)", marginBottom: 4 }}>Clave de Licencia</div><div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, color: "var(--pri)", letterSpacing: 2, fontWeight: 600 }}>{l.key}</div></div>
                  <button className="btn btn-sm btn-outlined" onClick={() => regenKey(l.id)}>🔄 Regenerar</button>
                </div>
                {l.notas && <div style={{ background: "#fef7e0", border: "1px solid #f9ab00", borderRadius: "var(--r-sm)", padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#92400e" }}>📝 {l.notas}</div>}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "var(--on-sur3)", marginBottom: 8 }}>Renovar</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{[1, 3, 6, 12].map(m => (<button key={m} className="btn btn-sm btn-outlined" onClick={() => { setSel(l); setRenovarMeses(m); setModal("renovar"); }}>+{m} {m === 1 ? "mes" : "meses"}</button>))}</div>
                </div>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "var(--on-sur3)", marginBottom: 8 }}>Historial de Pagos</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Fecha", "Monto", "Método", "Ref."].map(h => (<th key={h} style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "var(--on-sur3)", padding: "6px 10px", textAlign: "left", borderBottom: "1px solid var(--out)", background: "var(--sur2)" }}>{h}</th>))}</tr></thead>
                  <tbody>
                    {l.pagos.length === 0 && <tr><td colSpan={4} style={{ padding: "14px 10px", textAlign: "center", color: "var(--on-sur4)", fontSize: 12 }}>Sin pagos</td></tr>}
                    {l.pagos.map((p, i) => (<tr key={i}><td style={{ padding: "8px 10px", fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>{p.fecha}</td><td style={{ padding: "8px 10px", color: "var(--sec)", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>RD${parseFloat(p.monto).toLocaleString()}</td><td style={{ padding: "8px 10px", fontSize: 12 }}>{p.metodo}</td><td style={{ padding: "8px 10px", fontSize: 12, color: "var(--on-sur3)" }}>{p.ref || "—"}</td></tr>))}
                  </tbody>
                </table>
              </div>
              <div className="modal-ftr">
                <button className="btn btn-text" onClick={() => toggle(l)}>{l.estado === "Activo" ? "🔴 Suspender" : "🟢 Activar"}</button>
                <button className="btn btn-outlined" onClick={() => { setPagoForm({ fecha: new Date().toISOString().slice(0, 10), monto: precio, metodo: "Transferencia", ref: "" }); setModal("pago"); }}>💳 Pago</button>
                <button className="btn btn-filled" onClick={() => { setRenovarMeses(1); setModal("renovar"); }}>🔄 Renovar</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: RENOVAR */}
      {modal === "renovar" && sel && (
        <div className="modal-bd" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-hdr"><div className="modal-ttl">Renovar Licencia</div><button className="icon-btn" onClick={() => setModal(null)}>✕</button></div>
            <div className="modal-bdy">
              <div style={{ background: "var(--pri-lt)", borderRadius: "var(--r-sm)", padding: "12px 16px", marginBottom: 14 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{sel.empresa}</div><div style={{ fontSize: 12, color: "var(--on-sur3)", marginTop: 3 }}>Vence: {fmtDate(sel.vencimiento)} · {dLabel(sel)}</div></div>
              <div className="fgrid" style={{ gap: 12 }}>
                <div className="fld"><label>Meses a renovar</label><select value={renovarMeses} onChange={e => setRenovarMeses(parseInt(e.target.value))}>{[1, 2, 3, 6, 12].map(m => <option key={m} value={m}>{m} {m === 1 ? "mes" : "meses"}</option>)}</select></div>
                <div style={{ background: "var(--sec-lt)", borderRadius: "var(--r-sm)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div><div style={{ fontSize: 12, color: "var(--sec)", fontWeight: 600 }}>Total a cobrar</div></div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 20, fontWeight: 700, color: "var(--sec)" }}>RD${(planPrecio(sel) * renovarMeses).toLocaleString()}</div>
                </div>
              </div>
            </div>
            <div className="modal-ftr"><button className="btn btn-text" onClick={() => setModal(null)}>Cancelar</button><button className="btn btn-filled" style={{ background: "var(--sec)" }} onClick={renovar}>Confirmar Renovación</button></div>
          </div>
        </div>
      )}

      {/* MODAL: PAGO */}
      {modal === "pago" && sel && (
        <div className="modal-bd" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-hdr"><div className="modal-ttl">Registrar Pago</div><button className="icon-btn" onClick={() => setModal(null)}>✕</button></div>
            <div className="modal-bdy">
              <div style={{ background: "var(--sur2)", borderRadius: "var(--r-sm)", padding: "10px 14px", marginBottom: 14, fontSize: 13 }}><b>{sel.empresa}</b> · <span className={`chip ${planColor(sel.plan)}`}>{sel.plan}</span></div>
              <div className="fgrid f2" style={{ gap: 12 }}>
                <div className="fld"><label>Fecha</label><input type="date" value={pagoForm.fecha} onChange={e => setPagoForm(f => ({ ...f, fecha: e.target.value }))} /></div>
                <div className="fld"><label>Monto (RD$)</label><input type="number" value={pagoForm.monto} onChange={e => setPagoForm(f => ({ ...f, monto: e.target.value }))} /></div>
                <div className="fld"><label>Método</label><select value={pagoForm.metodo} onChange={e => setPagoForm(f => ({ ...f, metodo: e.target.value }))}><option>Transferencia</option><option>Efectivo</option><option>Tarjeta</option><option>Cheque</option></select></div>
                <div className="fld"><label>Referencia</label><input value={pagoForm.ref} onChange={e => setPagoForm(f => ({ ...f, ref: e.target.value }))} placeholder="TRF-XXX" /></div>
              </div>
            </div>
            <div className="modal-ftr"><button className="btn btn-text" onClick={() => setModal(null)}>Cancelar</button><button className="btn btn-filled" onClick={registrarPago}>Guardar Pago</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
