import { openDB } from "idb";

const DB_NAME = "LoyVaultShop";
const DB_VERSION = 1;

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("shops")) {
        db.createObjectStore("shops", { keyPath: "shopDID" });
      }
      if (!db.objectStoreNames.contains("credentials_issued")) {
        db.createObjectStore("credentials_issued", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("transactions")) {
        db.createObjectStore("transactions", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("offers")) {
        db.createObjectStore("offers", { keyPath: "id" });
      }
    },
  });
}

// -------------------------
// Shop Account Management
// -------------------------

export async function saveShop(shopData) {
  try {
    const db = await getDB();
    await db.put("shops", shopData);
    return true;
  } catch (error) {
    console.error("[ShopIndexedDB] saveShop failed", error);
    return false;
  }
}

export async function getShop(shopDID) {
  try {
    const db = await getDB();
    return db.get("shops", shopDID);
  } catch (error) {
    console.error("[ShopIndexedDB] getShop failed", error);
    return null;
  }
}

export async function getShopByEmail(email) {
  if (!email) return null;
  try {
    const db = await getDB();
    let result = null;
    let cursor = await db.transaction("shops").store.openCursor();
    const target = String(email).toLowerCase();
    while (cursor) {
      const value = cursor.value;
      if (value?.email && String(value.email).toLowerCase() === target) {
        result = value;
        break;
      }
      cursor = await cursor.continue();
    }
    return result;
  } catch (error) {
    console.error("[ShopIndexedDB] getShopByEmail failed", error);
    return null;
  }
}

export async function updateShop(shopDID, updates) {
  try {
    const db = await getDB();
    const tx = db.transaction("shops", "readwrite");
    const store = tx.store;
    const existing = await store.get(shopDID);
    if (!existing) {
      return null;
    }
    const updated = { ...existing, ...updates };
    await store.put(updated);
    await tx.done;
    return updated;
  } catch (error) {
    console.error("[ShopIndexedDB] updateShop failed", error);
    return null;
  }
}

export async function deleteShop(shopDID) {
  try {
    const db = await getDB();
    await db.delete("shops", shopDID);
    return true;
  } catch (error) {
    console.error("[ShopIndexedDB] deleteShop failed", error);
    return false;
  }
}

export async function hasShop() {
  try {
    const db = await getDB();
    const tx = db.transaction("shops");
    const store = tx.store;
    const cursor = await store.openCursor();
    await tx.done;
    return !!cursor;
  } catch (error) {
    console.error("[ShopIndexedDB] hasShop failed", error);
    return false;
  }
}

export async function getStoredShopDID() {
  try {
    const db = await getDB();
    let cursor = await db.transaction("shops").store.openCursor();
    if (!cursor) return null;
    return cursor.value?.shopDID || null;
  } catch (error) {
    console.error("[ShopIndexedDB] getStoredShopDID failed", error);
    return null;
  }
}

// -------------------------
// Credentials Management (for later)
// -------------------------

export async function saveIssuedCredential(credential) {
  try {
    const db = await getDB();
    await db.put("credentials_issued", credential);
    return true;
  } catch (error) {
    console.error("[ShopIndexedDB] saveIssuedCredential failed", error);
    return false;
  }
}

export async function getIssuedCredentials(shopDID) {
  try {
    const db = await getDB();
    const tx = db.transaction("credentials_issued");
    const store = tx.store;
    const results = [];
    let cursor = await store.openCursor();
    while (cursor) {
      if (!shopDID || cursor.value?.shopDID === shopDID) {
        results.push(cursor.value);
      }
      cursor = await cursor.continue();
    }
    await tx.done;
    return results;
  } catch (error) {
    console.error("[ShopIndexedDB] getIssuedCredentials failed", error);
    return [];
  }
}

export async function updateCredential(credentialId, updates) {
  try {
    const db = await getDB();
    const tx = db.transaction("credentials_issued", "readwrite");
    const store = tx.store;
    const existing = await store.get(credentialId);
    if (!existing) {
      return null;
    }
    const updated = { ...existing, ...updates };
    await store.put(updated);
    await tx.done;
    return updated;
  } catch (error) {
    console.error("[ShopIndexedDB] updateCredential failed", error);
    return null;
  }
}

export default {
  saveShop,
  getShop,
  getShopByEmail,
  updateShop,
  deleteShop,
  hasShop,
  getStoredShopDID,
  saveIssuedCredential,
  getIssuedCredentials,
  updateCredential,
};

