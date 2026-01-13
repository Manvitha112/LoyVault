import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Store } from "lucide-react";
import ShopRegistration from "./ShopRegistration";
import ShopLogin from "./ShopLogin";
import { useAuth } from "../../context/AuthContext.jsx";
import { hasShop } from "../../utils/shopIndexedDB";

const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25, ease: "easeIn" } },
};

export default function ShopkeeperAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkShopSession } = useAuth();

  const [mode, setMode] = useState("register"); // "register" | "login"
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlMode = params.get("mode");
    if (urlMode === "login" || urlMode === "register") {
      setMode(urlMode);
    }
  }, [location.search]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const hasSession = await checkShopSession();
        if (cancelled) return;
        if (hasSession) {
          navigate("/shop/dashboard", { replace: true });
          return;
        }
        const exists = await hasShop();
        if (cancelled) return;
        setMode(exists ? "login" : "register");
      } finally {
        if (!cancelled) setIsCheckingSession(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [checkShopSession, navigate]);

  const switchToLogin = () => {
    setMode("login");
    navigate("/shop/auth?mode=login", { replace: true });
  };

  const switchToRegister = () => {
    setMode("register");
    navigate("/shop/auth?mode=register", { replace: true });
  };

  const handleBack = () => {
    navigate("/get-started");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-16 flex items-center justify-center">
      {isCheckingSession ? (
        <div className="flex flex-col items-center gap-3 text-xs text-white/70">
          <span className="h-6 w-6 animate-spin rounded-full border border-sky-400 border-t-transparent" />
          <p>Checking for existing session...</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-xl rounded-3xl border border-sky-500/35 bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-sky-950/90 p-5 shadow-[0_0_45px_rgba(56,189,248,0.45)] backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center justify-between text-[11px] text-white/70">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] text-white/80 hover:border-white/40 hover:bg-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Role Selection</span>
            </button>
          </div>

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-loyvault-blueFrom to-loyvault-blueTo text-slate-950 shadow-lg shadow-sky-500/40">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">LoyVault for Business</h1>
              <p className="text-xs text-white/70">Privacy-first loyalty management for shops and brands.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-3 md:p-4 text-xs text-white/80">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {mode === "register" ? (
                  <ShopRegistration onSwitchToLogin={switchToLogin} />
                ) : (
                  <ShopLogin onSwitchToRegister={switchToRegister} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
