const ALPHANUM = "abcdefghijklmnopqrstuvwxyz0123456789";

function getCrypto() {
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    return window.crypto;
  }
  return null;
}

function randomAlphanumeric(length = 12) {
  const crypto = getCrypto();
  if (crypto) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => ALPHANUM[b % ALPHANUM.length])
      .join("");
  }

  // Fallback: not cryptographically strong, but avoids runtime errors in non-browser envs
  let result = "";
  for (let i = 0; i < length; i += 1) {
    const idx = Math.floor(Math.random() * ALPHANUM.length);
    result += ALPHANUM[idx];
  }
  return result;
}

// Very small demo wordlist – in a real wallet you would use a full BIP39 list
const WORDLIST = [
  "alpha",
  "bravo",
  "charlie",
  "delta",
  "echo",
  "foxtrot",
  "golf",
  "hotel",
  "india",
  "juliet",
  "kilo",
  "lima",
  "mike",
  "november",
  "oscar",
  "papa",
  "quebec",
  "romeo",
  "sierra",
  "tango",
  "uniform",
  "victor",
  "whiskey",
  "xray",
  "yankee",
  "zulu",
];

function hashStringToAlnum(input, length = 12) {
  // Simple deterministic hash to map seed phrase -> stable DID id
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  let out = "";
  for (let i = 0; i < length; i += 1) {
    const idx = hash % ALPHANUM.length;
    out += ALPHANUM[idx];
    hash = (hash >>> 1) ^ (hash << 5); // mix a bit
  }
  return out;
}

export function generateDID() {
  const id = randomAlphanumeric(12);
  const did = `did:loyvault:${id}`;

  // Simulated key material – in a real implementation you would generate
  // an asymmetric keypair and keep the private key encrypted.
  const publicKey = `pub_${randomAlphanumeric(24)}`;
  const privateKey = `priv_${randomAlphanumeric(48)}`;

  return {
    did,
    publicKey,
    privateKey,
    createdAt: new Date().toISOString(),
    version: "1.0",
  };
}

export function generateSeedPhrase() {
  const crypto = getCrypto();
  const words = [];

  for (let i = 0; i < 12; i += 1) {
    let idx;
    if (crypto) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      idx = buf[0] % WORDLIST.length;
    } else {
      idx = Math.floor(Math.random() * WORDLIST.length);
    }
    words.push(WORDLIST[idx]);
  }

  return words;
}

export function didFromSeedPhrase(seedPhrase) {
  const phraseArray = Array.isArray(seedPhrase)
    ? seedPhrase
    : String(seedPhrase)
        .trim()
        .split(/\s+/);

  const normalized = phraseArray.join(" ").toLowerCase();
  const id = hashStringToAlnum(normalized, 12);
  const did = `did:loyvault:${id}`;

  // Deterministically derive fake key material from the phrase as well
  const keyMaterialBase = hashStringToAlnum(`${normalized}|keys`, 24);

  return {
    did,
    publicKey: `pub_${keyMaterialBase}`,
    privateKey: `priv_${hashStringToAlnum(`${normalized}|priv`, 48)}`,
    createdAt: new Date().toISOString(),
    version: "1.0",
  };
}

export default {
  generateDID,
  generateSeedPhrase,
  didFromSeedPhrase,
};
