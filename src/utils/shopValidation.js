import { openDB } from "idb";

const DB_NAME = "LoyVaultShop";
const DB_VERSION = 1;

async function getDB() {
  return openDB(DB_NAME, DB_VERSION);
}

export function validateShopName(name) {
  const raw = name == null ? "" : String(name);
  const trimmed = raw.trim();

  if (!trimmed) {
    return { valid: false, error: "Shop name is required" };
  }
  if (trimmed.length < 3) {
    return { valid: false, error: "Shop name must be at least 3 characters" };
  }
  if (trimmed.length > 50) {
    return { valid: false, error: "Shop name cannot exceed 50 characters" };
  }
  if (trimmed !== raw) {
    // leading or trailing spaces
    return { valid: false, error: "Shop name cannot have leading or trailing spaces" };
  }

  // Allowed: letters, numbers, spaces, hyphens, apostrophes
  const pattern = /^[A-Za-z0-9 '\-]+$/;
  if (!pattern.test(trimmed)) {
    return { valid: false, error: "Shop name contains invalid characters" };
  }

  return { valid: true, error: null };
}

export function validatePhone(phone) {
  const raw = phone == null ? "" : String(phone).trim();
  if (!raw) {
    return { valid: true, error: null };
  }

  // Basic patterns for common cases
  const patterns = [
    /^\+?\d{1,3}[-\s]?\d{7,14}$/, // +CC-XXXXXXXX, +CC X..., +CCXXXXXXXX
    /^\+?\d{1,3}\s?\(\d{2,4}\)\s?\d{3,4}[-\s]?\d{3,4}$/, // +1 (555) 123-4567 style
    /^\d{10,14}$/, // plain digits
  ];

  const ok = patterns.some((re) => re.test(raw));
  if (!ok) {
    return { valid: false, error: "Phone number format looks invalid" };
  }

  return { valid: true, error: null };
}

export function formatPhone(phone) {
  const raw = phone == null ? "" : String(phone);
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  // Simple heuristic: if starts with country code 91 and length 12, format as +91-XXXXXXXXXX
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91-${digits.slice(2)}`;
  }

  // If length 11 and starts with 1 (US-like): +1 (AAA) BBB-CCCC
  if (digits.length === 11 && digits.startsWith("1")) {
    const area = digits.slice(1, 4);
    const mid = digits.slice(4, 7);
    const last = digits.slice(7);
    return `+1 (${area}) ${mid}-${last}`;
  }

  // Fallback: group into blocks of 3-4
  if (digits.length === 10) {
    const area = digits.slice(0, 3);
    const mid = digits.slice(3, 6);
    const last = digits.slice(6);
    return `(${area}) ${mid}-${last}`;
  }

  return digits;
}

export async function isShopNameTaken(name) {
  const trimmed = name == null ? "" : String(name).trim();
  if (!trimmed) return false;
  const target = trimmed.toLowerCase();

  try {
    const db = await getDB();
    const tx = db.transaction("shops");
    const store = tx.store;
    let cursor = await store.openCursor();
    while (cursor) {
      const value = cursor.value;
      if (value?.shopName && String(value.shopName).trim().toLowerCase() === target) {
        return true;
      }
      cursor = await cursor.continue();
    }
    await tx.done;
    return false;
  } catch {
    // On error, fail open (treat as not taken)
    return false;
  }
}

export default {
  validateShopName,
  validatePhone,
  formatPhone,
  isShopNameTaken,
};
