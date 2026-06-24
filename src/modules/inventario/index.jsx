/**
 * INVENTARIO - Tab Materiales integrado con Supabase via backend.
 * Tabs:
 *  1. Materiales      - CRUD real contra /api/materiales
 *  2. Productos       - (mock por ahora; backend /api/productos listo, se conecta luego)
 *  3. Almacenes       - (mock; requiere tabla nueva)
 *  4. Inventario Fis. - (mock; requiere tabla movimientos)
 *
 * Field mapping materiales (DB <- mock):
 *   categoria <- cat ; costo_barra <- costo ; venta_barra <- p_distrib ; venta_pie <- p_barra
 *   (stock, minimo, maximo, depto, color, peso, barras, activo, notas son columnas directas)
 */
import { useState, useEffect } from "react";
import { getMateriales, createMaterial, updateMaterial, deleteMaterial } from "../../api.js";

function fmtRD(n)   { return `RD$${Math.round(n||0).toLocaleString("es-DO")}`; }
function r2(n)      { return Math.round((n||0)*100)/100; }
function today()    { return new Date().toISOString().slice(0,10); }

const CATEGORIAS = ["Perfiles de Marco","Perfiles de Hoja","Rieles","Vidrios","Herrajes","Accesorios","Insumos","Otros"];
const DEPTOS     = ["HE — Herrajes","VE — Ventanas","PU — Puertas","PE — Persianas","VI — Vidrios","IN — Insumos"];
const UNIDADES   = ["Barra 20p","Barra 21p","Unidad","Pie²","Pie lineal","Rollo","Caja","Kg","Litro"];
const COLORES    = ["Natural","LBCO","BCE","Karatachi","Negro","Mill Finish","Blanco"];

// Normaliza una fila de materiales (DB) al shape que usa el front (con cat/costo/p_distrib/p_barra alias)
function normalizeMat(m) {
  return {
    ...m,
    codigo: m.codigo || "",
    nombre: m.nombre || "",
    cat: m.categoria || "Otros",
    depto: m.depto || "VE — Ventanas",
    unidad: m.unidad || "Unidad",
    color: m.color || "—",
    stock: Number(m.stock) || 0,
    minimo: Number(m.minimo) || 0,
    maximo: Number(m.maximo) || 0,
    costo: Number(m.costo_barra) || 0,
    p_distrib: Number(m.venta_barra) || 0,
    p_barra: Number(m.venta_pie) || 0,
    peso: Number(m.peso) || 0,
    barras: Number(m.barras) || 0,
    activo: m.activo !== false,
    notas: m.notas || "",
  };
}

// Convierte el form del front al payload de columnas reales de la tabla materiales
function matToPayload(f) {
  return {
    codigo: f.codigo,
    nombre: f.nombre,
    categoria: f.cat || null,
    depto: f.depto || null,
    unidad: f.unidad || null,
    color: f.color || null,
    stock: Number(f.stock) || 0,
    minimo: Number(f.minimo) || 0,
    maximo: Number(f.maximo) || 0,
    costo_barra: Number(f.costo) || 0,
    venta_barra: Number(f.p_distrib) || 0,
    venta_pie: Number(f.p_barra) || 0,
    peso: Number(f.peso) || 0,
    barras: Number(f.barras) || 0,
    activo: !!f.activo,
    notas: f.notas || null,
  };
}

// ── Demo data para los tabs aun no conectados (Productos/Almacenes/Fisico) ────
const DEMO_PRODUCTOS = [
  { id:1, codigo:"VCRCOF", nombre:"Ventana Corrediza Tradicional", tipo:"Ventana", activo:true,
    descripcion:"Ventana corrediza de 2 hojas", notas:"",
    receta:[] },
];
const DEMO_ALMACENES = [
  { id:1, codigo:"ALM-01", nombre:"Almacén Principal", ubicacion:"Planta baja", responsable:"—", principal:true, activo:true },
];
const DEMO_MOVIMIENTOS = [];

function stockStatus(m) {
  if (m.stock <= 0)          return { label:"Sin stock",   cls:"chip-filled-err",  color:"var(--err)" };
  if (m.stock < m.minimo)    return { label:"Bajo mínimo", cls:"chip-filled-warn", color:"var(--warn)" };
  if (m.maximo && m.stock > m.maximo) return { label:"Sobre máximo", cls:"chip-filled-pri", color:"var(--pri)" };
  return                            { label:"Normal",      cls:"chip-filled-sec",  color:"var(--sec)" };
}

// ===============================================================================
export default function Inventario() {
  const [tab, setTab] = useState("materiales");
  const [toast, setToast] = useState("");
  function showToast(msg){ setToast(msg); setTimeout(()=>setToast(""),2600); }

  const TABS=[
    {id:"materiales", label:"📦 Materiales"},
    {id:"productos",  label:"🏗️ Productos / Recetas"},
    {id:"almacenes",  label:"🏭 Almacenes"},
    {id:"fisico",     label:"📋 Inventario Físico"},
  ];

  return(
    <div>
      <div className="seg-tabs" style={{marginBottom:20}}>
        {TABS.map(t=>(
          <button key={t.id} className={"seg-tab"+(tab===t.id?" on":"")} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab==="materiales" && <TabMateriales showToast={showToast}/>}
      {tab==="productos"  && <TabPlaceholder titulo="Productos / Recetas" nota="Backend listo (/api/productos). Se conecta en el siguiente paso."/>}
      {tab==="almacenes"  && <TabPlaceholder titulo="Almacenes" nota="Requiere crear la tabla 'almacenes' en Supabase."/>}
      {tab==="fisico"     && <TabPlaceholder titulo="Inventario Físico" nota="Requiere crear la tabla 'movimientos' en Supabase."/>}

      {toast&&<div className="toast-msg">{toast}</div>}
    </div>
  );
}

function TabPlaceholder({ titulo, nota }) {
  return (
    <div style={{textAlign:"center",padding:"64px 24px",color:"var(--on-sur4)"}}>
      <div style={{fontSize:40,marginBottom:12}}>🚧</div>
      <div style={{fontWeight:700,fontSize:18,marginBottom:6}}>{titulo}</div>
      <div style={{fontSize:13,maxWidth:420,margin:"0 auto"}}>{nota}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB MATERIALES - conectado a Supabase
// ════════════════════════════════════════════════════════════════════════════
function TabMateriales({ showToast }) {
  const [materiales, setMats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [view, setView]       = useState("list");
  const [form, setForm]       = useState(null);
  const [saving, setSaving]   = useState(false);
  const [q, setQ]             = useState("");
  const [filtCat, setFiltCat] = useState("todas");
  const [filtEst, setFiltEst] = useState("todos");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getMateriales();
        if (alive) setMats((data || []).map(normalizeMat));
      } catch (e) {
        if (alive) setError(e.message || "No se pudieron cargar los materiales.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const bajoMin   = materiales.filter(m=>m.activo&&m.stock<m.minimo).length;
  const sinStock  = materiales.filter(m=>m.activo&&m.stock<=0).length;
  const valorInv  = materiales.reduce((s,m)=>s+m.stock*m.costo,0);

  function goList(){ setView("list"); setForm(null); }
  function openNew() {
    setForm({ id:null, codigo:"", nombre:"", cat:"Perfiles de Marco", depto:"VE — Ventanas", unidad:"Barra 21p", color:"Natural", stock:0, minimo:0, maximo:0, costo:0, p_distrib:0, p_barra:0, peso:0, barras:21, activo:true, notas:"" });
    setView("form-mat");
  }
  function openEdit(m){ setForm({...m}); setView("form-mat"); }

  async function saveMat() {
    if(!form.nombre.trim()||!form.codigo.trim()) return;
    setSaving(true);
    try {
      const payload = matToPayload(form);
      if (form.id) {
        const updated = await updateMaterial(form.id, payload);
        setMats(ms => ms.map(m => m.id===form.id ? normalizeMat(updated) : m));
      } else {
        const created = await createMaterial(payload);
        setMats(ms => [...ms, normalizeMat(created)]);
      }
      goList(); showToast("Material guardado ✓");
    } catch (e) {
      showToast("Error: " + (e.message || "no se pudo guardar"));
    } finally {
      setSaving(false);
    }
  }

  async function removeMat(m) {
    if (!window.confirm(`¿Eliminar "${m.nombre}" permanentemente?`)) return;
    try {
      await deleteMaterial(m.id);
      setMats(ms => ms.filter(x => x.id !== m.id));
      goList(); showToast("Material eliminado");
    } catch (e) {
      showToast("Error: " + (e.message || "no se pudo eliminar"));
    }
  }

  const filtered = materiales.filter(m=>{
    const mq  = m.nombre.toLowerCase().includes(q.toLowerCase()) || m.codigo.toLowerCase().includes(q.toLowerCase());
    const mc  = filtCat==="todas" || m.cat===filtCat;
    const ms  = filtEst==="todos" || (filtEst==="bajo"&&m.stock<m.minimo&&m.stock>0) || (filtEst==="sin"&&m.stock<=0) || (filtEst==="normal"&&m.stock>=m.minimo);
    return mq&&mc&&ms;
  });

  // FORM
  if(view==="form-mat"&&form) return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
        <button className="btn btn-text" onClick={goList}>← Materiales</button>
        <div style={{fontSize:20,fontWeight:700}}>{form.id?"Editar material":"Nuevo material"}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:20,alignItems:"start"}}>
        <div>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-hdr"><div className="card-ttl">Identificación</div></div>
            <div className="card-bdy">
              <div className="fgrid f2" style={{gap:14}}>
                <div className="fld"><label>Código *</label><input value={form.codigo} onChange={e=>setForm(f=>({...f,codigo:e.target.value}))} placeholder="GK-40-N" autoFocus/></div>
                <div className="fld"><label>Estado</label>
                  <select value={form.activo?"activo":"inactivo"} onChange={e=>setForm(f=>({...f,activo:e.target.value==="activo"}))}>
                    <option value="activo">Activo</option><option value="inactivo">Inactivo</option>
                  </select>
                </div>
                <div className="fld" style={{gridColumn:"1/-1"}}><label>Nombre / Descripción *</label><input value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))} placeholder="Lateral Marco GK-40 Natural"/></div>
                <div className="fld"><label>Categoría</label>
                  <select value={form.cat} onChange={e=>setForm(f=>({...f,cat:e.target.value}))}>{CATEGORIAS.map(c=><option key={c}>{c}</option>)}</select>
                </div>
                <div className="fld"><label>Departamento</label>
                  <select value={form.depto} onChange={e=>setForm(f=>({...f,depto:e.target.value}))}>{DEPTOS.map(d=><option key={d}>{d}</option>)}</select>
                </div>
                <div className="fld"><label>Unidad de medida</label>
                  <select value={form.unidad} onChange={e=>setForm(f=>({...f,unidad:e.target.value}))}>{UNIDADES.map(u=><option key={u}>{u}</option>)}</select>
                </div>
                <div className="fld"><label>Color / Material</label>
                  <select value={form.color} onChange={e=>setForm(f=>({...f,color:e.target.value}))}>{["—",...COLORES].map(c=><option key={c}>{c}</option>)}</select>
                </div>
                <div className="fld"><label>Peso por unidad (kg)</label><input type="number" step="0.01" value={form.peso} onChange={e=>setForm(f=>({...f,peso:parseFloat(e.target.value)||0}))}/></div>
                <div className="fld"><label>Longitud estándar (pies)</label><input type="number" value={form.barras} onChange={e=>setForm(f=>({...f,barras:parseFloat(e.target.value)||0}))}/></div>
                <div className="fld" style={{gridColumn:"1/-1"}}><label>Notas</label><textarea value={form.notas} onChange={e=>setForm(f=>({...f,notas:e.target.value}))} style={{background:"var(--sur2)",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",padding:"8px 12px",fontFamily:"inherit",fontSize:13,color:"var(--on-sur)",outline:"none",width:"100%",resize:"vertical",minHeight:56}}/></div>
              </div>
            </div>
          </div>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-hdr"><div className="card-ttl">Stock</div></div>
            <div className="card-bdy">
              <div className="fgrid f2" style={{gap:14}}>
                <div className="fld"><label>Stock actual</label><input type="number" value={form.stock} onChange={e=>setForm(f=>({...f,stock:parseFloat(e.target.value)||0}))} style={{fontFamily:"JetBrains Mono,monospace",fontWeight:700,fontSize:16}}/></div>
                <div className="fld"><label>Stock mínimo (alerta)</label><input type="number" value={form.minimo} onChange={e=>setForm(f=>({...f,minimo:parseFloat(e.target.value)||0}))}/></div>
                <div className="fld"><label>Stock máximo</label><input type="number" value={form.maximo} onChange={e=>setForm(f=>({...f,maximo:parseFloat(e.target.value)||0}))}/></div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr"><div className="card-ttl">Precios</div></div>
            <div className="card-bdy">
              <div className="fgrid f2" style={{gap:14}}>
                {[["costo","Costo"],["p_distrib","Precio Distribuidor"],["p_barra","Precio Barra/Plancha"]].map(([k,l])=>(
                  <div key={k} className="fld"><label>{l} (RD$)</label><input type="number" value={form[k]} onChange={e=>setForm(f=>({...f,[k]:parseFloat(e.target.value)||0}))} style={{fontFamily:"JetBrains Mono,monospace"}}/></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{position:"sticky",top:80}}>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-bdy">
              {[["Código",form.codigo||"—"],["Categoría",form.cat],["Unidad",form.unidad],["Stock",form.stock],["Mínimo",form.minimo],["Costo",fmtRD(form.costo)],["Valor total",fmtRD(form.stock*form.costo)]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid var(--out)",fontSize:12}}>
                  <span style={{color:"var(--on-sur3)"}}>{l}</span><span style={{fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-filled" style={{width:"100%",marginBottom:8}} onClick={saveMat} disabled={!form.nombre.trim()||!form.codigo.trim()||saving}>{saving?"Guardando…":"Guardar"}</button>
          {form.id&&<button className="btn btn-outlined" style={{width:"100%",marginBottom:8,borderColor:"var(--err)",color:"var(--err)"}} onClick={()=>removeMat(form)}>🗑 Eliminar</button>}
          <button className="btn btn-text" style={{width:"100%"}} onClick={goList}>Cancelar</button>
        </div>
      </div>
    </div>
  );

  // LIST
  if (loading) return <div style={{textAlign:"center",padding:"60px 0",color:"var(--on-sur3)"}}>Cargando materiales…</div>;
  if (error)   return <div style={{textAlign:"center",padding:"48px 24px",color:"var(--err)"}}><div style={{fontSize:32,marginBottom:8}}>⚠️</div><div style={{fontWeight:600}}>No se pudieron cargar los materiales</div><div style={{fontSize:13,color:"var(--on-sur3)",marginTop:6}}>{error}</div></div>;

  return(
    <div>
      <div className="stats-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        {[
          {l:"Materiales",      n:materiales.filter(m=>m.activo).length, i:"📦", bg:"var(--sur3)"},
          {l:"Sin stock",       n:sinStock,  i:"⛔", bg:sinStock>0?"#fce8e6":"var(--sec-lt)"},
          {l:"Bajo mínimo",     n:bajoMin,   i:"⚠️",  bg:bajoMin>0?"#fef7e0":"var(--sec-lt)"},
          {l:"Valor inventario",n:fmtRD(valorInv), i:"💰", bg:"var(--sec-lt)"},
        ].map(s=>(
          <div key={s.l} className="stat-card">
            <div className="stat-icon-wrap" style={{background:s.bg}}>{s.i}</div>
            <div className="stat-num" style={{fontSize:typeof s.n==="string"?16:28}}>{s.n}</div>
            <div className="stat-lbl">{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
        <div className="sbar" style={{flex:1,minWidth:180}}>
          <span style={{color:"var(--on-sur4)"}}>🔍</span>
          <input placeholder="Buscar por código o nombre..." value={q} onChange={e=>setQ(e.target.value)}/>
          {q&&<button style={{background:"none",border:"none",cursor:"pointer",color:"var(--on-sur4)",fontSize:16}} onClick={()=>setQ("")}>✕</button>}
        </div>
        <select style={{padding:"8px 10px",borderRadius:"var(--rfull)",border:"1px solid var(--out)",background:"var(--sur)",fontFamily:"inherit",fontSize:12,outline:"none"}} value={filtCat} onChange={e=>setFiltCat(e.target.value)}>
          <option value="todas">Todas las categorías</option>
          {CATEGORIAS.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select style={{padding:"8px 10px",borderRadius:"var(--rfull)",border:"1px solid var(--out)",background:"var(--sur)",fontFamily:"inherit",fontSize:12,outline:"none"}} value={filtEst} onChange={e=>setFiltEst(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="sin">Sin stock</option>
          <option value="bajo">Bajo mínimo</option>
          <option value="normal">Normal</option>
        </select>
        <button className="btn btn-filled" onClick={openNew}>＋ Nuevo Material</button>
      </div>

      <div className="card"><div className="twrap"><table>
        <thead><tr><th>Código</th><th>Material</th><th>Categoría</th><th>Unidad</th><th>Stock</th><th>Mín/Máx</th><th>Costo</th><th>Valor</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          {filtered.length===0&&<tr><td colSpan={10} style={{textAlign:"center",padding:48,color:"var(--on-sur4)"}}><div style={{fontSize:32,marginBottom:8}}>📦</div>Sin materiales</td></tr>}
          {filtered.map(m=>{
            const st=stockStatus(m);
            const pct=m.maximo>0?Math.min(r2(m.stock/m.maximo*100),100):m.minimo>0?Math.min(r2(m.stock/m.minimo*100),200):50;
            return(
              <tr key={m.id} style={{opacity:m.activo?1:0.5}}>
                <td><span className="mono" style={{fontWeight:700,color:"var(--pri)",fontSize:12}}>{m.codigo}</span></td>
                <td>
                  <div style={{fontWeight:500,fontSize:13}}>{m.nombre}</div>
                  <div style={{fontSize:11,color:"var(--on-sur4)"}}>{m.depto}</div>
                </td>
                <td style={{fontSize:12,color:"var(--on-sur3)"}}>{m.cat}</td>
                <td style={{fontSize:12}}>{m.unidad}</td>
                <td>
                  <div className="mono" style={{fontWeight:700,fontSize:15,color:st.color}}>{m.stock}</div>
                  <div style={{width:60,height:4,background:"var(--sur3)",borderRadius:2,marginTop:3}}>
                    <div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:st.color,borderRadius:2}}/>
                  </div>
                </td>
                <td style={{fontSize:12,color:"var(--on-sur3)"}} className="mono">{m.minimo} / {m.maximo||"∞"}</td>
                <td className="mono" style={{fontSize:13}}>{fmtRD(m.costo)}</td>
                <td><span className="mono" style={{fontWeight:600,color:"var(--sec)"}}>{fmtRD(m.stock*m.costo)}</span></td>
                <td><span className={`chip ${st.cls}`} style={{fontSize:10}}>{st.label}</span></td>
                <td><button className="btn-sm-ghost" onClick={()=>openEdit(m)} title="Editar">✏️</button></td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
        <div style={{padding:"10px 20px",borderTop:"1px solid var(--out)",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13}}>
          <span style={{color:"var(--on-sur3)"}}>{filtered.length} material(es)</span>
          <span>Valor total: <span className="mono" style={{fontWeight:700,color:"var(--sec)"}}>{fmtRD(filtered.reduce((s,m)=>s+m.stock*m.costo,0))}</span></span>
        </div>
      </div>
    </div>
  );
}
