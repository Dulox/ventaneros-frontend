// ═══ DEVICE FINGERPRINTING ══════════════════════════════════════════════════
// Generates a stable device ID that survives page refreshes but changes
// if the user clears localStorage or switches to a different device/browser.
//
// Strategy: UUID stored in localStorage + browser fingerprint hash combined.
// - UUID alone: easy to copy between devices (copy localStorage)
// - Fingerprint alone: can change with browser updates
// - Combined: much harder to spoof, still stable for normal use

const DEVICE_KEY = "vent_device_id";

function getFingerprint() {
  const parts = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height + "x" + screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency || "",
    navigator.platform || "",
  ];
  return parts.join("|");
}

// Simple non-crypto hash (FNV-1a variant)
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

function getOrCreateUUID() {
  let uuid = localStorage.getItem(DEVICE_KEY);
  if (!uuid) {
    uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
    });
    localStorage.setItem(DEVICE_KEY, uuid);
  }
  return uuid;
}

export function getDeviceId() {
  const uuid = getOrCreateUUID();
  const fp   = hash(getFingerprint());
  return `${uuid}::${fp}`;
}

export function getDeviceInfo() {
  const ua = navigator.userAgent;
  let browser = "Navegador desconocido";
  if (ua.includes("Chrome"))  browser = "Chrome";
  else if (ua.includes("Safari"))  browser = "Safari";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edge"))    browser = "Edge";

  let os = "OS desconocido";
  if (ua.includes("iPhone"))  os = "iPhone";
  else if (ua.includes("iPad"))    os = "iPad";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("Mac"))     os = "Mac";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Linux"))   os = "Linux";

  return `${os} · ${browser}`;
}
