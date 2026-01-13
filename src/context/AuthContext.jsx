import { createContext, useContext, useEffect, useState } from "react";
import { getShop } from "../utils/shopIndexedDB";

const AuthContext = createContext(undefined);

const STORAGE_KEYS = {
  role: "loyvault_userRole",
  auth: "loyvault_isAuthenticated",
  lastLogin: "loyvault_lastLogin",
  user: "loyvault_userData",
  shopDid: "loyvault_shopDID",
  shopName: "loyvault_shopName",
};

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // "customer" | "shopkeeper" | null
  const [user, setUser] = useState(null); // { did, name, ... }
  const [loading, setLoading] = useState(true);
  const [shopData, setShopData] = useState(null); // { shopDID, shopName, email, ... }

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const storedRole = localStorage.getItem(STORAGE_KEYS.role);
      const storedAuth = localStorage.getItem(STORAGE_KEYS.auth);
      const storedUser = localStorage.getItem(STORAGE_KEYS.user);

      if (storedAuth === "true" && storedRole) {
        setIsAuthenticated(true);
        setUserRole(storedRole);
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            if (storedRole === "shopkeeper") {
              setShopData(parsed);
            }
          } catch {
            setUser(null);
          }
        }
      }
    } catch (error) {
      console.error("[AuthContext] failed to restore session", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const persistSession = (role, userData) => {
    try {
      if (role) {
        localStorage.setItem(STORAGE_KEYS.role, role);
      }
      localStorage.setItem(STORAGE_KEYS.auth, "true");
      localStorage.setItem(STORAGE_KEYS.lastLogin, new Date().toISOString());
      if (userData) {
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData));
        if (role === "shopkeeper") {
          if (userData.shopDID) {
            localStorage.setItem(STORAGE_KEYS.shopDid, userData.shopDID);
          }
          if (userData.shopName) {
            localStorage.setItem(STORAGE_KEYS.shopName, userData.shopName);
          }
        }
      }
    } catch (error) {
      console.error("[AuthContext] failed to persist session", error);
    }
  };

  const clearSession = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.role);
      localStorage.removeItem(STORAGE_KEYS.auth);
      localStorage.removeItem(STORAGE_KEYS.lastLogin);
      localStorage.removeItem(STORAGE_KEYS.user);
      localStorage.removeItem(STORAGE_KEYS.shopDid);
      localStorage.removeItem(STORAGE_KEYS.shopName);
    } catch (error) {
      console.error("[AuthContext] failed to clear session", error);
    }
  };

  const login = (role, userData) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUser(userData || null);
    if (role === "shopkeeper") {
      setShopData(userData || null);
    } else {
      setShopData(null);
    }
    persistSession(role, userData || null);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null);
    setShopData(null);
    clearSession();
  };

  const checkAuth = () => {
    // Lightweight synchronous check based on current state/localStorage
    try {
      const storedAuth = localStorage.getItem(STORAGE_KEYS.auth) === "true";
      const storedRole = localStorage.getItem(STORAGE_KEYS.role);
      return storedAuth && !!storedRole;
    } catch {
      return false;
    }
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...(updates || {}) };
      try {
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(next));
      } catch (error) {
        console.error("[AuthContext] failed to persist user updates", error);
      }
      return next;
    });
  };

  const loginShop = async (incomingShopData) => {
    if (!incomingShopData || !incomingShopData.shopDID || !incomingShopData.shopName || !incomingShopData.email) {
      console.error("[AuthContext] loginShop missing required fields");
      return false;
    }
    setIsAuthenticated(true);
    setUserRole("shopkeeper");
    setUser(incomingShopData);
    setShopData(incomingShopData);
    persistSession("shopkeeper", incomingShopData);
    return true;
  };

  const checkShopSession = async () => {
    try {
      const storedRole = localStorage.getItem(STORAGE_KEYS.role);
      if (storedRole !== "shopkeeper") return false;

      const storedDid = localStorage.getItem(STORAGE_KEYS.shopDid);
      let shopDID = storedDid;

      if (!shopDID) {
        const storedUser = localStorage.getItem(STORAGE_KEYS.user);
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed?.shopDID) {
              shopDID = parsed.shopDID;
            }
          } catch {
            // ignore
          }
        }
      }

      if (!shopDID) return false;

      const shop = await getShop(shopDID);
      if (!shop) {
        clearSession();
        setIsAuthenticated(false);
        setUserRole(null);
        setUser(null);
        setShopData(null);
        return false;
      }

      setIsAuthenticated(true);
      setUserRole("shopkeeper");
      setUser(shop);
      setShopData(shop);
      persistSession("shopkeeper", shop);
      return true;
    } catch (error) {
      console.error("[AuthContext] checkShopSession failed", error);
      return false;
    }
  };

  const value = {
    isAuthenticated,
    userRole,
    user,
    shopData,
    loading,
    login,
    loginShop,
    logout,
    checkAuth,
    checkShopSession,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
