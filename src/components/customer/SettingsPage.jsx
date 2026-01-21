import React, { useMemo } from "react";
import {
  Copy,
  ChevronRight,
  Download,
  Upload,
  Lock,
  Eye,
  Trash2,
  AlertTriangle,
  Info,
  FileText,
  Mail,
  LogOut,
} from "lucide-react";
import { exportWallet, importWallet, deleteIdentity, getAllCredentials } from "../../utils/indexedDB.js";
import { showSuccess, showError, toast } from "../common/Toast.jsx";

const SettingButton = ({ icon: Icon, label, onClick, variant = "default" }) => {
  const variants = {
    default: "bg-white/5 hover:bg-white/10 text-white border-purple-400/30",
    danger:
      "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-400/30",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-xl p-4 border transition-all ${
        variants[variant] || variants.default
      }`}
    >
      <Icon className="h-6 w-6" />
      <span className="font-medium text-sm">{label}</span>
      <ChevronRight className="ml-auto h-5 w-5 opacity-50" />
    </button>
  );
};

export default function SettingsPage({ user, onLogout }) {
  const did = user?.did || "did:loyvault:...";

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return "Unknown";
    try {
      const d = new Date(user.createdAt);
      if (Number.isNaN(d.getTime())) return "Unknown";
      return d.toLocaleString(undefined, { month: "long", year: "numeric" });
    } catch {
      return "Unknown";
    }
  }, [user?.createdAt]);

  const handleCopyDID = async () => {
    try {
      await navigator.clipboard.writeText(did);
      showSuccess("DID copied to clipboard");
    } catch (error) {
      console.error("Failed to copy DID", error);
      showError("Failed to copy DID");
    }
  };

  const handleBackupWallet = async () => {
    const loadingId = toast.loading("Preparing wallet backup...");
    try {
      const backup = await exportWallet();

      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `loyvault-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      showSuccess("Wallet backup downloaded!");
    } catch (error) {
      console.error("Backup failed", error);
      showError("Backup failed: " + (error?.message || "Unknown error"));
    } finally {
      toast.dismiss(loadingId);
    }
  };

  const handleRestoreWallet = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const backup = JSON.parse(text);

        if (!backup || typeof backup !== "object") {
          throw new Error("Invalid backup file");
        }

        if (!backup.identity && !backup.credentials) {
          throw new Error("Missing identity or credentials in backup");
        }

        if (
          !window.confirm(
            "This will replace your current wallet data with the backup. Continue?"
          )
        ) {
          return;
        }

        const loadingId = toast.loading("Restoring wallet...");
        const ok = await importWallet(backup);
        toast.dismiss(loadingId);

        if (!ok) {
          showError("Restore failed. Please check the backup file.");
          return;
        }

        showSuccess("Wallet restored successfully! Reloading...");
        window.location.reload();
      } catch (error) {
        console.error("Restore failed", error);
        showError("Restore failed: " + (error?.message || "Unknown error"));
      }
    };

    input.click();
  };

  const handleChangePIN = () => {
    toast("PIN change feature coming soon");
  };

  const handleRevokeAll = async () => {
    try {
      const creds = await getAllCredentials();
      if (!creds.length) {
        showError("No credentials to revoke");
        return;
      }
      // Placeholder – real revocation flow will be added later
      showSuccess("Revocation flow coming soon");
    } catch (error) {
      console.error("Failed to check credentials", error);
      showError("Failed to check credentials");
    }
  };

  const handleClearWallet = async () => {
    const confirmed = window.confirm(
      "This will delete ALL your credentials and wallet data. This action cannot be undone. Are you sure?"
    );
    if (!confirmed) return;

    const doubleConfirm = window.prompt("Type DELETE to confirm:");
    if (doubleConfirm !== "DELETE") {
      showError("Wallet deletion cancelled");
      return;
    }

    try {
      const ok = await deleteIdentity();
      if (!ok) {
        showError("Failed to clear wallet");
        return;
      }

      showSuccess("Wallet cleared");
      onLogout?.();
    } catch (error) {
      console.error("Failed to clear wallet", error);
      showError("Failed to clear wallet");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      onLogout?.();
    }
  };

  return (
    <div className="space-y-8">
      {/* Account information */}
      <div className="mb-2 rounded-xl border border-purple-400/30 bg-white/10 p-6 text-white shadow-[0_0_30px_rgba(168,85,247,0.25)] backdrop-blur-lg">
        <h3 className="mb-4 text-lg font-semibold">Account Information</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-purple-300">
              Decentralized Identifier (DID)
            </label>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 rounded bg-black/20 px-3 py-2 text-xs font-mono text-white">
                {did}
              </code>
              <button
                type="button"
                onClick={handleCopyDID}
                className="rounded p-2 hover:bg-white/10"
              >
                <Copy className="h-5 w-5 text-purple-400" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-purple-300">Member Since</label>
            <p className="mt-1 text-sm text-white">{memberSince}</p>
          </div>
        </div>
      </div>

      {/* Wallet Management */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Wallet Management</h3>
        <div className="space-y-3">
          <SettingButton
            icon={Download}
            label="Backup Wallet"
            onClick={handleBackupWallet}
          />
          <SettingButton
            icon={Upload}
            label="Restore Wallet"
            onClick={handleRestoreWallet}
          />
          <SettingButton
            icon={Lock}
            label="Change PIN"
            onClick={handleChangePIN}
          />
        </div>
      </div>

      {/* Privacy & Security */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Privacy &amp; Security</h3>
        <div className="space-y-3">
          <SettingButton
            icon={Eye}
            label="View All Credentials"
            onClick={async () => {
              const creds = await getAllCredentials();
              console.log("Current credentials", creds);
              showSuccess("Credentials logged to console (dev helper)");
            }}
          />
          <SettingButton
            icon={Trash2}
            label="Revoke All Credentials"
            onClick={handleRevokeAll}
            variant="danger"
          />
          <SettingButton
            icon={AlertTriangle}
            label="Clear Wallet Data"
            onClick={handleClearWallet}
            variant="danger"
          />
        </div>
      </div>

      {/* About */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">About</h3>
        <div className="space-y-3">
          <SettingButton
            icon={Info}
            label="About LoyVault"
            onClick={() => {
              showSuccess("LoyVault – self-sovereign loyalty wallet prototype");
            }}
          />
          <SettingButton
            icon={FileText}
            label="Privacy Policy"
            onClick={() => {
              showSuccess("Privacy policy will be linked here.");
            }}
          />
          <SettingButton
            icon={Mail}
            label="Contact Support"
            onClick={() => {
              showSuccess("Contact support feature coming soon");
            }}
          />
        </div>
      </div>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/40"
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </button>
    </div>
  );
}
