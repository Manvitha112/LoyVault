import { CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

const traditional = [
  "Stores your phone, email, address",
  "High risk of data breaches",
  "Employees can misuse data",
  "Spam marketing calls/emails",
  "No control over your data",
  "Separate accounts for each shop",
  "Lost phone = lost loyalty points",
];

const loyvault = [
  "Stores only anonymous DID",
  "Zero personal data to breach",
  "Shops never see your contact info",
  "Offers via wallet, not phone",
  "Full consent and revocation control",
  "One wallet for all shops",
  "Backup & restore anytime",
];

export default function Benefits() {
  return (
    <section
      id="benefits"
      className="relative bg-slate-950 py-16"
    >
      {/* subtle shine */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.16),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.16),_transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-300/80">
            Benefits
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Traditional Systems vs LoyVault
          </h2>
          <p className="mt-2 text-sm text-white/65 md:text-base">
            See why a wallet-based, self-sovereign model removes the risk from
            loyalty programs—for customers and for shops.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Traditional */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="group relative overflow-hidden rounded-3xl border border-red-500/40 bg-slate-950/80 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.9)] backdrop-blur-md"
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute -inset-10 bg-[conic-gradient(from_230deg_at_50%_50%,rgba(248,113,113,0.4),rgba(248,113,113,0.1),transparent,rgba(248,113,113,0.4))]" />
            </div>

            <div className="relative flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300/80">
                  Traditional Loyalty Systems
                </p>
                <h3 className="mt-1 text-sm font-semibold text-white md:text-base">
                  Data-heavy, breach-prone, and noisy.
                </h3>
              </div>
              <XCircle className="h-8 w-8 flex-shrink-0 text-red-400" />
            </div>

            <ul className="relative mt-4 space-y-2.5 text-[11px] text-white/70 md:text-xs">
              {traditional.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 rounded-xl border border-white/5 bg-white/0 px-2 py-1.5 transition-colors duration-150 hover:bg-red-500/5"
                >
                  <span className="mt-[2px] flex-shrink-0">
                    <XCircle className="h-3.5 w-3.5 text-red-400" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* LoyVault */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="group relative overflow-hidden rounded-3xl border border-purple-400/60 bg-slate-950/80 p-5 shadow-[0_20px_60px_rgba(76,29,149,0.9)] backdrop-blur-md"
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute -inset-10 bg-[conic-gradient(from_220deg_at_50%_50%,rgba(168,85,247,0.55),rgba(236,72,153,0.5),rgba(56,189,248,0.35),rgba(168,85,247,0.55))]" />
            </div>

            <div className="relative flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-200/90">
                  LoyVault
                </p>
                <h3 className="mt-1 text-sm font-semibold text-white md:text-base">
                  Privacy-first, portable, and verifiable.
                </h3>
              </div>
              <CheckCircle2 className="h-8 w-8 flex-shrink-0 text-emerald-400" />
            </div>

            <ul className="relative mt-4 space-y-2.5 text-[11px] text-white/70 md:text-xs">
              {loyvault.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 rounded-xl border border-white/5 bg-white/0 px-2 py-1.5 transition-colors duration-150 hover:bg-emerald-500/5"
                >
                  <span className="mt-[2px] flex-shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

