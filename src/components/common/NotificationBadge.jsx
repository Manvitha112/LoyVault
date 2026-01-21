import React, { useState, useEffect } from "react";
import { Bell, X, Gift, Receipt } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationBadge({ notifications = [], onClear }) {
  const [showPanel, setShowPanel] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowPanel(!showPanel)}
        className="relative rounded-lg p-2 transition-all hover:bg-white/10"
      >
        <Bell className="h-6 w-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-purple-400/30 bg-slate-900 shadow-2xl"
          >
            <div className="border-b border-purple-400/30 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Notifications</h3>
                <button
                  type="button"
                  onClick={() => setShowPanel(false)}
                  className="rounded-lg p-1 transition-all hover:bg-white/10"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="mx-auto mb-2 h-12 w-12 text-purple-400/50" />
                  <p className="text-sm text-purple-300">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-purple-400/20">
                  {notifications.map((notif) => (
                    <NotificationItem key={notif.id} notification={notif} />
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="border-t border-purple-400/30 p-3">
                <button
                  type="button"
                  onClick={() => {
                    onClear?.();
                    setShowPanel(false);
                  }}
                  className="w-full rounded-lg bg-purple-500/20 py-2 text-sm font-semibold text-purple-300 transition-all hover:bg-purple-500/30"
                >
                  Clear All
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const NotificationItem = ({ notification }) => {
  const icons = {
    offer: <Gift className="h-5 w-5 text-pink-400" />,
    receipt: <Receipt className="h-5 w-5 text-green-400" />,
    default: <Bell className="h-5 w-5 text-purple-400" />,
  };

  const icon = icons[notification.type] || icons.default;

  return (
    <div
      className={`p-4 transition-all hover:bg-white/5 ${
        !notification.read ? "bg-purple-500/10" : ""
      }`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1">
          <p className="mb-1 text-sm font-semibold text-white">
            {notification.title}
          </p>
          <p className="mb-2 text-xs text-purple-300">
            {notification.message}
          </p>
          <p className="text-xs text-purple-400">{notification.time}</p>
        </div>
        {!notification.read && (
          <div className="h-2 w-2 flex-shrink-0 rounded-full bg-pink-500" />
        )}
      </div>
    </div>
  );
};
