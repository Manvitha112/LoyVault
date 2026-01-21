import { saveCredential, getCredentialByShop } from "./indexedDB.js";

// Internal helper to safely parse QR data
function parseQRData(qrData) {
  if (!qrData) {
    throw new Error("Empty QR data");
  }

  if (typeof qrData === "string") {
    try {
      return JSON.parse(qrData);
    } catch (error) {
      throw new Error("Invalid QR JSON format");
    }
  }

  return qrData;
}

// Customer scans updated credential QR from shop
export const syncUpdatedCredential = async (qrData, existingCredential) => {
  try {
    // qrData here is expected to already be parsed
    const data = qrData;

    // Validate QR data
    if (data.type !== "verify") {
      throw new Error("Invalid credential QR");
    }

    // Verify it's the same credential (same shop and customer)
    if (data.issuerDID !== existingCredential.shopDID) {
      throw new Error("Credential from different shop");
    }

    if (data.holderDID !== existingCredential.customerDID) {
      throw new Error("Credential for different customer");
    }

    const existingLastUpdated =
      existingCredential.lastUpdated || existingCredential.issuedDate;

    // Check if it's actually an update (newer timestamp or higher points)
    const isUpdate =
      data.points > existingCredential.points ||
      (data.timestamp &&
        existingLastUpdated &&
        new Date(data.timestamp) > new Date(existingLastUpdated));

    if (!isUpdate) {
      throw new Error("This is not a newer version of your credential");
    }

    // Create updated credential object
    const updatedCredential = {
      ...existingCredential,
      points: data.points,
      tier: data.tier,
      signature: data.signature,
      expiresDate: data.expiresDate,
      lastUpdated: new Date().toISOString(),
    };

    // Save to IndexedDB
    await saveCredential(updatedCredential);

    return {
      success: true,
      credential: updatedCredential,
      changes: {
        pointsAdded: data.points - existingCredential.points,
        tierChanged: data.tier !== existingCredential.tier,
        oldTier: existingCredential.tier,
        newTier: data.tier,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to sync credential",
    };
  }
};

// Check for credential updates (polling - optional)
export const checkForUpdates = async (_credentials) => {
  // In production, this would check with backend or notification service
  // For now, return empty array
  return [];
};

// Auto-sync when customer scans any QR
export const handleQRSync = async (qrData, customerDID) => {
  try {
    const parsed = parseQRData(qrData);

    if (parsed.type === "verify" && parsed.holderDID === customerDID) {
      // This is a credential update
      const existing = await getCredentialByShop(parsed.issuerDID);

      if (existing) {
        return await syncUpdatedCredential(parsed, existing);
      }
    }

    return { success: false, error: "No matching credential found" };
  } catch (error) {
    return { success: false, error: error.message || "QR sync failed" };
  }
};
