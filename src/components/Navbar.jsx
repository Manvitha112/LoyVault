import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Menu, X } from "lucide-react";

const navItems = [
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How It Works" },
  { id: "benefits", label: "Benefits" },
  { id: "about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleScroll = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex justify-center">
      <nav className="mt-3 w-[95%] max-w-6xl rounded-2xl border border-purple-500/25 bg-slate-900/70 px-4 py-2 shadow-[0_0_40px_rgba(168,85,247,0.35)] backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <motion.button
            type="button"
            className="flex items-center gap-2 text-left"
            onClick={() => handleScroll("top")}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            <motion.div
              whileHover={{ y: -2 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo"
            >
              <Shield className="h-5 w-5 text-white" />
            </motion.div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">LoyVault</p>
              <p className="text-[10px] text-white/60">Wallet-based SSI Loyalty</p>
            </div>
          </motion.button>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 md:flex">
            <ul className="flex items-center gap-5 text-xs font-medium text-white/70">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleScroll(item.id)}
                    className="group relative overflow-hidden transition-colors hover:text-white"
                  >
                    {item.label}
                    <span className="pointer-events-none absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-gradient-to-r from-loyvault-purpleFrom via-loyvault-purpleTo to-loyvault-blueTo transition-transform duration-200 group-hover:scale-x-100" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => navigate("/get-started")}
                className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-white/80 shadow-sm transition hover:border-white/40 hover:bg-white/10"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => navigate("/get-started")}
                className="rounded-full bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo px-4 py-1.5 font-medium shadow-lg shadow-purple-500/40 transition hover:brightness-110"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => navigate("/get-started")}
              className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] text-white/80"
            >
              Get Started
            </button>
            <button
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-slate-900/80 text-white"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile slide-in menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 200, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="fixed inset-y-3 right-3 z-40 w-[72%] max-w-xs rounded-2xl border border-purple-500/40 bg-slate-950/95 p-5 shadow-[0_0_45px_rgba(168,85,247,0.55)] backdrop-blur-xl md:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold">Menu</span>
                <button
                  type="button"
                  aria-label="Close navigation"
                  onClick={() => setOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ul className="mb-4 space-y-3 text-sm text-white/80">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleScroll(item.id)}
                      className="w-full rounded-xl bg-white/5 px-3 py-2 text-left transition hover:bg-white/10"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 text-sm">
                <button
                  type="button"
                  className="w-full rounded-full border border-white/25 bg-white/5 px-4 py-2 text-white/80"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className="w-full rounded-full bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo px-4 py-2 font-medium shadow-lg shadow-purple-500/40"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
