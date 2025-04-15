// context/DashboardContext.js
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import customerService from "../lib/services/customerService";
import purchaseService from "../lib/services/purchaseService";
import freebieService from "../lib/services/freebieService";
import productService from "../lib/services/productService";

// Create the dashboard context
const DashboardContext = createContext();

/**
 * Dashboard context provider component
 * @param {object} props - Component props
 * @returns {JSX.Element} Dashboard context provider
 */
export function DashboardProvider({ children }) {
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
    try {
      setIsLoading(true);
      setError(null);

      // Get current date information
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

      // Load customers
      const customers = await customerService.getAll();
      
      // Load current month purchases
      const purchases = await purchaseService.getPurchasesByDateRange(startOfMonth, endOfMonth);
      
      // Count freebies sent this month
      const freebieSentService = new freebieService.constructor('freebiesSent', {});
      const freebiesSent = await freebieSentService.query([
        { field: 'sentDate', operator: '>=', value: startOfMonth },
        { field: 'sentDate', operator: '<=', value: endOfMonth }
      ]);
      
      // Load products
      const products = await productService.getAll();
      const lowStockProducts = await productService.getLowInventoryProducts(5);
      
      // Load available freebies
      const availableFreebies = await freebieService.getAvailableFreebies();

      // Update stats
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
      setError(err.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Context value
  const value = {
    stats,
    isLoading,
    error,
    refreshData: loadDashboardData,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

/**
 * Custom hook to use the dashboard context
 * @returns {object} Dashboard context value
 */
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};