import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";

function formatTime(seconds) {
  const s = Math.max(0, seconds);
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function AccountLockout({ lockoutEndTime, onCountdownComplete, email, onResetPassword, onBackToLogin }) {
  const [timeRemaining, setTimeRemaining] = useState(() => {
    if (!lockoutEndTime) return 0;
    const diffMs = Math.max(0, lockoutEndTime - Date.now());
    return Math.floor(diffMs / 1000);
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!lockoutEndTime) return undefined;
    const interval = setInterval(() => {
      const now = Date.now();
      const remainingMs = Math.max(0, lockoutEndTime - now);
      const remainingSec = Math.floor(remainingMs / 1000);
      if (remainingSec <= 0) {
        setIsExpired(true);
        setTimeRemaining(0);
        clearInterval(interval);
        if (onCountdownComplete) onCountdownComplete();
      } else {
        setTimeRemaining(remainingSec);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutEndTime, onCountdownComplete]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-amber-400/70 bg-black/50 px-5 py-4 text-center text-xs text-white/90 shadow-[0_0_30px_rgba(251,191,36,0.4)] backdrop-blur-xl">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-200">
          <Lock className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200/90">Account Temporarily Locked</p>
          <p className="mt-1 text-[11px] text-amber-100/85">Too many failed login attempts.</p>
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="text-[11px] text-amber-100/90"
      >
        {isExpired ? "You can try again now." : `Try again in: ${formatTime(timeRemaining)}`}
      </motion.p>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="space-y-2 text-[11px] text-white/80 w-full">
        <p className="text-white/70">Need immediate access?</p>
        <button
          type="button"
          onClick={onResetPassword}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[11px] font-medium text-white/85 hover:border-white/40 hover:bg-white/10"
        >
          <Mail className="h-3.5 w-3.5" />
          Reset Password via Email{email ? ` (${email})` : ""}
        </button>
        <button
          type="button"
          onClick={onBackToLogin}
          className="mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-medium text-white/80 hover:border-white/35 hover:bg-white/10"
          disabled={!isExpired}
        >
          {isExpired ? "Back to Login" : "Back to Login (after countdown)"}
        </button>
      </div>
    </div>
  );
}
