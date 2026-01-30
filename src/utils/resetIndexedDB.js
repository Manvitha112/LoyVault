// Utility to reset IndexedDB when there are schema conflicts
import { openDB } from "idb";

const DB_NAME = "LoyVaultWallet";

export async function resetDatabase() {
  try {
    // Delete the existing database
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME);
      request.onsuccess = () => {
        console.log(`[IndexedDB] Database ${DB_NAME} deleted successfully`);
        resolve();
      };
      request.onerror = () => {
        console.error(`[IndexedDB] Error deleting database ${DB_NAME}`);
        reject(request.error);
      };
      request.onblocked = () => {
        console.warn(`[IndexedDB] Database deletion blocked. Close all tabs using this database.`);
      };
    });

    // Wait a bit for the deletion to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Recreate with correct schema
    const db = await openDB(DB_NAME, 3, {
      upgrade(db) {
        // Identity store - no keyPath, uses explicit keys
        if (!db.objectStoreNames.contains("identity")) {
          db.createObjectStore("identity");
        }

        // Credentials store - has keyPath with autoIncrement
        if (!db.objectStoreNames.contains("credentials")) {
          const store = db.createObjectStore("credentials", {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("byShopDid", "shopDid", { unique: false });
          store.createIndex("byDid", "did", { unique: false });
        }

        // Settings store - no keyPath, uses explicit keys
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings");
        }

        // Offers store - has keyPath
        if (!db.objectStoreNames.contains("offers")) {
          db.createObjectStore("offers", { keyPath: "id" });
        }

        // Notifications store - has keyPath
        if (!db.objectStoreNames.contains("notifications")) {
          db.createObjectStore("notifications", { keyPath: "id" });
        }
      },
    });

    db.close();
    console.log(`[IndexedDB] Database ${DB_NAME} recreated successfully`);
    return true;
  } catch (error) {
    console.error("[IndexedDB] Reset failed:", error);
    return false;
  }
}
