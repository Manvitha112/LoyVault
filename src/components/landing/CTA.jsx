import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function CTA() {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-loyvault-purpleFrom via-loyvault-purpleTo to-loyvault-blueTo py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_55%)] mix-blend-screen" />

      <div className="relative mx-auto max-w-4xl px-4 text-center text-slate-950">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-2xl font-semibold tracking-tight md:text-3xl"
        >
          Ready to Take Control?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
          className="mt-3 text-sm text-slate-900/80 md:text-base"
        >
          Join thousands who have already switched to privacy-first loyalty.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 0 35px rgba(88,28,135,0.7)" }}
            whileTap={{ scale: 0.97 }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, repeatType: "reverse" }}
            type="button"
            onClick={() => navigate("/customer/auth")}
            className="min-w-[220px] rounded-full bg-slate-950 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/60"
          >
            Get Started as Customer
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 0 35px rgba(8,47,73,0.6)" }}
            whileTap={{ scale: 0.97 }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, repeatType: "reverse", delay: 0.3 }}
            type="button"
            onClick={() => navigate("/shop/auth")}
            className="min-w-[220px] rounded-full bg-gradient-to-r from-loyvault-blueFrom to-loyvault-blueTo px-8 py-4 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-900/40"
          >
            Register Your Business
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.15 }}
          className="mt-4 text-xs font-medium text-slate-900/75"
        >
          No credit card required • Free forever
        </motion.p>
      </div>
    </section>
  );
}

