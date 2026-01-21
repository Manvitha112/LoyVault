// Utility helpers for encoding credentials into QR data and updating points

// Safely parse QR payloads that may be JSON strings or objects
export function parseQRData(qrData) {
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

// Simple tier calculation used for point updates
function calculateTierForPoints(points) {
  if (points >= 500) return "Platinum";
  if (points >= 250) return "Gold";
  if (points >= 100) return "Silver";
  if (points >= 50) return "Bronze";
  return "Base";
}

export function updateCredentialPoints(credentialInput, pointsToAdd, _privateKey) {
  const credential =
    typeof credentialInput === "string" ? JSON.parse(credentialInput) : credentialInput;

  const currentPoints = Number(credential.points || 0);
  const newPoints = currentPoints + Number(pointsToAdd || 0);

  const newTier = calculateTierForPoints(newPoints);

  return {
    ...credential,
    points: newPoints,
    tier: newTier,
    // TODO: re-sign credential with private key
    signature: credential.signature || "mock_signature_updated",
    updatedAt: new Date().toISOString(),
  };
}

export function generateCredentialQRData(credential) {
  // For now we simply encode the full credential as JSON string
  return JSON.stringify(credential);
}
