/**
 * MÓDULO DE ENVÍO — WhatsApp + Email
 *
 * Componente reutilizable que se importa en Cotizaciones y Facturación.
 * No requiere backend — todo funciona desde el frontend.
 *
 * Uso:
 *   <BtnEnviar
 *     tipo="cotizacion"          // cotizacion | factura | recordatorio | vencida
 *     numero="COT-001"
 *     cliente="Constructora Pérez"
 *     tel="8095551234"           // sin guiones para WhatsApp
 *     email="info@empresa.do"
 *     monto="RD$56,280"
 *     vence="15 Jun 2025"        // opcional
 *     pdfUrl={url}               // opcional — link al PDF si está disponible
 *     empresa="Ventaneros SRL"
 *     telEmpresa="8095550001"
 *   />
 */
import { useState } from "react";

// ── Plantillas por tipo ───────────────────────────────────────────────────────
function plantilla(tipo, data) {
  const { numero, cliente, monto, vence, empresa, telEmpresa } = data;

  const firma = `\n\n---\n${empresa}\n📞 ${telEmpresa}`;

  switch(tipo) {
    case "cotizacion":
      return `Estimado/a *${cliente}*,\n\nAdjunto encontrará la cotización *${numero}* por un monto de *${monto}*.\n\nQuedamos a su disposición para cualquier consulta o para proceder con la orden de producción.${firma}`;

    case "factura":
      return `Estimado/a *${cliente}*,\n\nLe enviamos la factura *${numero}* por un monto de *${monto}*.\n\nFecha de vencimiento: *${vence||"Al recibir"}*\n\nPara realizar su pago o cualquier consulta, no dude en contactarnos.${firma}`;

    case "recordatorio":
      return `Estimado/a *${cliente}*,\n\nLe recordamos que la factura *${numero}* por *${monto}* tiene fecha de vencimiento *${vence}*.\n\nSi ya realizó el pago, por favor ignore este mensaje. De lo contrario, agradecemos su pronto pago.${firma}`;

    case "vencida":
      return `Estimado/a *${cliente}*,\n\nLe informamos que la factura *${numero}* por *${monto}* se encuentra *vencida desde el ${vence}*.\n\nPor favor, realice su pago a la brevedad para evitar cargos adicionales. Estamos disponibles para coordinar el pago.${firma}`;

    default:
      return `Estimado/a *${cliente}*, adjunto documento *${numero}* por *${monto}*.${firma}`;
  }
}

function asuntoEmail(tipo, numero, empresa) {
  switch(tipo) {
    case "cotizacion":   return `${empresa} — Cotización ${numero}`;
    case "factura":      return `${empresa} — Factura ${numero}`;
    case "recordatorio": return `Recordatorio de pago — ${numero} — ${empresa}`;
    case "vencida":      return `⚠ Factura vencida ${numero} — ${empresa}`;
    default:             return `${empresa} — ${numero}`;
  }
}

const TIPO_LABELS = {
  cotizacion:   { label:"Cotización",          icon:"📋", color:"var(--pri)" },
  factura:      { label:"Factura",              icon:"🧾", color:"var(--sec)" },
  recordatorio: { label:"Recordatorio de pago", icon:"⏰", color:"var(--warn)" },
  vencida:      { label:"Factura vencida",      icon:"⚠️",  color:"var(--err)" },
};

// ── Main modal component ──────────────────────────────────────────────────────
export function ModalEnviar({ data, onClose }) {
  const {
    tipo="cotizacion", numero, cliente, tel="", email="",
    monto="", vence="", pdfUrl="",
    empresa="Ventaneros SRL", telEmpresa="8095550001",
  } = data;

  const [canal,   setCanal]   = useState("whatsapp");  // whatsapp | email
  const [tipoMsg, setTipoMsg] = useState(tipo);
  const [msg,     setMsg]     = useState(() => plantilla(tipo, { numero, cliente, monto, vence, empresa, telEmpresa }));
  const [asunto,  setAsunto]  = useState(() => asuntoEmail(tipo, numero, empresa));
  const [enviado, setEnviado] = useState(false);
  const [hist,    setHist]    = useState([]);

  function regenerar(nuevoTipo) {
    setTipoMsg(nuevoTipo);
    setMsg(plantilla(nuevoTipo, { numero, cliente, monto, vence, empresa, telEmpresa }));
    setAsunto(asuntoEmail(nuevoTipo, numero, empresa));
  }

  function enviarWhatsApp() {
    const telLimpio = (tel||"").replace(/\D/g,"");
    // Add country code if not present
    const telFull = telLimpio.startsWith("1")||telLimpio.length>10 ? telLimpio : `1${telLimpio}`;
    const msgEncoded = encodeURIComponent(msg + (pdfUrl ? `\n\n📎 Ver documento: ${pdfUrl}` : ""));
    window.open(`https://wa.me/${telFull}?text=${msgEncoded}`, "_blank");
    registrarEnvio("WhatsApp", telFull);
  }

  function enviarEmail() {
    const cuerpo = encodeURIComponent(msg.replace(/\*/g,""));
    const asuntoEnc = encodeURIComponent(asunto);
    window.open(`mailto:${email}?subject=${asuntoEnc}&body=${cuerpo}`, "_blank");
    registrarEnvio("Email", email);
  }

  function registrarEnvio(canal, destino) {
    const entry = { canal, destino, fecha: new Date().toLocaleString("es-DO"), tipoMsg };
    setHist(h=>[entry,...h]);
    setEnviado(true);
    setTimeout(()=>setEnviado(false), 3000);
  }

  const telDisp  = (tel||"").replace(/\D/g,"").length >= 7;
  const mailDisp = (email||"").includes("@");

  return (
    <div className="modal-bd" onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth:560 }}>
        {/* Header */}
        <div className="modal-hdr">
          <div>
            <div className="modal-ttl">Enviar {numero}</div>
            <div style={{ fontSize:12, color:"var(--on-sur3)", marginTop:2 }}>
              Para: <b>{cliente}</b>
              {tel&&<span style={{ marginLeft:8, color:"var(--on-sur4)" }}>📞 {tel}</span>}
              {email&&<span style={{ marginLeft:8, color:"var(--on-sur4)" }}>📧 {email}</span>}
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-bdy">
          {/* Canal selector */}
          <div style={{ display:"flex", gap:10, marginBottom:16 }}>
            {[
              { id:"whatsapp", label:"WhatsApp", icon:"💬", avail:telDisp,  color:"#25D366" },
              { id:"email",    label:"Email",    icon:"📧",  avail:mailDisp, color:"var(--pri)" },
            ].map(c=>(
              <button key={c.id}
                onClick={()=>c.avail&&setCanal(c.id)}
                style={{ flex:1, padding:"12px 16px", border:`2px solid ${canal===c.id?c.color:"var(--out)"}`, borderRadius:"var(--r-md)", background:canal===c.id?c.id==="whatsapp"?"#f0fdf4":"var(--pri-lt)":"var(--sur)", cursor:c.avail?"pointer":"not-allowed", opacity:c.avail?1:0.4, transition:"all .15s", fontFamily:"inherit" }}>
                <div style={{ fontSize:22, marginBottom:4 }}>{c.icon}</div>
                <div style={{ fontWeight:700, fontSize:14, color:canal===c.id?c.color:"var(--on-sur3)" }}>{c.label}</div>
                {!c.avail&&<div style={{ fontSize:10, color:"var(--on-sur4)", marginTop:2 }}>Sin {c.id==="whatsapp"?"teléfono":"email"}</div>}
              </button>
            ))}
          </div>

          {/* Tipo de mensaje */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:1.5, color:"var(--on-sur3)", marginBottom:8 }}>Plantilla</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {Object.entries(TIPO_LABELS).map(([k,v])=>(
                <button key={k} onClick={()=>regenerar(k)}
                  style={{ fontSize:12, padding:"5px 12px", borderRadius:20, border:`1.5px solid ${tipoMsg===k?v.color:"var(--out)"}`, background:tipoMsg===k?"rgba(0,0,0,.04)":"transparent", color:tipoMsg===k?v.color:"var(--on-sur3)", cursor:"pointer", fontFamily:"inherit", fontWeight:tipoMsg===k?700:400, transition:"all .15s" }}>
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Asunto email */}
          {canal==="email"&&(
            <div className="fld" style={{ marginBottom:12 }}>
              <label>Asunto</label>
              <input value={asunto} onChange={e=>setAsunto(e.target.value)} style={{ fontWeight:600 }}/>
            </div>
          )}

          {/* Mensaje */}
          <div className="fld" style={{ marginBottom:12 }}>
            <label>Mensaje</label>
            <textarea value={msg} onChange={e=>setMsg(e.target.value)}
              rows={10}
              style={{ background:"var(--sur2)", border:"1.5px solid var(--out)", borderRadius:"var(--r-sm)", padding:"10px 14px", fontFamily:"inherit", fontSize:13, color:"var(--on-sur)", outline:"none", width:"100%", resize:"vertical", lineHeight:1.6 }}/>
            <div style={{ fontSize:11, color:"var(--on-sur4)", marginTop:4 }}>
              {msg.length} caracteres · El asterisco (*texto*) aparece en negrita en WhatsApp
            </div>
          </div>

          {/* PDF link */}
          {pdfUrl&&(
            <div style={{ background:"var(--sec-lt)", borderRadius:"var(--r-sm)", padding:"8px 14px", fontSize:12, color:"var(--sec)", marginBottom:12 }}>
              📎 Se incluirá link al PDF: <span style={{ fontFamily:"JetBrains Mono,monospace", fontSize:11 }}>{pdfUrl.slice(0,40)}...</span>
            </div>
          )}

          {/* Historial del modal */}
          {hist.length>0&&(
            <div style={{ borderTop:"1px solid var(--out)", paddingTop:12, marginTop:4 }}>
              <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1.5, color:"var(--on-sur3)", marginBottom:6 }}>Enviado</div>
              {hist.map((h,i)=>(
                <div key={i} style={{ fontSize:12, color:"var(--on-sur3)", marginBottom:4 }}>
                  ✓ {h.canal} → {h.destino} · {h.fecha}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-ftr">
          <button className="btn btn-text" onClick={onClose}>Cerrar</button>
          {enviado&&<span style={{ fontSize:13, color:"var(--sec)", fontWeight:600 }}>✓ ¡Enviado!</span>}
          {canal==="whatsapp"&&(
            <button className="btn btn-filled" style={{ background:"#25D366" }} onClick={enviarWhatsApp} disabled={!telDisp}>
              💬 Abrir WhatsApp
            </button>
          )}
          {canal==="email"&&(
            <button className="btn btn-filled" onClick={enviarEmail} disabled={!mailDisp}>
              📧 Abrir Email
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Botón simple para usar en tablas y vistas ─────────────────────────────────
export function BtnEnviar({ data, label="Enviar", style={} }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="btn btn-outlined"
        style={{ fontSize:12, ...style }}
        onClick={()=>setOpen(true)}
      >
        📤 {label}
      </button>
      {open&&<ModalEnviar data={data} onClose={()=>setOpen(false)}/>}
    </>
  );
}

// ── WhatsApp quick button (para tablas) ───────────────────────────────────────
export function BtnWA({ tel, mensaje }) {
  function abrir() {
    const telLimpio = (tel||"").replace(/\D/g,"");
    const telFull   = telLimpio.startsWith("1")||telLimpio.length>10 ? telLimpio : `1${telLimpio}`;
    window.open(`https://wa.me/${telFull}?text=${encodeURIComponent(mensaje)}`, "_blank");
  }
  return (
    <button onClick={abrir} className="btn-sm-ghost" title="Enviar por WhatsApp" style={{ fontSize:18 }}>
      💬
    </button>
  );
}
