"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import freebieService from "../../../../lib/services/freebieService";
import productService from "../../../../lib/services/productService";

export default function FreebieEdit() {
  const router = useRouter();
  const params = useParams();
  const freebieId = params.id;

  const [formData, setFormData] = useState({
    name: "",
    blend: [],
    value: "",
    availableQty: "",
  });

  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [freebie, allProducts] = await Promise.all([
          freebieService.getById(freebieId),
          productService.getAll(),
        ]);
        if (!freebie) {
          alert("Freebie not found");
          router.push("/freebies");
          return;
        }
        setFormData({
          name: freebie.name || "",
          blend: freebie.blend || [],
          value: freebie.value !== undefined ? freebie.value : "",
          availableQty: freebie.availableQty !== undefined ? freebie.availableQty : "",
        });
        setProducts(allProducts);
        setLoading(false);
      } catch (error) {
        alert("Failed to load freebie data");
        router.push("/freebies");
      }
    }
    fetchData();
  }, [freebieId, router]);

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
    const { name, value, type, checked } = e.target;
    if (name === "blend") {
      let newBlend = [...formData.blend];
      if (checked) {
        newBlend.push(value);
      } else {
        newBlend = newBlend.filter((item) => item !== value);
      }
      setFormData((prev) => ({
        ...prev,
        blend: newBlend,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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
      await freebieService.update(freebieId, {
        name: formData.name.trim(),
        blend: formData.blend,
        value: formData.value === "" ? undefined : Number(formData.value),
        availableQty: Number(formData.availableQty),
      });
      router.push("/freebies");
    } catch (error) {
      setSubmitError("Failed to update freebie. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-purple-700">Loading freebie data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">Edit Freebie</h1>
      <form onSubmit={handleSubmit} noValidate>
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

        <div className="mb-4">
          <label htmlFor="blend" className="block font-semibold mb-1">Blend (Select products)</label>
          <select
            id="blend"
            name="blend"
            multiple
            value={formData.blend}
            onChange={(e) => {
              const options = e.target.options;
              const selected = [];
              for (let i = 0; i < options.length; i++) {
                if (options[i].selected) {
                  selected.push(options[i].value);
                }
              }
              setFormData((prev) => ({
                ...prev,
                blend: selected,
              }));
            }}
            disabled={submitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            size={Math.min(5, products.length)}
          >
            <option value="" disabled={true} hidden={formData.blend.length > 0}>
              select the product blend
            </option>
            {products.length === 0 ? (
              <option disabled>No products available</option>
            ) : (
              products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))
            )}
          </select>
        </div>

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

        {submitError && <p className="text-red-600 mb-4">{submitError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-semibold transition disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Update Freebie"}
        </button>
      </form>
    </div>
  );
}
