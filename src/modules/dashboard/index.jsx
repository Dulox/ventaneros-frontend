/**
 * DASHBOARD — KPIs reales + gráficas + alertas + acceso rápido
 *
 * Todos los datos vienen de los mismos objetos demo que usan los otros módulos.
 * Cuando se conecte a Supabase, solo cambia de dónde vienen los datos.
 */
import { useState } from "react";

function fmtRD(n) { return `RD$${Math.round(n||0).toLocaleString("es-DO")}`; }
function r2(n)    { return Math.round((n||0)*100)/100; }
function today()  { return new Date().toISOString().slice(0,10); }

// ── Datos compartidos (en producción vendrán del backend) ─────────────────────
const COTIZACIONES = [
  { id:1, numero:"COT-001", cliente:"Constructora Pérez & Asociados", fecha:"2025-06-01", estado:"Aprobada",    sub:56280,  itbis:false },
  { id:2, numero:"COT-002", cliente:"Ferretería El Martillo",          fecha:"2025-06-05", estado:"Pendiente",   sub:19000,  itbis:true  },
  { id:3, numero:"COT-003", cliente:"María González",                   fecha:"2025-06-08", estado:"Borrador",    sub:6800,   itbis:false },
  { id:4, numero:"COT-004", cliente:"Inmobiliaria Vista Verde",          fecha:"2025-05-28", estado:"Rechazada",  sub:75600,  itbis:true  },
  { id:5, numero:"COT-005", cliente:"Persianas del Norte",              fecha:"2025-06-10", estado:"Facturada",   sub:38000,  itbis:false },
  { id:6, numero:"COT-006", cliente:"Aluminios del Este",               fecha:"2025-06-11", estado:"Aprobada",    sub:22000,  itbis:false },
];

const ORDENES = [
  { id:1, numero:"ORD-001", cliente:"Constructora Pérez",  fecha:"2025-06-01", estado:"Completada",    pie:134, prioridad:3 },
  { id:2, numero:"ORD-002", cliente:"Ferretería El Martillo",fecha:"2025-06-03",estado:"En Producción", pie:50,  prioridad:2 },
  { id:3, numero:"ORD-003", cliente:"María González",        fecha:"2025-06-08",estado:"Pendiente Auth", pie:17,  prioridad:1 },
  { id:4, numero:"ORD-004", cliente:"Inmobiliaria Vista Verde",fecha:"2025-06-10",estado:"Borrador",    pie:168, prioridad:2 },
  { id:5, numero:"ORD-005", cliente:"Ferretería El Martillo",fecha:"2025-06-09",estado:"En Producción", pie:80,  prioridad:2 },
];

const CXC = [
  { cliente:"Constructora Pérez",    factura:"FAC-001", vence:"2025-07-01", total:104430, pagado:0,     estado:"Pendiente" },
  { cliente:"Ferretería El Martillo",factura:"FAC-002", vence:"2025-06-20", total:19000,  pagado:19000, estado:"Pagada"    },
  { cliente:"Inmobiliaria Vista Verde",factura:"FAC-004",vence:"2025-06-28",total:68440,  pagado:40000, estado:"Parcial"   },
  { cliente:"María González",         factura:"FAC-003", vence:"2025-06-25", total:6800,   pagado:0,     estado:"Pendiente" },
  { cliente:"Persianas del Norte",    factura:"FAC-005", vence:"2025-06-01", total:24500,  pagado:0,     estado:"Vencida"   },
];

const CXP = [
  { proveedor:"Aluminio del Caribe", vence:"2025-07-10", total:104430, pagado:0,     estado:"Pendiente" },
  { proveedor:"Global Aluminum",     vence:"2025-07-20", total:34800,  pagado:11600, estado:"Parcial"   },
  { proveedor:"Vidriera Nacional",   vence:"2025-05-30", total:53100,  pagado:53100, estado:"Pagada"    },
];

const VENTAS_6M = [
  { mes:"Ene", v:185000 }, { mes:"Feb", v:210000 }, { mes:"Mar", v:195000 },
  { mes:"Abr", v:240000 }, { mes:"May", v:228000 }, { mes:"Jun", v:265000 },
];

// ── Mini bar chart component ──────────────────────────────────────────────────
function MiniBar({ data, color="#1a73e8", h=80 }) {
  const max = Math.max(...data.map(d=>d.v),1);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:4,height:h}}>
      {data.map((d,i)=>{
        const pct = (d.v/max)*100;
        const isLast = i===data.length-1;
        return (
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,height:"100%",justifyContent:"flex-end"}}>
            <div style={{width:"100%",background:isLast?color:color+"55",borderRadius:"3px 3px 0 0",height:`${Math.max(pct,3)}%`,transition:"height .3s"}}/>
            <div style={{fontSize:9,color:"var(--on-sur4)",textAlign:"center"}}>{d.mes}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Sparkline (thin line chart) ───────────────────────────────────────────────
function Sparkline({ values, color="#1a73e8", h=40 }) {
  const max = Math.max(...values,1);
  const w   = 100;
  const pts = values.map((v,i)=>`${(i/(values.length-1))*w},${h-(v/max)*(h-4)+2}`).join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function Dashboard({ onNav }) {
  const [periodo, setPeriodo] = useState("mes"); // hoy | semana | mes

  // ── Calculated KPIs ───────────────────────────────────────────────────────
  const ventasMes      = VENTAS_6M[VENTAS_6M.length-1].v;
  const ventasMesAnt   = VENTAS_6M[VENTAS_6M.length-2].v;
  const crecVentas     = r2((ventasMes-ventasMesAnt)/ventasMesAnt*100);

  const cotAprobadas   = COTIZACIONES.filter(c=>["Aprobada","Facturada","En Producción"].includes(c.estado));
  const montoCotApro   = cotAprobadas.reduce((s,c)=>s+c.sub,0);
  const cotPendientes  = COTIZACIONES.filter(c=>c.estado==="Pendiente").length;

  const cxcPendiente   = CXC.filter(c=>c.estado!=="Pagada").reduce((s,c)=>s+(c.total-c.pagado),0);
  const cxcVencidas    = CXC.filter(c=>c.estado==="Vencida").length;

  const cxpPendiente   = CXP.filter(c=>c.estado!=="Pagada").reduce((s,c)=>s+(c.total-c.pagado),0);

  const enProd         = ORDENES.filter(o=>o.estado==="En Producción").length;
  const pendAuth       = ORDENES.filter(o=>o.estado==="Pendiente Auth").length;
  const totalPie       = r2(ORDENES.reduce((s,o)=>s+o.pie,0));

  // Alertas urgentes
  const alertas = [
    pendAuth>0    && { tipo:"warn",  txt:`${pendAuth} orden(es) esperando autorización`,      accion:"ordenes",     btn:"Ver órdenes" },
    cotPendientes>0&&{ tipo:"info",  txt:`${cotPendientes} cotización(es) pendiente de respuesta`, accion:"presupuestos",btn:"Ver cotizaciones"},
    cxcVencidas>0 && { tipo:"err",   txt:`${cxcVencidas} factura(s) vencida(s) por cobrar`,   accion:"facturacion", btn:"Ver CxC" },
    cxpPendiente>100000&&{ tipo:"warn",txt:`CxP pendiente: ${fmtRD(cxpPendiente)}`,           accion:"cuentas-por-pagar", btn:"Ver CxP" },
  ].filter(Boolean);

  // Actividad reciente
  const actividad = [
    { dot:"var(--sec)",  txt:"Cotización COT-006 — Aluminios del Este",           sub:"Hace 15 min", nav:"presupuestos" },
    { dot:"var(--pri)",  txt:"Orden ORD-005 en producción — Ferretería El Martillo",sub:"Hace 1h",   nav:"ordenes" },
    { dot:"var(--warn)", txt:"ORD-003 esperando autorización — María González",   sub:"Hace 2h",     nav:"ordenes" },
    { dot:"var(--sec)",  txt:"Pago registrado FAC-002 — Ferretería El Martillo",  sub:"Hoy 9:30am",  nav:"facturacion" },
    { dot:"var(--err)",  txt:"FAC-005 vencida — Persianas del Norte",             sub:"Ayer",        nav:"facturacion" },
    { dot:"var(--on-sur4)",txt:"OC-003 enviada — Herrajes RD Import",             sub:"Ayer",        nav:"cuentas-por-pagar" },
  ];

  // Accesos rápidos
  const accesos = [
    { i:"📋", l:"Nueva Cotización", nav:"presupuestos", color:"var(--pri-lt)",  c:"var(--pri)" },
    { i:"🏭", l:"Nueva Orden",      nav:"ordenes",      color:"var(--sec-lt)",  c:"var(--sec)" },
    { i:"🧾", l:"Nueva Factura",    nav:"facturacion",  color:"#fef7e0",        c:"#92400e" },
    { i:"👤", l:"Nuevo Cliente",    nav:"clientes",     color:"var(--sur3)",    c:"var(--on-sur2)" },
    { i:"📐", l:"Calculadoras",     nav:"calculadoras", color:"var(--pri-lt)",  c:"var(--pri)" },
    { i:"📦", l:"Recibo de Compra", nav:"cuentas-por-pagar", color:"var(--sur3)", c:"var(--on-sur2)" },
  ];

  return (
    <div>
      {/* ── Alertas urgentes ─────────────────────────────────────────────── */}
      {alertas.map((a,i)=>(
        <div key={i} style={{
          background: a.tipo==="err"?"#fce8e6":a.tipo==="warn"?"#fef7e0":"var(--pri-lt)",
          border:`1px solid ${a.tipo==="err"?"#fad2cf":a.tipo==="warn"?"#f9ab00":"var(--pri-lt2)"}`,
          borderRadius:"var(--r-sm)", padding:"10px 16px", marginBottom:10,
          display:"flex", justifyContent:"space-between", alignItems:"center", gap:12,
        }}>
          <span style={{fontSize:13, color:a.tipo==="err"?"var(--err)":a.tipo==="warn"?"#92400e":"var(--pri-dk)", fontWeight:500}}>
            {a.tipo==="err"?"⚠️":a.tipo==="warn"?"⏳":"ℹ️"} {a.txt}
          </span>
          <button onClick={()=>onNav(a.accion)} style={{fontSize:11,padding:"4px 12px",background:"rgba(0,0,0,.08)",border:"none",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600,whiteSpace:"nowrap"}}>
            {a.btn} →
          </button>
        </div>
      ))}

      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      <div className="stats-grid" style={{gridTemplateColumns:"repeat(4,1fr)",marginTop:alertas.length?12:0}}>
        {[
          {
            l:"Ventas (junio)",  n:fmtRD(ventasMes), i:"💰", bg:"var(--sec-lt)",
            sub:`${crecVentas>=0?"↑":"↓"} ${Math.abs(crecVentas)}% vs mayo`,
            subc:crecVentas>=0?"var(--sec)":"var(--err)",
            spark:VENTAS_6M.map(m=>m.v), sparkColor:"#188038",
          },
          {
            l:"CxC por cobrar",  n:fmtRD(cxcPendiente), i:"💸", bg:"#fef7e0",
            sub:cxcVencidas>0?`⚠ ${cxcVencidas} factura(s) vencida(s)`:`${CXC.filter(c=>c.estado!=="Pagada").length} facturas activas`,
            subc:cxcVencidas>0?"var(--err)":"var(--on-sur3)",
          },
          {
            l:"En producción",   n:enProd, i:"🏭", bg:"var(--pri-lt)",
            sub:pendAuth>0?`${pendAuth} pendiente(s) de autorizar`:`${totalPie} ft² en proceso`,
            subc:pendAuth>0?"var(--warn)":"var(--on-sur3)",
          },
          {
            l:"Cotiz. aprobadas",n:cotAprobadas.length, i:"✅", bg:"var(--sec-lt)",
            sub:`${fmtRD(montoCotApro)} en cartera`,
            subc:"var(--sec)",
          },
        ].map(s=>(
          <div key={s.l} className="stat-card" style={{position:"relative",overflow:"hidden"}}>
            {s.spark&&(
              <div style={{position:"absolute",bottom:0,left:0,right:0,opacity:.15,pointerEvents:"none"}}>
                <Sparkline values={s.spark} color={s.sparkColor} h={56}/>
              </div>
            )}
            <div className="stat-icon-wrap" style={{background:s.bg}}>{s.i}</div>
            <div className="stat-num" style={{fontSize:typeof s.n==="string"&&s.n.length>8?16:28}}>{s.n}</div>
            <div className="stat-lbl">{s.l}</div>
            <div style={{fontSize:11,marginTop:4,color:s.subc,fontWeight:500}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Main grid ────────────────────────────────────────────────────── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>

        {/* Ventas 6 meses */}
        <div className="card">
          <div className="card-hdr">
            <div className="card-ttl">Ventas últimos 6 meses</div>
            <div style={{fontFamily:"JetBrains Mono,monospace",fontWeight:700,fontSize:14,color:"var(--sec)"}}>{fmtRD(VENTAS_6M.reduce((s,m)=>s+m.v,0))}</div>
          </div>
          <div className="card-bdy">
            <MiniBar data={VENTAS_6M} color="#188038" h={110}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:12,paddingTop:12,borderTop:"1px solid var(--out)"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:12,fontWeight:700,color:"var(--sec)"}}>{fmtRD(ventasMes)}</div>
                <div style={{fontSize:10,color:"var(--on-sur4)"}}>Este mes</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:12,fontWeight:700,color:crecVentas>=0?"var(--sec)":"var(--err)"}}>{crecVentas>=0?"↑":"↓"}{Math.abs(crecVentas)}%</div>
                <div style={{fontSize:10,color:"var(--on-sur4)"}}>vs mes anterior</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:12,fontWeight:700,color:"var(--pri)"}}>{fmtRD(VENTAS_6M.reduce((s,m)=>s+m.v,0)/6)}</div>
                <div style={{fontSize:10,color:"var(--on-sur4)"}}>Promedio mensual</div>
              </div>
            </div>
          </div>
        </div>

        {/* Estado de operaciones */}
        <div className="card">
          <div className="card-hdr"><div className="card-ttl">Estado de operaciones</div></div>
          <div className="card-bdy">
            {[
              { l:"Cotizaciones activas", n:COTIZACIONES.filter(c=>!["Rechazada","Facturada"].includes(c.estado)).length, total:COTIZACIONES.length, color:"var(--pri)" },
              { l:"Órdenes en producción", n:enProd, total:ORDENES.length, color:"var(--sec)" },
              { l:"Facturas cobradas (mes)", n:CXC.filter(c=>c.estado==="Pagada").length, total:CXC.length, color:"var(--sec)" },
              { l:"CxP pagadas", n:CXP.filter(c=>c.estado==="Pagada").length, total:CXP.length, color:"var(--warn)" },
            ].map(item=>{
              const pct = total=>r2((item.n/total)*100);
              return (
                <div key={item.l} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:13}}>
                    <span style={{color:"var(--on-sur2)"}}>{item.l}</span>
                    <span style={{fontWeight:700,color:item.color}}>{item.n} <span style={{fontWeight:400,color:"var(--on-sur4)"}}>/ {item.total}</span></span>
                  </div>
                  <div style={{height:6,background:"var(--sur3)",borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${item.total>0?r2(item.n/item.total*100):0}%`,background:item.color,borderRadius:3,transition:"width .5s"}}/>
                  </div>
                </div>
              );
            })}

            <div style={{marginTop:16,paddingTop:12,borderTop:"1px solid var(--out)",display:"flex",gap:16,justifyContent:"space-around"}}>
              <div style={{textAlign:"center"}}>
                <div className="mono" style={{fontSize:18,fontWeight:700,color:"var(--err)"}}>{fmtRD(cxcPendiente)}</div>
                <div style={{fontSize:11,color:"var(--on-sur4)"}}>Por cobrar</div>
              </div>
              <div style={{width:1,background:"var(--out)"}}/>
              <div style={{textAlign:"center"}}>
                <div className="mono" style={{fontSize:18,fontWeight:700,color:"var(--warn)"}}>{fmtRD(cxpPendiente)}</div>
                <div style={{fontSize:11,color:"var(--on-sur4)"}}>Por pagar</div>
              </div>
              <div style={{width:1,background:"var(--out)"}}/>
              <div style={{textAlign:"center"}}>
                <div className="mono" style={{fontSize:18,fontWeight:700,color:"var(--sec)"}}>{fmtRD(Math.max(0,cxcPendiente-cxpPendiente))}</div>
                <div style={{fontSize:11,color:"var(--on-sur4)"}}>Balance neto</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Second row ───────────────────────────────────────────────────── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>

        {/* Actividad reciente */}
        <div className="card">
          <div className="card-hdr"><div className="card-ttl">Actividad reciente</div></div>
          <div className="card-bdy" style={{padding:0}}>
            {actividad.map((a,i)=>(
              <div key={i} onClick={()=>onNav(a.nav)} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 20px",borderBottom:i<actividad.length-1?"1px solid var(--out)":"none",cursor:"pointer",transition:"background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background="var(--sur2)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{width:8,height:8,borderRadius:"50%",background:a.dot,flexShrink:0,marginTop:5}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500,color:"var(--on-sur)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.txt}</div>
                  <div style={{fontSize:11,color:"var(--on-sur4)",marginTop:2}}>{a.sub}</div>
                </div>
                <span style={{fontSize:11,color:"var(--on-sur4)",flexShrink:0}}>→</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pendientes urgentes */}
        <div className="card">
          <div className="card-hdr"><div className="card-ttl">Pendientes urgentes</div></div>
          <div className="card-bdy" style={{padding:0}}>

            {/* Órdenes por autorizar */}
            {ORDENES.filter(o=>o.estado==="Pendiente Auth").map(o=>(
              <div key={o.id} onClick={()=>onNav("ordenes")} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 20px",borderBottom:"1px solid var(--out)",cursor:"pointer"}}
                onMouseEnter={e=>e.currentTarget.style.background="var(--sur2)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{width:36,height:36,borderRadius:"var(--r-sm)",background:"#fef7e0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>⏳</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600}}>{o.numero} — {o.cliente}</div>
                  <div style={{fontSize:11,color:"var(--warn)",fontWeight:600,marginTop:1}}>Pendiente de autorización</div>
                </div>
                <span className="chip chip-filled-warn" style={{fontSize:10,flexShrink:0}}>Autorizar</span>
              </div>
            ))}

            {/* CxC vencidas */}
            {CXC.filter(c=>c.estado==="Vencida").map(c=>(
              <div key={c.factura} onClick={()=>onNav("facturacion")} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 20px",borderBottom:"1px solid var(--out)",cursor:"pointer"}}
                onMouseEnter={e=>e.currentTarget.style.background="var(--sur2)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{width:36,height:36,borderRadius:"var(--r-sm)",background:"#fce8e6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>💸</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600}}>{c.factura} — {c.cliente}</div>
                  <div style={{fontSize:11,color:"var(--err)",fontWeight:600,marginTop:1}}>Vencida · {fmtRD(c.total-c.pagado)} pendiente</div>
                </div>
                <span className="chip chip-filled-err" style={{fontSize:10,flexShrink:0}}>Cobrar</span>
              </div>
            ))}

            {/* Cotizaciones pendientes */}
            {COTIZACIONES.filter(c=>c.estado==="Pendiente").map(c=>(
              <div key={c.id} onClick={()=>onNav("presupuestos")} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 20px",borderBottom:"1px solid var(--out)",cursor:"pointer"}}
                onMouseEnter={e=>e.currentTarget.style.background="var(--sur2)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{width:36,height:36,borderRadius:"var(--r-sm)",background:"var(--pri-lt)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>📋</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600}}>{c.numero} — {c.cliente}</div>
                  <div style={{fontSize:11,color:"var(--pri)",fontWeight:500,marginTop:1}}>Esperando respuesta · {fmtRD(c.sub)}</div>
                </div>
                <span className="chip" style={{fontSize:10,flexShrink:0}}>Seguir</span>
              </div>
            ))}

            {pendAuth===0&&cxcVencidas===0&&cotPendientes===0&&(
              <div style={{textAlign:"center",padding:"32px 20px",color:"var(--on-sur4)"}}>
                <div style={{fontSize:32,marginBottom:8}}>✅</div>
                <div style={{fontWeight:600}}>Todo al día</div>
                <div style={{fontSize:12,marginTop:4}}>No hay pendientes urgentes</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Acceso rápido ─────────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-hdr"><div className="card-ttl">Acceso rápido</div></div>
        <div className="card-bdy">
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10}}>
            {accesos.map(a=>(
              <button key={a.l} onClick={()=>onNav(a.nav)}
                style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,padding:"16px 8px",background:a.color,border:"none",borderRadius:"var(--r-md)",cursor:"pointer",transition:"transform .15s, box-shadow .15s",fontFamily:"inherit"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,.1)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
                <span style={{fontSize:24}}>{a.i}</span>
                <span style={{fontSize:12,fontWeight:600,color:a.c,textAlign:"center",lineHeight:1.3}}>{a.l}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
