import React, { useState, useEffect } from "react";
import { User, Award, Gift, Receipt, Download, TrendingUp } from "lucide-react";
import { fetchLoyaltyProgramsByDid, fetchInvoicesForDid, fetchOffersForDid } from "../../utils/apiClient.js";
import { toast } from "react-hot-toast";

export default function ProfilePage({ user }) {
  const [stats, setStats] = useState({
    totalPrograms: 0,
    totalPoints: 0,
    totalOffers: 0,
    totalSpent: 0,
    totalInvoices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.did) {
      loadStats();
    }
  }, [user?.did]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [programs, invoices, offers] = await Promise.all([
        fetchLoyaltyProgramsByDid(user.did),
        fetchInvoicesForDid(user.did),
        fetchOffersForDid(user.did),
      ]);

      const totalPoints = (programs || []).reduce((sum, p) => sum + (p.points || 0), 0);
      const totalSpent = (invoices || []).reduce((sum, i) => sum + (i.total || 0), 0);

      setStats({
        totalPrograms: programs?.length || 0,
        totalPoints,
        totalOffers: offers?.length || 0,
        totalSpent,
        totalInvoices: invoices?.length || 0,
      });
    } catch (error) {
      console.error("Failed to load profile stats:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const data = {
      user: { did: user.did, name: user.name },
      stats,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `loyvault_profile_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Profile data exported");
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <button
          type="button"
          onClick={exportData}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105"
        >
          <Download className="h-4 w-4" />
          Export Data
        </button>
      </div>

      <div className="rounded-2xl border border-purple-400/30 bg-white/10 p-6 backdrop-blur-lg">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name || "Customer"}</h2>
            <p className="text-sm text-purple-300">DID: {user?.did?.slice(0, 30)}...</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={<Award />} label="Loyalty Programs" value={stats.totalPrograms} color="purple" />
        <StatCard icon={<TrendingUp />} label="Total Points" value={stats.totalPoints} color="green" />
        <StatCard icon={<Gift />} label="Offers Received" value={stats.totalOffers} color="pink" />
        <StatCard icon={<Receipt />} label="Total Invoices" value={stats.totalInvoices} color="blue" />
        <StatCard icon={<TrendingUp />} label="Total Spent" value={`₹${stats.totalSpent.toLocaleString()}`} color="green" />
      </div>
    </div>
  );
}

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    purple: "from-purple-500 to-pink-500",
    green: "from-green-500 to-emerald-500",
    pink: "from-pink-500 to-rose-500",
    blue: "from-blue-500 to-cyan-500",
  };

  return (
    <div className="rounded-xl border border-purple-400/30 bg-white/10 p-4 backdrop-blur-lg">
      <div className="mb-2 text-purple-300">{icon}</div>
      <p className={`mb-1 bg-gradient-to-r ${colors[color]} bg-clip-text text-2xl font-bold text-transparent`}>
        {value}
      </p>
      <p className="text-xs text-purple-400">{label}</p>
    </div>
  );
};
