import React from "react";
import { Home, Gift, Scan, Settings, Receipt, User } from "lucide-react";

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "offers", label: "Offers", icon: Gift },
  { id: "receipts", label: "Receipts", icon: Receipt },
  { id: "profile", label: "Profile", icon: User },
  { id: "scan", label: "Scan", icon: Scan },
  { id: "settings", label: "Settings", icon: Settings },
];

const NavButton = ({ item, isActive, onClick }) => {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium transition-all duration-300 ${
        isActive
          ? "bg-purple-500/20 text-purple-400"
          : "text-gray-400 hover:text-white"
      }`}
    >
      <Icon
        className={`h-6 w-6 transition-transform duration-300 ${
          isActive ? "scale-110" : ""
        }`}
      />
      <span>{item.label}</span>
      {isActive && (
        <div className="mt-1 h-1 w-1 rounded-full bg-purple-400" />
      )}
    </button>
  );
};

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-purple-400/30 bg-slate-900/80 backdrop-blur-lg">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={activeTab === item.id}
              onClick={() => onTabChange(item.id)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
