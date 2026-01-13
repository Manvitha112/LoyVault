import { getShop } from "./shopIndexedDB";

const KEYS = {
  shopDid: "loyvault_shopDID",
  shopName: "loyvault_shopName",
  shopEmail: "loyvault_shopEmail",
  role: "loyvault_userRole",
  auth: "loyvault_isAuthenticated",
  lastLogin: "loyvault_lastLogin",
  failedAttempts: "loyvault_shopFailedAttempts",
  lockedUntil: "loyvault_shopLockedUntil",
  rememberedShop: "loyvault_rememberedShop",
};

const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const REMEMBER_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function checkShopSession() {
  try {
    const did = localStorage.getItem(KEYS.shopDid);
    const auth = localStorage.getItem(KEYS.auth) === "true";
    const role = localStorage.getItem(KEYS.role);
    const lastLoginStr = localStorage.getItem(KEYS.lastLogin);

    if (!did || !auth || role !== "shopkeeper" || !lastLoginStr) {
      return { valid: false };
    }

    const lastLogin = new Date(lastLoginStr).getTime();
    if (Number.isNaN(lastLogin) || Date.now() - lastLogin > SESSION_DURATION_MS) {
      return { valid: false };
    }

    const shop = await getShop(did);
    if (!shop) {
      return { valid: false };
    }

    return { valid: true, shopData: shop };
  } catch {
    return { valid: false };
  }
}

export function setShopSession(shopData) {
  if (!shopData || !shopData.shopDID) return;
  try {
    localStorage.setItem(KEYS.shopDid, shopData.shopDID);
    if (shopData.shopName) localStorage.setItem(KEYS.shopName, shopData.shopName);
    if (shopData.email) localStorage.setItem(KEYS.shopEmail, shopData.email);
    localStorage.setItem(KEYS.role, "shopkeeper");
    localStorage.setItem(KEYS.auth, "true");
    localStorage.setItem(KEYS.lastLogin, new Date().toISOString());
  } catch {
    // ignore
  }
}

export function clearShopSession() {
  try {
    localStorage.removeItem(KEYS.shopDid);
    localStorage.removeItem(KEYS.shopName);
    localStorage.removeItem(KEYS.shopEmail);
    localStorage.removeItem(KEYS.role);
    localStorage.removeItem(KEYS.auth);
    localStorage.removeItem(KEYS.lastLogin);
    localStorage.removeItem(KEYS.failedAttempts);
    localStorage.removeItem(KEYS.lockedUntil);
  } catch {
    // ignore
  }
}

export function refreshShopSession() {
  try {
    localStorage.setItem(KEYS.lastLogin, new Date().toISOString());
  } catch {
    // ignore
  }
}

export function trackShopFailedAttempts() {
  try {
    const current = parseInt(localStorage.getItem(KEYS.failedAttempts) || "0", 10) || 0;
    const next = current + 1;
    localStorage.setItem(KEYS.failedAttempts, String(next));
    return next;
  } catch {
    return 0;
  }
}

export function isShopAccountLocked() {
  try {
    const lockedUntilStr = localStorage.getItem(KEYS.lockedUntil);
    if (!lockedUntilStr) return { locked: false };
    const lockedUntil = parseInt(lockedUntilStr, 10);
    if (Number.isNaN(lockedUntil)) return { locked: false };
    const now = Date.now();
    if (now < lockedUntil) {
      return { locked: true, timeRemaining: lockedUntil - now };
    }
    return { locked: false };
  } catch {
    return { locked: false };
  }
}

export function lockShopAccount(durationMinutes = 5) {
  const durationMs = durationMinutes * 60 * 1000;
  const lockedUntil = Date.now() + durationMs;
  try {
    localStorage.setItem(KEYS.lockedUntil, String(lockedUntil));
  } catch {
    // ignore
  }
  return durationMs;
}

export function unlockShopAccount() {
  try {
    localStorage.removeItem(KEYS.lockedUntil);
    localStorage.removeItem(KEYS.failedAttempts);
  } catch {
    // ignore
  }
}

// -------------------------
// Remember Me helpers
// -------------------------

export function saveRememberedShop(shopDID, email) {
  if (!shopDID) return;
  const payload = {
    shopDID,
    email: email ? String(email).trim().toLowerCase() : null,
    expiresAt: Date.now() + REMEMBER_DURATION_MS,
  };
  try {
    const json = JSON.stringify(payload);
    const encoded = typeof window !== "undefined" && window.btoa ? window.btoa(json) : json;
    localStorage.setItem(KEYS.rememberedShop, encoded);
  } catch {
    // ignore
  }
}

export function getRememberedShop() {
  try {
    const stored = localStorage.getItem(KEYS.rememberedShop);
    if (!stored) return null;
    let decoded = stored;
    try {
      if (typeof window !== "undefined" && window.atob) {
        decoded = window.atob(stored);
      }
    } catch {
      // if base64 decode fails, assume plain JSON
    }
    const data = JSON.parse(decoded);
    if (!data || typeof data !== "object") {
      localStorage.removeItem(KEYS.rememberedShop);
      return null;
    }
    if (!data.expiresAt || Date.now() > data.expiresAt) {
      localStorage.removeItem(KEYS.rememberedShop);
      return null;
    }
    return { shopDID: data.shopDID, email: data.email || "" };
  } catch {
    try {
      localStorage.removeItem(KEYS.rememberedShop);
    } catch {
      // ignore
    }
    return null;
  }
}

export function clearRememberedShop() {
  try {
    localStorage.removeItem(KEYS.rememberedShop);
  } catch {
    // ignore
  }
}
