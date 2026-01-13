import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const statsConfig = [
  {
    label: "Users",
    value: 10000,
    prefix: "",
    suffix: "+",
    description: "Trust LoyVault with their identity",
  },
  {
    label: "Businesses",
    value: 500,
    prefix: "",
    suffix: "+",
    description: "Using our privacy-first system",
  },
  {
    label: "Data Breaches",
    value: 0,
    prefix: "Zero ",
    suffix: "",
    description: "Because we store zero PII",
  },
  {
    label: "Private",
    value: 100,
    prefix: "",
    suffix: "%",
    description: "Your data never leaves your wallet",
  },
];

function useCountUp(target, active, duration = 800) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;

    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [active, target, duration]);

  return value;
}

export default function Stats() {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative border-y border-white/5 bg-slate-950/70 py-14"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.13),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.13),_transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-300/80">
            Social proof
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Built for real stores and everyday customers.
          </h2>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsConfig.map(({ label, value, prefix, suffix, description }) => {
            const current = useCountUp(value, inView);
            return (
              <motion.div
                key={label}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-center shadow-[0_18px_40px_rgba(15,23,42,0.9)] backdrop-blur-md"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 blur-3xl transition-opacity duration-300 hover:opacity-100">
                  <div className="absolute -inset-10 bg-[conic-gradient(from_220deg_at_50%_50%,rgba(168,85,247,0.4),rgba(236,72,153,0.35),rgba(56,189,248,0.3),rgba(168,85,247,0.4))]" />
                </div>
                <div className="relative">
                  <p className="text-sm font-medium text-white/60">{label}</p>
                  <p className="mt-2 bg-gradient-to-tr from-loyvault-purpleFrom via-loyvault-purpleTo to-loyvault-blueTo bg-clip-text text-4xl font-semibold text-transparent">
                    {prefix}
                    {current.toLocaleString()}
                    {suffix}
                  </p>
                  <p className="mt-2 text-[11px] text-white/65 md:text-xs">{description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
