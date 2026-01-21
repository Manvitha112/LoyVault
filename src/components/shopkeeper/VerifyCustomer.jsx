import React, { useState } from "react";
import { Scan, Upload, CheckCircle, Loader, Info } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast, showError, showSuccess } from "../common/Toast.jsx";
import { saveIssuedCredential } from "../../utils/indexedDB.js";
import {
  updateLoyaltyPointsByDid,
  fetchLoyaltyProgramsByDid,
  createInvoice,
} from "../../utils/apiClient.js";
import {
  updateCredentialPoints,
  generateCredentialQRData,
  parseQRData,
} from "../../utils/qrCodeUtils.js";
import { Html5Qrcode } from "html5-qrcode";

const calculateTier = (points) => {
  if (points >= 500) return "Platinum";
  if (points >= 250) return "Gold";
  if (points >= 100) return "Silver";
  if (points >= 50) return "Bronze";
  return "Base";
};

export default function VerifyCustomer({ shop }) {
  const [scanning, setScanning] = useState(false);
  const [verifiedCustomer, setVerifiedCustomer] = useState(null);
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showUpdatedCredential, setShowUpdatedCredential] = useState(null);

  const startScanning = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }

      await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      setScanning(true);
      toast.info("Camera scanning will be wired with html5-qrcode soon. For now, use Upload QR.");
    } catch (error) {
      console.error("Camera access error", error);
      showError("Camera access denied");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode("qr-upload-verify-container");
      const decodedText = await html5QrCode.scanFile(file, true);
      await html5QrCode.clear();

      handleScanSuccess(decodedText);
    } catch (error) {
      console.error("Failed to read QR from image", error);
      showError("Failed to read QR code");
    }
  };

  const validateCredential = (credential) => {
    if (!credential.signature) return false;

    if (!credential.shopDID || credential.shopDID !== shop?.shopDID) {
      toast.error("Credential is not for this shop");
      return false;
    }

    if (credential.expiresDate && new Date(credential.expiresDate) < new Date()) {
      toast.error("Credential expired");
      return false;
    }

    // TODO: verify digital signature
    return true;
  };

  const handleScanSuccess = async (credentialData) => {
    try {
      const parsed = parseQRData(credentialData);
      // Accept either direct credential or wrapped verify payload
      const credential =
        parsed.type === "verify"
          ? {
              customerId: parsed.customerId,
              holderDID: parsed.customerDID,
              issuerDID: parsed.issuerDID || parsed.shopDID,
              shopDID: parsed.shopDID,
              points: parsed.points,
              tier: parsed.tier,
              issuedDate: parsed.issuedDate,
              signature: parsed.signature,
            }
          : parsed;

      const isValid = validateCredential(credential);
      if (!isValid) return;

      // Ensure this customer has actually joined this shop's loyalty program
      try {
        if (credential.holderDID && credential.shopDID) {
          const programs = await fetchLoyaltyProgramsByDid(credential.holderDID);
          const isMember =
            Array.isArray(programs) &&
            programs.some((p) => p.shopDID === credential.shopDID);

          if (!isMember) {
            showError("Customer is not a member of this loyalty program");
            return;
          }
        }
      } catch (membershipError) {
        console.error("Failed to confirm membership", membershipError);
        // If we can't confirm membership, treat as failure for now
        showError("Unable to verify customer membership");
        return;
      }

      setVerifiedCustomer({
        customerId: credential.customerId,
        customerDID: credential.holderDID,
        points: credential.points,
        tier: credential.tier,
        issuedDate: credential.issuedDate,
        verified: true,
        credentialData: credential,
      });
      setScanning(false);
      showSuccess("Customer verified successfully!");
    } catch (error) {
      console.error("Failed to verify credential", error);
      showError("Failed to verify credential");
    }
  };

  const handleUpdatePoints = async () => {
    if (!verifiedCustomer) return;

    if (!purchaseAmount || parseFloat(purchaseAmount) <= 0) {
      toast.error("Please enter valid purchase amount");
      return;
    }

    setIsUpdating(true);

    try {
      const amount = parseFloat(purchaseAmount);
      const pointsToAdd = Math.floor(amount / 10);

      if (pointsToAdd === 0) {
        toast.error("Purchase amount too small. Minimum ₹10 required for points.");
        setIsUpdating(false);
        return;
      }

      const updatedCredential = updateCredentialPoints(
        verifiedCustomer.credentialData,
        pointsToAdd,
        shop?.privateKey || "mock_private_key"
      );

      await saveIssuedCredential({
        ...updatedCredential,
        customerDID: verifiedCustomer.customerDID,
        shopDID: shop?.shopDID,
        transactionAmount: amount,
        pointsAdded: pointsToAdd,
        previousPoints: verifiedCustomer.points,
        previousTier: verifiedCustomer.tier,
        updatedAt: new Date().toISOString(),
      });

      // Best-effort: also push updated points to backend so programs stay in sync across devices
      try {
        if (verifiedCustomer.customerDID && updatedCredential.shopDID) {
          await updateLoyaltyPointsByDid({
            did: verifiedCustomer.customerDID,
            shopDID: updatedCredential.shopDID,
            points: updatedCredential.points,
            tier: updatedCredential.tier,
          });
        }
      } catch (apiError) {
        console.error("Failed to sync updated points to backend", apiError);
      }

      // Automatically create invoice for this transaction
      try {
        if (verifiedCustomer.customerDID && shop?.shopDID) {
          const tax = Math.round(amount * 0.18); // 18% GST
          const invoiceData = await createInvoice({
            shopDID: shop.shopDID,
            customerDID: verifiedCustomer.customerDID,
            shopName: shop.name || "Shop",
            subtotal: amount,
            tax: tax,
            total: amount,
            pointsAdded: pointsToAdd,
            tierAfter: updatedCredential.tier,
          });
          console.log("Invoice created:", invoiceData.transactionId);
        }
      } catch (invoiceError) {
        console.error("Failed to create invoice", invoiceError);
        // Don't block the flow if invoice creation fails
      }

      const tierChanged = updatedCredential.tier !== verifiedCustomer.tier;

      toast.success(
        `✅ Points Updated!\n\n` +
          `Added: ${pointsToAdd} points\n` +
          `New Total: ${updatedCredential.points} points\n` +
          (tierChanged
            ? `🎉 Tier Upgraded: ${verifiedCustomer.tier} → ${updatedCredential.tier}!`
            : `Tier: ${updatedCredential.tier}`),
        { duration: 5000 }
      );

      setVerifiedCustomer({
        ...verifiedCustomer,
        points: updatedCredential.points,
        tier: updatedCredential.tier,
        credentialData: updatedCredential,
      });

      setPurchaseAmount("");
      setShowUpdatedCredential(updatedCredential);

      setTimeout(() => {
        setShowUpdatedCredential(null);
        // eslint-disable-next-line no-alert
        if (window.confirm("Verify another customer?")) {
          setVerifiedCustomer(null);
        }
      }, 3000);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update points: " + (error?.message || ""));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-3xl font-bold text-white">Verify Customer Loyalty</h1>
      <p className="mb-8 text-sm text-blue-300">
        Scan customer's credential QR to verify and update points.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Scanner */}
        <div className="rounded-xl border border-blue-400/30 bg-white/10 p-6 backdrop-blur-lg">
          <h3 className="mb-4 text-lg font-bold text-white">Scan Customer QR</h3>

          <div className="relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-black/50">
            {!scanning ? (
              <div className="text-center">
                <Scan className="mx-auto mb-4 h-16 w-16 text-blue-400" />
                <p className="mb-4 text-blue-300">Camera access needed</p>
                <button
                  type="button"
                  onClick={startScanning}
                  className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
                >
                  Enable Camera
                </button>
              </div>
            ) : (
              <div className="relative h-full w-full">
                <div className="absolute inset-0 rounded-xl border-4 border-blue-500/50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-48 w-48 animate-pulse rounded-xl border-4 border-blue-500" />
                </div>
                <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white">
                  Position customer's QR within frame
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-blue-400/30 pt-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="qr-upload-verify"
            />
            <label
              htmlFor="qr-upload-verify"
              className="block w-full cursor-pointer rounded-lg border border-blue-400/30 bg-white/5 py-3 text-center text-sm text-white transition-all hover:bg-white/10"
            >
              <Upload className="mr-2 inline h-5 w-5" />
              Upload QR Image
            </label>
            <div id="qr-upload-verify-container" style={{ display: "none" }} />
          </div>
        </div>

        {/* Right: Verification Result */}
        <div className="rounded-xl border border-blue-400/30 bg-white/10 p-6 backdrop-blur-lg">
          <h3 className="mb-4 text-lg font-bold text-white">Customer Details</h3>

          {!verifiedCustomer ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="mb-4 h-16 w-16 text-blue-400/50" />
              <p className="text-sm text-blue-300">
                Scan customer's QR code to verify their loyalty membership.
              </p>
            </div>
          ) : (
            <VerifiedCustomerDetails
              customer={verifiedCustomer}
              purchaseAmount={purchaseAmount}
              onPurchaseAmountChange={setPurchaseAmount}
              onUpdatePoints={handleUpdatePoints}
              isUpdating={isUpdating}
            />
          )}
        </div>
      </div>

      {showUpdatedCredential && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-900 to-slate-900 p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
            </div>

            <h2 className="mb-2 text-2xl font-bold text-white">Points Updated!</h2>

            <p className="mb-6 text-blue-200">
              Customer can scan this QR to update their wallet
            </p>

            <div className="mb-6 rounded-xl bg-white p-6">
              <QRCodeSVG
                value={generateCredentialQRData(showUpdatedCredential)}
                size={200}
                level="H"
                includeMargin
              />
            </div>

            <div className="mb-6 rounded-xl border border-blue-400/30 bg-white/10 p-4 text-left backdrop-blur-lg">
              <div className="mb-2 flex justify-between">
                <span className="text-blue-300">New Points:</span>
                <span className="font-bold text-white">
                  {showUpdatedCredential.points}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-300">New Tier:</span>
                <span className="font-bold text-white">
                  {showUpdatedCredential.tier}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowUpdatedCredential(null)}
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 py-3 font-semibold text-white transition-all hover:scale-105"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function VerifiedCustomerDetails({
  customer,
  purchaseAmount,
  onPurchaseAmountChange,
  onUpdatePoints,
  isUpdating,
}) {
  const pointsToAdd = purchaseAmount
    ? Math.floor(parseFloat(purchaseAmount || "0") / 10)
    : 0;
  const newPoints = (customer.points || 0) + pointsToAdd;
  const currentTier = customer.tier;
  const newTier = calculateTier(newPoints);
  const tierUpgrade = newTier !== currentTier;

  const formattedMemberSince = customer.issuedDate
    ? new Date(customer.issuedDate).toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "--";

  return (
    <div className="space-y-6 text-sm text-white">
      {/* Success Header */}
      <div className="flex items-center gap-3 rounded-lg border border-green-400/30 bg-green-500/10 p-4">
        <CheckCircle className="h-6 w-6 text-green-400" />
        <div>
          <h4 className="font-semibold text-white">Customer Verified</h4>
          <p className="text-sm text-green-300">Credential is valid and active</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="space-y-3">
        <InfoRow label="Customer ID" value={customer.customerId} />
        <InfoRow label="Current Points" value={customer.points} highlight />
        <InfoRow label="Current Tier" value={customer.tier} badge />
        <InfoRow label="Member Since" value={formattedMemberSince} />
      </div>

      <div className="border-t border-blue-400/30" />

      {/* Purchase Amount Input */}
      <div>
        <label className="mb-2 block text-blue-300">Purchase Amount (₹)</label>
        <input
          type="number"
          min="0"
          step="1"
          value={purchaseAmount}
          onChange={(e) => onPurchaseAmountChange(e.target.value)}
          placeholder="Enter amount"
          className="w-full rounded-lg border border-blue-400/30 bg-white/5 px-4 py-3 text-sm text-white placeholder-blue-400/50 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
        />
        {purchaseAmount && (
          <p className="mt-2 text-sm text-blue-300">
            Points to add: <span className="font-bold text-white">{pointsToAdd}</span>
            <span className="text-blue-400"> (1 point per ₹10)</span>
          </p>
        )}
      </div>

      {/* New Total Preview */}
      {purchaseAmount && (
        <div className="rounded-lg border border-blue-400/30 bg-blue-500/10 p-4">
          <h4 className="mb-3 font-semibold text-white">After Update:</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-blue-300">New Total Points:</span>
              <span className="text-xl font-bold text-white">{newPoints}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-300">New Tier:</span>
              <span
                className={`font-bold ${
                  tierUpgrade ? "text-green-400" : "text-white"
                }`}
              >
                {newTier}
                {tierUpgrade && (
                  <span className="ml-2 text-xs">⬆️ Upgraded!</span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Update Button */}
      <button
        type="button"
        onClick={onUpdatePoints}
        disabled={!purchaseAmount || isUpdating}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 py-4 text-sm font-semibold text-white transition-all hover:from-blue-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUpdating ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            <span>Updating...</span>
          </>
        ) : (
          <>
            <CheckCircle className="h-5 w-5" />
            <span>Update Loyalty Points</span>
          </>
        )}
      </button>

      {/* Reset Button */}
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="w-full rounded-lg border border-blue-400/30 bg-white/5 py-3 text-sm text-blue-300 transition-all hover:bg-white/10"
      >
        Verify Another Customer
      </button>
    </div>
  );
}

function InfoRow({ label, value, highlight, badge }) {
  if (badge) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-blue-300">{label}:</span>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${getTierColor(
            value
          )}`}
        >
          {value}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-blue-300">{label}:</span>
      <span
        className={`font-semibold ${
          highlight ? "text-xl text-white" : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function getTierColor(tier) {
  const colors = {
    Base: "bg-gray-500/20 text-gray-300",
    Bronze: "bg-amber-500/20 text-amber-300",
    Silver: "bg-slate-400/20 text-slate-300",
    Gold: "bg-yellow-500/20 text-yellow-300",
    Platinum: "bg-purple-500/20 text-purple-300",
  };
  return colors[tier] || colors.Base;
}
