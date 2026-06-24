import { useState } from "react";
import { calcularEnServidor } from "../../api.js";
import { VENTANAS, VIDS, MATS } from "../../shared/constants.js";
import { CalcResult, OrderTable, OrderModal } from "../../shared/CalcComponents.jsx";

export default function Calculadoras() {
  const [sel, setSel] = useState(null);
  const [form, setForm] = useState({ unidad: "Pulgadas", ancho: "", alto: "", hojas: 2, cuerpo: 1, cantidad: 1, material: "Natural", vidrio: "Natural transparente", tipo: "Aluminio", riel: "Exterior (E)", tipoPuerta: "Comercial", posicion: "Derecha" });
  const [res, setRes] = useState(null);
  const [errs, setErrs] = useState([]);
  const [lines, setLines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const sf = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function calc() {
    setErrs([]); setRes(null);
    const e = [];
    if (!form.ancho) e.push("Ingrese el ancho.");
    if (!form.alto) e.push("Ingrese el alto.");
    if (e.length) { setErrs(e); return; }

    const payload = {
      ancho: parseFloat(form.ancho),
      alto: parseFloat(form.alto),
      unidad: form.unidad,
      cantidad: parseInt(form.cantidad),
      material: form.material,
      vidrio: form.vidrio,
    };
    if (sel === "cor") {
      payload.hojas = parseInt(form.hojas);
    } else if (sel === "pa" || sel === "paa") {
      payload.cuerpo = parseInt(form.cuerpo);
      payload.tipo_persiana = form.tipo;
    } else if (sel === "p65" || sel === "p92") {
      payload.hojas = parseInt(form.hojas);
      payload.riel = form.riel;
    } else if (sel === "pu") {
      payload.hojas = parseInt(form.hojas);
      payload.tipo_puerta = form.tipoPuerta;
      payload.posicion = form.posicion;
    }

    setLoading(true);
    try {
      const r = await calcularEnServidor(sel, payload);
      setRes(r);
    } catch (err) {
      setErrs([err.message || "Error al calcular. Intenta de nuevo."]);
    } finally {
      setLoading(false);
    }
  }

  function addLine() {
    if (!res) return;
    setLines(l => [...l, { ...res, id: Date.now() }]);
    setRes(null); setErrs([]);
    setForm(f => ({ ...f, ancho: "", alto: "" }));
  }
  function delLine(id) { setLines(l => l.filter(x => x.id !== id)); }

  const isPer = sel === "pa" || sel === "paa";
  const isP65 = sel === "p65";
  const isP92 = sel === "p92";
  const isMed = isP65 || isP92;
  const isPuerta = sel === "pu";
  const vInfo = VENTANAS.find(v => v.id === sel);

  if (!sel) return (
    <div>
      <p style={{ color: "var(--on-sur3)", marginBottom: 20, fontSize: 14 }}>Selecciona el tipo de ventana o persiana para calcular los materiales.</p>
      <div className="vg">
        {VENTANAS.filter(v => !v.hidden).map(v => (
          <div key={v.id} className={"vc" + (v.on ? "" : " off")} onClick={() => v.on && setSel(v.id)}>
            <span className={"chip vbg " + (v.on ? "chip-filled-sec" : "")}>
              {v.on ? "✓ Disponible" : "Próximamente"}
            </span>
            <div className="vi">{v.icon}</div>
            <div className="vn">{v.nombre}</div>
            <div className="vd">{v.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button className="btn btn-outlined btn-sm" onClick={() => { setSel(null); setRes(null); setErrs([]); }}>← Volver</button>
        <span style={{ fontSize: 16, fontWeight: 500, color: "var(--on-sur)" }}>{vInfo.icon} {vInfo.nombre}</span>
        {lines.length > 0 && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <span className="chip chip-filled-pri">{lines.length} en orden</span>
            <button className="btn btn-filled btn-sm" onClick={() => setShowModal(true)}>⬇ Descargar PDF</button>
          </div>
        )}
      </div>
      <div className="cl">
        <div className="card">
          <div className="card-hdr" style={{ paddingBottom: 16 }}><div className="card-ttl">Datos del hueco</div></div>
          <div className="card-bdy"><div className="fgrid" style={{ gap: 14 }}>
            <div className="fld"><label>Unidad de medida</label><select value={form.unidad} onChange={sf("unidad")}><option>Pulgadas</option><option>Metros</option></select></div>
            <div className="fgrid f2">
              <div className="fld"><label>Ancho</label><input type="number" step="0.0625" value={form.ancho} onChange={sf("ancho")} placeholder={form.unidad === "Metros" ? "1.20" : "48"} /></div>
              <div className="fld"><label>Alto</label><input type="number" step="0.0625" value={form.alto} onChange={sf("alto")} placeholder={form.unidad === "Metros" ? "1.50" : "60"} /></div>
            </div>
            {(isMed || (!isPer && !isPuerta)) && <div className="fgrid f2">
              <div className="fld"><label>Hojas</label><select value={form.hojas} onChange={sf("hojas")}>{[2, 3, 4, 6].map(h => <option key={h} value={h}>{h} hojas</option>)}</select></div>
              <div className="fld"><label>Cantidad</label><input type="number" min="1" value={form.cantidad} onChange={sf("cantidad")} /></div>
            </div>}
            {isPuerta && <div className="fgrid f2">
              <div className="fld"><label>Tipo de Puerta</label><select value={form.tipoPuerta} onChange={sf("tipoPuerta")}><option>Comercial</option><option>Residencial</option></select></div>
              <div className="fld"><label>Hojas</label><select value={form.hojas} onChange={e => setForm(f => ({ ...f, hojas: parseInt(e.target.value) }))}><option value={1}>1 Hoja</option><option value={2}>2 Hojas</option></select></div>
            </div>}
            {isPuerta && <div className="fgrid f2">
              <div className="fld"><label>Posición</label><select value={form.posicion} onChange={sf("posicion")}><option>Derecha</option><option>Izquierda</option></select></div>
              <div className="fld"><label>Cantidad</label><input type="number" min="1" value={form.cantidad} onChange={sf("cantidad")} /></div>
            </div>}
            {isMed && <div className="fld"><label>Tipo de Riel</label>
              <select value={form.riel} onChange={sf("riel")}><option>Exterior (E)</option><option>Interior (I)</option></select>
            </div>}
            {isPer && <div className="fgrid f2">
              <div className="fld"><label>Cuerpos</label><select value={form.cuerpo} onChange={sf("cuerpo")}>{[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} {n === 1 ? "cuerpo" : "cuerpos"}</option>)}</select></div>
              <div className="fld"><label>Cantidad</label><input type="number" min="1" value={form.cantidad} onChange={sf("cantidad")} /></div>
            </div>}
            {isPer && <div className="fld"><label>Tipo</label><select value={form.tipo} onChange={sf("tipo")}><option>Aluminio</option><option>Vidrio</option></select></div>}
            {isPer && form.tipo === "Vidrio" && <div className="fld"><label>Tipo de vidrio</label><select value={form.vidrio} onChange={sf("vidrio")}>{VIDS.map(v => <option key={v}>{v}</option>)}</select></div>}
            <div className="fld"><label>Material</label><select value={form.material} onChange={sf("material")}>{MATS.map(m => <option key={m}>{m}</option>)}</select></div>
            {!isPer && <div className="fld"><label>Tipo de vidrio</label><select value={form.vidrio} onChange={sf("vidrio")}>{VIDS.map(v => <option key={v}>{v}</option>)}</select></div>}
            {errs.length > 0 && <div style={{ background: "var(--err-light)", border: "1px solid #fad2cf", borderRadius: "var(--r-sm)", padding: "10px 14px", fontSize: 13, color: "var(--err)" }}>{errs.map((e, i) => <div key={i}>⚠ {e}</div>)}</div>}
            <button className="btn btn-filled" style={{ width: "100%", borderRadius: "var(--r-sm)" }} onClick={calc} disabled={loading}>{loading ? "Calculando..." : "Calcular materiales"}</button>
            {res && <button className="btn btn-outlined" style={{ width: "100%", borderRadius: "var(--r-sm)" }} onClick={() => { setRes(null); setErrs([]); }}>Limpiar</button>}
          </div></div>
        </div>
        <div>
          {!res && <div className="card" style={{ padding: "64px 20px", textAlign: "center", border: "1px solid var(--out)", boxShadow: "none" }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: .4 }}>{vInfo.icon}</div>
            <div style={{ fontSize: 16, color: "var(--on-sur3)", fontWeight: 400, marginBottom: 6 }}>Ingresa las medidas del hueco</div>
            <div style={{ fontSize: 13, color: "var(--on-sur4)" }}>El desglose completo aparecerá aquí</div>
          </div>}
          {res && <CalcResult r={res} f={form} onAdd={addLine} />}
        </div>
      </div>
      <OrderTable lines={lines} onDelete={delLine} onPrint={() => setShowModal(true)} />
      {showModal && <OrderModal lines={lines} onClose={() => setShowModal(false)} />}
    </div>
  );
}
