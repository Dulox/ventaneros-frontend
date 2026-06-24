/**
 * ÓRDENES DE PRODUCCIÓN — Módulo expandido
 *
 * Flujo: Borrador → Pendiente Auth → Autorizada → En Producción → Completada
 *
 * 3 vistas:
 *  1. Lista       — todas las órdenes, filtros, acciones rápidas
 *  2. Formulario  — crear/editar con líneas (ID-Hueco, tipo, medidas, color, cant.)
 *  3. Detalle     — flujo visual + líneas + tickets + cambio de estado
 */
import { useState } from "react";

// ── Helpers ───────────────────────────────────────────────────────────────────
function today()    { return new Date().toISOString().slice(0,10); }
function fmtDate(d) { return d ? new Date(d+"T12:00:00").toLocaleDateString("es-DO",{day:"2-digit",month:"short",year:"numeric"}) : "—"; }
function r2(n)      { return Math.round((n||0)*100)/100; }
function nextNum(lista) { return `ORD-${String(lista.length+1).padStart(3,"0")}`; }

const TIPOS  = ["Corrediza Tradicional","Persiana Tipo A","Persiana Tipo AA","Corrediza P-65","Corrediza P-92","Puerta Comercial","Puerta Residencial"];
const COLORES= ["Natural","Lacado Blanco","Lacado Bronce","Anodizado Bronce","Negro","Mill Finish","Karatachi","LBCO"];
const DEPTOS = ["Ventanas","Puertas","Persianas","Herrajes","Vidrios"];

// ── Flujo de estados ──────────────────────────────────────────────────────────
const FLUJO = ["Borrador","Pendiente Auth","Autorizada","En Producción","Completada"];
const EST_CFG = {
  "Borrador":       { cls:"chip",             next:["Pendiente Auth","Cancelada"] },
  "Pendiente Auth": { cls:"chip-filled-warn", next:["Autorizada","Cancelada"] },
  "Autorizada":     { cls:"chip-filled-pri",  next:["En Producción"] },
  "En Producción":  { cls:"chip-filled-pri",  next:["Completada"] },
  "Completada":     { cls:"chip-filled-sec",  next:[] },
  "Cancelada":      { cls:"chip-filled-err",  next:[] },
};

// ── Demo data ─────────────────────────────────────────────────────────────────
function newLinea(i=0) {
  return { id: Date.now()+i+Math.random(), hueco:`H${i+1}`, tipo:"Corrediza Tradicional", ancho:"48", alto:"60", hojas:2, color:"Natural", cant:1, depto:"Ventanas", notas:"" };
}

const DEMO = [
  {
    id:1, numero:"ORD-001", cotizacion:"COT-001",
    cliente:"Constructora Pérez & Asociados", tel:"809-555-1234",
    fecha:"2025-06-01", entrega:"2025-06-15",
    responsable:"Roberto Santos", prioridad:3,
    estado:"Completada", autorizado_por:"Mario Vuk", autorizado_en:"2025-06-01",
    barras_std:21, notas:"Proyecto residencial — sector norte",
    lineas:[
      {id:11,hueco:"H1",tipo:"Corrediza Tradicional",ancho:"48",alto:"60",hojas:2,color:"Natural",cant:4,depto:"Ventanas",notas:"Sala principal"},
      {id:12,hueco:"H2",tipo:"Corrediza Tradicional",ancho:"36",alto:"48",hojas:2,color:"Natural",cant:6,depto:"Ventanas",notas:"Habitaciones"},
      {id:13,hueco:"H3",tipo:"Puerta Comercial",ancho:"36",alto:"84",hojas:1,color:"Lacado Bronce",cant:1,depto:"Puertas",notas:"Entrada principal"},
    ],
    tickets:["TKT-001","TKT-002","TKT-003"],
  },
  {
    id:2, numero:"ORD-002", cotizacion:"COT-002",
    cliente:"Ferretería El Martillo", tel:"829-555-5678",
    fecha:"2025-06-03", entrega:"2025-06-18",
    responsable:"Roberto Santos", prioridad:2,
    estado:"En Producción", autorizado_por:"Mario Vuk", autorizado_en:"2025-06-03",
    barras_std:21, notas:"",
    lineas:[
      {id:21,hueco:"H1",tipo:"Corrediza P-65",ancho:"60",alto:"72",hojas:2,color:"Natural",cant:2,depto:"Ventanas",notas:""},
      {id:22,hueco:"H2",tipo:"Persiana Tipo A",ancho:"36",alto:"48",hojas:1,color:"Natural",cant:4,depto:"Persianas",notas:""},
    ],
    tickets:["TKT-004"],
  },
  {
    id:3, numero:"ORD-003", cotizacion:"COT-003",
    cliente:"María González", tel:"849-555-9012",
    fecha:"2025-06-08", entrega:"2025-06-25",
    responsable:"—", prioridad:1,
    estado:"Pendiente Auth", autorizado_por:null, autorizado_en:null,
    barras_std:21, notas:"Cliente solicita entrega urgente",
    lineas:[
      {id:31,hueco:"H1",tipo:"Puerta Comercial",ancho:"36",alto:"84",hojas:1,color:"Natural",cant:1,depto:"Puertas",notas:""},
    ],
    tickets:[],
  },
  {
    id:4, numero:"ORD-004", cotizacion:"COT-004",
    cliente:"Inmobiliaria Vista Verde", tel:"809-555-3456",
    fecha:"2025-06-10", entrega:"2025-06-30",
    responsable:"—", prioridad:2,
    estado:"Borrador", autorizado_por:null, autorizado_en:null,
    barras_std:21, notas:"",
    lineas:[
      {id:41,hueco:"H1",tipo:"Corrediza P-92",ancho:"72",alto:"84",hojas:4,color:"Anodizado Bronce",cant:4,depto:"Ventanas",notas:"Fachada"},
    ],
    tickets:[],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
export default function Ordenes() {
  const [lista, setLista] = useState(DEMO);
  const [view,  setView]  = useState("list");   // list | form | detail | autorizar
  const [form,  setForm]  = useState(null);
  const [sel,   setSel]   = useState(null);
  const [toast, setToast] = useState("");

  function showToast(msg){ setToast(msg); setTimeout(()=>setToast(""),2600); }

  function goList()  { setView("list");  setForm(null); setSel(null); }

  function openNew() {
    setForm({ id:null, numero:nextNum(lista), cotizacion:"", cliente:"", tel:"", fecha:today(), entrega:"", responsable:"", prioridad:2, estado:"Borrador", barras_std:21, notas:"", lineas:[newLinea(0)], tickets:[], autorizado_por:null, autorizado_en:null });
    setView("form");
  }

  function openEdit(o) {
    setForm({ ...o, lineas: o.lineas.map(l=>({...l})) });
    setView("form");
  }

  function openDetail(o) {
    setSel(lista.find(x=>x.id===o.id)||o);
    setView("detail");
  }

  function save() {
    if (!form.cliente.trim()) return;
    if (form.id) {
      setLista(ls=>ls.map(x=>x.id===form.id?{...form}:x));
      setSel({...form}); setView("detail");
    } else {
      const n = {...form, id:Date.now()};
      setLista(ls=>[...ls,n]);
      setSel(n); setView("detail");
    }
    showToast("Orden guardada ✓");
  }

  function cambiarEstado(id, est) {
    const extra = {};
    if (est==="Autorizada")    { extra.autorizado_por="Mario Vuk"; extra.autorizado_en=today(); }
    if (est==="En Producción") { extra.tickets=[`TKT-${String(Math.floor(Math.random()*900)+100)}`]; }
    setLista(ls=>ls.map(x=>x.id===id?{...x,estado:est,...extra}:x));
    setSel(s=>({...s,estado:est,...extra}));
    showToast(`Estado → ${est}`);
  }

  // ── stats ────────────────────────────────────────────────────────────────
  const pendAuth = lista.filter(o=>o.estado==="Pendiente Auth").length;
  const enProd   = lista.filter(o=>o.estado==="En Producción").length;
  const totalPie = lista.reduce((s,o)=>s+o.lineas.reduce((ss,l)=>ss+r2((parseFloat(l.ancho)||0)*(parseFloat(l.alto)||0)*(parseInt(l.cant)||0)/144),0),0);

  // ════════════════════════════════════════════════════════════════════════════
  // FORM
  // ════════════════════════════════════════════════════════════════════════════
  if (view==="form" && form) {
    const sf = k => e => setForm(f=>({...f,[k]:e.target.value}));

    function addLinea()     { setForm(f=>({...f,lineas:[...f.lineas,newLinea(f.lineas.length)]})); }
    function removeLinea(id){ setForm(f=>({...f,lineas:f.lineas.filter(l=>l.id!==id)})); }
    function updateLinea(id,k,v){ setForm(f=>({...f,lineas:f.lineas.map(l=>l.id===id?{...l,[k]:v}:l)})); }

    const totalLinPie = form.lineas.reduce((s,l)=>s+r2((parseFloat(l.ancho)||0)*(parseFloat(l.alto)||0)*(parseInt(l.cant)||0)/144),0);

    return (
      <div>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
          <button className="btn btn-text" onClick={goList}>← Volver</button>
          <div style={{fontSize:20,fontWeight:700}}>{form.id?`Editar ${form.numero}`:"Nueva Orden de Producción"}</div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:20,alignItems:"start"}}>
          <div>
            {/* Datos generales */}
            <div className="card" style={{marginBottom:16}}>
              <div className="card-hdr"><div className="card-ttl">Datos Generales</div></div>
              <div className="card-bdy">
                <div className="fgrid f2" style={{gap:14}}>
                  <div className="fld" style={{gridColumn:"1/-1"}}><label>Cliente *</label><input value={form.cliente} onChange={sf("cliente")} placeholder="Nombre o empresa" autoFocus/></div>
                  <div className="fld"><label>Teléfono</label><input value={form.tel} onChange={sf("tel")} placeholder="809-000-0000"/></div>
                  <div className="fld"><label>Cotización ref.</label><input value={form.cotizacion} onChange={sf("cotizacion")} placeholder="COT-001"/></div>
                  <div className="fld"><label>Fecha</label><input type="date" value={form.fecha} onChange={sf("fecha")}/></div>
                  <div className="fld"><label>Fecha de entrega</label><input type="date" value={form.entrega} onChange={sf("entrega")}/></div>
                  <div className="fld"><label>Responsable de producción</label><input value={form.responsable} onChange={sf("responsable")} placeholder="Nombre del encargado"/></div>
                  <div className="fld"><label>Prioridad (1=baja, 3=alta)</label>
                    <select value={form.prioridad} onChange={sf("prioridad")}>
                      <option value={1}>1 — Baja</option>
                      <option value={2}>2 — Normal</option>
                      <option value={3}>3 — Alta ⚡</option>
                    </select>
                  </div>
                  <div className="fld"><label>Barras estándar (pies)</label><input type="number" value={form.barras_std} onChange={sf("barras_std")} min="1"/></div>
                  <div className="fld" style={{gridColumn:"1/-1"}}><label>Notas</label>
                    <textarea value={form.notas} onChange={sf("notas")} style={{background:"var(--sur2)",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",padding:"8px 12px",fontFamily:"inherit",fontSize:13,color:"var(--on-sur)",outline:"none",width:"100%",resize:"vertical",minHeight:64}}/>
                  </div>
                </div>
              </div>
            </div>

            {/* Líneas */}
            <div className="card">
              <div className="card-hdr">
                <div className="card-ttl">Líneas de producción ({form.lineas.length})</div>
                <button className="btn btn-sm btn-outlined" onClick={addLinea}>＋ Agregar línea</button>
              </div>
              <div className="card-bdy" style={{padding:0}}>
                {form.lineas.map((l,i)=>(
                  <div key={l.id} style={{padding:"16px 20px",borderBottom:i<form.lineas.length-1?"1px solid var(--out)":"none"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{fontWeight:700,fontSize:13,color:"var(--pri)"}}>Línea {i+1}</div>
                        <input value={l.hueco} onChange={e=>updateLinea(l.id,"hueco",e.target.value)}
                          placeholder="ID Hueco" style={{width:72,padding:"4px 8px",border:"1px solid var(--out)",borderRadius:6,fontFamily:"JetBrains Mono,monospace",fontSize:12,background:"var(--sur2)",color:"var(--pri)",fontWeight:700,outline:"none"}}/>
                      </div>
                      {form.lineas.length>1 && <button style={{background:"none",border:"none",cursor:"pointer",color:"var(--err)",fontSize:18}} onClick={()=>removeLinea(l.id)}>🗑</button>}
                    </div>
                    <div className="fgrid f2" style={{gap:12}}>
                      <div className="fld" style={{gridColumn:"1/-1"}}>
                        <label>Tipo</label>
                        <select value={l.tipo} onChange={e=>updateLinea(l.id,"tipo",e.target.value)}>
                          {TIPOS.map(t=><option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="fld"><label>Ancho (pulg.)</label><input type="number" step="0.5" value={l.ancho} onChange={e=>updateLinea(l.id,"ancho",e.target.value)} placeholder='48"'/></div>
                      <div className="fld"><label>Alto (pulg.)</label><input type="number" step="0.5" value={l.alto}  onChange={e=>updateLinea(l.id,"alto",e.target.value)}  placeholder='60"'/></div>
                      <div className="fld"><label>Hojas</label>
                        <select value={l.hojas} onChange={e=>updateLinea(l.id,"hojas",e.target.value)}>
                          {[1,2,3,4,6].map(h=><option key={h} value={h}>{h} hoja{h>1?"s":""}</option>)}
                        </select>
                      </div>
                      <div className="fld"><label>Cantidad</label><input type="number" min="1" value={l.cant} onChange={e=>updateLinea(l.id,"cant",e.target.value)}/></div>
                      <div className="fld"><label>Color / Material</label>
                        <select value={l.color} onChange={e=>updateLinea(l.id,"color",e.target.value)}>
                          {COLORES.map(c=><option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="fld"><label>Departamento</label>
                        <select value={l.depto} onChange={e=>updateLinea(l.id,"depto",e.target.value)}>
                          {DEPTOS.map(d=><option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="fld" style={{gridColumn:"1/-1"}}><label>Notas de la línea</label><input value={l.notas} onChange={e=>updateLinea(l.id,"notas",e.target.value)} placeholder="Instrucciones especiales..."/></div>
                    </div>
                    {/* Pie² calculated */}
                    {l.ancho && l.alto && (
                      <div style={{marginTop:8,fontSize:12,color:"var(--sec)",fontWeight:600,fontFamily:"JetBrains Mono,monospace"}}>
                        = {r2((parseFloat(l.ancho)||0)*(parseFloat(l.alto)||0)*(parseInt(l.cant)||0)/144)} ft²
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{position:"sticky",top:80}}>
            <div className="card" style={{marginBottom:12}}>
              <div className="card-hdr"><div className="card-ttl">Resumen</div></div>
              <div className="card-bdy">
                {[
                  ["Líneas",     form.lineas.length],
                  ["Pietaje total", `${r2(totalLinPie)} ft²`],
                  ["Barras std.", `${form.barras_std} pies`],
                  ["Prioridad",  form.prioridad===3?"⚡ Alta":form.prioridad===2?"Normal":"Baja"],
                ].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--out)",fontSize:13}}>
                    <span style={{color:"var(--on-sur3)"}}>{l}</span>
                    <span className="mono" style={{fontWeight:600}}>{v}</span>
                  </div>
                ))}
                {/* By department */}
                {Object.entries(form.lineas.reduce((acc,l)=>{acc[l.depto]=(acc[l.depto]||0)+1;return acc;},{})).map(([d,n])=>(
                  <div key={d} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:12}}>
                    <span style={{color:"var(--on-sur4)"}}>{d}</span>
                    <span className="mono" style={{color:"var(--on-sur3)"}}>{n} línea{n>1?"s":""}</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn btn-filled" style={{width:"100%",marginBottom:8}} onClick={save} disabled={!form.cliente.trim()}>
              {form.id?"Guardar cambios":"Crear Orden"}
            </button>
            <button className="btn btn-text" style={{width:"100%"}} onClick={goList}>Cancelar</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DETAIL
  // ════════════════════════════════════════════════════════════════════════════
  if (view==="detail" && sel) {
    const o   = lista.find(x=>x.id===sel.id)||sel;
    const ec  = EST_CFG[o.estado]||EST_CFG["Borrador"];
    const pie = r2(o.lineas.reduce((s,l)=>s+r2((parseFloat(l.ancho)||0)*(parseFloat(l.alto)||0)*(parseInt(l.cant)||0)/144),0));

    // Group lines by department
    const byDepto = o.lineas.reduce((acc,l)=>{
      if(!acc[l.depto])acc[l.depto]=[];
      acc[l.depto].push(l); return acc;
    },{});

    return (
      <div>
        <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:20,flexWrap:"wrap"}}>
          <button className="btn btn-text" onClick={goList}>← Órdenes</button>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <span style={{fontSize:22,fontWeight:700}}>{o.numero}</span>
              <span className={`chip ${ec.cls}`}>{o.estado}</span>
              {o.prioridad===3&&<span className="chip chip-filled-warn">⚡ Alta prioridad</span>}
              {o.cotizacion&&<span className="chip" style={{fontSize:11}}>{o.cotizacion}</span>}
            </div>
            <div style={{fontSize:13,color:"var(--on-sur3)",marginTop:4}}>{o.cliente} · {o.tel} · Entrega: {fmtDate(o.entrega)}</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-outlined" onClick={()=>openEdit(o)}>✏️ Editar</button>
            {o.tickets?.length>0&&<button className="btn btn-outlined" onClick={()=>showToast("Ticket impreso ✓")}>🖨 Tickets ({o.tickets.length})</button>}
          </div>
        </div>

        {/* Flow bar */}
        <div style={{background:"var(--sur)",border:"1px solid var(--out)",borderRadius:"var(--r-md)",padding:"14px 20px",marginBottom:20,display:"flex",alignItems:"center",overflow:"auto"}}>
          {FLUJO.map((e,i,arr)=>{
            const idx   = FLUJO.indexOf(o.estado);
            const done  = i < idx;
            const activ = o.estado===e;
            const canGo = ec.next.includes(e);
            return (
              <div key={e} style={{display:"flex",alignItems:"center",flex:i<arr.length-1?"1":"0"}}>
                <div onClick={()=>canGo&&cambiarEstado(o.id,e)} style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:canGo?"pointer":"default",minWidth:88}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:activ?"var(--pri)":done?"var(--sec)":canGo?"var(--pri-lt)":"var(--sur3)",border:`2px solid ${activ?"var(--pri)":done?"var(--sec)":canGo?"var(--pri)":"var(--out)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:activ||done?"#fff":canGo?"var(--pri)":"var(--on-sur4)",transition:"all .2s"}}>
                    {done&&!activ?"✓":i+1}
                  </div>
                  <div style={{fontSize:11,marginTop:4,fontWeight:activ?700:400,color:activ?"var(--pri)":done?"var(--sec)":canGo?"var(--pri)":"var(--on-sur4)",textAlign:"center",whiteSpace:"nowrap"}}>{e}</div>
                </div>
                {i<arr.length-1&&<div style={{flex:1,height:2,background:done?"var(--sec)":"var(--out)",margin:"0 4px",marginBottom:16}}/>}
              </div>
            );
          })}
        </div>

        {/* Cancelled */}
        {!["Completada","Cancelada"].includes(o.estado) && ec.next.includes("Cancelada") && (
          <div style={{marginBottom:16,textAlign:"right"}}>
            <button className="btn btn-outlined" style={{color:"var(--err)",borderColor:"var(--err)"}} onClick={()=>cambiarEstado(o.id,"Cancelada")}>❌ Cancelar orden</button>
          </div>
        )}

        {/* Auth info */}
        {o.autorizado_por && (
          <div style={{background:"var(--sec-lt)",border:"1px solid #a8d5b5",borderRadius:"var(--r-sm)",padding:"10px 16px",marginBottom:16,fontSize:13,display:"flex",gap:16}}>
            <span>✅ Autorizado por <b>{o.autorizado_por}</b></span>
            <span style={{color:"var(--on-sur3)"}}>{fmtDate(o.autorizado_en)}</span>
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:20}}>
          {/* LEFT — lines by department */}
          <div>
            {Object.entries(byDepto).map(([depto,lineas])=>(
              <div key={depto} className="card" style={{marginBottom:14}}>
                <div className="card-hdr">
                  <div className="card-ttl">🏭 {depto}</div>
                  <div style={{fontSize:12,color:"var(--on-sur3)"}}>{lineas.length} línea{lineas.length>1?"s":""} · {r2(lineas.reduce((s,l)=>s+r2((parseFloat(l.ancho)||0)*(parseFloat(l.alto)||0)*(parseInt(l.cant)||0)/144),0))} ft²</div>
                </div>
                <div className="twrap">
                  <table>
                    <thead><tr><th>Hueco</th><th>Tipo</th><th>Medida</th><th>Hojas</th><th>Color</th><th>Cant.</th><th>Pie²</th><th>Nota</th></tr></thead>
                    <tbody>
                      {lineas.map(l=>{
                        const lPie=r2((parseFloat(l.ancho)||0)*(parseFloat(l.alto)||0)*(parseInt(l.cant)||0)/144);
                        return(
                          <tr key={l.id}>
                            <td><span className="mono" style={{fontWeight:700,color:"var(--pri)",fontSize:12}}>{l.hueco}</span></td>
                            <td style={{fontSize:13}}>{l.tipo}</td>
                            <td><span className="mono" style={{fontSize:12}}>{l.ancho}"×{l.alto}"</span></td>
                            <td style={{textAlign:"center"}}>{l.hojas}H</td>
                            <td style={{fontSize:12,color:"var(--on-sur3)"}}>{l.color}</td>
                            <td style={{textAlign:"center"}}>×{l.cant}</td>
                            <td><span className="mono" style={{fontWeight:600,color:"var(--sec)"}}>{lPie}</span></td>
                            <td style={{fontSize:11,color:"var(--on-sur4)"}}>{l.notas||"—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Tickets */}
            {o.tickets?.length>0 && (
              <div className="card">
                <div className="card-hdr"><div className="card-ttl">🎫 Tickets de producción</div></div>
                <div className="card-bdy">
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {o.tickets.map(t=>(
                      <div key={t} style={{background:"var(--sur2)",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",padding:"8px 14px",fontFamily:"JetBrains Mono,monospace",fontSize:13,fontWeight:600,color:"var(--pri)",cursor:"pointer"}}
                        onClick={()=>showToast(`Ticket ${t} reimprimir ✓`)}>
                        {t} 🖨
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:10}}>
                    <button className="btn btn-sm btn-outlined" onClick={()=>{
                      const newTkt=`TKT-${String(Math.floor(Math.random()*900)+100)}`;
                      setLista(ls=>ls.map(x=>x.id===o.id?{...x,tickets:[...(x.tickets||[]),newTkt]}:x));
                      setSel(s=>({...s,tickets:[...(s.tickets||[]),newTkt]}));
                      showToast(`Ticket ${newTkt} generado ✓`);
                    }}>＋ Generar ticket</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — summary + actions */}
          <div>
            <div className="card" style={{marginBottom:12}}>
              <div className="card-bdy">
                {[
                  ["Cliente",     o.cliente],
                  ["Fecha",       fmtDate(o.fecha)],
                  ["Entrega",     fmtDate(o.entrega)],
                  ["Responsable", o.responsable||"—"],
                  ["Barras std.", `${o.barras_std} pies`],
                  ["Pietaje",     `${pie} ft²`],
                  ["Líneas",      o.lineas.length],
                ].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--out)",fontSize:13}}>
                    <span style={{color:"var(--on-sur3)"}}>{l}</span>
                    <span style={{fontWeight:500,textAlign:"right"}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next action */}
            {ec.next.filter(n=>n!=="Cancelada").map(nx=>(
              <button key={nx} className="btn btn-filled" style={{width:"100%",marginBottom:8,background:nx==="Autorizada"?"var(--sec)":nx==="En Producción"?"var(--pri)":"var(--sec)"}}
                onClick={()=>cambiarEstado(o.id,nx)}>
                {nx==="Pendiente Auth"  &&"📤 Enviar a Autorización"}
                {nx==="Autorizada"      &&"✅ Autorizar Orden"}
                {nx==="En Producción"   &&"🏭 Iniciar Producción"}
                {nx==="Completada"      &&"✓ Marcar como Completada"}
              </button>
            ))}

            {o.notas&&<div style={{marginTop:12,background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"10px 14px",fontSize:12,color:"var(--on-sur2)"}}>📝 {o.notas}</div>}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // LIST (default)
  // ════════════════════════════════════════════════════════════════════════════
  const [q,       setQ]       = useState("");
  const [filtro,  setFiltro]  = useState("todas");
  const [showAuth,setShowAuth]= useState(false);

  const filtered = lista.filter(o=>{
    const m=o.cliente.toLowerCase().includes(q.toLowerCase())||o.numero.toLowerCase().includes(q.toLowerCase());
    return filtro==="todas"?m:m&&o.estado===filtro;
  }).sort((a,b)=>b.prioridad-a.prioridad);

  const authQueue = lista.filter(o=>o.estado==="Pendiente Auth");

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        {[
          {l:"Total órdenes",   n:lista.length,                                                 i:"📋", bg:"var(--sur3)"},
          {l:"Por autorizar",   n:pendAuth,                                                      i:"⏳", bg:pendAuth>0?"#fef7e0":"var(--sec-lt)"},
          {l:"En producción",   n:enProd,                                                        i:"🏭", bg:"var(--pri-lt)"},
          {l:"Pietaje total",   n:`${r2(totalPie)} ft²`,                                         i:"📐", bg:"var(--sur3)"},
        ].map(s=>(
          <div key={s.l} className="stat-card">
            <div className="stat-icon-wrap" style={{background:s.bg}}>{s.i}</div>
            <div className="stat-num" style={{fontSize:typeof s.n==="string"?16:28}}>{s.n}</div>
            <div className="stat-lbl">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Auth queue alert */}
      {pendAuth>0&&(
        <div style={{background:"#fef7e0",border:"1px solid #f9ab00",borderRadius:"var(--r-sm)",padding:"10px 16px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,color:"#92400e"}}>⏳ <b>{pendAuth}</b> orden(es) esperando autorización</span>
          <button className="btn btn-sm" style={{background:"#f9ab00",color:"#fff",border:"none",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:12,padding:"5px 14px"}}
            onClick={()=>setShowAuth(v=>!v)}>
            {showAuth?"Cerrar":"Ver cola"}
          </button>
        </div>
      )}

      {/* Auth queue expanded */}
      {showAuth&&authQueue.length>0&&(
        <div className="card" style={{marginBottom:16,border:"2px solid #f9ab00"}}>
          <div className="card-hdr" style={{background:"#fef7e0"}}><div className="card-ttl" style={{color:"#92400e"}}>⏳ Cola de Autorización</div></div>
          <div className="twrap"><table>
            <thead><tr><th>Orden</th><th>Cliente</th><th>Fecha</th><th>Entrega</th><th>Líneas</th><th>Pie²</th><th>Prioridad</th><th></th></tr></thead>
            <tbody>
              {authQueue.map(o=>{
                const pie=r2(o.lineas.reduce((s,l)=>s+r2((parseFloat(l.ancho)||0)*(parseFloat(l.alto)||0)*(parseInt(l.cant)||0)/144),0));
                return(
                  <tr key={o.id}>
                    <td><span className="mono" style={{fontWeight:700,color:"var(--pri)"}}>{o.numero}</span></td>
                    <td style={{fontWeight:500}}>{o.cliente}</td>
                    <td className="mono" style={{fontSize:12}}>{fmtDate(o.fecha)}</td>
                    <td className="mono" style={{fontSize:12}}>{fmtDate(o.entrega)}</td>
                    <td style={{textAlign:"center"}}>{o.lineas.length}</td>
                    <td className="mono">{pie}</td>
                    <td><span style={{color:o.prioridad===3?"var(--warn)":"var(--on-sur3)",fontWeight:o.prioridad===3?700:400}}>{o.prioridad===3?"⚡ Alta":o.prioridad===2?"Normal":"Baja"}</span></td>
                    <td>
                      <div style={{display:"flex",gap:6}}>
                        <button style={{fontSize:11,padding:"4px 10px",background:"var(--sec-lt)",color:"var(--sec)",border:"1px solid #a8d5b5",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}
                          onClick={()=>cambiarEstado(o.id,"Autorizada")}>✅ Autorizar</button>
                        <button style={{fontSize:11,padding:"4px 10px",background:"var(--pri-lt)",color:"var(--pri)",border:"1px solid var(--pri-lt2)",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}
                          onClick={()=>openDetail(o)}>Ver</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
        <div className="sbar"><span style={{color:"var(--on-sur4)"}}>🔍</span><input placeholder="Buscar por número o cliente..." value={q} onChange={e=>setQ(e.target.value)}/>{q&&<button style={{background:"none",border:"none",cursor:"pointer",color:"var(--on-sur4)",fontSize:16}} onClick={()=>setQ("")}>✕</button>}</div>
        <select style={{padding:"8px 14px",borderRadius:"var(--rfull)",border:"1px solid var(--out)",background:"var(--sur)",fontFamily:"inherit",fontSize:13,outline:"none"}} value={filtro} onChange={e=>setFiltro(e.target.value)}>
          <option value="todas">Todos los estados</option>
          {Object.keys(EST_CFG).map(k=><option key={k} value={k}>{k}</option>)}
        </select>
        <button className="btn btn-filled" onClick={openNew} style={{marginLeft:"auto"}}>＋ Nueva Orden</button>
      </div>

      {/* Table */}
      <div className="card"><div className="twrap"><table>
        <thead><tr><th>Número</th><th>Cliente</th><th>Fecha</th><th>Entrega</th><th>Líneas</th><th>Pie²</th><th>Responsable</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          {filtered.length===0&&<tr><td colSpan={9} style={{textAlign:"center",padding:52,color:"var(--on-sur4)"}}><div style={{fontSize:32,marginBottom:8}}>📋</div>Sin órdenes</td></tr>}
          {filtered.map(o=>{
            const pie=r2(o.lineas.reduce((s,l)=>s+r2((parseFloat(l.ancho)||0)*(parseFloat(l.alto)||0)*(parseInt(l.cant)||0)/144),0));
            const ec=EST_CFG[o.estado]||EST_CFG["Borrador"];
            return(
              <tr key={o.id} style={{cursor:"pointer"}} onClick={()=>openDetail(o)}>
                <td>
                  <span className="mono" style={{fontWeight:700,color:"var(--pri)"}}>{o.numero}</span>
                  {o.prioridad===3&&<span style={{marginLeft:6,fontSize:11}}>⚡</span>}
                </td>
                <td>
                  <div style={{fontWeight:500}}>{o.cliente}</div>
                  {o.cotizacion&&<div style={{fontSize:11,color:"var(--on-sur4)"}}>{o.cotizacion}</div>}
                </td>
                <td className="mono" style={{fontSize:12}}>{fmtDate(o.fecha)}</td>
                <td className="mono" style={{fontSize:12,color:o.entrega<today()&&!["Completada","Cancelada"].includes(o.estado)?"var(--err)":"var(--on-sur3)"}}>{fmtDate(o.entrega)}</td>
                <td style={{textAlign:"center"}}>{o.lineas.length}</td>
                <td><span className="mono">{pie} ft²</span></td>
                <td style={{fontSize:12,color:"var(--on-sur3)"}}>{o.responsable||"—"}</td>
                <td><span className={`chip ${ec.cls}`} style={{fontSize:11}}>{o.estado}</span></td>
                <td onClick={e=>e.stopPropagation()}>
                  <button className="btn-sm-ghost" onClick={()=>openEdit(o)}>✏️</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table></div></div>

      {toast&&<div className="toast-msg">{toast}</div>}
    </div>
  );
}
