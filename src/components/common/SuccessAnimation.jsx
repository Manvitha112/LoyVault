import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const circleVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 18 },
  },
};

const checkVariants = {
  hidden: { pathLength: 0 },
  visible: {
    pathLength: 1,
    transition: { duration: 0.5, ease: "easeOut", delay: 0.2 },
  },
};

export default function SuccessAnimation({ message, onComplete, autoClose = true, duration = 2000 }) {
  useEffect(() => {
    if (!autoClose) return undefined;
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration);
    return () => clearTimeout(timer);
  }, [autoClose, duration, onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center gap-3 text-center text-white"
      >
        <motion.div
          variants={circleVariants}
          initial="hidden"
          animate="visible"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-400/70 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              d="M5 13L9 17L19 7"
              stroke="#22c55e"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={checkVariants}
              initial="hidden"
              animate="visible"
            />
          </svg>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: 0.3 }}
          className="text-sm font-semibold tracking-tight"
        >
          {message}
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
