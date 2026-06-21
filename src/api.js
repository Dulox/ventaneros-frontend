// ═══ SUPABASE + BACKEND API CLIENT ═══════════════════════════════════════════
const SUPABASE_URL = "https://opoumjothkwxulkviaeq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_d6grmH4lhCb4VzmpWCDbbw_NucD_zev";
const API_URL = "https://ventaneros-backend-production.up.railway.app";

const SESSION_KEY = "vent_session";

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ── AUTH ──────────────────────────────────────────────────────────────────
export async function loginWithEmail(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.msg || "No se pudo iniciar sesión.");
  }
  saveSession(data);
  return data;
}

export async function signupWithEmail(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.msg || "No se pudo crear la cuenta.");
  }
  if (data.access_token) saveSession(data);
  return data;
}

export function logout() {
  clearSession();
}

export function isLoggedIn() {
  return !!getAccessToken();
}

function getAccessToken() {
  const s = loadSession();
  return s?.access_token || null;
}

// ── BACKEND API ───────────────────────────────────────────────────────────
async function apiPost(path, body) {
  const token = getAccessToken();
  if (!token) throw new Error("No has iniciado sesión.");

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    const data = await res.json().catch(() => ({}));
    const msg = data.detail || "Token inválido. Inicia sesión de nuevo.";
    clearSession();
    throw new Error(msg);
  }
  if (res.status === 403) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Tu licencia no está activa.");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data.detail?.errors?.join(", ") || data.detail || `Error ${res.status}`;
    throw new Error(msg);
  }
  return res;
}

export async function calcularEnServidor(tipo, datos) {
  const res = await apiPost("/api/calc", { tipo, ...datos });
  return res.json();
}

// ── SISCOP product catalog (names only; recipes stay on the backend) ──
export async function listarProductosSiscop() {
  const token = getAccessToken();
  if (!token) throw new Error("No has iniciado sesión.");
  const res = await fetch(`${API_URL}/api/calc/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("No se pudieron cargar los productos.");
  return res.json(); // [{cod_prod, nombre, serie}, ...]
}

export async function descargarOrdenPDF(lines, info) {
  const res = await apiPost("/api/pdf/orden", { lines, info });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Orden-${info.numero || "001"}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
cat >> src/api.js << 'ENDOFFILE'

// ── SISCOP product catalog (names only; recipes stay on the backend) ──
export async function listarProductosSiscop() {
  const token = getAccessToken();
  if (!token) throw new Error("No has iniciado sesión.");
  const res = await fetch(`${API_URL}/api/calc/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("No se pudieron cargar los productos.");
  return res.json();
}
ENDOFFILE
