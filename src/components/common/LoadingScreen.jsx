import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";

export default function LoadingScreen({
  message = "Loading...",
  submessage = null,
  fullscreen = true,
}) {
  const containerClasses = fullscreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
    : "w-full flex items-center justify-center px-4 py-6";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={containerClasses}
      >
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-sky-500/35 bg-slate-950/95 px-6 py-5 text-center text-white shadow-[0_0_40px_rgba(56,189,248,0.6)] backdrop-blur-xl">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-loyvault-blueFrom to-loyvault-blueTo text-slate-950 shadow-lg shadow-sky-500/40"
          >
            <Shield className="h-6 w-6" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-sm font-medium text-white/90"
          >
            {message}
          </motion.p>
          {submessage && (
            <motion.p
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.05 }}
              className="text-[11px] text-white/70"
            >
              {submessage}
            </motion.p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
