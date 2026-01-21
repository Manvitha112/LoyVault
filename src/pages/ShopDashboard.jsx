import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchShopLoyaltyStats, fetchShopOfferStats } from "../utils/apiClient.js";
import Sidebar from "../components/shopkeeper/Sidebar.jsx";
import DashboardHeader from "../components/shopkeeper/DashboardHeader.jsx";
import DashboardOverview from "../components/shopkeeper/DashboardOverview.jsx";
import IssueCredentials from "../components/shopkeeper/IssueCredentials.jsx";
import VerifyCustomer from "../components/shopkeeper/VerifyCustomer.jsx";
import ManageOffers from "../components/shopkeeper/ManageOffers.jsx";
import Analytics from "../components/shopkeeper/Analytics.jsx";
import InvoiceManagement from "../components/shopkeeper/InvoiceManagement.jsx";
import AnalyticsDashboard from "../components/shopkeeper/AnalyticsDashboard.jsx";
import ShopSettings from "../components/shopkeeper/ShopSettings.jsx";
import { toast } from "react-hot-toast";
import { Menu, X, LogOut } from "lucide-react";

const ShopDashboard = () => {
  const navigate = useNavigate();
  const { user: shop, logout } = useAuth();

  const [activePage, setActivePage] = useState("dashboard");
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeOffers: 0,
    pointsDistributed: 0,
    todayJoins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (shop?.shopDID) {
      loadShopData();
    }
  }, [shop?.shopDID]);

  const loadShopData = async () => {
    setLoading(true);
    try {
      if (!shop?.shopDID) {
        setStats({ totalMembers: 0, activeOffers: 0, pointsDistributed: 0, todayJoins: 0 });
        return;
      }

      const [loyaltyStats, offerStats] = await Promise.all([
        fetchShopLoyaltyStats(shop.shopDID),
        fetchShopOfferStats(shop.shopDID),
      ]);

      setStats({
        totalMembers: loyaltyStats?.totalMembers || 0,
        activeOffers: offerStats?.activeOffers || 0,
        pointsDistributed: loyaltyStats?.pointsDistributed || 0,
        todayJoins: loyaltyStats?.todayJoins || 0,
      });
    } catch (error) {
      console.error("Failed to load shop data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // eslint-disable-next-line no-alert
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/");
    }
  };

  const handlePageChange = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex h-96 items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-blue-500" />
        </div>
      );
    }

    switch (activePage) {
      case "dashboard":
        return (
          <DashboardOverview
            shop={shop}
            stats={stats}
            onActionClick={handlePageChange}
          />
        );
      case "issue":
        return <IssueCredentials shop={shop} />;
      case "verify":
        return <VerifyCustomer shop={shop} />;
      case "offers":
        return <ManageOffers shop={shop} />;
      case "invoices":
        return <InvoiceManagement shop={shop} />;
      case "analytics":
        return <AnalyticsDashboard shop={shop} />;
      case "settings":
        return <ShopSettings shop={shop} onLogout={handleLogout} />;
      default:
        return (
          <DashboardOverview
            shop={shop}
            stats={stats}
            onActionClick={handlePageChange}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-blue-900">
      {/* Desktop Layout */}
      <div className="hidden h-screen lg:flex">
        <Sidebar
          activePage={activePage}
          onPageChange={handlePageChange}
          onLogout={handleLogout}
        />

        <div className="flex-1 overflow-auto">
          <DashboardHeader shop={shop} onLogout={handleLogout} />
          <main className="p-6">{renderContent()}</main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-blue-400/30 bg-slate-900/80 px-4 py-3 backdrop-blur-lg">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 transition-all hover:bg-white/10"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>

          <h1 className="text-lg font-bold text-white">LoyVault Business</h1>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg p-2 transition-all hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5 text-red-400" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-64 border-r border-blue-400/30 bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar
                activePage={activePage}
                onPageChange={handlePageChange}
                onLogout={handleLogout}
              />
            </div>
          </div>
        )}

        {/* Mobile Content */}
        <main className="p-4">{renderContent()}</main>
      </div>
    </div>
  );
};

export default ShopDashboard;

