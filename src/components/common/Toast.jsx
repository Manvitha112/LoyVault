import { Toaster, toast } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: "rgba(59, 130, 246, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          color: "#ffffff",
          borderRadius: "9999px",
          padding: "8px 14px",
          fontSize: "12px",
        },
        success: {
          iconTheme: {
            primary: "#10b981", // emerald
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444", // red
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}

export const showSuccess = (message) => {
  toast.success(message);
};

export const showError = (message) => {
  toast.error(message);
};

export const showLoading = (message) => toast.loading(message);

export const dismissToast = (toastId) => {
  if (toastId) toast.dismiss(toastId);
};

export { toast };

export default AppToaster;
