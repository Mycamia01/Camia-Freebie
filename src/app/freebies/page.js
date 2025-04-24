"use client";

import { useState, useEffect } from "react";
import freebieService from "../../lib/services/freebieService";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import productService from "../../lib/services/productService";

export default function FreebiesPage() {
  const [freebies, setFreebies] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFreebies, setFilteredFreebies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [freebieToDelete, setFreebieToDelete] = useState(null);
  const [selectedFreebieIds, setSelectedFreebieIds] = useState([]);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [allFreebies, allProducts] = await Promise.all([
          freebieService.getAll(),
          productService.getAll(),
        ]);
        setFreebies(allFreebies);
        setProducts(allProducts);
        setFilteredFreebies(allFreebies);
      } catch (err) {
        setError("Failed to load freebies.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredFreebies(freebies);
    } else {
      const filtered = freebies.filter((freebie) =>
        freebie.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFreebies(filtered);
    }
  }, [searchTerm, freebies]);

  const toggleFreebieSelection = (freebieId) => {
    setSelectedFreebieIds((prev) =>
      prev.includes(freebieId) ? prev.filter((id) => id !== freebieId) : [...prev, freebieId]
    );
  };

  const confirmDelete = (freebie) => {
    setFreebieToDelete(freebie);
    setIsDeleting(true);
  };

  const handleDelete = async () => {
    if (!freebieToDelete) return;
    try {
      setLoading(true);
      await freebieService.delete(freebieToDelete.id);
      setFreebies((prev) => prev.filter((f) => f.id !== freebieToDelete.id));
      setFilteredFreebies((prev) => prev.filter((f) => f.id !== freebieToDelete.id));
      setSelectedFreebieIds((prev) => prev.filter((id) => id !== freebieToDelete.id));
      setIsDeleting(false);
      setFreebieToDelete(null);
    } catch {
      alert("Failed to delete freebie. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleting(false);
    setFreebieToDelete(null);
  };

  const openBulkDeleteConfirm = () => setIsBulkDeleteConfirmOpen(true);
  const closeBulkDeleteConfirm = () => setIsBulkDeleteConfirmOpen(false);

  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      await Promise.all(selectedFreebieIds.map(id => freebieService.delete(id)));
      setFreebies(freebies.filter(f => !selectedFreebieIds.includes(f.id)));
      setFilteredFreebies(filteredFreebies.filter(f => !selectedFreebieIds.includes(f.id)));
      setSelectedFreebieIds([]);
      closeBulkDeleteConfirm();
    } catch {
      alert("Bulk delete failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getProductNameById = (id) => {
    const product = products.find((p) => p.id === id);
    return product ? product.name : id;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-700">Freebies</h1>
        <Link
          href="/freebies/new"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-semibold transition"
        >
          Add New Freebie
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search freebies by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {selectedFreebieIds.length > 0 && (
        <div className="mb-4">
          <button
            onClick={openBulkDeleteConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Delete All ({selectedFreebieIds.length})
          </button>
        </div>
      )}

      <div className="overflow-x-auto border border-gray-200 rounded-md shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-purple-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFreebieIds(filteredFreebies.map(f => f.id));
                    } else {
                      setSelectedFreebieIds([]);
                    }
                  }}
                  checked={selectedFreebieIds.length === filteredFreebies.length && filteredFreebies.length > 0}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Blend</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Available Qty</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-purple-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFreebies.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No freebies found.
                </td>
              </tr>
            ) : (
              filteredFreebies.map((freebie) => (
                <tr key={freebie.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedFreebieIds.includes(freebie.id)}
                      onChange={() => toggleFreebieSelection(freebie.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-900">
                    {freebie.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {freebie.blend && freebie.blend.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {freebie.blend.map((productId, index) => (
                          <li key={index}>{getProductNameById(productId)}</li>
                        ))}
                      </ul>
                    ) : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {freebie.value !== undefined ? freebie.value : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {freebie.availableQty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link href={`/freebies/edit/${freebie.id}`} className="text-indigo-600 hover:text-indigo-900">
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => confirmDelete(freebie)}
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

      {/* Single Delete Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{freebieToDelete?.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {isBulkDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Bulk Delete</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete all selected freebies? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeBulkDeleteConfirm}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
