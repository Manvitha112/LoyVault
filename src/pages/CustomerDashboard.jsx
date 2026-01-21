import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getAllCredentials } from "../utils/indexedDB.js";
import { fetchLoyaltyProgramsByDid } from "../utils/apiClient.js";
import DashboardHeader from "../components/customer/DashboardHeader.jsx";
import WalletOverview from "../components/customer/WalletOverview.jsx";
import LoyaltyCardsGrid from "../components/customer/LoyaltyCardsGrid.jsx";
import BottomNav from "../components/customer/BottomNav.jsx";
import OffersPage from "../components/customer/OffersPage.jsx";
import ScanQRPage from "../components/customer/ScanQRPage.jsx";
import SettingsPage from "../components/customer/SettingsPage.jsx";
import ReceiptsPage from "../components/customer/ReceiptsPage.jsx";
import ProfilePage from "../components/customer/ProfilePage.jsx";
import UpdateCredentialScanner from "../components/customer/UpdateCredentialScanner.jsx";
import { RefreshCw } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "../components/common/Toast.jsx";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [showUpdateScanner, setShowUpdateScanner] = useState(false);
  const [showCredentialQR, setShowCredentialQR] = useState(null);

  // Load credentials on mount
  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    setLoading(true);
    try {
      const localCreds = await getAllCredentials();
      let merged = localCreds || [];

      // Also fetch from backend by DID so programs follow the customer across devices
      try {
        if (user?.did) {
          const remote = await fetchLoyaltyProgramsByDid(user.did);
          if (Array.isArray(remote) && remote.length > 0) {
            // Map remote programs into the same shape as wallet credentials where possible
            const remoteMapped = remote.map((p) => ({
              id: p._id,
              shopName: p.shopName,
              shopDID: p.shopDID,
              points: p.points,
              tier: p.tier,
              issuedDate: p.issuedDate,
              // customerId / signature may be local-only for now
            }));

            // Merge by shopDID, preferring local if it exists
            const byShop = new Map();
            merged.forEach((c) => {
              if (c.shopDID) byShop.set(c.shopDID, c);
            });
            remoteMapped.forEach((r) => {
              if (!byShop.has(r.shopDID)) {
                byShop.set(r.shopDID, r);
              }
            });
            merged = Array.from(byShop.values());
          }
        }
      } catch (apiError) {
        console.error("Failed to load loyalty programs from backend", apiError);
      }

      setCredentials(merged);
    } catch (error) {
      console.error("Failed to load credentials:", error);
      toast.error("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (credential) => {
    setSelectedCredential(credential);
  };

  const handleAddShop = () => {
    setActiveTab("scan");
  };

  const handleScanComplete = (qrData) => {
    // TODO: Process scanned QR data
    console.log("Scanned:", qrData);
    toast.success("QR code scanned successfully!");
    // Reload credentials after joining
    loadCredentials();
    setActiveTab("home");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDownloadCredentialQR = () => {
    try {
      const canvas = document.querySelector("#customer-credential-qr canvas");
      if (!canvas) {
        toast.error("QR code not found to download");
        return;
      }

      const dataUrl = canvas.toDataURL("image/png");
      const byteString = atob(dataUrl.split(",")[1]);
      const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i += 1) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      const shopName = showCredentialQR?.shopName || "loyvault-card";
      link.download = `${shopName.replace(/\s+/g, "_")}_loyalty_qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download credential QR", error);
      toast.error("Failed to download QR code");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <>
            <WalletOverview credentials={credentials} />
            <LoyaltyCardsGrid
              credentials={credentials}
              onCardClick={handleCardClick}
              onAddShop={handleAddShop}
              loading={loading}
            />
          </>
        );
      case "offers":
        return <OffersPage credentials={credentials} userDid={user?.did} />;
      case "receipts":
        return <ReceiptsPage userDid={user?.did} />;
      case "profile":
        return <ProfilePage user={user} />;
      case "scan":
        return <ScanQRPage onScanComplete={handleScanComplete} />;
      case "settings":
        return <SettingsPage user={user} onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 pb-24">
        <DashboardHeader user={user} onLogout={handleLogout} />
        {renderContent()}
      </div>

      {/* Floating button to scan for credential updates */}
      <button
        type="button"
        onClick={() => setShowUpdateScanner(true)}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg transition-all hover:scale-110"
        title="Scan for updates"
      >
        <RefreshCw className="h-6 w-6 text-white" />
      </button>

      {showUpdateScanner && (
        <UpdateCredentialScanner
          onClose={() => setShowUpdateScanner(false)}
          onUpdateComplete={() => {
            loadCredentials();
          }}
        />
      )}

      {selectedCredential && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-900 to-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Loyalty Card Details</h2>
              <button
                type="button"
                onClick={() => setSelectedCredential(null)}
                className="rounded-lg px-2 py-1 text-sm text-purple-200 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <h3 className="mb-2 text-xl font-semibold text-white">
              {selectedCredential.shopName}
            </h3>
            <p className="mb-4 text-sm text-purple-300">
              Shop DID: <span className="font-mono break-all">{selectedCredential.shopDID}</span>
            </p>

            <div className="mb-4 grid grid-cols-2 gap-4 text-sm text-purple-200">
              <div>
                <p className="text-purple-400">Points</p>
                <p className="text-lg font-semibold text-white">{selectedCredential.points}</p>
              </div>
              <div>
                <p className="text-purple-400">Tier</p>
                <p className="text-lg font-semibold text-white">{selectedCredential.tier}</p>
              </div>
              {selectedCredential.customerId && (
                <div className="col-span-2">
                  <p className="text-purple-400">Customer ID</p>
                  <p className="font-mono text-white">{selectedCredential.customerId}</p>
                </div>
              )}
              {selectedCredential.issuedDate && (
                <div className="col-span-2">
                  <p className="text-purple-400">Joined On</p>
                  <p className="text-white">
                    {new Date(selectedCredential.issuedDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedCredential(null)}
              className="mt-2 w-full rounded-lg bg-white/10 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20"
            >
              Done
            </button>

            <button
              type="button"
              onClick={() => setShowCredentialQR(selectedCredential)}
              className="mt-3 w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-3 text-sm font-semibold text-white transition-all hover:scale-105"
            >
              Show QR for Checkout
            </button>
          </div>
        </div>
      )}

      {showCredentialQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-900 to-slate-900 p-6 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">Show at Checkout</h2>
            <p className="mb-4 text-sm text-purple-200">
              Ask the cashier to scan this QR to verify and update your loyalty points.
            </p>

            <div
              id="customer-credential-qr"
              className="mb-4 rounded-2xl bg-white p-6"
            >
              <QRCodeCanvas
                value={JSON.stringify({
                  type: "verify",
                  customerDID: showCredentialQR.holderDID || user?.did || "",
                  customerId: showCredentialQR.customerId,
                  points: showCredentialQR.points,
                  tier: showCredentialQR.tier,
                  signature: showCredentialQR.signature || "mock_signature",
                  shopDID: showCredentialQR.shopDID,
                  issuerDID: showCredentialQR.issuerDID || showCredentialQR.shopDID,
                  issuedDate: showCredentialQR.issuedDate,
                })}
                size={220}
                level="H"
                includeMargin
              />
            </div>

            <p className="mb-4 text-xs text-purple-300 break-words">
              Customer ID: {showCredentialQR.customerId || "--"}
            </p>

            <button
              type="button"
              onClick={handleDownloadCredentialQR}
              className="mb-3 w-full rounded-lg border border-purple-400/60 bg-transparent py-3 text-sm font-semibold text-purple-100 transition-all hover:bg-white/10"
            >
              Download QR
            </button>

            <button
              type="button"
              onClick={() => setShowCredentialQR(null)}
              className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-3 text-sm font-semibold text-white transition-all hover:scale-105"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default CustomerDashboard;
