import React from "react";
import {
  LayoutDashboard,
  QrCode,
  CheckCircle,
  Gift,
  TrendingUp,
  Settings,
  LogOut,
  Store,
  Receipt,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "issue", label: "Issue Credentials", icon: QrCode },
  { id: "verify", label: "Verify Customer", icon: CheckCircle },
  { id: "offers", label: "Manage Offers", icon: Gift },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "settings", label: "Settings", icon: Settings },
];

const NavButton = ({ item, isActive, onClick }) => {
  const Icon = item.icon;

  const baseClasses = "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm";
  const stateClasses = isActive
    ? "bg-blue-500/20 text-blue-400 font-medium"
    : "text-gray-400 hover:text-white hover:bg-white/5";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${stateClasses}`}
    >
      <Icon className="w-5 h-5" />
      <span>{item.label}</span>
      {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-blue-400" />}
    </button>
  );
};

export default function Sidebar({ activePage, onPageChange, onLogout }) {
  return (
    <aside className="hidden w-64 flex-col border-r border-blue-400/30 bg-slate-900/50 backdrop-blur-lg lg:flex">
      {/* Logo Section */}
      <div className="border-b border-blue-400/30 p-6">
        <div className="flex items-center gap-3">
          <Store className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-lg font-bold text-white">LoyVault</h1>
            <p className="text-xs text-blue-300">Business</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activePage === item.id}
            onClick={() => onPageChange(item.id)}
          />
        ))}
      </nav>

      {/* Logout Button */}
      <div className="border-t border-blue-400/30 p-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-red-400 transition-all hover:bg-red-500/10"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
