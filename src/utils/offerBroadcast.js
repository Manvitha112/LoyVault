import { saveCustomerOffer } from "./offerStorage.js";

// Generate offer QR data
export const generateOfferQRData = (offer) => {
  const qrData = {
    type: "offer",
    version: "1.0",
    offerId: offer.id,
    shopDID: offer.shopDID,
    shopName: offer.shopName,
    title: offer.title,
    description: offer.description,
    offerType: offer.offerType,
    discountValue: offer.discountValue,
    minTier: offer.minTier,
    minPurchase: offer.minPurchase,
    startDate: offer.startDate,
    endDate: offer.endDate,
    maxRedemptionsPerCustomer: offer.maxRedemptionsPerCustomer,
    timestamp: Date.now(),
  };

  return JSON.stringify(qrData);
};

// Customer receives offer by scanning QR
export const receiveOffer = async (qrData, customerCredentials) => {
  try {
    const offer = typeof qrData === "string" ? JSON.parse(qrData) : qrData;

    // Check if customer has credential from this shop
    const shopCredential = customerCredentials.find(
      (c) => c.shopDID === offer.shopDID
    );

    if (!shopCredential) {
      return {
        success: false,
        error:
          "You are not a member of this shop yet. Join first to receive offers.",
      };
    }

    // Check tier eligibility
    const tierOrder = {
      Base: 0,
      Bronze: 1,
      Silver: 2,
      Gold: 3,
      Platinum: 4,
    };
    const customerTierLevel = tierOrder[shopCredential.tier] || 0;
    const requiredTierLevel = tierOrder[offer.minTier] || 0;

    if (customerTierLevel < requiredTierLevel) {
      return {
        success: false,
        error: `This offer requires ${offer.minTier} tier or higher. Your current tier: ${shopCredential.tier}`,
      };
    }

    // Check if offer is still valid
    if (offer.endDate && new Date(offer.endDate) < new Date()) {
      return {
        success: false,
        error: "This offer has expired",
      };
    }

    // Save offer to customer wallet
    const savedOffer = await saveCustomerOffer(offer);

    return {
      success: true,
      offer: savedOffer,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to receive offer",
    };
  }
};

// Broadcast offer to all customers (via QR display)
export const broadcastOffer = async (offer) => {
  // In IndexedDB version, we just create the offer and generate QR
  // Customers will scan the QR to receive it

  const qrData = generateOfferQRData(offer);

  return {
    success: true,
    qrData,
    message: "Offer created. Display QR for customers to scan.",
  };
};
