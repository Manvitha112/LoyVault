import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Store, Mail, Lock, Phone, Eye, EyeOff, CheckCircle2, XCircle, Copy } from "lucide-react";
import { generateShopDID } from "../../utils/shopDIDGenerator";
import { hashPassword, validatePassword } from "../../utils/passwordUtils";
import { saveShop } from "../../utils/shopIndexedDB";
import { useAuth } from "../../context/AuthContext.jsx";
import { toast } from "../common/Toast.jsx";

const passwordStrength = (password) => {
  const value = String(password || "");
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[a-z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  if (!value) return { label: "", level: 0 };
  if (score <= 2) return { label: "Weak", level: 1 };
  if (score === 3) return { label: "Medium", level: 2 };
  return { label: "Strong", level: 3 };
};

export default function ShopRegistration({ onSwitchToLogin }) {
  const navigate = useNavigate();
  const { loginShop } = useAuth();

  const [formData, setFormData] = useState({
    shopName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generatedDID, setGeneratedDID] = useState(null);
  const [registeredShop, setRegisteredShop] = useState(null);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateField = (field, value) => {
    let error = "";
    const trimmed = String(value || "").trim();
    if (field === "shopName") {
      if (!trimmed) error = "Shop name is required";
      else if (trimmed.length < 3 || trimmed.length > 50) error = "Shop name must be 3-50 characters";
    }
    if (field === "email") {
      if (!trimmed) error = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) error = "Enter a valid email address";
    }
    if (field === "password") {
      const { valid, errors: pwdErrors } = validatePassword(trimmed);
      if (!valid && pwdErrors.length > 0) error = pwdErrors[0];
    }
    if (field === "confirmPassword") {
      if (trimmed !== String(formData.password || "")) {
        error = "Passwords do not match";
      }
    }
    return error;
  };

  const handleBlur = (field) => (e) => {
    const value = e.target.value;
    const error = validateField(field, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const validateAll = () => {
    const nextErrors = {};
    ["shopName", "email", "password", "confirmPassword"].forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) nextErrors[field] = error;
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.error("Please fix the highlighted errors.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { shopDID, publicKey, privateKey } = generateShopDID();

      const { hash, salt } = await hashPassword(formData.password);

      const shopData = {
        shopDID,
        shopName: formData.shopName.trim(),
        email: formData.email.trim().toLowerCase(),
        passwordHash: hash,
        salt,
        publicKey,
        // TODO: encrypt privateKey before storing in production
        privateKey,
        phone: formData.phone.trim() || null,
        branches: [],
        createdAt: new Date().toISOString(),
        role: "shopkeeper",
      };

      const ok = await saveShop(shopData);
      if (!ok) {
        throw new Error("saveShop returned false");
      }

      setGeneratedDID(shopDID);
      setRegisteredShop(shopData);
      toast.success("Shop registered successfully");
    } catch (error) {
      console.error("[ShopRegistration] registration failed", error);
      toast.error("Failed to register shop. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const strength = passwordStrength(formData.password);
  const isFormValid =
    formData.shopName &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    Object.values(errors).every((v) => !v);

  if (generatedDID && registeredShop) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl border border-sky-500/40 bg-slate-900/80 p-6 shadow-[0_0_40px_rgba(56,189,248,0.4)] backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Shop Registered Successfully!</h2>
              <p className="text-xs text-white/70">You can now manage loyalty programs and issue credentials.</p>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs text-white/80">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <p className="text-[11px] text-white/60">Shop Name</p>
              <p className="text-sm font-medium">{registeredShop.shopName}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <p className="text-[11px] text-white/60">Shop DID</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="break-all text-[11px] text-white/80">{generatedDID}</p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(generatedDID).then(
                      () => toast.success("Shop DID copied"),
                      () => toast.error("Unable to copy DID"),
                    );
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-2 py-1 text-[10px] text-white/85 hover:border-white/40 hover:bg-white/10"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </button>
              </div>
              <p className="mt-2 text-[10px] text-white/60">Keep this DID safe for reference and support.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              loginShop(registeredShop);
            }}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-loyvault-blueFrom to-loyvault-blueTo px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-lg shadow-sky-500/40 transition hover:brightness-110"
          >
            Continue to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-sky-500/35 bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-sky-950/90 p-6 shadow-[0_0_45px_rgba(56,189,248,0.45)] backdrop-blur-xl"
      >
        <div className="mb-5 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-300/80">Shopkeeper</p>
          <h1 className="text-lg font-semibold tracking-tight">Create Your Shop Account</h1>
          <p className="text-xs text-white/65">Register once to start issuing loyalty credentials to your customers.</p>
        </div>

        <form onSubmit={handleRegistration} className="space-y-4 text-xs">
          {/* Shop Name */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-[11px] text-white/80">
              <Store className="h-3.5 w-3.5 text-sky-300" />
              <span>Shop Name</span>
            </label>
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-2 focus-within:border-sky-400">
              <input
                type="text"
                value={formData.shopName}
                onChange={handleChange("shopName")}
                onBlur={handleBlur("shopName")}
                placeholder="Your Shop Name"
                className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/35"
              />
            </div>
            {errors.shopName && (
              <p className="flex items-center gap-1 text-[11px] text-red-300">
                <XCircle className="h-3 w-3" /> {errors.shopName}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-[11px] text-white/80">
              <Mail className="h-3.5 w-3.5 text-sky-300" />
              <span>Work Email</span>
            </label>
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-2 focus-within:border-sky-400">
              <input
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                onBlur={handleBlur("email")}
                placeholder="shop@example.com"
                className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/35"
              />
            </div>
            {errors.email && (
              <p className="flex items-center gap-1 text-[11px] text-red-300">
                <XCircle className="h-3 w-3" /> {errors.email}
              </p>
            )}
          </div>

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
                onBlur={handleBlur("password")}
                placeholder="Create strong password"
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
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1">
                {strength.label && (
                  <span
                    className={
                      strength.level === 1
                        ? "text-red-300"
                        : strength.level === 2
                          ? "text-amber-300"
                          : "text-emerald-300"
                    }
                  >
                    {strength.label} password
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <span
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    className={`h-1 w-6 rounded-full ${
                      strength.level >= i
                        ? strength.level === 1
                          ? "bg-red-400"
                          : strength.level === 2
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
            </div>
            {errors.password && (
              <p className="flex items-center gap-1 text-[11px] text-red-300">
                <XCircle className="h-3 w-3" /> {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-[11px] text-white/80">
              <Lock className="h-3.5 w-3.5 text-sky-300" />
              <span>Confirm Password</span>
            </label>
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-2 focus-within:border-sky-400">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
                placeholder="Confirm your password"
                className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/35"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="text-white/60 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="flex items-center gap-1 text-[11px] text-red-300">
                <XCircle className="h-3 w-3" /> {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-[11px] text-white/80">
              <Phone className="h-3.5 w-3.5 text-sky-300" />
              <span>Phone (optional)</span>
            </label>
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-2 focus-within:border-sky-400">
              <input
                type="tel"
                value={formData.phone}
                onChange={handleChange("phone")}
                placeholder="+91-1234567890"
                className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/35"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`mt-2 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold shadow-lg transition ${
              !isFormValid || isSubmitting
                ? "cursor-not-allowed bg-slate-700 text-white/60 shadow-none"
                : "bg-gradient-to-r from-loyvault-blueFrom to-loyvault-blueTo text-slate-950 shadow-sky-500/40 hover:brightness-110"
            }`}
          >
            {isSubmitting && (
              <span className="h-3 w-3 animate-spin rounded-full border border-white/60 border-t-transparent" />
            )}
            <span>{isSubmitting ? "Creating Shop..." : "Create Shop Account"}</span>
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-[11px] text-white/70">
          <p>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                if (onSwitchToLogin) {
                  onSwitchToLogin();
                } else {
                  navigate("/shop/auth?mode=login");
                }
              }}
              className="font-semibold text-sky-300 hover:text-sky-200"
            >
              Sign In
            </button>
          </p>
          <p className="text-white/50 text-[10px]">
            Password should be at least 8 characters with upper, lower & number.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

