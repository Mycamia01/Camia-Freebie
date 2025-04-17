// app/customers/CustomerForm.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import customerService from "../../lib/services/customerService";
import { Save, ArrowLeft } from "lucide-react";

export default function CustomerForm({ customerId }) {
  const router = useRouter();
  const isEditing = !!customerId;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    pincode: "",
    dob: "",
    anniversary: "",
    skinType: "",
    hairType: "",
    forOwnConsumption: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Load customer data if editing
  useEffect(() => {
    if (isEditing) {
      const loadCustomer = async () => {
        try {
          setLoading(true);
          const customer = await customerService.getById(customerId);
          if (customer) {
            // Format dates for form inputs if they exist
            const formattedCustomer = {
              ...customer,
              dob: formatDateForInput(customer.dob),
              anniversary: formatDateForInput(customer.anniversary)
            };
            setFormData(formattedCustomer);
          } else {
            setError("Customer not found");
          }
        } catch (err) {
          setError("Failed to load customer: " + err.message);
        } finally {
          setLoading(false);
        }
      };

      loadCustomer();
    }
  }, [customerId, isEditing]);

  // Format date for input
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    
    let date;
    if (typeof dateValue === 'object' && dateValue.toDate) {
      // Firestore Timestamp
      date = dateValue.toDate();
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      // String date
      date = new Date(dateValue);
    }
    
    if (isNaN(date.getTime())) return "";
    
    return date.toISOString().split('T')[0];
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      if (isEditing) {
        await customerService.update(customerId, formData);
      } else {
        await customerService.create(formData);
      }
      
      setSuccess(true);
      
      // Redirect after short delay to show success message
      setTimeout(() => {
        router.push("/customers");
      }, 1500);
    } catch (err) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} customer: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading customer data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.push("/customers")}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Customers
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? "Edit Customer" : "Add New Customer"}
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
            <p>Customer {isEditing ? "updated" : "created"} successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Pincode */}
            <div>
              <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                Pincode *
              </label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
                pattern="[0-9]+"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Anniversary */}
            <div>
              <label htmlFor="anniversary" className="block text-sm font-medium text-gray-700 mb-1">
                Anniversary
              </label>
              <input
                type="date"
                id="anniversary"
                name="anniversary"
                value={formData.anniversary}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Skin Type */}
            <div>
              <label htmlFor="skinType" className="block text-sm font-medium text-gray-700 mb-1">
                Skin Type
              </label>
              <select
                id="skinType"
                name="skinType"
                value={formData.skinType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Skin Type</option>
                <option value="Normal">Normal</option>
                <option value="Dry">Dry</option>
                <option value="Oily">Oily</option>
                <option value="Combination">Combination</option>
                <option value="Sensitive">Sensitive</option>
              </select>
            </div>

            {/* Hair Type */}
            <div>
              <label htmlFor="hairType" className="block text-sm font-medium text-gray-700 mb-1">
                Hair Type
              </label>
              <select
                id="hairType"
                name="hairType"
                value={formData.hairType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Hair Type</option>
                <option value="Straight">Straight</option>
                <option value="Wavy">Wavy</option>
                <option value="Curly">Curly</option>
                <option value="Coily">Coily</option>
                <option value="Fine">Fine</option>
                <option value="Medium">Medium</option>
                <option value="Thick">Thick</option>
              </select>
            </div>

            {/* product name */}
            <div>
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

            {/* For Own Consumption */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="forOwnConsumption"
                  name="forOwnConsumption"
                  checked={formData.forOwnConsumption}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="forOwnConsumption" className="ml-2 block text-sm text-gray-700">
                  For own consumption (unchecked means for family)
                </label>
              </div>
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
              {isEditing ? "Update Customer" : "Save Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}