/**
 * CLIENTES EXPANDIDO
 * 2 vistas:
 *  1. Lista    — tabla con búsqueda, filtros, KPIs
 *  2. Ficha    — detalle completo: datos generales, 4 contactos,
 *                crédito, historial de compras, CxC
 */
import { useState } from "react";

function fmtRD(n)   { return `RD$${Math.round(n||0).toLocaleString("es-DO")}`; }
function fmtDate(d) { return d ? new Date(d+"T12:00:00").toLocaleDateString("es-DO",{day:"2-digit",month:"short",year:"numeric"}) : "—"; }
function today()    { return new Date().toISOString().slice(0,10); }
function r2(n)      { return Math.round((n||0)*100)/100; }

const TIPOS_EMPRESA = ["Empresa","Proyecto","Distribuidor","Fabricante","Barra/Plancha","Persona","Gobierno"];
const TIPOS_NCF     = ["B02 — Consumidor Final","B01 — Crédito Fiscal","B15 — Gubernamental"];
const FORMAS_PAGO   = ["Contado","Crédito 15d","Crédito 30d","Crédito 60d","Crédito 90d"];
const VENDEDORES    = ["Mario Vuk","Carmen Pérez","Sin asignar"];
const ZONAS         = ["Santo Domingo","Santiago","San Pedro de Macorís","La Romana","Punta Cana","Moca","La Vega","Barahona","Otra"];

function emptyContacto() {
  return { nombre:"", tel:"", celular:"", email:"", notas:"" };
}

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO = [
  {
    id:1, codigo:"CLT-001", nombre:"Constructora Pérez & Asociados", nombre_comercial:"",
    rnc:"101-12345-6", tipo:"Empresa", estado:"Activo",
    dir_calle:"Av. 27 de Febrero #450", dir_sector:"Naco", zona:"Santo Domingo",
    zip:"10114", tel:"809-555-1234", celular:"829-555-1234", email:"info@perezconstr.do", web:"perezconstr.do",
    vendedor:"Mario Vuk", tipo_ncf:"B01 — Crédito Fiscal", forma_pago:"Crédito 30d",
    limite_credito:500000, descuento_preest:0, exento_impuestos:false, pct_exento:0,
    notas:"Cliente prioritario. Proyectos residenciales grandes.",
    creado:today(), modificado:today(),
    contactos:{
      principal:    { nombre:"Carlos Pérez",   tel:"809-555-1234", celular:"829-555-1234", email:"cperez@perezconstr.do",   notas:"Dueño" },
      compras:      { nombre:"Ana Martínez",    tel:"809-555-1235", celular:"",             email:"compras@perezconstr.do",  notas:"Encargada de compras" },
      mantenimiento:{ nombre:"Roberto Gómez",   tel:"809-555-1236", celular:"849-555-1236", email:"",                        notas:"Supervisor de obras" },
      cobros:       { nombre:"Patricia Díaz",   tel:"809-555-1237", celular:"",             email:"contabilidad@perezconstr.do", notas:"" },
    },
    historial:[
      { tipo:"Factura", numero:"FAC-001", fecha:"2025-06-01", total:56280,  estado:"Pagada"   },
      { tipo:"Cotización",numero:"COT-001",fecha:"2025-06-01",total:56280,  estado:"Facturada"},
    ],
    cxc:{ total:0, pagado:0 },
  },
  {
    id:2, codigo:"CLT-002", nombre:"Ferretería El Martillo", nombre_comercial:"El Martillo SRL",
    rnc:"102-56789-1", tipo:"Distribuidor", estado:"Activo",
    dir_calle:"Calle Independencia #210", dir_sector:"Centro", zona:"Santiago",
    zip:"51000", tel:"829-555-5678", celular:"", email:"ventas@elmartillo.do", web:"",
    vendedor:"Carmen Pérez", tipo_ncf:"B01 — Crédito Fiscal", forma_pago:"Crédito 15d",
    limite_credito:200000, descuento_preest:5, exento_impuestos:false, pct_exento:0,
    notas:"Distribuidor en Santiago. Compras frecuentes de herrajes.",
    creado:today(), modificado:today(),
    contactos:{
      principal:    { nombre:"Juan Martillo",  tel:"829-555-5678", celular:"829-555-5679", email:"jmartillo@elmartillo.do", notas:"Gerente" },
      compras:      { nombre:"",               tel:"",             celular:"",              email:"",                        notas:"" },
      mantenimiento:{ nombre:"",               tel:"",             celular:"",              email:"",                        notas:"" },
      cobros:       { nombre:"Rosa Jiménez",   tel:"829-555-5680", celular:"",              email:"cobros@elmartillo.do",    notas:"" },
    },
    historial:[
      { tipo:"Factura", numero:"FAC-002", fecha:"2025-06-05", total:22420, estado:"Pendiente" },
    ],
    cxc:{ total:22420, pagado:0 },
  },
  {
    id:3, codigo:"CLT-003", nombre:"María González", nombre_comercial:"",
    rnc:"", tipo:"Persona", estado:"Activo",
    dir_calle:"Calle Las Flores #12", dir_sector:"Los Jardines", zona:"Santo Domingo",
    zip:"", tel:"849-555-9012", celular:"849-555-9013", email:"maria@gmail.com", web:"",
    vendedor:"Carmen Pérez", tipo_ncf:"B02 — Consumidor Final", forma_pago:"Contado",
    limite_credito:0, descuento_preest:0, exento_impuestos:false, pct_exento:0,
    notas:"",
    creado:today(), modificado:today(),
    contactos:{
      principal:    { nombre:"María González", tel:"849-555-9012", celular:"849-555-9013", email:"maria@gmail.com", notas:"" },
      compras:      emptyContacto(), mantenimiento:emptyContacto(), cobros:emptyContacto(),
    },
    historial:[
      { tipo:"Factura", numero:"FAC-004", fecha:"2025-05-15", total:6800, estado:"Vencida" },
    ],
    cxc:{ total:6800, pagado:0 },
  },
  {
    id:4, codigo:"CLT-004", nombre:"Inmobiliaria Vista Verde", nombre_comercial:"Vista Verde SRL",
    rnc:"130-98765-4", tipo:"Proyecto", estado:"Activo",
    dir_calle:"Km 14.5 Autopista Duarte", dir_sector:"", zona:"Santo Domingo",
    zip:"", tel:"809-555-3456", celular:"", email:"proyectos@vistaverde.do", web:"vistaverde.do",
    vendedor:"Mario Vuk", tipo_ncf:"B01 — Crédito Fiscal", forma_pago:"Crédito 60d",
    limite_credito:1000000, descuento_preest:0, exento_impuestos:false, pct_exento:0,
    notas:"Proyectos de gran escala. Requiere aprobación gerencial para descuentos.",
    creado:today(), modificado:today(),
    contactos:{
      principal:    { nombre:"Roberto Verde",  tel:"809-555-3456", celular:"829-555-3456", email:"rverde@vistaverde.do",     notas:"Director" },
      compras:      { nombre:"Ing. Luis Marte",tel:"809-555-3457", celular:"",              email:"lmarte@vistaverde.do",     notas:"Gerente de proyectos" },
      mantenimiento:{ nombre:"",               tel:"",             celular:"",              email:"",                         notas:"" },
      cobros:       { nombre:"Miriam Santos",  tel:"809-555-3458", celular:"",              email:"finanzas@vistaverde.do",   notas:"" },
    },
    historial:[
      { tipo:"Factura",   numero:"FAC-003", fecha:"2025-05-28", total:89208, estado:"Parcial"  },
      { tipo:"Cotización",numero:"COT-004", fecha:"2025-05-28", total:75600, estado:"Aprobada" },
    ],
    cxc:{ total:89208, pagado:40000 },
  },
];

function emptyForm(lista) {
  return {
    id:null, codigo:`CLT-${String(lista.length+1).padStart(3,"0")}`,
    nombre:"", nombre_comercial:"", rnc:"", tipo:"Empresa", estado:"Activo",
    dir_calle:"", dir_sector:"", zona:"Santo Domingo",
    zip:"", tel:"", celular:"", email:"", web:"",
    vendedor:"Sin asignar", tipo_ncf:"B02 — Consumidor Final",
    forma_pago:"Contado", limite_credito:0, descuento_preest:0,
    exento_impuestos:false, pct_exento:0, notas:"", creado:today(), modificado:today(),
    contactos:{ principal:emptyContacto(), compras:emptyContacto(), mantenimiento:emptyContacto(), cobros:emptyContacto() },
    historial:[], cxc:{ total:0, pagado:0 },
  };
}

const EST_HIST = { Pagada:"chip-filled-sec", Pendiente:"chip-filled-warn", Parcial:"chip-filled-pri", Vencida:"chip-filled-err", Aprobada:"chip-filled-sec", Facturada:"chip", Rechazada:"chip-filled-err" };

// ═══════════════════════════════════════════════════════════════════════════════
export default function Clientes() {
  const [lista,  setLista]  = useState(DEMO);
  const [view,   setView]   = useState("list");   // list | detail | form
  const [sel,    setSel]    = useState(null);
  const [form,   setForm]   = useState(null);
  const [toast,  setToast]  = useState("");
  const [fichaTab, setFTab] = useState("general");

  function showToast(msg){ setToast(msg); setTimeout(()=>setToast(""),2600); }

  function goList()  { setView("list"); setSel(null); setForm(null); }
  function openNew() { setForm(emptyForm(lista)); setFTab("general"); setView("form"); }
  function openEdit(c){ setForm(JSON.parse(JSON.stringify(c))); setFTab("general"); setView("form"); }
  function openDetail(c){ setSel(c); setFTab("general"); setView("detail"); }

  function save() {
    if(!form.nombre.trim()) return;
    const upd = {...form, modificado:today()};
    if(upd.id){ setLista(ls=>ls.map(x=>x.id===upd.id?upd:x)); setSel(upd); }
    else { const n={...upd,id:Date.now()}; setLista(ls=>[...ls,n]); setSel(n); }
    setView("detail"); showToast("Cliente guardado ✓");
  }

  const sf = k => e => setForm(f=>({...f,[k]:typeof e==="object"?e.target.value:e}));
  const sc = (rol,k) => e => setForm(f=>({...f,contactos:{...f.contactos,[rol]:{...f.contactos[rol],[k]:e.target.value}}}));

  // ── stats ────────────────────────────────────────────────────────────────
  const activos   = lista.filter(c=>c.estado==="Activo").length;
  const conCxC    = lista.filter(c=>(c.cxc?.total-c.cxc?.pagado)>0).length;
  const totalCxC  = lista.reduce((s,c)=>s+Math.max(0,(c.cxc?.total||0)-(c.cxc?.pagado||0)),0);

  // ════════════════════════════════════════════════════════════════════════════
  // FORM — crear / editar cliente
  // ════════════════════════════════════════════════════════════════════════════
  if (view==="form" && form) {
    const CONTACTO_LABELS = {
      principal:"Contacto Principal",
      compras:"Contacto para Compras",
      mantenimiento:"Contacto para Mantenimiento / Obras",
      cobros:"Contacto para Cobros",
    };
    const FTABS = [
      {id:"general",   label:"📋 General"},
      {id:"contactos", label:"👥 Contactos"},
      {id:"credito",   label:"💳 Crédito y precios"},
    ];
    return(
      <div>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
          <button className="btn btn-text" onClick={goList}>← Clientes</button>
          <div style={{fontSize:20,fontWeight:700}}>{form.id?"Editar cliente":"Nuevo cliente"}</div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:20,alignItems:"start"}}>
          <div>
            <div className="seg-tabs" style={{marginBottom:16}}>
              {FTABS.map(t=><button key={t.id} className={"seg-tab"+(fichaTab===t.id?" on":"")} onClick={()=>setFTab(t.id)}>{t.label}</button>)}
            </div>

            {fichaTab==="general"&&(
              <div className="card">
                <div className="card-hdr"><div className="card-ttl">Datos generales</div></div>
                <div className="card-bdy">
                  <div className="fgrid f2" style={{gap:14}}>
                    <div className="fld"><label>Código</label><input value={form.codigo} onChange={sf("codigo")}/></div>
                    <div className="fld"><label>Tipo</label>
                      <select value={form.tipo} onChange={sf("tipo")}>{TIPOS_EMPRESA.map(t=><option key={t}>{t}</option>)}</select>
                    </div>
                    <div className="fld" style={{gridColumn:"1/-1"}}><label>Nombre *</label><input value={form.nombre} onChange={sf("nombre")} placeholder="Nombre de la empresa o persona" autoFocus/></div>
                    <div className="fld" style={{gridColumn:"1/-1"}}><label>Nombre comercial</label><input value={form.nombre_comercial} onChange={sf("nombre_comercial")} placeholder="Nombre alternativo o marca"/></div>
                    <div className="fld"><label>RNC / Cédula</label><input value={form.rnc} onChange={sf("rnc")} placeholder="101-00000-0"/></div>
                    <div className="fld"><label>Estado</label>
                      <select value={form.estado} onChange={sf("estado")}><option>Activo</option><option>Inactivo</option></select>
                    </div>
                    <div style={{gridColumn:"1/-1",height:1,background:"var(--out)"}}/>
                    <div className="fld" style={{gridColumn:"1/-1"}}><label>Dirección (calle y número)</label><input value={form.dir_calle} onChange={sf("dir_calle")} placeholder="Calle Las Palmas #42"/></div>
                    <div className="fld"><label>Sector / Barrio</label><input value={form.dir_sector} onChange={sf("dir_sector")}/></div>
                    <div className="fld"><label>Zona / Ciudad</label>
                      <select value={form.zona} onChange={sf("zona")}>{ZONAS.map(z=><option key={z}>{z}</option>)}</select>
                    </div>
                    <div className="fld"><label>ZIP / Código postal</label><input value={form.zip} onChange={sf("zip")}/></div>
                    <div className="fld"><label>Teléfono</label><input value={form.tel} onChange={sf("tel")} placeholder="809-000-0000"/></div>
                    <div className="fld"><label>Celular</label><input value={form.celular} onChange={sf("celular")} placeholder="829-000-0000"/></div>
                    <div className="fld"><label>Email</label><input type="email" value={form.email} onChange={sf("email")}/></div>
                    <div className="fld"><label>Sitio web</label><input value={form.web} onChange={sf("web")} placeholder="empresa.com"/></div>
                    <div style={{gridColumn:"1/-1",height:1,background:"var(--out)"}}/>
                    <div className="fld"><label>Vendedor asignado</label>
                      <select value={form.vendedor} onChange={sf("vendedor")}>{VENDEDORES.map(v=><option key={v}>{v}</option>)}</select>
                    </div>
                    <div className="fld"><label>Tipo de comprobante fiscal</label>
                      <select value={form.tipo_ncf} onChange={sf("tipo_ncf")}>{TIPOS_NCF.map(t=><option key={t}>{t}</option>)}</select>
                    </div>
                    <div className="fld" style={{gridColumn:"1/-1"}}><label>Notas</label>
                      <textarea value={form.notas} onChange={sf("notas")} style={{background:"var(--sur2)",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",padding:"8px 12px",fontFamily:"inherit",fontSize:13,color:"var(--on-sur)",outline:"none",width:"100%",resize:"vertical",minHeight:72}}/>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {fichaTab==="contactos"&&(
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {Object.entries(CONTACTO_LABELS).map(([rol,label])=>(
                  <div key={rol} className="card">
                    <div className="card-hdr"><div className="card-ttl">{label}</div></div>
                    <div className="card-bdy">
                      <div className="fgrid f2" style={{gap:13}}>
                        <div className="fld"><label>Nombre</label><input value={form.contactos[rol].nombre} onChange={sc(rol,"nombre")}/></div>
                        <div className="fld"><label>Email</label><input type="email" value={form.contactos[rol].email} onChange={sc(rol,"email")}/></div>
                        <div className="fld"><label>Teléfono</label><input value={form.contactos[rol].tel} onChange={sc(rol,"tel")}/></div>
                        <div className="fld"><label>Celular</label><input value={form.contactos[rol].celular} onChange={sc(rol,"celular")}/></div>
                        <div className="fld" style={{gridColumn:"1/-1"}}><label>Notas</label><input value={form.contactos[rol].notas} onChange={sc(rol,"notas")} placeholder="Cargo, horario de contacto..."/></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {fichaTab==="credito"&&(
              <div className="card">
                <div className="card-hdr"><div className="card-ttl">Crédito y condiciones comerciales</div></div>
                <div className="card-bdy">
                  <div className="fgrid f2" style={{gap:14}}>
                    <div className="fld"><label>Forma de pago habitual</label>
                      <select value={form.forma_pago} onChange={sf("forma_pago")}>{FORMAS_PAGO.map(f=><option key={f}>{f}</option>)}</select>
                    </div>
                    <div className="fld"><label>Límite de crédito (RD$)</label>
                      <input type="number" min="0" value={form.limite_credito} onChange={sf("limite_credito")} style={{fontFamily:"JetBrains Mono,monospace",fontWeight:700}}/>
                    </div>
                    <div className="fld"><label>Descuento pre-establecido %</label>
                      <input type="number" min="0" max="100" step="0.5" value={form.descuento_preest} onChange={sf("descuento_preest")}/>
                    </div>
                    <div className="fld"><label>Exento de impuestos</label>
                      <select value={form.exento_impuestos?"si":"no"} onChange={e=>setForm(f=>({...f,exento_impuestos:e.target.value==="si"}))}>
                        <option value="no">No — aplica impuestos normales</option>
                        <option value="si">Sí — exento (especificar %)</option>
                      </select>
                    </div>
                    {form.exento_impuestos&&(
                      <div className="fld"><label>% Exento de impuestos</label>
                        <input type="number" min="0" max="100" value={form.pct_exento} onChange={sf("pct_exento")}/>
                      </div>
                    )}
                  </div>

                  {form.limite_credito>0&&(
                    <div style={{marginTop:16,background:"var(--pri-lt)",borderRadius:"var(--r-sm)",padding:"12px 14px",fontSize:13}}>
                      <div style={{color:"var(--pri)",fontWeight:600,marginBottom:2}}>Límite de crédito configurado</div>
                      <div style={{color:"var(--on-sur3)"}}>Este cliente puede tener hasta <span className="mono" style={{fontWeight:700,color:"var(--pri)"}}>{fmtRD(form.limite_credito)}</span> en crédito simultáneo</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div style={{position:"sticky",top:80}}>
            <div className="card" style={{marginBottom:12}}>
              <div className="card-bdy">
                {[
                  ["Código",    form.codigo],
                  ["Tipo",      form.tipo],
                  ["Zona",      form.zona],
                  ["Vendedor",  form.vendedor],
                  ["NCF",       form.tipo_ncf.split(" — ")[0]],
                  ["Crédito",   form.limite_credito>0?fmtRD(form.limite_credito):"Contado"],
                  ["Descuento", form.descuento_preest>0?`${form.descuento_preest}%`:"—"],
                ].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid var(--out)",fontSize:12}}>
                    <span style={{color:"var(--on-sur3)"}}>{l}</span>
                    <span style={{fontWeight:500}}>{v||"—"}</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn btn-filled" style={{width:"100%",marginBottom:8}} onClick={save} disabled={!form.nombre.trim()}>
              {form.id?"Guardar cambios":"Crear cliente"}
            </button>
            <button className="btn btn-text" style={{width:"100%"}} onClick={goList}>Cancelar</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DETAIL — ficha del cliente
  // ════════════════════════════════════════════════════════════════════════════
  if (view==="detail" && sel) {
    const c = lista.find(x=>x.id===sel.id)||sel;
    const cxcPend = Math.max(0,(c.cxc?.total||0)-(c.cxc?.pagado||0));
    const pctCredito = c.limite_credito>0?r2(cxcPend/c.limite_credito*100):0;
    const FTABS2=[
      {id:"general",    label:"📋 General"},
      {id:"contactos",  label:"👥 Contactos"},
      {id:"credito",    label:"💳 Crédito"},
      {id:"historial",  label:"📊 Historial"},
    ];
    const CONTACT_LABELS={principal:"Principal",compras:"Compras",mantenimiento:"Mantenimiento",cobros:"Cobros"};

    return(
      <div>
        <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:20,flexWrap:"wrap"}}>
          <button className="btn btn-text" onClick={goList}>← Clientes</button>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <span style={{fontSize:22,fontWeight:700}}>{c.nombre}</span>
              <span className={`chip ${c.estado==="Activo"?"chip-filled-sec":"chip-filled-err"}`}>{c.estado}</span>
              <span className="chip" style={{fontSize:11}}>{c.tipo}</span>
              {c.rnc&&<span className="mono" style={{fontSize:11,color:"var(--on-sur3)"}}>RNC: {c.rnc}</span>}
            </div>
            {c.nombre_comercial&&<div style={{fontSize:13,color:"var(--on-sur3)",marginTop:2}}>{c.nombre_comercial}</div>}
            <div style={{fontSize:12,color:"var(--on-sur4)",marginTop:2}}>{c.codigo} · {c.zona} · Vendedor: {c.vendedor}</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-outlined" onClick={()=>openEdit(c)}>✏️ Editar</button>
            <button className="btn btn-filled" style={{background:"var(--sec)"}} onClick={()=>setLista(ls=>ls.map(x=>x.id===c.id?{...x,estado:c.estado==="Activo"?"Inactivo":"Activo"}:x))||setSel(s=>({...s,estado:c.estado==="Activo"?"Inactivo":"Activo"}))}>
              {c.estado==="Activo"?"Desactivar":"Activar"}
            </button>
          </div>
        </div>

        <div className="seg-tabs" style={{marginBottom:20}}>
          {FTABS2.map(t=><button key={t.id} className={"seg-tab"+(fichaTab===t.id?" on":"")} onClick={()=>setFTab(t.id)}>{t.label}</button>)}
        </div>

        {/* General */}
        {fichaTab==="general"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div className="card">
              <div className="card-hdr"><div className="card-ttl">Datos de contacto</div></div>
              <div className="card-bdy">
                {[
                  ["📍 Dirección", [c.dir_calle,c.dir_sector,c.zona].filter(Boolean).join(", ")],
                  ["📞 Teléfono",  c.tel||"—"],
                  ["📱 Celular",   c.celular||"—"],
                  ["📧 Email",     c.email||"—"],
                  ["🌐 Web",       c.web||"—"],
                ].map(([l,v])=>(
                  <div key={l} style={{display:"flex",gap:12,padding:"8px 0",borderBottom:"1px solid var(--out)",fontSize:13,alignItems:"flex-start"}}>
                    <span style={{color:"var(--on-sur4)",minWidth:100,flexShrink:0}}>{l}</span>
                    <span style={{fontWeight:500,wordBreak:"break-word"}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-hdr"><div className="card-ttl">Condiciones comerciales</div></div>
              <div className="card-bdy">
                {[
                  ["Vendedor",         c.vendedor],
                  ["Comprobante",      c.tipo_ncf],
                  ["Forma de pago",    c.forma_pago],
                  ["Límite crédito",   c.limite_credito>0?fmtRD(c.limite_credito):"Sin límite"],
                  ["Descuento",        c.descuento_preest>0?`${c.descuento_preest}%`:"—"],
                  ["Exento impuestos", c.exento_impuestos?`Sí (${c.pct_exento}%)`:"No"],
                ].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--out)",fontSize:13}}>
                    <span style={{color:"var(--on-sur3)"}}>{l}</span>
                    <span style={{fontWeight:500}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            {c.notas&&(
              <div className="card" style={{gridColumn:"1/-1"}}>
                <div className="card-bdy"><div style={{fontSize:13,color:"var(--on-sur2)",lineHeight:1.7}}>📝 {c.notas}</div></div>
              </div>
            )}
          </div>
        )}

        {/* Contactos */}
        {fichaTab==="contactos"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {Object.entries(CONTACT_LABELS).map(([rol,label])=>{
              const ct=c.contactos[rol];
              const hasData=ct?.nombre||ct?.tel||ct?.email;
              return(
                <div key={rol} className="card" style={{opacity:hasData?1:0.5}}>
                  <div className="card-hdr"><div className="card-ttl">{label}</div>{!hasData&&<span style={{fontSize:11,color:"var(--on-sur4)"}}>Sin configurar</span>}</div>
                  <div className="card-bdy">
                    {hasData?(
                      <div>
                        <div style={{fontWeight:700,fontSize:15,marginBottom:8}}>{ct.nombre||"—"}</div>
                        {[["📞",ct.tel],["📱",ct.celular],["📧",ct.email]].filter(([,v])=>v).map(([i,v])=>(
                          <div key={i} style={{display:"flex",gap:8,fontSize:13,marginBottom:4,alignItems:"center"}}>
                            <span>{i}</span><span style={{color:"var(--on-sur2)"}}>{v}</span>
                          </div>
                        ))}
                        {ct.notas&&<div style={{marginTop:8,fontSize:12,color:"var(--on-sur4)",background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"6px 10px"}}>{ct.notas}</div>}
                      </div>
                    ):(
                      <div style={{textAlign:"center",color:"var(--on-sur4)",fontSize:13,padding:"8px 0"}}>
                        Sin contacto configurado<br/>
                        <button className="btn btn-sm btn-outlined" style={{marginTop:8}} onClick={()=>openEdit(c)||setFTab("contactos")}>Agregar</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Crédito */}
        {fichaTab==="credito"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div className="card">
              <div className="card-hdr"><div className="card-ttl">Estado de crédito</div></div>
              <div className="card-bdy">
                {c.limite_credito>0?(
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                      <div>
                        <div style={{fontSize:12,color:"var(--on-sur3)"}}>Utilizado</div>
                        <div className="mono" style={{fontSize:22,fontWeight:700,color:pctCredito>80?"var(--err)":pctCredito>50?"var(--warn)":"var(--pri)"}}>{fmtRD(cxcPend)}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:12,color:"var(--on-sur3)"}}>Disponible</div>
                        <div className="mono" style={{fontSize:22,fontWeight:700,color:"var(--sec)"}}>{fmtRD(c.limite_credito-cxcPend)}</div>
                      </div>
                    </div>
                    <div style={{height:10,background:"var(--sur3)",borderRadius:5,overflow:"hidden",marginBottom:8}}>
                      <div style={{height:"100%",width:`${Math.min(pctCredito,100)}%`,background:pctCredito>80?"var(--err)":pctCredito>50?"var(--warn)":"var(--pri)",borderRadius:5,transition:"width .5s"}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--on-sur3)"}}>
                      <span>Límite: {fmtRD(c.limite_credito)}</span>
                      <span style={{fontWeight:700,color:pctCredito>80?"var(--err)":"var(--on-sur3)"}}>{pctCredito}% utilizado</span>
                    </div>
                    {pctCredito>80&&<div style={{marginTop:10,background:"#fce8e6",borderRadius:"var(--r-sm)",padding:"8px 12px",fontSize:12,color:"var(--err)",fontWeight:600}}>⚠ Límite de crédito casi agotado</div>}
                  </div>
                ):(
                  <div style={{textAlign:"center",padding:"16px 0",color:"var(--on-sur4)"}}>
                    <div style={{fontSize:32,marginBottom:8}}>💳</div>
                    <div style={{fontWeight:600}}>Cliente de contado</div>
                    <div style={{fontSize:12,marginTop:4}}>Sin límite de crédito configurado</div>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-hdr"><div className="card-ttl">Resumen CxC</div></div>
              <div className="card-bdy">
                {[
                  ["Total facturado",   fmtRD(c.cxc?.total||0),  "var(--on-sur2)"],
                  ["Pagado",           fmtRD(c.cxc?.pagado||0), "var(--sec)"],
                  ["Pendiente",        fmtRD(cxcPend),            cxcPend>0?"var(--err)":"var(--sec)"],
                  ["Forma de pago",    c.forma_pago,              "var(--on-sur2)"],
                  ["Descuento pret.",  c.descuento_preest>0?`${c.descuento_preest}%`:"—","var(--on-sur2)"],
                ].map(([l,v,color])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--out)",fontSize:13}}>
                    <span style={{color:"var(--on-sur3)"}}>{l}</span>
                    <span className="mono" style={{fontWeight:600,color}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Historial */}
        {fichaTab==="historial"&&(
          <div className="card">
            <div className="card-hdr"><div className="card-ttl">Historial de transacciones</div><div style={{fontSize:13,color:"var(--on-sur3)"}}>{c.historial.length} registro(s)</div></div>
            {c.historial.length===0?(
              <div style={{textAlign:"center",padding:"40px 24px",color:"var(--on-sur4)"}}>
                <div style={{fontSize:32,marginBottom:8}}>📊</div>
                <div style={{fontWeight:600}}>Sin historial</div>
                <div style={{fontSize:12,marginTop:4}}>Las cotizaciones y facturas aparecerán aquí</div>
              </div>
            ):(
              <div className="twrap"><table>
                <thead><tr><th>Tipo</th><th>Número</th><th>Fecha</th><th>Total</th><th>Estado</th></tr></thead>
                <tbody>
                  {c.historial.map((h,i)=>(
                    <tr key={i}>
                      <td><span className="chip" style={{fontSize:11}}>{h.tipo}</span></td>
                      <td><span className="mono" style={{fontWeight:700,color:"var(--pri)",fontSize:12}}>{h.numero}</span></td>
                      <td className="mono" style={{fontSize:12}}>{fmtDate(h.fecha)}</td>
                      <td><span className="mono" style={{fontWeight:600}}>{fmtRD(h.total)}</span></td>
                      <td><span className={`chip ${EST_HIST[h.estado]||"chip"}`} style={{fontSize:11}}>{h.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // LIST
  // ════════════════════════════════════════════════════════════════════════════
  const [q,       setQ]       = useState("");
  const [filtro,  setFiltro]  = useState("todos");
  const [filtZona,setFiltZona]= useState("todas");

  const filtered = lista.filter(c=>{
    const m = c.nombre.toLowerCase().includes(q.toLowerCase()) ||
              c.codigo.toLowerCase().includes(q.toLowerCase()) ||
              (c.rnc||"").toLowerCase().includes(q.toLowerCase());
    const byEst  = filtro==="todos"    || c.estado===filtro;
    const byZona = filtZona==="todas"  || c.zona===filtZona;
    return m&&byEst&&byZona;
  });

  const zonas = [...new Set(lista.map(c=>c.zona))].filter(Boolean);

  return(
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        {[
          {l:"Total clientes",  n:lista.length,   i:"👥", bg:"var(--sur3)"},
          {l:"Activos",         n:activos,         i:"✅", bg:"var(--sec-lt)"},
          {l:"Con CxC",         n:conCxC,          i:"💸", bg:conCxC>0?"#fef7e0":"var(--sec-lt)"},
          {l:"CxC pendiente",   n:fmtRD(totalCxC),i:"💰", bg:totalCxC>0?"var(--pri-lt)":"var(--sec-lt)"},
        ].map(s=>(
          <div key={s.l} className="stat-card">
            <div className="stat-icon-wrap" style={{background:s.bg}}>{s.i}</div>
            <div className="stat-num" style={{fontSize:typeof s.n==="string"?16:28}}>{s.n}</div>
            <div className="stat-lbl">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
        <div className="sbar" style={{flex:1,minWidth:200}}>
          <span style={{color:"var(--on-sur4)"}}>🔍</span>
          <input placeholder="Buscar por nombre, código o RNC..." value={q} onChange={e=>setQ(e.target.value)}/>
          {q&&<button style={{background:"none",border:"none",cursor:"pointer",color:"var(--on-sur4)",fontSize:16}} onClick={()=>setQ("")}>✕</button>}
        </div>
        <div className="seg-tabs" style={{marginBottom:0}}>
          {[["todos","Todos"],["Activo","Activos"],["Inactivo","Inactivos"]].map(([v,l])=>(
            <button key={v} className={"seg-tab"+(filtro===v?" on":"")} onClick={()=>setFiltro(v)}>{l}</button>
          ))}
        </div>
        <select style={{padding:"8px 14px",borderRadius:"var(--rfull)",border:"1px solid var(--out)",background:"var(--sur)",fontFamily:"inherit",fontSize:13,outline:"none"}} value={filtZona} onChange={e=>setFiltZona(e.target.value)}>
          <option value="todas">Todas las zonas</option>
          {zonas.map(z=><option key={z} value={z}>{z}</option>)}
        </select>
        <button className="btn btn-filled" onClick={openNew}>＋ Nuevo Cliente</button>
      </div>

      {/* Table */}
      <div className="card"><div className="twrap"><table>
        <thead><tr><th>Código</th><th>Cliente</th><th>Tipo</th><th>Zona</th><th>Contacto</th><th>Vendedor</th><th>CxC</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          {filtered.length===0&&<tr><td colSpan={9} style={{textAlign:"center",padding:52,color:"var(--on-sur4)"}}><div style={{fontSize:32,marginBottom:8}}>👥</div>Sin clientes</td></tr>}
          {filtered.map(c=>{
            const cxcPend=Math.max(0,(c.cxc?.total||0)-(c.cxc?.pagado||0));
            const pct=c.limite_credito>0?r2(cxcPend/c.limite_credito*100):0;
            return(
              <tr key={c.id} style={{cursor:"pointer"}} onClick={()=>openDetail(c)}>
                <td><span className="mono" style={{fontSize:11,color:"var(--on-sur3)"}}>{c.codigo}</span></td>
                <td>
                  <div style={{fontWeight:600}}>{c.nombre}</div>
                  {c.nombre_comercial&&<div style={{fontSize:11,color:"var(--on-sur3)"}}>{c.nombre_comercial}</div>}
                  {c.rnc&&<div style={{fontSize:11,color:"var(--on-sur4)",fontFamily:"JetBrains Mono,monospace"}}>RNC: {c.rnc}</div>}
                </td>
                <td><span className="chip" style={{fontSize:11}}>{c.tipo}</span></td>
                <td style={{fontSize:12,color:"var(--on-sur3)"}}>{c.zona}</td>
                <td>
                  <div style={{fontSize:13}}>{c.contactos?.principal?.nombre||c.tel||"—"}</div>
                  <div style={{fontSize:11,color:"var(--on-sur3)"}}>{c.tel}</div>
                </td>
                <td style={{fontSize:12,color:"var(--on-sur3)"}}>{c.vendedor}</td>
                <td>
                  {cxcPend>0?(
                    <div>
                      <span className="mono" style={{fontWeight:700,color:pct>80?"var(--err)":"var(--warn)",fontSize:13}}>{fmtRD(cxcPend)}</span>
                      {c.limite_credito>0&&<div style={{height:4,background:"var(--sur3)",borderRadius:2,marginTop:3,width:60}}>
                        <div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:pct>80?"var(--err)":"var(--warn)",borderRadius:2}}/>
                      </div>}
                    </div>
                  ):<span style={{fontSize:12,color:"var(--on-sur4)"}}>—</span>}
                </td>
                <td><span className={`chip ${c.estado==="Activo"?"chip-filled-sec":"chip-filled-err"}`} style={{fontSize:11}}>{c.estado}</span></td>
                <td onClick={e=>e.stopPropagation()}><button className="btn-sm-ghost" onClick={()=>openEdit(c)}>✏️</button></td>
              </tr>
            );
          })}
        </tbody>
      </table></div></div>

      {toast&&<div className="toast-msg">{toast}</div>}
    </div>
  );
}
