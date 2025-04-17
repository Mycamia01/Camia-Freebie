// Path: app/dashboard/add-product/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "../../../context/DashboardContext";
import { ArrowLeft, Plus } from "lucide-react";

export default function AddProductPage() {
  const router = useRouter();
  
  // State for form inputs
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    mrp: "",
    discountedPrice: "",
    quantityRemaining: ""
  });
  
  // State for products list (local storage without Firebase)
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Categories list
  const categories = [
    "Soaps", 
    "Lipcare", 
    "Skincare", 
    "Haircare", 
    "Essential Oils", 
    "Cold Pressed Oils", 
    "Shop-by-benefits"
  ];

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
    
    // Validate form
    if (!formData.category || !formData.productName || !formData.quantityRemaining) {
      setError("Please fill all required fields");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create a new product object
      const newProduct = {
        id: Date.now().toString(), // Create a unique ID
        productName: formData.productName,
        category: formData.category,
        quantityRemaining: Number(formData.quantityRemaining),
        mrp: formData.mrp ? Number(formData.mrp) : null,
        discountedPrice: formData.discountedPrice ? Number(formData.discountedPrice) : null,
        createdAt: new Date()
      };
      
      // Add the new product to the products array
      setProducts(prevProducts => [...prevProducts, newProduct]);
      
      // Reset form
      setFormData({
        productName: "",
        category: "",
        mrp: "",
        discountedPrice: "",
        quantityRemaining: ""
      });
      
      // Show success message
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      setError("Failed to add product: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Dashboard
        </button>
      </div>

      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p>Product added successfully!</p>
        </div>
      )}

      {/* Product Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div>
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
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Product Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Product Name */}
            <div className="md:col-span-2">
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* MRP */}
            <div>
              <label htmlFor="mrp" className="block text-sm font-medium text-gray-700 mb-1">
                MRP (₹)
              </label>
              <input
                type="number"
                id="mrp"
                name="mrp"
                value={formData.mrp}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Discounted Price */}
            <div>
              <label htmlFor="discountedPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Discount Price (₹)
              </label>
              <input
                type="number"
                id="discountedPrice"
                name="discountedPrice"
                value={formData.discountedPrice}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Quantity */}
            <div>
              <label htmlFor="quantityRemaining" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                id="quantityRemaining"
                name="quantityRemaining"
                value={formData.quantityRemaining}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
              ) : (
                <Plus size={18} className="mr-2" />
              )}
              Add Product
            </button>
          </div>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Products List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left border">Product Name</th>
                <th className="px-4 py-2 text-left border">Category</th>
                <th className="px-4 py-2 text-left border">MRP (₹)</th>
                <th className="px-4 py-2 text-left border">Discount (₹)</th>
                <th className="px-4 py-2 text-left border">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-2 text-center border">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-2 border">{product.productName}</td>
                    <td className="px-4 py-2 border">{product.category}</td>
                    <td className="px-4 py-2 border">{product.mrp || "-"}</td>
                    <td className="px-4 py-2 border">{product.discountedPrice || "-"}</td>
                    <td className="px-4 py-2 border">{product.quantityRemaining}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}