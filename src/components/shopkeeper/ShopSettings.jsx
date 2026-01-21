import React, { useState } from "react";
import {
  Copy,
  Lock,
  Mail,
  ChevronRight,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { toast } from "../common/Toast.jsx";

export default function ShopSettings({ shop, onLogout }) {
  const [profileData, setProfileData] = useState({
    shopName: shop?.shopName || "",
    email: shop?.email || "",
    phone: shop?.phone || "",
  });

  const [loyaltySettings, setLoyaltySettings] = useState({
    pointsPerAmount: 1,
    amountPerPoint: 10,
    tiers: {
      bronze: 50,
      silver: 100,
      gold: 250,
      platinum: 500,
    },
  });

  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // TODO: Update in IndexedDB/backend
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error("Failed to update profile");
    }
  };

  const handleUpdateLoyaltySettings = async () => {
    try {
      // TODO: Save settings
      toast.success("Loyalty settings updated!");
    } catch (error) {
      console.error("Failed to update loyalty settings", error);
      toast.error("Failed to update settings");
    }
  };

  const handleDeactivateAccount = () => {
    // eslint-disable-next-line no-alert
    if (
      window.confirm(
        "Are you sure you want to deactivate your account? You can reactivate later."
      )
    ) {
      toast.info("Account deactivation feature coming soon");
    }
  };

  const handleDeleteShop = () => {
    // eslint-disable-next-line no-alert
    const confirmation = window.prompt(
      "Type DELETE to confirm permanent deletion:"
    );
    if (confirmation === "DELETE") {
      // eslint-disable-next-line no-alert
      if (
        window.confirm(
          "This action cannot be undone. Are you absolutely sure?"
        )
      ) {
        // TODO: Delete shop data
        toast.success("Shop data deleted");
        if (onLogout) {
          onLogout();
        }
      }
    } else if (confirmation !== null) {
      toast.error("Deletion cancelled");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-white">Settings</h1>
        <p className="text-blue-300">
          Manage your shop profile and preferences
        </p>
      </div>

      {/* Shop Information */}
      <div className="rounded-xl border border-blue-400/30 bg-white/10 p-6 backdrop-blur-lg">
        <h2 className="mb-4 text-xl font-bold text-white">Shop Information</h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="mb-2 block text-blue-300">Shop Name</label>
            <input
              type="text"
              value={profileData.shopName}
              onChange={(e) =>
                setProfileData({ ...profileData, shopName: e.target.value })
              }
              className="w-full rounded-lg border border-blue-400/30 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-blue-300">Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) =>
                setProfileData({ ...profileData, email: e.target.value })
              }
              className="w-full rounded-lg border border-blue-400/30 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-blue-300">Phone (Optional)</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) =>
                setProfileData({ ...profileData, phone: e.target.value })
              }
              className="w-full rounded-lg border border-blue-400/30 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-blue-300">Shop DID (Read-only)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shop?.shopDID || ""}
                disabled
                className="flex-1 cursor-not-allowed rounded-lg border border-blue-400/30 bg-white/5 px-4 py-3 text-blue-400"
              />
              <button
                type="button"
                onClick={() => {
                  if (shop?.shopDID) {
                    navigator.clipboard.writeText(shop.shopDID);
                    toast.success("DID copied!");
                  }
                }}
                className="rounded-lg border border-blue-400/30 bg-white/10 p-3 transition-all hover:bg-white/20"
              >
                <Copy className="h-5 w-5 text-blue-400" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105"
          >
            Update Profile
          </button>
        </form>
      </div>

      {/* Loyalty Program Settings */}
      <div className="rounded-xl border border-blue-400/30 bg-white/10 p-6 backdrop-blur-lg">
        <h2 className="mb-4 text-xl font-bold text-white">
          Loyalty Program Settings
        </h2>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-blue-300">Points Rule</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={loyaltySettings.pointsPerAmount}
                onChange={(e) =>
                  setLoyaltySettings({
                    ...loyaltySettings,
                    pointsPerAmount: e.target.value,
                  })
                }
                className="w-24 rounded-lg border border-blue-400/30 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-400"
              />
              <span className="text-white">point(s) per ₹</span>
              <input
                type="number"
                value={loyaltySettings.amountPerPoint}
                onChange={(e) =>
                  setLoyaltySettings({
                    ...loyaltySettings,
                    amountPerPoint: e.target.value,
                  })
                }
                className="w-24 rounded-lg border border-blue-400/30 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-4 block text-blue-300">
              Tier Thresholds (Points)
            </label>
            <div className="grid grid-cols-2 gap-4">
              {["Bronze", "Silver", "Gold", "Platinum"].map((tier) => (
                <div key={tier}>
                  <label className="mb-1 block text-sm text-blue-200">
                    {tier}
                  </label>
                  <input
                    type="number"
                    value={
                      loyaltySettings.tiers[tier.toLowerCase()] ?? ""
                    }
                    onChange={(e) =>
                      setLoyaltySettings({
                        ...loyaltySettings,
                        tiers: {
                          ...loyaltySettings.tiers,
                          [tier.toLowerCase()]: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-blue-400/30 bg-white/5 px-4 py-2 text-white outline-none focus:border-blue-400"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleUpdateLoyaltySettings}
            className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105"
          >
            Update Settings
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-xl border border-blue-400/30 bg-white/10 p-6 backdrop-blur-lg">
        <h2 className="mb-4 text-xl font-bold text-white">Security</h2>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowChangePassword(true)}
            className="flex w-full items-center gap-3 rounded-lg border border-blue-400/30 bg-white/5 p-4 text-left transition-all hover:bg-white/10"
          >
            <Lock className="h-5 w-5 text-blue-400" />
            <div className="flex-1">
              <h4 className="font-semibold text-white">Change Password</h4>
              <p className="text-sm text-blue-300">
                Update your account password
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          <button
            type="button"
            onClick={() => toast.info("Email update coming soon")}
            className="flex w-full items-center gap-3 rounded-lg border border-blue-400/30 bg-white/5 p-4 text-left transition-all hover:bg-white/10"
          >
            <Mail className="h-5 w-5 text-blue-400" />
            <div className="flex-1">
              <h4 className="font-semibold text-white">Update Email</h4>
              <p className="text-sm text-blue-300">
                Change your account email
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-6">
        <h2 className="mb-4 text-xl font-bold text-red-400">Danger Zone</h2>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleDeactivateAccount}
            className="flex w-full items-center gap-3 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-left transition-all hover:bg-red-500/20"
          >
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="flex-1">
              <h4 className="font-semibold text-white">Deactivate Account</h4>
              <p className="text-sm text-red-300">
                Temporarily disable your shop
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleDeleteShop}
            className="flex w-full items-center gap-3 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-left transition-all hover:bg-red-500/20"
          >
            <Trash2 className="h-5 w-5 text-red-400" />
            <div className="flex-1">
              <h4 className="font-semibold text-white">Delete Shop Data</h4>
              <p className="text-sm text-red-300">
                Permanently delete all shop data
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Placeholder for change password modal state */}
      {showChangePassword && (
        <p className="text-xs text-blue-300">
          Password change flow coming soon.
        </p>
      )}
    </div>
  );
}
