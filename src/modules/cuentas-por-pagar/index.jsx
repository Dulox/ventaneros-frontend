/**
 * COMPRAS Y CUENTAS POR PAGAR
 * 4 tabs en 1 módulo:
 *  1. Proveedores  — CRUD
 *  2. Órdenes      — crear OC, estados, enviar
 *  3. Recibo       — recibir mercancía contra OC
 *  4. CxP          — facturas pendientes + pagar
 */
import { useState } from "react";

function fmtRD(n)   { return `RD$${Math.round(n||0).toLocaleString("es-DO")}`; }
function today()    { return new Date().toISOString().slice(0,10); }
function fmtDate(d) { return d ? new Date(d+"T12:00:00").toLocaleDateString("es-DO",{day:"2-digit",month:"short",year:"numeric"}) : "—"; }
function daysLeft(d){ return d ? Math.ceil((new Date(d)-new Date())/86400000) : null; }
function r2(n)      { return Math.round((n||0)*100)/100; }
const TIPOS_PAGO=["30 días","15 días","Contado","60 días","90 días"];
const TIPO_GASTO=["Materia Prima","Herrajes","Vidrios","Servicios","Gastos Generales","Equipos","Otros"];
const MONEDAS=["RD$","US$"];

const DEMO_PROVS=[
  {id:1,codigo:"PRV-001",nombre:"Aluminio del Caribe SRL",contacto:"Jorge Santos",rnc:"101-11111-1",tel:"809-555-2233",email:"jorge@alcaribe.do",ciudad:"Sto. Domingo",tipo:"Local",terminos:"30 días",producto:"Perfiles de Aluminio",estado:"Activo",balance:145000},
  {id:2,codigo:"PRV-002",nombre:"Vidriera Nacional",contacto:"Patricia Cruz",rnc:"102-22222-2",tel:"829-555-4455",email:"pcruz@vidnac.do",ciudad:"Santiago",tipo:"Local",terminos:"15 días",producto:"Vidrios y Cristales",estado:"Activo",balance:62000},
  {id:3,codigo:"PRV-003",nombre:"Herrajes RD Import",contacto:"Manuel Reyes",rnc:"103-33333-3",tel:"849-555-6677",email:"mreyes@herrajes.do",ciudad:"Sto. Domingo",tipo:"Local",terminos:"Contado",producto:"Herrajes",estado:"Activo",balance:0},
  {id:4,codigo:"PRV-004",nombre:"Global Aluminum Corp",contacto:"Sarah Johnson",rnc:"",tel:"+1-305-555-001",email:"sjohnson@gac.com",ciudad:"Miami, FL",tipo:"Import.",terminos:"60 días",producto:"Perfiles importados",estado:"Activo",balance:320000},
];
const DEMO_OC=[
  {id:1,numero:"OC-001",proveedor_id:1,proveedor:"Aluminio del Caribe SRL",fecha:"2025-06-01",entrega:"2025-06-10",moneda:"RD$",estado:"Recibida",items:[{id:11,desc:"Perfil GK-40 Natural 21 pies",cant:50,costo:1200,total:60000},{id:12,desc:"Perfil GK-44 Natural 21 pies",cant:30,costo:950,total:28500}],subtotal:88500,recibido:true,factura_sup:"FS-2025-0041",notas:""},
  {id:2,numero:"OC-002",proveedor_id:2,proveedor:"Vidriera Nacional",fecha:"2025-06-03",entrega:"2025-06-08",moneda:"RD$",estado:"Enviada",items:[{id:21,desc:"Vidrio Liso 3/16 Natural (4×8)",cant:20,costo:3100,total:62000}],subtotal:62000,recibido:false,factura_sup:"",notas:"Solicitar certificado de calidad"},
  {id:3,numero:"OC-003",proveedor_id:3,proveedor:"Herrajes RD Import",fecha:"2025-06-05",entrega:"2025-06-07",moneda:"RD$",estado:"Enviada",items:[{id:31,desc:"Ruedas GK 4 patas (bolsa 10)",cant:100,costo:180,total:18000},{id:32,desc:"Guías plásticas (bolsa 50)",cant:50,costo:95,total:4750}],subtotal:22750,recibido:false,factura_sup:"",notas:""},
];
const DEMO_CXP=[
  {id:1,numero:"CXP-001",oc:"OC-001",proveedor:"Aluminio del Caribe SRL",factura_sup:"FS-2025-0041",fecha:"2025-06-10",vence:"2025-07-10",moneda:"RD$",subtotal:88500,itbis:15930,total:104430,pagado:0,tipo_gasto:"Materia Prima",estado:"Pendiente",pagos:[]},
  {id:2,numero:"CXP-002",oc:"—",proveedor:"Global Aluminum Corp",factura_sup:"INV-20250-88",fecha:"2025-05-20",vence:"2025-07-20",moneda:"US$",subtotal:5800,itbis:0,total:5800,pagado:2000,tipo_gasto:"Materia Prima",estado:"Parcial",pagos:[{fecha:"2025-06-01",monto:2000,moneda:"US$",ref:"TRF-001"}]},
  {id:3,numero:"CXP-003",oc:"—",proveedor:"Vidriera Nacional",factura_sup:"VN-0923",fecha:"2025-05-15",vence:"2025-05-30",moneda:"RD$",subtotal:45000,itbis:8100,total:53100,pagado:53100,tipo_gasto:"Materia Prima",estado:"Pagada",pagos:[{fecha:"2025-05-28",monto:53100,moneda:"RD$",ref:"CHQ-045"}]},
];
const EST_OC={Borrador:{cls:"chip",next:["Enviada","Cancelada"]},Enviada:{cls:"chip-filled-warn",next:["Recibida","Cancelada"]},Recibida:{cls:"chip-filled-sec",next:[]},Cancelada:{cls:"chip-filled-err",next:[]}};
const EST_CXP={Pendiente:{cls:"chip-filled-warn"},Parcial:{cls:"chip-filled-pri"},Pagada:{cls:"chip-filled-sec"},Vencida:{cls:"chip-filled-err"}};

function newItem(){return{id:Date.now()+Math.random(),desc:"",cant:1,costo:0,total:0};}

export default function Compras() {
  const [tab,setTab]=useState("proveedores");
  const [provs,setProvs]=useState(DEMO_PROVS);
  const [ordenes,setOrdenes]=useState(DEMO_OC);
  const [cxp,setCxp]=useState(DEMO_CXP);
  const [modal,setModal]=useState(null);
  const [sel,setSel]=useState(null);
  const [form,setForm]=useState({});
  const [toast,setToast]=useState("");
  function showToast(msg){setToast(msg);setTimeout(()=>setToast(""),2600);}
  const sf=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  const totalCxP=cxp.filter(c=>c.estado!=="Pagada").reduce((s,c)=>s+(c.total-c.pagado),0);
  const vencidas=cxp.filter(c=>c.estado!=="Pagada"&&c.vence<today()).length;
  const ocAbiertas=ordenes.filter(o=>o.estado==="Enviada"||o.estado==="Pendiente").length;

  // ── PROVEEDORES ──────────────────────────────────────────────────────────
  function TabProveedores(){
    const [q,setQ]=useState("");
    const filtered=provs.filter(p=>p.nombre.toLowerCase().includes(q.toLowerCase())||p.contacto.toLowerCase().includes(q.toLowerCase()));
    function openNew(){setForm({codigo:`PRV-${String(provs.length+1).padStart(3,"0")}`,nombre:"",contacto:"",rnc:"",tel:"",email:"",ciudad:"",tipo:"Local",terminos:"30 días",producto:"",estado:"Activo",balance:0});setSel(null);setModal("prov");}
    function openEdit(p){setForm({...p});setSel(p);setModal("prov");}
    function save(){
      if(!form.nombre?.trim())return;
      if(sel){setProvs(ps=>ps.map(p=>p.id===sel.id?{...p,...form}:p));}
      else{setProvs(ps=>[...ps,{...form,id:Date.now()}]);}
      setModal(null);setSel(null);showToast("Proveedor guardado ✓");
    }
    return(
      <div>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}>
          <div className="sbar"><span style={{color:"var(--on-sur4)"}}>🔍</span><input placeholder="Buscar proveedor..." value={q} onChange={e=>setQ(e.target.value)}/></div>
          <button className="btn btn-filled" onClick={openNew}>＋ Nuevo Proveedor</button>
        </div>
        <div className="card"><div className="twrap"><table>
          <thead><tr><th>Código</th><th>Proveedor</th><th>Contacto</th><th>Producto</th><th>Términos</th><th>Balance CxP</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {filtered.length===0&&<tr><td colSpan={8} style={{textAlign:"center",padding:48,color:"var(--on-sur4)"}}>Sin proveedores</td></tr>}
            {filtered.map(p=>(
              <tr key={p.id}>
                <td><span className="mono" style={{fontSize:11,color:"var(--on-sur3)"}}>{p.codigo}</span></td>
                <td><div style={{fontWeight:600}}>{p.nombre}</div><div style={{fontSize:11,color:"var(--on-sur3)"}}>{p.ciudad} · {p.tipo}</div></td>
                <td><div style={{fontSize:13}}>{p.contacto}</div><div style={{fontSize:11,color:"var(--on-sur3)"}}>{p.tel}</div></td>
                <td style={{fontSize:13,color:"var(--on-sur2)"}}>{p.producto}</td>
                <td><span className="chip" style={{fontSize:11}}>{p.terminos}</span></td>
                <td><span className="mono" style={{fontWeight:600,color:p.balance>0?"var(--warn)":"var(--sec)"}}>{fmtRD(p.balance)}</span></td>
                <td><span className={`chip ${p.estado==="Activo"?"chip-filled-sec":"chip-filled-err"}`} style={{fontSize:11}}>{p.estado}</span></td>
                <td><button className="btn-sm-ghost" onClick={()=>openEdit(p)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table></div></div>
        {modal==="prov"&&(
          <div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget){setModal(null);setSel(null);}}}>
            <div className="modal" style={{maxWidth:560}}>
              <div className="modal-hdr"><div className="modal-ttl">{sel?"Editar proveedor":"Nuevo proveedor"}</div><button className="icon-btn" onClick={()=>{setModal(null);setSel(null);}}>✕</button></div>
              <div className="modal-bdy">
                <div className="fgrid f2" style={{gap:13}}>
                  <div className="fld"><label>Código</label><input value={form.codigo||""} onChange={sf("codigo")}/></div>
                  <div className="fld"><label>Tipo</label><select value={form.tipo||"Local"} onChange={sf("tipo")}><option>Local</option><option>Import.</option><option>Informal</option></select></div>
                  <div className="fld" style={{gridColumn:"1/-1"}}><label>Nombre *</label><input value={form.nombre||""} onChange={sf("nombre")} placeholder="Empresa SRL" autoFocus/></div>
                  <div className="fld"><label>Contacto</label><input value={form.contacto||""} onChange={sf("contacto")}/></div>
                  <div className="fld"><label>RNC</label><input value={form.rnc||""} onChange={sf("rnc")}/></div>
                  <div className="fld"><label>Teléfono</label><input value={form.tel||""} onChange={sf("tel")}/></div>
                  <div className="fld"><label>Email</label><input value={form.email||""} onChange={sf("email")}/></div>
                  <div className="fld"><label>Ciudad</label><input value={form.ciudad||""} onChange={sf("ciudad")}/></div>
                  <div className="fld"><label>Términos de pago</label><select value={form.terminos||"30 días"} onChange={sf("terminos")}>{TIPOS_PAGO.map(t=><option key={t}>{t}</option>)}</select></div>
                  <div className="fld" style={{gridColumn:"1/-1"}}><label>Producto principal</label><input value={form.producto||""} onChange={sf("producto")}/></div>
                </div>
              </div>
              <div className="modal-ftr"><button className="btn btn-text" onClick={()=>{setModal(null);setSel(null);}}>Cancelar</button><button className="btn btn-filled" onClick={save} disabled={!form.nombre?.trim()}>Guardar</button></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── ÓRDENES DE COMPRA ────────────────────────────────────────────────────
  function TabOrdenes(){
    const [q,setQ]=useState("");
    const [v,setV]=useState("list");
    const [ocF,setOcF]=useState(null);
    const [ocS,setOcS]=useState(null);
    const sof=k=>e=>setOcF(f=>({...f,[k]:e.target.value}));
    const filtered=ordenes.filter(o=>o.proveedor.toLowerCase().includes(q.toLowerCase())||o.numero.toLowerCase().includes(q.toLowerCase()));
    function calcSub(f){return r2((f.items||[]).reduce((s,i)=>s+(parseFloat(i.total)||0),0));}
    function updateOcItem(id,k,val){setOcF(f=>({...f,items:f.items.map(it=>{if(it.id!==id)return it;const u={...it,[k]:val};if(k==="cant"||k==="costo")u.total=r2((parseFloat(u.cant)||0)*(parseFloat(u.costo)||0));return u;})}))}
    function saveOC(){
      const sub=calcSub(ocF);const oc={...ocF,subtotal:sub};
      if(ocS){setOrdenes(os=>os.map(o=>o.id===ocS.id?oc:o));setOcS(oc);setV("detail");}
      else{const n={...oc,id:Date.now()};setOrdenes(os=>[...os,n]);setOcS(n);setV("detail");}
      showToast("Orden guardada ✓");
    }
    function cambiarEst(id,est){
      setOrdenes(os=>os.map(o=>o.id===id?{...o,estado:est}:o));
      setOcS(s=>({...s,estado:est}));showToast(`Estado → ${est}`);
    }

    if(v==="list")return(
      <div>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}>
          <div className="sbar"><span style={{color:"var(--on-sur4)"}}>🔍</span><input placeholder="Buscar OC o proveedor..." value={q} onChange={e=>setQ(e.target.value)}/></div>
          <button className="btn btn-filled" onClick={()=>{setOcF({numero:`OC-${String(ordenes.length+1).padStart(3,"0")}`,proveedor_id:provs[0]?.id||"",proveedor:provs[0]?.nombre||"",fecha:today(),entrega:"",moneda:"RD$",estado:"Borrador",items:[newItem()],subtotal:0,recibido:false,factura_sup:"",notas:""});setOcS(null);setV("form");}}>＋ Nueva OC</button>
        </div>
        <div className="card"><div className="twrap"><table>
          <thead><tr><th>Número</th><th>Proveedor</th><th>Fecha</th><th>Entrega</th><th>Total</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {filtered.length===0&&<tr><td colSpan={7} style={{textAlign:"center",padding:48,color:"var(--on-sur4)"}}>Sin órdenes</td></tr>}
            {filtered.map(o=>{const ec=EST_OC[o.estado]||EST_OC.Borrador;return(
              <tr key={o.id} style={{cursor:"pointer"}} onClick={()=>{setOcS(o);setV("detail");}}>
                <td><span className="mono" style={{fontWeight:700,color:"var(--pri)"}}>{o.numero}</span></td>
                <td style={{fontWeight:500}}>{o.proveedor}</td>
                <td className="mono" style={{fontSize:12}}>{fmtDate(o.fecha)}</td>
                <td className="mono" style={{fontSize:12,color:o.entrega<today()&&o.estado!=="Recibida"?"var(--err)":"var(--on-sur3)"}}>{fmtDate(o.entrega)}</td>
                <td><span className="mono" style={{fontWeight:600}}>{fmtRD(o.subtotal)}</span></td>
                <td><span className={`chip ${ec.cls}`}>{o.estado}</span></td>
                <td onClick={e=>e.stopPropagation()}><button className="btn-sm-ghost" onClick={()=>{setOcF({...o,items:o.items.map(i=>({...i}))});setOcS(o);setV("form");}}>✏️</button></td>
              </tr>
            );})}
          </tbody>
        </table></div></div>
      </div>
    );

    if(v==="form"&&ocF){
      const sub=calcSub(ocF);
      return(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            <button className="btn btn-text" onClick={()=>setV("list")}>← Órdenes</button>
            <div style={{fontSize:18,fontWeight:700}}>{ocS?`Editar ${ocF.numero}`:"Nueva Orden de Compra"}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:20,alignItems:"start"}}>
            <div>
              <div className="card" style={{marginBottom:14}}>
                <div className="card-hdr"><div className="card-ttl">Datos</div></div>
                <div className="card-bdy">
                  <div className="fgrid f2" style={{gap:13}}>
                    <div className="fld"><label>Proveedor *</label>
                      <select value={ocF.proveedor_id} onChange={e=>{const p=provs.find(p=>p.id===parseInt(e.target.value));setOcF(f=>({...f,proveedor_id:p?.id||"",proveedor:p?.nombre||""}));}}>
                        {provs.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
                      </select>
                    </div>
                    <div className="fld"><label>Moneda</label><select value={ocF.moneda} onChange={sof("moneda")}>{MONEDAS.map(m=><option key={m}>{m}</option>)}</select></div>
                    <div className="fld"><label>Fecha</label><input type="date" value={ocF.fecha} onChange={sof("fecha")}/></div>
                    <div className="fld"><label>Entrega</label><input type="date" value={ocF.entrega} onChange={sof("entrega")}/></div>
                    <div className="fld" style={{gridColumn:"1/-1"}}><label>Notas</label><textarea value={ocF.notas} onChange={sof("notas")} style={{background:"var(--sur2)",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",padding:"8px 12px",fontFamily:"inherit",fontSize:13,color:"var(--on-sur)",outline:"none",width:"100%",resize:"vertical",minHeight:56}}/></div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-hdr"><div className="card-ttl">Artículos</div><button className="btn btn-sm btn-outlined" onClick={()=>setOcF(f=>({...f,items:[...f.items,newItem()]}))}>＋ Agregar</button></div>
                <div className="card-bdy" style={{padding:0}}>
                  {ocF.items.map((it,i)=>(
                    <div key={it.id} style={{display:"grid",gridTemplateColumns:"1fr 72px 100px 100px 32px",gap:10,padding:"14px 20px",borderBottom:i<ocF.items.length-1?"1px solid var(--out)":"none",alignItems:"end"}}>
                      <div className="fld"><label>{i===0?"Descripción":""}</label><input value={it.desc} onChange={e=>updateOcItem(it.id,"desc",e.target.value)}/></div>
                      <div className="fld"><label>{i===0?"Cant.":""}</label><input type="number" min="1" value={it.cant} onChange={e=>updateOcItem(it.id,"cant",e.target.value)}/></div>
                      <div className="fld"><label>{i===0?"Costo unit.":""}</label><input type="number" min="0" value={it.costo} onChange={e=>updateOcItem(it.id,"costo",e.target.value)}/></div>
                      <div className="fld"><label>{i===0?"Total":""}</label><div style={{background:"var(--sur2)",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",padding:"8px 10px",fontFamily:"JetBrains Mono,monospace",fontSize:13,color:"var(--sec)",fontWeight:600}}>{fmtRD(it.total)}</div></div>
                      {ocF.items.length>1&&<button style={{background:"none",border:"none",cursor:"pointer",color:"var(--err)",fontSize:18,marginBottom:2}} onClick={()=>setOcF(f=>({...f,items:f.items.filter(x=>x.id!==it.id)}))}>🗑</button>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{position:"sticky",top:80}}>
              <div className="card" style={{marginBottom:12}}>
                <div className="card-bdy">
                  <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--out)",fontSize:13}}><span style={{color:"var(--on-sur3)"}}>Artículos</span><span className="mono" style={{fontWeight:600}}>{ocF.items.length}</span></div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontSize:17,fontWeight:700}}><span>Total</span><span className="mono" style={{color:"var(--pri)"}}>{fmtRD(sub)}</span></div>
                </div>
              </div>
              <button className="btn btn-filled" style={{width:"100%",marginBottom:8}} onClick={saveOC}>{ocS?"Guardar cambios":"Crear Orden"}</button>
              <button className="btn btn-text" style={{width:"100%"}} onClick={()=>setV("list")}>Cancelar</button>
            </div>
          </div>
        </div>
      );
    }

    if(v==="detail"&&ocS){
      const oc=ordenes.find(o=>o.id===ocS.id)||ocS;
      const ec=EST_OC[oc.estado]||EST_OC.Borrador;
      return(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            <button className="btn btn-text" onClick={()=>setV("list")}>← Órdenes</button>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:20,fontWeight:700}}>{oc.numero}</span><span className={`chip ${ec.cls}`}>{oc.estado}</span>{oc.recibido&&<span className="chip chip-filled-sec">✓ Recibida</span>}</div>
              <div style={{fontSize:13,color:"var(--on-sur3)",marginTop:2}}>{oc.proveedor} · {fmtDate(oc.fecha)}</div>
            </div>
            <button className="btn btn-outlined" onClick={()=>{setOcF({...oc,items:oc.items.map(i=>({...i}))});setOcS(oc);setV("form");}}>✏️ Editar</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:20}}>
            <div className="card"><div className="twrap"><table>
              <thead><tr><th>Descripción</th><th>Cant.</th><th>Costo</th><th>Total</th></tr></thead>
              <tbody>{oc.items.map((it,i)=>(
                <tr key={i}><td style={{fontWeight:500}}>{it.desc}</td><td className="mono" style={{textAlign:"center"}}>{it.cant}</td><td className="mono">{fmtRD(it.costo)}</td><td><span className="mono" style={{fontWeight:700,color:"var(--pri)"}}>{fmtRD(it.total)}</span></td></tr>
              ))}</tbody>
            </table></div></div>
            <div>
              <div className="card" style={{marginBottom:12}}>
                <div className="card-bdy">
                  {[["Proveedor",oc.proveedor],["Fecha",fmtDate(oc.fecha)],["Entrega",fmtDate(oc.entrega)],["Moneda",oc.moneda]].map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--out)",fontSize:13}}><span style={{color:"var(--on-sur3)"}}>{l}</span><span style={{fontWeight:500}}>{v}</span></div>
                  ))}
                  <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontSize:17,fontWeight:700}}><span>TOTAL</span><span className="mono" style={{color:"var(--pri)"}}>{fmtRD(oc.subtotal)}</span></div>
                </div>
              </div>
              {ec.next.length>0&&(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {ec.next.map(nx=>(
                    <button key={nx} className="btn btn-filled" style={{background:nx==="Recibida"?"var(--sec)":nx==="Enviada"?"var(--pri)":"var(--err)"}} onClick={()=>cambiarEst(oc.id,nx)}>
                      {nx==="Enviada"&&"📤 Marcar como Enviada"}{nx==="Recibida"&&"✅ Confirmar Recepción"}{nx==="Cancelada"&&"❌ Cancelar"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  // ── RECIBO ───────────────────────────────────────────────────────────────
  function TabRecibo(){
    const [step,setStep]=useState(1);
    const [rf,setRf]=useState({oc_id:"",proveedor:"",factura_sup:"",ncf:"",fecha:today(),vence_dias:30,moneda:"RD$",tipo_gasto:"Materia Prima",itbis_pct:18,items:[],aplicar_itbis:true});
    const rfSet=k=>e=>setRf(f=>({...f,[k]:e.target.value}));
    const pendOC=ordenes.filter(o=>o.estado==="Enviada"&&!o.recibido);

    function selectOC(oc){
      const prov=provs.find(p=>p.id===oc.proveedor_id);
      setRf(f=>({...f,oc_id:oc.id,oc_numero:oc.numero,proveedor:oc.proveedor,proveedor_id:oc.proveedor_id,moneda:oc.moneda,vence_dias:prov?.terminos==="Contado"?0:parseInt(prov?.terminos)||30,items:oc.items.map(it=>({...it,costo_nuevo:it.costo}))}));
      setStep(2);
    }
    function updateRI(id,k,v){setRf(f=>({...f,items:f.items.map(it=>{if(it.id!==id)return it;const u={...it,[k]:v};if(k==="costo_nuevo")u.total=r2((parseFloat(u.cant)||0)*(parseFloat(v)||0));return u;})}))}

    const sub=rf.items.reduce((s,it)=>s+r2((parseFloat(it.cant)||0)*(parseFloat(it.costo_nuevo??it.costo)||0)),0);
    const itb=rf.aplicar_itbis?r2(sub*(parseFloat(rf.itbis_pct)||0)/100):0;
    const tot=r2(sub+itb);

    function liquidar(){
      if(!rf.factura_sup)return;
      const vence=new Date();vence.setDate(vence.getDate()+parseInt(rf.vence_dias||0));
      setCxp(cs=>[{id:Date.now(),numero:`CXP-${String(cs.length+1).padStart(3,"0")}`,oc:rf.oc_numero||"—",proveedor:rf.proveedor,factura_sup:rf.factura_sup,fecha:today(),vence:vence.toISOString().slice(0,10),moneda:rf.moneda,subtotal:sub,itbis:itb,total:tot,pagado:0,tipo_gasto:rf.tipo_gasto,estado:"Pendiente",pagos:[]},...cs]);
      if(rf.oc_id)setOrdenes(os=>os.map(o=>o.id===rf.oc_id?{...o,estado:"Recibida",recibido:true,factura_sup:rf.factura_sup}:o));
      showToast("Mercancía recibida · CxP creada ✓");
      setStep(1);
      setRf({oc_id:"",proveedor:"",factura_sup:"",ncf:"",fecha:today(),vence_dias:30,moneda:"RD$",tipo_gasto:"Materia Prima",itbis_pct:18,items:[],aplicar_itbis:true});
    }

    if(step===1)return(
      <div>
        <div style={{background:"var(--pri-lt)",border:"1px solid var(--pri-lt2)",borderRadius:"var(--r-sm)",padding:"12px 16px",marginBottom:16,fontSize:13,color:"var(--pri-dk)"}}>
          Selecciona una OC enviada para registrar la recepción. Se creará automáticamente la Cuenta por Pagar.
        </div>
        {pendOC.length===0?(
          <div style={{textAlign:"center",padding:48,color:"var(--on-sur4)"}}>
            <div style={{fontSize:40,marginBottom:10}}>📦</div>
            <div style={{fontWeight:600,marginBottom:4}}>Sin órdenes pendientes de recibo</div>
            <div style={{fontSize:13}}>Crea y envía una Orden de Compra primero</div>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
            {pendOC.map(o=>(
              <div key={o.id} className="card" style={{cursor:"pointer"}} onClick={()=>selectOC(o)}>
                <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:16}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:4}}><span className="mono" style={{fontWeight:700,color:"var(--pri)"}}>{o.numero}</span><span className="chip chip-filled-warn" style={{fontSize:11}}>Enviada</span></div>
                    <div style={{fontWeight:600,fontSize:15}}>{o.proveedor}</div>
                    <div style={{fontSize:12,color:"var(--on-sur3)",marginTop:2}}>Entrega: {fmtDate(o.entrega)} · {o.items.length} artículo(s)</div>
                  </div>
                  <div style={{textAlign:"right"}}><div className="mono" style={{fontWeight:700,fontSize:16,color:"var(--pri)"}}>{fmtRD(o.subtotal)}</div><div style={{fontSize:11,color:"var(--on-sur3)",marginTop:2}}>Recibir →</div></div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{textAlign:"center"}}><button className="btn btn-outlined" onClick={()=>{setRf(f=>({...f,items:[newItem()]}));setStep(2);}}>+ Recibo sin Orden de Compra</button></div>
      </div>
    );

    return(
      <div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <button className="btn btn-text" onClick={()=>setStep(1)}>← Seleccionar OC</button>
          <div style={{fontSize:18,fontWeight:700}}>Recibo de Mercancía {rf.oc_numero?`— ${rf.oc_numero}`:""}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:20,alignItems:"start"}}>
          <div>
            <div className="card" style={{marginBottom:14}}>
              <div className="card-hdr"><div className="card-ttl">Datos de la Factura del Suplidor</div></div>
              <div className="card-bdy">
                <div className="fgrid f2" style={{gap:13}}>
                  <div className="fld" style={{gridColumn:"1/-1"}}><label>Proveedor</label><input value={rf.proveedor} onChange={rfSet("proveedor")}/></div>
                  <div className="fld"><label>No. Factura Suplidor *</label><input value={rf.factura_sup} onChange={rfSet("factura_sup")} placeholder="FS-2025-0001" autoFocus/></div>
                  <div className="fld"><label>NCF</label><input value={rf.ncf} onChange={rfSet("ncf")} placeholder="B01-00000001"/></div>
                  <div className="fld"><label>Fecha recibo</label><input type="date" value={rf.fecha} onChange={rfSet("fecha")}/></div>
                  <div className="fld"><label>Vence en (días)</label><input type="number" min="0" value={rf.vence_dias} onChange={rfSet("vence_dias")}/></div>
                  <div className="fld"><label>Moneda</label><select value={rf.moneda} onChange={rfSet("moneda")}>{MONEDAS.map(m=><option key={m}>{m}</option>)}</select></div>
                  <div className="fld"><label>Tipo de gasto</label><select value={rf.tipo_gasto} onChange={rfSet("tipo_gasto")}>{TIPO_GASTO.map(t=><option key={t}>{t}</option>)}</select></div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-hdr"><div className="card-ttl">Artículos</div><button className="btn btn-sm btn-outlined" onClick={()=>setRf(f=>({...f,items:[...f.items,newItem()]}))}>＋</button></div>
              <div className="twrap"><table>
                <thead><tr><th>Descripción</th><th>Cant.</th><th>Costo OC</th><th>Costo real</th><th>Dif.</th><th>Total</th></tr></thead>
                <tbody>{rf.items.map(it=>{
                  const costoReal=parseFloat(it.costo_nuevo??it.costo)||0;
                  const costoOC=parseFloat(it.costo)||0;
                  const dif=r2(costoReal-costoOC);
                  const realTotal=r2((parseFloat(it.cant)||0)*costoReal);
                  return(
                    <tr key={it.id}>
                      <td><input value={it.desc} onChange={e=>updateRI(it.id,"desc",e.target.value)} style={{width:"100%",border:"none",background:"transparent",fontFamily:"inherit",fontSize:13,outline:"none",color:"var(--on-sur)"}}/></td>
                      <td><input type="number" min="1" value={it.cant} onChange={e=>updateRI(it.id,"cant",e.target.value)} style={{width:56,border:"1px solid var(--out)",borderRadius:6,padding:"4px 6px",fontFamily:"inherit",fontSize:12,background:"var(--sur)",color:"var(--on-sur)",outline:"none",textAlign:"center"}}/></td>
                      <td className="mono" style={{fontSize:12,color:"var(--on-sur3)"}}>{fmtRD(costoOC)}</td>
                      <td><input type="number" min="0" value={it.costo_nuevo??it.costo} onChange={e=>updateRI(it.id,"costo_nuevo",e.target.value)} style={{width:88,border:`1.5px solid ${dif!==0?(dif>0?"var(--err)":"var(--sec)"):"var(--out)"}`,borderRadius:6,padding:"4px 8px",fontFamily:"JetBrains Mono,monospace",fontSize:12,background:"var(--sur)",color:"var(--on-sur)",outline:"none"}}/></td>
                      <td>{dif!==0&&<span style={{fontSize:11,fontWeight:700,color:dif>0?"var(--err)":"var(--sec)"}}>{dif>0?"▲":"▼"} {fmtRD(Math.abs(dif))}</span>}</td>
                      <td className="mono" style={{fontWeight:700,color:"var(--pri)",fontSize:13}}>{fmtRD(realTotal)}</td>
                    </tr>
                  );
                })}</tbody>
              </table></div>
            </div>
          </div>
          <div style={{position:"sticky",top:80}}>
            <div className="card" style={{marginBottom:12}}>
              <div className="card-bdy">
                <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--out)",fontSize:13}}><span style={{color:"var(--on-sur3)"}}>Subtotal</span><span className="mono" style={{fontWeight:600}}>{fmtRD(sub)}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--out)"}}>
                  <div><div style={{fontSize:13,color:"var(--on-sur3)"}}>ITBIS</div><input type="number" min="0" max="100" value={rf.itbis_pct} onChange={rfSet("itbis_pct")} style={{width:48,border:"1px solid var(--out)",borderRadius:6,padding:"3px 6px",fontFamily:"JetBrains Mono,monospace",fontSize:12,background:"var(--sur)",color:"var(--on-sur)",outline:"none",marginTop:4}}/> %</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    {rf.aplicar_itbis&&<span className="mono" style={{fontSize:13,color:"var(--sec)"}}>{fmtRD(itb)}</span>}
                    <button onClick={()=>setRf(f=>({...f,aplicar_itbis:!f.aplicar_itbis}))} style={{width:44,height:24,borderRadius:12,background:rf.aplicar_itbis?"var(--sec)":"var(--sur3)",border:"none",cursor:"pointer",position:"relative",transition:"background .2s"}}><span style={{position:"absolute",top:2,left:rf.aplicar_itbis?22:2,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/></button>
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontSize:17,fontWeight:700}}><span>TOTAL</span><span className="mono" style={{color:"var(--pri)"}}>{fmtRD(tot)}</span></div>
              </div>
            </div>
            <button className="btn btn-filled" style={{width:"100%",background:"var(--sec)",marginBottom:8}} onClick={liquidar} disabled={!rf.factura_sup}>✅ Liquidar y crear CxP</button>
            <button className="btn btn-text" style={{width:"100%"}} onClick={()=>setStep(1)}>Cancelar</button>
          </div>
        </div>
      </div>
    );
  }

  // ── CUENTAS POR PAGAR ────────────────────────────────────────────────────
  function TabCxP(){
    const [q,setQ]=useState("");
    const [fEst,setFEst]=useState("todos");
    const [pagoM,setPagoM]=useState(null);
    const [pagoF,setPagoF]=useState({fecha:today(),monto:"",metodo:"Transferencia",ref:""});
    const filtered=cxp.map(c=>({...c,estado:c.pagado>=c.total?"Pagada":c.vence<today()&&c.pagado<c.total?"Vencida":c.estado})).filter(c=>{const m=c.proveedor.toLowerCase().includes(q.toLowerCase())||c.numero.toLowerCase().includes(q.toLowerCase());return fEst==="todos"?m:m&&c.estado===fEst;});
    const totalPend=cxp.filter(c=>c.estado!=="Pagada").reduce((s,c)=>s+(c.total-c.pagado),0);
    function registrarPago(){
      if(!pagoF.monto)return;
      const monto=parseFloat(pagoF.monto);
      setCxp(cs=>cs.map(c=>{if(c.id!==pagoM.id)return c;const pagos=[{...pagoF,monto},...c.pagos];const pagado=r2(pagos.reduce((s,p)=>s+p.monto,0));const estado=pagado>=c.total?"Pagada":pagado>0?"Parcial":"Pendiente";return{...c,pagos,pagado,estado};}));
      setPagoM(null);showToast("Pago registrado ✓");
    }
    return(
      <div>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
          <div className="sbar"><span style={{color:"var(--on-sur4)"}}>🔍</span><input placeholder="Buscar factura o proveedor..." value={q} onChange={e=>setQ(e.target.value)}/></div>
          <select style={{padding:"8px 14px",borderRadius:"var(--rfull)",border:"1px solid var(--out)",background:"var(--sur)",fontFamily:"inherit",fontSize:13,outline:"none"}} value={fEst} onChange={e=>setFEst(e.target.value)}>
            <option value="todos">Todos</option>{Object.keys(EST_CXP).map(k=><option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        {totalPend>0&&<div style={{background:"#fef7e0",border:"1px solid var(--warn)",borderRadius:"var(--r-sm)",padding:"10px 16px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,color:"#92400e"}}>⚠ Total pendiente</span><span className="mono" style={{fontWeight:700,fontSize:16,color:"#92400e"}}>{fmtRD(totalPend)}</span></div>}
        <div className="card"><div className="twrap"><table>
          <thead><tr><th>Número</th><th>Proveedor</th><th>Factura</th><th>Vence</th><th>Total</th><th>Pagado</th><th>Pendiente</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {filtered.length===0&&<tr><td colSpan={9} style={{textAlign:"center",padding:48,color:"var(--on-sur4)"}}>Sin cuentas por pagar</td></tr>}
            {filtered.map(c=>{const pend=r2(c.total-c.pagado);const ec=EST_CXP[c.estado]||EST_CXP.Pendiente;const days=daysLeft(c.vence);return(
              <tr key={c.id}>
                <td><span className="mono" style={{fontWeight:700,color:"var(--pri)",fontSize:12}}>{c.numero}</span></td>
                <td><div style={{fontWeight:500}}>{c.proveedor}</div><div style={{fontSize:11,color:"var(--on-sur3)"}}>{c.tipo_gasto}</div></td>
                <td className="mono" style={{fontSize:12}}>{c.factura_sup}</td>
                <td><div className="mono" style={{fontSize:12,color:days!==null&&days<0?"var(--err)":days!==null&&days<=7?"var(--warn)":"var(--on-sur3)"}}>{fmtDate(c.vence)}</div>{days!==null&&days<0&&<div style={{fontSize:10,color:"var(--err)",fontWeight:600}}>Vencida {Math.abs(days)}d</div>}{days!==null&&days>=0&&days<=7&&<div style={{fontSize:10,color:"var(--warn)",fontWeight:600}}>Vence en {days}d</div>}</td>
                <td><span className="mono" style={{fontWeight:600}}>{fmtRD(c.total)}</span><div style={{fontSize:10,color:"var(--on-sur4)"}}>{c.moneda}</div></td>
                <td><span className="mono" style={{color:"var(--sec)"}}>{fmtRD(c.pagado)}</span></td>
                <td><span className="mono" style={{fontWeight:700,color:pend>0?"var(--err)":"var(--sec)"}}>{pend>0?fmtRD(pend):"✓ Pagada"}</span></td>
                <td><span className={`chip ${ec.cls}`} style={{fontSize:11}}>{c.estado}</span></td>
                <td>{c.estado!=="Pagada"&&<button style={{background:"var(--pri-lt)",color:"var(--pri)",border:"1px solid var(--pri-lt2)",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:11,padding:"4px 10px"}} onClick={()=>{setPagoM(c);setPagoF({fecha:today(),monto:pend,metodo:"Transferencia",ref:""});}}>💳 Pagar</button>}</td>
              </tr>
            );})}
          </tbody>
        </table></div></div>
        {pagoM&&(
          <div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setPagoM(null);}}>
            <div className="modal" style={{maxWidth:440}}>
              <div className="modal-hdr"><div><div className="modal-ttl">Registrar Pago</div><div style={{fontSize:12,color:"var(--on-sur3)",marginTop:2}}>{pagoM.proveedor} · {pagoM.factura_sup}</div></div><button className="icon-btn" onClick={()=>setPagoM(null)}>✕</button></div>
              <div className="modal-bdy">
                <div style={{background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:"var(--on-sur3)"}}>Pendiente</span><span className="mono" style={{fontWeight:700,color:"var(--err)"}}>{fmtRD(pagoM.total-pagoM.pagado)} {pagoM.moneda}</span></div>
                <div className="fgrid f2" style={{gap:12}}>
                  <div className="fld"><label>Fecha</label><input type="date" value={pagoF.fecha} onChange={e=>setPagoF(f=>({...f,fecha:e.target.value}))}/></div>
                  <div className="fld"><label>Monto</label><input type="number" value={pagoF.monto} onChange={e=>setPagoF(f=>({...f,monto:e.target.value}))}/></div>
                  <div className="fld"><label>Método</label><select value={pagoF.metodo} onChange={e=>setPagoF(f=>({...f,metodo:e.target.value}))}>{["Transferencia","Cheque","Efectivo","Tarjeta"].map(m=><option key={m}>{m}</option>)}</select></div>
                  <div className="fld"><label>Referencia</label><input value={pagoF.ref} onChange={e=>setPagoF(f=>({...f,ref:e.target.value}))} placeholder="TRF-001"/></div>
                </div>
                {pagoM.pagos?.length>0&&<div style={{marginTop:12}}><div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,color:"var(--on-sur3)",marginBottom:8}}>Pagos anteriores</div>{pagoM.pagos.map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid var(--out)",fontSize:12}}><span style={{color:"var(--on-sur3)"}}>{p.fecha} · {p.metodo}</span><span className="mono" style={{color:"var(--sec)",fontWeight:600}}>{fmtRD(p.monto)}</span></div>)}</div>}
              </div>
              <div className="modal-ftr"><button className="btn btn-text" onClick={()=>setPagoM(null)}>Cancelar</button><button className="btn btn-filled" onClick={registrarPago} disabled={!pagoF.monto}>Guardar pago</button></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── RENDER ───────────────────────────────────────────────────────────────
  const TABS=[
    {id:"proveedores",label:"🏭 Proveedores"},
    {id:"ordenes",label:"📋 Órdenes de Compra",count:ocAbiertas||null},
    {id:"recibo",label:"📦 Recibo de Mercancía"},
    {id:"cxp",label:"💸 Cuentas por Pagar",count:cxp.filter(c=>c.estado!=="Pagada").length||null,alert:vencidas>0},
  ];
  return(
    <div>
      <div className="stats-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        {[
          {l:"Proveedores",n:provs.filter(p=>p.estado==="Activo").length,i:"🏭",bg:"var(--sur3)"},
          {l:"OC abiertas",n:ocAbiertas,i:"📋",bg:"var(--pri-lt)"},
          {l:"CxP pendiente",n:fmtRD(totalCxP),i:"💸",bg:"#fef7e0"},
          {l:"Facturas vencidas",n:vencidas,i:"⚠️",bg:vencidas>0?"#fce8e6":"var(--sec-lt)"},
        ].map(s=>(
          <div key={s.l} className="stat-card">
            <div className="stat-icon-wrap" style={{background:s.bg}}>{s.i}</div>
            <div className="stat-num" style={{fontSize:typeof s.n==="string"?16:28}}>{s.n}</div>
            <div className="stat-lbl">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="seg-tabs" style={{marginBottom:20}}>
        {TABS.map(t=>(
          <button key={t.id} className={"seg-tab"+(tab===t.id?" on":"")} onClick={()=>setTab(t.id)} style={{position:"relative"}}>
            {t.label}
            {t.count>0&&<span style={{marginLeft:6,background:t.alert?"var(--err)":"var(--pri)",color:"#fff",borderRadius:12,fontSize:10,fontWeight:700,padding:"1px 6px",verticalAlign:"middle"}}>{t.count}</span>}
          </button>
        ))}
      </div>
      {tab==="proveedores"&&<TabProveedores/>}
      {tab==="ordenes"&&<TabOrdenes/>}
      {tab==="recibo"&&<TabRecibo/>}
      {tab==="cxp"&&<TabCxP/>}
      {toast&&<div className="toast-msg">{toast}</div>}
    </div>
  );
}
