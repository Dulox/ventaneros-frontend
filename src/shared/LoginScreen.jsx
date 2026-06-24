import { useState } from "react";
import { loginWithEmail, signupWithEmail } from "../api.js";
import { useT } from "../i18n/index.jsx";

export const DEFAULT_BRAND = {
  nombre: "Mi Empresa",
  slogan: "Sistema de Gestión de Ventanas",
  logo: "",
  colorPri: "#1a73e8",
  colorSec: "#188038",
  iniciales: "ME",
};

export default function LoginScreen({ onUnlock, brand }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [ld, setLd] = useState(false);
  const b = brand || DEFAULT_BRAND;
  const { t } = useT();

  async function go() {
    setErr(""); setInfo(""); setLd(true);
    try {
      if (mode === "login") {
        await loginWithEmail(email.trim(), password);
        onUnlock();
      } else {
        const data = await signupWithEmail(email.trim(), password);
        if (data.access_token) {
          onUnlock();
        } else {
          setInfo(t("auth.confirmEmail"));
          setMode("login");
        }
      }
    } catch (e) {
      setErr(e.message || t("common.error"));
    } finally {
      setLd(false);
    }
  }

  return (
    <div className="lic-screen">
      <div className="lic-box">
        {b.logo
          ? <img src={b.logo} style={{ width: 80, height: 80, objectFit: "contain", borderRadius: 16, marginBottom: 12, display: "block", marginLeft: "auto", marginRight: "auto" }} alt="logo" />
          : <div className="lic-icon" style={{ background: b.colorPri, color: "#fff", fontSize: 28, width: 64, height: 64, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontWeight: 700 }}>{b.iniciales.slice(0, 2)}</div>}
        <div className="lic-title" style={{ color: b.colorPri || "var(--pri)" }}>{b.nombre}</div>
        <div className="lic-sub">{b.slogan}</div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16, justifyContent: "center" }}>
          <button onClick={() => { setMode("login"); setErr(""); setInfo(""); }} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, background: mode === "login" ? b.colorPri : "#eee", color: mode === "login" ? "#fff" : "#555" }}>{t("auth.login")}</button>
          <button onClick={() => { setMode("signup"); setErr(""); setInfo(""); }} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, background: mode === "signup" ? b.colorPri : "#eee", color: mode === "signup" ? "#fff" : "#555" }}>{t("auth.signup")}</button>
        </div>

        <div className="lic-lbl">{t("auth.email")}</div>
        <input className="lic-in" type="email" placeholder={t("auth.emailPlaceholder")} value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} />
        <div className="lic-lbl" style={{ marginTop: 10 }}>{t("auth.password")}</div>
        <input className="lic-in" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} />

        <button className="lic-btn" style={{ background: b.colorPri, marginTop: 14 }} onClick={go} disabled={ld}>
          {ld ? t("auth.verifying") : mode === "login" ? t("auth.login") : t("auth.signup")}
        </button>
        {err && <div className="lic-err">{err}</div>}
        {info && <div className="lic-hint" style={{ color: b.colorPri }}>{info}</div>}
      </div>
    </div>
  );
}
