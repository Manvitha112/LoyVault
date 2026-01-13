// Basic encryption helpers for sensitive wallet data.
// NOTE: This is a simplified demo implementation. In a production
// wallet, you would use a well-reviewed key derivation and storage
// strategy and carefully manage key lifecycles.

const ENC_VERSION = "1";

function getCrypto() {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    return window.crypto;
  }
  return null;
}

function toBase64(bytes) {
  if (typeof window !== "undefined" && window.btoa) {
    let binary = "";
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    return window.btoa(binary);
  }
  return Buffer.from(bytes).toString("base64");
}

function fromBase64(str) {
  if (typeof window !== "undefined" && window.atob) {
    const binary = window.atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  return new Uint8Array(Buffer.from(str, "base64"));
}

async function deriveKey(password, salt) {
  const crypto = getCrypto();
  if (!crypto) {
    throw new Error("Web Crypto API not available for encryption");
  }

  const enc = new TextEncoder();
  const material = await crypto.subtle.importKey(
    "raw",
    enc.encode(password || "loyvault-default-password"),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptData(data, password) {
  const crypto = getCrypto();
  if (!crypto) {
    // Fallback: store JSON as-is (NOT secure, but avoids crashes in unsupported envs)
    return JSON.stringify({ v: ENC_VERSION, raw: data });
  }

  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext),
  );

  const combined = new Uint8Array(salt.length + iv.length + ciphertext.length);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(ciphertext, salt.length + iv.length);

  return `v${ENC_VERSION}:${toBase64(combined)}`;
}

export async function decryptData(encryptedData, password) {
  if (!encryptedData) return null;
  const crypto = getCrypto();
  try {
    if (!encryptedData.startsWith("v")) {
      // Legacy / raw JSON
      return JSON.parse(encryptedData);
    }
    const [versionPart, payload] = encryptedData.split(":", 2);
    const version = versionPart.slice(1);
    if (version !== ENC_VERSION) {
      throw new Error("Unsupported encryption version");
    }

    if (!crypto) {
      // Cannot decrypt securely in this environment
      throw new Error("Web Crypto API not available for decryption");
    }

    const combined = fromBase64(payload);
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const ciphertext = combined.slice(28);

    const key = await deriveKey(password, salt);
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext,
    );
    const json = new TextDecoder().decode(plaintext);
    return JSON.parse(json);
  } catch (error) {
    console.error("[encryption] decryptData failed", error);
    return null;
  }
}

export async function hashPIN(pin) {
  const crypto = getCrypto();
  if (!pin) return null;
  if (!crypto) {
    // Weak fallback
    return `fallback-${pin}`;
  }
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(pin));
  const bytes = new Uint8Array(digest);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default {
  encryptData,
  decryptData,
  hashPIN,
};
