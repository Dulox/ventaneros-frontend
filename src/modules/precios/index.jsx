import { useState } from "react";
import { r2 } from "../../shared/helpers.js";

const CATEGORIAS_ALM = ["Perfiles de Marco", "Perfiles de Hoja", "Rieles", "Vidrios", "Herrajes", "Accesorios", "Otros"];
const UNIDADES_ALM = ["Barra (20 pie)", "Barra (21 pie)", "Unidad", "Pie lineal", "Pie²", "Rollo", "Caja"];

const INIT_PRECIOS = [
  { id: 1, codigo: "GK-40", nombre: "Lateral Marco Corrediza GK-40", categoria: "Perfiles de Marco", unidad: "Barra (20 pie)", pie_barra: 20, costo_barra: 720, costo_pie: 36, venta_barra: 950, venta_pie: 47.5, material: "Natural" },
  { id: 2, codigo: "GK-44", nombre: "Cabezal Marco GK-44", categoria: "Perfiles de Marco", unidad: "Barra (20 pie)", pie_barra: 20, costo_barra: 680, costo_pie: 34, venta_barra: 900, venta_pie: 45, material: "Natural" },
  { id: 3, codigo: "GK-37", nombre: "Cabezal Hoja GK-37", categoria: "Perfiles de Hoja", unidad: "Barra (20 pie)", pie_barra: 20, costo_barra: 650, costo_pie: 32.5, venta_barra: 860, venta_pie: 43, material: "Natural" },
  { id: 4, codigo: "GK-48", nombre: "Lateral Marco Puerta GK-48", categoria: "Perfiles de Marco", unidad: "Barra (20 pie)", pie_barra: 20, costo_barra: 850, costo_pie: 42.5, venta_barra: 1100, venta_pie: 55, material: "Natural" },
  { id: 5, codigo: "ALD-601", nombre: "Riel Marco Ext. P-65 ALD-601", categoria: "Rieles", unidad: "Barra (20 pie)", pie_barra: 20, costo_barra: 1100, costo_pie: 55, venta_barra: 1420, venta_pie: 71, material: "Natural" },
  { id: 6, codigo: "ALD-900", nombre: "Riel Marco P-92 ALD-900", categoria: "Rieles", unidad: "Barra (20 pie)", pie_barra: 20, costo_barra: 1250, costo_pie: 62.5, venta_barra: 1600, venta_pie: 80, material: "Natural" },
  { id: 7, codigo: "VID-NAT", nombre: "Vidrio Natural Transparente", categoria: "Vidrios", unidad: "Pie²", pie_barra: 1, costo_barra: 45, costo_pie: 45, venta_barra: 75, venta_pie: 75, material: "—" },
  { id: 8, codigo: "VID-BCE", nombre: "Vidrio Bronce liso", categoria: "Vidrios", unidad: "Pie²", pie_barra: 1, costo_barra: 55, costo_pie: 55, venta_barra: 85, venta_pie: 85, material: "—" },
  { id: 9, codigo: "RUE-01", nombre: "Ruedas Corrediza", categoria: "Herrajes", unidad: "Unidad", pie_barra: 1, costo_barra: 85, costo_pie: 85, venta_barra: 130, venta_pie: 130, material: "—" },
  { id: 10, codigo: "GOM-01", nombre: "Goma de Sello", categoria: "Accesorios", unidad: "Pie lineal", pie_barra: 1, costo_barra: 18, costo_pie: 18, venta_barra: 28, venta_pie: 28, material: "—" },
  { id: 11, codigo: "PIV-01", nombre: "Pivot para Puerta", categoria: "Herrajes", unidad: "Unidad", pie_barra: 1, costo_barra: 380, costo_pie: 380, venta_barra: 580, venta_pie: 580, material: "—" },
  { id: 12, codigo: "FEL-01", nombre: "Felpa de Sello", categoria: "Accesorios", unidad: "Pie lineal", pie_barra: 1, costo_barra: 16, costo_pie: 16, venta_barra: 25, venta_pie: 25, material: "—" },
];

export default function Precios() {
  const [lista, setLista] = useState(INIT_PRECIOS);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("todas");
  const [tab, setTab] = useState("lista");
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [simPietaje, setSimPietaje] = useState(100);
  const [simMargen, setSimMargen] = useState(35);
  const [simPrecioFijo, setSimPrecioFijo] = useState(450);
  const [simMetodo, setSimMetodo] = useState("margen");

  const emptyForm = { codigo: "", nombre: "", categoria: "Perfiles de Marco", unidad: "Barra (20 pie)", pie_barra: 20, costo_barra: 0, costo_pie: 0, venta_barra: 0, venta_pie: 0, material: "Natural" };
  const [form, setForm] = useState(emptyForm);
  const sf = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const filtered = lista.filter(m => {
    const mq = m.nombre.toLowerCase().includes(q.toLowerCase()) || m.codigo.toLowerCase().includes(q.toLowerCase());
    return cat === "todas" ? mq : mq && m.categoria === cat;
  });

  function openNew() { setEdit(null); setForm(emptyForm); setModal(true); }
  function openEdit(m) { setEdit(m); setForm({ ...m }); setModal(true); }
  function save() {
    if (!form.nombre.trim()) return;
    const n = {
      ...form,
      pie_barra: parseFloat(form.pie_barra) || 20,
      costo_barra: parseFloat(form.costo_barra) || 0,
      costo_pie: parseFloat(form.costo_pie) || 0,
      venta_barra: parseFloat(form.venta_barra) || 0,
      venta_pie: parseFloat(form.venta_pie) || 0,
    };
    if (!n.costo_pie && n.costo_barra) n.costo_pie = r2(n.costo_barra / n.pie_barra);
    if (!n.venta_pie && n.venta_barra) n.venta_pie = r2(n.venta_barra / n.pie_barra);
    if (edit) setLista(l => l.map(x => x.id === edit.id ? { ...x, ...n } : x));
    else setLista(l => [...l, { ...n, id: Date.now() }]);
    setModal(false);
  }

  const avgCostoPie = r2(lista.filter(m => m.categoria.includes("Perf")).reduce((s, m) => s + m.costo_pie, 0) / lista.filter(m => m.categoria.includes("Perf")).length);
  const costoSim = r2(simPietaje * avgCostoPie * 0.8);
  const ventaSim = simMetodo === "margen" ? r2(costoSim * (1 + simMargen / 100)) : simMetodo === "pietaje" ? r2(simPietaje * simPrecioFijo) : r2(costoSim * 1.4);
  const gananciaSim = r2(ventaSim - costoSim);
  const margenSim = costoSim > 0 ? r2((gananciaSim / costoSim) * 100) : 0;

  const margenColor = m => m >= 40 ? "var(--sec)" : m >= 25 ? "var(--warn)" : "var(--err)";

  return (
    <div>
      <div className="seg-tabs" style={{ marginBottom: 20 }}>
        {[["lista", "Lista de Precios"], ["simulador", "Simulador de Ganancias"]].map(([v, l]) => (
          <button key={v} className={"seg-tab" + (tab === v ? " on" : "")} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {tab === "lista" && (
        <div>
          <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 20 }}>
            {[
              { l: "Materiales", n: lista.length, i: "📦", bg: "var(--sur3)" },
              { l: "Margen Promedio", n: r2(lista.reduce((s, m) => s + (m.venta_pie - m.costo_pie) / m.costo_pie * 100, 0) / lista.length) + "%", i: "📈", bg: "var(--sec-lt)" },
              { l: "Costo Promedio/Pie", n: "RD$" + r2(lista.reduce((s, m) => s + m.costo_pie, 0) / lista.length), i: "💸", bg: "#fce8e6" },
              { l: "Venta Promedio/Pie", n: "RD$" + r2(lista.reduce((s, m) => s + m.venta_pie, 0) / lista.length), i: "💰", bg: "var(--pri-lt)" },
            ].map(s => (
              <div key={s.l} className="stat-card">
                <div className="stat-icon-wrap" style={{ background: s.bg }}>{s.i}</div>
                <div className="stat-num" style={{ fontSize: 20 }}>{s.n}</div>
                <div className="stat-lbl">{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
            <div className="sbar"><span style={{ color: "var(--on-sur4)" }}>🔍</span><input placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)} /></div>
            <select style={{ padding: "8px 14px", borderRadius: "var(--rfull)", border: "1px solid var(--out)", background: "var(--sur)", fontFamily: "inherit", fontSize: 13, color: "var(--on-sur)", cursor: "pointer", outline: "none" }} value={cat} onChange={e => setCat(e.target.value)}>
              <option value="todas">Todas</option>
              {CATEGORIAS_ALM.map(c => <option key={c}>{c}</option>)}
            </select>
            <button className="btn btn-filled" onClick={openNew}>＋ Nuevo Material</button>
          </div>
          <div className="card">
            <div className="twrap"><table>
              <thead>
                <tr>
                  <th>Código</th><th>Material</th><th>Unidad</th>
                  <th style={{ background: "#fce8e6", color: "var(--err)" }}>Costo/Barra</th>
                  <th style={{ background: "#fce8e6", color: "var(--err)" }}>Costo/Pie</th>
                  <th style={{ background: "#e6f4ea", color: "var(--sec)" }}>Venta/Barra</th>
                  <th style={{ background: "#e6f4ea", color: "var(--sec)" }}>Venta/Pie</th>
                  <th style={{ background: "var(--pri-lt)", color: "var(--pri)" }}>Margen</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign: "center", padding: 48, color: "var(--on-sur4)" }}>Sin resultados</td></tr>}
                {filtered.map(m => {
                  const margen = m.costo_pie > 0 ? r2(((m.venta_pie - m.costo_pie) / m.costo_pie) * 100) : 0;
                  return (
                    <tr key={m.id}>
                      <td><span className="mono" style={{ fontWeight: 700, color: "var(--pri)" }}>{m.codigo}</span></td>
                      <td><div style={{ fontWeight: 500 }}>{m.nombre}</div><div style={{ fontSize: 11, color: "var(--on-sur3)" }}>{m.categoria} · {m.material}</div></td>
                      <td style={{ fontSize: 12, color: "var(--on-sur3)" }}>{m.unidad}</td>
                      <td><span className="mono" style={{ color: "var(--err)", fontWeight: 500 }}>RD${m.costo_barra.toLocaleString()}</span></td>
                      <td><span className="mono" style={{ color: "var(--err)" }}>RD${m.costo_pie}</span></td>
                      <td><span className="mono" style={{ color: "var(--sec)", fontWeight: 500 }}>RD${m.venta_barra.toLocaleString()}</span></td>
                      <td><span className="mono" style={{ color: "var(--sec)" }}>RD${m.venta_pie}</span></td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: "var(--sur3)", borderRadius: 3, overflow: "hidden", minWidth: 40 }}>
                            <div style={{ height: "100%", width: Math.min(margen, 100) + "%", background: margenColor(margen), borderRadius: 3, transition: "width .3s" }} />
                          </div>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color: margenColor(margen), minWidth: 36 }}>{margen}%</span>
                        </div>
                      </td>
                      <td><button className="icon-btn" onClick={() => openEdit(m)}>✏️</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
          </div>
        </div>
      )}

      {tab === "simulador" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>
            <div className="card">
              <div className="card-hdr"><div className="card-ttl">Parámetros del Simulador</div></div>
              <div className="card-bdy"><div className="fgrid" style={{ gap: 16 }}>
                <div className="fld">
                  <label>Pietaje a cotizar (pie²)</label>
                  <input type="number" min="1" value={simPietaje} onChange={e => setSimPietaje(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="fld">
                  <label>Método de precio de venta</label>
                  <select value={simMetodo} onChange={e => setSimMetodo(e.target.value)}>
                    <option value="margen">% Margen sobre costo</option>
                    <option value="pietaje">Precio fijo por pie²</option>
                    <option value="desglose">Por perfil + vidrio + herrajes</option>
                  </select>
                </div>
                {simMetodo === "margen" && <div className="fld">
                  <label>Margen deseado (%)</label>
                  <input type="number" min="1" max="200" value={simMargen} onChange={e => setSimMargen(parseFloat(e.target.value) || 0)} />
                </div>}
                {simMetodo === "pietaje" && <div className="fld">
                  <label>Precio por pie² (RD$)</label>
                  <input type="number" min="1" value={simPrecioFijo} onChange={e => setSimPrecioFijo(parseFloat(e.target.value) || 0)} />
                </div>}
              </div></div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: `linear-gradient(135deg,${margenSim >= 30 ? "#188038" : "#f9ab00"} 0%,${margenSim >= 30 ? "#0d6b2d" : "#e37400"} 100%)`, borderRadius: 16, padding: "22px 26px", color: "#fff", boxShadow: "var(--sh3)" }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 3, opacity: .7, marginBottom: 4 }}>Ganancia Estimada</div>
                <div style={{ fontSize: 48, fontWeight: 300, lineHeight: 1 }}>RD${gananciaSim.toLocaleString()}</div>
                <div style={{ fontSize: 12, opacity: .7, marginTop: 6 }}>Margen real: <b>{margenSim}%</b> sobre el costo</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { l: "Costo Total", v: `RD$${costoSim.toLocaleString()}`, c: "var(--err)", i: "💸" },
                  { l: "Precio de Venta", v: `RD$${ventaSim.toLocaleString()}`, c: "var(--sec)", i: "💰" },
                  { l: "Ganancia", v: `RD$${gananciaSim.toLocaleString()}`, c: margenSim >= 30 ? "var(--sec)" : "var(--warn)", i: "📈" },
                ].map(k => (
                  <div key={k.l} className="card" style={{ padding: "16px 18px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{k.i}</div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 600, color: k.c }}>{k.v}</div>
                    <div style={{ fontSize: 11, color: "var(--on-sur3)", marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>{k.l}</div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="card-hdr"><div className="card-ttl">Comparación de Escenarios</div></div>
                <table>
                  <thead><tr><th>Escenario</th><th>Precio Venta</th><th>Ganancia</th><th>Margen</th></tr></thead>
                  <tbody>
                    {[
                      { name: "Margen 20%", venta: r2(costoSim * 1.20) },
                      { name: "Margen 30%", venta: r2(costoSim * 1.30) },
                      { name: "Margen 35% ★", venta: r2(costoSim * 1.35) },
                      { name: "Margen 40%", venta: r2(costoSim * 1.40) },
                      { name: "Margen 50%", venta: r2(costoSim * 1.50) },
                      { name: `Precio fijo RD$${simPrecioFijo}/pie²`, venta: r2(simPietaje * simPrecioFijo) },
                    ].map((s, i) => {
                      const gan = r2(s.venta - costoSim);
                      const mrg = costoSim > 0 ? r2((gan / costoSim) * 100) : 0;
                      return (
                        <tr key={i} style={s.name.includes("★") ? { background: "var(--pri-lt)" } : {}}>
                          <td style={{ fontWeight: s.name.includes("★") ? 700 : 400 }}>{s.name}</td>
                          <td><span className="mono" style={{ color: "var(--sec)", fontWeight: 600 }}>RD${s.venta.toLocaleString()}</span></td>
                          <td><span className="mono" style={{ color: margenColor(mrg), fontWeight: 600 }}>RD${gan.toLocaleString()}</span></td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 50, height: 5, background: "var(--sur3)", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: Math.min(mrg, 100) + "%", background: margenColor(mrg), borderRadius: 3 }} />
                              </div>
                              <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: margenColor(mrg) }}>{mrg}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-bd" onClick={e => { if (e.target === e.currentTarget) setModal(false); }}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-hdr"><div className="modal-ttl">{edit ? "Editar Material" : "Nuevo Material"}</div><button className="icon-btn" onClick={() => setModal(false)}>✕</button></div>
            <div className="modal-bdy"><div className="fgrid f2" style={{ gap: 14 }}>
              <div className="fld"><label>Código</label><input value={form.codigo} onChange={sf("codigo")} placeholder="GK-40" /></div>
              <div className="fld"><label>Categoría</label><select value={form.categoria} onChange={sf("categoria")}>{CATEGORIAS_ALM.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="fld" style={{ gridColumn: "1/-1" }}><label>Nombre *</label><input value={form.nombre} onChange={sf("nombre")} /></div>
              <div className="fld"><label>Unidad</label><select value={form.unidad} onChange={sf("unidad")}>{UNIDADES_ALM.map(u => <option key={u}>{u}</option>)}</select></div>
              <div className="fld"><label>Pies por barra</label><input type="number" value={form.pie_barra} onChange={sf("pie_barra")} /></div>
              <div className="fld"><label>Material / Acabado</label><input value={form.material} onChange={sf("material")} /></div>
              <div style={{ gridColumn: "1/-1", padding: "10px 14px", background: "#fce8e6", borderRadius: "var(--r-sm)", fontSize: 12, fontWeight: 600, color: "var(--err)" }}>💸 PRECIO PROVEEDOR (Costo)</div>
              <div className="fld"><label>Costo por Barra (RD$)</label><input type="number" min="0" value={form.costo_barra} onChange={e => { const v = parseFloat(e.target.value) || 0; setForm(f => ({ ...f, costo_barra: v, costo_pie: r2(v / (parseFloat(f.pie_barra) || 20)) })); }} /></div>
              <div className="fld"><label>Costo por Pie (RD$)</label><input type="number" min="0" value={form.costo_pie} onChange={e => { const v = parseFloat(e.target.value) || 0; setForm(f => ({ ...f, costo_pie: v, costo_barra: r2(v * (parseFloat(f.pie_barra) || 20)) })); }} /></div>
              <div style={{ gridColumn: "1/-1", padding: "10px 14px", background: "#e6f4ea", borderRadius: "var(--r-sm)", fontSize: 12, fontWeight: 600, color: "var(--sec)" }}>💰 PRECIO DE VENTA</div>
              <div className="fld"><label>Venta por Barra (RD$)</label><input type="number" min="0" value={form.venta_barra} onChange={e => { const v = parseFloat(e.target.value) || 0; setForm(f => ({ ...f, venta_barra: v, venta_pie: r2(v / (parseFloat(f.pie_barra) || 20)) })); }} /></div>
              <div className="fld"><label>Venta por Pie (RD$)</label><input type="number" min="0" value={form.venta_pie} onChange={e => { const v = parseFloat(e.target.value) || 0; setForm(f => ({ ...f, venta_pie: v, venta_barra: r2(v * (parseFloat(f.pie_barra) || 20)) })); }} /></div>
              {form.costo_pie > 0 && form.venta_pie > 0 && (
                <div style={{ gridColumn: "1/-1", padding: "12px 16px", background: "var(--pri-lt)", borderRadius: "var(--r-sm)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "var(--pri-dk)" }}>Margen calculado</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 700, color: margenColor(r2(((form.venta_pie - form.costo_pie) / form.costo_pie) * 100)) }}>
                    {r2(((form.venta_pie - form.costo_pie) / form.costo_pie) * 100)}%
                  </span>
                </div>
              )}
            </div></div>
            <div className="modal-ftr"><button className="btn btn-text" onClick={() => setModal(false)}>Cancelar</button><button className="btn btn-filled" onClick={save}>Guardar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
