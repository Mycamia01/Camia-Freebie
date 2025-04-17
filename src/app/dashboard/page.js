// app/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useDashboard } from "../../context/DashboardContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Import icons from a compatible library
import { 
  Users, 
  ShoppingBag, 
  Gift, 
  Package, 
  AlertTriangle, 
  RefreshCw
} from "lucide-react";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { stats, isLoading, error, refreshData } = useDashboard();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Handle refresh
  const handleRefresh = () => {
    refreshData();
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Customers Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5">
              <p className="text-gray-500">Total Customers</p>
              <h3 className="text-3xl font-semibold">{stats.totalCustomers}</h3>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/customers"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all customers →
            </Link>
          </div>
        </div>

        {/* Purchases Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <ShoppingBag className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5">
              <p className="text-gray-500">This Month's Purchases</p>
              <h3 className="text-3xl font-semibold">{stats.currentMonthPurchases}</h3>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/purchases"
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              View all purchases →
            </Link>
          </div>
        </div>

        {/* Freebies Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <Gift className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5">
              <p className="text-gray-500">This Month's Freebies</p>
              <h3 className="text-3xl font-semibold">{stats.currentMonthFreebies}</h3>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/freebies"
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              View all freebies →
            </Link>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-amber-100 p-3 rounded-full">
              <Package className="h-8 w-8 text-amber-600" />
            </div>
            <div className="ml-5">
              <p className="text-gray-500">Total Products</p>
              <h3 className="text-3xl font-semibold">{stats.totalProducts}</h3>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/products"
              className="text-amber-600 hover:text-amber-800 text-sm font-medium"
            >
              View all products →
            </Link>
          </div>
        </div>

        {/* Low Stock Products Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-5">
              <p className="text-gray-500">Low Stock Products</p>
              <h3 className="text-3xl font-semibold">{stats.lowStockProducts}</h3>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/products?filter=lowStock"
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              View low stock products →
            </Link>
          </div>
        </div>

        {/* Available Freebies Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-3 rounded-full">
              <Gift className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-5">
              <p className="text-gray-500">Available Freebies</p>
              <h3 className="text-3xl font-semibold">{stats.totalFreebiesAvailable}</h3>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/freebies"
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              View available freebies →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/customers/new"
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md text-center font-medium"
          >
            Add New Customer
          </Link>
          <Link 
            href="/purchases/new"
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md text-center font-medium"
          >
            Record Purchase
          </Link>
          <Link 
            href="/products/new"
            className="bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-md text-center font-medium"
          >
            Add New Product
          </Link>
        </div>
      </div>
    </div>
  );
}