import { useEffect } from "react";

// callbacks: { onSubmit?, onClose?, onQuickAction? }
export default function useKeyboardShortcuts(callbacks = {}) {
  useEffect(() => {
    function handleKeyPress(e) {
      const { onSubmit, onClose, onQuickAction } = callbacks;

      // Enter key: submit (avoid when IME is active by checking composition if needed)
      if (e.key === "Enter" && typeof onSubmit === "function") {
        // Let native button click handle it when focus is on a button of type=submit
        const target = e.target;
        const isTextarea = target && target.tagName === "TEXTAREA";
        if (!isTextarea) {
          e.preventDefault();
          onSubmit();
          return;
        }
      }

      // Escape key: close / cancel
      if (e.key === "Escape" && typeof onClose === "function") {
        e.preventDefault();
        onClose();
        return;
      }

      // Ctrl+K / Cmd+K: quick action (e.g. focus search)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k" && typeof onQuickAction === "function") {
        e.preventDefault();
        onQuickAction();
      }
    }

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [callbacks]);
}
