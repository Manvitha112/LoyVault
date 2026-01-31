import { openDB } from "idb";

// -----------
// DB helpers
// -----------

async function getShopDB() {
  return openDB("LoyVaultShop", 4, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("offers")) {
        db.createObjectStore("offers", { keyPath: "id" });
      }
    },
  });
}

async function getWalletDB() {
  // Keep version in sync with DB_VERSION in indexedDB.js
  return openDB("LoyVaultWallet", 4, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("offers")) {
        db.createObjectStore("offers", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("notifications")) {
        db.createObjectStore("notifications", { keyPath: "id" });
      }
    },
  });
}

// -----------------
// Shop-side storage
// -----------------

// Shop: Save offer
export const saveOffer = async (offer, shopDID) => {
  try {
    const db = await getShopDB();

    const offerData = {
      ...offer,
      id: offer?.id || `offer-${Date.now()}`,
      shopDID,
      createdAt: new Date().toISOString(),
      isActive: true,
      redemptionCount: 0,
      viewCount: 0,
    };

    await db.add("offers", offerData);
    return offerData;
  } catch (error) {
    console.error("Failed to save offer:", error);
    throw error;
  }
};

// Shop: Get all shop offers
export const getShopOffers = async (shopDID) => {
  try {
    const db = await getShopDB();
    const offers = await db.getAll("offers");
    return (offers || []).filter((o) => o.shopDID === shopDID);
  } catch (error) {
    console.error("Failed to get offers:", error);
    return [];
  }
};

// Shop: Update offer
export const updateOffer = async (offerId, updates) => {
  try {
    const db = await getShopDB();
    const offer = await db.get("offers", offerId);

    if (!offer) {
      throw new Error("Offer not found");
    }

    const updatedOffer = { ...offer, ...updates };
    await db.put("offers", updatedOffer);
    return updatedOffer;
  } catch (error) {
    console.error("Failed to update offer:", error);
    throw error;
  }
};

// Shop: Delete offer
export const deleteOffer = async (offerId) => {
  try {
    const db = await getShopDB();
    await db.delete("offers", offerId);
    return true;
  } catch (error) {
    console.error("Failed to delete offer:", error);
    throw error;
  }
};

// --------------------
// Customer-side offers
// --------------------

// Customer: Save received offer
export const saveCustomerOffer = async (offer) => {
  try {
    const db = await getWalletDB();

    // Check if offer already exists
    const existingOffers = await db.getAll("offers");
    const exists = (existingOffers || []).find((o) => o.id === offer.id);

    if (exists) {
      return exists; // Don't duplicate
    }

    const offerData = {
      ...offer,
      receivedAt: new Date().toISOString(),
      viewed: false,
      redeemed: false,
    };

    await db.add("offers", offerData);
    return offerData;
  } catch (error) {
    console.error("Failed to save customer offer:", error);
    throw error;
  }
};

// Customer: Get all received offers
export const getCustomerOffers = async () => {
  try {
    const db = await getWalletDB();
    const offers = await db.getAll("offers");

    const list = offers || [];
    const now = new Date();
    // Filter out expired offers (keep ones with no endDate or in the future)
    return list.filter((o) => !o.endDate || new Date(o.endDate) >= now);
  } catch (error) {
    console.error("Failed to get customer offers:", error);
    return [];
  }
};

// Customer: Mark offer as viewed
export const markOfferViewed = async (offerId) => {
  try {
    const db = await getWalletDB();
    const offer = await db.get("offers", offerId);

    if (offer && !offer.viewed) {
      const updated = {
        ...offer,
        viewed: true,
        viewedAt: new Date().toISOString(),
      };
      await db.put("offers", updated);
    }

    return true;
  } catch (error) {
    console.error("Failed to mark offer viewed:", error);
    return false;
  }
};

// Customer: Mark offer as redeemed
export const markOfferRedeemed = async (offerId) => {
  try {
    const db = await getWalletDB();
    const offer = await db.get("offers", offerId);

    if (offer && !offer.redeemed) {
      const updated = {
        ...offer,
        redeemed: true,
        redeemedAt: new Date().toISOString(),
      };
      await db.put("offers", updated);
    }

    return true;
  } catch (error) {
    console.error("Failed to mark offer redeemed:", error);
    return false;
  }
};
