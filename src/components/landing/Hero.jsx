import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.2 + i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 pb-20 pt-28 md:pt-32"
    >
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-32 h-72 w-72 rounded-full bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo opacity-30 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-80px] h-80 w-80 rounded-full bg-gradient-to-tr from-loyvault-blueFrom to-loyvault-blueTo opacity-25 blur-3xl" />
      </div>

      <motion.div
        className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left: copy + CTAs */}
        <div className="space-y-6">
          <motion.p
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur"
            variants={cardVariants}
            custom={0}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gradient-to-r from-loyvault-purpleFrom to-loyvault-purpleTo" />
            Wallet-based SSI loyalty · Zero PII storage
          </motion.p>

          <motion.h1
            className="text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl xl:text-7xl"
            variants={cardVariants}
            custom={1}
          >
            Your Loyalty.
            <span className="block bg-gradient-to-tr from-loyvault-purpleFrom via-loyvault-purpleTo to-loyvault-blueTo bg-clip-text text-transparent">
              Your Control.
            </span>
          </motion.h1>

          <motion.div
            className="space-y-3 text-sm text-white/70 md:text-base"
            variants={cardVariants}
            custom={2}
          >
            <p>
              The first self-sovereign loyalty management system that puts privacy
              back in your hands.
            </p>
            <p>No phone numbers. No emails. Just secure, verifiable credentials in your wallet.</p>
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center gap-4"
            variants={cardVariants}
            custom={3}
          >
            <button
              type="button"
              onClick={() => navigate("/customer/auth")}
              className="rounded-full bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo px-6 py-2.5 text-sm font-medium shadow-lg shadow-purple-500/40 transition hover:from-loyvault-purpleTo hover:to-loyvault-blueTo hover:brightness-110"
            >
              Start as Customer
            </button>
            <button
              type="button"
              onClick={() => navigate("/shop/auth")}
              className="rounded-full border border-white/25 bg-white/5 px-6 py-2.5 text-sm font-medium text-white/80 backdrop-blur-sm transition hover:border-white/45 hover:bg-white/10"
            >
              For Businesses
            </button>
          </motion.div>

          <motion.div
            className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-medium text-white/55 md:text-xs"
            variants={cardVariants}
            custom={4}
          >
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Zero Data Stored
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/40 bg-sky-500/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              100% Private
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-purple-400/40 bg-purple-500/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              Blockchain Verified
            </span>
          </motion.div>
        </div>

        {/* Right: abstract wallet / cards mockup */}
        <motion.div
          className="relative flex justify-center md:justify-end"
          variants={cardVariants}
          custom={5}
        >
          <div className="relative h-[320px] w-full max-w-sm">
            {/* Base card */}
            <motion.div
              className="absolute inset-x-4 top-8 rounded-3xl border border-white/10 bg-slate-950/80 p-4 shadow-2xl shadow-purple-900/50 backdrop-blur-xl"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white/80">My LoyVault Wallet</p>
                  <p className="text-[10px] text-white/50">did:loy:abc9...x7p</p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  Secure
                </span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between rounded-2xl bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo px-3 py-2 text-white shadow-md shadow-purple-700/40">
                  <div>
                    <p className="text-xs font-semibold">ShopX Loyalty</p>
                    <p className="text-[10px] opacity-80">Silver · 120 pts</p>
                  </div>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">Verified</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-900/90 px-3 py-2 text-white/90">
                  <div>
                    <p className="text-xs font-semibold">CafeBrew Rewards</p>
                    <p className="text-[10px] opacity-75">Bronze · 40 pts</p>
                  </div>
                  <span className="text-[10px] text-emerald-300">Active</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-900/90 px-3 py-2 text-white/90">
                  <div>
                    <p className="text-xs font-semibold">TechMart Privilege</p>
                    <p className="text-[10px] opacity-75">Gold · 210 pts</p>
                  </div>
                  <span className="text-[10px] text-yellow-300">Gold</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-white/50">
                <span>Zero PII stored by shops</span>
                <span className="rounded-full bg-white/5 px-2 py-0.5">SSI Wallet</span>
              </div>
            </motion.div>

            {/* Floating cards */}
            <motion.div
              className="absolute right-0 top-0 w-40 rounded-2xl bg-gradient-to-tr from-loyvault-blueFrom to-loyvault-blueTo p-3 text-[10px] text-slate-950 shadow-xl"
              initial={{ opacity: 0, y: -20, x: 40 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
            >
              <p className="font-semibold">Shop Dashboard</p>
              <p className="mt-1 opacity-80">120 active members</p>
              <p className="opacity-80">8.4k points issued</p>
            </motion.div>

            <motion.div
              className="absolute -left-3 bottom-4 w-36 rounded-2xl border border-purple-400/40 bg-slate-950/95 p-3 text-[10px] text-white shadow-lg shadow-purple-900/60"
              initial={{ opacity: 0, y: 20, x: -30 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ delay: 0.75, duration: 0.6, ease: "easeOut" }}
            >
              <p className="font-semibold text-white/90">Verification Request</p>
              <p className="mt-1 text-white/70">Share credential with ShopX?</p>
              <div className="mt-2 flex gap-2">
                <span className="flex-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-center text-[9px] text-emerald-200">
                  Approve
                </span>
                <span className="flex-1 rounded-full bg-white/5 px-2 py-0.5 text-center text-[9px] text-white/70">
                  Reject
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        type="button"
        onClick={() => {
          const el = document.getElementById("features");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 4 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.8, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[11px] text-white/70 backdrop-blur md:flex"
      >
        <span>Scroll</span>
        <span className="text-lg leading-none">↓</span>
      </motion.button>
    </section>
  );
}

