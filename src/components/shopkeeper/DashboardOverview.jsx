import React, { useMemo } from "react";
import {
  Users,
  Gift,
  Award,
  TrendingUp,
  QrCode,
  CheckCircle,
  ChevronRight,
} from "lucide-react";

const colorClasses = {
  blue: "from-blue-500 to-cyan-500",
  purple: "from-purple-500 to-pink-500",
  yellow: "from-yellow-500 to-orange-500",
  green: "from-green-500 to-emerald-500",
};

const StatCard = ({ icon: Icon, label, value, color = "blue" }) => {
  const gradient = colorClasses[color] || colorClasses.blue;

  return (
    <div className="rounded-xl border border-blue-400/30 bg-white/10 p-6 backdrop-blur-lg transition-all hover:bg-white/15">
      <div className="mb-4 flex items-start justify-between">
        <div className={`rounded-lg bg-gradient-to-r ${gradient} p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <p className="mb-1 text-sm text-blue-300">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
};

const QuickActions = ({ onActionClick }) => {
  const actions = [
    { id: "issue", label: "Issue Credential", icon: QrCode, color: "blue" },
    { id: "verify", label: "Verify Customer", icon: CheckCircle, color: "green" },
    { id: "offer", label: "Create Offer", icon: Gift, color: "purple" },
    { id: "analytics", label: "View Analytics", icon: TrendingUp, color: "yellow" },
  ];

  const chipColors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-emerald-600",
    purple: "from-purple-500 to-pink-600",
    yellow: "from-yellow-500 to-orange-600",
  };

  return (
    <div className="rounded-xl border border-blue-400/30 bg-white/10 p-6 backdrop-blur-lg">
      <h2 className="mb-4 text-xl font-bold text-white">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;
          const chip = chipColors[action.color] || chipColors.blue;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onActionClick && onActionClick(action.id)}
              className="group flex items-center gap-3 rounded-lg bg-white/5 p-4 transition-all hover:bg-white/10"
            >
              <div
                className={`rounded-lg bg-gradient-to-r ${chip} p-2`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-white transition-colors group-hover:text-blue-300">
                {action.label}
              </span>
              <ChevronRight className="ml-auto h-5 w-5 text-gray-400" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

const RecentActivity = ({ activities }) => {
  const hasActivities = activities && activities.length > 0;

  return (
    <div className="rounded-xl border border-blue-400/30 bg-white/10 p-6 backdrop-blur-lg">
      <h2 className="mb-4 text-xl font-bold text-white">Recent Activity</h2>

      {hasActivities ? (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-lg bg-white/5 p-3"
            >
              <div className="mt-2 h-2 w-2 rounded-full bg-blue-400" />
              <div className="flex-1">
                <p className="text-sm text-white">{activity.description}</p>
                <p className="mt-1 text-xs text-blue-300">
                  {activity.timeAgo}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-blue-300 text-sm">
          No recent activity. Start issuing credentials to see activity here.
        </p>
      )}
    </div>
  );
};

const mockActivities = [
  { description: "Customer LM-8F2XA joined loyalty program", timeAgo: "2 minutes ago" },
  { description: "Customer LM-5K3PL verified at checkout", timeAgo: "5 minutes ago" },
  { description: "Customer LM-9N7QW earned 50 points", timeAgo: "12 minutes ago" },
  { description: "New offer created: 15% OFF Weekend Sale", timeAgo: "1 hour ago" },
  { description: "Customer LM-2H8VX upgraded to Silver tier", timeAgo: "2 hours ago" },
];

export default function DashboardOverview({ shop, stats = {}, onActionClick, activities }) {
  const safeStats = useMemo(
    () => ({
      totalMembers: stats.totalMembers ?? 0,
      activeOffers: stats.activeOffers ?? 0,
      pointsDistributed: stats.pointsDistributed ?? 0,
      todayJoins: stats.todayJoins ?? 0,
    }),
    [stats]
  );

  const allZero =
    safeStats.totalMembers === 0 &&
    safeStats.activeOffers === 0 &&
    safeStats.pointsDistributed === 0 &&
    safeStats.todayJoins === 0;

  const recent = activities && activities.length ? activities : mockActivities;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        {allZero && (
          <p className="mt-1 text-sm text-blue-200/80">
            Welcome to your LoyVault business dashboard. Once you start issuing
            credentials and creating offers, activity will appear here.
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Members"
          value={safeStats.totalMembers}
          color="blue"
        />
        <StatCard
          icon={Gift}
          label="Active Offers"
          value={safeStats.activeOffers}
          color="purple"
        />
        <StatCard
          icon={Award}
          label="Points Distributed"
          value={safeStats.pointsDistributed.toLocaleString()}
          color="yellow"
        />
        <StatCard
          icon={TrendingUp}
          label="New Today"
          value={safeStats.todayJoins}
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions onActionClick={onActionClick} />

      {/* Recent Activity */}
      <RecentActivity activities={recent} />
    </div>
  );
}
