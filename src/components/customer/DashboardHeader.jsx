import React, { useMemo, useState } from "react";
import { Shield, User, ChevronDown, LogOut, Copy, Check } from "lucide-react";
import { showSuccess } from "../common/Toast.jsx";

function truncateDID(did) {
  if (!did) return "";
  if (did.length <= 30) return did;
  return `${did.slice(0, 20)}...${did.slice(-6)}`;
}

export default function DashboardHeader({ user, onLogout }) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const displayDID = useMemo(() => truncateDID(user?.did), [user?.did]);

  const handleCopyDID = async () => {
    if (!user?.did) return;
    try {
      await navigator.clipboard.writeText(user.did);
      setCopied(true);
      showSuccess("DID copied to clipboard!");
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error("Failed to copy DID", e);
    }
  };

  const handleLogout = () => {
    // Basic confirmation for now; can be replaced with custom modal later
    if (window.confirm("Are you sure you want to logout?")) {
      onLogout?.();
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-purple-400/30 bg-white/10 p-6 text-white shadow-[0_0_40px_rgba(168,85,247,0.35)] backdrop-blur-lg">
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo shadow-lg shadow-purple-500/40">
            <Shield className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-purple-200/90">LoyVault</p>
            <p className="text-[11px] text-white/70">Self-sovereign loyalty wallet</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Simple profile "dropdown" placeholder */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="relative inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 shadow-sm transition hover:bg-white/15"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold uppercase">
              {(user?.name || "C").slice(0, 1)}
            </span>
            <span className="hidden sm:inline max-w-[120px] truncate">
              {user?.name || "Customer"}
            </span>
            <ChevronDown className={`h-3 w-3 transition-transform ${menuOpen ? "rotate-180" : ""}`} />

            {menuOpen && (
              <div className="absolute right-0 top-9 z-30 w-40 rounded-xl border border-white/10 bg-slate-950/95 p-1 text-[11px] text-white/80 shadow-lg">
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-white/5"
                  onClick={handleCopyDID}
                >
                  <span>View / Copy DID</span>
                  <Copy className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-white/5"
                >
                  <span>Settings</span>
                </button>
                <button
                  type="button"
                  className="mt-1 flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-red-300 hover:bg-red-500/10"
                  onClick={handleLogout}
                >
                  <span>Logout</span>
                  <LogOut className="h-3 w-3" />
                </button>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="hidden items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:border-red-400/60 hover:bg-red-500/10 hover:text-red-100 sm:inline-flex"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Welcome section */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Welcome back! <span className="inline-block align-middle">👋</span>
        </h1>
        <p className="text-sm font-medium text-purple-200">Your Digital Wallet</p>
      </div>

      {/* DID display */}
      <div className="mt-4 inline-flex items-center gap-3 rounded-2xl bg-black/30 px-4 py-3 text-sm">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
          DID
        </span>
        <span className="font-mono text-xs text-purple-300">
          {displayDID || "did:loyvault:..."}
        </span>
        <button
          type="button"
          onClick={handleCopyDID}
          className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-purple-100 transition hover:scale-105 hover:bg-purple-500/70 hover:text-white"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
