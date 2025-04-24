// context/DashboardContext.js
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import customerService from "../lib/services/customerService";
import purchaseService from "../lib/services/purchaseService";
import freebieService from "../lib/services/freebieService";
import productService from "../lib/services/productService";

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const { user, isAuthReady } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    currentMonthPurchases: 0,
    currentMonthFreebies: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalFreebiesAvailable: 0,
  });

  const loadDashboardData = async () => {
    if (!user) {
      setError("User is not authenticated.");
      setIsLoading(false);
      console.error("User is not authenticated. Cannot load dashboard data.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("Authenticated user:", user.uid);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

      const customers = await customerService.getAll();
      const purchases = await purchaseService.getPurchasesByDateRange(startOfMonth, endOfMonth);

      const freebieSentService = new freebieService.constructor('freebiesSent', {});
      const freebiesSent = await freebieSentService.query([
        { field: 'sentDate', operator: '>=', value: startOfMonth },
        { field: 'sentDate', operator: '<=', value: endOfMonth }
      ]);

      const products = await productService.getAll();
      const lowStockProducts = await productService.getLowInventoryProducts(5);
      const availableFreebies = await freebieService.getAvailableFreebies();

      setStats({
        totalCustomers: customers.length,
        currentMonthPurchases: purchases.length,
        currentMonthFreebies: freebiesSent.length,
        totalProducts: products.length,
        lowStockProducts: lowStockProducts.length,
        totalFreebiesAvailable: availableFreebies.length,
      });

      setIsLoading(false);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthReady && user) {
      loadDashboardData();
    }
  }, [isAuthReady, user]);

  const value = {
    stats,
    isLoading,
    error,
    refreshData: loadDashboardData,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
