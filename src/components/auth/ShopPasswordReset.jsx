import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, KeyRound, Lock, AlertTriangle } from "lucide-react";
import { getShopByEmail, updateShop } from "../../utils/shopIndexedDB";
import { hashPassword, validatePassword } from "../../utils/passwordUtils";
import { toast } from "../common/Toast.jsx";

const modalVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.25, ease: "easeIn" } },
};

const errorShakeVariants = {
  initial: { x: 0 },
  shake: {
    x: [0, -4, 4, -3, 3, -2, 2, 0],
    transition: { duration: 0.35 },
  },
};

const RESET_KEYS = {
  code: "loyvault_shopResetCode",
  email: "loyvault_shopResetEmail",
  expiry: "loyvault_shopResetCodeExpiry",
};

export default function ShopPasswordReset({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setEmail("");
      setVerificationCode("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
      setIsSubmitting(false);
      setProgress(1);
    }
  }, [isOpen]);

  useEffect(() => {
    setProgress(step);
  }, [step]);

  if (!isOpen) return null;

  const validateEmail = () => {
    const trimmed = email.trim();
    if (!trimmed) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Enter a valid email address";
    return "";
  };

  const handleSendCode = async () => {
    const emailError = validateEmail();
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }
    setIsSubmitting(true);
    try {
      const shop = await getShopByEmail(email.trim());
      if (!shop) {
        setErrors({ email: "No account found with this email" });
        return;
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = Date.now() + 10 * 60 * 1000;
      try {
        localStorage.setItem(RESET_KEYS.code, code);
        localStorage.setItem(RESET_KEYS.email, email.trim().toLowerCase());
        localStorage.setItem(RESET_KEYS.expiry, String(expiry));
      } catch {
        // ignore
      }

      // TODO: integrate real email sending via backend
      // For now, log to console for testing
      // eslint-disable-next-line no-console
      console.log("[ShopPasswordReset] Reset code:", code);

      toast.success("Verification code generated. Check console for testing.");
      setStep(2);
      setErrors({});
    } catch (error) {
      console.error("[ShopPasswordReset] handleSendCode failed", error);
      toast.error("Unable to start password reset. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = () => {
    const code = verificationCode.trim();
    if (!code) {
      setErrors({ code: "Code is required" });
      return;
    }
    try {
      const storedCode = localStorage.getItem(RESET_KEYS.code);
      const expiryStr = localStorage.getItem(RESET_KEYS.expiry);
      const expiry = expiryStr ? parseInt(expiryStr, 10) : 0;

      if (!storedCode || !expiry) {
        setErrors({ code: "No reset request found. Please request a new code." });
        return;
      }

      if (Date.now() > expiry) {
        setErrors({ code: "Code expired. Request a new one." });
        return;
      }

      if (code !== storedCode) {
        setErrors({ code: "Invalid code" });
        return;
      }

      setErrors({});
      setStep(3);
    } catch (error) {
      console.error("[ShopPasswordReset] handleVerifyCode failed", error);
      toast.error("Unable to verify code. Please try again.");
    }
  };

  const handleResendCode = () => {
    const emailError = validateEmail();
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }
    // Regenerate code like handleSendCode but without shop check
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000;
    try {
      localStorage.setItem(RESET_KEYS.code, code);
      localStorage.setItem(RESET_KEYS.email, email.trim().toLowerCase());
      localStorage.setItem(RESET_KEYS.expiry, String(expiry));
    } catch {
      // ignore
    }
    // eslint-disable-next-line no-console
    console.log("[ShopPasswordReset] Resent reset code:", code);
    toast.success("New code sent (check console in this demo)");
  };

  const handleResetPassword = async () => {
    const pwdErrors = [];
    const { valid, errors: validationErrors } = validatePassword(newPassword);
    if (!valid) {
      pwdErrors.push(...validationErrors);
    }
    if (newPassword !== confirmPassword) {
      pwdErrors.push("Passwords don't match");
    }
    if (pwdErrors.length > 0) {
      setErrors({ password: pwdErrors.join(". ") });
      return;
    }

    setIsSubmitting(true);
    try {
      const storedEmail = localStorage.getItem(RESET_KEYS.email);
      if (!storedEmail) {
        setErrors({ password: "Reset session expired. Please start again." });
        return;
      }
      const shop = await getShopByEmail(storedEmail);
      if (!shop) {
        setErrors({ password: "No account found for this email" });
        return;
      }

      const { hash, salt } = await hashPassword(newPassword);
      const updated = await updateShop(shop.shopDID, {
        passwordHash: hash,
        salt,
      });
      if (!updated) {
        setErrors({ password: "Failed to update password. Please try again." });
        return;
      }

      try {
        localStorage.removeItem(RESET_KEYS.code);
        localStorage.removeItem(RESET_KEYS.email);
        localStorage.removeItem(RESET_KEYS.expiry);
      } catch {
        // ignore
      }

      toast.success("Password reset successfully!");
      setTimeout(() => {
        onClose?.();
      }, 2000);
    } catch (error) {
      console.error("[ShopPasswordReset] handleResetPassword failed", error);
      setErrors({ password: "Unable to reset password. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatStepLabel = () => {
    if (step === 1) return "Reset Password";
    if (step === 2) return "Enter Verification Code";
    return "Set New Password";
  };

  const strength = (() => {
    const pwd = newPassword;
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    if (score <= 2) return 1;
    if (score === 3) return 2;
    return 3;
  })();

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 py-8">
      <div
        className="absolute inset-0"
        role="presentation"
        onClick={onClose}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative z-10 w-full max-w-md rounded-2xl border border-sky-500/40 bg-slate-950/95 p-5 shadow-[0_0_40px_rgba(56,189,248,0.6)] backdrop-blur-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-300/80">Password Reset</p>
              <h2 className="text-sm font-semibold tracking-tight text-white">{formatStepLabel()}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/25 bg-white/5 text-white/80 hover:border-white/45 hover:bg-white/10"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mb-3 flex items-center gap-2 text-[10px] text-white/60">
            <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5">
              Step {step} of 3
            </span>
          </div>

          {step === 1 && (
            <div className="space-y-4 text-xs text-white/80">
              <p className="text-[11px] text-white/70">
                Enter the email associated with your shop account. We&apos;ll generate a verification code for this demo.
              </p>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1 text-[11px] text-white/80">
                  <Mail className="h-3.5 w-3.5 text-sky-300" />
                  <span>Email</span>
                </label>
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-2 focus-within:border-sky-500">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors({});
                    }}
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
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSendCode}
                  className="flex-1 rounded-full bg-gradient-to-r from-loyvault-blueFrom to-loyvault-blueTo px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-sky-500/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-white/60 disabled:shadow-none"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Code"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-white/25 bg-white/5 px-4 py-2 text-xs font-semibold text-white/85 hover:border-white/45 hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-xs text-white/80">
              <p className="text-[11px] text-white/70">
                We generated a verification code for: <span className="font-medium">{email}</span>
              </p>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1 text-[11px] text-white/80">
                  <KeyRound className="h-3.5 w-3.5 text-sky-300" />
                  <span>Verification Code</span>
                </label>
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-2 focus-within:border-sky-500">
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => {
                      setVerificationCode(e.target.value.replace(/[^0-9]/g, ""));
                      setErrors({});
                    }}
                    placeholder="6-digit code"
                    className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/35"
                  />
                </div>
                {errors.code && (
                  <motion.p
                    className="flex items-center gap-1 text-[11px] text-red-300"
                    variants={errorShakeVariants}
                    initial="initial"
                    animate="shake"
                  >
                    <AlertTriangle className="h-3 w-3" /> {errors.code}
                  </motion.p>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/75">
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  className="rounded-full bg-gradient-to-r from-loyvault-blueFrom to-loyvault-blueTo px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-sky-500/40 hover:brightness-110"
                >
                  Verify Code
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-sky-300 hover:text-sky-200"
                  >
                    Resend Code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setVerificationCode("");
                      setErrors({});
                    }}
                    className="text-white/70 hover:text-white"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-xs text-white/80">
              <p className="text-[11px] text-white/70">Choose a new strong password for your shop account.</p>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1 text-[11px] text-white/80">
                  <Lock className="h-3.5 w-3.5 text-sky-300" />
                  <span>New Password</span>
                </label>
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-2 focus-within:border-sky-500">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrors({});
                    }}
                    placeholder="Create new password"
                    className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/35"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="text-white/60 hover:text-white"
                  >
                    {showNewPassword ? <Lock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1 text-[11px] text-white/80">
                  <Lock className="h-3.5 w-3.5 text-sky-300" />
                  <span>Confirm Password</span>
                </label>
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-2 focus-within:border-sky-500">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors({});
                    }}
                    placeholder="Confirm new password"
                    className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/35"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="text-white/60 hover:text-white"
                  >
                    {showConfirmPassword ? <Lock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-white/60">Password strength:</p>
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <span
                      // eslint-disable-next-line react/no-array-index-key
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        strength >= i
                          ? strength === 1
                            ? "bg-red-400"
                            : strength === 2
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
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
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleResetPassword}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-loyvault-blueFrom to-loyvault-blueTo px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-sky-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-white/60 disabled:shadow-none"
              >
                {isSubmitting && (
                  <span className="h-3 w-3 animate-spin rounded-full border border-slate-900 border-t-transparent" />
                )}
                <span>{isSubmitting ? "Resetting..." : "Reset Password"}</span>
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

