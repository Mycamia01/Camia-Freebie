// app/products/ProductForm.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import productService from "../../../lib/services/productService";
import { Save, ArrowLeft } from "lucide-react";

export default function ProductForm({ productId }) {
  const router = useRouter();
  const isEditing = !!productId;

  const [formData, setFormData] = useState({
    name: "",
    variant: "",
    price: "",
    qty: "",
    category: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Load product data if editing
  useEffect(() => {
    if (isEditing) {
      const loadProduct = async () => {
        try {
          setLoading(true);
          const product = await productService.getById(productId);
          if (product) {
            setFormData({
              ...product,
              price: product.price.toString(),
              qty: product.qty.toString(),
              category: product.category || ""
            });
          } else {
            setError("Product not found");
          }
        } catch (err) {
          setError("Failed to load product: " + err.message);
        } finally {
          setLoading(false);
        }
      };

      loadProduct();
    }
  }, [productId, isEditing]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Convert string values to appropriate types
      const formattedData = {
        ...formData,
        price: parseFloat(formData.price),
        qty: parseInt(formData.qty, 10),
      };

      if (isNaN(formattedData.price) || formattedData.price < 0) {
        throw new Error("Price must be a valid positive number");
      }

      if (isNaN(formattedData.qty) || formattedData.qty < 0) {
        throw new Error("Quantity must be a valid positive number");
      }

      if (!formattedData.category.trim()) {
        throw new Error("Category is required");
      }

      if (isEditing) {
        await productService.update(productId, formattedData);
      } else {
        await productService.create(formattedData);
      }

      setSuccess(true);

      // Redirect after short delay to show success message
      setTimeout(() => {
        router.push("/products");
      }, 1500);
    } catch (err) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.push("/products")}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Products
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? "Edit Product" : "Add New Product"}
        </h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
            <p className="font-bold">Success</p>
            <p>Product {isEditing ? "updated" : "created"} successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Product Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Variant */}
            <div className="md:col-span-2">
              <label htmlFor="variant" className="block text-sm font-medium text-gray-700 mb-1">
                Variant
              </label>
              <input
                type="text"
                id="variant"
                name="variant"
                value={formData.variant}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
<div className="md:col-span-2">
  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
    Category *
  </label>
  <select
    id="category"
    name="category"
    value={formData.category}
    onChange={handleChange}
    required
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="" disabled>Select a category</option>
    <option value="Handmade Organic Soaps">Handmade Organic Soaps</option>
    <option value="Cold Pressed Extra Virgin Oils">Cold Pressed Extra Virgin Oils</option>
    <option value="Essential Oils">Essential Oils</option>
    <option value="Natural Lip Balms">Natural Lip Balms</option>
    <option value="Skincare">Skincare</option>
    <option value="Shop By Benefits">Shop By Benefits</option>
    <option value="Gift Set Boxes">Gift Set Boxes</option>
  </select>
</div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="qty" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                id="qty"
                name="qty"
                value={formData.qty}
                onChange={handleChange}
                required
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading && (
                <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
              )}
              <Save size={18} className="mr-2" />
              {isEditing ? "Update Product" : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
