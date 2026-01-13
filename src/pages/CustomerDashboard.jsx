import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/get-started");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-24">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Welcome to Your Wallet! 🎉
          </h1>
          <p className="text-sm text-white/70">
            This is a temporary dashboard placeholder. The full wallet experience is
            coming soon.
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-purple-500/40 bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950 p-5 shadow-[0_0_40px_rgba(168,85,247,0.35)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-200/80">
            Current identity
          </p>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-3 text-xs">
            <p className="font-medium text-white/80">DID</p>
            <p className="mt-1 break-all text-white/70">
              {user?.did ?? "did:loyvault:... (not set)"}
            </p>
          </div>
          <p className="text-[11px] text-white/60">
            You will soon see your multi-shop loyalty cards, points, and offers here.
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-white/60">
          <span>Dashboard coming soon...</span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/85 shadow-sm transition hover:border-white/40 hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

