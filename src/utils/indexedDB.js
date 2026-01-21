import { openDB } from "idb";
import { encryptData, hashPIN } from "./encryption";

const DB_NAME = "LoyVaultWallet";
const DB_VERSION = 3;

// Single identity record key
const IDENTITY_KEY = "current";

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains("identity")) {
        // Single record store – we always use fixed key "current"
        db.createObjectStore("identity");
      }

      if (!db.objectStoreNames.contains("credentials")) {
        const store = db.createObjectStore("credentials", {
          keyPath: "id",
          autoIncrement: true,
        });
        // Helpful indexes for future queries
        store.createIndex("byShopDid", "shopDid", { unique: false });
        store.createIndex("byDid", "did", { unique: false });
      }

      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings");
      }

      // New in v2: offers store for customer-side offers
      if (!db.objectStoreNames.contains("offers")) {
        db.createObjectStore("offers", { keyPath: "id" });
      }

      // New in v3: notifications store
      if (!db.objectStoreNames.contains("notifications")) {
        db.createObjectStore("notifications", { keyPath: "id" });
      }
    },
  });
}

// -------------------------
// Identity Management
// -------------------------

export async function saveIdentity(identityData) {
  try {
    const db = await getDB();

    const toStore = { ...identityData };

    // Encrypt private key & seed phrase before storing
    if (identityData.privateKey) {
      try {
        const encPriv = await encryptData(identityData.privateKey, identityData.pin);
        toStore.encryptedPrivateKey = encPriv;
        delete toStore.privateKey;
      } catch (error) {
        console.error("[IndexedDB] failed to encrypt private key", error);
      }
    }

    if (identityData.seedPhrase) {
      try {
        const encSeed = await encryptData(identityData.seedPhrase, identityData.pin);
        toStore.encryptedSeedPhrase = encSeed;
        delete toStore.seedPhrase;
      } catch (error) {
        console.error("[IndexedDB] failed to encrypt seed phrase", error);
      }
    }

    if (identityData.pin) {
      try {
        toStore.pinHash = await hashPIN(identityData.pin);
      } catch (error) {
        console.error("[IndexedDB] failed to hash PIN", error);
      }
    }

    delete toStore.pin;

    await db.put("identity", toStore, IDENTITY_KEY);
    return true;
  } catch (error) {
    console.error("[IndexedDB] saveIdentity failed", error);
    return false;
  }
}

export async function getIdentity() {
  try {
    const db = await getDB();
    const identity = await db.get("identity", IDENTITY_KEY);
    return identity ?? null;
  } catch (error) {
    console.error("[IndexedDB] getIdentity failed", error);
    return null;
  }
}

export async function deleteIdentity() {
  try {
    const db = await getDB();
    await db.delete("identity", IDENTITY_KEY);
    // Optionally clear credentials & settings when wiping wallet
    await db.clear("credentials");
    await db.clear("settings");
    return true;
  } catch (error) {
    console.error("[IndexedDB] deleteIdentity failed", error);
    return false;
  }
}

// -------------------------
// Credentials Management
// -------------------------

export async function saveCredential(credential) {
  try {
    const db = await getDB();
    const id = await db.add("credentials", credential);
    return { ...credential, id };
  } catch (error) {
    console.error("[IndexedDB] saveCredential failed", error);
    throw error;
  }
}

export async function getAllCredentials() {
  try {
    const db = await getDB();
    const all = await db.getAll("credentials");
    return all ?? [];
  } catch (error) {
    console.error("[IndexedDB] getAllCredentials failed", error);
    return [];
  }
}

export async function getCredential(id) {
  try {
    const db = await getDB();
    const record = await db.get("credentials", id);
    return record ?? null;
  } catch (error) {
    console.error("[IndexedDB] getCredential failed", error);
    return null;
  }
}

// Lookup a credential by shop DID (helper for flows where you only know shopDID)
export async function getCredentialByShop(shopDID) {
  try {
    const db = await getDB();
    const all = await db.getAll("credentials");
    if (!all) return null;
    return all.find((c) => c.shopDID === shopDID) ?? null;
  } catch (error) {
    console.error("[IndexedDB] getCredentialByShop failed", error);
    return null;
  }
}

export async function updateCredential(id, updates) {
  try {
    const db = await getDB();
    const tx = db.transaction("credentials", "readwrite");
    const store = tx.objectStore("credentials");
    const existing = await store.get(id);
    if (!existing) {
      return null;
    }
    const updated = { ...existing, ...updates };
    await store.put(updated);
    await tx.done;
    return updated;
  } catch (error) {
    console.error("[IndexedDB] updateCredential failed", error);
    return null;
  }
}

export async function deleteCredential(id) {
  try {
    const db = await getDB();
    await db.delete("credentials", id);
    return true;
  } catch (error) {
    console.error("[IndexedDB] deleteCredential failed", error);
    return false;
  }
}

// -------------------------
// Shop-side: Issued Credentials
// -------------------------

const SHOP_DB_NAME = "LoyVaultShop";
// Bump version to ensure schema is upgraded for credentials_issued store
const SHOP_DB_VERSION = 2;

async function getShopDB() {
  return openDB(SHOP_DB_NAME, SHOP_DB_VERSION, {
    upgrade(db) {
      // Always ensure credentials_issued has an auto-incrementing id key
      if (db.objectStoreNames.contains("credentials_issued")) {
        db.deleteObjectStore("credentials_issued");
      }

      db.createObjectStore("credentials_issued", {
        keyPath: "id",
        autoIncrement: true,
      });
    },
  });
}

// For Shop: Save issued credential record
export async function saveIssuedCredential(credential) {
  try {
    const db = await getShopDB();
    const tx = db.transaction("credentials_issued", "readwrite");
    await tx.objectStore("credentials_issued").add({
      ...credential,
      issuedAt: new Date().toISOString(),
    });
    await tx.done;
    return true;
  } catch (error) {
    console.error("[IndexedDB] saveIssuedCredential failed", error);
    throw error;
  }
}

// For Shop: Get all issued credentials for a given shop DID
export async function getIssuedCredentials(shopDID) {
  try {
    const db = await getShopDB();
    const all = await db.getAll("credentials_issued");
    const list = all ?? [];
    if (!shopDID) return list;
    return list.filter((c) => c.shopDID === shopDID);
  } catch (error) {
    console.error("[IndexedDB] getIssuedCredentials failed", error);
    return [];
  }
}

// -------------------------
// Backup & Restore
// -------------------------

export async function exportWallet() {
  try {
    const db = await getDB();
    const [identity, credentials, settings] = await Promise.all([
      db.get("identity", IDENTITY_KEY),
      db.getAll("credentials"),
      db.getAllKeys("settings").then(async (keys) => {
        const entries = await Promise.all(
          keys.map(async (key) => [key, await db.get("settings", key)])
        );
        return Object.fromEntries(entries);
      }),
    ]);

    return {
      identity: identity ?? null,
      credentials: credentials ?? [],
      settings: settings ?? {},
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };
  } catch (error) {
    console.error("[IndexedDB] exportWallet failed", error);
    throw error;
  }
}

export async function importWallet(jsonData) {
  try {
    const db = await getDB();
    const { identity, credentials, settings } = jsonData || {};

    const tx = db.transaction(["identity", "credentials", "settings"], "readwrite");

    if (identity) {
      await tx.objectStore("identity").put(identity, IDENTITY_KEY);
    }

    if (Array.isArray(credentials)) {
      const credStore = tx.objectStore("credentials");
      await credStore.clear();
      for (const cred of credentials) {
        // If id present, preserve it; otherwise let autoIncrement assign one
        if (cred.id != null) {
          await credStore.put(cred);
        } else {
          await credStore.add(cred);
        }
      }
    }

    if (settings && typeof settings === "object") {
      const settingsStore = tx.objectStore("settings");
      await settingsStore.clear();
      for (const [key, value] of Object.entries(settings)) {
        await settingsStore.put(value, key);
      }
    }

    await tx.done;
    return true;
  } catch (error) {
    console.error("[IndexedDB] importWallet failed", error);
    return false;
  }
}

export { getDB as openWalletDB };

