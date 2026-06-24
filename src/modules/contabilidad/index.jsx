/**
 * REPORTES — Módulo de análisis y reportes
 * 4 tabs:
 *  1. Ventas       — por período, por vendedor, por cliente
 *  2. Producción   — órdenes, pietaje, estado
 *  3. Cobros       — CxC, recibos, vencimientos
 *  4. Comparativo  — InterAnual + Ventas vs Compras
 */
import { useState } from "react";

function fmtRD(n)   { return `RD$${Math.round(n||0).toLocaleString("es-DO")}`; }
function fmtDate(d) { return d ? new Date(d+"T12:00:00").toLocaleDateString("es-DO",{day:"2-digit",month:"short",year:"numeric"}) : "—"; }
function r2(n)      { return Math.round((n||0)*100)/100; }

// ── Demo data ─────────────────────────────────────────────────────────────
const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const VENTAS_MENSUALES = [
  { mes:"Ene", ventas:185000, costo:112000, facturas:8  },
  { mes:"Feb", ventas:210000, costo:128000, facturas:9  },
  { mes:"Mar", ventas:195000, costo:118000, facturas:7  },
  { mes:"Abr", ventas:240000, costo:145000, facturas:11 },
  { mes:"May", ventas:228000, costo:138000, facturas:10 },
  { mes:"Jun", ventas:265000, costo:160000, facturas:12 },
];

const VENTAS_VENDEDOR = [
  { vendedor:"Mario Vuk",    ventas:580000, facturas:28, clientes:12 },
  { vendedor:"Carmen Pérez", ventas:363000, facturas:29, clientes:18 },
];

const VENTAS_CLIENTE = [
  { cliente:"Constructora Pérez & Asociados", ventas:245000, facturas:8,  ult:"2025-06-01" },
  { cliente:"Ferretería El Martillo",          ventas:180000, facturas:12, ult:"2025-06-05" },
  { cliente:"Inmobiliaria Vista Verde",         ventas:158000, facturas:5,  ult:"2025-05-28" },
  { cliente:"María González",                   ventas:89000,  facturas:6,  ult:"2025-06-08" },
  { cliente:"Persianas del Norte",              ventas:75000,  facturas:4,  ult:"2025-05-20" },
  { cliente:"Aluminios del Este",               ventas:47000,  facturas:3,  ult:"2025-05-15" },
];

const ORDENES_PROD = [
  { numero:"ORD-001", cliente:"Constructora Pérez", fecha:"2025-06-01", entrega:"2025-06-15", tipo:"Corrediza Tradicional", pie:134, estado:"Completada", responsable:"Roberto Santos" },
  { numero:"ORD-002", cliente:"Ferretería El Martillo", fecha:"2025-06-03", entrega:"2025-06-18", tipo:"Corrediza P-65", pie:50, estado:"En producción", responsable:"Roberto Santos" },
  { numero:"ORD-003", cliente:"María González", fecha:"2025-06-08", entrega:"2025-06-25", tipo:"Puerta Comercial", pie:17, estado:"Pendiente", responsable:"—" },
  { numero:"ORD-004", cliente:"Inmobiliaria Vista Verde", fecha:"2025-05-28", entrega:"2025-06-10", tipo:"Corrediza P-92", pie:168, estado:"Completada", responsable:"Roberto Santos" },
  { numero:"ORD-005", cliente:"Ferretería El Martillo", fecha:"2025-06-09", entrega:"2025-06-20", tipo:"Persiana Tipo A", pie:80, estado:"En producción", responsable:"Roberto Santos" },
];

const CXC_DATA = [
  { cliente:"Constructora Pérez & Asociados", factura:"FAC-001", fecha:"2025-06-01", vence:"2025-07-01", total:104430, pagado:0,      estado:"Pendiente" },
  { cliente:"Ferretería El Martillo",          factura:"FAC-002", fecha:"2025-06-05", vence:"2025-06-20", total:19000,  pagado:19000,  estado:"Pagada" },
  { cliente:"Inmobiliaria Vista Verde",         factura:"FAC-004", fecha:"2025-05-28", vence:"2025-06-28", total:68440,  pagado:40000,  estado:"Parcial" },
  { cliente:"María González",                   factura:"FAC-003", fecha:"2025-06-08", vence:"2025-06-25", total:6800,   pagado:0,      estado:"Pendiente" },
  { cliente:"Persianas del Norte",              factura:"FAC-005", fecha:"2025-05-15", vence:"2025-06-01", total:24500,  pagado:0,      estado:"Vencida" },
];

const INTERANUAL_2025 = [42000,58000,51000,69000,63000,74000,0,0,0,0,0,0];
const INTERANUAL_2026 = [185000,210000,195000,240000,228000,265000,0,0,0,0,0,0];

// ── Simple bar chart ───────────────────────────────────────────────────────
function BarChart({ data, valueKey, labelKey, color="#1a73e8", height=160 }) {
  const max = Math.max(...data.map(d=>d[valueKey]||0), 1);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:6,height,padding:"0 4px"}}>
      {data.map((d,i)=>{
        const pct = ((d[valueKey]||0)/max)*100;
        return (
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,height:"100%",justifyContent:"flex-end"}}>
            <div style={{fontSize:10,color:"var(--on-sur3)",fontFamily:"JetBrains Mono,monospace",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",maxWidth:"100%",textOverflow:"ellipsis",textAlign:"center"}}>
              {d[valueKey]>0?`${Math.round(d[valueKey]/1000)}k`:""}
            </div>
            <div style={{width:"100%",background:color,borderRadius:"4px 4px 0 0",height:`${Math.max(pct,2)}%`,transition:"height .3s",opacity:.85}}/>
            <div style={{fontSize:10,color:"var(--on-sur3)",textAlign:"center"}}>{d[labelKey]}</div>
          </div>
        );
      })}
    </div>
  );
}

function DualBarChart({ labels, series1, series2, color1="#1a73e8", color2="#22c55e", height=160 }) {
  const max = Math.max(...series1,...series2,1);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:3,height,padding:"0 4px"}}>
      {labels.map((l,i)=>{
        const p1=((series1[i]||0)/max)*100, p2=((series2[i]||0)/max)*100;
        return (
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,height:"100%",justifyContent:"flex-end"}}>
            <div style={{width:"100%",display:"flex",gap:2,alignItems:"flex-end",height:"85%"}}>
              <div style={{flex:1,background:color1,borderRadius:"3px 3px 0 0",height:`${Math.max(p1,1)}%`,opacity:.85}}/>
              <div style={{flex:1,background:color2,borderRadius:"3px 3px 0 0",height:`${Math.max(p2,1)}%`,opacity:.85}}/>
            </div>
            <div style={{fontSize:9,color:"var(--on-sur3)",textAlign:"center"}}>{l}</div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function Reportes() {
  const [tab,     setTab]     = useState("ventas");
  const [subVent, setSubVent] = useState("mensual");   // mensual | vendedor | cliente
  const [subProd, setSubProd] = useState("ordenes");
  const [subCxC,  setSubCxC]  = useState("pendiente");
  const [periodo, setPeriodo] = useState("mes");       // hoy | semana | mes | año

  // ── TAB VENTAS ───────────────────────────────────────────────────────────
  function TabVentas() {
    const totalVentas  = VENTAS_MENSUALES.reduce((s,m)=>s+m.ventas,0);
    const totalCosto   = VENTAS_MENSUALES.reduce((s,m)=>s+m.costo,0);
    const totalMargen  = r2((totalVentas-totalCosto)/totalVentas*100);
    const totalFacts   = VENTAS_MENSUALES.reduce((s,m)=>s+m.facturas,0);

    return (
      <div>
        {/* Sub-tabs */}
        <div className="seg-tabs" style={{marginBottom:16}}>
          {[["mensual","Por mes"],["vendedor","Por vendedor"],["cliente","Por cliente"]].map(([v,l])=>(
            <button key={v} className={"seg-tab"+(subVent===v?" on":"")} onClick={()=>setSubVent(v)}>{l}</button>
          ))}
        </div>

        {subVent==="mensual" && (
          <div>
            {/* KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
              {[
                {l:"Ventas 2025",  n:fmtRD(totalVentas), i:"💰", bg:"var(--sec-lt)"},
                {l:"Costo",        n:fmtRD(totalCosto),  i:"📦", bg:"var(--sur3)"},
                {l:"Margen",       n:`${totalMargen}%`,   i:"📈", bg:"var(--pri-lt)"},
                {l:"Facturas",     n:totalFacts,          i:"🧾", bg:"var(--sur3)"},
              ].map(s=>(
                <div key={s.l} className="stat-card">
                  <div className="stat-icon-wrap" style={{background:s.bg}}>{s.i}</div>
                  <div className="stat-num" style={{fontSize:typeof s.n==="string"?16:28}}>{s.n}</div>
                  <div className="stat-lbl">{s.l}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="card" style={{marginBottom:16}}>
              <div className="card-hdr">
                <div className="card-ttl">Ventas mensuales 2025</div>
                <div style={{display:"flex",gap:12,fontSize:12}}>
                  <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:12,height:12,borderRadius:2,background:"#1a73e8",display:"inline-block"}}/> Ventas</span>
                  <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:12,height:12,borderRadius:2,background:"#22c55e",display:"inline-block"}}/> Costo</span>
                </div>
              </div>
              <div className="card-bdy">
                <DualBarChart labels={VENTAS_MENSUALES.map(m=>m.mes)} series1={VENTAS_MENSUALES.map(m=>m.ventas)} series2={VENTAS_MENSUALES.map(m=>m.costo)} height={180}/>
              </div>
            </div>

            {/* Table */}
            <div className="card"><div className="twrap"><table>
              <thead><tr><th>Mes</th><th>Facturas</th><th>Ventas</th><th>Costo</th><th>Margen</th><th>Margen %</th></tr></thead>
              <tbody>
                {VENTAS_MENSUALES.map(m=>{
                  const mg=m.ventas-m.costo; const mgp=r2(mg/m.ventas*100);
                  return(
                    <tr key={m.mes}>
                      <td style={{fontWeight:600}}>{m.mes} 2025</td>
                      <td style={{textAlign:"center"}}>{m.facturas}</td>
                      <td><span className="mono" style={{fontWeight:600,color:"var(--pri)"}}>{fmtRD(m.ventas)}</span></td>
                      <td><span className="mono" style={{color:"var(--on-sur3)"}}>{fmtRD(m.costo)}</span></td>
                      <td><span className="mono" style={{fontWeight:600,color:"var(--sec)"}}>{fmtRD(mg)}</span></td>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{flex:1,height:6,background:"var(--sur3)",borderRadius:3,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${mgp}%`,background:"var(--sec)",borderRadius:3}}/>
                          </div>
                          <span className="mono" style={{fontSize:12,color:"var(--sec)",fontWeight:600,width:36}}>{mgp}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div></div>
          </div>
        )}

        {subVent==="vendedor" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              {VENTAS_VENDEDOR.map(v=>{
                const pct = r2(v.ventas/(VENTAS_MENSUALES.reduce((s,m)=>s+m.ventas,0))*100);
                return(
                  <div key={v.vendedor} className="card">
                    <div className="card-bdy">
                      <div style={{fontSize:40,textAlign:"center",marginBottom:8}}>👤</div>
                      <div style={{textAlign:"center",fontWeight:700,fontSize:16,marginBottom:4}}>{v.vendedor}</div>
                      <div className="mono" style={{textAlign:"center",fontSize:22,fontWeight:700,color:"var(--pri)",marginBottom:12}}>{fmtRD(v.ventas)}</div>
                      <div style={{height:8,background:"var(--sur3)",borderRadius:4,overflow:"hidden",marginBottom:8}}>
                        <div style={{height:"100%",width:`${pct}%`,background:"var(--pri)",borderRadius:4}}/>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--on-sur3)"}}>
                        <span>{v.facturas} facturas</span>
                        <span>{v.clientes} clientes</span>
                        <span style={{fontWeight:600,color:"var(--pri)"}}>{pct}% del total</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {subVent==="cliente" && (
          <div className="card"><div className="twrap"><table>
            <thead><tr><th>#</th><th>Cliente</th><th>Facturas</th><th>Ventas</th><th>% del total</th><th>Última compra</th></tr></thead>
            <tbody>
              {VENTAS_CLIENTE.sort((a,b)=>b.ventas-a.ventas).map((c,i)=>{
                const pct=r2(c.ventas/totalVentas*100);
                return(
                  <tr key={c.cliente}>
                    <td style={{color:"var(--on-sur4)",fontWeight:700}}>{i+1}</td>
                    <td style={{fontWeight:500}}>{c.cliente}</td>
                    <td style={{textAlign:"center"}}>{c.facturas}</td>
                    <td><span className="mono" style={{fontWeight:700,color:"var(--pri)"}}>{fmtRD(c.ventas)}</span></td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{flex:1,height:6,background:"var(--sur3)",borderRadius:3}}>
                          <div style={{height:"100%",width:`${pct}%`,background:"var(--pri)",borderRadius:3}}/>
                        </div>
                        <span style={{fontSize:12,fontWeight:600,color:"var(--pri)",width:36}}>{pct}%</span>
                      </div>
                    </td>
                    <td className="mono" style={{fontSize:12,color:"var(--on-sur3)"}}>{fmtDate(c.ult)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table></div></div>
        )}
      </div>
    );
  }

  // ── TAB PRODUCCIÓN ───────────────────────────────────────────────────────
  function TabProduccion() {
    const completadas = ORDENES_PROD.filter(o=>o.estado==="Completada").length;
    const enProd      = ORDENES_PROD.filter(o=>o.estado==="En producción").length;
    const totalPie    = ORDENES_PROD.reduce((s,o)=>s+o.pie,0);

    const EST = { Completada:"chip-filled-sec","En producción":"chip-filled-pri", Pendiente:"chip-filled-warn" };

    return (
      <div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {[
            {l:"Total órdenes",    n:ORDENES_PROD.length, i:"📋", bg:"var(--sur3)"},
            {l:"Completadas",      n:completadas,          i:"✅", bg:"var(--sec-lt)"},
            {l:"En producción",    n:enProd,               i:"🏭", bg:"var(--pri-lt)"},
            {l:"Total pie²",       n:`${totalPie} ft²`,   i:"📐", bg:"var(--sur3)"},
          ].map(s=>(
            <div key={s.l} className="stat-card">
              <div className="stat-icon-wrap" style={{background:s.bg}}>{s.i}</div>
              <div className="stat-num" style={{fontSize:typeof s.n==="string"?16:28}}>{s.n}</div>
              <div className="stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Chart pie² por tipo */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          <div className="card">
            <div className="card-hdr"><div className="card-ttl">Pie² por tipo de producto</div></div>
            <div className="card-bdy">
              {Object.entries(ORDENES_PROD.reduce((acc,o)=>{acc[o.tipo]=(acc[o.tipo]||0)+o.pie;return acc;},{})).sort(([,a],[,b])=>b-a).map(([tipo,pie])=>{
                const pct=r2(pie/totalPie*100);
                return(
                  <div key={tipo} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:13}}>
                      <span style={{color:"var(--on-sur2)",fontWeight:500}}>{tipo}</span>
                      <div style={{display:"flex",gap:8}}>
                        <span className="mono" style={{color:"var(--on-sur3)",fontSize:12}}>{pie} ft²</span>
                        <span className="mono" style={{fontWeight:700,color:"var(--pri)",fontSize:12}}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{height:6,background:"var(--sur3)",borderRadius:3}}>
                      <div style={{height:"100%",width:`${pct}%`,background:"var(--pri)",borderRadius:3}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card-hdr"><div className="card-ttl">Estado de órdenes</div></div>
            <div className="card-bdy">
              {[["Completada","var(--sec)"],["En producción","var(--pri)"],["Pendiente","var(--warn)"]].map(([est,color])=>{
                const cnt=ORDENES_PROD.filter(o=>o.estado===est).length;
                const pct=r2(cnt/ORDENES_PROD.length*100);
                return(
                  <div key={est} style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:color,flexShrink:0}}/>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,fontSize:13}}><span>{est}</span><span style={{fontWeight:700,color}}>{cnt} ({pct}%)</span></div>
                      <div style={{height:6,background:"var(--sur3)",borderRadius:3}}><div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:3}}/></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card"><div className="twrap"><table>
          <thead><tr><th>Número</th><th>Cliente</th><th>Tipo</th><th>Fecha</th><th>Entrega</th><th>Pie²</th><th>Estado</th><th>Responsable</th></tr></thead>
          <tbody>
            {ORDENES_PROD.map(o=>(
              <tr key={o.numero}>
                <td><span className="mono" style={{fontWeight:700,color:"var(--pri)"}}>{o.numero}</span></td>
                <td style={{fontWeight:500}}>{o.cliente}</td>
                <td style={{fontSize:12,color:"var(--on-sur2)"}}>{o.tipo}</td>
                <td className="mono" style={{fontSize:12}}>{fmtDate(o.fecha)}</td>
                <td className="mono" style={{fontSize:12}}>{fmtDate(o.entrega)}</td>
                <td><span className="mono">{o.pie}</span></td>
                <td><span className={`chip ${EST[o.estado]||"chip"}`} style={{fontSize:11}}>{o.estado}</span></td>
                <td style={{fontSize:12,color:"var(--on-sur3)"}}>{o.responsable}</td>
              </tr>
            ))}
          </tbody>
        </table></div></div>
      </div>
    );
  }

  // ── TAB COBROS (CxC) ──────────────────────────────────────────────────────
  function TabCobros() {
    const pendiente = CXC_DATA.filter(c=>c.estado!=="Pagada").reduce((s,c)=>s+(c.total-c.pagado),0);
    const vencidas  = CXC_DATA.filter(c=>c.estado==="Vencida").length;
    const cobrado   = CXC_DATA.filter(c=>c.estado==="Pagada").reduce((s,c)=>s+c.total,0);
    const EST = {Pagada:"chip-filled-sec",Pendiente:"chip-filled-warn",Parcial:"chip-filled-pri",Vencida:"chip-filled-err"};

    function daysLate(vence) {
      const d=Math.ceil((new Date()-new Date(vence))/86400000);
      return d>0?d:null;
    }

    return (
      <div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {[
            {l:"Por cobrar",    n:fmtRD(pendiente), i:"💸", bg:"#fef7e0"},
            {l:"Cobrado",       n:fmtRD(cobrado),   i:"✅", bg:"var(--sec-lt)"},
            {l:"Vencidas",      n:vencidas,          i:"⚠️", bg:vencidas>0?"#fce8e6":"var(--sec-lt)"},
            {l:"Facturas activas",n:CXC_DATA.filter(c=>c.estado!=="Pagada").length, i:"🧾", bg:"var(--sur3)"},
          ].map(s=>(
            <div key={s.l} className="stat-card">
              <div className="stat-icon-wrap" style={{background:s.bg}}>{s.i}</div>
              <div className="stat-num" style={{fontSize:typeof s.n==="string"?16:28}}>{s.n}</div>
              <div className="stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>

        {vencidas>0&&<div style={{background:"#fce8e6",border:"1px solid #fad2cf",borderRadius:"var(--r-sm)",padding:"10px 16px",marginBottom:16,fontSize:13,color:"var(--err)"}}>⚠ {vencidas} factura(s) vencida(s). Requieren atención inmediata.</div>}

        <div className="card"><div className="twrap"><table>
          <thead><tr><th>Factura</th><th>Cliente</th><th>Fecha</th><th>Vence</th><th>Total</th><th>Pagado</th><th>Pendiente</th><th>Estado</th></tr></thead>
          <tbody>
            {CXC_DATA.sort((a,b)=>{const ord={Vencida:0,Pendiente:1,Parcial:2,Pagada:3};return(ord[a.estado]||0)-(ord[b.estado]||0);}).map(c=>{
              const pend=r2(c.total-c.pagado);
              const late=daysLate(c.vence);
              return(
                <tr key={c.factura}>
                  <td><span className="mono" style={{fontWeight:700,color:"var(--pri)",fontSize:12}}>{c.factura}</span></td>
                  <td style={{fontWeight:500,fontSize:13}}>{c.cliente}</td>
                  <td className="mono" style={{fontSize:12}}>{fmtDate(c.fecha)}</td>
                  <td>
                    <div className="mono" style={{fontSize:12,color:late&&c.estado!=="Pagada"?"var(--err)":"var(--on-sur3)"}}>{fmtDate(c.vence)}</div>
                    {late&&c.estado!=="Pagada"&&<div style={{fontSize:10,color:"var(--err)",fontWeight:600}}>{late}d vencida</div>}
                  </td>
                  <td><span className="mono" style={{fontWeight:600}}>{fmtRD(c.total)}</span></td>
                  <td><span className="mono" style={{color:"var(--sec)"}}>{fmtRD(c.pagado)}</span></td>
                  <td><span className="mono" style={{fontWeight:700,color:pend>0?"var(--err)":"var(--sec)"}}>{pend>0?fmtRD(pend):"✓"}</span></td>
                  <td><span className={`chip ${EST[c.estado]||"chip"}`} style={{fontSize:11}}>{c.estado}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table></div></div>
      </div>
    );
  }

  // ── TAB COMPARATIVO ──────────────────────────────────────────────────────
  function TabComparativo() {
    const acum2025 = INTERANUAL_2025.reduce((acc,v,i)=>{acc.push((acc[i-1]||0)+v);return acc;},[]);
    const acum2026 = INTERANUAL_2026.reduce((acc,v,i)=>{acc.push((acc[i-1]||0)+v);return acc;},[]);
    const totalActivo2025 = INTERANUAL_2025.filter(v=>v>0).length;
    const totalActivo2026 = INTERANUAL_2026.filter(v=>v>0).length;
    const crec = totalActivo2025>0?r2((acum2026[totalActivo2026-1]-acum2025[totalActivo2025-1])/acum2025[totalActivo2025-1]*100):0;

    return (
      <div>
        {/* InterAnual */}
        <div className="card" style={{marginBottom:16}}>
          <div className="card-hdr">
            <div className="card-ttl">Comparativo InterAnual</div>
            <div style={{display:"flex",gap:12,fontSize:12}}>
              <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:12,height:12,borderRadius:2,background:"#94a3b8",display:"inline-block"}}/> 2025</span>
              <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:12,height:12,borderRadius:2,background:"#1a73e8",display:"inline-block"}}/> 2026</span>
            </div>
          </div>
          <div className="card-bdy">
            <DualBarChart labels={MESES} series1={INTERANUAL_2025} series2={INTERANUAL_2026} color1="#94a3b8" color2="#1a73e8" height={200}/>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          {/* Tabla interanual */}
          <div className="card">
            <div className="card-hdr"><div className="card-ttl">Detalle mensual</div></div>
            <div className="twrap"><table>
              <thead><tr><th>Mes</th><th>2025</th><th>2026</th><th>Var.</th></tr></thead>
              <tbody>
                {MESES.map((m,i)=>{
                  const v25=INTERANUAL_2025[i], v26=INTERANUAL_2026[i];
                  if(!v25&&!v26)return null;
                  const var_=v25>0?r2((v26-v25)/v25*100):null;
                  return(
                    <tr key={m}>
                      <td style={{fontWeight:600}}>{m}</td>
                      <td><span className="mono" style={{fontSize:12,color:"var(--on-sur3)"}}>{v25>0?fmtRD(v25):"—"}</span></td>
                      <td><span className="mono" style={{fontWeight:700,color:"var(--pri)"}}>{v26>0?fmtRD(v26):"—"}</span></td>
                      <td>{var_!==null&&<span style={{fontSize:12,fontWeight:700,color:var_>=0?"var(--sec)":"var(--err)"}}>{var_>=0?"▲":"▼"} {Math.abs(var_)}%</span>}</td>
                    </tr>
                  );
                }).filter(Boolean)}
                <tr style={{background:"var(--sur2)"}}>
                  <td style={{fontWeight:700}}>Total</td>
                  <td><span className="mono" style={{fontWeight:700}}>{fmtRD(acum2025[totalActivo2025-1])}</span></td>
                  <td><span className="mono" style={{fontWeight:700,color:"var(--pri)"}}>{fmtRD(acum2026[totalActivo2026-1])}</span></td>
                  <td><span style={{fontSize:13,fontWeight:700,color:crec>=0?"var(--sec)":"var(--err)"}}>{crec>=0?"▲":"▼"} {Math.abs(crec)}%</span></td>
                </tr>
              </tbody>
            </table></div>
          </div>

          {/* Resumen */}
          <div className="card">
            <div className="card-hdr"><div className="card-ttl">Resumen ejecutivo</div></div>
            <div className="card-bdy">
              {[
                ["Ventas acum. 2025",  fmtRD(acum2025[totalActivo2025-1]), "var(--on-sur2)"],
                ["Ventas acum. 2026",  fmtRD(acum2026[totalActivo2026-1]), "var(--pri)"],
                ["Crecimiento YTD",    `${crec>=0?"+":""}${crec}%`,         crec>=0?"var(--sec)":"var(--err)"],
                ["Prom. mensual 2026", fmtRD(acum2026[totalActivo2026-1]/totalActivo2026), "var(--on-sur2)"],
                ["Mejor mes 2026",     MESES[INTERANUAL_2026.indexOf(Math.max(...INTERANUAL_2026.filter(v=>v>0)))], "var(--pri)"],
              ].map(([l,v,c])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--out)",fontSize:13}}>
                  <span style={{color:"var(--on-sur3)"}}>{l}</span>
                  <span className="mono" style={{fontWeight:700,color:c}}>{v}</span>
                </div>
              ))}
              <div style={{marginTop:14,background:crec>=0?"var(--sec-lt)":"#fce8e6",borderRadius:"var(--r-sm)",padding:"12px 14px",textAlign:"center"}}>
                <div style={{fontSize:11,color:"var(--on-sur3)",marginBottom:4}}>Crecimiento respecto al año anterior</div>
                <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:28,fontWeight:700,color:crec>=0?"var(--sec)":"var(--err)"}}>{crec>=0?"+":""}{crec}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── TAB COMISIONES ──────────────────────────────────────────────────────────
  function TabComisiones() {
    const [vendSel, setVendSel] = useState("todos");
    const [periodo, setPeriodo] = useState("mes");
    const [pagados, setPagados] = useState({});   // { "vendedor-mes": true }
    const [toast2,  setToast2]  = useState("");

    function showT(msg){ setToast2(msg); setTimeout(()=>setToast2(""),2600); }

    // Demo facturas con vendedor y comisión
    const FACTURAS_COM = [
      { id:1, numero:"FAC-001", fecha:"2025-06-01", cliente:"Constructora Pérez", vendedor:"Mario Vuk",    total:56280,  com_pct:5, estado:"Pagada"   },
      { id:2, numero:"FAC-002", fecha:"2025-06-05", cliente:"Ferretería El Martillo", vendedor:"Carmen Pérez",total:22420, com_pct:5, estado:"Pendiente"},
      { id:3, numero:"FAC-003", fecha:"2025-05-28", cliente:"Inmobiliaria Vista Verde",vendedor:"Mario Vuk",   total:89208, com_pct:5, estado:"Parcial"  },
      { id:4, numero:"FAC-004", fecha:"2025-05-15", cliente:"María González",       vendedor:"Carmen Pérez",total:6800,  com_pct:5, estado:"Vencida"  },
      { id:5, numero:"FAC-005", fecha:"2025-06-10", cliente:"Persianas del Norte",  vendedor:"Mario Vuk",   total:38000, com_pct:5, estado:"Pagada"   },
      { id:6, numero:"FAC-006", fecha:"2025-06-11", cliente:"Aluminios del Este",   vendedor:"Carmen Pérez",total:34200, com_pct:5, estado:"Pagada"   },
      { id:7, numero:"FAC-007", fecha:"2025-05-20", cliente:"Constr. del Norte",    vendedor:"Mario Vuk",   total:48000, com_pct:5, estado:"Pagada"   },
      { id:8, numero:"FAC-008", fecha:"2025-05-10", cliente:"Vidriería Nacional",   vendedor:"Carmen Pérez",total:19500, com_pct:5, estado:"Pagada"   },
    ];

    // Filter by periodo
    const MES_ACT  = "2025-06";
    const MES_ANT  = "2025-05";
    const filtered = FACTURAS_COM.filter(f=>{
      const mes = f.fecha.slice(0,7);
      if(periodo==="mes")    return mes===MES_ACT;
      if(periodo==="ant")    return mes===MES_ANT;
      if(periodo==="todo")   return true;
      return true;
    }).filter(f=>vendSel==="todos"||f.vendedor===vendSel);

    // Group by vendedor
    const vendedores = [...new Set(FACTURAS_COM.map(f=>f.vendedor))];
    const byVend = vendedores.map(v=>{
      const facts = filtered.filter(f=>f.vendedor===v);
      const totalVentas = facts.reduce((s,f)=>s+f.total,0);
      const totalCom    = Math.round(facts.reduce((s,f)=>s+f.total*(f.com_pct/100),0));
      const pagKey      = `${v}-${periodo}`;
      const esPagado    = pagados[pagKey];
      return { vendedor:v, facts, totalVentas, totalCom, esPagado, pagKey };
    }).filter(v=>v.facts.length>0);

    const totalGeneral  = byVend.reduce((s,v)=>s+v.totalVentas,0);
    const totalComGen   = byVend.reduce((s,v)=>s+v.totalCom,0);
    const pendPagar     = byVend.filter(v=>!v.esPagado).reduce((s,v)=>s+v.totalCom,0);

    function marcarPagado(pagKey, vendedor, monto) {
      setPagados(p=>({...p,[pagKey]:true}));
      showT(`Comisión de ${vendedor} marcada como pagada ✓`);
    }

    function exportarResumen(v) {
      const lines = [
        `RESUMEN DE COMISIONES — ${v.vendedor}`,
        `Período: ${periodo==="mes"?"Junio 2025":periodo==="ant"?"Mayo 2025":"Todo"}`,
        `Generado: ${new Date().toLocaleDateString("es-DO")}`,
        ``,
        `FACTURAS:`,
        ...v.facts.map(f=>`  ${f.numero} | ${f.cliente} | RD$${f.total.toLocaleString()} | Com: RD$${Math.round(f.total*f.com_pct/100).toLocaleString()}`),
        ``,
        `TOTAL VENTAS:    RD$${v.totalVentas.toLocaleString()}`,
        `% COMISIÓN:      ${v.facts[0]?.com_pct||0}%`,
        `TOTAL A PAGAR:   RD$${v.totalCom.toLocaleString()}`,
        ``,
        `Estado: ${v.esPagado?"PAGADA":"PENDIENTE DE PAGO"}`,
      ].join("\n");

      const blob = new Blob([lines], { type:"text/plain" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href=url; a.download=`Comision-${v.vendedor.replace(/ /g,"-")}-${periodo}.txt`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      setTimeout(()=>URL.revokeObjectURL(url),1000);
      showT("Resumen exportado ✓");
    }

    return (
      <div>
        {/* Toolbar */}
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
          <div className="seg-tabs" style={{marginBottom:0}}>
            {[["mes","Junio 2025"],["ant","Mayo 2025"],["todo","Todo el año"]].map(([v,l])=>(
              <button key={v} className={"seg-tab"+(periodo===v?" on":"")} onClick={()=>setPeriodo(v)}>{l}</button>
            ))}
          </div>
          <select style={{padding:"8px 14px",borderRadius:"var(--rfull)",border:"1px solid var(--out)",background:"var(--sur)",fontFamily:"inherit",fontSize:13,outline:"none"}} value={vendSel} onChange={e=>setVendSel(e.target.value)}>
            <option value="todos">Todos los vendedores</option>
            {vendedores.map(v=><option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        {/* Summary cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
          {[
            {l:"Total ventas período",  n:fmtRD(totalGeneral), i:"💰", bg:"var(--sec-lt)",  c:"var(--sec)"},
            {l:"Total comisiones",      n:fmtRD(totalComGen),  i:"💼", bg:"var(--pri-lt)",  c:"var(--pri)"},
            {l:"Pendiente de pagar",    n:fmtRD(pendPagar),    i:"⏳", bg:pendPagar>0?"#fef7e0":"var(--sec-lt)", c:pendPagar>0?"#92400e":"var(--sec)"},
          ].map(s=>(
            <div key={s.l} style={{background:s.bg,borderRadius:"var(--r-md)",padding:"16px 18px"}}>
              <div style={{fontSize:24,marginBottom:8}}>{s.i}</div>
              <div className="mono" style={{fontSize:20,fontWeight:700,color:s.c,marginBottom:4}}>{s.n}</div>
              <div style={{fontSize:12,color:"var(--on-sur3)",textTransform:"uppercase",letterSpacing:1}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* By vendedor */}
        {byVend.map(v=>(
          <div key={v.vendedor} className="card" style={{marginBottom:16}}>
            <div className="card-hdr">
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:"var(--pri)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:"#fff",flexShrink:0}}>
                  {v.vendedor.split(" ").map(n=>n[0]).slice(0,2).join("")}
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:16}}>{v.vendedor}</div>
                  <div style={{fontSize:12,color:"var(--on-sur3)",marginTop:2}}>{v.facts.length} factura(s) · {fmtRD(v.totalVentas)} en ventas</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{textAlign:"right"}}>
                  <div className="mono" style={{fontSize:22,fontWeight:700,color:"var(--pri)"}}>{fmtRD(v.totalCom)}</div>
                  <div style={{fontSize:11,color:"var(--on-sur3)"}}>comisión {v.facts[0]?.com_pct||0}%</div>
                </div>
                <span className={`chip ${v.esPagado?"chip-filled-sec":"chip-filled-warn"}`}>
                  {v.esPagado?"✓ Pagada":"Pendiente"}
                </span>
              </div>
            </div>

            {/* Detalle de facturas */}
            <div className="twrap">
              <table>
                <thead><tr><th>Factura</th><th>Cliente</th><th>Fecha</th><th>Estado fact.</th><th>Venta</th><th>Com. %</th><th>Comisión</th></tr></thead>
                <tbody>
                  {v.facts.map(f=>{
                    const com=Math.round(f.total*(f.com_pct/100));
                    const EST_CLS={Pagada:"chip-filled-sec",Pendiente:"chip-filled-warn",Parcial:"chip-filled-pri",Vencida:"chip-filled-err"};
                    return(
                      <tr key={f.id}>
                        <td><span className="mono" style={{fontWeight:700,color:"var(--pri)",fontSize:12}}>{f.numero}</span></td>
                        <td style={{fontWeight:500,fontSize:13}}>{f.cliente}</td>
                        <td className="mono" style={{fontSize:12,color:"var(--on-sur3)"}}>{f.fecha}</td>
                        <td><span className={`chip ${EST_CLS[f.estado]||"chip"}`} style={{fontSize:11}}>{f.estado}</span></td>
                        <td><span className="mono" style={{fontWeight:600}}>{fmtRD(f.total)}</span></td>
                        <td style={{textAlign:"center",color:"var(--on-sur3)",fontSize:12}}>{f.com_pct}%</td>
                        <td><span className="mono" style={{fontWeight:700,color:"var(--pri)"}}>{fmtRD(com)}</span></td>
                      </tr>
                    );
                  })}
                  {/* Total row */}
                  <tr style={{background:"var(--pri-lt)"}}>
                    <td colSpan={4} style={{fontWeight:700,textAlign:"right",padding:"10px 16px",fontSize:13}}>TOTAL</td>
                    <td><span className="mono" style={{fontWeight:700,color:"var(--on-sur)"}}>{fmtRD(v.totalVentas)}</span></td>
                    <td/>
                    <td><span className="mono" style={{fontWeight:700,fontSize:16,color:"var(--pri)"}}>{fmtRD(v.totalCom)}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div style={{padding:"12px 20px",borderTop:"1px solid var(--out)",display:"flex",gap:10,alignItems:"center"}}>
              {!v.esPagado&&(
                <button className="btn btn-filled" style={{background:"var(--sec)"}} onClick={()=>marcarPagado(v.pagKey,v.vendedor,v.totalCom)}>
                  ✅ Marcar comisión pagada — {fmtRD(v.totalCom)}
                </button>
              )}
              {v.esPagado&&(
                <div style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"var(--sec)",fontWeight:600}}>
                  ✓ Comisión pagada
                  <button className="btn btn-text" style={{fontSize:12}} onClick={()=>setPagados(p=>({...p,[v.pagKey]:false}))}>Deshacer</button>
                </div>
              )}
              <button className="btn btn-outlined" style={{marginLeft:"auto"}} onClick={()=>exportarResumen(v)}>
                ⬇ Exportar resumen
              </button>
            </div>
          </div>
        ))}

        {byVend.length===0&&(
          <div style={{textAlign:"center",padding:"48px 24px",color:"var(--on-sur4)"}}>
            <div style={{fontSize:40,marginBottom:10}}>💼</div>
            <div style={{fontWeight:600}}>Sin comisiones para este período</div>
          </div>
        )}

        {toast2&&<div className="toast-msg">{toast2}</div>}
      </div>
    );
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  const totalVentasMes = VENTAS_MENSUALES.reduce((s,m)=>s+m.ventas,0);
  const totalProd      = ORDENES_PROD.length;
  const totalCxC       = CXC_DATA.filter(c=>c.estado!=="Pagada").reduce((s,c)=>s+(c.total-c.pagado),0);

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        {[
          {l:"Ventas 2025",   n:fmtRD(totalVentasMes), i:"💰", bg:"var(--sec-lt)"},
          {l:"Órdenes prod.", n:totalProd,               i:"🏭", bg:"var(--pri-lt)"},
          {l:"CxC pendiente", n:fmtRD(totalCxC),        i:"💸", bg:"#fef7e0"},
          {l:"Crecimiento",   n:"+43%",                  i:"📈", bg:"var(--sec-lt)"},
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
        {[["ventas","📊 Ventas"],["produccion","🏭 Producción"],["cobros","💸 Cobros / CxC"],["comparativo","📈 Comparativo"],["comisiones","💼 Comisiones"]].map(([v,l])=>(
          <button key={v} className={"seg-tab"+(tab===v?" on":"")} onClick={()=>setTab(v)}>{l}</button>
        ))}
      </div>

      {tab==="ventas"      && <TabVentas/>}
      {tab==="produccion"  && <TabProduccion/>}
      {tab==="cobros"      && <TabCobros/>}
      {tab==="comparativo" && <TabComparativo/>}
      {tab==="comisiones"  && <TabComisiones/>}
    </div>
  );
}
