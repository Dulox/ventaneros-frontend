/**
 * INVENTARIO EXPANDIDO
 * 4 tabs:
 *  1. Materiales      — CRUD, stock, precios, alertas mín/máx
 *  2. Productos       — ventanas/puertas con receta de materiales
 *  3. Almacenes       — múltiples almacenes, transferencias
 *  4. Inventario Fís. — conteo físico vs. sistema, ajustes
 */
import { useState } from "react";

function fmtRD(n)   { return `RD$${Math.round(n||0).toLocaleString("es-DO")}`; }
function r2(n)      { return Math.round((n||0)*100)/100; }
function today()    { return new Date().toISOString().slice(0,10); }

const CATEGORIAS = ["Perfiles de Marco","Perfiles de Hoja","Rieles","Vidrios","Herrajes","Accesorios","Insumos","Otros"];
const DEPTOS     = ["HE — Herrajes","VE — Ventanas","PU — Puertas","PE — Persianas","VI — Vidrios","IN — Insumos"];
const UNIDADES   = ["Barra 20p","Barra 21p","Unidad","Pie²","Pie lineal","Rollo","Caja","Kg","Litro"];
const COLORES    = ["Natural","LBCO","BCE","Karatachi","Negro","Mill Finish","Blanco"];

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_MATERIALES = [
  { id:1,  codigo:"GK-40-N",   nombre:"Lateral Marco Corrediza GK-40 Natural",   cat:"Perfiles de Marco", depto:"VE — Ventanas",  unidad:"Barra 21p", color:"Natural", stock:30, minimo:12, maximo:60, costo:720,  p_distrib:864,  p_barra:950,  peso:2.1, barras:21, activo:true,  notas:"" },
  { id:2,  codigo:"GK-44-N",   nombre:"Hoja Corrediza GK-44 Natural",             cat:"Perfiles de Hoja",  depto:"VE — Ventanas",  unidad:"Barra 21p", color:"Natural", stock:24, minimo:10, maximo:50, costo:780,  p_distrib:936,  p_barra:1020, peso:2.3, barras:21, activo:true,  notas:"" },
  { id:3,  codigo:"P65-N",     nombre:"Perfil P-65 Marco Natural",                cat:"Perfiles de Marco", depto:"VE — Ventanas",  unidad:"Barra 21p", color:"Natural", stock:18, minimo:8,  maximo:40, costo:950,  p_distrib:1140, p_barra:1250, peso:2.8, barras:21, activo:true,  notas:"" },
  { id:4,  codigo:"P92-N",     nombre:"Perfil P-92 Marco Natural",                cat:"Perfiles de Marco", depto:"VE — Ventanas",  unidad:"Barra 21p", color:"Natural", stock:12, minimo:6,  maximo:30, costo:1200, p_distrib:1440, p_barra:1580, peso:3.2, barras:21, activo:true,  notas:"" },
  { id:5,  codigo:"ALD-601-N", nombre:"Riel Marco 3 vías ALD-601 Natural",        cat:"Rieles",            depto:"VE — Ventanas",  unidad:"Barra 21p", color:"Natural", stock:15, minimo:6,  maximo:30, costo:1100, p_distrib:1320, p_barra:1450, peso:1.9, barras:21, activo:true,  notas:"" },
  { id:6,  codigo:"FLT3/16-N", nombre:"Vidrio Liso 3/16 Natural",                 cat:"Vidrios",           depto:"VI — Vidrios",   unidad:"Pie²",      color:"Natural", stock:320,minimo:100,maximo:600, costo:45,   p_distrib:54,   p_barra:59,   peso:0.9, barras:0,  activo:true,  notas:"Láminas 4×8 = 32 pie²" },
  { id:7,  codigo:"FLT1/4-N",  nombre:"Vidrio Liso 1/4 Natural",                  cat:"Vidrios",           depto:"VI — Vidrios",   unidad:"Pie²",      color:"Natural", stock:180,minimo:60, maximo:400, costo:68,   p_distrib:82,   p_barra:90,   peso:1.2, barras:0,  activo:true,  notas:"" },
  { id:8,  codigo:"RUE-GK4",   nombre:"Ruedas GK 4 patas (bolsa ×10)",           cat:"Herrajes",          depto:"HE — Herrajes",  unidad:"Unidad",    color:"—",       stock:120,minimo:40, maximo:300, costo:85,   p_distrib:102,  p_barra:112,  peso:0.1, barras:0,  activo:true,  notas:"" },
  { id:9,  codigo:"GOM-T",     nombre:"Goma de sello transparente",               cat:"Accesorios",        depto:"HE — Herrajes",  unidad:"Rollo",     color:"—",       stock:12, minimo:4,  maximo:30,  costo:320,  p_distrib:384,  p_barra:420,  peso:0.5, barras:0,  activo:true,  notas:"" },
  { id:10, codigo:"FEL-01",    nombre:"Felpa de sello negra",                     cat:"Accesorios",        depto:"HE — Herrajes",  unidad:"Rollo",     color:"—",       stock:3,  minimo:4,  maximo:20,  costo:280,  p_distrib:336,  p_barra:368,  peso:0.3, barras:0,  activo:false, notas:"Stock bajo — reordenar" },
];

const DEMO_PRODUCTOS = [
  {
    id:1, codigo:"VCRCOF", nombre:"Ventana Corrediza Tradicional", tipo:"Ventana", activo:true,
    descripcion:"Ventana corrediza de 2 hojas, perfil GK-40, vidrio 3/16",
    notas:"La más común del mercado. Disponible en Natural y LBCO.",
    receta:[
      { mat_id:1, mat_codigo:"GK-40-N",   mat_nombre:"Lateral Marco GK-40",       cant_por_pie:0.08, unidad:"Barra 21p", notas:"Marco horizontal + vertical" },
      { mat_id:2, mat_codigo:"GK-44-N",   mat_nombre:"Hoja Corrediza GK-44",      cant_por_pie:0.10, unidad:"Barra 21p", notas:"2 hojas" },
      { mat_id:5, mat_codigo:"ALD-601-N", mat_nombre:"Riel Marco 3 vías",          cant_por_pie:0.04, unidad:"Barra 21p", notas:"Riel superior e inferior" },
      { mat_id:6, mat_codigo:"FLT3/16-N", mat_nombre:"Vidrio Liso 3/16 Natural",  cant_por_pie:0.85, unidad:"Pie²",      notas:"85% del área total" },
      { mat_id:8, mat_codigo:"RUE-GK4",   mat_nombre:"Ruedas GK",                  cant_por_pie:0.05, unidad:"Unidad",    notas:"4 ruedas por ventana aprox." },
      { mat_id:9, mat_codigo:"GOM-T",     mat_nombre:"Goma de sello",              cant_por_pie:0.03, unidad:"Rollo",     notas:"Sellado perimetral" },
    ],
  },
  {
    id:2, codigo:"P65COF", nombre:"Ventana Corrediza P-65", tipo:"Ventana", activo:true,
    descripcion:"Ventana corrediza 2 hojas perfil pesado P-65, vidrio 1/4",
    notas:"Para proyectos que requieren más resistencia.",
    receta:[
      { mat_id:3, mat_codigo:"P65-N",    mat_nombre:"Perfil P-65 Marco",           cant_por_pie:0.09, unidad:"Barra 21p", notas:"" },
      { mat_id:7, mat_codigo:"FLT1/4-N", mat_nombre:"Vidrio Liso 1/4",             cant_por_pie:0.85, unidad:"Pie²",      notas:"" },
      { mat_id:8, mat_codigo:"RUE-GK4",  mat_nombre:"Ruedas GK",                   cant_por_pie:0.05, unidad:"Unidad",    notas:"" },
    ],
  },
];

const DEMO_ALMACENES = [
  { id:1, codigo:"ALM-01", nombre:"Almacén Principal",    ubicacion:"Planta baja, área A", responsable:"Roberto Santos", principal:true,  activo:true  },
  { id:2, codigo:"ALM-02", nombre:"Almacén de Vidrios",   ubicacion:"Área exterior cubierta", responsable:"Carlos Méndez", principal:false, activo:true  },
  { id:3, codigo:"ALM-03", nombre:"Almacén de Herrajes",  ubicacion:"Segundo piso, área B", responsable:"María López",  principal:false, activo:true  },
];

const DEMO_MOVIMIENTOS = [
  { id:1, tipo:"Entrada",   fecha:"2025-06-10", material:"GK-40-N",   cant:20, almacen:"ALM-01", ref:"OC-001", usuario:"Mario Vuk" },
  { id:2, tipo:"Salida",    fecha:"2025-06-11", material:"FLT3/16-N", cant:32, almacen:"ALM-02", ref:"ORD-001", usuario:"Roberto Santos" },
  { id:3, tipo:"Ajuste ＋", fecha:"2025-06-12", material:"RUE-GK4",   cant:50, almacen:"ALM-03", ref:"INV-FIS-001", usuario:"Mario Vuk" },
  { id:4, tipo:"Transfer.", fecha:"2025-06-13", material:"GK-44-N",   cant:10, almacen:"ALM-01 → ALM-02", ref:"TRANSF-001", usuario:"Roberto Santos" },
];

// ─── helpers ────────────────────────────────────────────────────────────────
function stockStatus(m) {
  if (m.stock <= 0)          return { label:"Sin stock",   cls:"chip-filled-err",  color:"var(--err)" };
  if (m.stock < m.minimo)    return { label:"Bajo mínimo", cls:"chip-filled-warn", color:"var(--warn)" };
  if (m.maximo && m.stock > m.maximo) return { label:"Sobre máximo", cls:"chip-filled-pri", color:"var(--pri)" };
  return                            { label:"Normal",      cls:"chip-filled-sec",  color:"var(--sec)" };
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function Inventario() {
  const [tab,        setTab]   = useState("materiales");
  const [materiales, setMats]  = useState(DEMO_MATERIALES);
  const [productos,  setProds] = useState(DEMO_PRODUCTOS);
  const [almacenes,  setAlms]  = useState(DEMO_ALMACENES);
  const [movs,       setMovs]  = useState(DEMO_MOVIMIENTOS);
  const [toast,      setToast] = useState("");
  const [view,       setView]  = useState("list");
  const [sel,        setSel]   = useState(null);
  const [form,       setForm]  = useState(null);
  const [modal,      setModal] = useState(null);

  function showToast(msg){ setToast(msg); setTimeout(()=>setToast(""),2600); }
  function goList(){ setView("list"); setSel(null); setForm(null); }

  // ── stats ────────────────────────────────────────────────────────────────
  const bajoMin   = materiales.filter(m=>m.activo&&m.stock<m.minimo).length;
  const sinStock  = materiales.filter(m=>m.activo&&m.stock<=0).length;
  const valorInv  = materiales.reduce((s,m)=>s+m.stock*m.costo,0);

  // ════════════════════════════════════════════════════════════════════════════
  // TAB: MATERIALES
  // ════════════════════════════════════════════════════════════════════════════
  function TabMateriales() {
    const [q,       setQ]       = useState("");
    const [filtCat, setFiltCat] = useState("todas");
    const [filtEst, setFiltEst] = useState("todos");
    const [detalle, setDetalle] = useState(null);
    const [movModal,setMovModal]= useState(null);
    const [movForm, setMovForm] = useState({ tipo:"Entrada", cant:"", almacen:"ALM-01", ref:"", notas:"" });

    const filtered = materiales.filter(m=>{
      const mq  = m.nombre.toLowerCase().includes(q.toLowerCase()) || m.codigo.toLowerCase().includes(q.toLowerCase());
      const mc  = filtCat==="todas" || m.cat===filtCat;
      const ms  = filtEst==="todos" || (filtEst==="bajo"&&m.stock<m.minimo&&m.stock>0) || (filtEst==="sin"&&m.stock<=0) || (filtEst==="normal"&&m.stock>=m.minimo);
      return mq&&mc&&ms;
    });

    function openNew() {
      setForm({ id:null, codigo:"", nombre:"", cat:"Perfiles de Marco", depto:"VE — Ventanas", unidad:"Barra 21p", color:"Natural", stock:0, minimo:0, maximo:0, costo:0, p_distrib:0, p_barra:0, peso:0, barras:21, activo:true, notas:"" });
      setView("form-mat");
    }
    function openEdit(m) { setForm({...m}); setView("form-mat"); }

    function saveMat() {
      if(!form.nombre.trim()) return;
      if(form.id){ setMats(ms=>ms.map(m=>m.id===form.id?{...form}:m)); }
      else{ setMats(ms=>[...ms,{...form,id:Date.now()}]); }
      goList(); showToast("Material guardado ✓");
    }

    function registrarMov() {
      if(!movForm.cant||!movModal) return;
      const cant=parseFloat(movForm.cant)||0;
      const delta=movForm.tipo==="Entrada"||movForm.tipo==="Ajuste ＋"?cant:movForm.tipo==="Salida"||movForm.tipo==="Ajuste ＋"?-cant:0;
      setMats(ms=>ms.map(m=>m.id===movModal.id?{...m,stock:Math.max(0,m.stock+delta)}:m));
      setMovs(mv=>[{id:Date.now(),tipo:movForm.tipo,fecha:today(),material:movModal.codigo,cant,almacen:movForm.almacen,ref:movForm.ref,usuario:"Mario Vuk"},...mv]);
      setMovModal(null); showToast(`Movimiento registrado ✓`);
    }

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
                  <div className="fld" style={{gridColumn:"1/-1"}}><label>Nombre / Descripción *</label><input value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))} placeholder="Lateral Marco Corrediza GK-40 Natural"/></div>
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
                  <div className="fld"><label>Stock actual</label><input type="number" min="0" value={form.stock} onChange={e=>setForm(f=>({...f,stock:parseFloat(e.target.value)||0}))} style={{fontFamily:"JetBrains Mono,monospace",fontWeight:700,fontSize:16}}/></div>
                  <div className="fld"><label>Stock mínimo (alerta)</label><input type="number" min="0" value={form.minimo} onChange={e=>setForm(f=>({...f,minimo:parseFloat(e.target.value)||0}))}/></div>
                  <div className="fld"><label>Stock máximo</label><input type="number" min="0" value={form.maximo} onChange={e=>setForm(f=>({...f,maximo:parseFloat(e.target.value)||0}))}/></div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-hdr"><div className="card-ttl">Precios</div></div>
              <div className="card-bdy">
                <div className="fgrid f2" style={{gap:14}}>
                  {[["costo","Costo"],["p_distrib","Precio Distribuidor"],["p_barra","Precio Barra/Plancha"]].map(([k,l])=>(
                    <div key={k} className="fld"><label>{l} (RD$)</label><input type="number" min="0" value={form[k]} onChange={e=>setForm(f=>({...f,[k]:parseFloat(e.target.value)||0}))} style={{fontFamily:"JetBrains Mono,monospace"}}/></div>
                  ))}
                  {form.costo>0&&<div style={{gridColumn:"1/-1",background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"10px 14px",fontSize:12,color:"var(--on-sur3)"}}>
                    Margen Distrib: <b style={{color:"var(--sec)"}}>{form.p_distrib>0?r2((form.p_distrib-form.costo)/form.costo*100):0}%</b> · Margen Barra: <b style={{color:"var(--pri)"}}>{form.p_barra>0?r2((form.p_barra-form.costo)/form.costo*100):0}%</b>
                  </div>}
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
            <button className="btn btn-filled" style={{width:"100%",marginBottom:8}} onClick={saveMat} disabled={!form.nombre.trim()||!form.codigo.trim()}>Guardar</button>
            <button className="btn btn-text" style={{width:"100%"}} onClick={goList}>Cancelar</button>
          </div>
        </div>
      </div>
    );

    return(
      <div>
        {/* Alertas */}
        {(sinStock>0||bajoMin>0)&&(
          <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
            {sinStock>0&&<div style={{flex:1,background:"#fce8e6",border:"1px solid #fad2cf",borderRadius:"var(--r-sm)",padding:"10px 16px",fontSize:13,color:"var(--err)",fontWeight:600}}>
              ⛔ {sinStock} material(es) sin stock — reordenar urgente
            </div>}
            {bajoMin>0&&<div style={{flex:1,background:"#fef7e0",border:"1px solid #f9ab00",borderRadius:"var(--r-sm)",padding:"10px 16px",fontSize:13,color:"#92400e",fontWeight:600}}>
              ⚠ {bajoMin} material(es) por debajo del mínimo
            </div>}
          </div>
        )}

        {/* Toolbar */}
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
            {filtered.length===0&&<tr><td colSpan={10} style={{textAlign:"center",padding:48,color:"var(--on-sur4)"}}>Sin materiales</td></tr>}
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
                  <td>
                    <div style={{display:"flex",gap:4}}>
                      <button className="btn-sm-ghost" onClick={()=>openEdit(m)} title="Editar">✏️</button>
                      <button className="btn-sm-ghost" onClick={()=>{setMovModal(m);setMovForm({tipo:"Entrada",cant:"",almacen:"ALM-01",ref:"",notas:""});}} title="Movimiento">📦</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
          <div style={{padding:"10px 20px",borderTop:"1px solid var(--out)",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13}}>
            <span style={{color:"var(--on-sur3)"}}>{filtered.length} material(es)</span>
            <span>Valor total inventario: <span className="mono" style={{fontWeight:700,color:"var(--sec)"}}>{fmtRD(filtered.reduce((s,m)=>s+m.stock*m.costo,0))}</span></span>
          </div>
        </div>

        {/* Historial de movimientos */}
        <div className="card" style={{marginTop:16}}>
          <div className="card-hdr"><div className="card-ttl">Últimos movimientos</div></div>
          <div className="twrap"><table>
            <thead><tr><th>Tipo</th><th>Fecha</th><th>Material</th><th>Cant.</th><th>Almacén</th><th>Referencia</th><th>Usuario</th></tr></thead>
            <tbody>
              {movs.slice(0,10).map(mv=>(
                <tr key={mv.id}>
                  <td><span className={`chip ${mv.tipo.includes("Entrada")||mv.tipo.includes("＋")?"chip-filled-sec":mv.tipo.includes("Salida")?"chip-filled-err":"chip-filled-pri"}`} style={{fontSize:11}}>{mv.tipo}</span></td>
                  <td className="mono" style={{fontSize:12}}>{mv.fecha}</td>
                  <td><span className="mono" style={{fontWeight:600,color:"var(--pri)",fontSize:12}}>{mv.material}</span></td>
                  <td className="mono" style={{fontWeight:700}}>{mv.cant}</td>
                  <td style={{fontSize:12,color:"var(--on-sur3)"}}>{mv.almacen}</td>
                  <td className="mono" style={{fontSize:11,color:"var(--on-sur4)"}}>{mv.ref||"—"}</td>
                  <td style={{fontSize:12,color:"var(--on-sur3)"}}>{mv.usuario}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>

        {/* Movimiento modal */}
        {movModal&&(
          <div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setMovModal(null);}}>
            <div className="modal" style={{maxWidth:440}}>
              <div className="modal-hdr">
                <div><div className="modal-ttl">Registrar movimiento</div><div style={{fontSize:12,color:"var(--on-sur3)",marginTop:2}}>{movModal.codigo} — {movModal.nombre}</div></div>
                <button className="icon-btn" onClick={()=>setMovModal(null)}>✕</button>
              </div>
              <div className="modal-bdy">
                <div style={{background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",fontSize:13}}>
                  <span style={{color:"var(--on-sur3)"}}>Stock actual</span>
                  <span className="mono" style={{fontWeight:700,color:stockStatus(movModal).color}}>{movModal.stock} {movModal.unidad}</span>
                </div>
                <div className="fgrid f2" style={{gap:13}}>
                  <div className="fld"><label>Tipo de movimiento</label>
                    <select value={movForm.tipo} onChange={e=>setMovForm(f=>({...f,tipo:e.target.value}))}>
                      {["Entrada","Salida","Ajuste ＋","Ajuste ＋"].map(t=><option key={t}>{t}</option>)}
                      <option value="Transferencia">Transferencia</option>
                    </select>
                  </div>
                  <div className="fld"><label>Cantidad</label>
                    <input type="number" min="0" step="0.5" value={movForm.cant} onChange={e=>setMovForm(f=>({...f,cant:e.target.value}))} autoFocus style={{fontFamily:"JetBrains Mono,monospace",fontWeight:700,fontSize:16}}/>
                  </div>
                  <div className="fld"><label>Almacén</label>
                    <select value={movForm.almacen} onChange={e=>setMovForm(f=>({...f,almacen:e.target.value}))}>
                      {almacenes.filter(a=>a.activo).map(a=><option key={a.codigo} value={a.codigo}>{a.nombre}</option>)}
                    </select>
                  </div>
                  <div className="fld"><label>Referencia</label>
                    <input value={movForm.ref} onChange={e=>setMovForm(f=>({...f,ref:e.target.value}))} placeholder="OC-001, ORD-005..."/>
                  </div>
                </div>
                {movForm.cant&&(
                  <div style={{marginTop:12,background:"var(--pri-lt)",borderRadius:"var(--r-sm)",padding:"10px 14px",fontSize:13}}>
                    Resultado: <span className="mono" style={{fontWeight:700,color:"var(--pri)"}}>
                      {movForm.tipo==="Entrada"||movForm.tipo==="Ajuste ＋" ? movModal.stock+(parseFloat(movForm.cant)||0) : Math.max(0,movModal.stock-(parseFloat(movForm.cant)||0))} {movModal.unidad}
                    </span>
                  </div>
                )}
              </div>
              <div className="modal-ftr">
                <button className="btn btn-text" onClick={()=>setMovModal(null)}>Cancelar</button>
                <button className="btn btn-filled" onClick={registrarMov} disabled={!movForm.cant}>Registrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TAB: PRODUCTOS (con receta)
  // ════════════════════════════════════════════════════════════════════════════
  function TabProductos() {
    const [selProd, setSelProd] = useState(null);

    function calcCostoReceta(prod) {
      return r2(prod.receta.reduce((s,r)=>{
        const mat=materiales.find(m=>m.id===r.mat_id);
        return s+(mat?.costo||0)*r.cant_por_pie;
      },0));
    }

    function calcDisponibilidadPie(prod) {
      if(!prod.receta.length) return Infinity;
      return Math.min(...prod.receta.map(r=>{
        const mat=materiales.find(m=>m.id===r.mat_id);
        if(!mat||r.cant_por_pie<=0) return Infinity;
        return Math.floor(mat.stock/r.cant_por_pie);
      }));
    }

    return(
      <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:16,alignItems:"start"}}>
        {/* Sidebar */}
        <div className="card">
          <div className="card-hdr"><div className="card-ttl">Productos</div></div>
          <div style={{padding:"8px 0"}}>
            {productos.map(p=>{
              const costo=calcCostoReceta(p);
              const disp=calcDisponibilidadPie(p);
              return(
                <div key={p.id} onClick={()=>setSelProd(p)} style={{padding:"12px 16px",cursor:"pointer",background:selProd?.id===p.id?"var(--pri-lt)":"transparent",borderLeft:selProd?.id===p.id?"3px solid var(--pri)":"3px solid transparent",transition:"all .15s"}}>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:3}}>{p.nombre}</div>
                  <div style={{fontSize:11,color:"var(--on-sur3)",marginBottom:3}}>{p.codigo}</div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                    <span style={{color:"var(--sec)",fontWeight:600}}>{fmtRD(costo)}/pie²</span>
                    <span style={{color:disp<10?"var(--warn)":"var(--on-sur4)"}}>{disp===Infinity?"∞":`${disp} pie²`} disp.</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detalle */}
        {selProd?(
          <div>
            <div className="card" style={{marginBottom:16}}>
              <div className="card-hdr">
                <div>
                  <div className="card-ttl">{selProd.nombre}</div>
                  <div style={{fontSize:12,color:"var(--on-sur3)",marginTop:2}}>{selProd.descripcion}</div>
                </div>
                <span className={`chip ${selProd.activo?"chip-filled-sec":"chip-filled-err"}`}>{selProd.activo?"Activo":"Inactivo"}</span>
              </div>
              <div className="card-bdy">
                {/* Summary */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
                  {[
                    ["Costo/pie²",     fmtRD(calcCostoReceta(selProd)),   "var(--sec)"],
                    ["Pie² disponible",calcDisponibilidadPie(selProd)===Infinity?"∞":`${calcDisponibilidadPie(selProd)} ft²`,"var(--pri)"],
                    ["Materiales",     selProd.receta.length+" componentes","var(--on-sur2)"],
                  ].map(([l,v,c])=>(
                    <div key={l} style={{background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"12px 14px",textAlign:"center"}}>
                      <div className="mono" style={{fontSize:18,fontWeight:700,color:c,marginBottom:4}}>{v}</div>
                      <div style={{fontSize:11,color:"var(--on-sur4)",textTransform:"uppercase",letterSpacing:1}}>{l}</div>
                    </div>
                  ))}
                </div>

                {/* Receta */}
                <div style={{fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,color:"var(--on-sur3)",marginBottom:8}}>Receta de materiales (por pie²)</div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:"var(--sur2)"}}>
                      {["Código","Material","Cant./pie²","Unidad","Costo unit.","Costo/pie²","Stock disp."].map(h=>(
                        <th key={h} style={{padding:"8px 12px",fontSize:11,textTransform:"uppercase",letterSpacing:1,color:"var(--on-sur3)",textAlign:"left",fontWeight:700,borderBottom:"1px solid var(--out)"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selProd.receta.map((r,i)=>{
                      const mat=materiales.find(m=>m.id===r.mat_id);
                      const costoPie=r2((mat?.costo||0)*r.cant_por_pie);
                      const dispPie=mat&&r.cant_por_pie>0?Math.floor(mat.stock/r.cant_por_pie):0;
                      const esBottleneck=dispPie===calcDisponibilidadPie(selProd)&&dispPie<Infinity;
                      return(
                        <tr key={i} style={{borderBottom:"1px solid var(--out)",background:esBottleneck?"#fef7e0":"transparent"}}>
                          <td style={{padding:"10px 12px"}}><span className="mono" style={{fontWeight:700,color:"var(--pri)",fontSize:12}}>{r.mat_codigo}</span></td>
                          <td style={{padding:"10px 12px",fontSize:13,fontWeight:500}}>{r.mat_nombre}</td>
                          <td style={{padding:"10px 12px"}} className="mono">{r.cant_por_pie}</td>
                          <td style={{padding:"10px 12px",fontSize:12,color:"var(--on-sur3)"}}>{r.unidad}</td>
                          <td style={{padding:"10px 12px"}} className="mono">{fmtRD(mat?.costo||0)}</td>
                          <td style={{padding:"10px 12px"}}><span className="mono" style={{fontWeight:600,color:"var(--sec)"}}>{fmtRD(costoPie)}</span></td>
                          <td style={{padding:"10px 12px"}}>
                            <span className="mono" style={{fontWeight:700,color:dispPie<10?"var(--err)":dispPie<50?"var(--warn)":"var(--sec)"}}>{dispPie} pie²</span>
                            {esBottleneck&&<div style={{fontSize:10,color:"var(--warn)",fontWeight:700}}>↑ cuello de botella</div>}
                          </td>
                        </tr>
                      );
                    })}
                    <tr style={{background:"var(--sec-lt)"}}>
                      <td colSpan={5} style={{padding:"10px 12px",fontWeight:700,textAlign:"right",fontSize:13}}>Costo total por pie²</td>
                      <td colSpan={2} style={{padding:"10px 12px"}}><span className="mono" style={{fontWeight:700,fontSize:16,color:"var(--sec)"}}>{fmtRD(calcCostoReceta(selProd))}</span></td>
                    </tr>
                  </tbody>
                </table>

                {selProd.notas&&<div style={{marginTop:12,background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"10px 14px",fontSize:12,color:"var(--on-sur2)"}}>📝 {selProd.notas}</div>}
              </div>
            </div>
          </div>
        ):(
          <div style={{textAlign:"center",padding:"64px 24px",color:"var(--on-sur4)"}}>
            <div style={{fontSize:40,marginBottom:12}}>🏗️</div>
            <div style={{fontWeight:600}}>Selecciona un producto</div>
            <div style={{fontSize:13,marginTop:4}}>para ver su receta de materiales y disponibilidad</div>
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TAB: ALMACENES
  // ════════════════════════════════════════════════════════════════════════════
  function TabAlmacenes() {
    const [modal2,setModal2]=useState(null);
    const [aForm,setAForm]=useState({codigo:"",nombre:"",ubicacion:"",responsable:"",principal:false,activo:true});

    function saveAlm(){
      if(!aForm.nombre.trim())return;
      if(aForm.id){setAlms(as=>as.map(a=>a.id===aForm.id?{...aForm}:a));}
      else{setAlms(as=>[...as,{...aForm,id:Date.now(),codigo:`ALM-${String(almacenes.length+1).padStart(2,"0")}`}]);}
      setModal2(null); showToast("Almacén guardado ✓");
    }

    return(
      <div>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
          <button className="btn btn-filled" onClick={()=>{setAForm({codigo:"",nombre:"",ubicacion:"",responsable:"",principal:false,activo:true});setModal2("new");}}>＋ Nuevo Almacén</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14,marginBottom:20}}>
          {almacenes.map(a=>(
            <div key={a.id} className="card" style={{opacity:a.activo?1:0.6}}>
              <div style={{padding:"16px 16px 12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <span className="mono" style={{fontSize:11,color:"var(--on-sur4)"}}>{a.codigo}</span>
                    {a.principal&&<span className="chip chip-filled-sec" style={{fontSize:10,marginLeft:8}}>Principal</span>}
                  </div>
                  <span className={`chip ${a.activo?"chip-filled-sec":"chip-filled-err"}`} style={{fontSize:10}}>{a.activo?"Activo":"Inactivo"}</span>
                </div>
                <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>{a.nombre}</div>
                <div style={{fontSize:12,color:"var(--on-sur3)",marginBottom:3}}>📍 {a.ubicacion||"Sin ubicación"}</div>
                <div style={{fontSize:12,color:"var(--on-sur3)"}}>👤 {a.responsable||"Sin responsable"}</div>
              </div>
              <div style={{borderTop:"1px solid var(--out)",padding:"10px 16px",display:"flex",gap:8}}>
                <button className="btn-sm-ghost" onClick={()=>{setAForm({...a});setModal2("edit");}}>✏️ Editar</button>
              </div>
            </div>
          ))}
        </div>

        {/* Historial de transferencias */}
        <div className="card">
          <div className="card-hdr"><div className="card-ttl">Transferencias entre almacenes</div>
            <button className="btn btn-sm btn-outlined" onClick={()=>setModal2("transfer")}>＋ Transferir</button>
          </div>
          <div className="twrap"><table>
            <thead><tr><th>Fecha</th><th>Material</th><th>Cant.</th><th>Movimiento</th><th>Referencia</th></tr></thead>
            <tbody>
              {movs.filter(m=>m.tipo==="Transfer.").map(m=>(
                <tr key={m.id}>
                  <td className="mono" style={{fontSize:12}}>{m.fecha}</td>
                  <td><span className="mono" style={{fontWeight:600,color:"var(--pri)",fontSize:12}}>{m.material}</span></td>
                  <td className="mono" style={{fontWeight:700}}>{m.cant}</td>
                  <td style={{fontSize:12,color:"var(--on-sur3)"}}>{m.almacen}</td>
                  <td className="mono" style={{fontSize:11,color:"var(--on-sur4)"}}>{m.ref}</td>
                </tr>
              ))}
              {movs.filter(m=>m.tipo==="Transfer.").length===0&&<tr><td colSpan={5} style={{textAlign:"center",padding:32,color:"var(--on-sur4)",fontSize:13}}>Sin transferencias registradas</td></tr>}
            </tbody>
          </table></div>
        </div>

        {(modal2==="new"||modal2==="edit")&&(
          <div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setModal2(null);}}>
            <div className="modal" style={{maxWidth:480}}>
              <div className="modal-hdr"><div className="modal-ttl">{modal2==="edit"?"Editar almacén":"Nuevo almacén"}</div><button className="icon-btn" onClick={()=>setModal2(null)}>✕</button></div>
              <div className="modal-bdy">
                <div className="fgrid f2" style={{gap:13}}>
                  <div className="fld" style={{gridColumn:"1/-1"}}><label>Nombre *</label><input value={aForm.nombre} onChange={e=>setAForm(f=>({...f,nombre:e.target.value}))} autoFocus/></div>
                  <div className="fld" style={{gridColumn:"1/-1"}}><label>Ubicación</label><input value={aForm.ubicacion} onChange={e=>setAForm(f=>({...f,ubicacion:e.target.value}))} placeholder="Planta baja, área A"/></div>
                  <div className="fld"><label>Responsable</label><input value={aForm.responsable} onChange={e=>setAForm(f=>({...f,responsable:e.target.value}))}/></div>
                  <div className="fld"><label>Estado</label>
                    <select value={aForm.activo?"activo":"inactivo"} onChange={e=>setAForm(f=>({...f,activo:e.target.value==="activo"}))}>
                      <option value="activo">Activo</option><option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-ftr"><button className="btn btn-text" onClick={()=>setModal2(null)}>Cancelar</button><button className="btn btn-filled" onClick={saveAlm} disabled={!aForm.nombre.trim()}>Guardar</button></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TAB: INVENTARIO FÍSICO
  // ════════════════════════════════════════════════════════════════════════════
  function TabFisico() {
    const [conteo, setConteo] = useState(
      Object.fromEntries(materiales.filter(m=>m.activo).map(m=>[m.id,""]))
    );
    const [finalizado, setFinalizado] = useState(false);
    const [filtro, setFiltro] = useState("todos");

    const items = materiales.filter(m=>m.activo).map(m=>({
      ...m,
      contado: parseFloat(conteo[m.id])||null,
      dif: conteo[m.id]!==""?(parseFloat(conteo[m.id])||0)-m.stock:null,
    }));

    const conDif   = items.filter(i=>i.dif!==null&&i.dif!==0);
    const porContar= items.filter(i=>i.contado===null).length;

    const filtered = items.filter(i=>{
      if(filtro==="pendientes")  return i.contado===null;
      if(filtro==="diferencias") return i.dif!==null&&i.dif!==0;
      if(filtro==="ok")          return i.dif===0;
      return true;
    });

    function aplicarAjustes() {
      const ajustes=items.filter(i=>i.dif!==null&&i.dif!==0);
      setMats(ms=>ms.map(m=>{
        const item=ajustes.find(i=>i.id===m.id);
        if(!item)return m;
        return {...m,stock:item.contado};
      }));
      ajustes.forEach(i=>{
        setMovs(mv=>[{id:Date.now()+i.id,tipo:i.dif>0?"Ajuste ＋":"Ajuste ＋",fecha:today(),material:i.codigo,cant:Math.abs(i.dif),almacen:"ALM-01",ref:`INV-FIS-${today()}`,usuario:"Mario Vuk"},...mv]);
      });
      setFinalizado(true);
      showToast(`${ajustes.length} ajuste(s) aplicados al inventario ✓`);
    }

    if(finalizado) return(
      <div style={{textAlign:"center",padding:"64px 24px"}}>
        <div style={{fontSize:64,marginBottom:16}}>✅</div>
        <div style={{fontSize:22,fontWeight:700,marginBottom:8}}>Inventario físico completado</div>
        <div style={{fontSize:14,color:"var(--on-sur3)",marginBottom:24}}>{conDif.length} diferencias ajustadas · {today()}</div>
        <button className="btn btn-outlined" onClick={()=>{setFinalizado(false);setConteo(Object.fromEntries(materiales.filter(m=>m.activo).map(m=>[m.id,""])));}}>
          Nuevo conteo
        </button>
      </div>
    );

    return(
      <div>
        <div style={{background:"var(--pri-lt)",border:"1px solid var(--pri-lt2)",borderRadius:"var(--r-sm)",padding:"12px 16px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div style={{fontSize:13,color:"var(--pri-dk)"}}>
            <b>Conteo físico de inventario</b> — Ingresa la cantidad real que encontraste en bodega. El sistema calculará las diferencias automáticamente.
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontSize:12,color:"var(--on-sur3)"}}>{items.length-porContar}/{items.length} contados</span>
            {conDif.length>0&&<button className="btn btn-filled" style={{background:"var(--sec)"}} onClick={aplicarAjustes}>✅ Aplicar {conDif.length} ajuste(s)</button>}
          </div>
        </div>

        <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
          <div className="seg-tabs" style={{marginBottom:0}}>
            {[["todos","Todos"],["pendientes",`Sin contar (${porContar})`],["diferencias",`Diferencias (${conDif.length})`],["ok","Sin diferencias"]].map(([v,l])=>(
              <button key={v} className={"seg-tab"+(filtro===v?" on":"")} onClick={()=>setFiltro(v)}>{l}</button>
            ))}
          </div>
        </div>

        <div className="card"><div className="twrap"><table>
          <thead><tr><th>Código</th><th>Material</th><th>Unidad</th><th>Stock sistema</th><th>Cantidad contada</th><th>Diferencia</th></tr></thead>
          <tbody>
            {filtered.map(m=>(
              <tr key={m.id} style={{background:m.dif!==null&&m.dif!==0?m.dif>0?"#f0fdf4":"#fef7e0":"transparent"}}>
                <td><span className="mono" style={{fontWeight:700,color:"var(--pri)",fontSize:12}}>{m.codigo}</span></td>
                <td style={{fontWeight:500,fontSize:13}}>{m.nombre}</td>
                <td style={{fontSize:12,color:"var(--on-sur3)"}}>{m.unidad}</td>
                <td><span className="mono" style={{fontWeight:600}}>{m.stock}</span></td>
                <td>
                  <input type="number" min="0" step="0.5" value={conteo[m.id]} onChange={e=>setConteo(c=>({...c,[m.id]:e.target.value}))}
                    placeholder="Ingresar..."
                    style={{width:100,padding:"6px 10px",border:`1.5px solid ${conteo[m.id]!==""?"var(--pri)":"var(--out)"}`,borderRadius:"var(--r-sm)",fontFamily:"JetBrains Mono,monospace",fontSize:14,fontWeight:700,background:"var(--sur)",color:"var(--on-sur)",outline:"none",textAlign:"center"}}/>
                </td>
                <td>
                  {m.dif!==null&&m.dif!==0&&(
                    <span style={{fontFamily:"JetBrains Mono,monospace",fontWeight:700,fontSize:14,color:m.dif>0?"var(--sec)":"var(--err)"}}>
                      {m.dif>0?"＋":""}{m.dif}
                    </span>
                  )}
                  {m.dif===0&&<span style={{color:"var(--sec)",fontSize:13}}>✓</span>}
                  {m.dif===null&&<span style={{color:"var(--on-sur4)",fontSize:12}}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div></div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  const TABS=[
    {id:"materiales", label:"📦 Materiales",        count:bajoMin+sinStock||null, alert:sinStock>0},
    {id:"productos",  label:"🏗️ Productos / Recetas"},
    {id:"almacenes",  label:"🏭 Almacenes"},
    {id:"fisico",     label:"📋 Inventario Físico"},
  ];

  return(
    <div>
      <div className="stats-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        {[
          {l:"Materiales",     n:materiales.filter(m=>m.activo).length, i:"📦", bg:"var(--sur3)"},
          {l:"Sin stock",      n:sinStock,  i:"⛔", bg:sinStock>0?"#fce8e6":"var(--sec-lt)"},
          {l:"Bajo mínimo",    n:bajoMin,   i:"⚠️",  bg:bajoMin>0?"#fef7e0":"var(--sec-lt)"},
          {l:"Valor inventario",n:fmtRD(valorInv), i:"💰", bg:"var(--sec-lt)"},
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
          <button key={t.id} className={"seg-tab"+(tab===t.id?" on":"")} onClick={()=>{setTab(t.id);goList();}}>
            {t.label}
            {t.count>0&&<span style={{marginLeft:6,background:t.alert?"var(--err)":"var(--warn)",color:"#fff",borderRadius:12,fontSize:10,fontWeight:700,padding:"1px 6px",verticalAlign:"middle"}}>{t.count}</span>}
          </button>
        ))}
      </div>

      {tab==="materiales" && <TabMateriales/>}
      {tab==="productos"  && <TabProductos/>}
      {tab==="almacenes"  && <TabAlmacenes/>}
      {tab==="fisico"     && <TabFisico/>}

      {toast&&<div className="toast-msg">{toast}</div>}
    </div>
  );
}
