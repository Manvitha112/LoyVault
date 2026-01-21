import React, { useMemo } from "react";
import { Copy, LogOut } from "lucide-react";
import { showSuccess, showError } from "../common/Toast.jsx";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const getGreetingIcon = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "☀️";
  if (hour < 18) return "🌤️";
  return "🌙";
};

const truncateDID = (did) => {
  if (!did) return "";
  if (did.length <= 35) return did;
  return `${did.slice(0, 25)}...${did.slice(-6)}`;
};

export default function DashboardHeader({ shop, onLogout }) {
  const shopName = shop?.shopName || "Your Shop";
  const shopDID = shop?.shopDID || "did:loyvault:shop-...";

  const greeting = useMemo(() => getGreeting(), []);
  const greetingIcon = useMemo(() => getGreetingIcon(), []);
  const displayDID = useMemo(() => truncateDID(shopDID), [shopDID]);

  const handleCopyDID = async () => {
    try {
      await navigator.clipboard.writeText(shopDID);
      showSuccess("Shop DID copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy shop DID", error);
      showError("Failed to copy DID");
    }
  };

  return (
    <header className="border-b border-blue-400/30 bg-white/10 px-6 py-4 backdrop-blur-lg">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Greeting and DID */}
        <div className="min-w-0">
          <h2 className="mb-1 truncate text-2xl font-bold text-white">
            {greeting}, {shopName}! <span className="align-middle">{greetingIcon}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="truncate text-blue-300">
              Shop DID: {displayDID}
            </span>
            <button
              type="button"
              onClick={handleCopyDID}
              className="inline-flex items-center justify-center rounded p-1 text-blue-400 transition hover:bg-white/10"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right: Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-sm font-bold text-white">
                {shopName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden max-w-[140px] truncate sm:inline">{shopName}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-500/10"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
