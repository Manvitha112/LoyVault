// Utilities for generating simulated shop DIDs and key pairs.

function getCrypto() {
  if (typeof window !== "undefined" && window.crypto) return window.crypto;
  if (typeof globalThis !== "undefined" && globalThis.crypto) return globalThis.crypto;
  return null;
}

function randomBytes(length) {
  const crypto = getCrypto();
  if (crypto && crypto.getRandomValues) {
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    return arr;
  }
  // Fallback: not cryptographically secure, but avoids runtime errors in non-browser envs
  const arr = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) {
    arr[i] = Math.floor(Math.random() * 256);
  }
  return arr;
}

function randomHex(length) {
  const bytes = randomBytes(Math.ceil(length / 2));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, length);
}

function randomAlphanumeric(length) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

export function generateKeyPair() {
  // For this demo we simulate a keypair as random 64-char hex strings.
  const publicKey = randomHex(64);
  const privateKey = randomHex(64);
  return { publicKey, privateKey };
}

export function generateShopDID() {
  const suffix = randomAlphanumeric(12);
  const shopDID = `did:loyvault:shop-${suffix}`;
  const { publicKey, privateKey } = generateKeyPair();

  return {
    shopDID,
    publicKey,
    privateKey,
    createdAt: new Date().toISOString(),
    version: "1.0",
  };
}

export default {
  generateShopDID,
  generateKeyPair,
};
