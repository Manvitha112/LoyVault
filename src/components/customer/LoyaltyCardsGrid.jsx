import React, { useMemo, useState } from "react";
import { Plus, Wallet, Scan } from "lucide-react";
import LoyaltyCard from "./LoyaltyCard.jsx";

const tierOrder = { Platinum: 5, Gold: 4, Silver: 3, Bronze: 2, Base: 1 };

const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl bg-white/5 p-6">
    <div className="mb-4 h-12 w-12 rounded-full bg-white/10" />
    <div className="mb-2 h-6 rounded bg-white/10" />
    <div className="h-4 w-2/3 rounded bg-white/10" />
  </div>
);

export default function LoyaltyCardsGrid({
  credentials = [],
  onCardClick,
  onAddShop,
  loading = false,
}) {
  const [sortBy, setSortBy] = useState("recent");

  const sortedCredentials = useMemo(() => {
    const sorted = [...credentials];

    switch (sortBy) {
      case "points":
        return sorted.sort((a, b) => (b.points || 0) - (a.points || 0));
      case "name":
        return sorted.sort((a, b) =>
          (a.shopName || "").localeCompare(b.shopName || "")
        );
      case "tier":
        return sorted.sort(
          (a, b) => (tierOrder[b.tier] || 0) - (tierOrder[a.tier] || 0)
        );
      case "recent":
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.issuedDate || 0).getTime() -
            new Date(a.issuedDate || 0).getTime()
        );
    }
  }, [credentials, sortBy]);

  const count = credentials.length;

  return (
    <section className="mt-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">
            My Loyalty Programs
            <span className="ml-2 text-base font-semibold text-purple-400">
              ({count})
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-purple-400/30 bg-slate-800 px-3 py-1 text-xs text-white focus:outline-none"
            style={{ colorScheme: 'dark' }}
          >
            <option value="recent" className="bg-slate-800 text-white">Recently Added</option>
            <option value="points" className="bg-slate-800 text-white">Highest Points</option>
            <option value="tier" className="bg-slate-800 text-white">Highest Tier</option>
            <option value="name" className="bg-slate-800 text-white">Shop Name</option>
          </select>

          <button
            type="button"
            onClick={onAddShop}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-xs font-medium text-white shadow-md transition-all hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:shadow-purple-500/40"
          >
            <Plus className="h-4 w-4" />
            <span>Add Shop</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && count === 0 && (
        <div className="py-16 text-center">
          <div className="mb-6">
            <Wallet className="mx-auto h-24 w-24 text-purple-400/50" />
          </div>
          <h3 className="mb-2 text-2xl font-bold text-white">
            No Loyalty Programs Yet
          </h3>
          <p className="mb-6 mx-auto max-w-md text-sm text-purple-300">
            Scan a shop's QR code to join your first loyalty program and start
            earning rewards!
          </p>
          <button
            type="button"
            onClick={onAddShop}
            className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/40"
          >
            <div className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              <span>Scan QR Code</span>
            </div>
          </button>
        </div>
      )}

      {/* Cards grid */}
      {!loading && count > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedCredentials.map((credential) => (
            <LoyaltyCard
              key={credential.id}
              credential={credential}
              onClick={onCardClick}
            />
          ))}
        </div>
      )}
    </section>
  );
}
