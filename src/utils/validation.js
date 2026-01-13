const DID_PREFIX = "did:loyvault:";

export function validateDID(did) {
  const value = String(did || "").trim();
  if (!value) {
    return { valid: false, error: "DID is required" };
  }
  if (!value.startsWith(DID_PREFIX)) {
    return { valid: false, error: "DID must start with did:loyvault:" };
  }
  const suffix = value.slice(DID_PREFIX.length);
  if (!/^[a-z0-9]{12}$/i.test(suffix)) {
    return { valid: false, error: "DID must end with 12 alphanumeric characters" };
  }
  return { valid: true, error: "" };
}

const DEMO_WORDLIST = new Set([
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
]);

export function validateSeedPhrase(words) {
  const list = Array.isArray(words)
    ? words.map((w) => String(w || "").trim().toLowerCase()).filter(Boolean)
    : String(words || "")
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

  if (list.length !== 12) {
    return { valid: false, error: "Seed phrase must contain exactly 12 words" };
  }

  const invalid = list.find((w) => !DEMO_WORDLIST.has(w));
  if (invalid) {
    return { valid: false, error: `"${invalid}" is not a recognized word` };
  }

  return { valid: true, error: "" };
}

export function validateJSON(jsonString) {
  if (!jsonString) {
    return { valid: false, error: "JSON content is empty", data: null };
  }
  try {
    const data = JSON.parse(jsonString);
    if (typeof data !== "object" || data === null) {
      return { valid: false, error: "JSON must describe an object", data: null };
    }
    if (!("identity" in data) || !data.identity || typeof data.identity !== "object") {
      return { valid: false, error: "Backup JSON missing identity field", data: null };
    }
    if (!data.identity.did) {
      return { valid: false, error: "Backup identity is missing DID", data: null };
    }
    return { valid: true, error: "", data };
  } catch (error) {
    return { valid: false, error: "Invalid JSON format", data: null };
  }
}

export function validatePIN(pin) {
  const value = String(pin || "").trim();
  if (!value) {
    return { valid: false, error: "PIN is required" };
  }
  if (!/^\d{4,6}$/.test(value)) {
    return { valid: false, error: "PIN must be 4 to 6 digits" };
  }

  // Reject simple sequences like 1234, 2345, 9876
  const isSequential = (/^0123$|^1234$|^2345$|^3456$|^4567$|^5678$|^6789$|^9876$|^8765$|^7654$|^6543$|^5432$|^4321$/).test(
    value,
  );
  if (isSequential) {
    return { valid: false, error: "PIN is too easy to guess (sequential numbers)" };
  }

  // Reject repeated digits like 1111, 9999
  if (/^(\d)\1+$/.test(value)) {
    return { valid: false, error: "PIN cannot be the same digit repeated" };
  }

  return { valid: true, error: "" };
}

export default {
  validateDID,
  validateSeedPhrase,
  validateJSON,
  validatePIN,
};
