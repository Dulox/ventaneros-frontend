import { useState } from "react";
import { DP } from "../../shared/constants.js";

export default function Proveedores() {
  const [lista, setLista] = useState(DP);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ nombre: "", contacto: "", tel: "", ciudad: "", producto: "", estado: "Activo" });
  const filtered = lista.filter(p => p.nombre.toLowerCase().includes(q.toLowerCase()) || p.producto.toLowerCase().includes(q.toLowerCase()));

  function openNew() { setEdit(null); setForm({ nombre: "", contacto: "", tel: "", ciudad: "", producto: "", estado: "Activo" }); setModal(true); }
  function openEdit(p) { setEdit(p); setForm({ ...p }); setModal(true); }
  function save() {
    if (!form.nombre.trim()) return;
    if (edit) { setLista(l => l.map(x => x.id === edit.id ? { ...x, ...form } : x)); }
    else { setLista(l => [...l, { ...form, id: Date.now() }]); }
    setModal(false);
  }
  const sf = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
        <div className="sbar"><span style={{ color: "var(--on-sur4)" }}>🔍</span><input placeholder="Buscar proveedores..." value={q} onChange={e => setQ(e.target.value)} /></div>
        <button className="btn btn-filled" onClick={openNew}>＋ Nuevo proveedor</button>
      </div>
      <div className="card">
        <div className="twrap"><table>
          <thead><tr><th>Proveedor</th><th>Teléfono</th><th>Ciudad</th><th>Producto</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td><div style={{ fontWeight: 500 }}>{p.nombre}</div><div style={{ fontSize: 12, color: "var(--on-sur3)", marginTop: 2 }}>{p.contacto}</div></td>
                <td><span className="mono">{p.tel}</span></td>
                <td style={{ color: "var(--on-sur3)" }}>{p.ciudad}</td>
                <td><span className="chip chip-filled-pri">{p.producto}</span></td>
                <td><span className={`chip ${p.estado === "Activo" ? "chip-filled-sec" : ""}`}>{p.estado}</span></td>
                <td><button className="icon-btn" onClick={() => openEdit(p)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
      {modal && (
        <div className="modal-bd" onClick={e => { if (e.target === e.currentTarget) setModal(false); }}>
          <div className="modal">
            <div className="modal-hdr"><div className="modal-ttl">{edit ? "Editar proveedor" : "Nuevo proveedor"}</div><button className="icon-btn" onClick={() => setModal(false)}>✕</button></div>
            <div className="modal-bdy"><div className="fgrid f2" style={{ gap: 14 }}>
              <div className="fld" style={{ gridColumn: "1/-1" }}><label>Nombre *</label><input value={form.nombre} onChange={sf("nombre")} /></div>
              <div className="fld"><label>Contacto</label><input value={form.contacto} onChange={sf("contacto")} /></div>
              <div className="fld"><label>Teléfono</label><input value={form.tel} onChange={sf("tel")} /></div>
              <div className="fld"><label>Ciudad</label><input value={form.ciudad} onChange={sf("ciudad")} /></div>
              <div className="fld" style={{ gridColumn: "1/-1" }}><label>Producto principal</label><input value={form.producto} onChange={sf("producto")} /></div>
              <div className="fld"><label>Estado</label><select value={form.estado} onChange={sf("estado")}><option>Activo</option><option>Inactivo</option></select></div>
            </div></div>
            <div className="modal-ftr"><button className="btn btn-text" onClick={() => setModal(false)}>Cancelar</button><button className="btn btn-filled" onClick={save}>Guardar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
