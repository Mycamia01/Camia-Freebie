"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import customerService from "../../lib/services/customerService";
import { Search, Plus, Edit, Trash2, RefreshCw } from "lucide-react";

export default function CustomerList() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  // Toggle customer selection
  const toggleCustomerSelection = (customerId) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(customerId) ? prev.filter((id) => id !== customerId) : [...prev, customerId]
    );
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerService.getAll();
      setCustomers(data);
      setSelectedCustomerIds([]);
    } catch (err) {
      setError("Failed to load customers: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCustomers();
    }
  }, [user]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadCustomers();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await customerService.searchByName(searchTerm);
      setCustomers(results);
    } catch (err) {
      setError("Search failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInputChange = (e) => setSearchTerm(e.target.value);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const confirmDelete = (customer) => {
    setCustomerToDelete(customer);
    setIsDeleting(true);
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;
    try {
      setLoading(true);
      await customerService.delete(customerToDelete.id);
      setCustomers((prev) => prev.filter((c) => c.id !== customerToDelete.id));
      setIsDeleting(false);
      setCustomerToDelete(null);
      setSelectedCustomerIds((prev) => prev.filter(id => id !== customerToDelete.id));
    } catch (err) {
      setError("Delete failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleting(false);
    setCustomerToDelete(null);
  };

  const openBulkDeleteConfirm = () => setIsBulkDeleteConfirmOpen(true);
  const closeBulkDeleteConfirm = () => setIsBulkDeleteConfirmOpen(false);

  const handleBulkDelete = async () => {
    if (selectedCustomerIds.length === 0) return;
    try {
      setLoading(true);
      await Promise.all(selectedCustomerIds.map(id => customerService.delete(id)));
      setCustomers((prev) => prev.filter(c => !selectedCustomerIds.includes(c.id)));
      setSelectedCustomerIds([]);
      closeBulkDeleteConfirm();
    } catch (err) {
      setError("Bulk delete failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (loading && customers.length === 0)) {
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
        <h1 className="text-3xl font-bold">Customers</h1>
        <div className="flex space-x-2">
          <button
            onClick={loadCustomers}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <Link
            href="/customers/new"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus size={16} />
            <span>Add Customer</span>
          </Link>
        </div>
      </div>

      {selectedCustomerIds.length > 0 && (
        <div className="mb-4">
          <button
            onClick={openBulkDeleteConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete All ({selectedCustomerIds.length})
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Search Form */}
      <div className="mb-6">
        <form onSubmit={handleSearchSubmit} className="flex items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchInputChange}
              placeholder="Search customers by name..."
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="absolute inset-y-0 right-0 px-3 flex items-center">
              <Search size={20} className="text-gray-500" />
            </button>
          </div>
        </form>
      </div>

      {/* Customers Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelectedCustomerIds(e.target.checked ? customers.map(c => c.id) : [])
                  }
                  checked={selectedCustomerIds.length === customers.length && customers.length > 0}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pincode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skin Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hair Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCustomerIds.includes(customer.id)}
                      onChange={() => toggleCustomerSelection(customer.id)}
                    />
                  </td>
                  <td className="px-6 py-4">{customer.firstName} {customer.lastName}</td>
                  <td className="px-6 py-4">{customer.pincode}</td>
                  <td className="px-6 py-4">{customer.skinType || "—"}</td>
                  <td className="px-6 py-4">{customer.hairType || "—"}</td>
                  <td className="px-6 py-4">{customer.forOwnConsumption ? "Self" : "Family"}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Link href={`/customers/${customer.id}`} className="text-blue-600 hover:text-blue-900">
                        <Edit size={18} />
                      </Link>
                      <button onClick={() => confirmDelete(customer)} className="text-red-600 hover:text-red-900">
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
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete all selected customers? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={closeBulkDeleteConfirm} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                Cancel
              </button>
              <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Delete Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {customerToDelete?.firstName} {customerToDelete?.lastName}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={cancelDelete} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
