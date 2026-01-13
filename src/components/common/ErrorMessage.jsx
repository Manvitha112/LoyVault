import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Info, X, XCircle } from "lucide-react";

const variants = {
  hidden: { opacity: 0, y: -6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -4, transition: { duration: 0.2, ease: "easeIn" } },
};

const shakeVariants = {
  initial: { x: 0 },
  shake: {
    x: [0, -4, 4, -3, 3, -2, 2, 0],
    transition: { duration: 0.35 },
  },
};

export default function ErrorMessage({ message, type = "error", onClose = null, autoDismiss = true }) {
  const [open, setOpen] = useState(Boolean(message));

  useEffect(() => {
    setOpen(Boolean(message));
  }, [message]);

  useEffect(() => {
    if (!open || !autoDismiss) return undefined;
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [open, autoDismiss]);

  if (!open || !message) return null;

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  let bg = "bg-red-500/15";
  let border = "border-red-400/80";
  let Icon = XCircle;

  if (type === "warning") {
    bg = "bg-amber-500/15";
    border = "border-amber-400/80";
    Icon = AlertCircle;
  }
  if (type === "info") {
    bg = "bg-sky-500/15";
    border = "border-sky-400/80";
    Icon = Info;
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`relative flex items-center justify-between gap-2 rounded-2xl border ${border} ${bg} px-3 py-2 text-[11px] text-white/90 shadow-[0_0_24px_rgba(248,113,113,0.25)] backdrop-blur-md`}
        >
          <motion.div
            variants={shakeVariants}
            initial="initial"
            animate="shake"
            className="flex items-center gap-2"
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{message}</span>
          </motion.div>
          {onClose && (
            <button
              type="button"
              onClick={handleClose}
              className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
