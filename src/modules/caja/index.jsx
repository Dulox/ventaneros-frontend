/**
 * CAJA
 * 2 tabs:
 *  1. Recibos del día — facturas y recibos cobrados, por vendedor
 *  2. Cuadre de Caja  — arqueo de billetes + totales + cierre
 */
import { useState } from "react";

function fmtRD(n) { return `RD$${Math.round(n||0).toLocaleString("es-DO")}`; }
function today()  { return new Date().toISOString().slice(0,10); }
function fmtDate(d){ return d ? new Date(d+"T12:00:00").toLocaleDateString("es-DO",{day:"2-digit",month:"short",year:"numeric"}) : "—"; }
function fmtTime(d){ return d ? new Date(d).toLocaleTimeString("es-DO",{hour:"2-digit",minute:"2-digit"}) : "—"; }

const BILLETES = [2000,1000,500,200,100,50,25,20,10,5,1];

const DEMO_RECIBOS = [
  { id:1, tipo:"Factura",  numero:"FAC-001", cliente:"Constructora Pérez & Asociados", vendedor:"Mario Vuk",    hora:new Date(Date.now()-7200000).toISOString(), metodo:"Transferencia", valor:104430, descuento:0,   itbis:15930 },
  { id:2, tipo:"Recibo",   numero:"REC-001", cliente:"Ferretería El Martillo",         vendedor:"Carmen Pérez", hora:new Date(Date.now()-5400000).toISOString(), metodo:"Efectivo",      valor:19000,  descuento:500, itbis:0 },
  { id:3, tipo:"Factura",  numero:"FAC-002", cliente:"María González",                  vendedor:"Mario Vuk",    hora:new Date(Date.now()-3600000).toISOString(), metodo:"Tarjeta",       valor:6800,   descuento:0,   itbis:0 },
  { id:4, tipo:"Recibo",   numero:"REC-002", cliente:"Inmobiliaria Vista Verde",         vendedor:"Carmen Pérez", hora:new Date(Date.now()-1800000).toISOString(), metodo:"Cheque",        valor:40000,  descuento:0,   itbis:7200 },
  { id:5, tipo:"Factura",  numero:"FAC-003", cliente:"Constructora Pérez & Asociados", vendedor:"Mario Vuk",    hora:new Date(Date.now()-900000).toISOString(),  metodo:"Efectivo",      valor:22750,  descuento:0,   itbis:0 },
];

const DEMO_CIERRES = [
  { id:1, fecha:"2025-06-20", total:185000, efectivo:42000, cheques:104430, tarjetas:38570, otros:0, usuario:"Mario Vuk" },
  { id:2, fecha:"2025-06-19", total:96800,  efectivo:28000, cheques:52000,  tarjetas:16800, otros:0, usuario:"Mario Vuk" },
  { id:3, fecha:"2025-06-18", total:214300, efectivo:65000, cheques:110000, tarjetas:39300, otros:0, usuario:"Mario Vuk" },
];

// ═══════════════════════════════════════════════════════════════════════════
export default function Caja() {
  const [tab,       setTab]    = useState("recibos");
  const [recibos,   setRecib]  = useState(DEMO_RECIBOS);
  const [cierres,   setCierres]= useState(DEMO_CIERRES);
  const [toast,     setToast]  = useState("");

  function showToast(msg){ setToast(msg); setTimeout(()=>setToast(""),2800); }

  // ── TAB RECIBOS ────────────────────────────────────────────────────────
  function TabRecibos() {
    const [filtro,  setFiltro]  = useState("todos");   // todos | Factura | Recibo
    const [vendedor,setVend]    = useState("todos");
    const [fecha,   setFecha]   = useState(today());

    const vendedores = [...new Set(recibos.map(r=>r.vendedor))];
    const filtered   = recibos.filter(r => {
      const byTipo = filtro  === "todos" || r.tipo     === filtro;
      const byVend = vendedor === "todos" || r.vendedor === vendedor;
      return byTipo && byVend;
    });

    const totalEfectivo    = filtered.filter(r=>r.metodo==="Efectivo").reduce((s,r)=>s+r.valor,0);
    const totalCheques     = filtered.filter(r=>r.metodo==="Cheque").reduce((s,r)=>s+r.valor,0);
    const totalTarjetas    = filtered.filter(r=>r.metodo==="Tarjeta").reduce((s,r)=>s+r.valor,0);
    const totalTransf      = filtered.filter(r=>r.metodo==="Transferencia").reduce((s,r)=>s+r.valor,0);
    const totalDescuentos  = filtered.reduce((s,r)=>s+r.descuento,0);
    const totalITBIS       = filtered.reduce((s,r)=>s+r.itbis,0);
    const totalGeneral     = filtered.reduce((s,r)=>s+r.valor,0);

    const metodoCls = { Efectivo:"chip-filled-sec", Cheque:"chip-filled-pri", Tarjeta:"chip-filled-warn", Transferencia:"chip" };

    return (
      <div>
        {/* Toolbar */}
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
          <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)}
            style={{padding:"8px 12px",borderRadius:"var(--rfull)",border:"1px solid var(--out)",background:"var(--sur)",fontFamily:"inherit",fontSize:13,outline:"none"}}/>
          <div className="seg-tabs" style={{marginBottom:0}}>
            {[["todos","Todos"],["Factura","Facturas"],["Recibo","Recibos"]].map(([v,l])=>(
              <button key={v} className={"seg-tab"+(filtro===v?" on":"")} onClick={()=>setFiltro(v)}>{l}</button>
            ))}
          </div>
          <select style={{padding:"8px 14px",borderRadius:"var(--rfull)",border:"1px solid var(--out)",background:"var(--sur)",fontFamily:"inherit",fontSize:13,outline:"none"}}
            value={vendedor} onChange={e=>setVend(e.target.value)}>
            <option value="todos">Todos los vendedores</option>
            {vendedores.map(v=><option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        {/* Summary cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {[
            {l:"Efectivo",       n:totalEfectivo, i:"💵", bg:"var(--sec-lt)",  c:"var(--sec)"},
            {l:"Cheques",        n:totalCheques,  i:"📋", bg:"var(--pri-lt)",  c:"var(--pri)"},
            {l:"Tarjetas",       n:totalTarjetas, i:"💳", bg:"#fef7e0",        c:"#92400e"},
            {l:"Transferencias", n:totalTransf,   i:"🏦", bg:"var(--sur3)",    c:"var(--on-sur2)"},
          ].map(s=>(
            <div key={s.l} style={{background:s.bg,borderRadius:"var(--r-md)",padding:"14px 16px"}}>
              <div style={{fontSize:20,marginBottom:6}}>{s.i}</div>
              <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:15,fontWeight:700,color:s.c}}>{fmtRD(s.n)}</div>
              <div style={{fontSize:11,color:"var(--on-sur3)",marginTop:2,textTransform:"uppercase",letterSpacing:1}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card">
          <div className="twrap"><table>
            <thead><tr><th>Hora</th><th>Tipo</th><th>Número</th><th>Cliente</th><th>Vendedor</th><th>Método</th><th>Descuento</th><th>ITBIS</th><th>Valor</th></tr></thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={9} style={{textAlign:"center",padding:48,color:"var(--on-sur4)"}}>Sin movimientos para este período</td></tr>}
              {filtered.map(r=>(
                <tr key={r.id}>
                  <td className="mono" style={{fontSize:12,color:"var(--on-sur3)"}}>{fmtTime(r.hora)}</td>
                  <td><span className={`chip ${r.tipo==="Factura"?"chip-filled-pri":"chip"}`} style={{fontSize:11}}>{r.tipo}</span></td>
                  <td><span className="mono" style={{fontWeight:700,color:"var(--pri)",fontSize:12}}>{r.numero}</span></td>
                  <td style={{fontWeight:500,fontSize:13}}>{r.cliente}</td>
                  <td style={{fontSize:12,color:"var(--on-sur3)"}}>{r.vendedor}</td>
                  <td><span className={`chip ${metodoCls[r.metodo]||"chip"}`} style={{fontSize:11}}>{r.metodo}</span></td>
                  <td className="mono" style={{fontSize:12,color:"var(--on-sur3)"}}>{r.descuento>0?fmtRD(r.descuento):"—"}</td>
                  <td className="mono" style={{fontSize:12,color:"var(--sec)"}}>{r.itbis>0?fmtRD(r.itbis):"—"}</td>
                  <td><span className="mono" style={{fontWeight:700,fontSize:14}}>{fmtRD(r.valor)}</span></td>
                </tr>
              ))}
            </tbody>
          </table></div>

          {/* Totals footer */}
          <div style={{borderTop:"2px solid var(--out)",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
            <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
              {totalDescuentos>0&&<div style={{fontSize:13}}><span style={{color:"var(--on-sur3)"}}>Descuentos: </span><span className="mono" style={{color:"var(--err)",fontWeight:600}}>{fmtRD(totalDescuentos)}</span></div>}
              {totalITBIS>0&&<div style={{fontSize:13}}><span style={{color:"var(--on-sur3)"}}>ITBIS: </span><span className="mono" style={{color:"var(--sec)",fontWeight:600}}>{fmtRD(totalITBIS)}</span></div>}
              <div style={{fontSize:13}}><span style={{color:"var(--on-sur3)"}}>Transacciones: </span><span style={{fontWeight:600}}>{filtered.length}</span></div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:13,color:"var(--on-sur3)"}}>TOTAL DEL DÍA</span>
              <span className="mono" style={{fontSize:22,fontWeight:700,color:"var(--pri)"}}>{fmtRD(totalGeneral)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── TAB CUADRE ─────────────────────────────────────────────────────────
  function TabCuadre() {
    // Arqueo de billetes
    const [billetes, setBilletes] = useState(
      Object.fromEntries(BILLETES.map(b=>[b, 0]))
    );
    // Otros medios de pago
    const [cheques,   setCheques]  = useState("");
    const [tarjetas,  setTarjetas] = useState("");
    const [otros,     setOtros]    = useState("");
    const [depositos, setDepos]    = useState("");
    const [devolucion,setDevol]    = useState("");
    const [cerrado,   setCerrado]  = useState(false);
    const [showHist,  setShowHist] = useState(false);

    // Calculations
    const totalEfectivo = BILLETES.reduce((s,b)=>s+(b*(parseInt(billetes[b])||0)),0);
    const totalCheqNum  = parseFloat(cheques)||0;
    const totalTarjNum  = parseFloat(tarjetas)||0;
    const totalOtrosNum = parseFloat(otros)||0;
    const totalDeposNum = parseFloat(depositos)||0;
    const totalDevolNum = parseFloat(devolucion)||0;
    const enCaja        = totalEfectivo + totalCheqNum + totalTarjNum + totalOtrosNum - totalDeposNum - totalDevolNum;

    // From today's receipts
    const recibosHoy      = DEMO_RECIBOS;
    const esperadoEfect   = recibosHoy.filter(r=>r.metodo==="Efectivo").reduce((s,r)=>s+r.valor,0);
    const esperadoCheques = recibosHoy.filter(r=>r.metodo==="Cheque").reduce((s,r)=>s+r.valor,0);
    const esperadoTarj    = recibosHoy.filter(r=>r.metodo==="Tarjeta").reduce((s,r)=>s+r.valor,0);
    const esperadoTransf  = recibosHoy.filter(r=>r.metodo==="Transferencia").reduce((s,r)=>s+r.valor,0);
    const totalEsperado   = esperadoEfect+esperadoCheques+esperadoTarj+esperadoTransf;
    const diferencia      = enCaja - totalEsperado;

    function cerrarCaja() {
      const cierre = {
        id: Date.now(), fecha: today(), total: enCaja,
        efectivo: totalEfectivo, cheques: totalCheqNum,
        tarjetas: totalTarjNum, otros: totalOtrosNum,
        usuario: "Mario Vuk",
      };
      setCierres(cs=>[cierre,...cs]);
      setCerrado(true);
      showToast("Caja cerrada y registrada ✓");
    }

    function nuevoCuadre() {
      setBilletes(Object.fromEntries(BILLETES.map(b=>[b,0])));
      setCheques(""); setTarjetas(""); setOtros(""); setDepos(""); setDevol("");
      setCerrado(false);
    }

    if (cerrado) return (
      <div style={{maxWidth:500,margin:"0 auto",textAlign:"center",padding:"48px 24px"}}>
        <div style={{fontSize:64,marginBottom:16}}>✅</div>
        <div style={{fontSize:22,fontWeight:700,marginBottom:8}}>Caja cerrada</div>
        <div style={{fontSize:14,color:"var(--on-sur3)",marginBottom:8}}>Total registrado: <span className="mono" style={{fontWeight:700,color:"var(--pri)",fontSize:18}}>{fmtRD(enCaja)}</span></div>
        <div style={{fontSize:13,color:"var(--on-sur3)",marginBottom:32}}>{new Date().toLocaleDateString("es-DO",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          <button className="btn btn-outlined" onClick={()=>setShowHist(v=>!v)}>📋 Ver historial</button>
          <button className="btn btn-filled" onClick={nuevoCuadre}>＋ Nuevo cuadre</button>
        </div>

        {showHist && (
          <div style={{marginTop:24,textAlign:"left"}}>
            <div style={{fontSize:13,fontWeight:700,color:"var(--on-sur3)",marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Cierres anteriores</div>
            {cierres.map(c=>(
              <div key={c.id} style={{background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontWeight:600,fontSize:14}}>{fmtDate(c.fecha)}</div><div style={{fontSize:12,color:"var(--on-sur3)",marginTop:2}}>Efectivo {fmtRD(c.efectivo)} · Cheques {fmtRD(c.cheques)} · Tarjetas {fmtRD(c.tarjetas)}</div></div>
                <span className="mono" style={{fontWeight:700,color:"var(--pri)",fontSize:15}}>{fmtRD(c.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    return (
      <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:20,alignItems:"start"}}>
        {/* LEFT — arqueo de billetes */}
        <div>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-hdr"><div className="card-ttl">Arqueo de Efectivo</div><div style={{fontFamily:"JetBrains Mono,monospace",fontWeight:700,fontSize:16,color:"var(--sec)"}}>{fmtRD(totalEfectivo)}</div></div>
            <div className="card-bdy" style={{padding:0}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"var(--sur2)"}}>
                    {["Billete","Cantidad","= Total"].map(h=>(
                      <th key={h} style={{padding:"8px 16px",fontSize:11,textTransform:"uppercase",letterSpacing:1,color:"var(--on-sur3)",textAlign:h==="Billete"?"left":"right",fontWeight:700,borderBottom:"1px solid var(--out)"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BILLETES.map(b=>{
                    const cant  = parseInt(billetes[b])||0;
                    const total = b*cant;
                    return (
                      <tr key={b} style={{borderBottom:"1px solid var(--out)"}}>
                        <td style={{padding:"10px 16px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <div style={{width:56,height:28,borderRadius:4,background:b>=1000?"#1a6b3c":b>=500?"#c17f00":b>=200?"#8b1a1a":b>=100?"#1a4a8b":"var(--sur4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:b>=100?"#fff":"var(--on-sur3)",flexShrink:0}}>
                              {b.toLocaleString()}
                            </div>
                            <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:13,color:"var(--on-sur2)"}}>RD${b.toLocaleString()}</span>
                          </div>
                        </td>
                        <td style={{padding:"10px 16px",textAlign:"right"}}>
                          <input
                            type="number" min="0" value={billetes[b]||""}
                            onChange={e=>setBilletes(bs=>({...bs,[b]:e.target.value}))}
                            placeholder="0"
                            style={{width:72,padding:"6px 10px",border:`1.5px solid ${cant>0?"var(--pri)":"var(--out)"}`,borderRadius:"var(--r-sm)",fontFamily:"JetBrains Mono,monospace",fontSize:14,textAlign:"center",background:"var(--sur)",color:"var(--on-sur)",outline:"none",transition:"border-color .15s"}}
                          />
                        </td>
                        <td style={{padding:"10px 16px",textAlign:"right",fontFamily:"JetBrains Mono,monospace",fontWeight:total>0?700:400,color:total>0?"var(--sec)":"var(--on-sur4)",fontSize:14}}>
                          {total>0?fmtRD(total):"—"}
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{background:"var(--sec-lt)"}}>
                    <td colSpan={2} style={{padding:"12px 16px",fontWeight:700,fontSize:14,color:"var(--sec)"}}>Total en Efectivo</td>
                    <td style={{padding:"12px 16px",textAlign:"right",fontFamily:"JetBrains Mono,monospace",fontWeight:700,fontSize:16,color:"var(--sec)"}}>{fmtRD(totalEfectivo)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Otros medios */}
          <div className="card">
            <div className="card-hdr"><div className="card-ttl">Otros medios de pago recibidos</div></div>
            <div className="card-bdy">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                {[
                  {l:"Cheques RD$",       v:cheques,   set:setCheques,   icon:"📋"},
                  {l:"Tarjetas de crédito",v:tarjetas,  set:setTarjetas, icon:"💳"},
                  {l:"Transferencias",     v:"",         set:null,         icon:"🏦", readonly:true, val:esperadoTransf},
                  {l:"Otros",              v:otros,      set:setOtros,    icon:"💰"},
                ].map(f=>(
                  <div key={f.l} className="fld">
                    <label>{f.icon} {f.l}</label>
                    {f.readonly
                      ? <div style={{background:"var(--sur2)",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",padding:"8px 12px",fontFamily:"JetBrains Mono,monospace",fontSize:14,fontWeight:600,color:"var(--sec)"}}>{fmtRD(f.val)}</div>
                      : <input type="number" min="0" value={f.v} onChange={e=>f.set(e.target.value)} placeholder="0.00" style={{fontFamily:"JetBrains Mono,monospace",fontSize:14}}/>
                    }
                  </div>
                ))}
              </div>

              <div style={{height:1,background:"var(--out)",margin:"14px 0"}}/>
              <div style={{fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,color:"var(--on-sur3)",marginBottom:10}}>Menos</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                {[
                  {l:"Depósitos bancarios",v:depositos,set:setDepos,  icon:"🏧"},
                  {l:"Devoluciones",       v:devolucion,set:setDevol, icon:"↩"},
                ].map(f=>(
                  <div key={f.l} className="fld">
                    <label>{f.icon} {f.l}</label>
                    <input type="number" min="0" value={f.v} onChange={e=>f.set(e.target.value)} placeholder="0.00" style={{fontFamily:"JetBrains Mono,monospace",fontSize:14}}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — summary + close */}
        <div style={{position:"sticky",top:80}}>
          <div className="card" style={{marginBottom:14}}>
            <div className="card-hdr"><div className="card-ttl">Resumen del día</div></div>
            <div className="card-bdy">
              {/* Expected vs counted */}
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,color:"var(--on-sur3)",marginBottom:8}}>Esperado del sistema</div>
                {[
                  ["Efectivo",      esperadoEfect,   "var(--sec)"],
                  ["Cheques",       esperadoCheques, "var(--pri)"],
                  ["Tarjetas",      esperadoTarj,    "#92400e"],
                  ["Transferencias",esperadoTransf,   "var(--on-sur2)"],
                ].map(([l,v,c])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:13,borderBottom:"1px solid var(--out)"}}>
                    <span style={{color:"var(--on-sur3)"}}>{l}</span>
                    <span className="mono" style={{fontWeight:600,color:c}}>{fmtRD(v)}</span>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",fontSize:14,fontWeight:700,borderTop:"2px solid var(--out)",marginTop:2}}>
                  <span>Total esperado</span>
                  <span className="mono" style={{color:"var(--on-sur2)"}}>{fmtRD(totalEsperado)}</span>
                </div>
              </div>

              {/* Counted */}
              <div style={{background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"12px 14px",marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,color:"var(--on-sur3)",marginBottom:8}}>Contado en caja</div>
                {[
                  ["Efectivo",      totalEfectivo,  "var(--sec)"],
                  ["Cheques",       totalCheqNum,   "var(--pri)"],
                  ["Tarjetas",      totalTarjNum,   "#92400e"],
                  ["Otros",         totalOtrosNum,  "var(--on-sur2)"],
                  ["− Depósitos",   -totalDeposNum, "var(--err)"],
                  ["− Devoluciones",-totalDevolNum, "var(--err)"],
                ].filter(([,v])=>v!==0).map(([l,v,c])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:13}}>
                    <span style={{color:"var(--on-sur3)"}}>{l}</span>
                    <span className="mono" style={{color:c,fontWeight:600}}>{v<0?`-${fmtRD(Math.abs(v))}`:fmtRD(v)}</span>
                  </div>
                ))}
              </div>

              {/* En caja */}
              <div style={{background:"var(--pri-lt)",borderRadius:"var(--r-sm)",padding:"14px 16px",marginBottom:12}}>
                <div style={{fontSize:12,color:"var(--pri-dk)",marginBottom:4}}>EN CAJA</div>
                <div className="mono" style={{fontSize:26,fontWeight:700,color:"var(--pri)"}}>{fmtRD(enCaja)}</div>
              </div>

              {/* Diferencia */}
              {(totalEsperado>0||enCaja>0)&&(
                <div style={{background:Math.abs(diferencia)<1?"var(--sec-lt)":diferencia>0?"var(--pri-lt)":"var(--err-lt)",borderRadius:"var(--r-sm)",padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:13,fontWeight:600,color:Math.abs(diferencia)<1?"var(--sec)":diferencia>0?"var(--pri)":"var(--err)"}}>
                    {Math.abs(diferencia)<1?"✓ Cuadre exacto":diferencia>0?"▲ Sobrante":"▼ Faltante"}
                  </span>
                  <span className="mono" style={{fontWeight:700,fontSize:15,color:Math.abs(diferencia)<1?"var(--sec)":diferencia>0?"var(--pri)":"var(--err)"}}>
                    {Math.abs(diferencia)<1?"—":fmtRD(Math.abs(diferencia))}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button className="btn btn-filled" style={{width:"100%",marginBottom:8,background:enCaja>0?"var(--sec)":"var(--sur3)",color:enCaja>0?"#fff":"var(--on-sur4)"}}
            onClick={cerrarCaja} disabled={enCaja===0}>
            🔒 Cerrar Caja del Día
          </button>
          <button className="btn btn-text" style={{width:"100%",fontSize:12}} onClick={()=>setShowHist(v=>!v)}>
            {showHist?"▲ Ocultar historial":"📋 Ver cierres anteriores"}
          </button>

          {showHist && (
            <div style={{marginTop:12}}>
              {cierres.map(c=>(
                <div key={c.id} style={{background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"10px 14px",marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontWeight:600,fontSize:13}}>{fmtDate(c.fecha)}</span>
                    <span className="mono" style={{fontWeight:700,color:"var(--pri)"}}>{fmtRD(c.total)}</span>
                  </div>
                  <div style={{fontSize:11,color:"var(--on-sur3)"}}>Ef {fmtRD(c.efectivo)} · Chq {fmtRD(c.cheques)} · Tarj {fmtRD(c.tarjetas)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  const hoy = DEMO_RECIBOS.reduce((s,r)=>s+r.valor,0);

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        {[
          {l:"Recibos hoy",    n:DEMO_RECIBOS.length, i:"🧾", bg:"var(--sur3)"},
          {l:"Total del día",  n:fmtRD(hoy),          i:"💰", bg:"var(--sec-lt)"},
          {l:"En efectivo",    n:fmtRD(DEMO_RECIBOS.filter(r=>r.metodo==="Efectivo").reduce((s,r)=>s+r.valor,0)), i:"💵", bg:"var(--pri-lt)"},
          {l:"Último cierre",  n:cierres[0]?`${fmtRD(cierres[0].total)}`:"—", i:"🔒", bg:"var(--sur3)"},
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
        {[["recibos","🧾 Recibos del día"],["cuadre","🔒 Cuadre de Caja"]].map(([v,l])=>(
          <button key={v} className={"seg-tab"+(tab===v?" on":"")} onClick={()=>setTab(v)}>{l}</button>
        ))}
      </div>

      {tab==="recibos" && <TabRecibos/>}
      {tab==="cuadre"  && <TabCuadre/>}

      {toast && <div className="toast-msg">{toast}</div>}
    </div>
  );
}
