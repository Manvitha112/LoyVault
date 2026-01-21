import React, { useState } from "react";
import { Scan, Check, Upload } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { showError, toast } from "../common/Toast.jsx";
import {
  getCredentialByShop,
  deleteCredential,
  saveCredential,
} from "../../utils/indexedDB.js";
import { parseQRData } from "../../utils/qrCodeUtils.js";
import { Html5Qrcode } from "html5-qrcode";
import { joinLoyaltyProgramByDid } from "../../utils/apiClient.js";

// Helper to construct a mock credential object for join flow
function createCredential(holderDID, shopInfo, initialPoints = 0) {
  const customerId = `LM-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;
  const issuedDate = new Date().toISOString();

  return {
    customerId,
    holderDID,
    issuerDID: shopInfo.shopDID,
    shopDID: shopInfo.shopDID,
    shopName: shopInfo.shopName,
    points: initialPoints,
    tier: "Base",
    issuedDate,
    signature: "mock_signature", // TODO: replace with real cryptographic signature
  };
}

export default function ScanQRPage({ onScanComplete }) {
  const { user } = useAuth();

  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(null);

  const startScanning = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }

      await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      setScanning(true);
      setError(null);

      // Placeholder: real QR scanning to be wired later
      toast("Camera QR scanning will be implemented with a QR library");
    } catch (err) {
      console.error("Camera access error", err);
      setError("Camera access denied or not available");
      showError("Please allow camera access to scan QR codes");
    }
  };

  const handleJoinLoyalty = async (qrData) => {
    setProcessing(true);

    try {
      if (!user?.did) {
        showError("Wallet identity not found. Please re-login.");
        setProcessing(false);
        return;
      }

      // Check if already member of this shop
      const existingCredential = await getCredentialByShop(qrData.shopDID);

      if (existingCredential) {
        // eslint-disable-next-line no-alert
        const rejoin = window.confirm(
          `You're already a member of ${qrData.shopName}!\n\n` +
            `Current Points: ${existingCredential.points}\n` +
            `Current Tier: ${existingCredential.tier}\n\n` +
            `Do you want to replace your existing membership?`
        );

        if (!rejoin) {
          toast.info("Join cancelled");
          setProcessing(false);
          return;
        }

        // Delete old credential
        await deleteCredential(existingCredential.id);
      }

      // Confirm join
      // eslint-disable-next-line no-alert
      const confirmed = window.confirm(
        `Join ${qrData.shopName} Loyalty Program?\n\n` +
          `• Only your anonymous DID will be shared\n` +
          `• No phone number or email required\n` +
          `• You'll start earning points immediately\n\n` +
          `Continue?`
      );

      if (!confirmed) {
        toast.info("Join cancelled");
        setProcessing(false);
        return;
      }

      // Create new credential
      const newCredential = createCredential(
        user.did,
        {
          shopDID: qrData.shopDID,
          shopName: qrData.shopName,
          privateKey: "mock_private_key",
        },
        0
      );

      // Save credential to IndexedDB
      const saved = await saveCredential(newCredential);

      // Best-effort: also persist in backend so loyalty programs follow this DID
      try {
        await joinLoyaltyProgramByDid({
          did: user.did,
          shopDID: qrData.shopDID,
          shopName: qrData.shopName,
          points: saved.points,
          tier: saved.tier,
          issuedDate: saved.issuedDate,
          signature: saved.signature,
        });
      } catch (apiError) {
        // Do not block local flow if server is down
        console.error("Failed to sync join to backend", apiError);
      }

      toast.success(
        `🎉 Successfully joined ${qrData.shopName}!\n\n` +
          `Customer ID: ${saved.customerId}\n` +
          `You can now start earning points!`,
        { duration: 4000 }
      );

      setJoinSuccess(saved);

      if (onScanComplete) {
        onScanComplete(saved);
      }
    } catch (error) {
      console.error("Join error:", error);
      toast.error(
        "Failed to join loyalty program: " + (error?.message || "Unknown error")
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    try {
      const html5QrCode = new Html5Qrcode("qr-upload-reader");
      const decodedText = await html5QrCode.scanFile(file, true);
      await html5QrCode.clear();

      const qrData = parseQRData(decodedText);

      if (qrData.type !== "join") {
        showError("Invalid QR code. Please scan a shop Join QR.");
        return;
      }

      await handleJoinLoyalty(qrData);
    } catch (err) {
      console.error("QR image processing failed", err);
      showError("Failed to read QR code from image");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold text-white">📷 Scan QR Code</h1>

      <div className="rounded-2xl border border-purple-400/30 bg-white/10 p-8 text-white shadow-[0_0_30px_rgba(168,85,247,0.25)] backdrop-blur-lg">
        {/* Camera placeholder */}
        <div className="relative mb-6 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-black/50">
          {!scanning ? (
            <div className="text-center">
              <Scan className="mx-auto mb-4 h-16 w-16 text-purple-400" />
              <p className="text-purple-300">Camera access needed</p>
              <button
                type="button"
                onClick={startScanning}
                className="mt-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold hover:scale-105 hover:shadow-lg hover:shadow-purple-500/40 transition-all"
              >
                Enable Camera
              </button>
            </div>
          ) : (
            <div className="relative h-full w-full">
              <div className="absolute inset-0 rounded-xl border-4 border-purple-500/50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-48 w-48 animate-pulse rounded-xl border-4 border-purple-500" />
              </div>
              <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white">
                Position QR code within frame
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mb-6 space-y-4 text-sm">
          <h3 className="font-semibold text-white">What you can scan:</h3>
          <ul className="space-y-2 text-purple-300">
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
              <span>
                <strong>Join Loyalty:</strong> Scan a shop's "Join Program" QR to
                become a member.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
              <span>
                <strong>Verify at Checkout:</strong> Show your credential QR to a shop
                (feature coming next).
              </span>
            </li>
          </ul>
        </div>

        {/* Alternative: Upload image */}
        <div className="border-t border-purple-400/30 pt-6">
          <p className="mb-3 text-sm text-purple-300">
            Can't scan? Upload QR code image instead:
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="qr-upload"
          />
          <label
            htmlFor="qr-upload"
            className="block w-full cursor-pointer rounded-lg border border-purple-400/30 bg-white/5 py-3 text-center text-sm text-white transition-all hover:bg-white/10"
          >
            <Upload className="mr-2 inline h-5 w-5" />
            Upload QR Image
          </label>
          {/* hidden container for html5-qrcode file scanning */}
          <div id="qr-upload-reader" style={{ display: "none" }} />
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}
      </div>

      {processing && (
        <p className="mt-4 text-center text-sm text-purple-300">
          Processing join request...
        </p>
      )}

      {joinSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-900 to-slate-900 p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500 animate-bounce">
                <Check className="h-12 w-12 text-white" />
              </div>
            </div>

            <h2 className="mb-4 text-3xl font-bold text-white">Welcome! 🎉</h2>

            <p className="mb-6 text-purple-200">
              You've successfully joined {joinSuccess.shopName} loyalty program!
            </p>

            <div className="mb-6 rounded-xl border border-purple-400/30 bg-white/10 p-4 backdrop-blur-lg">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-purple-300">Customer ID:</span>
                <span className="font-mono text-white">{joinSuccess.customerId}</span>
              </div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-purple-300">Points:</span>
                <span className="font-bold text-white">{joinSuccess.points}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-300">Tier:</span>
                <span className="text-white">{joinSuccess.tier}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const successData = joinSuccess;
                setJoinSuccess(null);
                if (onScanComplete) onScanComplete(successData);
              }}
              className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-semibold text-white transition-all hover:scale-105"
            >
              Go to Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
