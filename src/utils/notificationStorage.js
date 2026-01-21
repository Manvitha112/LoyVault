import { getWalletDB } from "./indexedDB.js";

export const saveNotification = async (notification) => {
  try {
    const db = await getWalletDB();
    
    if (!db.objectStoreNames.contains("notifications")) {
      console.warn("Notifications store not found, skipping save");
      return null;
    }

    const notif = {
      id: notification.id || `notif_${Date.now()}_${Math.random()}`,
      type: notification.type || "default",
      title: notification.title,
      message: notification.message,
      time: notification.time || new Date().toISOString(),
      read: false,
      ...notification,
    };

    await db.put("notifications", notif);
    return notif;
  } catch (error) {
    console.error("Failed to save notification:", error);
    return null;
  }
};

export const getNotifications = async () => {
  try {
    const db = await getWalletDB();
    
    if (!db.objectStoreNames.contains("notifications")) {
      return [];
    }

    const notifications = await db.getAll("notifications");
    return notifications.sort((a, b) => new Date(b.time) - new Date(a.time));
  } catch (error) {
    console.error("Failed to get notifications:", error);
    return [];
  }
};

export const markNotificationRead = async (notificationId) => {
  try {
    const db = await getWalletDB();
    
    if (!db.objectStoreNames.contains("notifications")) {
      return false;
    }

    const notif = await db.get("notifications", notificationId);
    if (notif) {
      notif.read = true;
      await db.put("notifications", notif);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return false;
  }
};

export const clearAllNotifications = async () => {
  try {
    const db = await getWalletDB();
    
    if (!db.objectStoreNames.contains("notifications")) {
      return true;
    }

    await db.clear("notifications");
    return true;
  } catch (error) {
    console.error("Failed to clear notifications:", error);
    return false;
  }
};

export const createOfferNotification = (offer) => {
  return {
    type: "offer",
    title: "New Offer Available!",
    message: `${offer.shopName}: ${offer.title}`,
    time: new Date().toISOString(),
    data: offer,
  };
};

export const createReceiptNotification = (invoice) => {
  return {
    type: "receipt",
    title: "New Receipt",
    message: `Receipt from ${invoice.shopName} - ₹${invoice.total}`,
    time: new Date().toISOString(),
    data: invoice,
  };
};
