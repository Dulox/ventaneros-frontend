/**
 * CONTROL DE USUARIOS
 *
 * El admin de cada empresa puede:
 *  - Ver y gestionar sus usuarios
 *  - Asignar permisos personalizados por módulo y acción
 *  - Configurar cuántos usuarios tiene disponibles (según su plan)
 *  - Ver quién está conectado (simulado)
 *
 * Estructura de permisos:
 *  permisos: {
 *    [modulo_id]: {
 *      acceso: boolean,          // puede ver el módulo
 *      acciones: {               // permisos granulares dentro del módulo
 *        [accion]: boolean
 *      }
 *    }
 *  }
 */
import { useState } from "react";
import { MODULES } from "../../core/ModuleRegistry.js";

// ── Acciones disponibles por módulo ─────────────────────────────────────────
const ACCIONES = {
  dashboard:          [],
  calculadoras:       ["Calcular", "Agregar a orden"],
  presupuestos:       ["Ver cotizaciones", "Crear", "Editar", "Eliminar", "Aprobar", "Enviar a Producción", "Descargar PDF", "Ver costos"],
  clientes:           ["Ver clientes", "Crear", "Editar", "Eliminar"],
  facturacion:        ["Ver facturas", "Crear", "Anular", "Ver costos", "Descargar PDF", "Registrar pago"],
  ordenes:            ["Ver órdenes", "Crear", "Editar", "Cambiar estado", "Autorizar"],
  proveedores:        ["Ver", "Crear", "Editar", "Eliminar"],
  inventario:         ["Ver stock", "Ajustar stock", "Crear materiales", "Ver costos"],
  precios:            ["Ver precios", "Editar precios", "Ver costos"],
  "cuentas-por-pagar":["Ver", "Registrar pago"],
  caja:               ["Ver caja", "Cuadre de caja", "Cerrar caja"],
  contabilidad:       ["Ver", "Crear asientos"],
  despachos:          ["Ver", "Actualizar estado"],
  instalaciones:      ["Ver", "Asignar instalador", "Registrar pago"],
  licencias:          ["Ver licencias", "Crear licencia", "Suspender", "Liberar dispositivo", "Gestionar módulos"],
  referidos:          ["Ver", "Configurar programa"],
};

// ── Permisos predeterminados al crear usuario (todo desactivado) ────────────
function emptyPermisos() {
  const p = {};
  for (const m of MODULES) {
    p[m.id] = {
      acceso: false,
      acciones: Object.fromEntries((ACCIONES[m.id] || []).map(a => [a, false])),
    };
  }
  return p;
}

// ── Preset: acceso completo (para primer usuario admin) ─────────────────────
function fullPermisos() {
  const p = {};
  for (const m of MODULES) {
    p[m.id] = {
      acceso: true,
      acciones: Object.fromEntries((ACCIONES[m.id] || []).map(a => [a, true])),
    };
  }
  return p;
}

// ── Demo data ────────────────────────────────────────────────────────────────
const DEMO_USERS = [
  {
    id: 1, nombre: "Mario Vuk", email: "mario@ventaneros.do", tel: "809-555-0001",
    rol: "Administrador", activo: true, lastSeen: new Date().toISOString(), isAdmin: true,
    permisos: fullPermisos(),
  },
  {
    id: 2, nombre: "Carmen Pérez", email: "carmen@ventaneros.do", tel: "829-555-0002",
    rol: "Vendedora", activo: true, lastSeen: new Date(Date.now() - 3600000).toISOString(), isAdmin: false,
    permisos: (() => {
      const p = emptyPermisos();
      ["dashboard","calculadoras","presupuestos","clientes","facturacion"].forEach(id => {
        p[id].acceso = true;
        if (p[id].acciones) Object.keys(p[id].acciones).forEach(a => {
          if (!["Eliminar","Ver costos","Anular","Autorizar"].includes(a)) p[id].acciones[a] = true;
        });
      });
      return p;
    })(),
  },
  {
    id: 3, nombre: "Roberto Santos", email: "roberto@ventaneros.do", tel: "849-555-0003",
    rol: "Producción", activo: true, lastSeen: new Date(Date.now() - 7200000).toISOString(), isAdmin: false,
    permisos: (() => {
      const p = emptyPermisos();
      ["dashboard","calculadoras","ordenes","inventario"].forEach(id => {
        p[id].acceso = true;
        if (p[id].acciones) Object.keys(p[id].acciones).forEach(a => {
          p[id].acciones[a] = true;
        });
      });
      return p;
    })(),
  },
];

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 2)   return "Ahora mismo";
  if (min < 60)  return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24)    return `Hace ${h}h`;
  return `Hace ${Math.floor(h / 24)}d`;
}

function isOnline(iso) {
  return Date.now() - new Date(iso).getTime() < 300000; // 5 min
}

// ═══════════════════════════════════════════════════════════════════════════
// PERMISOS EDITOR — panel de permisos por módulo
// ═══════════════════════════════════════════════════════════════════════════
function PermisosEditor({ permisos, onChange }) {
  const [openCat, setOpenCat] = useState(null);

  // Group modules by category (exclude admin-only ones from client users)
  const cats = {};
  for (const m of MODULES.filter(m => !m.soloAdmin)) {
    if (!cats[m.categoria]) cats[m.categoria] = [];
    cats[m.categoria].push(m);
  }

  function toggleModulo(id, val) {
    const next = { ...permisos };
    next[id] = { ...next[id], acceso: val };
    // If disabling module, also disable all actions
    if (!val) {
      next[id].acciones = Object.fromEntries(
        Object.keys(next[id].acciones || {}).map(a => [a, false])
      );
    }
    onChange(next);
  }

  function toggleAccion(modId, accion, val) {
    const next = { ...permisos };
    next[modId] = {
      ...next[modId],
      acciones: { ...next[modId].acciones, [accion]: val },
    };
    onChange(next);
  }

  function toggleAllInMod(modId, val) {
    const next = { ...permisos };
    next[modId] = {
      acceso: val,
      acciones: Object.fromEntries(
        Object.keys(next[modId]?.acciones || {}).map(a => [a, val])
      ),
    };
    onChange(next);
  }

  function toggleAllInCat(mods, val) {
    const next = { ...permisos };
    mods.forEach(m => {
      next[m.id] = {
        acceso: val,
        acciones: Object.fromEntries(
          Object.keys(next[m.id]?.acciones || {}).map(a => [a, val])
        ),
      };
    });
    onChange(next);
  }

  const totalActivos = MODULES.filter(m => !m.soloAdmin && permisos[m.id]?.acceso).length;

  return (
    <div>
      {/* Summary bar */}
      <div style={{ background: "var(--pri-lt)", border: "1px solid var(--pri-lt2)", borderRadius: "var(--r-sm)", padding: "10px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, color: "var(--pri-dk)" }}>
          <b>{totalActivos}</b> módulo(s) activo(s) para este usuario
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-sm btn-outlined" onClick={() => {
            const next = {};
            MODULES.filter(m => !m.soloAdmin).forEach(m => {
              next[m.id] = { acceso: true, acciones: Object.fromEntries((ACCIONES[m.id]||[]).map(a=>[a,true])) };
            });
            // keep admin modules as they were
            MODULES.filter(m => m.soloAdmin).forEach(m => { next[m.id] = permisos[m.id]; });
            onChange(next);
          }}>Activar todo</button>
          <button className="btn btn-sm btn-outlined" onClick={() => {
            const next = {};
            MODULES.forEach(m => {
              next[m.id] = { acceso: false, acciones: Object.fromEntries((ACCIONES[m.id]||[]).map(a=>[a,false])) };
            });
            onChange(next);
          }}>Desactivar todo</button>
        </div>
      </div>

      {/* Categories */}
      {Object.entries(cats).map(([cat, mods]) => {
        const catActive = mods.filter(m => permisos[m.id]?.acceso).length;
        const isOpen = openCat === cat;
        return (
          <div key={cat} style={{ marginBottom: 10, border: "1px solid var(--out)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
            {/* Category header */}
            <div
              onClick={() => setOpenCat(isOpen ? null : cat)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--sur2)", cursor: "pointer", userSelect: "none" }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, flex: 1, color: "var(--on-sur)" }}>{cat}</span>
              <span style={{ fontSize: 12, color: catActive > 0 ? "var(--sec)" : "var(--on-sur4)", fontWeight: 600 }}>
                {catActive}/{mods.length} activos
              </span>
              <button
                onClick={e => { e.stopPropagation(); toggleAllInCat(mods, catActive < mods.length); }}
                style={{ fontSize: 11, padding: "3px 10px", background: catActive === mods.length ? "var(--err-lt)" : "var(--sec-lt)", color: catActive === mods.length ? "var(--err)" : "var(--sec)", border: `1px solid ${catActive === mods.length ? "#fad2cf" : "#a8d5b5"}`, borderRadius: 20, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                {catActive === mods.length ? "Desactivar" : "Activar"}
              </button>
              <span style={{ color: "var(--on-sur4)", fontSize: 12 }}>{isOpen ? "▲" : "▼"}</span>
            </div>

            {/* Modules in category */}
            {isOpen && (
              <div style={{ padding: "8px 16px 16px" }}>
                {mods.map(m => {
                  const mp = permisos[m.id] || { acceso: false, acciones: {} };
                  const acciones = ACCIONES[m.id] || [];
                  return (
                    <div key={m.id} style={{ marginTop: 12, padding: "12px 14px", background: mp.acceso ? "var(--sur)" : "var(--sur2)", borderRadius: "var(--r-sm)", border: `1.5px solid ${mp.acceso ? "var(--pri)" : "var(--out)"}`, transition: "all .15s" }}>
                      {/* Module toggle */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: acciones.length > 0 && mp.acceso ? 12 : 0 }}>
                        <span style={{ fontSize: 18 }}>{m.icono}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: mp.acceso ? "var(--on-sur)" : "var(--on-sur3)" }}>{m.nombre}</div>
                          <div style={{ fontSize: 11, color: "var(--on-sur4)", marginTop: 1 }}>{m.descripcion}</div>
                        </div>
                        {/* Toggle switch */}
                        <button
                          onClick={() => toggleModulo(m.id, !mp.acceso)}
                          style={{ width: 48, height: 26, borderRadius: 13, background: mp.acceso ? "var(--pri)" : "var(--sur3)", border: "none", cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0 }}
                        >
                          <span style={{ position: "absolute", top: 3, left: mp.acceso ? 24 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.25)" }} />
                        </button>
                      </div>

                      {/* Actions */}
                      {acciones.length > 0 && mp.acceso && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {acciones.map(a => {
                            const on = mp.acciones?.[a] ?? false;
                            return (
                              <button
                                key={a}
                                onClick={() => toggleAccion(m.id, a, !on)}
                                style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, border: `1px solid ${on ? "var(--pri)" : "var(--out)"}`, background: on ? "var(--pri-lt)" : "var(--sur3)", color: on ? "var(--pri)" : "var(--on-sur4)", cursor: "pointer", fontFamily: "inherit", fontWeight: on ? 600 : 400, transition: "all .15s" }}
                              >
                                {on ? "✓ " : ""}{a}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const EMPTY_FORM = {
  nombre: "", email: "", tel: "", rol: "", activo: true, isAdmin: false,
  permisos: null, // initialized on open
};

export default function Usuarios() {
  const [users, setUsers]       = useState(DEMO_USERS);
  const [maxUsers, setMaxUsers] = useState(5);
  const [view, setView]         = useState("list");   // "list" | "form" | "permisos"
  const [sel, setSel]           = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [permEdit, setPermEdit] = useState(null);     // user being edited permissions
  const [toast, setToast]       = useState("");

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2600); }
  const sf = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  // ── Open new user form ──────────────────────────────────────────────────
  function openNew() {
    setForm({ ...EMPTY_FORM, permisos: emptyPermisos() });
    setSel(null);
    setView("form");
  }

  // ── Open edit ───────────────────────────────────────────────────────────
  function openEdit(u) {
    setForm({ ...u, permisos: JSON.parse(JSON.stringify(u.permisos)) });
    setSel(u);
    setView("form");
  }

  // ── Open permissions panel ──────────────────────────────────────────────
  function openPermisos(u) {
    setPermEdit({ ...u, permisos: JSON.parse(JSON.stringify(u.permisos)) });
    setView("permisos");
  }

  // ── Save user ───────────────────────────────────────────────────────────
  function saveUser() {
    if (!form.nombre.trim() || !form.email.trim()) return;
    if (sel) {
      setUsers(us => us.map(u => u.id === sel.id ? { ...u, ...form } : u));
      showToast("Usuario actualizado ✓");
    } else {
      if (users.length >= maxUsers) { showToast("⚠ Límite de usuarios alcanzado"); return; }
      setUsers(us => [...us, { ...form, id: Date.now(), lastSeen: new Date(0).toISOString() }]);
      showToast("Usuario creado ✓");
    }
    setView("list");
  }

  // ── Save permissions ────────────────────────────────────────────────────
  function savePermisos() {
    setUsers(us => us.map(u => u.id === permEdit.id ? { ...u, permisos: permEdit.permisos } : u));
    showToast("Permisos guardados ✓");
    setView("list");
  }

  // ── Toggle active ───────────────────────────────────────────────────────
  function toggleActivo(id) {
    setUsers(us => us.map(u => u.id === id ? { ...u, activo: !u.activo } : u));
  }

  // ── Delete ──────────────────────────────────────────────────────────────
  function deleteUser(id) {
    if (!confirm("¿Eliminar este usuario? Esta acción no se puede deshacer.")) return;
    setUsers(us => us.filter(u => u.id !== id));
    showToast("Usuario eliminado");
  }

  const online = users.filter(u => isOnline(u.lastSeen) && u.activo).length;

  // ════════════════════════════════════════════════════════════════════════
  // VIEW: PERMISOS
  // ════════════════════════════════════════════════════════════════════════
  if (view === "permisos" && permEdit) return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <button className="btn btn-text" onClick={() => setView("list")}>← Usuarios</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Permisos — {permEdit.nombre}</div>
          <div style={{ fontSize: 12, color: "var(--on-sur3)", marginTop: 2 }}>{permEdit.email} · {permEdit.rol || "Sin rol asignado"}</div>
        </div>
        <button className="btn btn-outlined" onClick={() => setView("list")}>Cancelar</button>
        <button className="btn btn-filled" onClick={savePermisos}>Guardar permisos</button>
      </div>

      <PermisosEditor
        permisos={permEdit.permisos}
        onChange={p => setPermEdit(e => ({ ...e, permisos: p }))}
      />

      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className="btn btn-outlined" onClick={() => setView("list")}>Cancelar</button>
        <button className="btn btn-filled" onClick={savePermisos}>Guardar permisos</button>
      </div>

      {toast && <div className="toast-msg">{toast}</div>}
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════
  // VIEW: FORM (crear / editar usuario)
  // ════════════════════════════════════════════════════════════════════════
  if (view === "form") return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <button className="btn btn-text" onClick={() => setView("list")}>← Usuarios</button>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{sel ? "Editar usuario" : "Nuevo usuario"}</div>
      </div>

      <div style={{ maxWidth: 560 }}>
        <div className="card">
          <div className="card-hdr"><div className="card-ttl">Datos del usuario</div></div>
          <div className="card-bdy">
            <div className="fgrid f2" style={{ gap: 14 }}>
              <div className="fld" style={{ gridColumn: "1/-1" }}>
                <label>Nombre completo *</label>
                <input value={form.nombre} onChange={sf("nombre")} placeholder="Juan Pérez" autoFocus />
              </div>
              <div className="fld">
                <label>Email *</label>
                <input type="email" value={form.email} onChange={sf("email")} placeholder="juan@empresa.com" />
              </div>
              <div className="fld">
                <label>Teléfono</label>
                <input value={form.tel} onChange={sf("tel")} placeholder="809-000-0000" />
              </div>
              <div className="fld">
                <label>Rol / Cargo</label>
                <input value={form.rol} onChange={sf("rol")} placeholder="Vendedor, Cajero, Taller..." />
              </div>
              <div className="fld">
                <label>Estado</label>
                <select value={form.activo ? "activo" : "inactivo"} onChange={e => setForm(f => ({ ...f, activo: e.target.value === "activo" }))}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
              {!sel && (
                <div className="fld" style={{ gridColumn: "1/-1" }}>
                  <label>Contraseña inicial</label>
                  <input type="password" placeholder="Mínimo 8 caracteres" />
                  <div style={{ fontSize: 11, color: "var(--on-sur4)", marginTop: 4 }}>El usuario podrá cambiarla al iniciar sesión</div>
                </div>
              )}
            </div>

            <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--pri-lt)", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Permisos</div>
                <div style={{ fontSize: 12, color: "var(--on-sur3)", marginTop: 2 }}>
                  {sel ? "Configura qué módulos y acciones puede usar este usuario" : "Podrás configurar los permisos después de crear el usuario"}
                </div>
              </div>
              {sel && (
                <button className="btn btn-outlined" onClick={() => {
                  setPermEdit({ ...form });
                  setView("permisos");
                }}>
                  🔐 Editar permisos
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
          <button className="btn btn-outlined" onClick={() => setView("list")}>Cancelar</button>
          <button className="btn btn-filled" onClick={saveUser} disabled={!form.nombre.trim() || !form.email.trim()}>
            {sel ? "Guardar cambios" : "Crear usuario"}
          </button>
        </div>
      </div>

      {toast && <div className="toast-msg">{toast}</div>}
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════
  // VIEW: LIST
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {[
          { l: "Usuarios totales",  n: users.length,                             i: "👥", bg: "var(--sur3)" },
          { l: "Activos",           n: users.filter(u => u.activo).length,       i: "✅", bg: "var(--sec-lt)" },
          { l: "Conectados ahora",  n: online,                                   i: "🟢", bg: online > 0 ? "var(--pri-lt)" : "var(--sur3)" },
          { l: "Límite del plan",   n: `${users.length} / ${maxUsers}`,          i: "🔑", bg: users.length >= maxUsers ? "#fef7e0" : "var(--sec-lt)" },
        ].map(s => (
          <div key={s.l} className="stat-card">
            <div className="stat-icon-wrap" style={{ background: s.bg }}>{s.i}</div>
            <div className="stat-num" style={{ fontSize: typeof s.n === "string" ? 18 : 28 }}>{s.n}</div>
            <div className="stat-lbl">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Plan limit config */}
      <div style={{ background: "var(--sur2)", border: "1px solid var(--out)", borderRadius: "var(--r-sm)", padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 14, color: "var(--on-sur2)", flex: 1 }}>
          <b>Límite de usuarios del plan:</b> Define cuántos usuarios puede tener esta empresa según su suscripción.
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ fontSize: 13, color: "var(--on-sur3)", whiteSpace: "nowrap" }}>Máx. usuarios:</label>
          <input
            type="number" min="1" max="999" value={maxUsers}
            onChange={e => setMaxUsers(parseInt(e.target.value) || 1)}
            style={{ width: 72, padding: "7px 10px", border: "1.5px solid var(--out)", borderRadius: "var(--r-sm)", background: "var(--sur)", fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: "var(--pri)", outline: "none", textAlign: "center" }}
          />
        </div>
        <button
          className="btn btn-filled"
          onClick={openNew}
          disabled={users.length >= maxUsers}
          title={users.length >= maxUsers ? "Límite de usuarios alcanzado" : ""}
        >
          ＋ Nuevo usuario
        </button>
      </div>

      {users.length >= maxUsers && (
        <div style={{ background: "#fef7e0", border: "1px solid #f9ab00", borderRadius: "var(--r-sm)", padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#92400e" }}>
          ⚠ Has alcanzado el límite de {maxUsers} usuario(s). Aumenta el límite arriba para agregar más.
        </div>
      )}

      {/* User cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
        {users.map(u => {
          const online = isOnline(u.lastSeen);
          const modCount = MODULES.filter(m => !m.soloAdmin && u.permisos?.[m.id]?.acceso).length;
          return (
            <div key={u.id} className="card" style={{ opacity: u.activo ? 1 : 0.6 }}>
              <div style={{ display: "flex", gap: 14, padding: "16px 16px 12px" }}>
                {/* Avatar */}
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: u.isAdmin ? "var(--pri)" : "var(--sur3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: u.isAdmin ? "#fff" : "var(--on-sur3)", flexShrink: 0, position: "relative" }}>
                  {u.nombre.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  <span style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: "50%", background: online ? "#22c55e" : "var(--sur4)", border: "2px solid var(--sur)", display: "block" }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--on-sur)" }}>{u.nombre}</div>
                  <div style={{ fontSize: 12, color: "var(--on-sur3)", marginTop: 1 }}>{u.email}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    {u.rol && <span className="chip" style={{ fontSize: 11 }}>{u.rol}</span>}
                    {u.isAdmin && <span className="chip chip-filled-pri" style={{ fontSize: 11 }}>Admin</span>}
                    <span className={`chip ${u.activo ? "chip-filled-sec" : "chip-filled-err"}`} style={{ fontSize: 11 }}>{u.activo ? "Activo" : "Inactivo"}</span>
                  </div>
                </div>
              </div>

              {/* Info row */}
              <div style={{ display: "flex", padding: "10px 16px", borderTop: "1px solid var(--out)", borderBottom: "1px solid var(--out)", gap: 20 }}>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--pri)" }}>{modCount}</div>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "var(--on-sur4)", marginTop: 1 }}>Módulos</div>
                </div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: online ? "#22c55e" : "var(--on-sur4)" }}>{timeAgo(u.lastSeen)}</div>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "var(--on-sur4)", marginTop: 1 }}>Última vez</div>
                </div>
                {u.tel && (
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--on-sur2)" }}>{u.tel}</div>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "var(--on-sur4)", marginTop: 1 }}>Teléfono</div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6, padding: "10px 16px", flexWrap: "wrap" }}>
                <button className="btn btn-sm btn-outlined" onClick={() => openEdit(u)}>✏️ Editar</button>
                <button
                  className="btn btn-sm btn-outlined"
                  onClick={() => openPermisos(u)}
                  style={{ flex: 1 }}
                >
                  🔐 Permisos
                </button>
                <button
                  className="btn btn-sm"
                  onClick={() => toggleActivo(u.id)}
                  style={{ background: u.activo ? "#fce8e6" : "var(--sec-lt)", color: u.activo ? "var(--err)" : "var(--sec)", border: `1px solid ${u.activo ? "#fad2cf" : "#a8d5b5"}`, borderRadius: 20, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 11, padding: "4px 10px" }}
                >
                  {u.activo ? "Desactivar" : "Activar"}
                </button>
                {!u.isAdmin && (
                  <button className="btn btn-sm" onClick={() => deleteUser(u.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--err)", fontSize: 16, padding: "4px 6px" }}>🗑</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {toast && <div className="toast-msg">{toast}</div>}
    </div>
  );
}
