/**
 * DESPACHOS
 * 3 tabs:
 *  1. Pendientes  — órdenes listas para despachar
 *  2. Historial   — despachos realizados
 *  3. Materiales  — materiales despachados por orden
 */
import { useState } from "react";

function fmtRD(n)   { return `RD$${Math.round(n||0).toLocaleString("es-DO")}`; }
function today()    { return new Date().toISOString().slice(0,10); }
function fmtDate(d) { return d ? new Date(d+"T12:00:00").toLocaleDateString("es-DO",{day:"2-digit",month:"short",year:"numeric"}) : "—"; }
function fmtDateTime(d) { return d ? new Date(d).toLocaleDateString("es-DO",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}) : "—"; }

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_PENDIENTES = [
  {
    id:1, orden:"ORD-001", cotizacion:"COT-001", factura:"FAC-001",
    cliente:"Constructora Pérez & Asociados", tel:"809-555-1234",
    dir:"Calle Las Palmas #42, Sto. Domingo",
    completada:"2025-06-12", entrega_pactada:"2025-06-15",
    pie:134, valor:104430,
    instalador:"Carlos Méndez",
    despacho1:"",  despacho2:"", ensamble:"", instalacion:"",
    lineas:[
      {id:11, desc:"Corrediza Tradicional 48×60\" Natural ×4", cant:4, depto:"Ventanas", peso:"120 kg"},
      {id:12, desc:"Corrediza Tradicional 36×48\" Natural ×6", cant:6, depto:"Ventanas", peso:"90 kg"},
      {id:13, desc:"Puerta Comercial 36×84\" Bronce ×1",       cant:1, depto:"Puertas",  peso:"45 kg"},
    ],
    notas:"Edificio residencial — acceso por garaje lateral",
  },
  {
    id:2, orden:"ORD-002", cotizacion:"COT-002", factura:"FAC-002",
    cliente:"Ferretería El Martillo", tel:"829-555-5678",
    dir:"Av. Independencia #210, Santiago",
    completada:"2025-06-13", entrega_pactada:"2025-06-18",
    pie:50, valor:19000,
    instalador:"Rafael Torres",
    despacho1:"",  despacho2:"", ensamble:"", instalacion:"",
    lineas:[
      {id:21, desc:"Corrediza P-65 60×72\" Natural ×2",  cant:2, depto:"Ventanas", peso:"80 kg"},
      {id:22, desc:"Persiana Tipo A 36×48\" Natural ×4",  cant:4, depto:"Persianas", peso:"40 kg"},
    ],
    notas:"",
  },
];

const DEMO_HISTORIAL = [
  {
    id:10, orden:"ORD-004", cotizacion:"COT-004", factura:"FAC-004",
    cliente:"Inmobiliaria Vista Verde", tel:"809-555-3456",
    dir:"Km 14.5, Autopista Duarte, Sto. Domingo",
    despachado:"2025-06-10T09:30:00", entrega_real:"2025-06-10",
    transportista:"Pedro Núñez", vehiculo:"Camión Toyota Dyna JR3412",
    recibido_por:"Juan García", firma:true,
    pie:168, valor:68440,
    satisfaccion:"✅ Entrega perfecta",
    lineas:[
      {id:41, desc:"Corrediza P-92 72×84\" Anodizado Bronce ×4", cant:4, depto:"Ventanas", peso:"210 kg"},
    ],
    notas:"",
  },
  {
    id:11, orden:"ORD-006", cotizacion:"COT-005", factura:"FAC-005",
    cliente:"Persianas del Norte", tel:"809-555-7890",
    dir:"Calle 5ta #88, Santiago de los Caballeros",
    despachado:"2025-06-08T14:00:00", entrega_real:"2025-06-09",
    transportista:"Luis Marte", vehiculo:"Pickup Hilux P456-78",
    recibido_por:"Carmen Díaz", firma:true,
    pie:80, valor:38000,
    satisfaccion:"⚠️ Llegó 1 día tarde",
    lineas:[
      {id:61, desc:"Persiana Tipo AA 48×60\" Natural ×8", cant:8, depto:"Persianas", peso:"120 kg"},
    ],
    notas:"Retardo por lluvia en autopista Duarte",
  },
];

const DEMO_MATERIALES = [
  {
    id:1, orden:"ORD-001", cliente:"Constructora Pérez", fecha:"2025-06-11",
    items:[
      {codigo:"GK-40-N",  desc:"Perfil GK-40 Natural 21 pies",        cant:12, unidad:"Barra",  costo:14400 },
      {codigo:"GK-44-N",  desc:"Perfil GK-44 Natural 21 pies",        cant:8,  unidad:"Barra",  costo:7600  },
      {codigo:"FLT3/16",  desc:"Vidrio Liso 3/16 Natural (4×8)",      cant:6,  unidad:"Lámina", costo:18600 },
      {codigo:"RD-GK4",   desc:"Ruedas GK 4 patas (bolsa 10)",        cant:12, unidad:"Bolsa",  costo:2160  },
      {codigo:"JENC-N",   desc:"Jamba Enganche Natural",               cant:5,  unidad:"Barra",  costo:1750  },
    ],
    total_costo:44510, despachado:true,
  },
  {
    id:2, orden:"ORD-002", cliente:"Ferretería El Martillo", fecha:"2025-06-12",
    items:[
      {codigo:"P65-N",    desc:"Perfil P-65 Natural 21 pies",          cant:6,  unidad:"Barra",  costo:8400  },
      {codigo:"PER-A-N",  desc:"Perfil Persiana Tipo A Natural",        cant:10, unidad:"Barra",  costo:7000  },
      {codigo:"FLT1/4",   desc:"Vidrio Liso 1/4 Natural (4×8)",        cant:3,  unidad:"Lámina", costo:10500 },
    ],
    total_costo:25900, despachado:false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
export default function Despachos() {
  const [tab,       setTab]   = useState("pendientes");
  const [pendientes,setPend]  = useState(DEMO_PENDIENTES);
  const [historial, setHist]  = useState(DEMO_HISTORIAL);
  const [materiales,setMat]   = useState(DEMO_MATERIALES);
  const [toast,     setToast] = useState("");
  const [modal,     setModal] = useState(null);   // { tipo, data }

  function showToast(msg){ setToast(msg); setTimeout(()=>setToast(""),2600); }

  // ── TAB PENDIENTES ────────────────────────────────────────────────────────
  function TabPendientes() {
    const [sel,   setSel]   = useState(null);
    const [dForm, setDForm] = useState({ fecha:today(), transportista:"", vehiculo:"", recibido_por:"", notas_desp:"", despacho1:"Despacho Piezas", despacho2:"", ensamble:"", instalacion:"" });

    const vencidas = pendientes.filter(p=>p.entrega_pactada < today());

    function liberar(p) {
      setSel(p);
      setDForm(f=>({...f, fecha:today(), transportista:"", vehiculo:"", recibido_por:"" }));
    }

    function confirmarDespacho() {
      if (!dForm.transportista.trim()) return;
      const desp = {
        id: Date.now(), orden:sel.orden, cotizacion:sel.cotizacion, factura:sel.factura,
        cliente:sel.cliente, tel:sel.tel, dir:sel.dir,
        despachado: new Date().toISOString(), entrega_real: dForm.fecha,
        transportista:dForm.transportista, vehiculo:dForm.vehiculo,
        recibido_por:dForm.recibido_por, firma:!!dForm.recibido_por,
        pie:sel.pie, valor:sel.valor, satisfaccion:"⏳ Pendiente confirmación",
        lineas:[...sel.lineas], notas:dForm.notas_desp,
      };
      setHist(hs=>[desp,...hs]);
      setPend(ps=>ps.filter(p=>p.id!==sel.id));
      setSel(null);
      showToast(`${sel.orden} despachada ✓`);
    }

    if (sel) return (
      <div>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
          <button className="btn btn-text" onClick={()=>setSel(null)}>← Pendientes</button>
          <div style={{fontSize:18,fontWeight:700}}>Registrar despacho — {sel.orden}</div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:20,alignItems:"start"}}>
          <div>
            {/* Cliente y orden */}
            <div className="card" style={{marginBottom:16}}>
              <div className="card-hdr"><div className="card-ttl">Datos de la orden</div></div>
              <div className="card-bdy">
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  {[
                    ["Cliente",           sel.cliente],
                    ["Teléfono",          sel.tel],
                    ["Dirección entrega", sel.dir],
                    ["Factura",           sel.factura],
                    ["Orden",             sel.orden],
                    ["Instalador",        sel.instalador||"—"],
                  ].map(([l,v])=>(
                    <div key={l} style={{gridColumn:l==="Dirección entrega"?"1/-1":""}}>
                      <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:1,color:"var(--on-sur4)",marginBottom:2}}>{l}</div>
                      <div style={{fontSize:14,fontWeight:500}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Artículos a despachar */}
            <div className="card" style={{marginBottom:16}}>
              <div className="card-hdr"><div className="card-ttl">Artículos a despachar</div><div style={{fontSize:12,color:"var(--on-sur3)"}}>{sel.pie} ft²</div></div>
              <div className="twrap"><table>
                <thead><tr><th>Descripción</th><th>Cant.</th><th>Depto.</th><th>Peso est.</th></tr></thead>
                <tbody>
                  {sel.lineas.map(l=>(
                    <tr key={l.id}>
                      <td style={{fontWeight:500,fontSize:13}}>{l.desc}</td>
                      <td style={{textAlign:"center"}}>×{l.cant}</td>
                      <td><span className="chip" style={{fontSize:11}}>{l.depto}</span></td>
                      <td style={{fontSize:12,color:"var(--on-sur3)"}}>{l.peso}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>

            {/* Datos del despacho */}
            <div className="card">
              <div className="card-hdr"><div className="card-ttl">Datos del transporte</div></div>
              <div className="card-bdy">
                <div className="fgrid f2" style={{gap:14}}>
                  <div className="fld"><label>Fecha de entrega</label><input type="date" value={dForm.fecha} onChange={e=>setDForm(f=>({...f,fecha:e.target.value}))}/></div>
                  <div className="fld"><label>Transportista *</label><input value={dForm.transportista} onChange={e=>setDForm(f=>({...f,transportista:e.target.value}))} placeholder="Nombre del transportista" autoFocus/></div>
                  <div className="fld"><label>Vehículo / Placa</label><input value={dForm.vehiculo} onChange={e=>setDForm(f=>({...f,vehiculo:e.target.value}))} placeholder="Toyota Hilux P123-45"/></div>
                  <div className="fld"><label>Recibido por (cliente)</label><input value={dForm.recibido_por} onChange={e=>setDForm(f=>({...f,recibido_por:e.target.value}))} placeholder="Nombre del receptor"/></div>
                  <div className="fld" style={{gridColumn:"1/-1"}}><label>Notas del despacho</label>
                    <textarea value={dForm.notas_desp} onChange={e=>setDForm(f=>({...f,notas_desp:e.target.value}))} style={{background:"var(--sur2)",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",padding:"8px 12px",fontFamily:"inherit",fontSize:13,color:"var(--on-sur)",outline:"none",width:"100%",resize:"vertical",minHeight:60}}/>
                  </div>
                </div>

                <div style={{marginTop:16}}>
                  <div style={{fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,color:"var(--on-sur3)",marginBottom:10}}>Control de estados de entrega</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    {[
                      {k:"despacho1",  l:"Despacho 1"},
                      {k:"despacho2",  l:"Despacho 2"},
                      {k:"ensamble",   l:"Ensamble"},
                      {k:"instalacion",l:"Instalación"},
                    ].map(({k,l})=>(
                      <div key={k} className="fld">
                        <label>{l}</label>
                        <select value={dForm[k]} onChange={e=>setDForm(f=>({...f,[k]:e.target.value}))}>
                          <option value="">— Pendiente —</option>
                          <option value="Despachado">Despachado</option>
                          <option value="Ensamblado">Ensamblado</option>
                          <option value="Instalado">Instalado</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div style={{position:"sticky",top:80}}>
            <div className="card" style={{marginBottom:12}}>
              <div className="card-bdy">
                {[["Factura",fmtRD(sel.valor)],["Pie²",`${sel.pie} ft²`],["Entrega pactada",fmtDate(sel.entrega_pactada)]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--out)",fontSize:13}}>
                    <span style={{color:"var(--on-sur3)"}}>{l}</span>
                    <span style={{fontWeight:600}}>{v}</span>
                  </div>
                ))}
                {sel.entrega_pactada<today()&&(
                  <div style={{background:"#fce8e6",borderRadius:"var(--r-sm)",padding:"8px 12px",marginTop:8,fontSize:12,color:"var(--err)",fontWeight:600}}>
                    ⚠ Entrega vencida — notificar al cliente
                  </div>
                )}
              </div>
            </div>
            <button className="btn btn-filled" style={{width:"100%",background:"var(--sec)",marginBottom:8}} onClick={confirmarDespacho} disabled={!dForm.transportista.trim()}>
              🚛 Confirmar Despacho
            </button>
            <button className="btn btn-text" style={{width:"100%"}} onClick={()=>setSel(null)}>Cancelar</button>
          </div>
        </div>
      </div>
    );

    return (
      <div>
        {vencidas.length>0&&(
          <div style={{background:"#fce8e6",border:"1px solid #fad2cf",borderRadius:"var(--r-sm)",padding:"10px 16px",marginBottom:16,fontSize:13,color:"var(--err)"}}>
            ⚠ <b>{vencidas.length}</b> despacho(s) vencido(s) — fecha de entrega ya pasó
          </div>
        )}

        {pendientes.length===0?(
          <div style={{textAlign:"center",padding:"64px 24px",color:"var(--on-sur4)"}}>
            <div style={{fontSize:48,marginBottom:12}}>✅</div>
            <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>Todo despachado</div>
            <div style={{fontSize:13}}>No hay órdenes pendientes de entrega</div>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {pendientes.sort((a,b)=>a.entrega_pactada.localeCompare(b.entrega_pactada)).map(p=>{
              const vencida = p.entrega_pactada < today();
              const hoy     = p.entrega_pactada === today();
              return(
                <div key={p.id} className="card" style={{border:`1.5px solid ${vencida?"var(--err)":hoy?"var(--warn)":"var(--out)"}`}}>
                  <div style={{padding:"16px 20px",display:"flex",gap:16,alignItems:"flex-start"}}>
                    <div style={{width:48,height:48,borderRadius:"var(--r-sm)",background:vencida?"#fce8e6":hoy?"#fef7e0":"var(--pri-lt)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>
                      🚛
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4,flexWrap:"wrap"}}>
                        <span style={{fontWeight:700,fontSize:15,color:"var(--pri)"}}>{p.orden}</span>
                        <span className="chip" style={{fontSize:11}}>{p.factura}</span>
                        {vencida&&<span className="chip chip-filled-err" style={{fontSize:11}}>⚠ Vencida</span>}
                        {hoy&&<span className="chip chip-filled-warn" style={{fontSize:11}}>⏰ Hoy</span>}
                      </div>
                      <div style={{fontWeight:600,fontSize:15,marginBottom:4}}>{p.cliente}</div>
                      <div style={{fontSize:13,color:"var(--on-sur3)",marginBottom:6}}>📍 {p.dir}</div>
                      <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:12,color:"var(--on-sur3)"}}>
                        <span>📅 Entrega: <b style={{color:vencida?"var(--err)":hoy?"var(--warn)":"var(--on-sur)"}}>{fmtDate(p.entrega_pactada)}</b></span>
                        <span>📐 {p.pie} ft²</span>
                        <span>💰 {fmtRD(p.valor)}</span>
                        {p.instalador&&<span>👷 {p.instalador}</span>}
                        <span>📦 {p.lineas.length} artículo(s)</span>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8,flexShrink:0}}>
                      <button className="btn btn-outlined" onClick={()=>setModal({tipo:"detalle",data:p})}>Ver detalles</button>
                      <button className="btn btn-filled" style={{background:"var(--sec)"}} onClick={()=>liberar(p)}>
                        🚛 Despachar
                      </button>
                    </div>
                  </div>
                  {p.notas&&<div style={{padding:"0 20px 14px",fontSize:12,color:"var(--on-sur3)"}}>📝 {p.notas}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── TAB HISTORIAL ────────────────────────────────────────────────────────
  function TabHistorial() {
    const [q,setQ]=useState("");
    const filtered=historial.filter(h=>h.cliente.toLowerCase().includes(q.toLowerCase())||h.orden.toLowerCase().includes(q.toLowerCase()));
    return(
      <div>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}>
          <div className="sbar"><span style={{color:"var(--on-sur4)"}}>🔍</span><input placeholder="Buscar por orden o cliente..." value={q} onChange={e=>setQ(e.target.value)}/></div>
        </div>

        {filtered.length===0?(
          <div style={{textAlign:"center",padding:48,color:"var(--on-sur4)"}}>Sin despachos en el historial</div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {filtered.map(h=>(
              <div key={h.id} className="card">
                <div style={{padding:"16px 20px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap"}}>
                        <span style={{fontWeight:700,color:"var(--pri)",fontSize:14}}>{h.orden}</span>
                        <span className="chip" style={{fontSize:11}}>{h.factura}</span>
                        <span className="chip chip-filled-sec" style={{fontSize:11}}>✓ Despachado</span>
                      </div>
                      <div style={{fontWeight:600,fontSize:15,marginBottom:4}}>{h.cliente}</div>
                      <div style={{fontSize:12,color:"var(--on-sur3)",marginBottom:4}}>📍 {h.dir}</div>
                      <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:12,color:"var(--on-sur3)"}}>
                        <span>🚛 {fmtDateTime(h.despachado)}</span>
                        <span>👤 {h.transportista}</span>
                        <span>🚗 {h.vehiculo}</span>
                        {h.recibido_por&&<span>✍️ Recibido: {h.recibido_por}</span>}
                        <span>📐 {h.pie} ft²</span>
                        <span>💰 {fmtRD(h.valor)}</span>
                      </div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:12,color:"var(--on-sur3)",marginBottom:4}}>{h.satisfaccion}</div>
                      <button className="btn btn-sm btn-outlined" onClick={()=>showToast("Reimprimir conduce ✓")}>🖨 Reimprimir</button>
                    </div>
                  </div>
                  {h.notas&&<div style={{marginTop:8,fontSize:12,color:"var(--on-sur3)",background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"8px 12px"}}>📝 {h.notas}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── TAB MATERIALES ───────────────────────────────────────────────────────
  function TabMateriales() {
    const [sel,setSel]=useState(null);
    return(
      <div>
        <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:16,alignItems:"start"}}>
          {/* Sidebar list */}
          <div className="card">
            <div className="card-hdr"><div className="card-ttl">Órdenes</div></div>
            <div style={{padding:"8px 0"}}>
              {materiales.map(m=>(
                <div key={m.id} onClick={()=>setSel(m)}
                  style={{padding:"12px 16px",cursor:"pointer",background:sel?.id===m.id?"var(--pri-lt)":"transparent",borderLeft:sel?.id===m.id?"3px solid var(--pri)":"3px solid transparent",transition:"all .15s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontWeight:700,color:"var(--pri)",fontSize:13}}>{m.orden}</span>
                    <span className={`chip ${m.despachado?"chip-filled-sec":"chip-filled-warn"}`} style={{fontSize:10}}>{m.despachado?"Despachado":"Pendiente"}</span>
                  </div>
                  <div style={{fontSize:12,color:"var(--on-sur2)",fontWeight:500}}>{m.cliente}</div>
                  <div style={{fontSize:11,color:"var(--on-sur4)",marginTop:2}}>{fmtDate(m.fecha)} · {m.items.length} materiales</div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail */}
          {sel?(
            <div className="card">
              <div className="card-hdr">
                <div>
                  <div className="card-ttl">Materiales — {sel.orden}</div>
                  <div style={{fontSize:12,color:"var(--on-sur3)",marginTop:2}}>{sel.cliente} · {fmtDate(sel.fecha)}</div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button className="btn btn-outlined" onClick={()=>showToast("Req. materiales impreso ✓")}>🖨 Imprimir</button>
                  {!sel.despachado&&(
                    <button className="btn btn-filled" style={{background:"var(--sec)"}} onClick={()=>{setMat(ms=>ms.map(m=>m.id===sel.id?{...m,despachado:true}:m));setSel(s=>({...s,despachado:true}));showToast("Materiales marcados como despachados ✓");}}>
                      ✓ Marcar como despachado
                    </button>
                  )}
                </div>
              </div>
              <div className="twrap"><table>
                <thead><tr><th>Código</th><th>Descripción</th><th>Cant.</th><th>Unidad</th><th>Costo</th></tr></thead>
                <tbody>
                  {sel.items.map((it,i)=>(
                    <tr key={i}>
                      <td><span className="mono" style={{fontSize:11,color:"var(--on-sur3)"}}>{it.codigo}</span></td>
                      <td style={{fontWeight:500}}>{it.desc}</td>
                      <td style={{textAlign:"center",fontWeight:700}}>{it.cant}</td>
                      <td style={{fontSize:12,color:"var(--on-sur3)"}}>{it.unidad}</td>
                      <td><span className="mono" style={{color:"var(--pri)",fontWeight:600}}>{fmtRD(it.costo)}</span></td>
                    </tr>
                  ))}
                  <tr style={{background:"var(--sur2)"}}>
                    <td colSpan={4} style={{fontWeight:700,textAlign:"right",padding:"10px 16px"}}>Costo total materiales</td>
                    <td><span className="mono" style={{fontWeight:700,color:"var(--sec)",fontSize:15}}>{fmtRD(sel.total_costo)}</span></td>
                  </tr>
                </tbody>
              </table></div>
            </div>
          ):(
            <div style={{textAlign:"center",padding:"64px 24px",color:"var(--on-sur4)"}}>
              <div style={{fontSize:40,marginBottom:12}}>📦</div>
              <div style={{fontWeight:600}}>Selecciona una orden</div>
              <div style={{fontSize:13,marginTop:4}}>para ver los materiales despachados</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  const vencidas = pendientes.filter(p=>p.entrega_pactada<today()).length;
  const hoy_     = pendientes.filter(p=>p.entrega_pactada===today()).length;

  // ── RENDER ────────────────────────────────────────────────────────────────
  return(
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        {[
          {l:"Pendientes",      n:pendientes.length, i:"🚛", bg:pendientes.length>0?"var(--pri-lt)":"var(--sec-lt)"},
          {l:"Para hoy",        n:hoy_,              i:"⏰", bg:hoy_>0?"#fef7e0":"var(--sec-lt)"},
          {l:"Vencidos",        n:vencidas,          i:"⚠️",  bg:vencidas>0?"#fce8e6":"var(--sec-lt)"},
          {l:"Despachados",     n:historial.length,  i:"✅", bg:"var(--sec-lt)"},
        ].map(s=>(
          <div key={s.l} className="stat-card">
            <div className="stat-icon-wrap" style={{background:s.bg}}>{s.i}</div>
            <div className="stat-num">{s.n}</div>
            <div className="stat-lbl">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="seg-tabs" style={{marginBottom:20}}>
        {[
          {id:"pendientes",label:`🚛 Pendientes${pendientes.length>0?` (${pendientes.length})`:""}`, alert:vencidas>0},
          {id:"historial", label:"📋 Historial"},
          {id:"materiales",label:"📦 Materiales"},
        ].map(t=>(
          <button key={t.id} className={"seg-tab"+(tab===t.id?" on":"")} onClick={()=>setTab(t.id)}>
            {t.label}
            {t.alert&&<span style={{marginLeft:6,background:"var(--err)",color:"#fff",borderRadius:12,fontSize:10,fontWeight:700,padding:"1px 6px",verticalAlign:"middle"}}>{vencidas}</span>}
          </button>
        ))}
      </div>

      {tab==="pendientes" && <TabPendientes/>}
      {tab==="historial"  && <TabHistorial/>}
      {tab==="materiales" && <TabMateriales/>}

      {/* Modal detalle */}
      {modal?.tipo==="detalle" && (
        <div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setModal(null);}}>
          <div className="modal" style={{maxWidth:560}}>
            <div className="modal-hdr">
              <div><div className="modal-ttl">{modal.data.orden} — {modal.data.cliente}</div><div style={{fontSize:12,color:"var(--on-sur3)",marginTop:2}}>{modal.data.factura} · {fmtDate(modal.data.entrega_pactada)}</div></div>
              <button className="icon-btn" onClick={()=>setModal(null)}>✕</button>
            </div>
            <div className="modal-bdy">
              <div style={{marginBottom:12,fontSize:13,color:"var(--on-sur3)"}}>📍 {modal.data.dir}</div>
              <div className="twrap"><table>
                <thead><tr><th>Artículo</th><th>Cant.</th><th>Dpto.</th></tr></thead>
                <tbody>{modal.data.lineas.map(l=><tr key={l.id}><td style={{fontWeight:500}}>{l.desc}</td><td style={{textAlign:"center"}}>×{l.cant}</td><td><span className="chip" style={{fontSize:11}}>{l.depto}</span></td></tr>)}</tbody>
              </table></div>
              {modal.data.notas&&<div style={{marginTop:12,background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"10px 14px",fontSize:13,color:"var(--on-sur2)"}}>📝 {modal.data.notas}</div>}
            </div>
            <div className="modal-ftr">
              <button className="btn btn-text" onClick={()=>setModal(null)}>Cerrar</button>
              <button className="btn btn-filled" style={{background:"var(--sec)"}} onClick={()=>{setModal(null);}}>🚛 Ir a despachar</button>
            </div>
          </div>
        </div>
      )}

      {toast&&<div className="toast-msg">{toast}</div>}
    </div>
  );
}
