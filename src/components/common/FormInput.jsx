import { useState } from "react";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function FormInput({
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder = "",
  icon: Icon,
  required = false,
  showToggle = false,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  const hasValue = value != null && String(value).trim().length > 0;
  const isValid = !error && hasValue;

  return (
    <div className="space-y-1.5 text-xs text-white/80">
      {label && (
        <label className="flex items-center gap-1 text-[11px] text-white/80">
          <span>{label}</span>
          {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div
        className={`flex items-center gap-2 rounded-full border bg-black/35 px-3 py-2 backdrop-blur-sm transition-colors ${
          error
            ? "border-red-400/80 shadow-[0_0_12px_rgba(248,113,113,0.35)]"
            : focused
              ? "border-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.45)]"
              : "border-white/15"
        }`}
      >
        {Icon && <Icon className="h-3.5 w-3.5 text-white/70" />}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/35"
          {...rest}
        />
        {isPassword && showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-white/60 hover:text-white"
          >
            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        )}
        {isValid && (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
        )}
      </div>
      {error && <p className="text-[11px] text-red-300">{error}</p>}
    </div>
  );
}
