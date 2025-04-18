"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import freebieService from "../../../lib/services/freebieService";
import productService from "../../../lib/services/productService";

export default function FreebieForm() {
  const router = useRouter();
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    blend: [],
    value: "",
    availableQty: "",
  });

  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const allProducts = await productService.getAll();
        setProducts(allProducts);
      } catch (error) {
        console.error("Failed to load products for blend selection", error);
      }
    }
    fetchProducts();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Name must be at most 100 characters";
    }
    if (formData.value !== "" && (isNaN(formData.value) || Number(formData.value) < 0)) {
      newErrors.value = "Value must be a non-negative number";
    }
    if (formData.availableQty === "") {
      newErrors.availableQty = "Available Quantity is required";
    } else if (isNaN(formData.availableQty) || Number(formData.availableQty) < 0) {
      newErrors.availableQty = "Available Quantity must be a non-negative number";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleBlend = (productId) => {
    let newBlend = [...formData.blend];
    if (newBlend.includes(productId)) {
      newBlend = newBlend.filter((id) => id !== productId);
    } else {
      newBlend.push(productId);
    }
    setFormData((prev) => ({
      ...prev,
      blend: newBlend,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      await freebieService.create({
        name: formData.name.trim(),
        blend: formData.blend, // now contains product IDs
        value: formData.value === "" ? undefined : Number(formData.value),
        availableQty: Number(formData.availableQty),
      });
      router.push("/freebies");
    } catch (error) {
      console.error("Error creating freebie:", error);
      setSubmitError("Failed to create freebie. Please try again.");
      setSubmitting(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">Add New Freebie</h1>
      <form onSubmit={handleSubmit} noValidate>
        {/* Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block font-semibold mb-1">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            maxLength={100}
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            disabled={submitting}
          />
          {errors.name && <p className="text-red-600 mt-1 text-sm">{errors.name}</p>}
        </div>

        {/* Blend Dropdown */}
        <div className="mb-4" ref={dropdownRef}>
          <label htmlFor="blend" className="block font-semibold mb-1">
            Blend (Select products)
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-left bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={submitting}
            >
              {formData.blend.length === 0
                ? "Select the product blend"
                : products
                    .filter((p) => formData.blend.includes(p.id))
                    .map((p) => p.name)
                    .join(", ")}
            </button>
            {dropdownOpen && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-md max-h-60 overflow-y-auto">
                {products.map((product) => (
                  <label
                    key={product.id}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={product.id}
                      checked={formData.blend.includes(product.id)}
                      onChange={() => toggleBlend(product.id)}
                      className="mr-2"
                      disabled={submitting}
                    />
                    {product.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Value */}
        <div className="mb-4">
          <label htmlFor="value" className="block font-semibold mb-1">
            Value
          </label>
          <input
            type="number"
            id="value"
            name="value"
            min="0"
            step="any"
            value={formData.value}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.value ? "border-red-500" : "border-gray-300"
            }`}
            disabled={submitting}
          />
          {errors.value && <p className="text-red-600 mt-1 text-sm">{errors.value}</p>}
        </div>

        {/* Available Quantity */}
        <div className="mb-6">
          <label htmlFor="availableQty" className="block font-semibold mb-1">
            Available Quantity <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            id="availableQty"
            name="availableQty"
            min="0"
            value={formData.availableQty}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.availableQty ? "border-red-500" : "border-gray-300"
            }`}
            disabled={submitting}
          />
          {errors.availableQty && <p className="text-red-600 mt-1 text-sm">{errors.availableQty}</p>}
        </div>

        {/* Submit error */}
        {submitError && <p className="text-red-600 mb-4">{submitError}</p>}

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-semibold transition disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Add Freebie"}
        </button>
      </form>
    </div>
  );
}
