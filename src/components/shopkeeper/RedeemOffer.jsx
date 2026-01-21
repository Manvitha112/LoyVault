import React, { useState } from "react";
import { Scan, Upload, CheckCircle, Gift, X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "react-hot-toast";
import { parseQRData } from "../../utils/qrCodeUtils.js";

export default function RedeemOffer({ shop }) {
  const [scanning, setScanning] = useState(false);
  const [scannedOffer, setScannedOffer] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setVerifying(true);
      const html5QrCode = new Html5Qrcode("reader");
      const qrCodeMessage = await html5QrCode.scanFile(file, false);
      
      const parsed = parseQRData(qrCodeMessage);
      
      if (parsed.type === "offer" && parsed.shopDID === shop?.shopDID) {
        setScannedOffer(parsed);
        toast.success("Offer verified successfully!");
      } else if (parsed.type === "offer" && parsed.shopDID !== shop?.shopDID) {
        toast.error("This offer is not from your shop");
      } else {
        toast.error("Invalid offer QR code");
      }
    } catch (error) {
      console.error("Failed to scan offer QR:", error);
      toast.error("Failed to scan QR code");
    } finally {
      setVerifying(false);
    }
  };

  const handleRedeemOffer = () => {
    if (!scannedOffer) return;

    toast.success(`Offer "${scannedOffer.title}" redeemed successfully!`);
    setScannedOffer(null);
  };

  const handleCancel = () => {
    setScannedOffer(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Redeem Customer Offer</h2>
        <p className="text-sm text-purple-300">
          Scan customer's offer QR code to verify and redeem
        </p>
      </div>

      {!scannedOffer ? (
        <div className="rounded-2xl border border-purple-400/30 bg-white/10 p-8 backdrop-blur-lg">
          <div className="mb-6 text-center">
            <Gift className="mx-auto mb-4 h-16 w-16 text-purple-400" />
            <h3 className="mb-2 text-xl font-bold text-white">
              Upload Offer QR Code
            </h3>
            <p className="text-sm text-purple-300">
              Customer should show their offer QR from the wallet
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <label
              htmlFor="offer-qr-upload"
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105"
            >
              <Upload className="h-5 w-5" />
              Upload QR Image
            </label>
            <input
              id="offer-qr-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            {verifying && (
              <div className="flex items-center gap-2 text-purple-300">
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-purple-400" />
                <span>Verifying offer...</span>
              </div>
            )}
          </div>

          <div id="reader" className="hidden" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-green-400/30 bg-green-500/10 p-6 backdrop-blur-lg">
            <div className="mb-4 flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <div>
                <h3 className="text-xl font-bold text-white">Offer Verified</h3>
                <p className="text-sm text-green-300">Valid offer from your shop</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-purple-400/30 bg-white/10 p-6 backdrop-blur-lg">
            <h3 className="mb-4 text-lg font-bold text-white">Offer Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-purple-300">Offer Title</p>
                <p className="text-lg font-semibold text-white">
                  {scannedOffer.title}
                </p>
              </div>
              <div>
                <p className="text-sm text-purple-300">Description</p>
                <p className="text-white">{scannedOffer.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-purple-300">Discount</p>
                  <p className="font-semibold text-white">
                    {scannedOffer.discountValue}
                    {scannedOffer.offerType === "percentage_discount" ? "%" : "₹"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-purple-300">Min Tier</p>
                  <p className="font-semibold text-white">{scannedOffer.minTier}</p>
                </div>
              </div>
              {scannedOffer.customerDID && (
                <div>
                  <p className="text-sm text-purple-300">Customer DID</p>
                  <p className="break-all font-mono text-xs text-white">
                    {scannedOffer.customerDID}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleRedeemOffer}
              className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 py-4 font-semibold text-white transition-all hover:scale-105"
            >
              Confirm Redemption
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-purple-400/30 bg-white/10 px-6 py-4 font-semibold text-white transition-all hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
