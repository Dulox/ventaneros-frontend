/**
 * INSTALACIONES
 * 3 tabs:
 *  1. Asignación  — obras por instalar, asignar instalador, pagar
 *  2. Instaladores — CRUD (nombre, tel, cédula, % comisión)
 *  3. Precios     — precio/pie² por material + transporte por ciudad
 */
import { useState } from "react";

function fmtRD(n)   { return `RD$${Math.round(n||0).toLocaleString("es-DO")}`; }
function today()    { return new Date().toISOString().slice(0,10); }
function fmtDate(d) { return d ? new Date(d+"T12:00:00").toLocaleDateString("es-DO",{day:"2-digit",month:"short",year:"numeric"}) : "—"; }
function r2(n)      { return Math.round((n||0)*100)/100; }

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_INSTALADORES = [
  { id:1, codigo:"INS-001", nombre:"Carlos Méndez",   cedula:"001-1234567-8", tel:"809-555-0101", celular:"829-555-0101", comision:8, tipo:"Porcentaje", activo:true,  notas:"Especialista en corredizas" },
  { id:2, codigo:"INS-002", nombre:"Rafael Torres",   cedula:"001-9876543-2", tel:"809-555-0202", celular:"829-555-0202", comision:7, tipo:"Porcentaje", activo:true,  notas:"" },
  { id:3, codigo:"INS-003", nombre:"José Santana",    cedula:"001-1111111-1", tel:"809-555-0303", celular:"",            comision:6, tipo:"Porcentaje", activo:false, notas:"Inactivo temporalmente" },
];

const DEMO_OBRAS = [
  { id:1, factura:"FAC-001", pedido:"COT-001", cliente:"Constructora Pérez & Asociados", fecha_fact:"2025-06-01", pie:134, valor_inst:56280, instalador_id:1, instalador:"Carlos Méndez", estado:"Pagada",   pagado:56280, notas:"Instalación completada sin novedad", fecha_inst:"2025-06-12" },
  { id:2, factura:"FAC-002", pedido:"COT-002", cliente:"Ferretería El Martillo",         fecha_fact:"2025-06-05", pie:50,  valor_inst:19000, instalador_id:2, instalador:"Rafael Torres",  estado:"Pendiente", pagado:0,     notas:"", fecha_inst:"2025-06-18" },
  { id:3, factura:"FAC-003", pedido:"COT-003", cliente:"María González",                  fecha_fact:"2025-06-08", pie:17,  valor_inst:6800,  instalador_id:null, instalador:"",           estado:"Sin Asignar", pagado:0,   notas:"", fecha_inst:"" },
  { id:4, factura:"FAC-004", pedido:"COT-004", cliente:"Inmobiliaria Vista Verde",         fecha_fact:"2025-05-28", pie:168, valor_inst:75600, instalador_id:1, instalador:"Carlos Méndez", estado:"Parcial",   pagado:40000, notas:"Primer piso completado", fecha_inst:"2025-06-15" },
];

const DEMO_PRECIOS = [
  { id:1, codigo:"COR-TRAD", descripcion:"Corrediza Tradicional",  precio_pie:7.00, precio_fijo:0 },
  { id:2, codigo:"PER-A",    descripcion:"Persiana Tipo A",         precio_pie:6.00, precio_fijo:0 },
  { id:3, codigo:"PER-AA",   descripcion:"Persiana Tipo AA",        precio_pie:6.50, precio_fijo:0 },
  { id:4, codigo:"P65",      descripcion:"Corrediza P-65",          precio_pie:8.00, precio_fijo:0 },
  { id:5, codigo:"P92",      descripcion:"Corrediza P-92",          precio_pie:8.50, precio_fijo:0 },
  { id:6, codigo:"PUERTA",   descripcion:"Puerta Comercial",        precio_pie:9.00, precio_fijo:0 },
  { id:7, codigo:"VID-GEN",  descripcion:"Vidrio genérico",         precio_pie:5.00, precio_fijo:0 },
];

const DEMO_TRANSPORTE = [
  { id:1, ciudad:"Santo Domingo",  barrio:"",               precio:2500 },
  { id:2, ciudad:"Santo Domingo",  barrio:"Zona Norte",     precio:3000 },
  { id:3, ciudad:"Santiago",       barrio:"",               precio:5500 },
  { id:4, ciudad:"La Romana",      barrio:"",               precio:6000 },
  { id:5, ciudad:"Punta Cana",     barrio:"",               precio:8500 },
  { id:6, ciudad:"San Pedro",      barrio:"",               precio:4500 },
];

const EST_OBRA = {
  "Sin Asignar": { cls:"chip",             label:"Sin Asignar"  },
  "Pendiente":   { cls:"chip-filled-warn", label:"Pendiente"    },
  "Parcial":     { cls:"chip-filled-pri",  label:"Parcial"      },
  "Pagada":      { cls:"chip-filled-sec",  label:"Pagada"       },
};

// ═══════════════════════════════════════════════════════════════════════════════
export default function Instalaciones() {
  const [tab, setTab]             = useState("asignacion");
  const [obras, setObras]         = useState(DEMO_OBRAS);
  const [instaladores, setInst]   = useState(DEMO_INSTALADORES);
  const [precios, setPrecios]     = useState(DEMO_PRECIOS);
  const [transporte, setTransp]   = useState(DEMO_TRANSPORTE);
  const [toast, setToast]         = useState("");

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2600); }

  const pendientes  = obras.filter(o => o.estado !== "Pagada").length;
  const sinAsignar  = obras.filter(o => o.estado === "Sin Asignar").length;
  const totalPend   = obras.filter(o => o.estado !== "Pagada").reduce((s,o) => s + (o.valor_inst - o.pagado), 0);

  // ── TAB ASIGNACIÓN ───────────────────────────────────────────────────────
  function TabAsignacion() {
    const [sel, setSel]         = useState(null);
    const [asigModal, setAsig]  = useState(null);
    const [pagoModal, setPago]  = useState(null);
    const [asigForm, setAsigF]  = useState({ instalador_id:"", fecha_inst:"" });
    const [pagoForm, setPagoF]  = useState({ fecha:today(), monto:"", metodo:"Transferencia", ref:"" });
    const [q, setQ]             = useState("");
    const [filtro, setFiltro]   = useState("todos");

    const filtered = obras.filter(o => {
      const m = o.cliente.toLowerCase().includes(q.toLowerCase()) || o.factura.toLowerCase().includes(q.toLowerCase());
      return filtro === "todos" ? m : m && o.estado === filtro;
    });

    function asignar() {
      if (!asigForm.instalador_id) return;
      const inst = instaladores.find(i => i.id === parseInt(asigForm.instalador_id));
      setObras(os => os.map(o => o.id === asigModal.id ? { ...o, instalador_id: inst.id, instalador: inst.nombre, estado: "Pendiente", fecha_inst: asigForm.fecha_inst } : o));
      setAsig(null); showToast("Instalador asignado ✓");
    }

    function registrarPago() {
      if (!pagoForm.monto) return;
      const monto = parseFloat(pagoForm.monto);
      setObras(os => os.map(o => {
        if (o.id !== pagoModal.id) return o;
        const pagado = r2(o.pagado + monto);
        return { ...o, pagado, estado: pagado >= o.valor_inst ? "Pagada" : "Parcial" };
      }));
      setPago(null); showToast("Pago registrado ✓");
    }

    return (
      <div>
        {sinAsignar > 0 && (
          <div style={{ background:"#fef7e0", border:"1px solid var(--warn)", borderRadius:"var(--r-sm)", padding:"10px 16px", marginBottom:16, fontSize:13, color:"#92400e" }}>
            ⚠ <b>{sinAsignar}</b> obra(s) sin instalador asignado
          </div>
        )}

        <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:16, flexWrap:"wrap" }}>
          <div className="sbar"><span style={{color:"var(--on-sur4)"}}>🔍</span><input placeholder="Buscar por cliente o factura..." value={q} onChange={e=>setQ(e.target.value)}/></div>
          <select style={{padding:"8px 14px",borderRadius:"var(--rfull)",border:"1px solid var(--out)",background:"var(--sur)",fontFamily:"inherit",fontSize:13,outline:"none"}} value={filtro} onChange={e=>setFiltro(e.target.value)}>
            <option value="todos">Todos</option>
            {Object.keys(EST_OBRA).map(k=><option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        <div className="card"><div className="twrap"><table>
          <thead><tr><th>Factura</th><th>Cliente</th><th>Fecha</th><th>Pie²</th><th>Valor Inst.</th><th>Pagado</th><th>Instalador</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={9} style={{textAlign:"center",padding:48,color:"var(--on-sur4)"}}>Sin obras</td></tr>}
            {filtered.map(o => {
              const pend = r2(o.valor_inst - o.pagado);
              const ec   = EST_OBRA[o.estado] || EST_OBRA["Sin Asignar"];
              return (
                <tr key={o.id}>
                  <td><span className="mono" style={{fontWeight:700,color:"var(--pri)",fontSize:12}}>{o.factura}</span><div style={{fontSize:10,color:"var(--on-sur4)"}}>{o.pedido}</div></td>
                  <td style={{fontWeight:500}}>{o.cliente}</td>
                  <td className="mono" style={{fontSize:12}}>{fmtDate(o.fecha_fact)}</td>
                  <td className="mono">{o.pie} ft²</td>
                  <td><span className="mono" style={{fontWeight:600}}>{fmtRD(o.valor_inst)}</span></td>
                  <td>
                    <span className="mono" style={{color:o.pagado>=o.valor_inst?"var(--sec)":o.pagado>0?"var(--warn)":"var(--on-sur4)"}}>{fmtRD(o.pagado)}</span>
                    {pend > 0 && <div style={{fontSize:10,color:"var(--err)"}}>{fmtRD(pend)} pend.</div>}
                  </td>
                  <td>
                    {o.instalador
                      ? <div><div style={{fontSize:13,fontWeight:500}}>{o.instalador}</div>{o.fecha_inst&&<div style={{fontSize:11,color:"var(--on-sur3)"}}>{fmtDate(o.fecha_inst)}</div>}</div>
                      : <span style={{color:"var(--on-sur4)",fontSize:12}}>Sin asignar</span>}
                  </td>
                  <td><span className={`chip ${ec.cls}`} style={{fontSize:11}}>{ec.label}</span></td>
                  <td>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {o.estado === "Sin Asignar" && (
                        <button style={{fontSize:11,padding:"4px 10px",background:"var(--pri-lt)",color:"var(--pri)",border:"1px solid var(--pri-lt2)",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}
                          onClick={()=>{setAsig(o);setAsigF({instalador_id:"",fecha_inst:""});}}>
                          👷 Asignar
                        </button>
                      )}
                      {o.estado !== "Sin Asignar" && o.estado !== "Pagada" && (
                        <button style={{fontSize:11,padding:"4px 10px",background:"var(--sec-lt)",color:"var(--sec)",border:"1px solid #a8d5b5",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}
                          onClick={()=>{setPago(o);setPagoF({fecha:today(),monto:pend,metodo:"Transferencia",ref:""});}}>
                          💳 Pagar
                        </button>
                      )}
                      {o.instalador && o.estado === "Sin Asignar" || (o.estado !== "Sin Asignar") ? (
                        <button style={{fontSize:11,padding:"4px 10px",background:"var(--sur3)",color:"var(--on-sur3)",border:"1px solid var(--out)",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}
                          onClick={()=>{setAsig(o);setAsigF({instalador_id:o.instalador_id||"",fecha_inst:o.fecha_inst||""});}}>
                          ✏️
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table></div></div>

        {/* Asignar modal */}
        {asigModal && (
          <div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setAsig(null);}}>
            <div className="modal" style={{maxWidth:440}}>
              <div className="modal-hdr"><div><div className="modal-ttl">Asignar Instalador</div><div style={{fontSize:12,color:"var(--on-sur3)",marginTop:2}}>{asigModal.cliente} · {asigModal.factura}</div></div><button className="icon-btn" onClick={()=>setAsig(null)}>✕</button></div>
              <div className="modal-bdy">
                <div style={{background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",fontSize:13}}>
                  <span style={{color:"var(--on-sur3)"}}>Valor instalación</span>
                  <span className="mono" style={{fontWeight:700,color:"var(--pri)"}}>{fmtRD(asigModal.valor_inst)}</span>
                </div>
                <div className="fgrid" style={{gap:13}}>
                  <div className="fld"><label>Instalador *</label>
                    <select value={asigForm.instalador_id} onChange={e=>setAsigF(f=>({...f,instalador_id:e.target.value}))}>
                      <option value="">— Seleccionar —</option>
                      {instaladores.filter(i=>i.activo).map(i=>(
                        <option key={i.id} value={i.id}>{i.nombre} · {i.comision}%</option>
                      ))}
                    </select>
                  </div>
                  {asigForm.instalador_id && (() => {
                    const inst = instaladores.find(i=>i.id===parseInt(asigForm.instalador_id));
                    const com  = r2(asigModal.valor_inst * (inst?.comision||0) / 100);
                    return (
                      <div style={{background:"var(--sec-lt)",borderRadius:"var(--r-sm)",padding:"10px 14px",fontSize:13}}>
                        <div style={{color:"var(--sec)",fontWeight:600}}>Comisión estimada</div>
                        <div className="mono" style={{fontSize:18,fontWeight:700,color:"var(--sec)",marginTop:4}}>{fmtRD(com)}</div>
                        <div style={{fontSize:11,color:"var(--on-sur3)",marginTop:2}}>{inst?.comision}% de {fmtRD(asigModal.valor_inst)}</div>
                      </div>
                    );
                  })()}
                  <div className="fld"><label>Fecha de instalación</label><input type="date" value={asigForm.fecha_inst} onChange={e=>setAsigF(f=>({...f,fecha_inst:e.target.value}))}/></div>
                </div>
              </div>
              <div className="modal-ftr"><button className="btn btn-text" onClick={()=>setAsig(null)}>Cancelar</button><button className="btn btn-filled" onClick={asignar} disabled={!asigForm.instalador_id}>Asignar</button></div>
            </div>
          </div>
        )}

        {/* Pago modal */}
        {pagoModal && (
          <div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setPago(null);}}>
            <div className="modal" style={{maxWidth:420}}>
              <div className="modal-hdr"><div><div className="modal-ttl">Registrar Pago de Instalación</div><div style={{fontSize:12,color:"var(--on-sur3)",marginTop:2}}>{pagoModal.cliente} · Instalador: {pagoModal.instalador}</div></div><button className="icon-btn" onClick={()=>setPago(null)}>✕</button></div>
              <div className="modal-bdy">
                <div style={{background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"10px 14px",marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}><span style={{color:"var(--on-sur3)"}}>Valor total</span><span className="mono" style={{fontWeight:600}}>{fmtRD(pagoModal.valor_inst)}</span></div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}><span style={{color:"var(--on-sur3)"}}>Pagado</span><span className="mono" style={{color:"var(--sec)"}}>{fmtRD(pagoModal.pagado)}</span></div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:700}}><span>Pendiente</span><span className="mono" style={{color:"var(--err)"}}>{fmtRD(pagoModal.valor_inst-pagoModal.pagado)}</span></div>
                </div>
                <div className="fgrid f2" style={{gap:12}}>
                  <div className="fld"><label>Fecha</label><input type="date" value={pagoForm.fecha} onChange={e=>setPagoF(f=>({...f,fecha:e.target.value}))}/></div>
                  <div className="fld"><label>Monto</label><input type="number" value={pagoForm.monto} onChange={e=>setPagoF(f=>({...f,monto:e.target.value}))}/></div>
                  <div className="fld"><label>Método</label>
                    <select value={pagoForm.metodo} onChange={e=>setPagoF(f=>({...f,metodo:e.target.value}))}>
                      {["Transferencia","Efectivo","Cheque","Tarjeta"].map(m=><option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="fld"><label>Referencia</label><input value={pagoForm.ref} onChange={e=>setPagoF(f=>({...f,ref:e.target.value}))} placeholder="TRF-001"/></div>
                </div>
              </div>
              <div className="modal-ftr"><button className="btn btn-text" onClick={()=>setPago(null)}>Cancelar</button><button className="btn btn-filled" onClick={registrarPago} disabled={!pagoForm.monto}>Guardar pago</button></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── TAB INSTALADORES ─────────────────────────────────────────────────────
  function TabInstaladores() {
    const [modal, setModal] = useState(null);
    const [sel,   setSel]   = useState(null);
    const [form,  setForm]  = useState({});
    const sf = k => e => setForm(f=>({...f,[k]:e.target.value}));

    function openNew() { setForm({codigo:`INS-${String(instaladores.length+1).padStart(3,"0")}`,nombre:"",cedula:"",tel:"",celular:"",comision:7,tipo:"Porcentaje",activo:true,notas:""}); setSel(null); setModal("inst"); }
    function openEdit(i) { setForm({...i}); setSel(i); setModal("inst"); }
    function save() {
      if(!form.nombre?.trim())return;
      if(sel){setInst(is=>is.map(i=>i.id===sel.id?{...i,...form}:i));}
      else{setInst(is=>[...is,{...form,id:Date.now()}]);}
      setModal(null); setSel(null); showToast("Instalador guardado ✓");
    }

    return (
      <div>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
          <button className="btn btn-filled" onClick={openNew}>＋ Nuevo Instalador</button>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
          {instaladores.map(inst => {
            const obrasAsig = obras.filter(o=>o.instalador_id===inst.id);
            const pendPago  = obrasAsig.filter(o=>o.estado!=="Pagada").reduce((s,o)=>s+(o.valor_inst-o.pagado),0);
            return (
              <div key={inst.id} className="card" style={{opacity:inst.activo?1:0.6}}>
                <div style={{padding:"16px 16px 12px",display:"flex",gap:14,alignItems:"flex-start"}}>
                  <div style={{width:48,height:48,borderRadius:"50%",background:inst.activo?"var(--pri)":"var(--sur3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:inst.activo?"#fff":"var(--on-sur4)",flexShrink:0}}>
                    {inst.nombre.split(" ").map(n=>n[0]).slice(0,2).join("")}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15}}>{inst.nombre}</div>
                    <div style={{fontSize:12,color:"var(--on-sur3)",marginTop:2}}>{inst.tel}{inst.celular?" · "+inst.celular:""}</div>
                    <div style={{fontSize:11,color:"var(--on-sur4)",marginTop:1}}>Cédula: {inst.cedula||"—"}</div>
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderTop:"1px solid var(--out)",borderBottom:"1px solid var(--out)"}}>
                  {[
                    ["Comisión", `${inst.comision}%`],
                    ["Obras",    obrasAsig.length],
                    ["CxP",     pendPago>0?fmtRD(pendPago):"✓"],
                  ].map(([l,v])=>(
                    <div key={l} style={{padding:"10px 12px",textAlign:"center",borderRight:"1px solid var(--out)"}}>
                      <div style={{fontSize:14,fontWeight:700,color:l==="CxP"&&pendPago>0?"var(--warn)":"var(--on-sur)"}}>{v}</div>
                      <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1,color:"var(--on-sur4)",marginTop:2}}>{l}</div>
                    </div>
                  ))}
                </div>

                <div style={{padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span className={`chip ${inst.activo?"chip-filled-sec":"chip-filled-err"}`} style={{fontSize:11}}>{inst.activo?"Activo":"Inactivo"}</span>
                  <div style={{display:"flex",gap:6}}>
                    <button className="btn-sm-ghost" onClick={()=>openEdit(inst)}>✏️ Editar</button>
                    <button style={{fontSize:11,padding:"4px 10px",background:inst.activo?"#fce8e6":"var(--sec-lt)",color:inst.activo?"var(--err)":"var(--sec)",border:`1px solid ${inst.activo?"#fad2cf":"#a8d5b5"}`,borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}
                      onClick={()=>setInst(is=>is.map(i=>i.id===inst.id?{...i,activo:!i.activo}:i))}>
                      {inst.activo?"Desactivar":"Activar"}
                    </button>
                  </div>
                </div>

                {inst.notas && <div style={{padding:"0 16px 12px",fontSize:12,color:"var(--on-sur3)"}}>📝 {inst.notas}</div>}
              </div>
            );
          })}
        </div>

        {modal==="inst" && (
          <div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget){setModal(null);setSel(null);}}}>
            <div className="modal" style={{maxWidth:500}}>
              <div className="modal-hdr"><div className="modal-ttl">{sel?"Editar instalador":"Nuevo instalador"}</div><button className="icon-btn" onClick={()=>{setModal(null);setSel(null);}}>✕</button></div>
              <div className="modal-bdy">
                <div className="fgrid f2" style={{gap:13}}>
                  <div className="fld"><label>Código</label><input value={form.codigo||""} onChange={sf("codigo")}/></div>
                  <div className="fld"><label>Estado</label><select value={form.activo?"activo":"inactivo"} onChange={e=>setForm(f=>({...f,activo:e.target.value==="activo"}))}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></div>
                  <div className="fld" style={{gridColumn:"1/-1"}}><label>Nombre completo *</label><input value={form.nombre||""} onChange={sf("nombre")} autoFocus/></div>
                  <div className="fld"><label>Cédula</label><input value={form.cedula||""} onChange={sf("cedula")} placeholder="001-0000000-0"/></div>
                  <div className="fld"><label>Teléfono</label><input value={form.tel||""} onChange={sf("tel")} placeholder="809-000-0000"/></div>
                  <div className="fld"><label>Celular</label><input value={form.celular||""} onChange={sf("celular")} placeholder="829-000-0000"/></div>
                  <div className="fld"><label>Comisión %</label><input type="number" min="0" max="100" value={form.comision||0} onChange={sf("comision")}/></div>
                  <div className="fld" style={{gridColumn:"1/-1"}}><label>Notas</label><textarea value={form.notas||""} onChange={sf("notas")} style={{background:"var(--sur2)",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",padding:"8px 12px",fontFamily:"inherit",fontSize:13,color:"var(--on-sur)",outline:"none",width:"100%",resize:"vertical",minHeight:56}}/></div>
                </div>
              </div>
              <div className="modal-ftr"><button className="btn btn-text" onClick={()=>{setModal(null);setSel(null);}}>Cancelar</button><button className="btn btn-filled" onClick={save} disabled={!form.nombre?.trim()}>Guardar</button></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── TAB PRECIOS ──────────────────────────────────────────────────────────
  function TabPrecios() {
    const [editP, setEditP]   = useState(null);
    const [editT, setEditT]   = useState(null);
    const [newTr, setNewTr]   = useState({ ciudad:"", barrio:"", precio:0 });
    const [addTr, setAddTr]   = useState(false);

    function saveP(id, field, val) {
      setPrecios(ps=>ps.map(p=>p.id===id?{...p,[field]:parseFloat(val)||0}:p));
      setEditP(null);
    }

    function saveTr(id, field, val) {
      setTransp(ts=>ts.map(t=>t.id===id?{...t,[field]:field==="precio"?parseFloat(val)||0:val}:t));
      setEditT(null);
    }

    function addTransporte() {
      if(!newTr.ciudad.trim())return;
      setTransp(ts=>[...ts,{...newTr,id:Date.now(),precio:parseFloat(newTr.precio)||0}]);
      setNewTr({ciudad:"",barrio:"",precio:0}); setAddTr(false);
      showToast("Precio de transporte agregado ✓");
    }

    return (
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,alignItems:"start"}}>
        {/* Precios de instalación */}
        <div>
          <div className="card">
            <div className="card-hdr">
              <div className="card-ttl">Precios de Instalación por Tipo</div>
              <div style={{fontSize:12,color:"var(--on-sur3)"}}>RD$/pie²</div>
            </div>
            <div className="twrap"><table>
              <thead><tr><th>Código</th><th>Tipo</th><th>RD$/pie²</th><th></th></tr></thead>
              <tbody>
                {precios.map(p=>(
                  <tr key={p.id}>
                    <td className="mono" style={{fontSize:11,color:"var(--on-sur3)"}}>{p.codigo}</td>
                    <td style={{fontWeight:500}}>{p.descripcion}</td>
                    <td>
                      {editP===p.id
                        ? <input type="number" min="0" step="0.5" defaultValue={p.precio_pie} autoFocus
                            onBlur={e=>saveP(p.id,"precio_pie",e.target.value)}
                            onKeyDown={e=>{if(e.key==="Enter")saveP(p.id,"precio_pie",e.target.value);if(e.key==="Escape")setEditP(null);}}
                            style={{width:80,border:"1.5px solid var(--pri)",borderRadius:6,padding:"4px 8px",fontFamily:"JetBrains Mono,monospace",fontSize:13,outline:"none",background:"var(--sur)",color:"var(--on-sur)"}}/>
                        : <span className="mono" style={{fontWeight:600,color:"var(--pri)",cursor:"pointer"}} onClick={()=>setEditP(p.id)}>{p.precio_pie.toFixed(2)}</span>
                      }
                    </td>
                    <td><button className="btn-sm-ghost" onClick={()=>setEditP(p.id)}>✏️</button></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
            <div style={{padding:"10px 16px",fontSize:12,color:"var(--on-sur4)"}}>Haz clic en el precio para editarlo directamente</div>
          </div>
        </div>

        {/* Precios de transporte */}
        <div>
          <div className="card">
            <div className="card-hdr">
              <div className="card-ttl">Precios de Transporte</div>
              <button className="btn btn-sm btn-outlined" onClick={()=>setAddTr(true)}>＋ Agregar</button>
            </div>
            <div className="twrap"><table>
              <thead><tr><th>Ciudad</th><th>Barrio / Zona</th><th>Precio RD$</th><th></th></tr></thead>
              <tbody>
                {transporte.map(t=>(
                  <tr key={t.id}>
                    <td style={{fontWeight:500}}>{t.ciudad}</td>
                    <td style={{color:"var(--on-sur3)",fontSize:13}}>{t.barrio||"—"}</td>
                    <td>
                      {editT===t.id
                        ? <input type="number" min="0" defaultValue={t.precio} autoFocus
                            onBlur={e=>saveTr(t.id,"precio",e.target.value)}
                            onKeyDown={e=>{if(e.key==="Enter")saveTr(t.id,"precio",e.target.value);if(e.key==="Escape")setEditT(null);}}
                            style={{width:90,border:"1.5px solid var(--pri)",borderRadius:6,padding:"4px 8px",fontFamily:"JetBrains Mono,monospace",fontSize:13,outline:"none",background:"var(--sur)",color:"var(--on-sur)"}}/>
                        : <span className="mono" style={{fontWeight:600,cursor:"pointer"}} onClick={()=>setEditT(t.id)}>{fmtRD(t.precio)}</span>
                      }
                    </td>
                    <td>
                      <div style={{display:"flex",gap:4}}>
                        <button className="btn-sm-ghost" onClick={()=>setEditT(t.id)}>✏️</button>
                        <button style={{background:"none",border:"none",cursor:"pointer",color:"var(--err)",fontSize:16}} onClick={()=>setTransp(ts=>ts.filter(x=>x.id!==t.id))}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {addTr && (
                  <tr style={{background:"var(--pri-lt)"}}>
                    <td><input value={newTr.ciudad} onChange={e=>setNewTr(f=>({...f,ciudad:e.target.value}))} placeholder="Ciudad" autoFocus style={{width:"100%",border:"1px solid var(--pri)",borderRadius:6,padding:"4px 8px",fontFamily:"inherit",fontSize:13,background:"var(--sur)",outline:"none"}}/></td>
                    <td><input value={newTr.barrio} onChange={e=>setNewTr(f=>({...f,barrio:e.target.value}))} placeholder="Barrio (opc.)" style={{width:"100%",border:"1px solid var(--out)",borderRadius:6,padding:"4px 8px",fontFamily:"inherit",fontSize:13,background:"var(--sur)",outline:"none"}}/></td>
                    <td><input type="number" min="0" value={newTr.precio} onChange={e=>setNewTr(f=>({...f,precio:e.target.value}))} style={{width:90,border:"1px solid var(--out)",borderRadius:6,padding:"4px 8px",fontFamily:"JetBrains Mono,monospace",fontSize:13,background:"var(--sur)",outline:"none"}}/></td>
                    <td>
                      <div style={{display:"flex",gap:4}}>
                        <button style={{background:"var(--sec-lt)",color:"var(--sec)",border:"1px solid #a8d5b5",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:11,padding:"3px 10px"}} onClick={addTransporte}>✓</button>
                        <button style={{background:"none",border:"none",cursor:"pointer",color:"var(--err)",fontSize:16}} onClick={()=>setAddTr(false)}>✕</button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table></div>
          </div>
        </div>
      </div>
    );
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  const TABS = [
    { id:"asignacion",  label:"🔧 Obras / Asignación", count:sinAsignar||null, alert:true },
    { id:"instaladores",label:"👷 Instaladores" },
    { id:"precios",     label:"💲 Precios" },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        {[
          { l:"Obras activas",    n:obras.length,                                             i:"🔧", bg:"var(--sur3)" },
          { l:"Sin asignar",      n:sinAsignar,                                               i:"⚠️", bg:sinAsignar>0?"#fef7e0":"var(--sec-lt)" },
          { l:"Pendiente cobrar", n:fmtRD(totalPend),                                         i:"💰", bg:"var(--pri-lt)" },
          { l:"Instaladores",     n:instaladores.filter(i=>i.activo).length,                  i:"👷", bg:"var(--sec-lt)" },
        ].map(s=>(
          <div key={s.l} className="stat-card">
            <div className="stat-icon-wrap" style={{background:s.bg}}>{s.i}</div>
            <div className="stat-num" style={{fontSize:typeof s.n==="string"?16:28}}>{s.n}</div>
            <div className="stat-lbl">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="seg-tabs" style={{marginBottom:20}}>
        {TABS.map(t=>(
          <button key={t.id} className={"seg-tab"+(tab===t.id?" on":"")} onClick={()=>setTab(t.id)}>
            {t.label}
            {t.count>0&&<span style={{marginLeft:6,background:t.alert?"var(--warn)":"var(--pri)",color:"#fff",borderRadius:12,fontSize:10,fontWeight:700,padding:"1px 6px",verticalAlign:"middle"}}>{t.count}</span>}
          </button>
        ))}
      </div>

      {tab==="asignacion"   && <TabAsignacion/>}
      {tab==="instaladores" && <TabInstaladores/>}
      {tab==="precios"      && <TabPrecios/>}

      {toast && <div className="toast-msg">{toast}</div>}
    </div>
  );
}
