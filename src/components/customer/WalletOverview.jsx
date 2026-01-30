import React, { useMemo } from "react";
import { TrendingUp, Gift, Award, Trophy } from "lucide-react";

const tierLevels = {
  Base: 0,
  Bronze: 1,
  Silver: 2,
  Gold: 3,
  Platinum: 4,
};

const getHighestTier = (credentials = []) => {
  if (!credentials.length) return "Base";

  let highest = "Base";
  let highestLevel = 0;

  credentials.forEach((cred) => {
    const level = tierLevels[cred?.tier] ?? 0;
    if (level > highestLevel) {
      highestLevel = level;
      highest = cred?.tier || "Base";
    }
  });

  return highest;
};

function StatCard({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-purple-400/20 bg-white/5 p-4 text-center text-xs text-white/70 shadow-sm transition-transform transition-colors hover:scale-105 hover:bg-white/10">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500/70 to-pink-500/70 text-white shadow-md shadow-purple-500/40">
        {icon}
      </div>
      <p className="mb-1 text-[11px] font-medium text-white/60">{label}</p>
      <p className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
        {value}
      </p>
    </div>
  );
}

export default function WalletOverview({ credentials = [], activeOffersCount = 0 }) {
  const stats = useMemo(() => {
    const totalPrograms = credentials.length;

    const totalPoints = credentials.reduce((sum, cred) => {
      return sum + (cred?.points || 0);
    }, 0);

    const highestTier = getHighestTier(credentials);

    return { totalPrograms, totalPoints, activeOffers: activeOffersCount, highestTier };
  }, [credentials, activeOffersCount]);

  const isEmpty = !credentials || credentials.length === 0;

  return (
    <section className="space-y-3 rounded-2xl border border-purple-400/30 bg-gradient-to-br from-slate-900/90 via-slate-950 to-purple-950 p-5 shadow-[0_0_40px_rgba(168,85,247,0.35)]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-200/80">
            My Wallet
          </p>
          <p className="text-[11px] text-white/60">
            A quick snapshot of your loyalty identity.
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Total Programs"
          value={stats.totalPrograms || 0}
        />
        <StatCard
          icon={<Gift className="h-4 w-4" />}
          label="Active Offers"
          value={stats.activeOffers || 0}
        />
        <StatCard
          icon={<Award className="h-4 w-4" />}
          label="Total Points"
          value={stats.totalPoints || 0}
        />
        <StatCard
          icon={<Trophy className="h-4 w-4" />}
          label="Highest Tier"
          value={stats.highestTier || "Base"}
        />
      </div>

      {isEmpty && (
        <p className="mt-3 text-[11px] text-white/55">
          Start joining shops to see your stats!
        </p>
      )}
    </section>
  );
}
