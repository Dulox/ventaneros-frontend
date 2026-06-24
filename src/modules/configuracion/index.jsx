/**
 * CONFIGURACIÓN DEL SISTEMA
 * 5 tabs:
 *  1. Empresa        — nombre, RNC, dirección, logo, moneda, contacto
 *  2. Comprobantes   — series NCF (B01/B02/B14/B15), secuencias, vencimientos
 *  3. Cotizaciones   — niveles de precio, descuentos máx, políticas
 *  4. Facturación    — ITBIS, costeo, comisiones, crédito, caja
 *  5. Producción     — tiempo espera, desperdicios, autorizadores
 */
import { useState } from "react";

function today() { return new Date().toISOString().slice(0,10); }

// ── Toggle switch component ───────────────────────────────────────────────────
function Toggle({ value, onChange, label, sub }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid var(--out)" }}>
      <div>
        <div style={{ fontSize:14, fontWeight:500, color:"var(--on-sur)" }}>{label}</div>
        {sub && <div style={{ fontSize:12, color:"var(--on-sur4)", marginTop:2 }}>{sub}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{ width:44, height:24, borderRadius:12, background:value?"var(--pri)":"var(--sur3)", border:"none", cursor:"pointer", position:"relative", transition:"background .2s", flexShrink:0 }}
      >
        <span style={{ position:"absolute", top:2, left:value?22:2, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"left .2s", boxShadow:"0 1px 3px rgba(0,0,0,.25)" }}/>
      </button>
    </div>
  );
}

// ── Number/Text field row ─────────────────────────────────────────────────────
function FieldRow({ label, sub, value, onChange, type="text", suffix, prefix, min, max, step, width=120 }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid var(--out)" }}>
      <div>
        <div style={{ fontSize:14, fontWeight:500, color:"var(--on-sur)" }}>{label}</div>
        {sub && <div style={{ fontSize:12, color:"var(--on-sur4)", marginTop:2 }}>{sub}</div>}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        {prefix && <span style={{ fontSize:13, color:"var(--on-sur3)" }}>{prefix}</span>}
        <input
          type={type} value={value} min={min} max={max} step={step}
          onChange={e => onChange(e.target.value)}
          style={{ width, padding:"6px 10px", border:"1.5px solid var(--out)", borderRadius:"var(--r-sm)", fontFamily:type==="number"?"JetBrains Mono,monospace":"inherit", fontSize:13, background:"var(--sur)", color:"var(--on-sur)", outline:"none", textAlign:type==="number"?"right":"left" }}
        />
        {suffix && <span style={{ fontSize:13, color:"var(--on-sur3)" }}>{suffix}</span>}
      </div>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHdr({ title }) {
  return <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1.5, color:"var(--on-sur3)", margin:"20px 0 4px", paddingBottom:4 }}>{title}</div>;
}

// ── Demo initial state ────────────────────────────────────────────────────────
const INIT = {
  empresa: {
    nombre:"Ventaneros SRL", rnc:"1-31-12345-6", slogan:"Fabricación de Ventanas y Puertas de Aluminio",
    dir1:"Calle Las Palmas #42", dir2:"Sto. Domingo, República Dominicana",
    tel:"809-555-0001", email:"info@ventaneros.do", web:"ventaneros.do",
    moneda_venta:"RD$", moneda_importacion:"US$",
    formato_fecha:"DD/MM/YYYY", sistema_metrico:false,
    logo_url:"", logo2_url:"",
  },
  ncf: [
    { serie:"B01", nombre:"Crédito Fiscal",       activo:true,  imprime_fact:true,  actual:1,  desde:1,    hasta:9999999, caduca:"2026-12-31", default:false },
    { serie:"B02", nombre:"Consumidor Final",      activo:true,  imprime_fact:true,  actual:1,  desde:1,    hasta:9999999, caduca:"2026-12-31", default:true  },
    { serie:"B14", nombre:"Régimen Especial",      activo:false, imprime_fact:false, actual:1,  desde:1,    hasta:9999999, caduca:"2026-12-31", default:false },
    { serie:"B15", nombre:"Gubernamental",         activo:false, imprime_fact:false, actual:1,  desde:1,    hasta:9999999, caduca:"2026-12-31", default:false },
    { serie:"B04", nombre:"Notas de Crédito",      activo:true,  imprime_fact:false, actual:1,  desde:1,    hasta:9999999, caduca:"2026-12-31", default:false },
    { serie:"B13", nombre:"Gastos Menores",        activo:true,  imprime_fact:false, actual:1,  desde:1,    hasta:9999999, caduca:"2026-12-31", default:false },
  ],
  retencion_informal: 2.00,
  cot: {
    precio_distrib_pct:  10, precio_distrib_base:"costo",
    precio_barra_pct:    20, precio_barra_base:"distrib",
    precio_fab_pct:      30, precio_fab_base:"barra",
    precio_proyecto_pct: 40, precio_proyecto_base:"fab",
    desc_max_distrib:    5,
    desc_max_barra:      10,
    desc_max_fab:        15,
    desc_max_proyecto:   20,
    cotizar_inv_negativo:false,
    impuestos_transparentados:true,
    cliente_final_defecto:true,
    clave_por_cotizacion:false,
    mantener_precios_al_copiar:true,
    acumular_cantidades:false,
    prefacturacion:false,
    huecos_iguales_detallados:true,
    copiar_descuentos:true,
    cambiar_precio_por_cliente:true,
  },
  fact: {
    itbis_nombre:"ITBIS",
    itbis_pct:18,
    facturar_credito:true,
    facturar_inv_negativo:false,
    facturar_clientes_vencidos:false,
    dia_corte_devoluciones:20,
    liberar_automatico:true,
    costeo:"ultimo",  // ultimo | promedio | tarifa
    pct_min_beneficio:0,
    pct_costo_servicios:0,
    com_de1:0, com_a1:50000, com_pct1:3,
    com_de2:50000, com_pct2:5,
    usa_modulo_caja:true,
    usa_comp_fiscal:true,
    clave_para_caja:false,
    impresora_fiscal:false,
    modo_retail:false,
    sugerir_nc_recibos:true,
  },
  prod: {
    tiempo_espera_dias:3,
    produccion_por_lotes:false,
    desglose_auto:true,
    generar_tickets:true,
    precision_desglose:2,
    desperdicio_vidrio_cuadrado:0,
    desperdicio_vidrio_redondo:0,
    desperdicio_pct_adicional:0,
    ajustes_en_recibo:false,
    salida_inv_auto:true,
    eliminar_salidas_al_anular:false,
    autorizador_1:"",
    autorizador_2:"",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
export default function Configuracion() {
  const [tab,  setTab]  = useState("empresa");
  const [cfg,  setCfg]  = useState(INIT);
  const [saved,setSaved]= useState(false);
  const [toast,setToast]= useState("");

  function showToast(msg){ setToast(msg); setTimeout(()=>setToast(""),2600); }

  // Helper to update nested keys
  function set(section, key, val) {
    setCfg(c => ({ ...c, [section]: { ...c[section], [key]: val } }));
    setSaved(false);
  }

  function saveAll() {
    // In production: POST /api/empresa/config
    setSaved(true);
    showToast("Configuración guardada ✓");
  }

  // ── TAB EMPRESA ──────────────────────────────────────────────────────────
  function TabEmpresa() {
    const e = cfg.empresa;
    const se = (k,v) => set("empresa", k, v);
    return (
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, alignItems:"start" }}>
        <div>
          <div className="card" style={{ marginBottom:16 }}>
            <div className="card-hdr"><div className="card-ttl">Datos de la Empresa</div></div>
            <div className="card-bdy">
              <div className="fgrid" style={{ gap:13 }}>
                <div className="fld"><label>Nombre comercial *</label><input value={e.nombre} onChange={ev=>se("nombre",ev.target.value)}/></div>
                <div className="fld"><label>RNC</label><input value={e.rnc} onChange={ev=>se("rnc",ev.target.value)} placeholder="1-00-00000-0"/></div>
                <div className="fld" style={{ gridColumn:"1/-1" }}><label>Slogan / descripción</label><input value={e.slogan} onChange={ev=>se("slogan",ev.target.value)}/></div>
                <div className="fld"><label>Dirección línea 1</label><input value={e.dir1} onChange={ev=>se("dir1",ev.target.value)}/></div>
                <div className="fld"><label>Dirección línea 2</label><input value={e.dir2} onChange={ev=>se("dir2",ev.target.value)}/></div>
                <div className="fld"><label>Teléfono</label><input value={e.tel} onChange={ev=>se("tel",ev.target.value)}/></div>
                <div className="fld"><label>Email</label><input type="email" value={e.email} onChange={ev=>se("email",ev.target.value)}/></div>
                <div className="fld" style={{ gridColumn:"1/-1" }}><label>Sitio web</label><input value={e.web} onChange={ev=>se("web",ev.target.value)} placeholder="ventaneros.do"/></div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-hdr"><div className="card-ttl">Moneda y Formato</div></div>
            <div className="card-bdy">
              <div className="fgrid f2" style={{ gap:13 }}>
                <div className="fld"><label>Moneda de ventas</label>
                  <select value={e.moneda_venta} onChange={ev=>se("moneda_venta",ev.target.value)}>
                    <option>RD$</option><option>US$</option>
                  </select>
                </div>
                <div className="fld"><label>Moneda de importación</label>
                  <select value={e.moneda_importacion} onChange={ev=>se("moneda_importacion",ev.target.value)}>
                    <option>US$</option><option>EUR</option><option>RD$</option>
                  </select>
                </div>
                <div className="fld"><label>Formato de fecha</label>
                  <select value={e.formato_fecha} onChange={ev=>se("formato_fecha",ev.target.value)}>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (Estándar DR)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (Americano)</option>
                  </select>
                </div>
                <div className="fld"><label>Sistema de medidas</label>
                  <select value={e.sistema_metrico?"metrico":"imperial"} onChange={ev=>se("sistema_metrico",ev.target.value==="metrico")}>
                    <option value="imperial">Imperial (pulgadas/pies)</option>
                    <option value="metrico">Métrico (cm/m)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div>
          <div className="card" style={{ marginBottom:16 }}>
            <div className="card-hdr"><div className="card-ttl">Logo de la Empresa</div></div>
            <div className="card-bdy">
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {["logo_url","logo2_url"].map((k,i)=>(
                  <div key={k}>
                    <div style={{ fontSize:12, fontWeight:600, color:"var(--on-sur3)", marginBottom:8 }}>Logo {i===0?"principal":"secundario"}</div>
                    <div style={{ border:"2px dashed var(--out)", borderRadius:"var(--r-md)", padding:"24px 16px", textAlign:"center", background:"var(--sur2)" }}>
                      {e[k]
                        ? <img src={e[k]} alt="Logo" style={{ maxHeight:64, maxWidth:"100%", objectFit:"contain" }}/>
                        : <div>
                            <div style={{ fontSize:32, marginBottom:8 }}>🖼️</div>
                            <div style={{ fontSize:13, color:"var(--on-sur3)", marginBottom:8 }}>PNG o JPG, máx 2MB</div>
                            <button className="btn btn-sm btn-outlined">Seleccionar imagen</button>
                          </div>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vista previa */}
          <div className="card">
            <div className="card-hdr"><div className="card-ttl">Vista previa en documentos</div></div>
            <div className="card-bdy">
              <div style={{ border:"1px solid var(--out)", borderRadius:"var(--r-sm)", padding:"16px 20px", background:"var(--sur2)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12, paddingBottom:12, borderBottom:"2px solid var(--on-sur)" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:16 }}>{e.nombre||"Nombre de la Empresa"}</div>
                    <div style={{ fontSize:11, color:"var(--on-sur3)" }}>{e.slogan}</div>
                    <div style={{ fontSize:11, color:"var(--on-sur3)", marginTop:4 }}>{e.dir1}</div>
                    <div style={{ fontSize:11, color:"var(--on-sur3)" }}>{e.dir2}</div>
                    <div style={{ fontSize:11, color:"var(--on-sur3)" }}>{e.tel} · {e.email}</div>
                  </div>
                  <div style={{ width:60, height:40, background:"var(--sur3)", borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"var(--on-sur4)" }}>Logo</div>
                </div>
                <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>COTIZACIÓN</div>
                <div style={{ fontSize:11, color:"var(--on-sur4)" }}>RNC: {e.rnc||"0-00-00000-0"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── TAB NCF ──────────────────────────────────────────────────────────────
  function TabNCF() {
    const [editIdx, setEditIdx] = useState(null);
    const [editForm, setEditForm] = useState({});

    function openEdit(i) { setEditIdx(i); setEditForm({...cfg.ncf[i]}); }
    function saveEdit() {
      setCfg(c=>({ ...c, ncf: c.ncf.map((n,i)=>i===editIdx?{...editForm}:n) }));
      setEditIdx(null); setSaved(false); showToast("Serie NCF actualizada ✓");
    }
    function setDefault(serie) {
      setCfg(c=>({ ...c, ncf: c.ncf.map(n=>({...n, default: n.serie===serie})) }));
      setSaved(false);
    }

    const days = (fecha) => {
      const d = Math.ceil((new Date(fecha)-new Date())/86400000);
      return d;
    };

    return (
      <div>
        <div style={{ background:"var(--pri-lt)", border:"1px solid var(--pri-lt2)", borderRadius:"var(--r-sm)", padding:"10px 16px", marginBottom:16, fontSize:13, color:"var(--pri-dk)" }}>
          Los comprobantes fiscales son requeridos por la DGII. Configura las series según tu resolución de autorización.
        </div>

        <div className="card" style={{ marginBottom:16 }}>
          <div className="card-hdr"><div className="card-ttl">Series de Comprobantes Fiscales</div></div>
          <div className="twrap">
            <table>
              <thead>
                <tr>
                  <th>Serie</th><th>Tipo</th><th>Activo</th><th>Desde</th><th>Hasta</th>
                  <th>Actual</th><th>Caduca</th><th>Default</th><th>Fact.</th><th></th>
                </tr>
              </thead>
              <tbody>
                {cfg.ncf.map((n,i)=>{
                  const d = days(n.caduca);
                  const warn = d < 30 && d > 0;
                  const expired = d <= 0;
                  return (
                    <tr key={n.serie} style={{ opacity: n.activo ? 1 : 0.5 }}>
                      <td><span className="mono" style={{ fontWeight:700, color:"var(--pri)" }}>{n.serie}</span></td>
                      <td style={{ fontSize:13 }}>{n.nombre}</td>
                      <td>
                        <button onClick={()=>{ setCfg(c=>({...c,ncf:c.ncf.map((x,xi)=>xi===i?{...x,activo:!x.activo}:x)})); setSaved(false); }}
                          style={{ width:40,height:22,borderRadius:11,background:n.activo?"var(--sec)":"var(--sur3)",border:"none",cursor:"pointer",position:"relative",transition:"background .2s" }}>
                          <span style={{ position:"absolute",top:2,left:n.activo?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)" }}/>
                        </button>
                      </td>
                      <td className="mono" style={{ fontSize:12 }}>{n.desde.toLocaleString()}</td>
                      <td className="mono" style={{ fontSize:12 }}>{n.hasta.toLocaleString()}</td>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span className="mono" style={{ fontSize:12, fontWeight:600, color:"var(--pri)" }}>{n.actual.toLocaleString()}</span>
                          <div style={{ flex:1, height:4, background:"var(--sur3)", borderRadius:2, minWidth:60 }}>
                            <div style={{ height:"100%", width:`${(n.actual/n.hasta)*100}%`, background:"var(--sec)", borderRadius:2 }}/>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize:12, color:expired?"var(--err)":warn?"var(--warn)":"var(--on-sur3)", fontWeight: (warn||expired)?700:400 }}>
                          {expired?"⛔ Vencida":warn?`⚠ ${d}d`:n.caduca}
                        </span>
                      </td>
                      <td style={{ textAlign:"center" }}>
                        {n.default
                          ? <span className="chip chip-filled-sec" style={{ fontSize:10 }}>Default</span>
                          : n.activo && <button style={{ fontSize:11,padding:"3px 10px",background:"var(--sur3)",border:"1px solid var(--out)",borderRadius:20,cursor:"pointer",fontFamily:"inherit" }} onClick={()=>setDefault(n.serie)}>Set</button>
                        }
                      </td>
                      <td style={{ textAlign:"center" }}>
                        <span style={{ fontSize:16 }}>{n.imprime_fact?"✅":"—"}</span>
                      </td>
                      <td><button className="btn-sm-ghost" onClick={()=>openEdit(i)}>✏️</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Retención informal */}
        <div className="card">
          <div className="card-hdr"><div className="card-ttl">Otros parámetros fiscales</div></div>
          <div className="card-bdy">
            <FieldRow label="Retención proveedores informales" sub="% aplicado automáticamente en CxP de proveedores informales" value={cfg.retencion_informal} onChange={v=>setCfg(c=>({...c,retencion_informal:parseFloat(v)||0}))} type="number" min={0} max={100} step={0.5} suffix="%" width={80}/>
          </div>
        </div>

        {/* Edit modal */}
        {editIdx!==null && (
          <div className="modal-bd" onClick={e=>{ if(e.target===e.currentTarget){ setEditIdx(null); }}}>
            <div className="modal" style={{ maxWidth:500 }}>
              <div className="modal-hdr">
                <div className="modal-ttl">Editar serie {editForm.serie} — {editForm.nombre}</div>
                <button className="icon-btn" onClick={()=>setEditIdx(null)}>✕</button>
              </div>
              <div className="modal-bdy">
                <div className="fgrid f2" style={{ gap:13 }}>
                  <div className="fld"><label>Número desde</label><input type="number" min="1" value={editForm.desde} onChange={e=>setEditForm(f=>({...f,desde:parseInt(e.target.value)||1}))}/></div>
                  <div className="fld"><label>Número hasta</label><input type="number" min="1" value={editForm.hasta} onChange={e=>setEditForm(f=>({...f,hasta:parseInt(e.target.value)||1}))}/></div>
                  <div className="fld"><label>Número actual</label><input type="number" min="1" value={editForm.actual} onChange={e=>setEditForm(f=>({...f,actual:parseInt(e.target.value)||1}))}/></div>
                  <div className="fld"><label>Fecha de caducidad</label><input type="date" value={editForm.caduca} onChange={e=>setEditForm(f=>({...f,caduca:e.target.value}))}/></div>
                  <div className="fld" style={{ gridColumn:"1/-1" }}>
                    <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
                      <input type="checkbox" checked={editForm.imprime_fact} onChange={e=>setEditForm(f=>({...f,imprime_fact:e.target.checked}))}/>
                      Usar en facturas de venta
                    </label>
                  </div>
                </div>
                <div style={{ marginTop:12, background:"var(--sur2)", borderRadius:"var(--r-sm)", padding:"10px 14px", fontSize:12, color:"var(--on-sur3)" }}>
                  Progreso: <b>{editForm.actual}</b> de <b>{editForm.hasta}</b> — quedan <b>{Math.max(0,editForm.hasta-editForm.actual).toLocaleString()}</b> comprobantes
                </div>
              </div>
              <div className="modal-ftr">
                <button className="btn btn-text" onClick={()=>setEditIdx(null)}>Cancelar</button>
                <button className="btn btn-filled" onClick={saveEdit}>Guardar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── TAB COTIZACIONES ─────────────────────────────────────────────────────
  function TabCotizaciones() {
    const c = cfg.cot;
    const sc = (k,v) => set("cot", k, v);
    const BASES = { costo:"Costo", distrib:"Distribuidores", barra:"Barra/Plancha", fab:"Fabricante" };
    const levels = [
      { key:"distrib",  label:"Distribuidores",  pct_k:"precio_distrib_pct",  base_k:"precio_distrib_base",  desc_k:"desc_max_distrib",  base_opts:["costo"] },
      { key:"barra",    label:"Barra/Plancha",    pct_k:"precio_barra_pct",    base_k:"precio_barra_base",    desc_k:"desc_max_barra",    base_opts:["costo","distrib"] },
      { key:"fab",      label:"Fabricante",       pct_k:"precio_fab_pct",      base_k:"precio_fab_base",      desc_k:"desc_max_fab",      base_opts:["costo","distrib","barra"] },
      { key:"proyecto", label:"Proyecto",         pct_k:"precio_proyecto_pct", base_k:"precio_proyecto_base", desc_k:"desc_max_proyecto", base_opts:["costo","distrib","barra","fab"] },
    ];

    return (
      <div>
        {/* Price levels */}
        <div className="card" style={{ marginBottom:16 }}>
          <div className="card-hdr"><div className="card-ttl">Niveles de Precio y Márgenes</div></div>
          <div className="card-bdy" style={{ padding:0 }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"var(--sur2)" }}>
                  {["Nivel","Calculado sobre","Aumenta un","Descuento máximo"].map(h=>(
                    <th key={h} style={{ padding:"10px 16px", fontSize:11, textTransform:"uppercase", letterSpacing:1, color:"var(--on-sur3)", textAlign:"left", fontWeight:700, borderBottom:"1px solid var(--out)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {levels.map((lv,i)=>(
                  <tr key={lv.key} style={{ borderBottom:"1px solid var(--out)" }}>
                    <td style={{ padding:"12px 16px", fontWeight:600, fontSize:14 }}>{lv.label}</td>
                    <td style={{ padding:"12px 16px" }}>
                      <select value={c[lv.base_k]} onChange={e=>sc(lv.base_k,e.target.value)} style={{ padding:"5px 10px", border:"1px solid var(--out)", borderRadius:"var(--r-sm)", background:"var(--sur)", fontFamily:"inherit", fontSize:13, outline:"none" }}>
                        {lv.base_opts.map(b=><option key={b} value={b}>{BASES[b]}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <input type="number" min="0" max="999" value={c[lv.pct_k]} onChange={e=>sc(lv.pct_k,parseFloat(e.target.value)||0)}
                          style={{ width:72, padding:"5px 8px", border:"1.5px solid var(--pri)", borderRadius:"var(--r-sm)", fontFamily:"JetBrains Mono,monospace", fontSize:13, textAlign:"right", background:"var(--sur)", outline:"none", color:"var(--pri)", fontWeight:700 }}/>
                        <span style={{ fontSize:13, color:"var(--on-sur3)" }}>%</span>
                      </div>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <input type="number" min="0" max="100" value={c[lv.desc_k]} onChange={e=>sc(lv.desc_k,parseFloat(e.target.value)||0)}
                          style={{ width:72, padding:"5px 8px", border:"1px solid var(--out)", borderRadius:"var(--r-sm)", fontFamily:"JetBrains Mono,monospace", fontSize:13, textAlign:"right", background:"var(--sur)", outline:"none" }}/>
                        <span style={{ fontSize:13, color:"var(--on-sur3)" }}>%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Políticas */}
        <div className="card">
          <div className="card-hdr"><div className="card-ttl">Políticas de Cotización</div></div>
          <div className="card-bdy">
            <Toggle value={c.cotizar_inv_negativo}        onChange={v=>sc("cotizar_inv_negativo",v)}        label="Cotizar aunque el inventario esté en negativo"/>
            <Toggle value={c.impuestos_transparentados}   onChange={v=>sc("impuestos_transparentados",v)}   label="Mostrar impuestos transparentados por defecto"/>
            <Toggle value={c.cliente_final_defecto}       onChange={v=>sc("cliente_final_defecto",v)}       label="Consumidor Final como cliente predeterminado"/>
            <Toggle value={c.clave_por_cotizacion}        onChange={v=>sc("clave_por_cotizacion",v)}        label="Solicitar clave antes de crear cada cotización"/>
            <Toggle value={c.mantener_precios_al_copiar}  onChange={v=>sc("mantener_precios_al_copiar",v)}  label="Al copiar una cotización, mantener los precios originales"/>
            <Toggle value={c.acumular_cantidades}         onChange={v=>sc("acumular_cantidades",v)}         label="Acumular cantidades de artículos repetidos"/>
            <Toggle value={c.prefacturacion}              onChange={v=>sc("prefacturacion",v)}              label="Usar sistema de pre-facturación"/>
            <Toggle value={c.huecos_iguales_detallados}   onChange={v=>sc("huecos_iguales_detallados",v)}   label="Huecos iguales en proyectos: detallar individualmente"/>
            <Toggle value={c.copiar_descuentos}           onChange={v=>sc("copiar_descuentos",v)}           label="Copiar descuentos al duplicar cotización"/>
            <Toggle value={c.cambiar_precio_por_cliente}  onChange={v=>sc("cambiar_precio_por_cliente",v)}  label="Cambiar nivel de precio al cambiar tipo de cliente" sub="El precio se ajusta automáticamente según si el cliente es Distribuidor, Fabricante, etc."/>
          </div>
        </div>
      </div>
    );
  }

  // ── TAB FACTURACIÓN ──────────────────────────────────────────────────────
  function TabFacturacion() {
    const f = cfg.fact;
    const sf = (k,v) => set("fact", k, v);
    return (
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Impuestos */}
        <div>
          <div className="card" style={{ marginBottom:16 }}>
            <div className="card-hdr"><div className="card-ttl">Impuestos</div></div>
            <div className="card-bdy">
              <div className="fgrid f2" style={{ gap:13, marginBottom:12 }}>
                <div className="fld"><label>Nombre del impuesto</label><input value={f.itbis_nombre} onChange={e=>sf("itbis_nombre",e.target.value)}/></div>
                <div className="fld"><label>Porcentaje</label>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <input type="number" min="0" max="100" step="0.5" value={f.itbis_pct} onChange={e=>sf("itbis_pct",parseFloat(e.target.value)||0)} style={{ fontFamily:"JetBrains Mono,monospace", fontSize:15, fontWeight:700, color:"var(--pri)" }}/>
                    <span style={{ fontSize:14 }}>%</span>
                  </div>
                </div>
              </div>
              <div style={{ background:"var(--sec-lt)", borderRadius:"var(--r-sm)", padding:"10px 14px", fontSize:12, color:"var(--sec-dk)" }}>
                {f.itbis_nombre} {f.itbis_pct}% — sobre el subtotal de facturas gravadas
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom:16 }}>
            <div className="card-hdr"><div className="card-ttl">Comisiones de ventas</div></div>
            <div className="card-bdy">
              <div style={{ fontSize:12, color:"var(--on-sur4)", marginBottom:12 }}>Define rangos de ventas y el % de comisión correspondiente</div>
              <div className="fgrid f2" style={{ gap:12 }}>
                {[1,2].map(n=>(
                  <div key={n} style={{ background:"var(--sur2)", borderRadius:"var(--r-sm)", padding:"12px 14px" }}>
                    <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:"var(--on-sur3)", marginBottom:8 }}>Rango {n}</div>
                    <div className="fld" style={{ marginBottom:8 }}><label>Desde</label>
                      <input type="number" value={f[`com_de${n}`]} onChange={e=>sf(`com_de${n}`,parseFloat(e.target.value)||0)} style={{ fontFamily:"JetBrains Mono,monospace" }}/>
                    </div>
                    {n===1&&<div className="fld" style={{ marginBottom:8 }}><label>Hasta</label><input type="number" value={f[`com_a${n}`]} onChange={e=>sf(`com_a${n}`,parseFloat(e.target.value)||0)} style={{ fontFamily:"JetBrains Mono,monospace" }}/></div>}
                    <div className="fld"><label>Comisión %</label>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <input type="number" min="0" max="100" step="0.5" value={f[`com_pct${n}`]} onChange={e=>sf(`com_pct${n}`,parseFloat(e.target.value)||0)} style={{ fontFamily:"JetBrains Mono,monospace", fontWeight:700, color:"var(--pri)" }}/>
                        <span>%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-hdr"><div className="card-ttl">Costeo de artículos</div></div>
            <div className="card-bdy">
              <div className="fld" style={{ marginBottom:12 }}>
                <label>Método de costeo</label>
                <select value={f.costeo} onChange={e=>sf("costeo",e.target.value)}>
                  <option value="ultimo">Último costo</option>
                  <option value="promedio">Costo promedio</option>
                  <option value="tarifa">Tarifa fija</option>
                </select>
              </div>
              <FieldRow label="% mínimo de beneficio en ventas" value={f.pct_min_beneficio} onChange={v=>sf("pct_min_beneficio",parseFloat(v)||0)} type="number" min={0} max={100} step={0.5} suffix="%" width={80}/>
              <FieldRow label="% estimado costo de servicios"   value={f.pct_costo_servicios} onChange={v=>sf("pct_costo_servicios",parseFloat(v)||0)} type="number" min={0} max={100} step={0.5} suffix="%" width={80}/>
            </div>
          </div>
        </div>

        {/* Políticas */}
        <div>
          <div className="card" style={{ marginBottom:16 }}>
            <div className="card-hdr"><div className="card-ttl">Políticas de Facturación</div></div>
            <div className="card-bdy">
              <Toggle value={f.facturar_credito}           onChange={v=>sf("facturar_credito",v)}           label="Permitir facturar a crédito"/>
              <Toggle value={f.facturar_inv_negativo}      onChange={v=>sf("facturar_inv_negativo",v)}      label="Facturar aunque el inventario esté en negativo"/>
              <Toggle value={f.facturar_clientes_vencidos} onChange={v=>sf("facturar_clientes_vencidos",v)} label="Facturar a clientes con facturas vencidas"/>
              <Toggle value={f.liberar_automatico}         onChange={v=>sf("liberar_automatico",v)}         label="Liberar facturas automáticamente según límite de crédito"/>
              <Toggle value={f.sugerir_nc_recibos}         onChange={v=>sf("sugerir_nc_recibos",v)}         label="Sugerir notas de crédito y recibos no aplicados al facturar"/>
              <FieldRow label="Días de corte para devoluciones" value={f.dia_corte_devoluciones} onChange={v=>sf("dia_corte_devoluciones",parseInt(v)||0)} type="number" min={0} max={365} suffix="días" width={80}/>
            </div>
          </div>

          <div className="card">
            <div className="card-hdr"><div className="card-ttl">Caja y Punto de Venta</div></div>
            <div className="card-bdy">
              <Toggle value={f.usa_modulo_caja}   onChange={v=>sf("usa_modulo_caja",v)}   label="Usar módulo de caja" sub="Habilita el cierre diario y arqueo de billetes"/>
              <Toggle value={f.usa_comp_fiscal}   onChange={v=>sf("usa_comp_fiscal",v)}   label="Usar comprobantes fiscales"/>
              <Toggle value={f.clave_para_caja}   onChange={v=>sf("clave_para_caja",v)}   label="Requerir clave para enviar a caja"/>
              <Toggle value={f.impresora_fiscal}  onChange={v=>sf("impresora_fiscal",v)}  label="Utiliza impresora fiscal" sub="Activa integración con impresora fiscal DGII"/>
              <Toggle value={f.modo_retail}       onChange={v=>sf("modo_retail",v)}       label="Modo retail / punto de venta" sub="Interfaz simplificada para ventas rápidas"/>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── TAB PRODUCCIÓN ───────────────────────────────────────────────────────
  function TabProduccion() {
    const p = cfg.prod;
    const sp = (k,v) => set("prod", k, v);
    return (
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div>
          <div className="card" style={{ marginBottom:16 }}>
            <div className="card-hdr"><div className="card-ttl">Parámetros generales</div></div>
            <div className="card-bdy">
              <FieldRow label="Tiempo de espera para entrega" sub="Días adicionales al tiempo de producción" value={p.tiempo_espera_dias} onChange={v=>sp("tiempo_espera_dias",parseInt(v)||0)} type="number" min={0} suffix="días" width={80}/>
              <Toggle value={p.produccion_por_lotes} onChange={v=>sp("produccion_por_lotes",v)} label="Producción por lotes" sub="Agrupa órdenes para producción en batch"/>
              <Toggle value={p.desglose_auto}        onChange={v=>sp("desglose_auto",v)}        label="Desglose automático al enviar a producción"/>
              <Toggle value={p.generar_tickets}      onChange={v=>sp("generar_tickets",v)}      label="Generar tickets de producción automáticamente"/>
              <FieldRow label="Precisión para el desglose" value={p.precision_desglose} onChange={v=>sp("precision_desglose",parseInt(v)||2)} type="number" min={0} max={4} suffix="decimales" width={80}/>
            </div>
          </div>

          <div className="card">
            <div className="card-hdr"><div className="card-ttl">Manejo de desperdicios</div></div>
            <div className="card-bdy">
              <FieldRow label="Desperdicio vidrio cuadrado"  value={p.desperdicio_vidrio_cuadrado} onChange={v=>sp("desperdicio_vidrio_cuadrado",parseFloat(v)||0)} type="number" min={0} step={0.5} suffix="pulg." width={80}/>
              <FieldRow label="Desperdicio vidrio redondo"   value={p.desperdicio_vidrio_redondo}  onChange={v=>sp("desperdicio_vidrio_redondo",parseFloat(v)||0)}  type="number" min={0} step={0.5} suffix="pulg." width={80}/>
              <FieldRow label="% adicional de desperdicio"   value={p.desperdicio_pct_adicional}   onChange={v=>sp("desperdicio_pct_adicional",parseFloat(v)||0)}   type="number" min={0} max={50} step={0.5} suffix="%" width={80}/>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom:16 }}>
            <div className="card-hdr"><div className="card-ttl">Autorizadores de producción</div></div>
            <div className="card-bdy">
              <div style={{ fontSize:12, color:"var(--on-sur4)", marginBottom:12 }}>
                Define quiénes pueden autorizar órdenes de producción. Los usuarios deben existir en el sistema.
              </div>
              {[1,2].map(n=>(
                <div key={n} className="fld" style={{ marginBottom:12 }}>
                  <label>Autorizador {n}</label>
                  <input value={p[`autorizador_${n}`]} onChange={e=>sp(`autorizador_${n}`,e.target.value)} placeholder="Nombre del usuario autorizador"/>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-hdr"><div className="card-ttl">Inventario y órdenes de compra</div></div>
            <div className="card-bdy">
              <Toggle value={p.ajustes_en_recibo}          onChange={v=>sp("ajustes_en_recibo",v)}          label="Permitir ajustar costos al recibir OC" sub="El usuario puede cambiar el costo real vs. el costo de la OC"/>
              <Toggle value={p.salida_inv_auto}             onChange={v=>sp("salida_inv_auto",v)}             label="Salida de inventario automática al producir"/>
              <Toggle value={p.eliminar_salidas_al_anular}  onChange={v=>sp("eliminar_salidas_al_anular",v)}  label="Eliminar salidas de inventario al anular una orden"/>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  const TABS = [
    { id:"empresa",      label:"🏢 Empresa" },
    { id:"ncf",          label:"🏛️ Comprobantes NCF" },
    { id:"cotizaciones", label:"📋 Cotizaciones" },
    { id:"facturacion",  label:"🧾 Facturación" },
    { id:"produccion",   label:"🏭 Producción" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:14, color:"var(--on-sur3)" }}>Parámetros globales del sistema — aplican a toda la empresa</div>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {!saved && <span style={{ fontSize:12, color:"var(--warn)", fontWeight:600 }}>● Cambios sin guardar</span>}
          {saved  && <span style={{ fontSize:12, color:"var(--sec)", fontWeight:600 }}>✓ Guardado</span>}
          <button className="btn btn-filled" onClick={saveAll}>💾 Guardar configuración</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="seg-tabs" style={{ marginBottom:20 }}>
        {TABS.map(t=>(
          <button key={t.id} className={"seg-tab"+(tab===t.id?" on":"")} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab==="empresa"      && <TabEmpresa/>}
      {tab==="ncf"          && <TabNCF/>}
      {tab==="cotizaciones" && <TabCotizaciones/>}
      {tab==="facturacion"  && <TabFacturacion/>}
      {tab==="produccion"   && <TabProduccion/>}

      {toast && <div className="toast-msg">{toast}</div>}
    </div>
  );
}
