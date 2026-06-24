import { useState } from "react";
import { sumOrder } from "./helpers.js";
import { descargarOrdenPDF } from "../api.js";

// ═══ ORDER MODAL ════════════════════════════════════════════════════════════
export function OrderModal({ lines, onClose }) {
  const [info, setInfo] = useState({ numero: "001", cliente: "", proyecto: "", responsable: "", entrega: "", notas: "" });
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfErr, setPdfErr] = useState("");
  const sf = k => e => setInfo(f => ({ ...f, [k]: e.target.value }));
  const tot = sumOrder(lines);

  async function handleDownload() {
    setPdfErr(""); setLoadingPdf(true);
    try {
      await descargarOrdenPDF(lines, info);
      onClose();
    } catch (e) {
      setPdfErr(e.message || "No se pudo generar el PDF.");
    } finally {
      setLoadingPdf(false);
    }
  }

  return (
    <div className="modal-bd" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-hdr">
          <div className="modal-ttl">Datos de la Orden</div>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-bdy">
          <div style={{ background: "var(--pri-light)", borderRadius: "var(--r-md)", padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, color: "var(--pri-dark)", fontWeight: 500 }}>📋 {lines.length} línea(s) · {lines.reduce((s, l) => s + l.cantidad, 0)} unidades</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16, fontWeight: 600, color: "var(--pri-dark)" }}>{tot.pie} ft²</div>
          </div>
          <div className="fgrid f2" style={{ gap: 14 }}>
            <div className="fld"><label>Número de Orden</label><input value={info.numero} onChange={sf("numero")} placeholder="001" /></div>
            <div className="fld"><label>Fecha de Entrega</label><input type="date" value={info.entrega} onChange={sf("entrega")} /></div>
            <div className="fld" style={{ gridColumn: "1/-1" }}><label>Cliente</label><input value={info.cliente} onChange={sf("cliente")} placeholder="Nombre del cliente o empresa" /></div>
            <div className="fld" style={{ gridColumn: "1/-1" }}><label>Proyecto / Referencia</label><input value={info.proyecto} onChange={sf("proyecto")} placeholder="Ej: Residencia Las Palmas — Sala principal" /></div>
            <div className="fld" style={{ gridColumn: "1/-1" }}><label>Responsable de producción</label><input value={info.responsable} onChange={sf("responsable")} /></div>
            <div className="fld" style={{ gridColumn: "1/-1" }}><label>Notas adicionales</label><textarea value={info.notas} onChange={sf("notas")} placeholder="Instrucciones especiales para el taller..." /></div>
          </div>
          {pdfErr && <div style={{ marginTop: 12, color: "#dc2626", fontSize: 13 }}>{pdfErr}</div>}
        </div>
        <div className="modal-ftr">
          <button className="btn btn-text" onClick={onClose}>Cancelar</button>
          <button className="btn btn-filled" onClick={handleDownload} disabled={loadingPdf}>{loadingPdf ? "Generando PDF..." : "⬇ Descargar PDF"}</button>
        </div>
      </div>
    </div>
  );
}

// ═══ PROFILE TABLE ══════════════════════════════════════════════════════════
export function ProfileTable({ title, badge, color = "#1a73e8", rows }) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="card card-outlined">
      <div className="card-hdr">
        <div className="card-ttl">{title}</div>
        {badge && <span className="chip" style={{ background: `rgba(${color === "green" ? "42,92,63" : "26,115,232"},.1)`, color: color === "green" ? "var(--sec)" : "var(--pri)", fontSize: 11, border: "none" }}>{badge}</span>}
      </div>
      <div className="twrap">
        <table>
          <thead>
            <tr>
              <th>Perfil</th>
              <th>Código</th>
              <th style={{ textAlign: "center" }}>Cant.</th>
              <th>Tamaño de corte</th>
              <th style={{ textAlign: "right" }}>Pies lineales</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((rw, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500, color: "var(--on-sur)" }}>{rw.perfil}</td>
                <td><span className="mono" style={{ fontSize: 11, color: "var(--on-sur3)", background: "var(--sur2)", padding: "2px 7px", borderRadius: 4 }}>{rw.codigo}</span></td>
                <td style={{ textAlign: "center" }}>
                  {rw.cant !== undefined && rw.cant !== "—"
                    ? <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: "var(--pri)", fontSize: 13 }}>{rw.cant}</span>
                    : <span style={{ color: "var(--on-sur4)" }}>—</span>}
                </td>
                <td><span className="mono" style={{ color: "var(--sec)", fontWeight: 600, fontSize: 13 }}>{rw.tamano}</span></td>
                <td style={{ textAlign: "right", fontWeight: 700, fontSize: 14 }}>{rw.pies} <span style={{ fontSize: 11, color: "var(--on-sur4)", fontWeight: 400 }}>pie</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══ HARDWARE ROW ═══════════════════════════════════════════════════════════
export function HwRow({ label, value, unit, highlight = false }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--out)" }}>
      <span style={{ fontSize: 13, color: "var(--on-sur3)" }}>{label}</span>
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: highlight ? 700 : 500, fontSize: 13, color: highlight ? "var(--sec)" : "var(--on-sur)" }}>{value} <span style={{ fontSize: 11, color: "var(--on-sur4)", fontWeight: 400 }}>{unit}</span></span>
    </div>
  );
}

// ═══ CALC RESULT ════════════════════════════════════════════════════════════
export function CalcResult({ r, f, onAdd }) {
  if (!r) return null;
  const tipo = r.tipo;

  let marcoRows = [], hojaRows = [], extraRows = [], balaRows = [];

  if (tipo === "cor") {
    marcoRows = [
      { perfil: "Lateral Marco", codigo: "GK-40/43", cant: r.counts?.lat_c || 2 * f.cantidad, tamano: r.dim.lt, pies: r.pies.lat },
      { perfil: "Cabezal Marco", codigo: "GK-44", cant: r.counts?.cab_c || f.cantidad, tamano: r.dim.ct, pies: r.pies.cab },
      { perfil: "Riel Marco", codigo: "GK-39/86", cant: r.counts?.cab_c || f.cantidad, tamano: r.dim.ct, pies: r.pies.rie },
    ];
    hojaRows = [
      { perfil: "Cabezal Hoja", codigo: "GK-37", cant: r.counts?.chc, tamano: r.dim.cht, pies: r.pies.chb },
      { perfil: "Alfeizal Hoja", codigo: "GK-41", cant: r.counts?.chc, tamano: r.dim.cht, pies: r.pies.alf },
      { perfil: "Jamba Llavin", codigo: "DS-70", cant: r.counts?.jlc, tamano: r.dim.jt, pies: r.pies.jll },
      { perfil: "Jamba Enganche", codigo: "GK-42", cant: r.counts?.jec, tamano: r.dim.jt, pies: r.pies.jng },
      ...(r.pies?.ada > 0 ? [{ perfil: "Adaptador", codigo: "D276A", cant: r.counts?.ac, tamano: r.dim.jt, pies: r.pies.ada }] : []),
    ];
  }

  if (tipo === "pa" || tipo === "paa") {
    hojaRows = [
      { perfil: "Celosías", codigo: "GK-61", cant: r.cnt?.cc, tamano: r.dim.tce, pies: r.pies.cel },
      { perfil: "Balancín", codigo: "GK-62", cant: "—", tamano: r.dim.lb, pies: r.pies.bal },
      { perfil: "Cabezal Hoja", codigo: "GK-59", cant: r.cnt?.cab, tamano: r.dim.tc, pies: r.pies.cab },
      { perfil: "Alfeizal Hoja", codigo: "GK-55", cant: r.cnt?.cab, tamano: r.dim.tc, pies: r.pies.alf },
      { perfil: "Jamba Lisa", codigo: "GK-bk", cant: r.cnt?.jl, tamano: r.dim.jt, pies: r.pies.jll },
      ...(r.cnt?.jm > 0 ? [{ perfil: "Jamba c/Muñón", codigo: "GK-65", cant: r.cnt.jm, tamano: r.dim.jt, pies: r.pies.jmm }] : []),
    ];
    balaRows = [
      { perfil: "Balancín 1", codigo: "—", cant: "—", tamano: r.bl?.b1 || "—", pies: "—" },
      ...(r.bl?.b2 ? [{ perfil: "Balancín 2", codigo: "—", cant: "—", tamano: r.bl.b2, pies: "—" }] : []),
    ];
  }

  if (tipo === "p65" || tipo === "p92") {
    const isP92 = tipo === "p92";
    marcoRows = [
      { perfil: "Lateral Marco 2-vía", codigo: isP92 ? "ALD-901" : "ALD-602", cant: 2 * f.cantidad, tamano: r.dim.lt, pies: r.pies.lat },
      { perfil: "Lateral Marco 3-vía", codigo: isP92 ? "ALD-901" : "ALD-624", cant: 2 * f.cantidad, tamano: r.dim.lt, pies: r.pies.lat },
      { perfil: "Cabezal Marco", codigo: isP92 ? "ALD-902" : "ALD-602", cant: f.cantidad, tamano: r.dim.ct, pies: r.pies.cab },
      { perfil: "Cabezal Marco 3-vía", codigo: isP92 ? "ALD-902" : "ALD-622", cant: f.cantidad, tamano: r.dim.ct, pies: r.pies.cab },
      { perfil: `Riel Marco ${r.riel === "Exterior (E)" ? "Ext." : "Int."}`, codigo: isP92 ? "ALD-900" : r.riel === "Exterior (E)" ? "ALD-601" : "ALD-625", cant: f.cantidad, tamano: r.dim.ct, pies: r.pies.rie },
    ];
    hojaRows = [
      { perfil: "Cabezal Hoja", codigo: isP92 ? "ALD-904" : "ALD-606", cant: f.hojas * f.cantidad, tamano: r.dim.cht, pies: r.pies.chb },
      { perfil: "Alfeizal Hoja", codigo: isP92 ? "ALD-904" : "ALD-606", cant: f.hojas * f.cantidad, tamano: r.dim.cht, pies: r.pies.alf },
      { perfil: "Jamba Llavin", codigo: isP92 ? "ALD-906" : "ALD-607", cant: "—", tamano: r.dim.jt, pies: r.pies.jll },
      { perfil: "Jamba Enganche", codigo: isP92 ? "ALD-907" : "ALD-608", cant: "—", tamano: r.dim.jt, pies: r.pies.jng },
      ...(r.pies?.ada > 0 ? [{ perfil: "Adaptador", codigo: isP92 ? "ALD-910" : "ALD-610", cant: "—", tamano: r.dim.jt, pies: r.pies.ada }] : []),
    ];
  }

  if (tipo === "pu") {
    marcoRows = [
      { perfil: "Lateral Marco", codigo: "GK-48", cant: r.counts?.lat_c, tamano: r.dim.lat_t, pies: r.pies.lat },
      { perfil: "Cabezal / Roda", codigo: "GK-48", cant: r.counts?.cab_c, tamano: r.dim.cab_t, pies: r.pies.cab },
      { perfil: "Piel Marco", codigo: "DS-50", cant: r.counts?.cab_c, tamano: r.dim.cab_t, pies: r.pies.pie },
    ];
    hojaRows = [
      { perfil: "Cabezal Hoja", codigo: "GK-50", cant: r.counts?.chc, tamano: r.dim.cht, pies: r.pies.chb },
      { perfil: "Alfeizal Hoja", codigo: "GK-52", cant: r.counts?.chc, tamano: r.dim.cht, pies: r.pies.alf },
      { perfil: "Jambas Hoja", codigo: "GK-50", cant: r.counts?.jamc, tamano: r.dim.jam_t, pies: r.pies.jam },
    ];
    extraRows = [
      ...(r.pies?.emp > 0 ? [{ perfil: "Barra Empuje", codigo: "GK-85", cant: r.counts?.chc, tamano: r.dim.barra_empuje, pies: r.pies.emp }] : []),
      { perfil: "Soporte Empuje", codigo: "GK-84", cant: r.counts?.lat_c, tamano: r.dim.jam_t, pies: r.pies.sop },
      { perfil: "Tapa Moldura", codigo: "GK-46", cant: r.counts?.tope_can, tamano: `${r.dim.tope_ancho}+${r.dim.tope_alto}`, pies: r.pies.top },
    ];
  }

  const dims = tipo === "pu"
    ? [["Ancho", r.dim.ancho], ["Alto", r.dim.alto], ["Lat. Marco", r.dim.lat_t], ["Cab. Marco", r.dim.cab_t], ["Jamba Hoja", r.dim.jam_t], ["Cab./Alf. Hoja", r.dim.cht], ["Tope Ancho", r.dim.tope_ancho], ["Tope Alto", r.dim.tope_alto]]
    : tipo === "pa" || tipo === "paa"
    ? [["Ancho", r.dim.ancho], ["Alto", r.dim.alto], ["Celosía", r.dim.tce], ["Cabezal/Alf.", r.dim.tc], ["Jamba", r.dim.jt], ["Balancín", r.dim.lb]]
    : [["Ancho", r.dim.ancho], ["Alto", r.dim.alto], ["Lat. Marco", r.dim.lt || r.dim.lat_t], ["Cab. Marco", r.dim.ct || r.dim.cab_t], ["Jamba Hoja", r.dim.jt || r.dim.jam_t], ["Cab. Hoja", r.dim.cht], ["Vidrio A.", r.dim.vw || r.dim.vid_ancho], ["Vidrio H.", r.dim.vh || r.dim.vid_alto]];

  const hw = r.hw || {};
  const hwItems = tipo === "cor"
    ? [["Ruedas", hw.rue, "u"], ["Guías", hw.gui, "u"], ["Tornillos", hw.tor, "u"], ["Cerraduras", hw.cer, "u"], ["Goma", hw.gom, "pie"], ["Felpa", hw.fel, "pie"]]
    : tipo === "pa" || tipo === "paa"
    ? [["Goma", hw.gom, "pie"], ["Remaches", hw.rem, "u"], ["Operadores", hw.op, "u"], ["Torn. 10×5/8", hw.tc, "u"], ["Torn. Empate", hw.te, "u"], ...(r.tipoPer === "Vidrio" ? [["Clips", hw.cli, "u"]] : [])]
    : tipo === "p65" || tipo === "p92"
    ? [["Ruedas", hw.rue, "u"], ["Guías", hw.gui, "u"], ["Tornillos", hw.tor, "u"], ["Cerraduras", hw.cer, "u"], ["Goma", hw.gom, "pie"], ["Felpa", hw.fel, "pie"]]
    : [["Pivot", hw.pivot, "u"], ["Cierre Automático", hw.cierre, "u"], ["Cerradura", hw.cerradura, "u"], ...(hw.pestillo ? [["Pestillo", hw.pestillo, "u"]] : []), ["Puño", hw.puno, "u"], ["Goma", hw.goma, "pie"], ["Felpa", hw.felpa, "pie"]];

  const tipoPuerta = r.tipoPuerta;
  const tipoLabel = { cor: "Corrediza Tradicional", pa: "Persiana A", paa: "Persiana AA", p65: "P-65", p92: "P-92", pu: "Puertas" }[tipo];

  return (
    <div className="cr">
      <div className="hero">
        <div>
          <div className="hl">Pietaje Total · {tipoLabel}</div>
          <div className="hs">
            {f.hojas && <span className="ht">{f.hojas} {tipo === "pu" ? "hoja(s)" : "hojas"}</span>}
            {f.cuerpo && (tipo === "pa" || tipo === "paa") && <span className="ht">{f.cuerpo} cuerpo(s)</span>}
            <span className="ht">{f.cantidad} hueco(s)</span>
            {r.material && <span className="ht">{r.material}</span>}
            {r.riel && <span className="ht">{r.riel}</span>}
            {tipoPuerta && <span className="ht">{tipoPuerta}</span>}
            {r.tipoPer && <span className="ht">{r.tipoPer}</span>}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="hn">{r.pie}</div>
          <div className="hu">pies²</div>
        </div>
      </div>

      <div className="card card-outlined">
        <div className="card-hdr"><div className="card-ttl">Dimensiones de corte</div></div>
        <div className="card-bdy">
          <div className="dg">
            {dims.map(([l, v]) => v ? (
              <div key={l} className="db">
                <div className="dl">{l}</div>
                <div className="dv">{v}</div>
              </div>
            ) : null)}
          </div>
        </div>
      </div>

      {marcoRows.length > 0 && <ProfileTable title="Marco del cuadro" rows={marcoRows} badge={r.riel ? "Riel " + r.riel : undefined} />}
      {hojaRows.length > 0 && <ProfileTable title="Marco de la hoja" rows={hojaRows} color="green" />}
      {extraRows.length > 0 && <ProfileTable title="Accesorios de marco" rows={extraRows} />}

      {(tipo === "pa" || tipo === "paa") && (
        <div className="card card-outlined">
          <div className="card-hdr"><div className="card-ttl">Balancines y operadores</div></div>
          <div className="card-bdy">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {[["Balancín 1", r.bl?.b1 || "—"], ["Balancín 2", r.bl?.b2 || "—"], ["Operadores", r.bl?.op + " unid"]].map(([l, v]) => (
                <div key={l} className="db">
                  <div className="dl">{l}</div>
                  <div className="dv">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tipo === "pu" && r.dim?.barra_roscada && r.dim.barra_roscada !== "—" && (
        <div style={{ background: "var(--sur2)", border: "1px solid var(--out)", borderRadius: "var(--r-sm)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
          <span style={{ fontWeight: 500 }}>Barra Roscada</span>
          <span className="mono" style={{ color: "var(--pri)", fontWeight: 600 }}>{r.dim.barra_roscada} × {r.hw?.roscada} unid</span>
        </div>
      )}

      {(tipo === "cor" || tipo === "p65" || tipo === "p92" || tipo === "pu" || ((tipo === "pa" || tipo === "paa") && r.tipoPer === "Vidrio")) && (
        <div className="card card-outlined">
          <div className="card-hdr"><div className="card-ttl">Vidrio</div></div>
          <div className="card-bdy">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <div className="db"><div className="dl">Tipo</div><div style={{ fontSize: 13, fontWeight: 600, color: "var(--sec)", marginTop: 2 }}>{r.glass?.tipo || r.vidrio || "—"}</div></div>
              <div className="db"><div className="dl">Cantidad</div><div className="dv">{r.glass?.cant || r.counts?.vid_can || "—"} <span style={{ fontSize: 11, color: "var(--on-sur3)" }}>pzas</span></div></div>
              <div className="db"><div className="dl">{tipo === "pa" || tipo === "paa" ? "Pie lineal" : "Pie²"}</div><div className="dv">{tipo === "pa" || tipo === "paa" ? r.lam : r.glass?.sqft} <span style={{ fontSize: 11, color: "var(--on-sur3)" }}>{tipo === "pa" || tipo === "paa" ? "pie" : "ft²"}</span></div></div>
              {(tipo === "cor" || tipo === "p65" || tipo === "p92") && <><div className="db"><div className="dl">Vidrio Ancho</div><div className="dv">{r.dim.vw}</div></div><div className="db"><div className="dl">Vidrio Alto</div><div className="dv">{r.dim.vh}</div></div></>}
              {tipo === "pu" && <><div className="db"><div className="dl">Tope Ancho</div><div className="dv">{r.dim.tope_ancho}</div></div><div className="db"><div className="dl">Tope Alto</div><div className="dv">{r.dim.tope_alto}</div></div></>}
            </div>
          </div>
        </div>
      )}

      <div className="card card-outlined">
        <div className="card-hdr"><div className="card-ttl">Herrajes y accesorios</div></div>
        <div style={{ padding: "4px 20px 16px" }}>
          {hwItems.filter(([, v]) => v !== undefined && v !== null && v !== "").map(([l, v, u]) => (
            <HwRow key={l} label={l} value={v} unit={u} highlight={l === "Goma" || l === "Felpa"} />
          ))}
        </div>
      </div>

      <button className="add-line-btn" onClick={onAdd}>＋ Agregar a la orden de producción</button>
    </div>
  );
}

// ═══ ORDER TABLE ════════════════════════════════════════════════════════════
export function OrderTable({ lines, onDelete, onPrint }) {
  if (!lines.length) return null;
  const tot = sumOrder(lines);
  const typeLabel = t => t === "cor" ? "Corrediza" : t === "pa" ? "Persiana A" : "Persiana AA";
  const typeColor = t => t === "cor" ? "chip-filled-pri" : t === "pa" ? "chip-filled-sec" : "";
  return (
    <div className="order-wrap">
      <div className="order-hdr">
        <div>
          <div className="order-hdr-ttl">📋 Orden de Producción</div>
          <div style={{ fontSize: 12, color: "var(--on-sur3)", marginTop: 2 }}>{lines.length} línea(s) · {lines.reduce((s, l) => s + l.cantidad, 0)} unidades</div>
        </div>
        <div className="order-stats">
          <div className="order-stat"><div className="order-stat-n">{tot.pie}</div><div>pies²</div></div>
          <div className="order-stat"><div className="order-stat-n">{tot.gom}</div><div>pie goma</div></div>
          {tot.rem > 0 && <div className="order-stat"><div className="order-stat-n">{tot.rem}</div><div>remaches</div></div>}
        </div>
        <button className="btn btn-filled btn-sm" onClick={onPrint}>⬇ Descargar PDF</button>
      </div>
      <div className="twrap">
        <table>
          <thead><tr><th>#</th><th>Descripción</th><th>Tipo</th><th>Ancho</th><th>Alto</th><th>Cant.</th><th>Material</th><th>Pies²</th><th></th></tr></thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={l.id}>
                <td style={{ fontWeight: 700, color: "var(--pri)", fontSize: 13 }}>{i + 1}</td>
                <td style={{ fontWeight: 500 }}>{l.label}</td>
                <td><span className={`chip ${typeColor(l.tipo)}`}>{typeLabel(l.tipo)}</span></td>
                <td><span className="mono">{l.dim.ancho}</span></td>
                <td><span className="mono">{l.dim.alto}</span></td>
                <td style={{ textAlign: "center", fontWeight: 600 }}>{l.cantidad}</td>
                <td style={{ color: "var(--on-sur3)" }}>{l.material}</td>
                <td style={{ fontWeight: 700, color: "var(--pri)" }}>{l.pie}</td>
                <td><button className="icon-btn danger del-btn" onClick={() => onDelete(l.id)} title="Eliminar línea">🗑️</button></td>
              </tr>
            ))}
            <tr style={{ background: "var(--sur2)" }}>
              <td colSpan={7} style={{ fontWeight: 600, textAlign: "right", fontSize: 12, color: "var(--on-sur3)", letterSpacing: ".5px" }}>TOTAL PIETAJE</td>
              <td style={{ fontWeight: 700, color: "var(--pri)", fontSize: 15 }}>{tot.pie} ft²</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="summary-row">
        <div className="summary-item">Goma total: <span className="summary-val">{tot.gom} pie</span></div>
        {tot.rem > 0 && <div className="summary-item">· Remaches: <span className="summary-val">{tot.rem}</span></div>}
        {tot.op > 0 && <div className="summary-item">· Operadores: <span className="summary-val">{tot.op}</span></div>}
      </div>
    </div>
  );
}
