// Password utilities for shopkeeper authentication.
// NOTE: This is a simplified demo and not a full password
// storage strategy for production.

function getCrypto() {
  if (typeof window !== "undefined" && window.crypto) return window.crypto;
  if (typeof globalThis !== "undefined" && globalThis.crypto) return globalThis.crypto;
  return null;
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateSalt() {
  const crypto = getCrypto();
  const length = 16; // 16 bytes
  const arr = new Uint8Array(length);
  if (crypto && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < length; i += 1) {
      arr[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytesToHex(arr);
}

export async function hashPassword(password, salt) {
  const crypto = getCrypto();
  const actualSalt = salt || generateSalt();
  if (!crypto || !crypto.subtle) {
    // Weak fallback: concatenate and hex-encode, not secure but avoids crashes.
    const data = `${actualSalt}:${password}`;
    const fallbackHash = bytesToHex(new TextEncoder().encode(data));
    return { hash: fallbackHash, salt: actualSalt };
  }

  const enc = new TextEncoder();
  const data = enc.encode(`${actualSalt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hash = bytesToHex(new Uint8Array(digest));
  return { hash, salt: actualSalt };
}

export async function verifyPassword(inputPassword, storedHash, salt) {
  if (!storedHash || !salt) return false;
  const { hash } = await hashPassword(inputPassword, salt);
  return hash === storedHash;
}

export function validatePassword(password) {
  const errors = [];
  const value = String(password || "");

  if (value.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(value)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(value)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(value)) {
    errors.push("Password must contain at least one number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  generateSalt,
  hashPassword,
  verifyPassword,
  validatePassword,
};

