import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

function computeStrength(password) {
  const value = String(password || "");
  const checks = {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
  };

  const score = Object.values(checks).filter(Boolean).length;
  let level = 0;
  let label = "Weak";

  if (score <= 1) {
    level = 1;
    label = "Weak";
  } else if (score <= 3) {
    level = 2;
    label = "Medium";
  } else {
    level = 3;
    label = "Strong";
  }

  const percent = (score / 5) * 100;

  return { checks, score, level, label, percent };
}

export default function PasswordStrength({ password, show }) {
  if (!show) return null;

  const { checks, label, level, percent } = computeStrength(password);
  const color =
    level === 1 ? "text-red-300" : level === 2 ? "text-amber-300" : "text-emerald-300";

  return (
    <div className="mt-2 space-y-1.5 rounded-2xl border border-white/10 bg-black/40 p-3 text-[11px] text-white/75">
      <div className="flex items-center justify-between">
        <span>Password Strength:</span>
        <span className={`${color} font-medium`}>{label}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>
      <div className="mt-2 grid grid-cols-1 gap-1.5 text-[10px] text-white/70 md:grid-cols-2">
        <Requirement label="At least 8 characters" ok={checks.length} />
        <Requirement label="Uppercase letter" ok={checks.upper} />
        <Requirement label="Lowercase letter" ok={checks.lower} />
        <Requirement label="Number" ok={checks.number} />
        <Requirement label="Special character" ok={checks.special} />
      </div>
    </div>
  );
}

function Requirement({ label, ok }) {
  const Icon = ok ? CheckCircle2 : XCircle;
  const color = ok ? "text-emerald-300" : "text-red-300";
  return (
    <div className={`flex items-center gap-1 ${color}`}>
      <Icon className="h-3 w-3" />
      <span className="text-[10px] text-white/75">{label}</span>
    </div>
  );
}
