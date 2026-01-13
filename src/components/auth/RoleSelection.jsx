import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Wallet, Store, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut", delay: 0.1 + i * 0.08 },
  }),
};

export default function RoleSelection() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSelect = (role) => {
    if (role === "customer") {
      login("customer", null);
      navigate("/customer/auth");
    } else if (role === "shopkeeper") {
      login("shopkeeper", null);
      navigate("/shop/auth");
    }
  };

  const goBackHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950/95 py-24 text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4">
        <button
          type="button"
          onClick={goBackHome}
          className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70 backdrop-blur transition hover:border-white/25 hover:bg-white/10"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </button>

        <motion.div
          className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-slate-900/80 p-6 shadow-[0_0_50px_rgba(168,85,247,0.45)] backdrop-blur-xl md:p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.18),_transparent_55%)]" />

          <div className="relative">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Welcome to LoyVault
              </h1>
              <p className="mt-2 text-sm text-white/70 md:text-base">
                Choose how you want to continue. You can switch roles anytime.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <motion.button
                type="button"
                variants={cardVariants}
                custom={0}
                onClick={() => handleSelect("customer")}
                className="group relative flex h-full flex-col items-stretch overflow-hidden rounded-2xl border border-purple-400/60 bg-white/5 p-5 text-left shadow-[0_20px_45px_rgba(15,23,42,0.9)] backdrop-blur-md transition-transform duration-200 hover:-translate-y-1.5 hover:shadow-[0_0_40px_rgba(168,85,247,0.65)]"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 blur-3xl transition-opacity duration-200 group-hover:opacity-100">
                  <div className="absolute -inset-10 bg-[conic-gradient(from_210deg_at_50%_50%,rgba(168,85,247,0.6),rgba(236,72,153,0.4),transparent,rgba(168,85,247,0.6))]" />
                </div>

                <div className="relative flex flex-1 flex-col gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/15 px-3 py-1 text-[11px] font-medium text-purple-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-300" />
                    For individuals
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo text-white shadow-lg shadow-purple-700/40">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold md:text-lg">I'm a Customer</h2>
                      <p className="mt-1 text-[12px] text-white/75 md:text-sm">
                        Manage all your loyalty programs securely from one private wallet.
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto pt-2">
                    <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo px-4 py-2 text-xs font-semibold shadow-lg shadow-purple-700/40 transition group-hover:brightness-110">
                      Continue as Customer
                    </span>
                  </div>
                </div>
              </motion.button>

              <motion.button
                type="button"
                variants={cardVariants}
                custom={1}
                onClick={() => handleSelect("shopkeeper")}
                className="group relative flex h-full flex-col items-stretch overflow-hidden rounded-2xl border border-sky-400/60 bg-white/5 p-5 text-left shadow-[0_20px_45px_rgba(15,23,42,0.9)] backdrop-blur-md transition-transform duration-200 hover:-translate-y-1.5 hover:shadow-[0_0_40px_rgba(56,189,248,0.65)]"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 blur-3xl transition-opacity duration-200 group-hover:opacity-100">
                  <div className="absolute -inset-10 bg-[conic-gradient(from_210deg_at_50%_50%,rgba(56,189,248,0.55),rgba(59,130,246,0.45),transparent,rgba(56,189,248,0.55))]" />
                </div>

                <div className="relative flex flex-1 flex-col gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-3 py-1 text-[11px] font-medium text-sky-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
                    For stores & cafes
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-loyvault-blueFrom to-loyvault-blueTo text-slate-950 shadow-lg shadow-sky-700/40">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold md:text-lg">I'm a Shopkeeper</h2>
                      <p className="mt-1 text-[12px] text-white/75 md:text-sm">
                        Issue, verify, and analyze loyalty credentials without storing PII.
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto pt-2">
                    <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-tr from-loyvault-blueFrom to-loyvault-blueTo px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-sky-700/40 transition group-hover:brightness-110">
                      Continue as Shopkeeper
                    </span>
                  </div>
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

