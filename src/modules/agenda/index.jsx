/**
 * AGENDA DE SEGUIMIENTO
 * 3 vistas:
 *  1. Calendario  — vista mensual con eventos por día
 *  2. Agenda      — lista cronológica de próximos eventos
 *  3. Recordatorios — alertas automáticas configurables
 */
import { useState } from "react";

function fmtRD(n)   { return `RD$${Math.round(n||0).toLocaleString("es-DO")}`; }
function today()    { return new Date().toISOString().slice(0,10); }
function addDays(d,n){ const dt=new Date(d); dt.setDate(dt.getDate()+n); return dt.toISOString().slice(0,10); }
function fmtDate(d) { return d ? new Date(d+"T12:00:00").toLocaleDateString("es-DO",{weekday:"short",day:"2-digit",month:"short"}) : "—"; }
function fmtHour(h) { return h || "Todo el día"; }
function daysFromNow(d){ return Math.ceil((new Date(d)-new Date(today()))/86400000); }

const T = today();

// ── Tipos de evento ───────────────────────────────────────────────────────────
const TIPOS = {
  instalacion:  { icon:"🔧", label:"Instalación",         color:"#1a73e8", bg:"#e8f0fe" },
  cotizacion:   { icon:"📋", label:"Seguimiento cotiz.",   color:"#188038", bg:"#e6f4ea" },
  cxc:          { icon:"💸", label:"Cobro pendiente",      color:"#e37400", bg:"#fef7e0" },
  visita:       { icon:"👤", label:"Visita a cliente",     color:"#7b1fa2", bg:"#f3e5f5" },
  reunion:      { icon:"👥", label:"Reunión",              color:"#0097a7", bg:"#e0f7fa" },
  entrega:      { icon:"🚛", label:"Entrega / Despacho",   color:"#c62828", bg:"#fce8e6" },
  otro:         { icon:"📌", label:"Otro",                 color:"#546e7a", bg:"var(--sur3)" },
};

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_EVENTOS = [
  { id:1,  tipo:"instalacion", titulo:"Instalación — Constructora Pérez",       cliente:"Constructora Pérez & Asociados", fecha:addDays(T,0), hora:"08:00", duracion:240, notas:"Edificio residencial, sector norte. Contacto: Carlos Pérez 829-555-1234", ref:"FAC-001", completado:false },
  { id:2,  tipo:"cxc",         titulo:"Cobrar FAC-003 — Vista Verde",             cliente:"Inmobiliaria Vista Verde",         fecha:addDays(T,2), hora:"10:00", duracion:30,  notas:"Factura de RD$89,208. Parcialmente pagada, quedan RD$49,208.", ref:"FAC-003", completado:false },
  { id:3,  tipo:"cotizacion",  titulo:"Seguimiento COT-002 — El Martillo",        cliente:"Ferretería El Martillo",           fecha:addDays(T,1), hora:"09:00", duracion:15,  notas:"Cotización enviada hace 5 días sin respuesta.", ref:"COT-002", completado:false },
  { id:4,  tipo:"visita",      titulo:"Visita — Aluminios del Este",              cliente:"Aluminios del Este",               fecha:addDays(T,3), hora:"14:00", duracion:60,  notas:"Presentar catálogo actualizado y nueva lista de precios.", ref:"", completado:false },
  { id:5,  tipo:"entrega",     titulo:"Despacho — Ferretería El Martillo",        cliente:"Ferretería El Martillo",           fecha:addDays(T,5), hora:"08:00", duracion:120, notas:"Transportista: Rafael Torres. Vehículo: Hilux P456-78", ref:"ORD-002", completado:false },
  { id:6,  tipo:"instalacion", titulo:"Instalación — María González",             cliente:"María González",                   fecha:addDays(T,7), hora:"09:00", duracion:180, notas:"Casa residencial. Puerta principal y 2 habitaciones.", ref:"FAC-004", completado:false },
  { id:7,  tipo:"reunion",     titulo:"Reunión de equipo — Planificación",        cliente:"Interno",                          fecha:addDays(T,4), hora:"17:00", duracion:60,  notas:"Revisar órdenes en producción y planificar entregas de la semana.", ref:"", completado:false },
  { id:8,  tipo:"cxc",         titulo:"Cobrar FAC-004 — María González",          cliente:"María González",                   fecha:addDays(T,-1), hora:"",     duracion:0,   notas:"VENCIDA — Factura de RD$6,800. Llamar urgente.", ref:"FAC-004", completado:false },
  { id:9,  tipo:"cotizacion",  titulo:"Enviar cotización — Persianas del Norte",  cliente:"Persianas del Norte",              fecha:addDays(T,6), hora:"11:00", duracion:30,  notas:"Solicitar medidas del proyecto antes de la reunión.", ref:"", completado:true },
];

const DEMO_RECORDATORIOS = [
  { id:1, tipo:"cotizacion", activo:true,  dias:5,  descripcion:"Cotizaciones sin respuesta después de X días" },
  { id:2, tipo:"cxc",        activo:true,  dias:3,  descripcion:"CxC que vence en menos de X días" },
  { id:3, tipo:"cxc",        activo:true,  dias:0,  descripcion:"CxC vencida (alertar al vencer)" },
  { id:4, tipo:"instalacion",activo:true,  dias:1,  descripcion:"Recordar instalación el día anterior" },
  { id:5, tipo:"entrega",    activo:false, dias:1,  descripcion:"Recordar despacho el día anterior" },
];

function emptyEvento() {
  return { id:null, tipo:"instalacion", titulo:"", cliente:"", fecha:today(), hora:"09:00", duracion:60, notas:"", ref:"", completado:false };
}

// ── Calendar helpers ──────────────────────────────────────────────────────────
function getDaysInMonth(year, month) {
  return new Date(year, month+1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}
function isoDate(year, month, day) {
  return `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
}

const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAY_NAMES   = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

// ═══════════════════════════════════════════════════════════════════════════════
export default function Agenda() {
  const [tab,      setTab]    = useState("agenda");
  const [eventos,  setEvs]    = useState(DEMO_EVENTOS);
  const [recs,     setRecs]   = useState(DEMO_RECORDATORIOS);
  const [modal,    setModal]  = useState(null);
  const [form,     setForm]   = useState(null);
  const [toast,    setToast]  = useState("");

  const now = new Date();
  const [calYear,  setCalY]   = useState(now.getFullYear());
  const [calMonth, setCalM]   = useState(now.getMonth());
  const [calSel,   setCalSel] = useState(today());

  function showToast(msg){ setToast(msg); setTimeout(()=>setToast(""),2600); }
  const sf = k => e => setForm(f=>({...f,[k]:typeof e==="object"?e.target.value:e}));

  function openNew(fecha=today()) {
    setForm({...emptyEvento(), fecha});
    setModal("form");
  }
  function openEdit(ev) { setForm({...ev}); setModal("form"); }

  function save() {
    if(!form.titulo.trim()) return;
    if(form.id){ setEvs(es=>es.map(e=>e.id===form.id?{...form}:e)); }
    else{ setEvs(es=>[...es,{...form,id:Date.now()}]); }
    setModal(null);
    showToast("Evento guardado ✓");
  }

  function toggleCompletado(id) {
    setEvs(es=>es.map(e=>e.id===id?{...e,completado:!e.completado}:e));
  }

  function eliminar(id) {
    setEvs(es=>es.filter(e=>e.id!==id));
    setModal(null);
    showToast("Evento eliminado");
  }

  // ── stats ─────────────────────────────────────────────────────────────────
  const hoy_evs     = eventos.filter(e=>e.fecha===today()&&!e.completado);
  const semana_evs  = eventos.filter(e=>e.fecha>=today()&&e.fecha<=addDays(today(),7)&&!e.completado);
  const vencidos    = eventos.filter(e=>e.fecha<today()&&!e.completado);
  const pendientes  = eventos.filter(e=>!e.completado);

  // ════════════════════════════════════════════════════════════════════════════
  // TAB: AGENDA (lista cronológica)
  // ════════════════════════════════════════════════════════════════════════════
  function TabAgenda() {
    const [filtro, setFiltro] = useState("proximos");
    const [filtTipo, setFiltTipo] = useState("todos");

    const filtered = eventos
      .filter(e=>{
        const byFiltro =
          filtro==="proximos" ? !e.completado&&e.fecha>=today() :
          filtro==="hoy"      ? e.fecha===today()&&!e.completado :
          filtro==="vencidos" ? e.fecha<today()&&!e.completado :
          filtro==="completados" ? e.completado : true;
        const byTipo = filtTipo==="todos"||e.tipo===filtTipo;
        return byFiltro&&byTipo;
      })
      .sort((a,b)=>a.fecha.localeCompare(b.fecha)||(a.hora||"").localeCompare(b.hora||""));

    // Group by date
    const grouped = {};
    filtered.forEach(e=>{ if(!grouped[e.fecha])grouped[e.fecha]=[]; grouped[e.fecha].push(e); });

    function getLabelFecha(d) {
      const diff=daysFromNow(d);
      if(diff<0)  return { label:`Hace ${Math.abs(diff)}d`, color:"var(--err)" };
      if(diff===0)return { label:"Hoy",     color:"var(--pri)" };
      if(diff===1)return { label:"Mañana",  color:"var(--sec)" };
      if(diff<=7) return { label:`En ${diff}d`, color:"var(--on-sur2)" };
      return       { label:fmtDate(d), color:"var(--on-sur3)" };
    }

    return(
      <div>
        {/* Toolbar */}
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
          <div className="seg-tabs" style={{marginBottom:0}}>
            {[
              ["proximos", `Próximos (${pendientes.filter(e=>e.fecha>=today()).length})`],
              ["hoy",      `Hoy (${hoy_evs.length})`],
              ["vencidos", `Vencidos (${vencidos.length})`],
              ["completados","Completados"],
              ["todos",    "Todos"],
            ].map(([v,l])=>(
              <button key={v} className={"seg-tab"+(filtro===v?" on":"")} onClick={()=>setFiltro(v)}>{l}</button>
            ))}
          </div>
          <select style={{padding:"8px 10px",borderRadius:"var(--rfull)",border:"1px solid var(--out)",background:"var(--sur)",fontFamily:"inherit",fontSize:12,outline:"none",marginLeft:"auto"}} value={filtTipo} onChange={e=>setFiltTipo(e.target.value)}>
            <option value="todos">Todos los tipos</option>
            {Object.entries(TIPOS).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
          </select>
          <button className="btn btn-filled" onClick={()=>openNew()}>＋ Nuevo evento</button>
        </div>

        {vencidos.length>0&&filtro!=="vencidos"&&(
          <div style={{background:"#fce8e6",border:"1px solid #fad2cf",borderRadius:"var(--r-sm)",padding:"10px 16px",marginBottom:14,fontSize:13,color:"var(--err)",fontWeight:600,cursor:"pointer"}} onClick={()=>setFiltro("vencidos")}>
            ⚠ {vencidos.length} evento(s) vencido(s) sin completar → Ver
          </div>
        )}

        {Object.keys(grouped).length===0?(
          <div style={{textAlign:"center",padding:"64px 24px",color:"var(--on-sur4)"}}>
            <div style={{fontSize:48,marginBottom:12}}>📅</div>
            <div style={{fontWeight:600,fontSize:16}}>Sin eventos</div>
            <div style={{fontSize:13,marginTop:4}}>Crea un evento o revisa otro filtro</div>
          </div>
        ):(
          Object.entries(grouped).map(([fecha, evs])=>{
            const lf=getLabelFecha(fecha);
            return(
              <div key={fecha} style={{marginBottom:20}}>
                {/* Date header */}
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                  <div style={{fontWeight:700,fontSize:14,color:lf.color}}>{lf.label}</div>
                  <div style={{fontSize:12,color:"var(--on-sur3)"}}>{fmtDate(fecha)}</div>
                  <div style={{flex:1,height:1,background:"var(--out)"}}/>
                  <button className="btn-sm-ghost" style={{fontSize:12}} onClick={()=>openNew(fecha)}>＋</button>
                </div>

                {/* Events */}
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {evs.map(ev=>{
                    const t=TIPOS[ev.tipo]||TIPOS.otro;
                    const isVencido=ev.fecha<today()&&!ev.completado;
                    return(
                      <div key={ev.id} style={{display:"flex",gap:12,padding:"14px 16px",background:ev.completado?"var(--sur2)":"var(--sur)",border:`1.5px solid ${isVencido?"var(--err)":ev.completado?"var(--out)":t.color+"44"}`,borderRadius:"var(--r-md)",opacity:ev.completado?0.6:1,transition:"all .15s"}}>
                        {/* Time + icon */}
                        <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:52,flexShrink:0}}>
                          <div style={{width:36,height:36,borderRadius:"50%",background:t.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,marginBottom:4}}>{t.icon}</div>
                          <div style={{fontSize:11,color:"var(--on-sur4)",fontFamily:"JetBrains Mono,monospace",textAlign:"center"}}>{ev.hora||"—"}</div>
                        </div>

                        {/* Content */}
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                            <div style={{fontWeight:700,fontSize:14,textDecoration:ev.completado?"line-through":"none",color:ev.completado?"var(--on-sur4)":"var(--on-sur)"}}>{ev.titulo}</div>
                            {isVencido&&<span className="chip chip-filled-err" style={{fontSize:10}}>⚠ Vencido</span>}
                            {ev.ref&&<span className="chip" style={{fontSize:10}}>{ev.ref}</span>}
                          </div>
                          {ev.cliente&&ev.cliente!=="Interno"&&<div style={{fontSize:12,color:"var(--on-sur3)",marginBottom:4}}>👤 {ev.cliente}</div>}
                          {ev.notas&&<div style={{fontSize:12,color:"var(--on-sur3)",lineHeight:1.5}}>{ev.notas}</div>}
                          {ev.duracion>0&&<div style={{fontSize:11,color:"var(--on-sur4)",marginTop:4}}>⏱ {ev.duracion} min</div>}
                        </div>

                        {/* Actions */}
                        <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
                          <button
                            onClick={()=>toggleCompletado(ev.id)}
                            style={{width:28,height:28,borderRadius:"50%",background:ev.completado?"var(--sec)":"var(--sur3)",border:`2px solid ${ev.completado?"var(--sec)":"var(--out)"}`,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}
                            title={ev.completado?"Marcar pendiente":"Marcar completado"}>
                            {ev.completado?"✓":"○"}
                          </button>
                          <button className="btn-sm-ghost" onClick={()=>openEdit(ev)} style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>✏️</button>
                          <button style={{width:28,height:28,borderRadius:"50%",background:"none",border:"none",cursor:"pointer",fontSize:14,color:"var(--err)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>eliminar(ev.id)}>🗑</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TAB: CALENDARIO (vista mensual)
  // ════════════════════════════════════════════════════════════════════════════
  function TabCalendario() {
    const daysInMonth  = getDaysInMonth(calYear, calMonth);
    const firstDay     = getFirstDayOfMonth(calYear, calMonth);

    function prevMonth(){ if(calMonth===0){setCalY(y=>y-1);setCalM(11);}else setCalM(m=>m-1); }
    function nextMonth(){ if(calMonth===11){setCalY(y=>y+1);setCalM(0);}else setCalM(m=>m+1); }

    function eventsOnDay(d) {
      const iso=isoDate(calYear,calMonth,d);
      return eventos.filter(e=>e.fecha===iso);
    }

    const selEvs = eventos.filter(e=>e.fecha===calSel).sort((a,b)=>(a.hora||"").localeCompare(b.hora||""));

    return(
      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:20,alignItems:"start"}}>
        {/* Calendar grid */}
        <div>
          {/* Nav */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <button className="btn-sm-ghost" onClick={prevMonth} style={{fontSize:18,width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
            <div style={{flex:1,textAlign:"center",fontWeight:700,fontSize:18}}>{MONTH_NAMES[calMonth]} {calYear}</div>
            <button className="btn-sm-ghost" onClick={nextMonth} style={{fontSize:18,width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
            <button className="btn btn-sm btn-outlined" onClick={()=>{setCalY(now.getFullYear());setCalM(now.getMonth());setCalSel(today());}}>Hoy</button>
            <button className="btn btn-filled" onClick={()=>openNew(calSel)}>＋</button>
          </div>

          {/* Day names */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
            {DAY_NAMES.map(d=>(
              <div key={d} style={{textAlign:"center",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--on-sur4)",padding:"4px 0"}}>{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
            {/* Empty cells before first day */}
            {Array.from({length:firstDay}).map((_,i)=>(
              <div key={`e${i}`} style={{height:76}}/>
            ))}
            {/* Days */}
            {Array.from({length:daysInMonth}).map((_,i)=>{
              const day   = i+1;
              const iso   = isoDate(calYear,calMonth,day);
              const evs   = eventsOnDay(day);
              const isToday = iso===today();
              const isSel   = iso===calSel;
              const isPast  = iso<today();
              return(
                <div key={day} onClick={()=>setCalSel(iso)}
                  style={{height:76,border:`1.5px solid ${isSel?"var(--pri)":isToday?"var(--sec)":"var(--out)"}`,borderRadius:"var(--r-sm)",padding:"5px 7px",cursor:"pointer",background:isSel?"var(--pri-lt)":isToday?"var(--sec-lt)":isPast?"var(--sur2)":"var(--sur)",transition:"all .15s",overflow:"hidden"}}>
                  <div style={{fontWeight:isToday||isSel?700:400,fontSize:13,color:isToday?"var(--sec)":isSel?"var(--pri)":isPast?"var(--on-sur4)":"var(--on-sur)",marginBottom:3}}>{day}</div>
                  {evs.slice(0,3).map((ev,idx)=>{
                    const t=TIPOS[ev.tipo]||TIPOS.otro;
                    return(
                      <div key={idx} style={{fontSize:10,background:t.bg,color:t.color,borderRadius:3,padding:"1px 4px",marginBottom:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",opacity:ev.completado?0.5:1}}>
                        {t.icon} {ev.titulo.split(" — ")[0]}
                      </div>
                    );
                  })}
                  {evs.length>3&&<div style={{fontSize:9,color:"var(--on-sur4)",marginTop:1}}>+{evs.length-3} más</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Day detail */}
        <div>
          <div style={{fontWeight:700,fontSize:15,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span>{fmtDate(calSel)}</span>
            <button className="btn btn-sm btn-outlined" onClick={()=>openNew(calSel)}>＋ Evento</button>
          </div>
          {selEvs.length===0?(
            <div style={{textAlign:"center",padding:"32px 16px",color:"var(--on-sur4)",background:"var(--sur2)",borderRadius:"var(--r-md)"}}>
              <div style={{fontSize:28,marginBottom:8}}>📅</div>
              <div style={{fontSize:13}}>Sin eventos este día</div>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {selEvs.map(ev=>{
                const t=TIPOS[ev.tipo]||TIPOS.otro;
                return(
                  <div key={ev.id} style={{background:ev.completado?"var(--sur2)":t.bg,border:`1.5px solid ${t.color}44`,borderRadius:"var(--r-md)",padding:"12px 14px",opacity:ev.completado?0.6:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <span style={{fontSize:18}}>{t.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:13,color:t.color,textDecoration:ev.completado?"line-through":"none"}}>{ev.titulo}</div>
                        <div style={{fontSize:11,color:"var(--on-sur3)"}}>{ev.hora||"Todo el día"}{ev.duracion>0?` · ${ev.duracion}min`:""}</div>
                      </div>
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>toggleCompletado(ev.id)} style={{background:"none",border:`1.5px solid ${ev.completado?"var(--sec)":"var(--out)"}`,borderRadius:"50%",width:22,height:22,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",color:ev.completado?"var(--sec)":"var(--on-sur4)"}}>
                          {ev.completado?"✓":"○"}
                        </button>
                        <button className="btn-sm-ghost" onClick={()=>openEdit(ev)} style={{fontSize:14}}>✏️</button>
                      </div>
                    </div>
                    {ev.cliente&&ev.cliente!=="Interno"&&<div style={{fontSize:11,color:"var(--on-sur3)"}}>👤 {ev.cliente}</div>}
                    {ev.notas&&<div style={{fontSize:11,color:"var(--on-sur3)",marginTop:4,lineHeight:1.4}}>{ev.notas.slice(0,80)}{ev.notas.length>80?"...":""}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TAB: RECORDATORIOS
  // ════════════════════════════════════════════════════════════════════════════
  function TabRecordatorios() {
    const [editRec, setEditRec] = useState(null);

    function toggleRec(id){ setRecs(rs=>rs.map(r=>r.id===id?{...r,activo:!r.activo}:r)); }
    function updateDias(id,dias){ setRecs(rs=>rs.map(r=>r.id===id?{...r,dias:parseInt(dias)||0}:r)); }

    // Alertas automáticas generadas (simuladas)
    const alertas = [
      { tipo:"cotizacion", titulo:"COT-002 sin respuesta", cliente:"Ferretería El Martillo", dias_sin_resp:5, fecha:addDays(T,1) },
      { tipo:"cxc",        titulo:"FAC-004 vence pronto",  cliente:"María González",          dias_para_venc:2, monto:6800, fecha:addDays(T,2) },
      { tipo:"cxc",        titulo:"FAC-004 VENCIDA",       cliente:"María González",          dias_vencida:1,  monto:6800, fecha:addDays(T,-1) },
    ].filter(a=>recs.find(r=>r.tipo===a.tipo&&r.activo));

    return(
      <div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          {/* Config */}
          <div>
            <div className="card">
              <div className="card-hdr"><div className="card-ttl">Alertas automáticas</div><div style={{fontSize:12,color:"var(--on-sur3)"}}>Se crean como eventos en la agenda</div></div>
              <div className="card-bdy" style={{padding:0}}>
                {recs.map(r=>{
                  const t=TIPOS[r.tipo]||TIPOS.otro;
                  return(
                    <div key={r.id} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 20px",borderBottom:"1px solid var(--out)",opacity:r.activo?1:0.5}}>
                      <span style={{fontSize:20,flexShrink:0}}>{t.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:500,color:"var(--on-sur)"}}>{r.descripcion}</div>
                        {r.dias>0&&(
                          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}>
                            <span style={{fontSize:12,color:"var(--on-sur3)"}}>Después de</span>
                            <input type="number" min="0" max="99" value={r.dias} onChange={e=>updateDias(r.id,e.target.value)} disabled={!r.activo}
                              style={{width:48,padding:"3px 6px",border:"1px solid var(--out)",borderRadius:6,fontFamily:"JetBrains Mono,monospace",fontSize:13,fontWeight:700,textAlign:"center",background:"var(--sur)",outline:"none"}}/>
                            <span style={{fontSize:12,color:"var(--on-sur3)"}}>días</span>
                          </div>
                        )}
                      </div>
                      <button onClick={()=>toggleRec(r.id)} style={{width:44,height:24,borderRadius:12,background:r.activo?"var(--pri)":"var(--sur3)",border:"none",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
                        <span style={{position:"absolute",top:2,left:r.activo?22:2,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.25)"}}/>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Alertas activas */}
          <div>
            <div className="card">
              <div className="card-hdr"><div className="card-ttl">Alertas activas ahora</div><span className={`chip ${alertas.length>0?"chip-filled-warn":"chip-filled-sec"}`} style={{fontSize:11}}>{alertas.length} alerta(s)</span></div>
              <div className="card-bdy" style={{padding:0}}>
                {alertas.length===0?(
                  <div style={{textAlign:"center",padding:"32px 20px",color:"var(--on-sur4)"}}>
                    <div style={{fontSize:32,marginBottom:8}}>✅</div>
                    <div style={{fontWeight:600}}>Sin alertas</div>
                    <div style={{fontSize:12,marginTop:4}}>Todo está al día</div>
                  </div>
                ):(
                  alertas.map((a,i)=>{
                    const t=TIPOS[a.tipo]||TIPOS.otro;
                    return(
                      <div key={i} style={{display:"flex",gap:12,padding:"14px 20px",borderBottom:"1px solid var(--out)"}}>
                        <div style={{width:36,height:36,borderRadius:"var(--r-sm)",background:t.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{t.icon}</div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600,fontSize:13,marginBottom:2}}>{a.titulo}</div>
                          <div style={{fontSize:12,color:"var(--on-sur3)",marginBottom:4}}>👤 {a.cliente}</div>
                          {a.monto&&<div style={{fontSize:11,color:"var(--err)",fontWeight:600}}>{fmtRD(a.monto)}</div>}
                          <button className="btn btn-sm btn-outlined" style={{marginTop:6,fontSize:11}} onClick={()=>openNew(a.fecha)}>
                            ＋ Crear evento
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Stats de seguimiento */}
            <div className="card" style={{marginTop:14}}>
              <div className="card-hdr"><div className="card-ttl">Resumen de seguimiento</div></div>
              <div className="card-bdy">
                {[
                  ["Eventos hoy",         hoy_evs.length,         "var(--pri)"],
                  ["Esta semana",         semana_evs.length,      "var(--sec)"],
                  ["Vencidos pendientes", vencidos.length,        vencidos.length>0?"var(--err)":"var(--sec)"],
                  ["Completados",         eventos.filter(e=>e.completado).length, "var(--on-sur3)"],
                ].map(([l,v,c])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--out)",fontSize:13}}>
                    <span style={{color:"var(--on-sur3)"}}>{l}</span>
                    <span style={{fontWeight:700,color:c}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MODAL: FORM evento
  // ════════════════════════════════════════════════════════════════════════════
  function ModalForm() {
    if(!form) return null;
    return(
      <div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setModal(null);}}>
        <div className="modal" style={{maxWidth:520}}>
          <div className="modal-hdr">
            <div className="modal-ttl">{form.id?"Editar evento":"Nuevo evento"}</div>
            <button className="icon-btn" onClick={()=>setModal(null)}>✕</button>
          </div>
          <div className="modal-bdy">
            <div className="fgrid f2" style={{gap:13}}>
              <div className="fld"><label>Tipo</label>
                <select value={form.tipo} onChange={sf("tipo")}>
                  {Object.entries(TIPOS).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
                </select>
              </div>
              <div className="fld"><label>Estado</label>
                <select value={form.completado?"completado":"pendiente"} onChange={e=>setForm(f=>({...f,completado:e.target.value==="completado"}))}>
                  <option value="pendiente">Pendiente</option>
                  <option value="completado">Completado</option>
                </select>
              </div>
              <div className="fld" style={{gridColumn:"1/-1"}}><label>Título *</label>
                <input value={form.titulo} onChange={sf("titulo")} placeholder="Ej: Instalación — Cliente XYZ" autoFocus/>
              </div>
              <div className="fld" style={{gridColumn:"1/-1"}}><label>Cliente</label>
                <input value={form.cliente} onChange={sf("cliente")} placeholder="Nombre del cliente"/>
              </div>
              <div className="fld"><label>Fecha</label>
                <input type="date" value={form.fecha} onChange={sf("fecha")}/>
              </div>
              <div className="fld"><label>Hora</label>
                <input type="time" value={form.hora} onChange={sf("hora")}/>
              </div>
              <div className="fld"><label>Duración (min)</label>
                <input type="number" min="0" step="15" value={form.duracion} onChange={sf("duracion")}/>
              </div>
              <div className="fld"><label>Referencia (FAC, COT, ORD...)</label>
                <input value={form.ref} onChange={sf("ref")} placeholder="FAC-001"/>
              </div>
              <div className="fld" style={{gridColumn:"1/-1"}}><label>Notas</label>
                <textarea value={form.notas} onChange={sf("notas")} style={{background:"var(--sur2)",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",padding:"8px 12px",fontFamily:"inherit",fontSize:13,color:"var(--on-sur)",outline:"none",width:"100%",resize:"vertical",minHeight:72}}/>
              </div>
            </div>
          </div>
          <div className="modal-ftr">
            {form.id&&<button className="btn btn-text" style={{color:"var(--err)",marginRight:"auto"}} onClick={()=>eliminar(form.id)}>🗑 Eliminar</button>}
            <button className="btn btn-text" onClick={()=>setModal(null)}>Cancelar</button>
            <button className="btn btn-filled" onClick={save} disabled={!form.titulo.trim()}>Guardar</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  const TABS=[
    {id:"agenda",        label:"📋 Agenda",       count:hoy_evs.length||null},
    {id:"calendario",    label:"📅 Calendario"},
    {id:"recordatorios", label:"🔔 Recordatorios", count:vencidos.length||null, alert:true},
  ];

  return(
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        {[
          {l:"Eventos hoy",   n:hoy_evs.length,   i:"📅", bg:hoy_evs.length>0?"var(--pri-lt)":"var(--sec-lt)"},
          {l:"Esta semana",   n:semana_evs.length, i:"📆", bg:"var(--sec-lt)"},
          {l:"Vencidos",      n:vencidos.length,   i:"⚠️",  bg:vencidos.length>0?"#fce8e6":"var(--sec-lt)"},
          {l:"Total pendiente",n:pendientes.length, i:"🔔", bg:"var(--sur3)"},
        ].map(s=>(
          <div key={s.l} className="stat-card">
            <div className="stat-icon-wrap" style={{background:s.bg}}>{s.i}</div>
            <div className="stat-num">{s.n}</div>
            <div className="stat-lbl">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="seg-tabs" style={{marginBottom:20}}>
        {TABS.map(t=>(
          <button key={t.id} className={"seg-tab"+(tab===t.id?" on":"")} onClick={()=>setTab(t.id)}>
            {t.label}
            {t.count>0&&<span style={{marginLeft:6,background:t.alert?"var(--err)":"var(--pri)",color:"#fff",borderRadius:12,fontSize:10,fontWeight:700,padding:"1px 6px",verticalAlign:"middle"}}>{t.count}</span>}
          </button>
        ))}
      </div>

      {tab==="agenda"        && <TabAgenda/>}
      {tab==="calendario"    && <TabCalendario/>}
      {tab==="recordatorios" && <TabRecordatorios/>}

      {modal==="form" && <ModalForm/>}
      {toast&&<div className="toast-msg">{toast}</div>}
    </div>
  );
}
