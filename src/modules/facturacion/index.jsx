/**
 * FACTURACIÓN EXPANDIDA
 * 5 tabs:
 *  1. Facturas      — lista, crear desde cotización, detalle, cobrar
 *  2. Recibos       — registrar pagos, asignar a facturas
 *  3. Notas Crédito — crear NC, aplicar a factura o devolver efectivo
 *  4. CxC           — estado de cuenta por cliente
 *  5. Débitos       — notas de débito a clientes
 */
import { useState } from "react";
import { apiPost } from "../../api.js";
import { ModalEnviar, BtnWA } from "../../shared/Enviar.jsx";

function r2(n)      { return Math.round((n||0)*100)/100; }
function fmtRD(n)   { return `RD$${Math.round(n||0).toLocaleString("es-DO")}`; }
function today()    { return new Date().toISOString().slice(0,10); }
function fmtDate(d) { return d ? new Date(d+"T12:00:00").toLocaleDateString("es-DO",{day:"2-digit",month:"short",year:"numeric"}) : "—"; }
function daysLate(d){ return d ? Math.ceil((new Date()-new Date(d))/86400000) : 0; }

const ITBIS = 0.18;
const NCF_SERIES = {
  B01:{ desc:"Crédito Fiscal",   prefix:"B01", seq:3 },
  B02:{ desc:"Consumidor Final", prefix:"B02", seq:2 },
  B15:{ desc:"Gubernamental",    prefix:"B15", seq:1 },
};

// ── Demo data ─────────────────────────────────────────────────────────────────
const COTIZACIONES_APROBADAS = [
  { id:1, numero:"COT-001", cliente:"Constructora Pérez & Asociados", rnc:"101-12345-6", tel:"809-555-1234", precioPie:420, itbis:false, lineas:[{tipo:"Corrediza Tradicional",ancho:"48",alto:"60",cant:4,color:"Natural",ubicacion:"Sala",pie:80,precio:33600},{tipo:"Persiana Tipo A",ancho:"36",alto:"48",cant:6,color:"Natural",ubicacion:"Habitaciones",pie:54,precio:22680}]},
  { id:2, numero:"COT-006", cliente:"Aluminios del Este",              rnc:"104-44444-4", tel:"809-555-1111", precioPie:380, itbis:true,  lineas:[{tipo:"Corrediza P-65",ancho:"60",alto:"72",cant:3,color:"Anodizado Bronce",ubicacion:"Fachada",pie:90,precio:34200}]},
];

const INIT_FACTURAS = [
  { id:1, numero:"FAC-001", ncf:"B01-00000001", serie:"B01", cotizacion:"COT-001", cliente:"Constructora Pérez & Asociados", rnc:"101-12345-6", tel:"809-555-1234", fecha:"2025-06-01", vence:"2025-07-01", condicion:"Crédito 30d", vendedor:"Mario Vuk", estado:"Pagada",   items:[{desc:'Corrediza 48×60" Natural ×4',cant:1,precio:33600,subtotal:33600},{desc:'Persiana A 36×48" Natural ×6',cant:1,precio:22680,subtotal:22680}], subtotal:56280, itbis:0,     total:56280,  pagado:56280,  pagos:[{id:1,fecha:"2025-06-05",monto:56280,metodo:"Transferencia",ref:"TRF-001"}], notas:"", conduce:"" },
  { id:2, numero:"FAC-002", ncf:"B02-00000001", serie:"B02", cotizacion:"COT-002", cliente:"Ferretería El Martillo",          rnc:"",            tel:"829-555-5678", fecha:"2025-06-05", vence:"2025-06-20", condicion:"Contado",      vendedor:"Carmen Pérez", estado:"Pendiente", items:[{desc:'P-65 60×72" Natural ×2',cant:1,precio:19000,subtotal:19000}], subtotal:19000, itbis:3420,  total:22420,  pagado:0,      pagos:[], notas:"Pago acordado en efectivo", conduce:"" },
  { id:3, numero:"FAC-003", ncf:"B01-00000002", serie:"B01", cotizacion:"COT-004", cliente:"Inmobiliaria Vista Verde",          rnc:"130-98765-4", tel:"809-555-3456", fecha:"2025-05-28", vence:"2025-06-28", condicion:"Crédito 30d", vendedor:"Mario Vuk",    estado:"Parcial",  items:[{desc:'P-92 72×84" Bronce ×4',cant:1,precio:75600,subtotal:75600}], subtotal:75600, itbis:13608, total:89208,  pagado:40000,  pagos:[{id:2,fecha:"2025-06-01",monto:40000,metodo:"Transferencia",ref:"TRF-002"}], notas:"Pago parcial recibido", conduce:"" },
  { id:4, numero:"FAC-004", ncf:"B02-00000002", serie:"B02", cotizacion:"COT-003", cliente:"María González",                   rnc:"",            tel:"849-555-9012", fecha:"2025-05-15", vence:"2025-05-30", condicion:"Contado",      vendedor:"Carmen Pérez", estado:"Vencida",  items:[{desc:'Puerta Comercial 36×84" Natural ×1',cant:1,precio:6800,subtotal:6800}], subtotal:6800, itbis:0, total:6800, pagado:0, pagos:[], notas:"", conduce:"" },
];

const INIT_RECIBOS = [
  { id:1, numero:"REC-001", fecha:"2025-06-05", cliente:"Constructora Pérez & Asociados", monto:56280, metodo:"Transferencia", ref:"TRF-001", concepto:"Pago FAC-001", facturas:["FAC-001"], aplicado:true },
  { id:2, numero:"REC-002", fecha:"2025-06-01", cliente:"Inmobiliaria Vista Verde",         monto:40000, metodo:"Transferencia", ref:"TRF-002", concepto:"Abono FAC-003", facturas:["FAC-003"], aplicado:true },
];

const INIT_NC = [
  { id:1, numero:"NC-001", ncf:"B04-00000001", fecha:"2025-06-10", cliente:"Ferretería El Martillo", factura_ref:"FAC-002", monto:2000, motivo:"Descuento especial acordado", tipo:"aplicada_factura", estado:"Aplicada" },
];

const INIT_DEBITOS = [
  { id:1, numero:"ND-001", fecha:"2025-06-08", cliente:"Persianas del Norte", factura_ref:"FAC-005", monto:1500, motivo:"Cargo por retraso en pago", estado:"Pendiente" },
];

const EST = {
  Pagada:   "chip-filled-sec",
  Pendiente:"chip-filled-warn",
  Parcial:  "chip-filled-pri",
  Vencida:  "chip-filled-err",
  Anulada:  "chip-filled-err",
};

function nextNCF(serie) {
  const s = NCF_SERIES[serie];
  return `${s.prefix}-${String(s.seq).padStart(8,"0")}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function Facturacion() {
  const [tab,      setTab]   = useState("facturas");
  const [facturas, setFacts] = useState(INIT_FACTURAS);
  const [recibos,  setRecib] = useState(INIT_RECIBOS);
  const [ncs,      setNCs]   = useState(INIT_NC);
  const [debitos,  setDeb]   = useState(INIT_DEBITOS);
  const [view,     setView]  = useState("list");
  const [form,     setForm]  = useState(null);
  const [sel,      setSel]   = useState(null);
  const [modal,    setModal] = useState(null);
  const [toast,    setToast] = useState("");
  const [pdfLoad,  setPdfL]  = useState(false);
  const [enviarModal, setEnviarModal] = useState(null);

  function showToast(msg){ setToast(msg); setTimeout(()=>setToast(""),2600); }

  // ── Computed stats ────────────────────────────────────────────────────────
  const totalPend   = facturas.filter(f=>f.estado!=="Pagada"&&f.estado!=="Anulada").reduce((s,f)=>s+(f.total-f.pagado),0);
  const totalVenc   = facturas.filter(f=>f.estado==="Vencida").length;
  const totalCobMes = facturas.filter(f=>f.estado==="Pagada").reduce((s,f)=>s+f.total,0);
  const totalParcial= facturas.filter(f=>f.estado==="Parcial").length;

  function goList(){ setView("list"); setForm(null); setSel(null); }

  // ── Create invoice from cotización ────────────────────────────────────────
  function crearDesdeCot(cot) {
    const sub  = cot.lineas.reduce((s,l)=>s+l.precio,0);
    const itb  = cot.itbis ? r2(sub*ITBIS) : 0;
    const serie= cot.rnc ? "B01" : "B02";
    setForm({
      id:null, cotizacion:cot.numero, cliente:cot.cliente, rnc:cot.rnc||"",
      tel:cot.tel||"", serie, ncf:nextNCF(serie),
      fecha:today(), vence:"", condicion:"Contado", vendedor:"Mario Vuk",
      estado:"Pendiente", conduce:"",
      items: cot.lineas.map(l=>({
        desc:`${l.tipo} ${l.ancho}"×${l.alto}" ${l.color}${l.cant>1?` ×${l.cant}`:""}${l.ubicacion?" — "+l.ubicacion:""}`,
        cant:1, precio:l.precio, subtotal:l.precio,
      })),
      subtotal:sub, itbis:itb, total:r2(sub+itb), pagado:0, pagos:[], notas:"",
    });
    setView("form");
  }

  function crearNueva() {
    setForm({ id:null, cotizacion:"", cliente:"", rnc:"", tel:"", serie:"B02", ncf:nextNCF("B02"), fecha:today(), vence:"", condicion:"Contado", vendedor:"Mario Vuk", estado:"Pendiente", conduce:"", items:[{desc:"",cant:1,precio:0,subtotal:0}], subtotal:0, itbis:0, total:0, pagado:0, pagos:[], notas:"" });
    setView("form");
  }

  function saveFactura() {
    if(!form.cliente.trim()) return;
    const sub  = r2(form.items.reduce((s,i)=>s+(parseFloat(i.subtotal)||0),0));
    const itb  = form.serie==="B01" ? r2(sub*ITBIS) : 0;
    const total= r2(sub+itb);
    const numero = form.id ? form.numero : `FAC-${String(facturas.length+1).padStart(3,"0")}`;
    const f = {...form, numero, subtotal:sub, itbis:itb, total};
    if(form.id){ setFacts(fs=>fs.map(x=>x.id===f.id?f:x)); setSel(f); }
    else { const n={...f,id:Date.now()}; setFacts(fs=>[...fs,n]); setSel(n); }
    setView("detail");
    showToast("Factura guardada ✓");
  }

  function updateItem(idx,k,v){
    setForm(f=>{
      const items=[...f.items];
      items[idx]={...items[idx],[k]:v};
      if(k==="cant"||k==="precio") items[idx].subtotal=r2((parseFloat(items[idx].cant)||0)*(parseFloat(items[idx].precio)||0));
      return {...f,items};
    });
  }

  async function downloadPDF(fact, tipo="normal") {
    setPdfL(true);
    try {
      const res = await apiPost("/api/pdf/factura",{
        numero:fact.numero, tipo, ncf:fact.ncf, serie:fact.serie,
        cliente:fact.cliente, rnc:fact.rnc||null,
        fecha:fact.fecha, vence:fact.vence||"",
        items:fact.items, subtotal:fact.subtotal, itbis:fact.itbis, total:fact.total,
        notas:fact.notas||"", pagos:fact.pagos||[],
        empresa:{nombre:"Ventaneros SRL",rnc:"1-31-12345-6",direccion:"Santo Domingo, R.D.",slogan:"Fabricación de Ventanas y Puertas de Aluminio"},
      });
      const blob=await res.blob();
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a"); a.href=url; a.download=`Factura-${fact.numero}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(()=>URL.revokeObjectURL(url),1000);
      showToast("PDF descargado ✓");
    } catch(e){ showToast("Error al generar PDF: "+e.message); }
    finally{ setPdfL(false); }
  }

  function registrarPago(factId, pago) {
    setFacts(fs=>fs.map(f=>{
      if(f.id!==factId) return f;
      const pagos=[...f.pagos,{id:Date.now(),...pago}];
      const pagado=r2(pagos.reduce((s,p)=>s+p.monto,0));
      const estado=pagado>=f.total?"Pagada":pagado>0?"Parcial":"Pendiente";
      return {...f,pagos,pagado,estado};
    }));
    showToast("Pago registrado ✓");
  }

  function anularFactura(id){
    if(!confirm("¿Anular esta factura? Esta acción no se puede deshacer.")) return;
    setFacts(fs=>fs.map(f=>f.id===id?{...f,estado:"Anulada"}:f));
    showToast("Factura anulada");
    goList();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FORM — crear/editar factura
  // ════════════════════════════════════════════════════════════════════════════
  function FormFactura() {
    const sf=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
    const sub=r2(form.items.reduce((s,i)=>s+(parseFloat(i.subtotal)||0),0));
    const itb=form.serie==="B01"?r2(sub*ITBIS):0;
    const tot=r2(sub+itb);

    return(
      <div>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
          <button className="btn btn-text" onClick={goList}>← Facturas</button>
          <div style={{fontSize:20,fontWeight:700}}>{form.id?`Editar ${form.numero}`:"Nueva Factura"}</div>
          {form.cotizacion&&<span className="chip" style={{fontSize:12}}>desde {form.cotizacion}</span>}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:20,alignItems:"start"}}>
          <div>
            <div className="card" style={{marginBottom:16}}>
              <div className="card-hdr"><div className="card-ttl">Datos del cliente y factura</div></div>
              <div className="card-bdy">
                <div className="fgrid f2" style={{gap:14}}>
                  <div className="fld" style={{gridColumn:"1/-1"}}><label>Cliente *</label><input value={form.cliente} onChange={sf("cliente")} autoFocus/></div>
                  <div className="fld"><label>RNC / Cédula</label><input value={form.rnc} onChange={e=>{setForm(f=>({...f,rnc:e.target.value,serie:e.target.value?"B01":"B02",ncf:nextNCF(e.target.value?"B01":"B02")}))}} placeholder="101-00000-0"/></div>
                  <div className="fld"><label>Teléfono</label><input value={form.tel} onChange={sf("tel")}/></div>
                  <div className="fld"><label>NCF</label>
                    <div style={{display:"flex",gap:8}}>
                      <select value={form.serie} onChange={e=>setForm(f=>({...f,serie:e.target.value,ncf:nextNCF(e.target.value)}))} style={{width:80,padding:"8px 6px",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",background:"var(--sur)",fontFamily:"inherit",fontSize:12,outline:"none"}}>
                        {Object.entries(NCF_SERIES).map(([k,v])=><option key={k} value={k}>{k}</option>)}
                      </select>
                      <input value={form.ncf} onChange={sf("ncf")} style={{flex:1,fontFamily:"JetBrains Mono,monospace",fontSize:12}}/>
                    </div>
                  </div>
                  <div className="fld"><label>Fecha</label><input type="date" value={form.fecha} onChange={sf("fecha")}/></div>
                  <div className="fld"><label>Fecha de vencimiento</label><input type="date" value={form.vence} onChange={sf("vence")}/></div>
                  <div className="fld"><label>Condición</label>
                    <select value={form.condicion} onChange={sf("condicion")}>
                      {["Contado","Crédito 15d","Crédito 30d","Crédito 60d"].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="fld"><label>Vendedor</label><input value={form.vendedor} onChange={sf("vendedor")}/></div>
                  <div className="fld"><label>No. de Conduce</label><input value={form.conduce} onChange={sf("conduce")} placeholder="COND-001"/></div>
                  <div className="fld" style={{gridColumn:"1/-1"}}><label>Notas</label>
                    <textarea value={form.notas} onChange={sf("notas")} style={{background:"var(--sur2)",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",padding:"8px 12px",fontFamily:"inherit",fontSize:13,color:"var(--on-sur)",outline:"none",width:"100%",resize:"vertical",minHeight:56}}/>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-hdr">
                <div className="card-ttl">Líneas</div>
                <button className="btn btn-sm btn-outlined" onClick={()=>setForm(f=>({...f,items:[...f.items,{desc:"",cant:1,precio:0,subtotal:0}]}))}>＋ Agregar</button>
              </div>
              <div className="card-bdy" style={{padding:0}}>
                {form.items.map((it,i)=>(
                  <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 72px 110px 110px 32px",gap:10,padding:"12px 20px",borderBottom:i<form.items.length-1?"1px solid var(--out)":"none",alignItems:"end"}}>
                    <div className="fld"><label>{i===0?"Descripción":""}</label><input value={it.desc} onChange={e=>updateItem(i,"desc",e.target.value)} placeholder="Descripción del artículo"/></div>
                    <div className="fld"><label>{i===0?"Cant.":""}</label><input type="number" min="1" value={it.cant} onChange={e=>updateItem(i,"cant",e.target.value)}/></div>
                    <div className="fld"><label>{i===0?"Precio unit.":""}</label><input type="number" min="0" value={it.precio} onChange={e=>updateItem(i,"precio",e.target.value)}/></div>
                    <div className="fld"><label>{i===0?"Subtotal":""}</label>
                      <div style={{background:"var(--sur2)",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",padding:"8px 10px",fontFamily:"JetBrains Mono,monospace",fontSize:13,color:"var(--sec)",fontWeight:600}}>{fmtRD(it.subtotal)}</div>
                    </div>
                    {form.items.length>1&&<button style={{background:"none",border:"none",cursor:"pointer",color:"var(--err)",fontSize:18,marginBottom:2}} onClick={()=>setForm(f=>({...f,items:f.items.filter((_,xi)=>xi!==i)}))}>🗑</button>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{position:"sticky",top:80}}>
            <div className="card" style={{marginBottom:12}}>
              <div className="card-bdy">
                <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--out)",fontSize:13}}><span style={{color:"var(--on-sur3)"}}>Subtotal</span><span className="mono" style={{fontWeight:600}}>{fmtRD(sub)}</span></div>
                {form.serie==="B01"&&<div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--out)",fontSize:13}}><span style={{color:"var(--on-sur3)"}}>ITBIS 18%</span><span className="mono" style={{color:"var(--sec)",fontWeight:600}}>{fmtRD(itb)}</span></div>}
                <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontSize:17,fontWeight:700}}><span>TOTAL</span><span className="mono" style={{color:"var(--pri)"}}>{fmtRD(tot)}</span></div>
                <div style={{fontSize:11,color:"var(--on-sur3)",textAlign:"center",paddingTop:4}}>{NCF_SERIES[form.serie]?.desc}</div>
              </div>
            </div>
            <button className="btn btn-filled" style={{width:"100%",marginBottom:8}} onClick={saveFactura} disabled={!form.cliente.trim()}>
              {form.id?"Guardar cambios":"Crear Factura"}
            </button>
            <button className="btn btn-text" style={{width:"100%"}} onClick={goList}>Cancelar</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DETAIL — ver factura
  // ════════════════════════════════════════════════════════════════════════════
  function DetailFactura({ f }) {
    const [pagoF, setPagoF]=useState({fecha:today(),monto:r2(f.total-f.pagado),metodo:"Transferencia",ref:""});
    const pend=r2(f.total-f.pagado);

    return(
      <div>
        <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:20,flexWrap:"wrap"}}>
          <button className="btn btn-text" onClick={goList}>← Facturas</button>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <span style={{fontSize:22,fontWeight:700}}>{f.numero}</span>
              <span className={`chip ${EST[f.estado]||"chip"}`}>{f.estado}</span>
              {f.ncf&&<span className="chip" style={{fontSize:11,fontFamily:"JetBrains Mono,monospace"}}>{f.ncf}</span>}
              {f.cotizacion&&<span className="chip" style={{fontSize:11}}>{f.cotizacion}</span>}
            </div>
            <div style={{fontSize:13,color:"var(--on-sur3)",marginTop:4}}>{f.cliente}{f.rnc?` · RNC: ${f.rnc}`:""} · {f.tel}</div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {f.estado!=="Anulada"&&<button className="btn btn-outlined" onClick={()=>setForm({...f})||setView("form")}>✏️ Editar</button>}
            <button className="btn btn-outlined" onClick={()=>downloadPDF(f,"normal")} disabled={pdfLoad}>⬇ PDF</button>
            <button className="btn btn-outlined" style={{background:"#f0fdf4",borderColor:"#25D366",color:"#16a34a"}} onClick={()=>setEnviarModal({...f,tipoEnv:f.estado==="Vencida"?"vencida":f.estado==="Pendiente"||f.estado==="Parcial"?"recordatorio":"factura"})}>📤 Enviar</button>
            <button className="btn btn-filled" style={{background:"var(--sec)"}} onClick={()=>downloadPDF(f,"fiscal")} disabled={pdfLoad}>🏛️ Fiscal</button>
            {f.estado!=="Anulada"&&f.estado!=="Pagada"&&<button className="btn btn-outlined" style={{color:"var(--err)",borderColor:"var(--err)"}} onClick={()=>anularFactura(f.id)}>Anular</button>}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:20}}>
          <div>
            <div className="card" style={{marginBottom:16}}>
              <div className="card-hdr"><div className="card-ttl">Líneas de factura</div></div>
              <div className="twrap"><table>
                <thead><tr><th>Descripción</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
                <tbody>
                  {f.items.map((it,i)=>(
                    <tr key={i}><td style={{fontWeight:500}}>{it.desc}</td><td style={{textAlign:"center"}}>{it.cant}</td><td className="mono">{fmtRD(it.precio)}</td><td><span className="mono" style={{fontWeight:700,color:"var(--pri)"}}>{fmtRD(it.subtotal)}</span></td></tr>
                  ))}
                </tbody>
              </table></div>
            </div>

            {/* Historial de pagos */}
            {f.pagos?.length>0&&(
              <div className="card" style={{marginBottom:16}}>
                <div className="card-hdr"><div className="card-ttl">Pagos recibidos</div></div>
                <div className="twrap"><table>
                  <thead><tr><th>Fecha</th><th>Método</th><th>Referencia</th><th>Monto</th></tr></thead>
                  <tbody>
                    {f.pagos.map((p,i)=>(
                      <tr key={i}><td className="mono" style={{fontSize:12}}>{fmtDate(p.fecha)}</td><td><span className="chip" style={{fontSize:11}}>{p.metodo}</span></td><td className="mono" style={{fontSize:11,color:"var(--on-sur3)"}}>{p.ref||"—"}</td><td><span className="mono" style={{fontWeight:700,color:"var(--sec)"}}>{fmtRD(p.monto)}</span></td></tr>
                    ))}
                  </tbody>
                </table></div>
              </div>
            )}

            {/* Registrar pago */}
            {f.estado!=="Pagada"&&f.estado!=="Anulada"&&(
              <div className="card">
                <div className="card-hdr"><div className="card-ttl">Registrar pago</div></div>
                <div className="card-bdy">
                  {f.estado==="Vencida"&&<div style={{background:"#fce8e6",borderRadius:"var(--r-sm)",padding:"8px 12px",marginBottom:12,fontSize:13,color:"var(--err)",fontWeight:600}}>⚠ Factura vencida desde {fmtDate(f.vence)} — {daysLate(f.vence)}d de retraso</div>}
                  <div className="fgrid f2" style={{gap:12}}>
                    <div className="fld"><label>Fecha</label><input type="date" value={pagoF.fecha} onChange={e=>setPagoF(p=>({...p,fecha:e.target.value}))}/></div>
                    <div className="fld"><label>Monto</label><input type="number" min="0" value={pagoF.monto} onChange={e=>setPagoF(p=>({...p,monto:parseFloat(e.target.value)||0}))} style={{fontFamily:"JetBrains Mono,monospace",fontWeight:700}}/></div>
                    <div className="fld"><label>Método</label>
                      <select value={pagoF.metodo} onChange={e=>setPagoF(p=>({...p,metodo:e.target.value}))}>
                        {["Transferencia","Efectivo","Cheque","Tarjeta"].map(m=><option key={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="fld"><label>Referencia</label><input value={pagoF.ref} onChange={e=>setPagoF(p=>({...p,ref:e.target.value}))} placeholder="TRF-001 / CHQ-042"/></div>
                  </div>
                  <button className="btn btn-filled" style={{marginTop:12,background:"var(--sec)"}} onClick={()=>{ registrarPago(f.id,{...pagoF}); setSel(s=>{ const u={...s,...facturas.find(x=>x.id===s.id)||{}}; return u; }); }}>
                    💰 Registrar pago de {fmtRD(pagoF.monto)}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="card" style={{marginBottom:12}}>
              <div className="card-bdy">
                {[["Fecha",fmtDate(f.fecha)],["Vence",fmtDate(f.vence)],["Condición",f.condicion],["Vendedor",f.vendedor||"—"],["Serie NCF",NCF_SERIES[f.serie]?.desc||f.serie]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--out)",fontSize:13}}>
                    <span style={{color:"var(--on-sur3)"}}>{l}</span>
                    <span style={{fontWeight:500,textAlign:"right",fontSize:12}}>{v}</span>
                  </div>
                ))}
                <div style={{height:1,background:"var(--out)",margin:"6px 0"}}/>
                {[["Subtotal",fmtRD(f.subtotal)],f.itbis>0&&["ITBIS 18%",fmtRD(f.itbis)]].filter(Boolean).map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:13}}><span style={{color:"var(--on-sur3)"}}>{l}</span><span className="mono" style={{fontWeight:600}}>{v}</span></div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontSize:18,fontWeight:700,borderTop:"2px solid var(--out)",marginTop:4}}><span>TOTAL</span><span className="mono" style={{color:"var(--pri)"}}>{fmtRD(f.total)}</span></div>
                {f.pagado>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"var(--sec)",fontWeight:600}}><span>Pagado</span><span className="mono">{fmtRD(f.pagado)}</span></div>}
                {pend>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:700,color:"var(--err)",marginTop:4}}><span>Pendiente</span><span className="mono">{fmtRD(pend)}</span></div>}
              </div>
            </div>
            {f.notas&&<div style={{background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"10px 14px",fontSize:12,color:"var(--on-sur2)"}}>📝 {f.notas}</div>}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TAB: FACTURAS
  // ════════════════════════════════════════════════════════════════════════════
  function TabFacturas(){
    const [q,setQ]=useState(""); const [fe,setFe]=useState("todas");
    const filtered=facturas.filter(f=>{
      const m=f.cliente.toLowerCase().includes(q.toLowerCase())||f.numero.toLowerCase().includes(q.toLowerCase());
      return fe==="todas"?m:m&&f.estado===fe;
    });

    if(view==="form"&&form)   return <FormFactura/>;
    if(view==="detail"&&sel)  return <DetailFactura f={facturas.find(x=>x.id===sel.id)||sel}/>;

    return(
      <div>
        {/* Create from cot banner */}
        {COTIZACIONES_APROBADAS.length>0&&(
          <div style={{background:"var(--sec-lt)",border:"1px solid #a8d5b5",borderRadius:"var(--r-sm)",padding:"12px 16px",marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--sec-dk)",marginBottom:8}}>📋 Cotizaciones aprobadas listas para facturar</div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              {COTIZACIONES_APROBADAS.map(c=>(
                <button key={c.id} className="btn btn-sm" style={{background:"var(--sec)",color:"#fff",border:"none",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:12,padding:"5px 14px"}}
                  onClick={()=>crearDesdeCot(c)}>
                  {c.numero} — {c.cliente.split(" ")[0]} →
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
          <div className="sbar"><span style={{color:"var(--on-sur4)"}}>🔍</span><input placeholder="Buscar factura o cliente..." value={q} onChange={e=>setQ(e.target.value)}/>{q&&<button style={{background:"none",border:"none",cursor:"pointer",color:"var(--on-sur4)",fontSize:16}} onClick={()=>setQ("")}>✕</button>}</div>
          <select style={{padding:"8px 14px",borderRadius:"var(--rfull)",border:"1px solid var(--out)",background:"var(--sur)",fontFamily:"inherit",fontSize:13,outline:"none"}} value={fe} onChange={e=>setFe(e.target.value)}>
            <option value="todas">Todos</option>
            {["Pendiente","Parcial","Pagada","Vencida","Anulada"].map(k=><option key={k}>{k}</option>)}
          </select>
          <button className="btn btn-filled" onClick={crearNueva} style={{marginLeft:"auto"}}>＋ Nueva Factura</button>
        </div>

        <div className="card"><div className="twrap"><table>
          <thead><tr><th>Número</th><th>NCF</th><th>Cliente</th><th>Fecha</th><th>Vence</th><th>Total</th><th>Pagado</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {filtered.length===0&&<tr><td colSpan={9} style={{textAlign:"center",padding:52,color:"var(--on-sur4)"}}><div style={{fontSize:32,marginBottom:8}}>🧾</div>Sin facturas</td></tr>}
            {filtered.map(f=>{
              const pend=r2(f.total-f.pagado);
              const late=f.estado==="Vencida"?daysLate(f.vence):0;
              return(
                <tr key={f.id} style={{cursor:"pointer"}} onClick={()=>{setSel(f);setView("detail");}}>
                  <td><span className="mono" style={{fontWeight:700,color:"var(--pri)"}}>{f.numero}</span></td>
                  <td className="mono" style={{fontSize:11,color:"var(--on-sur4)"}}>{f.ncf}</td>
                  <td><div style={{fontWeight:500}}>{f.cliente}</div>{f.cotizacion&&<div style={{fontSize:11,color:"var(--on-sur4)"}}>{f.cotizacion}</div>}</td>
                  <td className="mono" style={{fontSize:12}}>{fmtDate(f.fecha)}</td>
                  <td>
                    <div className="mono" style={{fontSize:12,color:late>0?"var(--err)":"var(--on-sur3)"}}>{fmtDate(f.vence)}</div>
                    {late>0&&<div style={{fontSize:10,color:"var(--err)",fontWeight:600}}>{late}d vencida</div>}
                  </td>
                  <td><span className="mono" style={{fontWeight:700}}>{fmtRD(f.total)}</span></td>
                  <td>
                    {f.pagado>0?<span className="mono" style={{color:"var(--sec)",fontWeight:600}}>{fmtRD(f.pagado)}</span>:<span style={{color:"var(--on-sur4)",fontSize:12}}>—</span>}
                    {pend>0&&f.estado!=="Anulada"&&<div style={{fontSize:10,color:"var(--err)",fontWeight:600}}>{fmtRD(pend)} pend.</div>}
                  </td>
                  <td><span className={`chip ${EST[f.estado]||"chip"}`} style={{fontSize:11}}>{f.estado}</span></td>
                  <td onClick={e=>e.stopPropagation()}><button className="btn-sm-ghost" onClick={()=>downloadPDF(f)} disabled={pdfLoad}>⬇️</button></td>
                </tr>
              );
            })}
          </tbody>
        </table></div></div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TAB: RECIBOS DE INGRESO
  // ════════════════════════════════════════════════════════════════════════════
  function TabRecibos(){
    const [modal2,setModal2]=useState(null);
    const [rf,setRf]=useState({fecha:today(),cliente:"",monto:"",metodo:"Transferencia",ref:"",concepto:"",facturas_sel:[]});

    function crearRecibo(){
      if(!rf.cliente||!rf.monto)return;
      const r={id:Date.now(),numero:`REC-${String(recibos.length+1).padStart(3,"0")}`,fecha:rf.fecha,cliente:rf.cliente,monto:parseFloat(rf.monto),metodo:rf.metodo,ref:rf.ref,concepto:rf.concepto,facturas:[],aplicado:false};
      setRecib(rs=>[r,...rs]);
      setModal2(null);
      showToast("Recibo creado ✓");
    }

    return(
      <div>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
          <button className="btn btn-filled" onClick={()=>setModal2("new")}>＋ Nuevo Recibo</button>
        </div>
        <div className="card"><div className="twrap"><table>
          <thead><tr><th>Número</th><th>Fecha</th><th>Cliente</th><th>Método</th><th>Concepto</th><th>Monto</th><th>Estado</th></tr></thead>
          <tbody>
            {recibos.length===0&&<tr><td colSpan={7} style={{textAlign:"center",padding:48,color:"var(--on-sur4)"}}>Sin recibos</td></tr>}
            {recibos.map(r=>(
              <tr key={r.id}>
                <td><span className="mono" style={{fontWeight:700,color:"var(--pri)",fontSize:12}}>{r.numero}</span></td>
                <td className="mono" style={{fontSize:12}}>{fmtDate(r.fecha)}</td>
                <td style={{fontWeight:500}}>{r.cliente}</td>
                <td><span className="chip" style={{fontSize:11}}>{r.metodo}</span></td>
                <td style={{fontSize:12,color:"var(--on-sur3)"}}>{r.concepto||"—"}</td>
                <td><span className="mono" style={{fontWeight:700,color:"var(--sec)"}}>{fmtRD(r.monto)}</span></td>
                <td><span className={`chip ${r.aplicado?"chip-filled-sec":"chip-filled-warn"}`} style={{fontSize:11}}>{r.aplicado?"Aplicado":"Pendiente"}</span></td>
              </tr>
            ))}
          </tbody>
        </table></div></div>

        {modal2==="new"&&(
          <div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setModal2(null);}}>
            <div className="modal" style={{maxWidth:480}}>
              <div className="modal-hdr"><div className="modal-ttl">Nuevo Recibo de Ingreso</div><button className="icon-btn" onClick={()=>setModal2(null)}>✕</button></div>
              <div className="modal-bdy">
                <div className="fgrid f2" style={{gap:13}}>
                  <div className="fld"><label>Fecha</label><input type="date" value={rf.fecha} onChange={e=>setRf(f=>({...f,fecha:e.target.value}))}/></div>
                  <div className="fld"><label>Cliente *</label><input value={rf.cliente} onChange={e=>setRf(f=>({...f,cliente:e.target.value}))} autoFocus/></div>
                  <div className="fld"><label>Monto *</label><input type="number" value={rf.monto} onChange={e=>setRf(f=>({...f,monto:e.target.value}))} style={{fontFamily:"JetBrains Mono,monospace",fontWeight:700}}/></div>
                  <div className="fld"><label>Método</label>
                    <select value={rf.metodo} onChange={e=>setRf(f=>({...f,metodo:e.target.value}))}>
                      {["Transferencia","Efectivo","Cheque","Tarjeta"].map(m=><option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="fld"><label>Referencia</label><input value={rf.ref} onChange={e=>setRf(f=>({...f,ref:e.target.value}))} placeholder="TRF-001"/></div>
                  <div className="fld"><label>Concepto</label><input value={rf.concepto} onChange={e=>setRf(f=>({...f,concepto:e.target.value}))} placeholder="Pago FAC-001"/></div>
                </div>
              </div>
              <div className="modal-ftr"><button className="btn btn-text" onClick={()=>setModal2(null)}>Cancelar</button><button className="btn btn-filled" onClick={crearRecibo} disabled={!rf.cliente||!rf.monto}>Crear Recibo</button></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TAB: NOTAS DE CRÉDITO
  // ════════════════════════════════════════════════════════════════════════════
  function TabNC(){
    const [modal2,setModal2]=useState(null);
    const [nf,setNf]=useState({fecha:today(),cliente:"",factura_ref:"",monto:"",motivo:"",tipo:"aplicada_factura"});

    function crearNC(){
      if(!nf.cliente||!nf.monto)return;
      const nc={id:Date.now(),numero:`NC-${String(ncs.length+1).padStart(3,"0")}`,ncf:`B04-${String(10000000+ncs.length+1)}`,fecha:nf.fecha,cliente:nf.cliente,factura_ref:nf.factura_ref,monto:parseFloat(nf.monto),motivo:nf.motivo,tipo:nf.tipo,estado:"Pendiente"};
      setNCs(ns=>[nc,...ns]);
      setModal2(null);
      showToast("Nota de crédito creada ✓");
    }

    return(
      <div>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
          <button className="btn btn-filled" onClick={()=>setModal2("new")}>＋ Nueva Nota de Crédito</button>
        </div>
        <div className="card"><div className="twrap"><table>
          <thead><tr><th>Número</th><th>NCF</th><th>Fecha</th><th>Cliente</th><th>Factura ref.</th><th>Monto</th><th>Motivo</th><th>Estado</th></tr></thead>
          <tbody>
            {ncs.length===0&&<tr><td colSpan={8} style={{textAlign:"center",padding:48,color:"var(--on-sur4)"}}>Sin notas de crédito</td></tr>}
            {ncs.map(n=>(
              <tr key={n.id}>
                <td><span className="mono" style={{fontWeight:700,color:"var(--pri)",fontSize:12}}>{n.numero}</span></td>
                <td className="mono" style={{fontSize:11,color:"var(--on-sur4)"}}>{n.ncf}</td>
                <td className="mono" style={{fontSize:12}}>{fmtDate(n.fecha)}</td>
                <td style={{fontWeight:500}}>{n.cliente}</td>
                <td><span className="chip" style={{fontSize:11}}>{n.factura_ref||"—"}</span></td>
                <td><span className="mono" style={{fontWeight:700,color:"var(--err)"}}>{fmtRD(n.monto)}</span></td>
                <td style={{fontSize:12,color:"var(--on-sur3)"}}>{n.motivo}</td>
                <td><span className={`chip ${n.estado==="Aplicada"?"chip-filled-sec":"chip-filled-warn"}`} style={{fontSize:11}}>{n.estado}</span></td>
              </tr>
            ))}
          </tbody>
        </table></div></div>

        {modal2==="new"&&(
          <div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setModal2(null);}}>
            <div className="modal" style={{maxWidth:500}}>
              <div className="modal-hdr"><div className="modal-ttl">Nueva Nota de Crédito</div><button className="icon-btn" onClick={()=>setModal2(null)}>✕</button></div>
              <div className="modal-bdy">
                <div className="fgrid f2" style={{gap:13}}>
                  <div className="fld"><label>Fecha</label><input type="date" value={nf.fecha} onChange={e=>setNf(f=>({...f,fecha:e.target.value}))}/></div>
                  <div className="fld"><label>Cliente *</label><input value={nf.cliente} onChange={e=>setNf(f=>({...f,cliente:e.target.value}))} autoFocus/></div>
                  <div className="fld"><label>Factura a acreditar</label><input value={nf.factura_ref} onChange={e=>setNf(f=>({...f,factura_ref:e.target.value}))} placeholder="FAC-001"/></div>
                  <div className="fld"><label>Monto *</label><input type="number" value={nf.monto} onChange={e=>setNf(f=>({...f,monto:e.target.value}))} style={{fontFamily:"JetBrains Mono,monospace",fontWeight:700}}/></div>
                  <div className="fld"><label>Tipo</label>
                    <select value={nf.tipo} onChange={e=>setNf(f=>({...f,tipo:e.target.value}))}>
                      <option value="aplicada_factura">Aplicar a factura</option>
                      <option value="devolucion_efectivo">Devolución en efectivo</option>
                    </select>
                  </div>
                  <div className="fld" style={{gridColumn:"1/-1"}}><label>Motivo</label><input value={nf.motivo} onChange={e=>setNf(f=>({...f,motivo:e.target.value}))} placeholder="Devolución de mercancía, descuento especial..."/></div>
                </div>
              </div>
              <div className="modal-ftr"><button className="btn btn-text" onClick={()=>setModal2(null)}>Cancelar</button><button className="btn btn-filled" onClick={crearNC} disabled={!nf.cliente||!nf.monto}>Crear NC</button></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TAB: CxC (Estado de cuenta por cliente)
  // ════════════════════════════════════════════════════════════════════════════
  function TabCxC(){
    const [cliSel,setCliSel]=useState(null);
    const clientes=[...new Set(facturas.map(f=>f.cliente))];
    const factsCliente=cliSel?facturas.filter(f=>f.cliente===cliSel):[];
    const totalCliente=factsCliente.reduce((s,f)=>s+(f.total-f.pagado),0);
    const vencidasCli=factsCliente.filter(f=>f.estado==="Vencida").length;

    return(
      <div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:16,alignItems:"start"}}>
        {/* Sidebar */}
        <div className="card">
          <div className="card-hdr"><div className="card-ttl">Clientes con CxC</div></div>
          <div style={{padding:"8px 0"}}>
            {clientes.map(c=>{
              const cf=facturas.filter(f=>f.cliente===c&&f.estado!=="Pagada"&&f.estado!=="Anulada");
              const balance=cf.reduce((s,f)=>s+(f.total-f.pagado),0);
              const venc=cf.filter(f=>f.estado==="Vencida").length;
              return(
                <div key={c} onClick={()=>setCliSel(c)} style={{padding:"12px 16px",cursor:"pointer",background:cliSel===c?"var(--pri-lt)":"transparent",borderLeft:cliSel===c?"3px solid var(--pri)":"3px solid transparent",transition:"all .15s"}}>
                  <div style={{fontWeight:600,fontSize:13,marginBottom:3}}>{c}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span className="mono" style={{fontSize:12,fontWeight:700,color:venc>0?"var(--err)":"var(--on-sur2)"}}>{fmtRD(balance)}</span>
                    {venc>0&&<span className="chip chip-filled-err" style={{fontSize:10}}>⚠ {venc} venc.</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail */}
        {cliSel?(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div>
                <div style={{fontSize:18,fontWeight:700}}>{cliSel}</div>
                <div style={{fontSize:13,color:"var(--on-sur3)",marginTop:2}}>Estado de cuenta · {factsCliente.length} factura(s)</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div className="mono" style={{fontSize:22,fontWeight:700,color:vencidasCli>0?"var(--err)":"var(--pri)"}}>{fmtRD(Math.max(0,totalCliente))}</div>
                <div style={{fontSize:11,color:"var(--on-sur3)"}}>Balance pendiente</div>
              </div>
            </div>
            {vencidasCli>0&&<div style={{background:"#fce8e6",border:"1px solid #fad2cf",borderRadius:"var(--r-sm)",padding:"10px 16px",marginBottom:12,fontSize:13,color:"var(--err)",fontWeight:600}}>⚠ {vencidasCli} factura(s) vencida(s) — requieren atención inmediata</div>}
            <div className="card"><div className="twrap"><table>
              <thead><tr><th>Factura</th><th>NCF</th><th>Fecha</th><th>Vence</th><th>Total</th><th>Pagado</th><th>Pendiente</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {factsCliente.sort((a,b)=>a.vence?.localeCompare(b.vence||"")||0).map(f=>{
                  const pend=r2(f.total-f.pagado);
                  const late=f.estado==="Vencida"?daysLate(f.vence):0;
                  return(
                    <tr key={f.id}>
                      <td><span className="mono" style={{fontWeight:700,color:"var(--pri)",fontSize:12}}>{f.numero}</span></td>
                      <td className="mono" style={{fontSize:11,color:"var(--on-sur4)"}}>{f.ncf}</td>
                      <td className="mono" style={{fontSize:12}}>{fmtDate(f.fecha)}</td>
                      <td><div className="mono" style={{fontSize:12,color:late>0?"var(--err)":"var(--on-sur3)"}}>{fmtDate(f.vence)}</div>{late>0&&<div style={{fontSize:10,color:"var(--err)",fontWeight:600}}>{late}d</div>}</td>
                      <td className="mono" style={{fontWeight:600}}>{fmtRD(f.total)}</td>
                      <td className="mono" style={{color:"var(--sec)"}}>{fmtRD(f.pagado)}</td>
                      <td><span className="mono" style={{fontWeight:700,color:pend>0?"var(--err)":"var(--sec)"}}>{pend>0?fmtRD(pend):"✓"}</span></td>
                      <td><span className={`chip ${EST[f.estado]||"chip"}`} style={{fontSize:11}}>{f.estado}</span></td>
                      <td><button className="btn-sm-ghost" onClick={()=>{setSel(f);setView("detail");setTab("facturas");}}>Ver →</button></td>
                    </tr>
                  );
                })}
                <tr style={{background:"var(--sur2)"}}>
                  <td colSpan={6} style={{fontWeight:700,textAlign:"right",padding:"10px 16px"}}>Balance total pendiente</td>
                  <td colSpan={3}><span className="mono" style={{fontWeight:700,fontSize:15,color:totalCliente>0?"var(--err)":"var(--sec)"}}>{fmtRD(Math.max(0,totalCliente))}</span></td>
                </tr>
              </tbody>
            </table></div></div>
          </div>
        ):(
          <div style={{textAlign:"center",padding:"64px 24px",color:"var(--on-sur4)"}}>
            <div style={{fontSize:40,marginBottom:12}}>👤</div>
            <div style={{fontWeight:600}}>Selecciona un cliente</div>
            <div style={{fontSize:13,marginTop:4}}>para ver su estado de cuenta</div>
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TAB: DÉBITOS
  // ════════════════════════════════════════════════════════════════════════════
  function TabDebitos(){
    const [modal2,setModal2]=useState(null);
    const [df,setDf]=useState({fecha:today(),cliente:"",factura_ref:"",monto:"",motivo:""});
    function crearND(){
      if(!df.cliente||!df.monto)return;
      const nd={id:Date.now(),numero:`ND-${String(debitos.length+1).padStart(3,"0")}`,fecha:df.fecha,cliente:df.cliente,factura_ref:df.factura_ref,monto:parseFloat(df.monto),motivo:df.motivo,estado:"Pendiente"};
      setDeb(ds=>[nd,...ds]);setModal2(null);showToast("Nota de débito creada ✓");
    }
    return(
      <div>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}><button className="btn btn-filled" onClick={()=>setModal2("new")}>＋ Nueva Nota de Débito</button></div>
        <div className="card"><div className="twrap"><table>
          <thead><tr><th>Número</th><th>Fecha</th><th>Cliente</th><th>Factura ref.</th><th>Monto</th><th>Motivo</th><th>Estado</th></tr></thead>
          <tbody>
            {debitos.length===0&&<tr><td colSpan={7} style={{textAlign:"center",padding:48,color:"var(--on-sur4)"}}>Sin notas de débito</td></tr>}
            {debitos.map(d=>(
              <tr key={d.id}>
                <td><span className="mono" style={{fontWeight:700,color:"var(--pri)",fontSize:12}}>{d.numero}</span></td>
                <td className="mono" style={{fontSize:12}}>{fmtDate(d.fecha)}</td>
                <td style={{fontWeight:500}}>{d.cliente}</td>
                <td><span className="chip" style={{fontSize:11}}>{d.factura_ref||"—"}</span></td>
                <td><span className="mono" style={{fontWeight:700,color:"var(--warn)"}}>{fmtRD(d.monto)}</span></td>
                <td style={{fontSize:12,color:"var(--on-sur3)"}}>{d.motivo}</td>
                <td><span className={`chip ${d.estado==="Pagada"?"chip-filled-sec":"chip-filled-warn"}`} style={{fontSize:11}}>{d.estado}</span></td>
              </tr>
            ))}
          </tbody>
        </table></div></div>
        {modal2==="new"&&(
          <div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setModal2(null);}}>
            <div className="modal" style={{maxWidth:480}}>
              <div className="modal-hdr"><div className="modal-ttl">Nueva Nota de Débito</div><button className="icon-btn" onClick={()=>setModal2(null)}>✕</button></div>
              <div className="modal-bdy">
                <div className="fgrid f2" style={{gap:13}}>
                  <div className="fld"><label>Fecha</label><input type="date" value={df.fecha} onChange={e=>setDf(f=>({...f,fecha:e.target.value}))}/></div>
                  <div className="fld"><label>Cliente *</label><input value={df.cliente} onChange={e=>setDf(f=>({...f,cliente:e.target.value}))} autoFocus/></div>
                  <div className="fld"><label>Factura relacionada</label><input value={df.factura_ref} onChange={e=>setDf(f=>({...f,factura_ref:e.target.value}))} placeholder="FAC-001"/></div>
                  <div className="fld"><label>Monto *</label><input type="number" value={df.monto} onChange={e=>setDf(f=>({...f,monto:e.target.value}))} style={{fontFamily:"JetBrains Mono,monospace",fontWeight:700}}/></div>
                  <div className="fld" style={{gridColumn:"1/-1"}}><label>Motivo</label><input value={df.motivo} onChange={e=>setDf(f=>({...f,motivo:e.target.value}))} placeholder="Cargo por mora, intereses..."/></div>
                </div>
              </div>
              <div className="modal-ftr"><button className="btn btn-text" onClick={()=>setModal2(null)}>Cancelar</button><button className="btn btn-filled" onClick={crearND} disabled={!df.cliente||!df.monto}>Crear ND</button></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  const TABS=[
    {id:"facturas",  label:"🧾 Facturas",       count:facturas.filter(f=>f.estado==="Pendiente"||f.estado==="Parcial").length||null, alert:totalVenc>0},
    {id:"recibos",   label:"💰 Recibos"},
    {id:"nc",        label:"📝 Notas de Crédito"},
    {id:"cxc",       label:"💸 CxC"},
    {id:"debitos",   label:"⬆ Débitos"},
  ];

  const showStats = !(tab==="facturas"&&(view==="form"||view==="detail"));

  return(
    <div>
      {showStats&&(
        <div className="stats-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
          {[
            {l:"Por cobrar",    n:fmtRD(totalPend),  i:"💸", bg:"#fef7e0"},
            {l:"Vencidas",      n:totalVenc,          i:"⚠️",  bg:totalVenc>0?"#fce8e6":"var(--sec-lt)"},
            {l:"Parciales",     n:totalParcial,       i:"⏳", bg:totalParcial>0?"var(--pri-lt)":"var(--sec-lt)"},
            {l:"Cobrado (mes)", n:fmtRD(totalCobMes),i:"✅", bg:"var(--sec-lt)"},
          ].map(s=>(
            <div key={s.l} className="stat-card">
              <div className="stat-icon-wrap" style={{background:s.bg}}>{s.i}</div>
              <div className="stat-num" style={{fontSize:typeof s.n==="string"?16:28}}>{s.n}</div>
              <div className="stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>
      )}

      {showStats&&(
        <div className="seg-tabs" style={{marginBottom:20}}>
          {TABS.map(t=>(
            <button key={t.id} className={"seg-tab"+(tab===t.id?" on":"")} onClick={()=>{setTab(t.id);goList();}}>
              {t.label}
              {t.count>0&&<span style={{marginLeft:6,background:t.alert?"var(--err)":"var(--pri)",color:"#fff",borderRadius:12,fontSize:10,fontWeight:700,padding:"1px 6px",verticalAlign:"middle"}}>{t.count}</span>}
            </button>
          ))}
        </div>
      )}

      {tab==="facturas" && <TabFacturas/>}
      {tab==="recibos"  && <TabRecibos/>}
      {tab==="nc"       && <TabNC/>}
      {tab==="cxc"      && <TabCxC/>}
      {tab==="debitos"  && <TabDebitos/>}

      {toast&&<div className="toast-msg">{toast}</div>}
      {enviarModal&&<ModalEnviar data={{ tipo:enviarModal.tipoEnv||"factura", numero:enviarModal.numero, cliente:enviarModal.cliente, tel:(enviarModal.tel||"").replace(/\D/g,""), email:"", monto:`RD$${Math.round(enviarModal.total).toLocaleString("es-DO")}`, vence:enviarModal.vence?new Date(enviarModal.vence+"T12:00:00").toLocaleDateString("es-DO",{day:"2-digit",month:"short",year:"numeric"}):"", empresa:"Ventaneros SRL", telEmpresa:"8095550001" }} onClose={()=>setEnviarModal(null)}/>}
    </div>
  );
}
