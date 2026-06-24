/**
 * COTIZACIONES — Módulo central de Ventaneros
 * 
 * 3 vistas en 1:
 *  1. Lista   — todas las cotizaciones, filtros, acciones rápidas
 *  2. Crear   — formulario completo con líneas, huecos, precios, beneficio
 *  3. Detalle — ver cotización + flujo: Aprobar → Producción → Facturar → PDF
 */
import { useState } from "react";
import { r2 } from "../../shared/helpers.js";
import { apiPost } from "../../api.js";
import { DC } from "../../shared/constants.js";
import { ModalEnviar, BtnWA } from "../../shared/Enviar.jsx";

const ITBIS = 0.18;

const TIPOS_VENTANA = [
  "Corrediza Tradicional", "Persiana Tipo A", "Persiana Tipo AA",
  "Corrediza P-65", "Corrediza P-92", "Puerta Comercial", "Puerta Residencial", "Otro",
];

const COLS = ["Natural", "Lacado Blanco", "Lacado Bronce", "Anodizado Bronce", "Madera", "Negro", "Oro"];

function newLinea() {
  return { id: Date.now() + Math.random(), tipo: "Corrediza Tradicional", ancho: "", alto: "", hojas: 2, cant: 1, color: "Natural", ubicacion: "", pie: 0, precio: 0 };
}

function calcPie(l) {
  const a = parseFloat(l.ancho) || 0;
  const h = parseFloat(l.alto) || 0;
  return a > 0 && h > 0 ? r2((a * h * (parseInt(l.cant) || 1)) / 144) : 0;
}

const DEMO = [
  { id: 1, numero: "COT-001", cliente: "Constructora Pérez & Asociados", rnc: "101-12345-6", tel: "809-555-1234", vendedor: "Mario Vuk", fecha: "2025-06-01", entrega: "2025-06-15", estado: "Aprobada", precioPie: 420, itbis: false, notas: "Segundo piso, sector norte", clausulas: "", lineas: [{ id: 1, tipo: "Corrediza Tradicional", ancho: "48", alto: "60", hojas: 2, cant: 4, color: "Natural", ubicacion: "Sala", pie: 80, precio: 33600 }, { id: 2, tipo: "Persiana Tipo A", ancho: "36", alto: "48", hojas: 1, cant: 6, color: "Natural", ubicacion: "Habitaciones", pie: 54, precio: 22680 }], produccion: "ORD-001", factura: null },
  { id: 2, numero: "COT-002", cliente: "Ferretería El Martillo", rnc: "102-56789-1", tel: "829-555-5678", vendedor: "Mario Vuk", fecha: "2025-06-05", entrega: "2025-06-20", estado: "Pendiente", precioPie: 380, itbis: true, notas: "", clausulas: "", lineas: [{ id: 3, tipo: "Corrediza P-65", ancho: "60", alto: "72", hojas: 2, cant: 2, color: "Lacado Bronce", ubicacion: "Entrada", pie: 50, precio: 19000 }], produccion: null, factura: null },
  { id: 3, numero: "COT-003", cliente: "María González", rnc: "", tel: "849-555-9012", vendedor: "Mario Vuk", fecha: "2025-06-08", entrega: "2025-06-25", estado: "Borrador", precioPie: 400, itbis: false, notas: "", clausulas: "", lineas: [{ id: 4, tipo: "Puerta Comercial", ancho: "36", alto: "84", hojas: 1, cant: 1, color: "Natural", ubicacion: "Principal", pie: 17.5, precio: 7000 }], produccion: null, factura: null },
  { id: 4, numero: "COT-004", cliente: "Inmobiliaria Vista Verde", rnc: "130-98765-4", tel: "809-555-3456", vendedor: "Mario Vuk", fecha: "2025-05-28", entrega: "2025-06-10", estado: "Rechazada", precioPie: 450, itbis: true, notas: "Cliente solicita descuento", clausulas: "", lineas: [{ id: 5, tipo: "Corrediza P-92", ancho: "72", alto: "84", hojas: 4, cant: 4, color: "Anodizado Bronce", ubicacion: "Fachada", pie: 168, precio: 75600 }], produccion: null, factura: null },
];

const ESTADO_CFG = {
  Borrador:   { cls: "chip",            label: "Borrador",   next: ["Pendiente", "Rechazada"] },
  Pendiente:  { cls: "chip-filled-warn", label: "Pendiente",  next: ["Aprobada", "Rechazada"] },
  Aprobada:   { cls: "chip-filled-sec", label: "Aprobada",   next: ["En Producción", "Facturada"] },
  "En Producción": { cls: "chip-filled-pri", label: "En Producción", next: ["Facturada"] },
  Facturada:  { cls: "chip-filled-sec", label: "Facturada",  next: [] },
  Rechazada:  { cls: "chip-filled-err", label: "Rechazada",  next: ["Pendiente"] },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function totals(cot) {
  const pie   = cot.lineas.reduce((s, l) => s + (l.pie || 0), 0);
  const sub   = r2(pie * (parseFloat(cot.precioPie) || 0));
  const itbis = cot.itbis ? r2(sub * ITBIS) : 0;
  return { pie: r2(pie), sub, itbis, total: r2(sub + itbis) };
}

function fmtRD(n) { return `RD$${Math.round(n).toLocaleString("es-DO")}`; }
function fmtDate(d) { return d ? new Date(d + "T12:00:00").toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" }) : "—"; }
function nextNum(lista) { return `COT-${String(lista.length + 1).padStart(3, "0")}`; }

// ── Empty form ────────────────────────────────────────────────────────────────
function emptyForm(num, lista) {
  return {
    id: null, numero: nextNum(lista), cliente: "", rnc: "", tel: "",
    vendedor: "Mario Vuk", fecha: new Date().toISOString().slice(0, 10),
    entrega: "", estado: "Borrador", precioPie: "", itbis: false,
    notas: "", clausulas: "", lineas: [newLinea()],
    produccion: null, factura: null,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function Cotizaciones({ onNav }) {
  const [lista, setLista]       = useState(DEMO);
  const [view, setView]         = useState("list");   // "list" | "form" | "detail"
  const [form, setForm]         = useState(null);
  const [sel, setSel]           = useState(null);
  const [q, setQ]               = useState("");
  const [filterEst, setFilterEst] = useState("todos");
  const [pdfLoad, setPdfLoad]   = useState(false);
  const [pdfErr, setPdfErr]     = useState("");
  const [toast, setToast]       = useState("");
  const [enviarModal, setEnviarModal] = useState(null);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2800); }

  // ── Navigation ──────────────────────────────────────────────────────────────
  function openNew() {
    setForm(emptyForm(nextNum(lista), lista));
    setPdfErr("");
    setView("form");
  }
  function openEdit(cot) {
    setForm({ ...cot, lineas: cot.lineas.map(l => ({ ...l })) });
    setPdfErr("");
    setView("form");
  }
  function openDetail(cot) {
    setSel(lista.find(x => x.id === cot.id) || cot);
    setView("detail");
  }
  function goList() { setView("list"); setForm(null); setSel(null); setPdfErr(""); }

  // ── Save ───────────────────────────────────────────────────────────────────
  function saveForm() {
    if (!form.cliente.trim()) return;
    // Recalculate line pies before saving
    const lineas = form.lineas.map(l => ({ ...l, pie: calcPie(l), precio: r2(calcPie(l) * (parseFloat(form.precioPie) || 0)) }));
    const cot = { ...form, lineas };
    if (cot.id) {
      setLista(ls => ls.map(x => x.id === cot.id ? cot : x));
      setSel(cot);
      setView("detail");
    } else {
      const nuevo = { ...cot, id: Date.now() };
      setLista(ls => [...ls, nuevo]);
      setSel(nuevo);
      setView("detail");
    }
    showToast("Cotización guardada ✓");
  }

  // ── Clone ──────────────────────────────────────────────────────────────────
  function copiar(cot) {
    const clone = { ...cot, id: null, numero: nextNum(lista), fecha: new Date().toISOString().slice(0, 10), estado: "Borrador", produccion: null, factura: null, lineas: cot.lineas.map(l => ({ ...l, id: Date.now() + Math.random() })) };
    setForm(clone);
    setView("form");
    showToast("Cotización copiada");
  }

  // ── Estado ─────────────────────────────────────────────────────────────────
  function cambiarEstado(id, est) {
    setLista(ls => ls.map(x => {
      if (x.id !== id) return x;
      const upd = { ...x, estado: est };
      if (est === "En Producción" && !x.produccion) upd.produccion = `ORD-${String(Math.floor(Math.random() * 900) + 100)}`;
      if (est === "Facturada"     && !x.factura)    upd.factura = `FAC-${String(Math.floor(Math.random() * 900) + 100)}`;
      return upd;
    }));
    setSel(s => {
      const upd = { ...s, estado: est };
      if (est === "En Producción" && !s.produccion) upd.produccion = `ORD-${String(Math.floor(Math.random() * 900) + 100)}`;
      if (est === "Facturada"     && !s.factura)    upd.factura = `FAC-${String(Math.floor(Math.random() * 900) + 100)}`;
      return upd;
    });
    showToast(`Estado → ${est}`);
  }

  // ── PDF ────────────────────────────────────────────────────────────────────
  async function descargarPDF(cot, tipo = "normal") {
    setPdfErr(""); setPdfLoad(true);
    try {
      const { sub, itbis, total } = totals(cot);
      const isFiscal = tipo === "fiscal";
      const res = await apiPost("/api/pdf/factura", {
        numero: cot.numero, tipo: isFiscal ? "fiscal" : "normal",
        ncf: isFiscal ? "B01-00000001" : null, serie: isFiscal ? "B01" : null,
        cliente: cot.cliente, rnc: cot.rnc || null,
        fecha: cot.fecha, vence: cot.entrega || "",
        items: cot.lineas.map(l => ({ desc: `${l.tipo} ${l.ancho}"×${l.alto}"${l.cant > 1 ? ` ×${l.cant}` : ""}${l.ubicacion ? " — " + l.ubicacion : ""}`, cant: 1, precio: l.precio, subtotal: l.precio })),
        subtotal: sub, itbis: isFiscal ? itbis : 0, total: isFiscal ? total : sub,
        notas: cot.notas || "", pagos: [],
        empresa: { nombre: "Ventaneros SRL", slogan: "Fabricación de Ventanas y Puertas de Aluminio", rnc: "1-31-12345-6", direccion: "Santo Domingo, R.D." },
      });
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${isFiscal ? "Factura" : "Cotizacion"}-${cot.numero}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("PDF descargado ✓");
    } catch (e) {
      setPdfErr(e.message || "No se pudo generar el PDF.");
    } finally {
      setPdfLoad(false);
    }
  }

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtradas = lista.filter(c => {
    const m = c.cliente.toLowerCase().includes(q.toLowerCase()) || c.numero.toLowerCase().includes(q.toLowerCase());
    return filterEst === "todos" ? m : m && c.estado === filterEst;
  });

  // Stats
  const aprobadas  = lista.filter(c => c.estado === "Aprobada").length;
  const pendientes = lista.filter(c => c.estado === "Pendiente").length;
  const enProd     = lista.filter(c => c.estado === "En Producción").length;
  const montoAprob = lista.filter(c => ["Aprobada", "En Producción", "Facturada"].includes(c.estado)).reduce((s, c) => s + totals(c).sub, 0);

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW: LIST
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "list") return (
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {[
          { l: "Aprobadas",       n: aprobadas,  i: "✅", bg: "var(--sec-lt)" },
          { l: "Pendientes",      n: pendientes, i: "⏳", bg: "#fef7e0" },
          { l: "En Producción",   n: enProd,     i: "🏭", bg: "var(--pri-lt)" },
          { l: "Monto Aprobado",  n: fmtRD(montoAprob), i: "💰", bg: "var(--sur3)" },
        ].map(s => (
          <div key={s.l} className="stat-card">
            <div className="stat-icon-wrap" style={{ background: s.bg }}>{s.i}</div>
            <div className="stat-num" style={{ fontSize: typeof s.n === "string" ? 16 : 28 }}>{s.n}</div>
            <div className="stat-lbl">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <div className="sbar">
          <span style={{ color: "var(--on-sur4)" }}>🔍</span>
          <input placeholder="Buscar por número o cliente..." value={q} onChange={e => setQ(e.target.value)} />
          {q && <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--on-sur4)", fontSize: 16 }} onClick={() => setQ("")}>✕</button>}
        </div>
        <select style={{ padding: "8px 14px", borderRadius: "var(--rfull)", border: "1px solid var(--out)", background: "var(--sur)", fontFamily: "inherit", fontSize: 13, cursor: "pointer", outline: "none" }}
          value={filterEst} onChange={e => setFilterEst(e.target.value)}>
          <option value="todos">Todos los estados</option>
          {Object.keys(ESTADO_CFG).map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <button className="btn btn-filled" onClick={openNew} style={{ marginLeft: "auto" }}>＋ Nueva Cotización</button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="twrap">
          <table>
            <thead>
              <tr>
                <th>Número</th><th>Cliente</th><th>Fecha</th><th>Entrega</th>
                <th>Pie²</th><th>Precio/Pie</th><th>Total</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: 52, color: "var(--on-sur4)" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                  {q ? "Sin resultados para tu búsqueda" : "Aún no hay cotizaciones"}
                </td></tr>
              )}
              {filtradas.map(c => {
                const { pie, sub, total } = totals(c);
                const ec = ESTADO_CFG[c.estado] || ESTADO_CFG["Borrador"];
                return (
                  <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => openDetail(c)}>
                    <td><span className="mono" style={{ fontWeight: 700, color: "var(--pri)" }}>{c.numero}</span></td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{c.cliente}</div>
                      {c.rnc && <div style={{ fontSize: 11, color: "var(--sec)" }}>RNC {c.rnc}</div>}
                    </td>
                    <td className="mono" style={{ fontSize: 12 }}>{fmtDate(c.fecha)}</td>
                    <td className="mono" style={{ fontSize: 12, color: c.entrega && c.entrega < new Date().toISOString().slice(0,10) && c.estado !== "Facturada" ? "var(--err)" : "var(--on-sur3)" }}>{fmtDate(c.entrega)}</td>
                    <td><span className="mono">{pie} ft²</span></td>
                    <td><span className="mono">{fmtRD(parseFloat(c.precioPie) || 0)}</span></td>
                    <td><span className="mono" style={{ fontWeight: 700 }}>{fmtRD(c.itbis ? total : sub)}</span></td>
                    <td><span className={`chip ${ec.cls}`}>{ec.label}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button className="btn-sm-ghost" onClick={() => openEdit(c)}>✏️</button>
                        <button className="btn-sm-ghost" onClick={() => copiar(c)}>📋</button>
                        <button className="btn-sm-ghost" onClick={() => descargarPDF(c)} title="PDF">⬇️</button>
                        {c.tel && <BtnWA tel={c.tel} mensaje={`Estimado/a *${c.cliente}*, adjunto la cotización *${c.numero}*. Por favor confirme si desea proceder. — Ventaneros SRL`}/>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <div className="toast-msg">{toast}</div>}
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW: FORM (crear / editar)
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "form" && form) {
    const sf = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
    const { pie: totalPie, sub, itbis, total } = totals({ ...form, precioPie: form.precioPie });

    function addLinea() { setForm(f => ({ ...f, lineas: [...f.lineas, newLinea()] })); }
    function removeLinea(id) { setForm(f => ({ ...f, lineas: f.lineas.filter(l => l.id !== id) })); }
    function updateLinea(id, k, v) {
      setForm(f => ({ ...f, lineas: f.lineas.map(l => l.id === id ? { ...l, [k]: v } : l) }));
    }

    return (
      <div>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <button className="btn btn-text" onClick={goList}>← Volver</button>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{form.id ? `Editar ${form.numero}` : "Nueva Cotización"}</div>
            <div style={{ fontSize: 12, color: "var(--on-sur3)", marginTop: 2 }}>Los precios se calculan automáticamente según el pie² ingresado</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
          {/* LEFT — main form */}
          <div>
            {/* Datos generales */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-hdr"><div className="card-ttl">Datos Generales</div></div>
              <div className="card-bdy">
                <div className="fgrid f2" style={{ gap: 14 }}>
                  <div className="fld" style={{ gridColumn: "1/-1" }}>
                    <label>Cliente *</label>
                    <input value={form.cliente} onChange={sf("cliente")} placeholder="Nombre o empresa" list="cli-list" />
                    <datalist id="cli-list">{DC.map(c => <option key={c.id} value={c.nombre} />)}</datalist>
                  </div>
                  <div className="fld"><label>RNC / Cédula</label><input value={form.rnc} onChange={sf("rnc")} placeholder="101-00000-0" /></div>
                  <div className="fld"><label>Teléfono</label><input value={form.tel} onChange={sf("tel")} placeholder="809-000-0000" /></div>
                  <div className="fld"><label>Fecha</label><input type="date" value={form.fecha} onChange={sf("fecha")} /></div>
                  <div className="fld"><label>Fecha de Entrega</label><input type="date" value={form.entrega} onChange={sf("entrega")} /></div>
                  <div className="fld"><label>Vendedor</label><input value={form.vendedor} onChange={sf("vendedor")} /></div>
                  <div className="fld"><label>Precio por pie² (RD$)</label><input type="number" min="0" value={form.precioPie} onChange={sf("precioPie")} placeholder="ej: 420" /></div>
                </div>
              </div>
            </div>

            {/* Líneas */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-hdr">
                <div className="card-ttl">Líneas de la Cotización</div>
                <button className="btn btn-sm btn-outlined" onClick={addLinea}>＋ Agregar línea</button>
              </div>
              <div className="card-bdy" style={{ padding: 0 }}>
                {form.lineas.map((l, i) => {
                  const pie = calcPie(l);
                  const precio = r2(pie * (parseFloat(form.precioPie) || 0));
                  return (
                    <div key={l.id} style={{ padding: "16px 20px", borderBottom: i < form.lineas.length - 1 ? "1px solid var(--out)" : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--pri)" }}>Línea {i + 1}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {pie > 0 && <span className="mono" style={{ color: "var(--sec)", fontWeight: 700, fontSize: 14 }}>{pie} ft² · {fmtRD(precio)}</span>}
                          {form.lineas.length > 1 && <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--err)", fontSize: 18 }} onClick={() => removeLinea(l.id)}>🗑</button>}
                        </div>
                      </div>
                      <div className="fgrid f2" style={{ gap: 12 }}>
                        <div className="fld" style={{ gridColumn: "1/-1" }}>
                          <label>Tipo de ventana / puerta</label>
                          <select value={l.tipo} onChange={e => updateLinea(l.id, "tipo", e.target.value)}>
                            {TIPOS_VENTANA.map(t => <option key={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="fld">
                          <label>Ancho (pulgadas)</label>
                          <input type="number" step="0.5" value={l.ancho} onChange={e => updateLinea(l.id, "ancho", e.target.value)} placeholder='48"' />
                        </div>
                        <div className="fld">
                          <label>Alto (pulgadas)</label>
                          <input type="number" step="0.5" value={l.alto} onChange={e => updateLinea(l.id, "alto", e.target.value)} placeholder='60"' />
                        </div>
                        <div className="fld">
                          <label>Hojas</label>
                          <select value={l.hojas} onChange={e => updateLinea(l.id, "hojas", e.target.value)}>
                            {[1,2,3,4,6].map(h => <option key={h} value={h}>{h} hoja{h > 1 ? "s" : ""}</option>)}
                          </select>
                        </div>
                        <div className="fld">
                          <label>Cantidad</label>
                          <input type="number" min="1" value={l.cant} onChange={e => updateLinea(l.id, "cant", e.target.value)} />
                        </div>
                        <div className="fld">
                          <label>Color / Material</label>
                          <select value={l.color} onChange={e => updateLinea(l.id, "color", e.target.value)}>
                            {COLS.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="fld">
                          <label>Ubicación / Hueco</label>
                          <input value={l.ubicacion} onChange={e => updateLinea(l.id, "ubicacion", e.target.value)} placeholder="Sala, Hab. 1, Baño..." />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notas */}
            <div className="card">
              <div className="card-hdr"><div className="card-ttl">Notas y Condiciones</div></div>
              <div className="card-bdy">
                <div className="fld"><label>Notas para el cliente</label>
                  <textarea value={form.notas} onChange={sf("notas")} placeholder="Condiciones de pago, tiempo de entrega, garantía..." style={{ background: "var(--sur2)", border: "1px solid var(--out)", borderRadius: "var(--r-sm)", padding: "9px 12px", fontFamily: "inherit", fontSize: 13, color: "var(--on-sur)", outline: "none", width: "100%", resize: "vertical", minHeight: 80 }} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — summary + actions */}
          <div style={{ position: "sticky", top: 80 }}>
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="card-hdr"><div className="card-ttl">Resumen</div></div>
              <div className="card-bdy">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    ["Líneas", form.lineas.length],
                    ["Pietaje total", `${totalPie} ft²`],
                    ["Precio por pie²", fmtRD(parseFloat(form.precioPie) || 0)],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "var(--on-sur3)" }}>{l}</span>
                      <span className="mono" style={{ fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ height: 1, background: "var(--out)", margin: "4px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--on-sur3)" }}>Subtotal</span>
                    <span className="mono" style={{ fontWeight: 600 }}>{fmtRD(sub)}</span>
                  </div>

                  {/* ITBIS toggle */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "var(--on-sur3)" }}>ITBIS 18%</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {form.itbis && <span className="mono" style={{ fontSize: 13, color: "var(--sec)" }}>{fmtRD(itbis)}</span>}
                      <button
                        onClick={() => setForm(f => ({ ...f, itbis: !f.itbis }))}
                        style={{ width: 44, height: 24, borderRadius: 12, background: form.itbis ? "var(--sec)" : "var(--sur3)", border: "none", cursor: "pointer", position: "relative", transition: "background .2s" }}>
                        <span style={{ position: "absolute", top: 2, left: form.itbis ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid var(--out)", fontSize: 16, fontWeight: 700 }}>
                    <span>Total</span>
                    <span className="mono" style={{ color: "var(--pri)" }}>{fmtRD(form.itbis ? total : sub)}</span>
                  </div>

                  {/* Benefit indicator */}
                  {parseFloat(form.precioPie) > 0 && (
                    <div style={{ background: "var(--sec-lt)", borderRadius: "var(--r-sm)", padding: "10px 12px", fontSize: 12 }}>
                      <div style={{ color: "var(--sec)", fontWeight: 600, marginBottom: 2 }}>Precio configurado</div>
                      <div style={{ color: "var(--on-sur3)" }}>RD${form.precioPie}/pie² · {totalPie} ft²</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button className="btn btn-filled" style={{ width: "100%", marginBottom: 8 }} onClick={saveForm} disabled={!form.cliente.trim()}>
              {form.id ? "Guardar cambios" : "Crear Cotización"}
            </button>
            <button className="btn btn-text" style={{ width: "100%" }} onClick={goList}>Cancelar</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW: DETAIL
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "detail" && sel) {
    const cot = lista.find(x => x.id === sel.id) || sel;
    const { pie, sub, itbis, total } = totals(cot);
    const ec = ESTADO_CFG[cot.estado] || ESTADO_CFG["Borrador"];

    return (
      <div>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
          <button className="btn btn-text" onClick={goList}>← Cotizaciones</button>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 22, fontWeight: 700 }}>{cot.numero}</span>
              <span className={`chip ${ec.cls}`}>{ec.label}</span>
              {cot.produccion && <span className="chip chip-filled-pri">🏭 {cot.produccion}</span>}
              {cot.factura    && <span className="chip chip-filled-sec">🧾 {cot.factura}</span>}
            </div>
            <div style={{ fontSize: 13, color: "var(--on-sur3)", marginTop: 4 }}>{cot.cliente}{cot.rnc ? ` · RNC: ${cot.rnc}` : ""} · {cot.tel}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-outlined" onClick={() => openEdit(cot)}>✏️ Editar</button>
            <button className="btn btn-outlined" onClick={() => copiar(cot)}>📋 Copiar</button>
            <button className="btn btn-outlined" onClick={() => descargarPDF(cot, "normal")} disabled={pdfLoad}>⬇ PDF</button>
            <button className="btn btn-outlined" style={{ background:"#f0fdf4", borderColor:"#25D366", color:"#16a34a" }} onClick={() => setEnviarModal(cot)}>📤 Enviar</button>
            <button className="btn btn-filled" style={{ background: "var(--sec)" }} onClick={() => descargarPDF(cot, "fiscal")} disabled={pdfLoad}>🏛️ Fiscal</button>
          </div>
        </div>

        {/* Flow bar — estado visual */}
        <div style={{ background: "var(--sur)", border: "1px solid var(--out)", borderRadius: "var(--r-md)", padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 0, overflow: "auto" }}>
          {["Borrador", "Pendiente", "Aprobada", "En Producción", "Facturada"].map((e, i, arr) => {
            const done  = ["Aprobada", "En Producción", "Facturada"].includes(cot.estado) && i <= arr.indexOf(cot.estado);
            const activ = cot.estado === e;
            const canGo = ec.next.includes(e);
            return (
              <div key={e} style={{ display: "flex", alignItems: "center", flex: i < arr.length - 1 ? "1" : "0" }}>
                <div
                  onClick={() => canGo && cambiarEstado(cot.id, e)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: canGo ? "pointer" : "default", minWidth: 80 }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: activ ? "var(--pri)" : done ? "var(--sec)" : canGo ? "var(--pri-lt)" : "var(--sur3)", border: `2px solid ${activ ? "var(--pri)" : done ? "var(--sec)" : canGo ? "var(--pri)" : "var(--out)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: activ || done ? "#fff" : canGo ? "var(--pri)" : "var(--on-sur4)", transition: "all .2s" }}>
                    {done && !activ ? "✓" : i + 1}
                  </div>
                  <div style={{ fontSize: 11, marginTop: 4, fontWeight: activ ? 700 : 400, color: activ ? "var(--pri)" : done ? "var(--sec)" : canGo ? "var(--pri)" : "var(--on-sur4)", textAlign: "center", whiteSpace: "nowrap" }}>{e}</div>
                </div>
                {i < arr.length - 1 && <div style={{ flex: 1, height: 2, background: done ? "var(--sec)" : "var(--out)", margin: "0 4px", marginBottom: 16 }} />}
              </div>
            );
          })}
        </div>

        {pdfErr && <div style={{ background: "var(--err-lt)", color: "var(--err)", padding: "10px 16px", borderRadius: "var(--r-sm)", marginBottom: 16, fontSize: 13 }}>{pdfErr}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>
          {/* LEFT */}
          <div>
            {/* Líneas */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-hdr"><div className="card-ttl">Líneas ({cot.lineas.length})</div><div style={{ fontSize: 13, color: "var(--on-sur3)" }}>Total {pie} ft²</div></div>
              <div className="twrap">
                <table>
                  <thead><tr><th>#</th><th>Tipo</th><th>Medida</th><th>Color</th><th>Cant.</th><th>Ubicación</th><th>Pie²</th><th>Precio</th></tr></thead>
                  <tbody>
                    {cot.lineas.map((l, i) => {
                      const lPie = calcPie(l);
                      const lPrecio = r2(lPie * (parseFloat(cot.precioPie) || 0));
                      return (
                        <tr key={l.id}>
                          <td style={{ color: "var(--on-sur4)", fontSize: 12 }}>{i + 1}</td>
                          <td style={{ fontWeight: 500 }}>{l.tipo}</td>
                          <td><span className="mono">{l.ancho}"×{l.alto}"</span> <span style={{ color: "var(--on-sur3)", fontSize: 11 }}>{l.hojas}H</span></td>
                          <td style={{ fontSize: 12, color: "var(--on-sur3)" }}>{l.color}</td>
                          <td style={{ textAlign: "center" }}>×{l.cant}</td>
                          <td style={{ fontSize: 12, color: "var(--on-sur3)" }}>{l.ubicacion || "—"}</td>
                          <td><span className="mono">{lPie}</span></td>
                          <td><span className="mono" style={{ fontWeight: 600, color: "var(--pri)" }}>{fmtRD(lPrecio)}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notas */}
            {cot.notas && (
              <div className="card">
                <div className="card-hdr"><div className="card-ttl">Notas</div></div>
                <div className="card-bdy">
                  <div style={{ fontSize: 14, color: "var(--on-sur2)", lineHeight: 1.7 }}>{cot.notas}</div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — summary */}
          <div>
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="card-hdr"><div className="card-ttl">Totales</div></div>
              <div className="card-bdy">
                {[
                  ["Fecha", fmtDate(cot.fecha)],
                  ["Entrega", fmtDate(cot.entrega)],
                  ["Vendedor", cot.vendedor || "—"],
                  ["Precio/pie²", fmtRD(parseFloat(cot.precioPie) || 0)],
                  ["Pietaje", `${pie} ft²`],
                  ["Subtotal", fmtRD(sub)],
                  ...(cot.itbis ? [["ITBIS 18%", fmtRD(itbis)]] : []),
                ].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--out)", fontSize: 13 }}>
                    <span style={{ color: "var(--on-sur3)" }}>{l}</span>
                    <span className="mono" style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: 17, fontWeight: 700 }}>
                  <span>TOTAL</span>
                  <span className="mono" style={{ color: "var(--pri)" }}>{fmtRD(cot.itbis ? total : sub)}</span>
                </div>
              </div>
            </div>

            {/* Next action button */}
            {ec.next.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ec.next.map(nx => (
                  <button key={nx} className="btn btn-filled btn-full" style={{ background: nx === "Aprobada" ? "var(--sec)" : nx === "En Producción" ? "var(--pri)" : nx === "Facturada" ? "#7c3aed" : "var(--pri)" }} onClick={() => cambiarEstado(cot.id, nx)}>
                    {nx === "Aprobada"       && "✅ Aprobar Cotización"}
                    {nx === "En Producción"  && "🏭 Enviar a Producción"}
                    {nx === "Facturada"      && "🧾 Marcar como Facturada"}
                    {nx === "Pendiente"      && "↩ Volver a Pendiente"}
                    {nx === "Rechazada"      && "❌ Rechazar"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {toast && <div className="toast-msg">{toast}</div>}
        {enviarModal && <ModalEnviar data={{ tipo:"cotizacion", numero:enviarModal.numero, cliente:enviarModal.cliente, tel:(enviarModal.tel||"").replace(/\D/g,""), email:"", monto:`RD$${Math.round(totals(enviarModal).sub).toLocaleString("es-DO")}`, empresa:"Ventaneros SRL", telEmpresa:"8095550001" }} onClose={()=>setEnviarModal(null)}/>}
      </div>
    );
  }

  return null;
}
