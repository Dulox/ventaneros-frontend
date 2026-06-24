import { useState } from "react";

function genRefCode(empresa) { return "REF-" + empresa.replace(/[^A-Z0-9]/gi, "").slice(0, 4).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(); }
const REWARD_TYPES = [
  { id: "pct", label: "% Descuento", desc: "Ej: 20% off el primer mes" },
  { id: "free", label: "Mes gratis", desc: "1 mes adicional sin costo" },
  { id: "months", label: "N Meses gratis", desc: "Tú decides cuántos meses" },
  { id: "fixed", label: "Monto fijo RD$", desc: "Crédito en dinero" },
];
const INIT_CONFIG = { rewardType: "pct", rewardValue: 20, referrerType: "pct", referrerValue: 10, active: true, message: "¡Usa mi código {CODE} y obtén {REWARD} en tu primera suscripción a Ventaneros!" };
const INIT_REF = [
  { id: 1, referrer: "Aluminios El Cibao SRL", refCode: "REF-ALUM-X7K2", referred: "Metales Santo Domingo", email: "info@metalsd.do", fecha: "2025-05-10", plan: "Pro", estado: "Activo", rewarded: true, rewardDesc: "20% descuento primer mes", refRewardDesc: "10% descuento" },
  { id: 2, referrer: "Ventanas & Persianas Pérez", refCode: "REF-VENT-P3M8", referred: "Aluminios del Este", email: "aleste@gmail.com", fecha: "2025-05-22", plan: "Básico", estado: "Pendiente", rewarded: false, rewardDesc: "20% descuento primer mes", refRewardDesc: "10% descuento" },
  { id: 3, referrer: "Persianas del Norte", refCode: "REF-PERS-Q9N1", referred: "Ventanas Caribe SRL", email: "vc@caribe.do", fecha: "2025-06-01", plan: "Empresarial", estado: "Activo", rewarded: true, rewardDesc: "20% descuento primer mes", refRewardDesc: "10% descuento" },
];
const LIC_CLIENTS = [
  { empresa: "Aluminios El Cibao SRL", code: "REF-ALUM-X7K2" },
  { empresa: "Ventanas & Persianas Pérez", code: "REF-VENT-P3M8" },
  { empresa: "Constructora Moderna SRL", code: "REF-CONS-M4P9" },
  { empresa: "Persianas del Norte", code: "REF-PERS-Q9N1" },
];

export default function Referidos() {
  const [lista, setLista] = useState(INIT_REF);
  const [config, setConfig] = useState(INIT_CONFIG);
  const [tab, setTab] = useState("overview");
  const [showConfig, setShowConfig] = useState(false);
  const [newModal, setNewModal] = useState(false);
  const [newForm, setNewForm] = useState({ referrer: "", referred: "", email: "", plan: "Básico" });
  const nf = k => e => setNewForm(f => ({ ...f, [k]: e.target.value }));
  const cf = k => e => setConfig(f => ({ ...f, [k]: e.target.value }));

  function buildRew(type, val) {
    if (type === "pct") return `${val}% descuento primer mes`;
    if (type === "free") return `1 mes gratis`;
    if (type === "months") return `${val} meses gratis`;
    return `RD$${val} de crédito`;
  }
  const rewDesc = () => buildRew(config.rewardType, config.rewardValue);
  const refDesc = () => buildRew(config.referrerType, config.referrerValue);
  const prevMsg = (code) => config.message.replace("{CODE}", code || "REF-XXXX-XXXX").replace("{REWARD}", rewDesc());

  function applyReward(id) { setLista(l => l.map(x => x.id === id ? { ...x, rewarded: true, estado: "Activo" } : x)); }
  function addRef() {
    if (!newForm.referrer || !newForm.referred) return;
    const ref = LIC_CLIENTS.find(c => c.empresa === newForm.referrer) || { code: genRefCode(newForm.referrer) };
    setLista(l => [...l, { id: Date.now(), referrer: newForm.referrer, refCode: ref.code, referred: newForm.referred, email: newForm.email, fecha: new Date().toISOString().slice(0, 10), plan: newForm.plan, estado: "Pendiente", rewarded: false, rewardDesc: rewDesc(), refRewardDesc: refDesc() }]);
    setNewModal(false); setNewForm({ referrer: "", referred: "", email: "", plan: "Básico" });
  }

  const activos = lista.filter(r => r.estado === "Activo").length;
  const statusCls = { Activo: "chip-filled-sec", Pendiente: "chip-filled-warn", Cancelado: "chip-filled-err" };

  return (
    <div>
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {[
          { l: "Total Referidos", n: lista.length, s: "registrados", i: "🤝", bg: "var(--pri-lt)" },
          { l: "Activos", n: activos, s: "convertidos", i: "✅", bg: "var(--sec-lt)" },
          { l: "Pendientes", n: lista.filter(r => r.estado === "Pendiente").length, s: "por confirmar", i: "⏳", bg: "#fef7e0" },
          { l: "Tasa Conversión", n: lista.length > 0 ? Math.round(activos / lista.length * 100) + "%" : "—", s: "referidos activos", i: "📈", bg: "var(--sur3)" },
        ].map(s => (
          <div key={s.l} className="stat-card">
            <div className="stat-icon-wrap" style={{ background: s.bg }}>{s.i}</div>
            <div className="stat-num" style={{ fontSize: 22 }}>{s.n}</div>
            <div className="stat-lbl">{s.l}</div>
            <div style={{ fontSize: 11, color: "var(--on-sur3)", marginTop: 4 }}>{s.s}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <div className="seg-tabs" style={{ marginBottom: 0 }}>
          {[["overview", "Resumen"], ["codes", "Códigos"], ["history", "Historial"]].map(([v, l]) => (
            <button key={v} className={"seg-tab" + (tab === v ? " on" : "")} onClick={() => setTab(v)}>{l}</button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn btn-outlined" onClick={() => setShowConfig(true)}>⚙️ Configurar</button>
          <button className="btn btn-filled" onClick={() => setNewModal(true)}>＋ Registrar Referido</button>
        </div>
      </div>

      <div style={{ background: config.active ? "var(--sec-lt)" : "#fef7e0", border: `1px solid ${config.active ? "#a8d5b5" : "#f9ab00"}`, borderRadius: "var(--r-sm)", padding: "12px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 20 }}>{config.active ? "🟢" : "🟡"}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: config.active ? "var(--sec)" : "#92400e" }}>Programa de Referidos {config.active ? "Activo" : "Pausado"}</div>
            <div style={{ fontSize: 12, color: "var(--on-sur3)", marginTop: 2 }}>Referido recibe: <b>{rewDesc()}</b> · Referidor recibe: <b>{refDesc()}</b></div>
          </div>
        </div>
        <button style={{ background: config.active ? "#fef7e0" : "var(--sec-lt)", color: config.active ? "#92400e" : "var(--sec)", border: `1px solid ${config.active ? "#f9ab00" : "#a8d5b5"}`, borderRadius: 20, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12, padding: "6px 16px" }} onClick={() => setConfig(c => ({ ...c, active: !c.active }))}>
          {config.active ? "Pausar" : "Activar"}
        </button>
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="card"><div className="card-hdr"><div className="card-ttl">🎁 Premio para el Referido</div></div><div className="card-bdy">
            <div style={{ background: "var(--pri-lt)", borderRadius: "var(--r-sm)", padding: "20px", textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 40, fontWeight: 300, color: "var(--pri)" }}>
                {config.rewardType === "pct" ? `${config.rewardValue}%` : config.rewardType === "free" ? "1 mes" : config.rewardType === "months" ? `${config.rewardValue} meses` : `RD$${config.rewardValue}`}
              </div>
              <div style={{ fontSize: 13, color: "var(--pri-dk)", marginTop: 4, fontWeight: 600 }}>{rewDesc()}</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--on-sur3)", lineHeight: 1.7 }}>El nuevo cliente que se registre con un código de referido recibe este beneficio automáticamente en su primera suscripción.</div>
          </div></div>
          <div className="card"><div className="card-hdr"><div className="card-ttl">🏆 Premio para el que Refiere</div></div><div className="card-bdy">
            <div style={{ background: "var(--sec-lt)", borderRadius: "var(--r-sm)", padding: "20px", textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 40, fontWeight: 300, color: "var(--sec)" }}>
                {config.referrerType === "pct" ? `${config.referrerValue}%` : config.referrerType === "free" ? "1 mes" : config.referrerType === "months" ? `${config.referrerValue} meses` : `RD$${config.referrerValue}`}
              </div>
              <div style={{ fontSize: 13, color: "var(--sec)", marginTop: 4, fontWeight: 600 }}>{refDesc()}</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--on-sur3)", lineHeight: 1.7 }}>Cada cliente activo que trae un nuevo suscriptor recibe este beneficio aplicado en su próxima renovación.</div>
          </div></div>
          <div className="card" style={{ gridColumn: "1/-1" }}><div className="card-hdr"><div className="card-ttl">💬 Mensaje que comparte el cliente</div></div><div className="card-bdy">
            <div style={{ background: "var(--sur2)", border: "1px solid var(--out)", borderRadius: "var(--r-sm)", padding: "16px 18px", fontSize: 14, lineHeight: 1.8, fontStyle: "italic", color: "var(--on-sur)" }}>"{prevMsg("REF-ALUM-X7K2")}"</div>
          </div></div>
        </div>
      )}

      {tab === "codes" && (
        <div className="card"><div className="card-hdr"><div className="card-ttl">Códigos por Suscriptor</div></div>
          <div className="twrap"><table>
            <thead><tr><th>Cliente</th><th>Código de Referido</th><th>Referidos</th><th>Premio acumulado</th></tr></thead>
            <tbody>{LIC_CLIENTS.map((c, i) => {
              const refs = lista.filter(r => r.referrer === c.empresa);
              const act = refs.filter(r => r.estado === "Activo").length;
              return (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{c.empresa}</td>
                  <td><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: "var(--pri)", fontWeight: 600, background: "var(--pri-lt)", padding: "3px 10px", borderRadius: 20 }}>{c.code}</span></td>
                  <td><b>{refs.length}</b> <span style={{ color: "var(--on-sur3)", fontSize: 12 }}>({act} activos)</span></td>
                  <td>{act > 0 ? <span className="chip chip-filled-sec">{act}× {refDesc()}</span> : <span style={{ color: "var(--on-sur4)", fontSize: 12 }}>Sin referidos</span>}</td>
                </tr>
              );
            })}</tbody>
          </table></div>
        </div>
      )}

      {tab === "history" && (
        <div className="card"><div className="card-hdr"><div className="card-ttl">Historial de Referidos</div></div>
          <div className="twrap"><table>
            <thead><tr><th>Referidor</th><th>Nuevo Cliente</th><th>Código</th><th>Fecha</th><th>Plan</th><th>Estado</th><th>Premios</th><th></th></tr></thead>
            <tbody>
              {lista.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: 48, color: "var(--on-sur4)" }}>Sin referidos registrados</td></tr>}
              {lista.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>{r.referrer}</td>
                  <td><div style={{ fontWeight: 500 }}>{r.referred}</div><div style={{ fontSize: 11, color: "var(--on-sur3)" }}>{r.email}</div></td>
                  <td><span className="mono" style={{ fontSize: 11, color: "var(--pri)" }}>{r.refCode}</span></td>
                  <td className="mono" style={{ fontSize: 12 }}>{r.fecha}</td>
                  <td><span className="chip">{r.plan}</span></td>
                  <td><span className={`chip ${statusCls[r.estado] || "chip"}`}>{r.estado}</span></td>
                  <td><span style={{ fontSize: 12, color: r.rewarded ? "var(--sec)" : "var(--on-sur4)", fontWeight: r.rewarded ? 600 : 400 }}>{r.rewarded ? "✓ " : ""}{r.rewardDesc}</span></td>
                  <td>{!r.rewarded && r.estado !== "Cancelado" && <button style={{ background: "var(--sec-lt)", color: "var(--sec)", border: "1px solid #a8d5b5", borderRadius: 20, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 11, padding: "4px 10px" }} onClick={() => applyReward(r.id)}>Aplicar</button>}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {/* CONFIG MODAL */}
      {showConfig && (
        <div className="modal-bd" onClick={e => { if (e.target === e.currentTarget) setShowConfig(false); }}>
          <div className="modal" style={{ maxWidth: 580 }}>
            <div className="modal-hdr"><div className="modal-ttl">⚙️ Configurar Programa</div><button className="icon-btn" onClick={() => setShowConfig(false)}>✕</button></div>
            <div className="modal-bdy">
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--on-sur3)", marginBottom: 10 }}>🎁 Premio para el Nuevo Cliente</div>
              <div className="fgrid f2" style={{ gap: 12, marginBottom: 20 }}>
                <div className="fld"><label>Tipo</label><select value={config.rewardType} onChange={cf("rewardType")}>{REWARD_TYPES.map(t => <option key={t.id} value={t.id}>{t.label} — {t.desc}</option>)}</select></div>
                {config.rewardType !== "free" && <div className="fld"><label>{config.rewardType === "pct" ? "%" : config.rewardType === "months" ? "Meses" : "RD$"}</label><input type="number" min="1" value={config.rewardValue} onChange={cf("rewardValue")} /></div>}
                <div className="fld" style={{ gridColumn: "1/-1" }}><label>Preview</label><div style={{ background: "var(--pri-lt)", borderRadius: "var(--r-sm)", padding: "10px 14px", fontSize: 13, color: "var(--pri-dk)", fontWeight: 600 }}>{rewDesc()}</div></div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--on-sur3)", marginBottom: 10 }}>🏆 Premio para el que Refiere</div>
              <div className="fgrid f2" style={{ gap: 12, marginBottom: 20 }}>
                <div className="fld"><label>Tipo</label><select value={config.referrerType} onChange={cf("referrerType")}>{REWARD_TYPES.map(t => <option key={t.id} value={t.id}>{t.label} — {t.desc}</option>)}</select></div>
                {config.referrerType !== "free" && <div className="fld"><label>{config.referrerType === "pct" ? "%" : config.referrerType === "months" ? "Meses" : "RD$"}</label><input type="number" min="1" value={config.referrerValue} onChange={cf("referrerValue")} /></div>}
                <div className="fld" style={{ gridColumn: "1/-1" }}><label>Preview</label><div style={{ background: "var(--sec-lt)", borderRadius: "var(--r-sm)", padding: "10px 14px", fontSize: 13, color: "var(--sec)", fontWeight: 600 }}>{refDesc()}</div></div>
              </div>
              <div className="fld"><label>Mensaje ({"{CODE}"} y {"{REWARD}"} se reemplazan automáticamente)</label><textarea value={config.message} onChange={cf("message")} style={{ background: "var(--sur2)", border: "1px solid var(--out)", borderRadius: "var(--r-sm)", padding: "9px 12px", fontFamily: "inherit", fontSize: 13, color: "var(--on-sur)", outline: "none", width: "100%", resize: "vertical", minHeight: 68 }} /></div>
            </div>
            <div className="modal-ftr"><button className="btn btn-text" onClick={() => setShowConfig(false)}>Cancelar</button><button className="btn btn-filled" onClick={() => setShowConfig(false)}>Guardar</button></div>
          </div>
        </div>
      )}

      {/* NEW REFERRAL MODAL */}
      {newModal && (
        <div className="modal-bd" onClick={e => { if (e.target === e.currentTarget) setNewModal(false); }}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-hdr"><div className="modal-ttl">Registrar Referido</div><button className="icon-btn" onClick={() => setNewModal(false)}>✕</button></div>
            <div className="modal-bdy">
              <div style={{ background: "var(--pri-lt)", borderRadius: "var(--r-sm)", padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "var(--pri-dk)" }}>
                Referido recibe: <b>{rewDesc()}</b> · Referidor recibe: <b>{refDesc()}</b>
              </div>
              <div className="fgrid" style={{ gap: 13 }}>
                <div className="fld"><label>Cliente que refiere *</label>
                  <select value={newForm.referrer} onChange={nf("referrer")}>
                    <option value="">— Seleccionar —</option>
                    {LIC_CLIENTS.map(c => <option key={c.empresa} value={c.empresa}>{c.empresa} ({c.code})</option>)}
                  </select>
                </div>
                <div className="fld"><label>Empresa referida *</label><input value={newForm.referred} onChange={nf("referred")} placeholder="Nuevo cliente" /></div>
                <div className="fld"><label>Email</label><input value={newForm.email} onChange={nf("email")} placeholder="contacto@empresa.do" /></div>
                <div className="fld"><label>Plan de interés</label>
                  <select value={newForm.plan} onChange={nf("plan")}><option>Básico</option><option>Pro</option><option>Empresarial</option></select>
                </div>
              </div>
            </div>
            <div className="modal-ftr"><button className="btn btn-text" onClick={() => setNewModal(false)}>Cancelar</button><button className="btn btn-filled" onClick={addRef}>Registrar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
