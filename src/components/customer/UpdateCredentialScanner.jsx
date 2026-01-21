import React, { useState, useRef, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { syncUpdatedCredential } from "../../utils/credentialSync.js";
import { getCredentialByShop } from "../../utils/indexedDB.js";
import { parseQRData } from "../../utils/qrCodeUtils.js";
import { toast } from "react-hot-toast";
import { Check, X, TrendingUp, Award } from "lucide-react";

const UpdateCredentialScanner = ({ onClose, onUpdateComplete }) => {
  const [scanning, setScanning] = useState(true);
  const [updateResult, setUpdateResult] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (scanning) {
      startScanner();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  const startScanner = () => {
    const scanner = new Html5QrcodeScanner(
      "update-qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    scanner.render(onScanSuccess, onScanError);
    scannerRef.current = scanner;
  };

  const onScanSuccess = async (decodedText) => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.clear();
      }
      setScanning(false);

      const qrData = parseQRData(decodedText);

      const existingCredential = await getCredentialByShop(qrData.issuerDID);

      if (!existingCredential) {
        toast.error("You are not a member of this shop yet");
        setTimeout(() => onClose(), 2000);
        return;
      }

      const result = await syncUpdatedCredential(qrData, existingCredential);

      if (result.success) {
        setUpdateResult(result);
        toast.success("Credential updated successfully!");

        setTimeout(() => {
          if (onUpdateComplete) {
            onUpdateComplete(result.credential);
          }
          onClose();
        }, 3000);
      } else {
        toast.error(result.error || "Failed to update credential");
        setTimeout(() => onClose(), 2000);
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to update credential");
      setTimeout(() => onClose(), 2000);
    }
  };

  const onScanError = (error) => {
    // Non-fatal scan errors are expected while scanning
    // console.log("Scan error:", error);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-900 to-slate-900 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {updateResult ? "Update Complete!" : "Scan Updated Credential"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition-all hover:bg-white/10"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {!updateResult ? (
          <>
            <p className="mb-6 text-center text-purple-300">
              Scan the QR code shown by the cashier to update your points
            </p>

            <div id="update-qr-reader" className="mb-4 w-full" />
          </>
        ) : (
          <div className="text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500 mx-auto">
              <Check className="h-12 w-12 text-white" />
            </div>

            <h3 className="mb-6 text-2xl font-bold text-white">
              Points Updated! 🎉
            </h3>

            <div className="mb-6 rounded-xl border border-purple-400/30 bg-white/10 p-6 backdrop-blur-lg">
              <div className="mb-4 flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="mb-1 text-sm text-purple-300">Points Added</p>
                  <p className="text-3xl font-bold text-white">
                    +{updateResult.changes.pointsAdded}
                  </p>
                </div>

                <TrendingUp className="h-8 w-8 text-green-400" />

                <div className="text-center">
                  <p className="mb-1 text-sm text-purple-300">New Total</p>
                  <p className="text-3xl font-bold text-white">
                    {updateResult.credential.points}
                  </p>
                </div>
              </div>

              {updateResult.changes.tierChanged && (
                <div className="border-t border-purple-400/30 pt-4">
                  <div className="flex items-center justify-center gap-3">
                    <Award className="h-6 w-6 text-yellow-400" />
                    <span className="font-semibold text-white">
                      Tier Upgraded: {updateResult.changes.oldTier} → {" "}
                      {updateResult.changes.newTier}!
                    </span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-sm text-purple-300">Closing automatically...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateCredentialScanner;
