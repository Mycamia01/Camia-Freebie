"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import purchaseService from "../../lib/services/purchaseService";
import customerService from "../../lib/services/customerService";
import productService from "../../lib/services/productService";
import freebieService from "../../lib/services/freebieService";
import { Edit, Trash2, Search, RefreshCw, Plus } from "lucide-react";

export default function PurchaseListPage() {
  const router = useRouter();

  const [purchases, setPurchases] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [freebies, setFreebies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);
  const [selectedPurchaseIds, setSelectedPurchaseIds] = useState([]);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const [allPurchases, allCustomers, allProducts, allFreebies] = await Promise.all([
        purchaseService.getAll(),
        customerService.getAll(),
        productService.getAll(),
        freebieService.getAll(),
      ]);
      setPurchases(allPurchases);
      setCustomers(allCustomers);
      setProducts(allProducts);
      setFreebies(allFreebies);
      setLoading(false);
    } catch (err) {
      setError("Failed to load data: " + err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : "Unknown";
  };

  const getProductNames = (productsInPurchase) => {
    if (!productsInPurchase || productsInPurchase.length === 0) return "-";
    return (
      <ul className="list-disc list-inside space-y-1">
        {productsInPurchase.map((item, index) => {
          const product = products.find((p) => p.id === item.productId);
          return (
            <li key={index}>
              {product ? `${product.name} (x${item.qty})` : "Unknown"}
            </li>
          );
        })}
      </ul>
    );
  };

  const getFreebieName = (freebieId) => {
    const freebie = freebies.find((f) => f.id === freebieId);
    return freebie ? freebie.name : "-";
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = date.toDate ? date.toDate() : new Date(date);
    return isNaN(d) ? "-" : d.toLocaleDateString();
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleFilterMonthChange = (e) => setFilterMonth(e.target.value);
  const handleFilterDayChange = (e) => setFilterDay(e.target.value);

  const filteredPurchases = purchases.filter((purchase) => {
    const search = searchTerm.toLowerCase();
    const customerName = getCustomerName(purchase.customerId).toLowerCase();
    const productNames = getProductNames(purchase.products).props?.children
      ?.map(li => li.props.children.toString().toLowerCase())
      ?.join(", ") || "";
    const freebieName = getFreebieName(purchase.freebieId).toLowerCase();

    if (
      !customerName.includes(search) &&
      !productNames.includes(search) &&
      !freebieName.includes(search)
    ) return false;

    const purchaseDate = purchase.purchaseDate?.toDate
      ? purchase.purchaseDate.toDate()
      : new Date(purchase.purchaseDate);

    if (filterMonth && purchaseDate.getMonth() + 1 !== Number(filterMonth)) return false;
    if (filterDay && purchaseDate.getDate() !== Number(filterDay)) return false;

    return true;
  });

  const togglePurchaseSelection = (purchaseId) => {
    setSelectedPurchaseIds((prev) =>
      prev.includes(purchaseId)
        ? prev.filter((id) => id !== purchaseId)
        : [...prev, purchaseId]
    );
  };

  const confirmDelete = (purchase) => {
    setPurchaseToDelete(purchase);
    setIsDeleting(true);
  };

  const handleDelete = async () => {
    if (!purchaseToDelete) return;
    try {
      setLoading(true);
      await purchaseService.delete(purchaseToDelete.id);
      setPurchases(purchases.filter((p) => p.id !== purchaseToDelete.id));
      setIsDeleting(false);
      setPurchaseToDelete(null);
    } catch (err) {
      setError("Failed to delete purchase: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleting(false);
    setPurchaseToDelete(null);
  };

  const openBulkDeleteConfirm = () => setIsBulkDeleteConfirmOpen(true);
  const closeBulkDeleteConfirm = () => setIsBulkDeleteConfirmOpen(false);

  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      await Promise.all(selectedPurchaseIds.map(id => purchaseService.delete(id)));
      setPurchases(purchases.filter(p => !selectedPurchaseIds.includes(p.id)));
      setSelectedPurchaseIds([]);
      setIsBulkDeleteConfirmOpen(false);
    } catch (err) {
      setError("Bulk delete failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Purchases</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="flex space-x-2 justify-end mb-6">
        <button
          onClick={loadPurchases}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
        <button
          onClick={() => router.push("/purchases/new")}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>Add Purchase</span>
        </button>
      </div>

      {selectedPurchaseIds.length > 0 && (
        <div className="mb-4">
          <button
            onClick={openBulkDeleteConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Delete All ({selectedPurchaseIds.length})
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
        <input
          type="text"
          placeholder="Search by customer, product, or freebie"
          value={searchTerm}
          onChange={handleSearchChange}
          className="border p-2 rounded w-full md:w-1/3 mb-2 md:mb-0"
        />
        <select value={filterMonth} onChange={handleFilterMonthChange} className="border p-2 rounded w-full md:w-1/6 mb-2 md:mb-0">
          <option value="">All Months</option>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <select value={filterDay} onChange={handleFilterDayChange} className="border p-2 rounded w-full md:w-1/6">
          <option value="">All Days</option>
          {[...Array(31)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-md shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3"><input type="checkbox"
                onChange={(e) =>
                  setSelectedPurchaseIds(e.target.checked ? filteredPurchases.map(p => p.id) : [])
                }
                checked={selectedPurchaseIds.length === filteredPurchases.length && filteredPurchases.length > 0}
              /></th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Freebie</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPurchases.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center px-3 py-4 text-sm text-gray-500">No purchases found.</td>
              </tr>
            ) : (
              filteredPurchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4"><input
                    type="checkbox"
                    checked={selectedPurchaseIds.includes(purchase.id)}
                    onChange={() => togglePurchaseSelection(purchase.id)}
                  /></td>
                  <td className="px-3 py-4">{getCustomerName(purchase.customerId)}</td>
                  <td className="px-3 py-4">{getProductNames(purchase.products)}</td>
                  <td className="px-3 py-4">{getFreebieName(purchase.freebieId)}</td>
                  <td className="px-3 py-4">{formatDate(purchase.purchaseDate)}</td>
                  <td className="px-3 py-4">₹{purchase.totalAmount.toFixed(2)}</td>
                  <td className="px-3 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => router.push(`/purchases/${purchase.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => confirmDelete(purchase)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Delete Modal */}
      {isBulkDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Bulk Delete</h3>
            <p className="text-sm text-gray-500 mb-4">Are you sure you want to delete all selected purchases?</p>
            <div className="flex justify-end space-x-3">
              <button onClick={closeBulkDeleteConfirm} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
              <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete All</button>
            </div>
          </div>
        </div>
      )}

      {/* Single Delete Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-4">Are you sure you want to delete this purchase?</p>
            <div className="flex justify-end space-x-3">
              <button onClick={cancelDelete} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
