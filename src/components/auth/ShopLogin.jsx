import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, KeyRound, Lock, Eye, EyeOff, AlertTriangle, Store } from "lucide-react";
import { getShop, getShopByEmail } from "../../utils/shopIndexedDB";
import { verifyPassword } from "../../utils/passwordUtils";
import { getRememberedShop, saveRememberedShop, clearRememberedShop } from "../../utils/sessionManager";
import { useAuth } from "../../context/AuthContext.jsx";
import { toast } from "../common/Toast.jsx";

const errorShakeVariants = {
  initial: { x: 0 },
  shake: {
    x: [0, -4, 4, -3, 3, -2, 2, 0],
    transition: { duration: 0.35 },
  },
};

const LOCK_KEYS = {
  attempts: "loyvault_shopFailedAttempts",
  lockedUntil: "loyvault_shopLockedUntil",
};

export default function ShopLogin() {
  const navigate = useNavigate();
  const { loginShop } = useAuth();

  const [loginMethod, setLoginMethod] = useState("email"); // "email" | "did"
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    shopDID: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    try {
      const storedAttempts = parseInt(localStorage.getItem(LOCK_KEYS.attempts) || "0", 10) || 0;
      const storedLockedUntil = parseInt(localStorage.getItem(LOCK_KEYS.lockedUntil) || "0", 10) || 0;
      setFailedAttempts(storedAttempts);
      if (storedLockedUntil && Date.now() < storedLockedUntil) {
        setIsLocked(true);
        setLockoutTime(storedLockedUntil);
        setCountdown(Math.max(0, Math.floor((storedLockedUntil - Date.now()) / 1000)));
      }

      // Hydrate remembered shop credentials
      const remembered = getRememberedShop();
      if (remembered) {
        setFormData((prev) => ({
          ...prev,
          email: remembered.email || prev.email,
          shopDID: remembered.shopDID || prev.shopDID,
        }));
        setRememberMe(true);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!isLocked) return undefined;
    const interval = setInterval(() => {
      const now = Date.now();
      if (lockoutTime && now < lockoutTime) {
        setCountdown(Math.max(0, Math.floor((lockoutTime - now) / 1000)));
      } else {
        clearInterval(interval);
        setIsLocked(false);
        setLockoutTime(0);
        setCountdown(0);
        try {
          localStorage.removeItem(LOCK_KEYS.lockedUntil);
          localStorage.removeItem(LOCK_KEYS.attempts);
        } catch {
          // ignore
        }
        toast.success("You can try logging in again now.");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockoutTime]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (loginMethod === "email") {
      if (!formData.email.trim()) nextErrors.email = "Email is required";
      if (!formData.password) nextErrors.password = "Password is required";
    } else {
      if (!formData.shopDID.trim()) nextErrors.shopDID = "Shop DID is required";
      if (!formData.password) nextErrors.password = "Password is required";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const incrementFailedAttempts = () => {
    setFailedAttempts((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem(LOCK_KEYS.attempts, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Check lockout
    try {
      const storedLockedUntil = parseInt(localStorage.getItem(LOCK_KEYS.lockedUntil) || "0", 10) || 0;
      if (storedLockedUntil && Date.now() < storedLockedUntil) {
        setIsLocked(true);
        setLockoutTime(storedLockedUntil);
        setCountdown(Math.max(0, Math.floor((storedLockedUntil - Date.now()) / 1000)));
        toast.error("Account is temporarily locked. Please wait.");
        return;
      }
    } catch {
      // ignore
    }

    if (!validate()) {
      toast.error("Please fill in required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      let shop = null;
      if (loginMethod === "email") {
        shop = await getShopByEmail(formData.email.trim());
      } else {
        shop = await getShop(formData.shopDID.trim());
      }

      if (!shop) {
        incrementFailedAttempts();
        toast.error("Invalid credentials.");
        setErrors((prev) => ({ ...prev, password: "Invalid credentials" }));
        return;
      }

      const isValid = await verifyPassword(formData.password, shop.passwordHash, shop.salt);
      if (!isValid) {
        const nextAttempts = failedAttempts + 1;
        incrementFailedAttempts();
        if (nextAttempts >= 3) {
          const lockDurationMs = 5 * 60 * 1000;
          const lockedUntil = Date.now() + lockDurationMs;
          try {
            localStorage.setItem(LOCK_KEYS.lockedUntil, String(lockedUntil));
          } catch {
            // ignore
          }
          setIsLocked(true);
          setLockoutTime(lockedUntil);
          setCountdown(Math.floor(lockDurationMs / 1000));
          toast.error("Too many failed attempts. Account locked for 5 minutes.");
        } else {
          const remaining = Math.max(0, 3 - nextAttempts);
          toast.error(`Invalid credentials. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`);
        }
        setErrors((prev) => ({ ...prev, password: "Invalid credentials" }));
        return;
      }

      // Successful login
      try {
        localStorage.removeItem(LOCK_KEYS.lockedUntil);
        localStorage.removeItem(LOCK_KEYS.attempts);
      } catch {
        // ignore
      }
      setFailedAttempts(0);
      setIsLocked(false);
      setLockoutTime(0);
      setCountdown(0);

      if (rememberMe && shop.shopDID) {
        saveRememberedShop(shop.shopDID, shop.email);
      } else {
        clearRememberedShop();
      }

      await loginShop(shop);
    } catch (error) {
      console.error("[ShopLogin] login failed", error);
      toast.error("Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCountdown = (seconds) => {
    const s = Math.max(0, seconds);
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  const hasErrors = Object.values(errors).some((e) => e);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-sky-500/35 bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-sky-950/90 p-6 shadow-[0_0_45px_rgba(56,189,248,0.45)] backdrop-blur-xl"
      >
        <div className="mb-5 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-300/80">Shopkeeper</p>
          <h1 className="text-lg font-semibold tracking-tight">Sign in to Your Shop</h1>
          <p className="text-xs text-white/65">Access your dashboard to manage loyalty programs and customers.</p>
        </div>

        {/* Tabs */}
        <div className="mb-4 inline-flex rounded-full border border-white/10 bg-black/40 p-1 text-[11px] backdrop-blur">
          <button
            type="button"
            onClick={() => {
              setLoginMethod("email");
              setErrors({});
            }}
            className={`rounded-full px-4 py-1.5 transition ${
              loginMethod === "email"
                ? "bg-white text-slate-950 shadow-[0_0_18px_rgba(148,163,184,0.9)]"
                : "text-white/70 hover:text-white"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod("did");
              setErrors({});
            }}
            className={`rounded-full px-4 py-1.5 transition ${
              loginMethod === "did"
                ? "bg-gradient-to-r from-loyvault-blueFrom to-loyvault-blueTo text-slate-950 shadow-[0_0_18px_rgba(56,189,248,0.9)]"
                : "text-white/70 hover:text-white"
            }`}
          >
            Shop DID
          </button>
        </div>

        {isLocked ? (
          <div className="mt-2 space-y-3 rounded-2xl border border-amber-400/60 bg-black/40 p-4 text-xs text-amber-100">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-amber-200">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Account Locked</p>
                <p className="text-[11px] text-amber-100/80">
                  Too many failed login attempts. Try again after the countdown.
                </p>
              </div>
            </div>
            <p className="text-[11px]">Time remaining: {formatCountdown(countdown)}</p>
            <button
              type="button"
              onClick={() => toast("Password reset flow coming soon")}
              className="mt-1 inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[11px] text-white/85 hover:border-white/40 hover:bg-white/10"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Reset via Email (soon)
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="mt-2 space-y-4 text-xs">
            <AnimatePresence mode="wait">
              <motion.div
                key={loginMethod}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="space-y-4"
              >
                {loginMethod === "email" ? (
                  <>
                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1 text-[11px] text-white/80">
                        <Mail className="h-3.5 w-3.5 text-sky-300" />
                        <span>Email</span>
                      </label>
                      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-2 focus-within:border-sky-400">
                        <input
                          type="email"
                          value={formData.email}
                          onChange={handleChange("email")}
                          placeholder="shop@example.com"
                          className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/35"
                        />
                      </div>
                      {errors.email && (
                        <motion.p
                          className="flex items-center gap-1 text-[11px] text-red-300"
                          variants={errorShakeVariants}
                          initial="initial"
                          animate="shake"
                        >
                          <AlertTriangle className="h-3 w-3" /> {errors.email}
                        </motion.p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Shop DID */}
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1 text-[11px] text-white/80">
                        <Store className="h-3.5 w-3.5 text-sky-300" />
                        <span>Shop DID</span>
                      </label>
                      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-2 focus-within:border-sky-400">
                        <input
                          type="text"
                          value={formData.shopDID}
                          onChange={handleChange("shopDID")}
                          placeholder="did:loyvault:shop-..."
                          className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/35"
                        />
                      </div>
                      {errors.shopDID && (
                        <motion.p
                          className="flex items-center gap-1 text-[11px] text-red-300"
                          variants={errorShakeVariants}
                          initial="initial"
                          animate="shake"
                        >
                          <AlertTriangle className="h-3 w-3" /> {errors.shopDID}
                        </motion.p>
                      )}
                    </div>
                  </>
                )}

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 text-[11px] text-white/80">
                    <Lock className="h-3.5 w-3.5 text-sky-300" />
                    <span>Password</span>
                  </label>
                  <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-2 focus-within:border-sky-400">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange("password")}
                      placeholder="Your password"
                      className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/35"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-white/60 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      className="flex items-center gap-1 text-[11px] text-red-300"
                      variants={errorShakeVariants}
                      initial="initial"
                      animate="shake"
                    >
                      <AlertTriangle className="h-3 w-3" /> {errors.password}
                    </motion.p>
                  )}
                </div>

                {loginMethod === "email" && (
                  <div className="flex items-center justify-between text-[11px] text-white/75">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border border-white/40 bg-black/40 text-sky-400"
                      />
                      <span>Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => toast("Password reset coming soon")}
                      className="inline-flex items-center gap-1 text-sky-300 hover:text-sky-200"
                    >
                      <KeyRound className="h-3 w-3" />
                      Forgot password?
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting || hasErrors}
              className={`mt-1 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold shadow-lg transition ${
                isSubmitting || hasErrors
                  ? "cursor-not-allowed bg-slate-700 text-white/60 shadow-none"
                  : "bg-gradient-to-r from-loyvault-blueFrom to-loyvault-blueTo text-slate-950 shadow-sky-500/40 hover:brightness-110"
              }`}
            >
              {isSubmitting && (
                <span className="h-3 w-3 animate-spin rounded-full border border-white/60 border-t-transparent" />
              )}
              <span>
                {loginMethod === "email" ? (isSubmitting ? "Signing In..." : "Sign In") : isSubmitting ? "Signing In..." : "Sign In with DID"}
              </span>
            </button>
          </form>
        )}

        <div className="mt-5 flex items-center justify-between text-[11px] text-white/70">
          <p>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/shop/auth?mode=register")}
              className="font-semibold text-sky-300 hover:text-sky-200"
            >
              Register
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

