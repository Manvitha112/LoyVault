import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Copy, LogOut, Store, Users, Megaphone, BadgeCheck, BarChart3 } from "lucide-react";
import { toast } from "../components/common/Toast.jsx";
import LoadingScreen from "../components/common/LoadingScreen.jsx";

export default function ShopDashboard() {
  const navigate = useNavigate();
  const { shopData, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    logout();
    navigate("/get-started", { replace: true });
  };

  const did = shopData?.shopDID || "did:loyvault:shop-...";
  const shopName = shopData?.shopName || "Your Shop";

  if (loggingOut) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <LoadingScreen message="Signing you out..." submessage="Redirecting to role selection" fullscreen={false} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:py-10">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-loyvault-blueFrom to-loyvault-blueTo text-slate-950 shadow-lg shadow-sky-500/40">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Welcome, {shopName}!</h1>
              <p className="text-[11px] text-white/65 md:text-xs">Manage your loyalty programs, members, and offers from one place.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-white/85 shadow-sm transition hover:border-white/40 hover:bg-white/10"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </header>

        {/* DID card */}
        <section className="grid gap-4 md:grid-cols-[2fr,3fr]">
          <div className="space-y-3 rounded-2xl border border-sky-500/40 bg-gradient-to-br from-slate-900/90 via-slate-950 to-sky-950/80 p-4 shadow-[0_0_40px_rgba(56,189,248,0.4)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-300/80">Shop Identity</p>
            <div className="rounded-2xl border border-white/15 bg-black/40 p-3 text-xs">
              <p className="text-[11px] text-white/60">Shop DID</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="break-all text-[11px] text-white/80">{did}</p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(did).then(
                      () => toast.success("Shop DID copied"),
                      () => toast.error("Unable to copy DID"),
                    );
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-2 py-1 text-[10px] text-white/85 hover:border-white/40 hover:bg-white/10"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </button>
              </div>
              <p className="mt-2 text-[10px] text-white/55">Use this DID when integrating LoyVault with external systems.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
              <p className="text-[11px] text-white/60">Total Members</p>
              <p className="mt-1 text-xl font-semibold">0</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
              <p className="text-[11px] text-white/60">Active Offers</p>
              <p className="mt-1 text-xl font-semibold">0</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
              <p className="text-[11px] text-white/60">Points Distributed</p>
              <p className="mt-1 text-xl font-semibold">0</p>
            </div>
          </div>
        </section>

        {/* Coming soon area */}
        <section className="mt-4 space-y-3">
          <h2 className="text-sm font-semibold tracking-tight">Shop Dashboard Coming Soon...</h2>
          <p className="text-[11px] text-white/65">
            This is a placeholder view to test authentication. Soon you&apos;ll see rich analytics, member lists, and tools to issue and
            manage loyalty credentials.
          </p>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
                  <BadgeCheck className="h-4 w-4" />
                </div>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-medium text-amber-300">Coming Soon</span>
              </div>
              <p className="text-[11px] font-semibold">Issue Credentials</p>
              <p className="text-[10px] text-white/60">Create and send loyalty credentials directly to customer wallets.</p>
            </div>

            <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                  <Users className="h-4 w-4" />
                </div>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-medium text-amber-300">Coming Soon</span>
              </div>
              <p className="text-[11px] font-semibold">Verify Customers</p>
              <p className="text-[10px] text-white/60">Scan and verify customer DIDs and credentials at checkout.</p>
            </div>

            <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
                  <Megaphone className="h-4 w-4" />
                </div>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-medium text-amber-300">Coming Soon</span>
              </div>
              <p className="text-[11px] font-semibold">Broadcast Offers</p>
              <p className="text-[10px] text-white/60">Send targeted offers to your loyal customers in one click.</p>
            </div>

            <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-medium text-amber-300">Coming Soon</span>
              </div>
              <p className="text-[11px] font-semibold">View Analytics</p>
              <p className="text-[10px] text-white/60">Track redemptions, engagement, and loyalty program health.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

