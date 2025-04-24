"use client";

import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

import productService from "../../lib/services/productService";
import freebieService from "../../lib/services/freebieService";
import customerService from "../../lib/services/customerService";
import purchaseService from "../../lib/services/purchaseService";

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AnalyticsPage() {
  const [products, setProducts] = useState([]);
  const [freebies, setFreebies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const LOW_STOCK_THRESHOLD = 10;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [productsData, freebiesData, customersData, purchasesData] = await Promise.all([
          productService.getAll(),
          freebieService.getAll(),
          customerService.getAll(),
          purchaseService.getAll(),
        ]);
        setProducts(productsData);
        setFreebies(freebiesData);
        setCustomers(customersData);
        setPurchases(purchasesData);
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const lowStockProducts = products.filter((p) => p.qty <= LOW_STOCK_THRESHOLD);
  const lowStockFreebies = freebies.filter((f) => f.availableQty <= LOW_STOCK_THRESHOLD);

  const customerIdsWithPurchases = new Set(purchases.map((p) => p.customerId));
  const stockOutCustomers = customers.filter((c) => !customerIdsWithPurchases.has(c.id));

  const productSoldCount = {};
  const freebieSoldCount = {};

  purchases.forEach((purchase) => {
    if (purchase.products) {
      purchase.products.forEach((item) => {
        productSoldCount[item.productId] = (productSoldCount[item.productId] || 0) + item.qty;
      });
    }
    if (purchase.freebieId) {
      freebieSoldCount[purchase.freebieId] = (freebieSoldCount[purchase.freebieId] || 0) + 1;
    }
  });

  const productRemainingStock = products.map((product) => {
    const sold = productSoldCount[product.id] || 0;
    return {
      ...product,
      remainingQty: product.qty - sold,
      qtySold: sold,
    };
  });

  const freebieRemainingStock = freebies.map((freebie) => {
    const sold = freebieSoldCount[freebie.id] || 0;
    return {
      ...freebie,
      remainingQty: freebie.availableQty - sold,
      qtySold: sold,
    };
  });

  const fastMovingProducts = [...productRemainingStock]
    .sort((a, b) => b.qtySold - a.qtySold)
    .slice(0, 5);

  const fastMovingFreebies = [...freebieRemainingStock]
    .sort((a, b) => b.qtySold - a.qtySold)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const lowStockProductChartData = {
    labels: lowStockProducts.map((p) => p.name),
    datasets: [
      {
        label: "Quantity",
        data: lowStockProducts.map((p) => p.qty),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  const lowStockFreebieChartData = {
    labels: lowStockFreebies.map((f) => f.name),
    datasets: [
      {
        label: "Available Quantity",
        data: lowStockFreebies.map((f) => f.availableQty),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  const fastMovingProductChartData = {
    labels: fastMovingProducts.map((p) => p.name),
    datasets: [
      {
        label: "Quantity Sold",
        data: fastMovingProducts.map((p) => p.qtySold),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  const fastMovingFreebieChartData = {
    labels: fastMovingFreebies.map((f) => f.name),
    datasets: [
      {
        label: "Quantity Sold",
        data: fastMovingFreebies.map((f) => f.qtySold),
        backgroundColor: "rgba(153, 102, 255, 0.5)",
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Stock Analytics</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Low Stock Products Chart</h2>
        {lowStockProducts.length === 0 ? (
          <p>No low stock products.</p>
        ) : (
          <Bar data={lowStockProductChartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Low Stock Freebies Chart</h2>
        {lowStockFreebies.length === 0 ? (
          <p>No low stock freebies.</p>
        ) : (
          <Bar data={lowStockFreebieChartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Top 5 Fast Moving Products Chart</h2>
        {fastMovingProducts.length === 0 ? (
          <p>No fast moving products data.</p>
        ) : (
          <Bar data={fastMovingProductChartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Top 5 Fast Moving Freebies Chart</h2>
        {fastMovingFreebies.length === 0 ? (
          <p>No fast moving freebies data.</p>
        ) : (
          <Bar data={fastMovingFreebieChartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
        )}
      </section>
    </div>
  );
}
