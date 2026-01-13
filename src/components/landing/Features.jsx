import { ShieldCheck, Wallet, BadgeCheck, Smartphone, Gift, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    id: 1,
    icon: ShieldCheck,
    title: "Complete Privacy",
    points: [
      "No personal data stored by shops",
      "Your identity stays in your wallet",
      "Zero risk of data breaches",
    ],
  },
  {
    id: 2,
    icon: Wallet,
    title: "Multi-Shop Wallet",
    points: [
      "One wallet for all loyalty programs",
      "Manage all credentials in one place",
      "Never lose your points again",
    ],
  },
  {
    id: 3,
    icon: BadgeCheck,
    title: "Verifiable Trust",
    points: [
      "Cryptographically signed credentials",
      "Shops can't forge or modify points",
      "Fraud-resistant architecture",
    ],
  },
  {
    id: 4,
    icon: Smartphone,
    title: "Easy to Use",
    points: [
      "Simple QR code scanning",
      "Instant credential sharing",
      "No complex setup required",
    ],
  },
  {
    id: 5,
    icon: Gift,
    title: "Smart Offers",
    points: [
      "Receive targeted offers privately",
      "No spam or unwanted marketing",
      "You control what you see",
    ],
  },
  {
    id: 6,
    icon: RefreshCcw,
    title: "Portable Identity",
    points: [
      "Backup and restore anytime",
      "Works across devices",
      "Never lose your loyalty history",
    ],
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative border-y border-white/5 bg-slate-950/60 py-16"
    >
      {/* subtle animated gradient backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.12),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.12),_transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-300/80">
            Why LoyVault?
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            A loyalty system designed for the self-sovereign web.
          </h2>
          <p className="mt-3 text-sm text-white/65 md:text-base">
            LoyVault combines privacy-first identity, verifiable credentials, and
            modern UX to make loyalty programs safer for customers and smarter for
            businesses.
          </p>
        </div>
        <motion.div
          className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {features.map(({ id, icon: Icon, title, points }) => (
            <motion.div
              key={id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: "easeOut" },
                },
              }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.75)] backdrop-blur-md transition-transform duration-200 hover:-translate-y-1.5 hover:border-purple-400/60 hover:shadow-[0_0_40px_rgba(168,85,247,0.45)]"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 blur-3xl transition-opacity duration-200 group-hover:opacity-100">
                <div className="absolute -inset-10 bg-[conic-gradient(from_220deg_at_50%_50%,rgba(168,85,247,0.25),rgba(56,189,248,0.25),transparent,rgba(168,85,247,0.25))]" />
              </div>

              <div className="relative flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo text-white shadow-lg shadow-purple-700/40">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white md:text-base">
                    {title}
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-[11px] text-white/70 md:text-xs">
                    {points.map((point) => (
                      <li key={point} className="flex gap-1.5">
                        <span className="mt-[6px] h-1 w-1 flex-shrink-0 rounded-full bg-white/50" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

