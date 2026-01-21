import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, QrCode, Trophy, Megaphone, ShieldCheck, Store } from "lucide-react";

const customerSteps = [
  {
    id: 1,
    icon: Smartphone,
    title: "Create Wallet · Generate DID",
    description: "Register and create your decentralized identifier—no phone number or email required.",
  },
  {
    id: 2,
    icon: QrCode,
    title: "Scan Shop QR · Join Instantly",
    description: "Scan a shop's join QR code to become a member. Your DID is all you need to share.",
  },
  {
    id: 3,
    icon: Trophy,
    title: "Show QR at Checkout · Earn Points",
    description: "Present your loyalty QR at purchase. Points are calculated and added automatically (1 point per ₹10).",
  },
  {
    id: 4,
    icon: Megaphone,
    title: "Receive Offers & Receipts Automatically",
    description: "Offers from joined shops and digital receipts appear in your wallet automatically—no scanning needed.",
  },
  {
    id: 5,
    icon: ShieldCheck,
    title: "Stay Private · Full Control",
    description: "Only your DID is shared. Shops never see your phone, email, or personal data. You control everything.",
  },
];

const businessSteps = [
  {
    id: 1,
    icon: Store,
    title: "Register Shop · Get DID",
    description: "Create your merchant account and receive a unique, verifiable Shop DID for your loyalty program.",
  },
  {
    id: 2,
    icon: QrCode,
    title: "Display Join QR Code",
    description: "Generate and display your join QR code at checkout. Customers scan to join instantly—no forms needed.",
  },
  {
    id: 3,
    icon: Smartphone,
    title: "Scan Customer QR · Verify Membership",
    description: "Scan customer's loyalty QR to verify membership, check tier, and view current points in real time.",
  },
  {
    id: 4,
    icon: Trophy,
    title: "Update Points · Auto-Create Invoice",
    description: "Enter purchase amount to add points. Digital invoice with GST is created automatically and sent to customer's wallet.",
  },
  {
    id: 5,
    icon: Megaphone,
    title: "Create Offers · Auto-Deliver",
    description: "Create tier-based offers. All members automatically receive them in their wallet—no manual distribution needed.",
  },
];

const tabs = [
  { id: "customer", label: "For Customers", steps: customerSteps },
  { id: "business", label: "For Businesses", steps: businessSteps },
];

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState("customer");

  const current = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <section
      id="how-it-works"
      className="relative bg-slate-950 py-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.12),_transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-300/80">
              How it works
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              One flow for customers. One for businesses.
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/65 md:text-base">
              LoyVault connects wallets and shops through QR codes and signed credentials,
              so loyalty feels instant while staying private.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="inline-flex rounded-full border border-white/10 bg-slate-900/70 p-1 text-xs backdrop-blur">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative rounded-full px-3 py-1.5 transition ${
                  activeTab === tab.id
                    ? "bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo text-white shadow-[0_0_20px_rgba(168,85,247,0.7)]"
                    : "text-white/65 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-10">
          <div className="relative mx-auto max-w-4xl">
            {/* central gradient line */}
            <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-loyvault-purpleFrom via-loyvault-purpleTo to-loyvault-blueTo opacity-60" />

            <AnimatePresence mode="wait">
              <motion.ol
                key={current.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-6"
              >
                {current.steps.map((step, index) => {
                  const isLeft = index % 2 === 0;
                  return (
                    <li
                      key={step.id}
                      className={`relative flex flex-col gap-3 md:flex-row ${
                        isLeft ? "md:justify-start" : "md:justify-end"
                      }`}
                    >
                      {/* connector dot + number badge at center line */}
                      <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 md:top-6">
                        <div className="flex items-center justify-center rounded-full bg-slate-950 p-1">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo text-[11px] font-semibold text-white shadow-lg shadow-purple-500/50">
                            {step.id}
                          </div>
                        </div>
                      </div>

                      <motion.div
                        initial={{
                          opacity: 0,
                          x: isLeft ? -30 : 30,
                        }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 * index }}
                        className={`md:w-1/2 ${
                          isLeft ? "md:pr-10" : "md:pl-10 md:ml-auto"
                        }`}
                      >
                        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-[0_18px_35px_rgba(15,23,42,0.8)] backdrop-blur-md transition-transform duration-200 hover:-translate-y-1 hover:border-purple-400/70 hover:shadow-[0_0_35px_rgba(168,85,247,0.5)]">
                          <div className="pointer-events-none absolute inset-0 opacity-0 blur-3xl transition-opacity duration-200 group-hover:opacity-100">
                            <div className="absolute -inset-10 bg-[conic-gradient(from_210deg_at_50%_50%,rgba(168,85,247,0.32),rgba(56,189,248,0.24),transparent,rgba(168,85,247,0.32))]" />
                          </div>

                          <div className="relative flex items-start gap-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo text-white shadow-lg shadow-purple-700/40">
                              <step.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-purple-200/80">
                                Step {step.id}
                              </p>
                              <h3 className="mt-1 text-sm font-semibold text-white md:text-base">
                                {step.title}
                              </h3>
                              <p className="mt-1 text-[11px] text-white/70 md:text-xs">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </li>
                  );
                })}
              </motion.ol>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

