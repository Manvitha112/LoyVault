import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Gift,
  Receipt,
  Calendar,
  Award,
  DollarSign,
} from "lucide-react";
import {
  fetchShopLoyaltyStats,
  fetchShopOfferStats,
  fetchShopInvoiceStats,
  fetchShopInvoices,
} from "../../utils/apiClient.js";
import { toast } from "react-hot-toast";

export default function AnalyticsDashboard({ shop }) {
  const [loyaltyStats, setLoyaltyStats] = useState(null);
  const [offerStats, setOfferStats] = useState(null);
  const [invoiceStats, setInvoiceStats] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");

  useEffect(() => {
    if (shop?.shopDID) {
      loadAllStats();
    }
  }, [shop?.shopDID]);

  const loadAllStats = async () => {
    setLoading(true);
    try {
      const [loyalty, offers, invoices, invoiceList] = await Promise.all([
        fetchShopLoyaltyStats(shop.shopDID),
        fetchShopOfferStats(shop.shopDID),
        fetchShopInvoiceStats(shop.shopDID),
        fetchShopInvoices(shop.shopDID),
      ]);

      setLoyaltyStats(loyalty);
      setOfferStats(offers);
      setInvoiceStats(invoices);
      setRecentInvoices((invoiceList || []).slice(0, 10));
    } catch (error) {
      console.error("Failed to load analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const filterByTimeRange = (data, dateField = "createdAt") => {
    if (timeRange === "all") return data;

    const now = new Date();
    let cutoffDate = new Date();

    if (timeRange === "today") {
      cutoffDate.setHours(0, 0, 0, 0);
    } else if (timeRange === "week") {
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === "month") {
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return data.filter((item) => new Date(item[dateField]) >= cutoffDate);
  };

  const filteredInvoices = filterByTimeRange(recentInvoices);
  const totalRevenueFiltered = filteredInvoices.reduce(
    (sum, inv) => sum + (inv.total || 0),
    0
  );
  const totalPointsFiltered = filteredInvoices.reduce(
    (sum, inv) => sum + (inv.pointsAdded || 0),
    0
  );

  const tierDistribution = recentInvoices.reduce((acc, inv) => {
    const tier = inv.tierAfter || "Base";
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});

  const averageTransactionValue =
    filteredInvoices.length > 0
      ? totalRevenueFiltered / filteredInvoices.length
      : 0;

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-sm text-purple-300">
            Track your loyalty program performance
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-lg border border-purple-400/30 bg-white/5 px-4 py-2 text-white outline-none focus:border-purple-400 [&>option]:bg-slate-900 [&>option]:text-white"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<Users className="h-6 w-6" />}
          label="Total Members"
          value={loyaltyStats?.totalMembers || 0}
          color="purple"
          trend="+12%"
        />
        <MetricCard
          icon={<Gift className="h-6 w-6" />}
          label="Active Offers"
          value={offerStats?.activeOffers || 0}
          color="pink"
        />
        <MetricCard
          icon={<Receipt className="h-6 w-6" />}
          label="Total Invoices"
          value={invoiceStats?.totalInvoices || 0}
          color="blue"
        />
        <MetricCard
          icon={<DollarSign className="h-6 w-6" />}
          label="Total Revenue"
          value={`₹${(invoiceStats?.totalRevenue || 0).toLocaleString()}`}
          color="green"
          trend="+8%"
        />
      </div>

      {/* Time-filtered Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          icon={<TrendingUp className="h-6 w-6" />}
          label={`Revenue (${timeRange === "all" ? "All Time" : timeRange})`}
          value={`₹${totalRevenueFiltered.toLocaleString()}`}
          subtext={`${filteredInvoices.length} transactions`}
          color="green"
        />
        <StatCard
          icon={<Award className="h-6 w-6" />}
          label="Points Distributed"
          value={totalPointsFiltered}
          subtext="Across all tiers"
          color="purple"
        />
        <StatCard
          icon={<Calendar className="h-6 w-6" />}
          label="Avg Transaction Value"
          value={`₹${Math.round(averageTransactionValue)}`}
          subtext="Per customer visit"
          color="blue"
        />
      </div>

      {/* Tier Distribution */}
      <div className="rounded-2xl border border-purple-400/30 bg-white/10 p-6 backdrop-blur-lg">
        <h3 className="mb-4 text-lg font-bold text-white">
          Customer Tier Distribution
        </h3>
        <div className="space-y-3">
          {Object.entries(tierDistribution).map(([tier, count]) => {
            const percentage =
              recentInvoices.length > 0
                ? ((count / recentInvoices.length) * 100).toFixed(1)
                : 0;
            return (
              <TierBar key={tier} tier={tier} count={count} percentage={percentage} />
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-purple-400/30 bg-white/10 p-6 backdrop-blur-lg">
        <h3 className="mb-4 text-lg font-bold text-white">Recent Transactions</h3>
        {filteredInvoices.length === 0 ? (
          <p className="text-center text-purple-300">No transactions in this period</p>
        ) : (
          <div className="space-y-2">
            {filteredInvoices.slice(0, 5).map((invoice) => (
              <RecentTransactionRow key={invoice._id} invoice={invoice} />
            ))}
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InsightCard
          title="Top Performing Tier"
          value={
            Object.entries(tierDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] ||
            "N/A"
          }
          description="Most active customer segment"
          color="purple"
        />
        <InsightCard
          title="Growth Opportunity"
          value={`${loyaltyStats?.totalMembers || 0} members`}
          description="Focus on retention and engagement"
          color="blue"
        />
      </div>
    </div>
  );
}

const MetricCard = ({ icon, label, value, color, trend }) => {
  const colorClasses = {
    purple: "from-purple-500 to-pink-500",
    pink: "from-pink-500 to-rose-500",
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
  };

  return (
    <div className="rounded-xl border border-purple-400/30 bg-white/10 p-4 backdrop-blur-lg">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-purple-300">
          {icon}
          <span className="text-sm">{label}</span>
        </div>
        {trend && (
          <span className="text-xs font-semibold text-green-400">{trend}</span>
        )}
      </div>
      <p
        className={`bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-2xl font-bold text-transparent`}
      >
        {value}
      </p>
    </div>
  );
};

const StatCard = ({ icon, label, value, subtext, color }) => {
  const colorClasses = {
    purple: "from-purple-500 to-pink-500",
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
  };

  return (
    <div className="rounded-xl border border-purple-400/30 bg-white/10 p-6 backdrop-blur-lg">
      <div className="mb-3 flex items-center gap-2 text-purple-300">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p
        className={`mb-1 bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-3xl font-bold text-transparent`}
      >
        {value}
      </p>
      <p className="text-xs text-purple-400">{subtext}</p>
    </div>
  );
};

const TierBar = ({ tier, count, percentage }) => {
  const tierColors = {
    Base: "bg-gray-500",
    Bronze: "bg-orange-600",
    Silver: "bg-gray-400",
    Gold: "bg-yellow-500",
    Platinum: "bg-purple-500",
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-semibold text-white">{tier}</span>
        <span className="text-purple-300">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full ${tierColors[tier] || "bg-purple-500"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const RecentTransactionRow = ({ invoice }) => {
  const date = new Date(invoice.createdAt);
  const timeAgo = getTimeAgo(date);

  return (
    <div className="flex items-center justify-between rounded-lg border border-purple-400/20 bg-white/5 p-3">
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">{invoice.transactionId}</p>
        <p className="text-xs text-purple-300">{timeAgo}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-white">₹{invoice.total}</p>
        <p className="text-xs text-green-400">+{invoice.pointsAdded} pts</p>
      </div>
    </div>
  );
};

const InsightCard = ({ title, value, description, color }) => {
  const colorClasses = {
    purple: "from-purple-500 to-pink-500",
    blue: "from-blue-500 to-cyan-500",
  };

  return (
    <div className="rounded-xl border border-purple-400/30 bg-white/10 p-6 backdrop-blur-lg">
      <h4 className="mb-2 text-sm font-semibold text-purple-300">{title}</h4>
      <p
        className={`mb-2 bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-2xl font-bold text-transparent`}
      >
        {value}
      </p>
      <p className="text-xs text-purple-400">{description}</p>
    </div>
  );
};

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
