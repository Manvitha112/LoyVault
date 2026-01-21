import React, { useMemo } from "react";
import { Check, ArrowRight } from "lucide-react";

const tierColors = {
  Base: "from-gray-400 to-gray-600",
  Bronze: "from-amber-600 to-amber-800",
  Silver: "from-slate-400 to-slate-600",
  Gold: "from-yellow-400 to-yellow-600",
  Platinum: "from-purple-400 to-purple-600",
};

const tierBorderColors = {
  Base: "border-gray-400/30",
  Bronze: "border-amber-400/30",
  Silver: "border-slate-400/30",
  Gold: "border-yellow-400/30",
  Platinum: "border-purple-400/30",
};

const formatExpiry = (date) => {
  if (!date) return "No expiry";
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "No expiry";
    return d.toLocaleString(undefined, { month: "short", year: "numeric" });
  } catch {
    return "No expiry";
  }
};

const isExpiringSoon = (expiresDate) => {
  if (!expiresDate) return false;
  const now = new Date();
  const target = new Date(expiresDate);
  const daysUntilExpiry = Math.floor((target - now) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry < 30 && daysUntilExpiry > 0;
};

const isExpired = (expiresDate) => {
  if (!expiresDate) return false;
  return new Date(expiresDate) < new Date();
};

export default function LoyaltyCard({ credential, onClick }) {
  const {
    shopName,
    shopLogo,
    points,
    tier = "Base",
    expiresDate,
    verified,
  } = credential || {};

  const borderClass = useMemo(
    () => tierBorderColors[tier] || tierBorderColors.Base,
    [tier]
  );

  const tierGradient = useMemo(
    () => tierColors[tier] || tierColors.Base,
    [tier]
  );

  const expiryLabel = useMemo(
    () => formatExpiry(expiresDate),
    [expiresDate]
  );

  const expiringSoon = useMemo(
    () => isExpiringSoon(expiresDate),
    [expiresDate]
  );

  const expired = useMemo(
    () => isExpired(expiresDate),
    [expiresDate]
  );

  const handleClick = () => {
    if (typeof onClick === "function") {
      onClick(credential);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 border ${borderClass}`}
    >
      {/* Top section */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/20 text-2xl">
            <span aria-hidden="true">{shopLogo || "🏪"}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/90">
              {shopName || "Loyalty Program"}
            </p>
          </div>
        </div>

        {verified && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
            <Check className="h-5 w-5 text-green-400" />
          </div>
        )}
      </div>

      {/* Middle section */}
      <div className="space-y-2">
        <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          ⭐ {points ?? 0} Points
        </div>

        <span
          className={`inline-block rounded-full px-3 py-1 text-sm font-semibold text-white bg-gradient-to-r ${tierGradient}`}
        >
          🏆 {tier} Tier
        </span>
      </div>

      {/* Bottom section */}
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-white/70">
        <div className="space-y-1">
          <p>
            <span className="text-white/50">Valid until:</span> {expiryLabel}
          </p>
          {expiringSoon && !expired && (
            <span className="text-xs text-orange-400">⚠️ Expires soon</span>
          )}
          {expired && (
            <span className="text-xs text-red-400">❌ Expired</span>
          )}
        </div>

        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-200">
          <span>View Details</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
