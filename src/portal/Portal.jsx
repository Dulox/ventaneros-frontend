/**
 * PORTAL DEL CLIENTE
 *
 * App pública accesible via:
 *   /portal.html?token=abc123
 *
 * El token identifica al cliente. En producción se valida contra Supabase.
 * Sin login, sin contraseña — solo el link.
 *
 * Muestra:
 *  - Resumen del cliente (balance, documentos activos)
 *  - Cotizaciones
 *  - Facturas + estado de pago
 *  - Órdenes de producción
 */
import { useState } from "react";

// ── Styles inlined (standalone app, no shared globalStyles) ──────────────────
const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --pri:#1a73e8; --pri-lt:#e8f0fe; --pri-dk:#0d47a1;
    --sec:#188038; --sec-lt:#e6f4ea;
    --err:#d93025; --err-lt:#fce8e6;
    --warn:#e37400;
    --sur:#ffffff; --sur2:#f8f9fa; --sur3:#f1f3f4;
    --on-sur:#202124; --on-sur2:#3c4043; --on-sur3:#5f6368; --on-sur4:#9aa0a6;
    --out:#dadce0;
    --r-sm:8px; --r-md:12px; --rfull:999px;
    font-family: 'Google Sans', 'Roboto', system-ui, -apple-system, sans-serif;
  }
  body { background:var(--sur3); color:var(--on-sur); min-height:100vh; }
  .mono { font-family: 'JetBrains Mono', 'Roboto Mono', monospace; }
  .card { background:var(--sur); border:1px solid var(--out); border-radius:var(--r-md); overflow:hidden; }
  .chip { display:inline-flex; align-items:center; padding:3px 10px; border-radius:var(--rfull); font-size:11px; font-weight:600; border:1px solid var(--out); background:var(--sur3); color:var(--on-sur3); }
  .chip-sec  { background:var(--sec-lt); color:var(--sec); border-color:#a8d5b5; }
  .chip-warn { background:#fef7e0; color:#92400e; border-color:#f9ab00; }
  .chip-pri  { background:var(--pri-lt); color:var(--pri-dk); border-color:#aecbfa; }
  .chip-err  { background:var(--err-lt); color:var(--err); border-color:#fad2cf; }
  .btn { padding:10px 20px; border-radius:var(--rfull); border:1.5px solid var(--out); background:var(--sur); cursor:pointer; font-family:inherit; font-size:14px; font-weight:600; transition:all .15s; }
  .btn-pri { background:var(--pri); color:#fff; border-color:var(--pri); }
  .btn-pri:hover { background:var(--pri-dk); }
  .btn:hover { background:var(--sur2); }
  table { width:100%; border-collapse:collapse; }
  th { padding:10px 16px; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--on-sur3); text-align:left; font-weight:700; border-bottom:2px solid var(--out); background:var(--sur2); }
  td { padding:12px 16px; border-bottom:1px solid var(--out); font-size:13px; }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background:var(--sur2); }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtRD(n)   { return `RD$${Math.round(n||0).toLocaleString("es-DO")}`; }
function fmtDate(d) { return d ? new Date(d+"T12:00:00").toLocaleDateString("es-DO",{day:"2-digit",month:"long",year:"numeric"}) : "—"; }
function daysLeft(d){ return d ? Math.ceil((new Date(d)-new Date())/86400000) : null; }
function r2(n)      { return Math.round((n||0)*100)/100; }

// ── Token → cliente (en producción: fetch desde Supabase) ─────────────────────
const CLIENTES_DB = {
  "abc123": {
    nombre:"Constructora Pérez & Asociados",
    rnc:"101-12345-6",
    contacto:"Carlos Pérez",
    email:"cperez@perezconstr.do",
    tel:"809-555-1234",
    empresa:{ nombre:"Ventaneros SRL", tel:"809-555-0001", email:"info@ventaneros.do", web:"ventaneros.do" },
    cotizaciones:[
      { id:1, numero:"COT-001", fecha:"2025-06-01", items:["Corrediza 48×60\" ×4","Persiana A 36×48\" ×6"], subtotal:56280, estado:"Facturada", orden:"ORD-001" },
      { id:2, numero:"COT-006", fecha:"2025-06-11", items:["Corrediza P-65 ×3"], subtotal:34200, estado:"Aprobada", orden:null },
    ],
    facturas:[
      { id:1, numero:"FAC-001", ncf:"B01-00000001", fecha:"2025-06-01", vence:"2025-07-01", total:56280, pagado:56280, estado:"Pagada",   items:["Corrediza 48×60\" ×4","Persiana A 36×48\" ×6"] },
      { id:2, numero:"FAC-003", ncf:"B01-00000002", fecha:"2025-05-28", vence:"2025-06-28", total:89208, pagado:40000, estado:"Parcial",  items:["P-92 72×84\" ×4"] },
    ],
    ordenes:[
      { id:1, numero:"ORD-001", cotizacion:"COT-001", fecha:"2025-06-01", entrega:"2025-06-15", pie:134, estado:"Completada",    instalador:"Carlos Méndez" },
      { id:2, numero:"ORD-005", cotizacion:"COT-006", fecha:"2025-06-11", entrega:"2025-06-28", pie:90,  estado:"En Producción", instalador:null },
    ],
  },
  "xyz789": {
    nombre:"Inmobiliaria Vista Verde",
    rnc:"130-98765-4",
    contacto:"Roberto Verde",
    email:"rverde@vistaverde.do",
    tel:"809-555-3456",
    empresa:{ nombre:"Ventaneros SRL", tel:"809-555-0001", email:"info@ventaneros.do", web:"ventaneros.do" },
    cotizaciones:[
      { id:3, numero:"COT-004", fecha:"2025-05-28", items:["P-92 72×84\" ×4"], subtotal:75600, estado:"Facturada", orden:"ORD-004" },
    ],
    facturas:[
      { id:3, numero:"FAC-003", ncf:"B01-00000002", fecha:"2025-05-28", vence:"2025-06-28", total:89208, pagado:40000, estado:"Parcial", items:["P-92 72×84\" ×4"] },
    ],
    ordenes:[
      { id:3, numero:"ORD-004", cotizacion:"COT-004", fecha:"2025-05-28", entrega:"2025-06-10", pie:168, estado:"Completada", instalador:"Carlos Méndez" },
    ],
  },
};

// ── Estado colors ─────────────────────────────────────────────────────────────
const EST_COT = { "Aprobada":"chip-sec", "Pendiente":"chip-warn", "Facturada":"chip-pri", "Borrador":"chip", "Rechazada":"chip-err" };
const EST_FACT= { "Pagada":"chip-sec",   "Pendiente":"chip-warn", "Parcial":"chip-pri",   "Vencida":"chip-err" };
const EST_ORD = {
  "Completada":    { cls:"chip-sec",  icon:"✅" },
  "En Producción": { cls:"chip-pri",  icon:"🏭" },
  "Autorizada":    { cls:"chip-pri",  icon:"✓" },
  "Pendiente Auth":{ cls:"chip-warn", icon:"⏳" },
  "Borrador":      { cls:"chip",      icon:"📝" },
};

// ════════════════════════════════════════════════════════════════════════════════
export default function Portal() {
  // Get token from URL
  const params = new URLSearchParams(window.location.search);
  const token  = params.get("token");
  const cli    = token ? CLIENTES_DB[token] : null;

  const [tab, setTab] = useState("resumen");

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!token || !cli) {
    return (
      <>
        <style>{CSS}</style>
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ textAlign:"center", maxWidth:360 }}>
            <div style={{ fontSize:64, marginBottom:16 }}>🔒</div>
            <div style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>Acceso no válido</div>
            <div style={{ fontSize:14, color:"var(--on-sur3)", lineHeight:1.6 }}>
              Este enlace no es válido o ha expirado. Contacta a tu proveedor para obtener un enlace actualizado.
            </div>
            {cli === null && token && (
              <div style={{ marginTop:16, padding:"10px 16px", background:"var(--err-lt)", borderRadius:"var(--r-sm)", fontSize:12, color:"var(--err)" }}>
                Token no reconocido: <span className="mono">{token}</span>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── Computed ───────────────────────────────────────────────────────────────
  const cxcPend  = cli.facturas.reduce((s,f)=>s+Math.max(0,f.total-f.pagado),0);
  const factsAct = cli.facturas.filter(f=>f.estado!=="Pagada").length;
  const ordenAct = cli.ordenes.filter(o=>o.estado!=="Completada").length;
  const empresa  = cli.empresa;

  // ── Tabs ───────────────────────────────────────────────────────────────────
  const TABS = [
    { id:"resumen",      label:"🏠 Resumen" },
    { id:"cotizaciones", label:`📋 Cotizaciones (${cli.cotizaciones.length})` },
    { id:"facturas",     label:`🧾 Facturas (${cli.facturas.length})` },
    { id:"ordenes",      label:`🏭 Mis Órdenes (${cli.ordenes.length})` },
  ];

  return (
    <>
      <style>{CSS}</style>

      {/* Header */}
      <header style={{ background:"var(--pri)", color:"#fff", padding:"0 24px" }}>
        <div style={{ maxWidth:960, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:60 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:36, height:36, borderRadius:8, background:"rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🪟</div>
            <div>
              <div style={{ fontWeight:700, fontSize:16 }}>{empresa.nombre}</div>
              <div style={{ fontSize:11, opacity:.8 }}>Portal del Cliente</div>
            </div>
          </div>
          <div style={{ fontSize:12, opacity:.8, textAlign:"right" }}>
            <div>{empresa.tel}</div>
            <div>{empresa.email}</div>
          </div>
        </div>
      </header>

      {/* Client banner */}
      <div style={{ background:"var(--sur)", borderBottom:"1px solid var(--out)" }}>
        <div style={{ maxWidth:960, margin:"0 auto", padding:"14px 24px", display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ width:44, height:44, borderRadius:"50%", background:"var(--pri-lt)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, color:"var(--pri)", flexShrink:0 }}>
            {cli.nombre.split(" ").map(n=>n[0]).slice(0,2).join("")}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:17 }}>{cli.nombre}</div>
            <div style={{ fontSize:12, color:"var(--on-sur3)", marginTop:2 }}>
              {cli.rnc && `RNC: ${cli.rnc} · `}{cli.contacto} · {cli.tel}
            </div>
          </div>
          {cxcPend > 0 && (
            <div style={{ background:"#fef7e0", border:"1px solid #f9ab00", borderRadius:"var(--r-sm)", padding:"8px 14px", textAlign:"center" }}>
              <div style={{ fontSize:11, color:"#92400e", marginBottom:2 }}>Balance pendiente</div>
              <div className="mono" style={{ fontWeight:700, fontSize:16, color:"#92400e" }}>{fmtRD(cxcPend)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:"var(--sur)", borderBottom:"1px solid var(--out)", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ maxWidth:960, margin:"0 auto", display:"flex", gap:0, overflowX:"auto" }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{ padding:"14px 20px", border:"none", background:"transparent", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:tab===t.id?700:400, color:tab===t.id?"var(--pri)":"var(--on-sur3)", borderBottom:tab===t.id?"2.5px solid var(--pri)":"2.5px solid transparent", whiteSpace:"nowrap", transition:"all .15s" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:960, margin:"0 auto", padding:"24px 24px 48px" }}>

        {/* RESUMEN */}
        {tab==="resumen" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
              {[
                { l:"Balance pendiente", n:fmtRD(cxcPend),  i:"💸", bg:cxcPend>0?"#fef7e0":"var(--sec-lt)", c:cxcPend>0?"#92400e":"var(--sec)" },
                { l:"Facturas activas",  n:factsAct,         i:"🧾", bg:"var(--pri-lt)", c:"var(--pri)" },
                { l:"Órdenes activas",   n:ordenAct,         i:"🏭", bg:ordenAct>0?"var(--sec-lt)":"var(--sur3)", c:"var(--sec)" },
              ].map(s=>(
                <div key={s.l} style={{ background:s.bg, borderRadius:"var(--r-md)", padding:"20px 18px", textAlign:"center" }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{s.i}</div>
                  <div className="mono" style={{ fontSize:typeof s.n==="string"?18:28, fontWeight:700, color:s.c, marginBottom:4 }}>{s.n}</div>
                  <div style={{ fontSize:12, color:"var(--on-sur3)", textTransform:"uppercase", letterSpacing:1 }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Recent activity */}
            <div className="card" style={{ marginBottom:20 }}>
              <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--out)", fontWeight:700, fontSize:15 }}>Órdenes en progreso</div>
              {cli.ordenes.filter(o=>o.estado!=="Completada").length===0
                ? <div style={{ padding:"32px 20px", textAlign:"center", color:"var(--on-sur4)" }}>✅ Sin órdenes activas</div>
                : cli.ordenes.filter(o=>o.estado!=="Completada").map(o=>{
                    const ec=EST_ORD[o.estado]||EST_ORD["Borrador"];
                    return (
                      <div key={o.id} style={{ padding:"14px 20px", borderBottom:"1px solid var(--out)", display:"flex", alignItems:"center", gap:14 }}>
                        <div style={{ width:40, height:40, borderRadius:8, background:"var(--pri-lt)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{ec.icon}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700, fontSize:14 }}>{o.numero}</div>
                          <div style={{ fontSize:12, color:"var(--on-sur3)", marginTop:2 }}>
                            {o.cotizacion} · Entrega estimada: <b>{fmtDate(o.entrega)}</b>
                          </div>
                        </div>
                        <span className={`chip ${ec.cls}`}>{o.estado}</span>
                      </div>
                    );
                  })
              }
            </div>

            {/* Unpaid invoices */}
            {cli.facturas.filter(f=>f.estado!=="Pagada").length > 0 && (
              <div className="card">
                <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--out)", fontWeight:700, fontSize:15 }}>Facturas por pagar</div>
                {cli.facturas.filter(f=>f.estado!=="Pagada").map(f=>{
                  const pend = Math.max(0, f.total - f.pagado);
                  const days = daysLeft(f.vence);
                  return (
                    <div key={f.id} style={{ padding:"14px 20px", borderBottom:"1px solid var(--out)", display:"flex", alignItems:"center", gap:14 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                          <span style={{ fontWeight:700, fontSize:14 }}>{f.numero}</span>
                          <span className={`chip ${EST_FACT[f.estado]||"chip"}`}>{f.estado}</span>
                        </div>
                        <div style={{ fontSize:12, color:"var(--on-sur3)" }}>
                          Vence: <span style={{ color:days!==null&&days<0?"var(--err)":days!==null&&days<=7?"var(--warn)":"var(--on-sur3)", fontWeight:days!==null&&days<=7?700:400 }}>
                            {fmtDate(f.vence)}{days!==null&&days<0?` (${Math.abs(days)}d vencida)`:days!==null&&days<=7?` (${days}d)` :""}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div className="mono" style={{ fontWeight:700, fontSize:16, color:"var(--err)" }}>{fmtRD(pend)}</div>
                        <div style={{ fontSize:11, color:"var(--on-sur4)" }}>pendiente de {fmtRD(f.total)}</div>
                      </div>
                    </div>
                  );
                })}
                <div style={{ padding:"12px 20px", background:"var(--sur2)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>Para realizar su pago contáctenos:</span>
                  <div style={{ display:"flex", gap:10 }}>
                    <a href={`tel:${empresa.tel}`} style={{ textDecoration:"none" }}>
                      <button className="btn" style={{ fontSize:12, padding:"7px 14px" }}>📞 {empresa.tel}</button>
                    </a>
                    <a href={`https://wa.me/1${empresa.tel.replace(/\D/g,"")}?text=Hola, soy ${cli.nombre}, quisiera coordinar el pago de mis facturas pendientes.`} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}>
                      <button className="btn btn-pri" style={{ fontSize:12, padding:"7px 14px" }}>💬 WhatsApp</button>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* COTIZACIONES */}
        {tab==="cotizaciones" && (
          <div className="card">
            <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--out)", fontWeight:700, fontSize:15 }}>
              Mis Cotizaciones
            </div>
            {cli.cotizaciones.length===0
              ? <div style={{ padding:"40px 20px", textAlign:"center", color:"var(--on-sur4)" }}>Sin cotizaciones</div>
              : cli.cotizaciones.map(c=>(
                <div key={c.id} style={{ padding:"16px 20px", borderBottom:"1px solid var(--out)" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                        <span style={{ fontWeight:700, fontSize:15, color:"var(--pri)" }}>{c.numero}</span>
                        <span className={`chip ${EST_COT[c.estado]||"chip"}`}>{c.estado}</span>
                        {c.orden && <span className="chip chip-pri" style={{ fontSize:11 }}>→ {c.orden}</span>}
                      </div>
                      <div style={{ fontSize:12, color:"var(--on-sur3)", marginBottom:6 }}>📅 {fmtDate(c.fecha)}</div>
                      <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                        {c.items.map((item,i)=>(
                          <div key={i} style={{ fontSize:13, color:"var(--on-sur2)" }}>• {item}</div>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div className="mono" style={{ fontWeight:700, fontSize:18, color:"var(--pri)" }}>{fmtRD(c.subtotal)}</div>
                      <div style={{ fontSize:11, color:"var(--on-sur4)", marginTop:2 }}>subtotal</div>
                    </div>
                  </div>
                  {c.estado==="Aprobada" && (
                    <div style={{ marginTop:12, padding:"10px 14px", background:"var(--sec-lt)", borderRadius:"var(--r-sm)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:13, color:"var(--sec)", fontWeight:600 }}>✅ Cotización aprobada — en proceso de producción</span>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        )}

        {/* FACTURAS */}
        {tab==="facturas" && (
          <div>
            {cli.facturas.map(f=>{
              const pend = Math.max(0, f.total - f.pagado);
              const pct  = r2(f.pagado/f.total*100);
              const days = daysLeft(f.vence);
              return (
                <div key={f.id} className="card" style={{ marginBottom:14 }}>
                  <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--out)", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                        <span style={{ fontWeight:700, fontSize:16, color:"var(--pri)" }}>{f.numero}</span>
                        <span className={`chip ${EST_FACT[f.estado]||"chip"}`}>{f.estado}</span>
                        <span className="chip mono" style={{ fontSize:11 }}>{f.ncf}</span>
                      </div>
                      <div style={{ fontSize:12, color:"var(--on-sur3)" }}>
                        Emitida: {fmtDate(f.fecha)} · Vence: <span style={{ color:days!==null&&days<0?"var(--err)":days!==null&&days<=7?"var(--warn)":"var(--on-sur3)", fontWeight:days!==null&&days<=0?700:400 }}>
                          {fmtDate(f.vence)}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div className="mono" style={{ fontWeight:700, fontSize:20, color:"var(--on-sur)" }}>{fmtRD(f.total)}</div>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ padding:"12px 20px", borderBottom:"1px solid var(--out)" }}>
                    {f.items.map((item,i)=>(
                      <div key={i} style={{ fontSize:13, color:"var(--on-sur2)", padding:"3px 0" }}>• {item}</div>
                    ))}
                  </div>

                  {/* Payment status */}
                  <div style={{ padding:"14px 20px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:13 }}>
                      <span style={{ color:"var(--on-sur3)" }}>Progreso de pago</span>
                      <span style={{ fontWeight:600 }}>{pct}%</span>
                    </div>
                    <div style={{ height:8, background:"var(--sur3)", borderRadius:4, overflow:"hidden", marginBottom:12 }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:pct===100?"var(--sec)":pct>50?"var(--pri)":"var(--warn)", borderRadius:4, transition:"width .5s" }}/>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
                      <div>
                        <span style={{ color:"var(--on-sur3)" }}>Pagado: </span>
                        <span className="mono" style={{ fontWeight:600, color:"var(--sec)" }}>{fmtRD(f.pagado)}</span>
                      </div>
                      {pend > 0 && (
                        <div>
                          <span style={{ color:"var(--on-sur3)" }}>Pendiente: </span>
                          <span className="mono" style={{ fontWeight:700, color:"var(--err)" }}>{fmtRD(pend)}</span>
                        </div>
                      )}
                    </div>

                    {pend > 0 && (
                      <a href={`https://wa.me/1${empresa.tel.replace(/\D/g,"")}?text=Hola, soy ${cli.nombre}. Quisiera realizar el pago de la factura ${f.numero} por ${fmtRD(pend)}.`}
                        target="_blank" rel="noreferrer" style={{ textDecoration:"none", display:"block", marginTop:12 }}>
                        <button className="btn btn-pri" style={{ width:"100%", fontSize:13 }}>
                          💬 Coordinar pago por WhatsApp
                        </button>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ÓRDENES */}
        {tab==="ordenes" && (
          <div>
            {cli.ordenes.map(o=>{
              const ec = EST_ORD[o.estado] || EST_ORD["Borrador"];
              const PASOS = ["Pendiente Auth","Autorizada","En Producción","Completada"];
              const idx   = PASOS.indexOf(o.estado);
              return (
                <div key={o.id} className="card" style={{ marginBottom:14 }}>
                  <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--out)", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <span style={{ fontWeight:700, fontSize:16, color:"var(--pri)" }}>{o.numero}</span>
                        <span className={`chip ${ec.cls}`}>{ec.icon} {o.estado}</span>
                      </div>
                      <div style={{ fontSize:12, color:"var(--on-sur3)" }}>
                        {o.cotizacion} · Entrega estimada: <b>{fmtDate(o.entrega)}</b>
                      </div>
                      {o.instalador && (
                        <div style={{ fontSize:12, color:"var(--on-sur3)", marginTop:2 }}>
                          👷 Instalador: {o.instalador}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div className="mono" style={{ fontWeight:700, fontSize:16, color:"var(--on-sur)" }}>{o.pie} ft²</div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div style={{ padding:"16px 20px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:0 }}>
                      {PASOS.map((p,i)=>{
                        const done   = i < idx;
                        const active = i === idx;
                        const isLast = i === PASOS.length - 1;
                        return (
                          <div key={p} style={{ display:"flex", alignItems:"center", flex:isLast?"0":"1" }}>
                            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", minWidth:72 }}>
                              <div style={{ width:28, height:28, borderRadius:"50%", background:active?"var(--pri)":done?"var(--sec)":"var(--sur3)", border:`2px solid ${active?"var(--pri)":done?"var(--sec)":"var(--out)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:active||done?"#fff":"var(--on-sur4)", fontWeight:700 }}>
                                {done?"✓":i+1}
                              </div>
                              <div style={{ fontSize:10, marginTop:4, color:active?"var(--pri)":done?"var(--sec)":"var(--on-sur4)", textAlign:"center", fontWeight:active?700:400, lineHeight:1.2 }}>
                                {p==="Pendiente Auth"?"En cola":p==="En Producción"?"Fabricando":p}
                              </div>
                            </div>
                            {!isLast && <div style={{ flex:1, height:2, background:done?"var(--sec)":"var(--out)", margin:"0 4px", marginBottom:18 }}/>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Footer */}
      <footer style={{ background:"var(--sur)", borderTop:"1px solid var(--out)", padding:"16px 24px", textAlign:"center" }}>
        <div style={{ maxWidth:960, margin:"0 auto", fontSize:12, color:"var(--on-sur4)" }}>
          {empresa.nombre} · {empresa.tel} · {empresa.email}
          <span style={{ margin:"0 8px" }}>·</span>
          Portal generado por <strong>Ventaneros SRL</strong>
        </div>
      </footer>
    </>
  );
}
