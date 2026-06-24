export default function ComingSoon({ name, icon, message }) {
  return (
    <div className="card" style={{ padding: "80px 40px", textAlign: "center", border: "1px solid var(--out)", boxShadow: "none" }}>
      <div style={{ width: 64, height: 64, background: "var(--pri-light)", borderRadius: "var(--r-xl)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 20px" }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: 400, color: "var(--on-sur)", marginBottom: 8 }}>{name}</div>
      <div style={{ fontSize: 14, color: "var(--on-sur3)", maxWidth: 360, margin: "0 auto" }}>
        {message || "Este módulo estará disponible próximamente."}
      </div>
    </div>
  );
}
