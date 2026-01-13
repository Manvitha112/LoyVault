import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import CustomerDashboard from "./pages/CustomerDashboard";
import RoleSelection from "./components/auth/RoleSelection";
import CustomerAuth from "./components/auth/CustomerAuth";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppToaster from "./components/common/Toast.jsx";
import ShopkeeperAuth from "./components/auth/ShopkeeperAuth";
import ShopDashboard from "./pages/ShopDashboard";
import { useAuth } from "./context/AuthContext.jsx";
import { checkShopSession as checkShopSessionUtil } from "./utils/sessionManager";

function AppRouter() {
  const navigate = useNavigate();
  const { loginShop } = useAuth();

  useEffect(() => {
    const checkAuthOnLoad = async () => {
      const path = window.location.pathname;

      // Shopkeeper session check
      if (path.startsWith("/shop")) {
        const { valid, shopData } = await checkShopSessionUtil();

        if (valid && shopData) {
          await loginShop(shopData);
          if (path === "/shop/auth") {
            navigate("/shop/dashboard", { replace: true });
          }
        } else if (path === "/shop/dashboard") {
          navigate("/shop/auth", { replace: true });
        }
      }

      // Customer session check could go here (existing logic placeholder)
      if (path.startsWith("/customer")) {
        // TODO: add customer auto-login handling if needed
      }
    };

    // Only run on initial mount
    checkAuthOnLoad();
  }, []);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/get-started" element={<RoleSelection />} />
      <Route path="/customer/auth" element={<CustomerAuth />} />
      <Route path="/shop/auth" element={<ShopkeeperAuth />} />

      {/* Protected routes */}
      <Route
        path="/customer/dashboard"
        element={(
          <ProtectedRoute role="customer">
            <CustomerDashboard />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/shop/dashboard"
        element={(
          <ProtectedRoute role="shopkeeper">
            <ShopDashboard />
          </ProtectedRoute>
        )}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppToaster />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
