"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import purchaseService from "../../../lib/services/purchaseService";
import productService from "../../../lib/services/productService";
import freebieService from "../../../lib/services/freebieService";
import customerService from "../../../lib/services/customerService";

export default function EditPurchasePage() {
  const router = useRouter();
  const params = useParams();
  const purchaseId = params.id;

  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    hairType: "",
    skinType: "",
    address: {
      pincode: "",
      city: "",
      state: "",
    },
  });

  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [freebies, setFreebies] = useState([]);
  const [selectedFreebieId, setSelectedFreebieId] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [purchase, allProducts, allFreebies] = await Promise.all([
          purchaseService.getById(purchaseId),
          productService.getAll(),
          freebieService.getAll(),
        ]);
        setCustomer(purchase.customer || {});
        setProducts(allProducts);
        setFreebies(allFreebies);
        setSelectedProducts(purchase.products || []);
        setSelectedFreebieId(purchase.freebieId || "");
        setPurchaseDate(
          purchase.purchaseDate
            ? new Date(purchase.purchaseDate).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10)
        );
        setLoading(false);
      } catch (err) {
        setError("Failed to load purchase data: " + err.message);
        setLoading(false);
      }
    }
    fetchData();
  }, [purchaseId]);

  useEffect(() => {
    const total = selectedProducts.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? sum + product.price * item.qty : sum;
    }, 0);
    setTotalAmount(total);
  }, [selectedProducts, products]);

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setCustomer((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setCustomer((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts((prev) =>
      prev.find((item) => item.productId === productId)
        ? prev.filter((item) => item.productId !== productId)
        : [...prev, { productId, qty: 1 }]
    );
  };

  const handleProductQtyChange = (productId, qty) => {
    setSelectedProducts((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, qty: Number(qty) } : item
      )
    );
  };

  const handleFreebieChange = (e) => {
    setSelectedFreebieId(e.target.value);
  };

  const validatePhone = (phone) => /^\+?[0-9]{7,15}$/.test(phone.trim());
  const validatePincode = (pincode) => /^\d{5,10}$/.test(pincode.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedPhone = customer.phone.trim();
    const trimmedPincode = customer.address.pincode.trim();

    if (!validatePhone(trimmedPhone)) {
      setError("Phone number must be valid and contain 7 to 15 digits");
      return;
    }

    if (!validatePincode(trimmedPincode)) {
      setError("Pincode must contain only numbers and be 5 to 10 digits long");
      return;
    }

    if (!customer.firstName || !customer.lastName || !trimmedPhone || !customer.email) {
      setError("Please fill in all required customer details.");
      return;
    }

    if (selectedProducts.length === 0) {
      setError("Please select at least one product with quantity.");
      return;
    }

    setLoading(true);
    try {
      const enrichedProducts = selectedProducts.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          productId: item.productId,
          qty: item.qty,
          price: product ? product.price : 0,
        };
      });

      const purchaseData = {
        customer: {
          ...customer,
          phone: trimmedPhone,
          address: {
            ...customer.address,
            pincode: trimmedPincode,
          },
        },
        products: enrichedProducts,
        freebieId: selectedFreebieId || null,
        totalAmount,
        purchaseDate: new Date(purchaseDate),
      };

      await purchaseService.updatePurchase(purchaseId, purchaseData);
      router.push("/purchases");
    } catch (err) {
      setError("Failed to update purchase: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-24 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Edit Purchase</h1>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset className="border p-4 rounded">
          <legend className="font-semibold mb-2">Customer Details</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="firstName" placeholder="First Name *" value={customer.firstName} onChange={handleCustomerChange} required className="border p-2 rounded w-full" />
            <input type="text" name="lastName" placeholder="Last Name *" value={customer.lastName} onChange={handleCustomerChange} required className="border p-2 rounded w-full" />
            <input type="text" name="phone" placeholder="Phone Number *" value={customer.phone} onChange={handleCustomerChange} required className="border p-2 rounded w-full" />
            <input type="email" name="email" placeholder="Email *" value={customer.email} onChange={handleCustomerChange} required className="border p-2 rounded w-full" />
            <input type="text" name="hairType" placeholder="Hair Type" value={customer.hairType} onChange={handleCustomerChange} className="border p-2 rounded w-full" />
            <input type="text" name="skinType" placeholder="Skin Type" value={customer.skinType} onChange={handleCustomerChange} className="border p-2 rounded w-full" />
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Address</h3>
            <input type="text" name="address.pincode" placeholder="Pincode *" value={customer.address.pincode} onChange={handleCustomerChange} required className="border p-2 rounded w-full mb-2" />
            <input type="text" name="address.city" placeholder="City" value={customer.address.city} onChange={handleCustomerChange} className="border p-2 rounded w-full mb-2" />
            <input type="text" name="address.state" placeholder="State" value={customer.address.state} onChange={handleCustomerChange} className="border p-2 rounded w-full mb-2" />
          </div>
        </fieldset>

        <fieldset className="border p-4 rounded">
          <legend className="font-semibold mb-2">Purchased Products</legend>
          <div className="relative">
            <button
              type="button"
              onClick={() => setProductDropdownOpen(!productDropdownOpen)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-left bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={loading}
            >
              {selectedProducts.length === 0
                ? "Select products"
                : selectedProducts
                    .map((item) => {
                      const product = products.find((p) => p.id === item.productId);
                      return product ? product.name : "Unknown";
                    })
                    .join(", ")}
            </button>
            {productDropdownOpen && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-md max-h-60 overflow-y-auto">
                {products.map((product) => (
                  <label key={product.id} className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <input
                      type="checkbox"
                      value={product.id}
                      checked={selectedProducts.some((item) => item.productId === product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                      className="mr-2"
                      disabled={loading}
                    />
                    {product.name}
                    {selectedProducts.some((item) => item.productId === product.id) && (
                      <input
                        type="number"
                        min="1"
                        max={product.qty}
                        value={selectedProducts.find((item) => item.productId === product.id)?.qty || 1}
                        onChange={(e) => handleProductQtyChange(product.id, e.target.value)}
                        className="ml-4 w-16 border p-1 rounded"
                        disabled={loading}
                      />
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        </fieldset>

        <fieldset className="border p-4 rounded">
          <legend className="font-semibold mb-2">Select Freebie</legend>
          <select
            value={selectedFreebieId}
            onChange={handleFreebieChange}
            className="border p-2 rounded w-full"
            disabled={loading}
          >
            <option value="">-- No Freebie --</option>
            {freebies.map((freebie) => (
              <option key={freebie.id} value={freebie.id}>
                {freebie.name}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset className="border p-4 rounded">
          <legend className="font-semibold mb-2">Purchase Date</legend>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="border p-2 rounded w-full"
            disabled={loading}
          />
        </fieldset>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold"
          >
            {loading ? "Saving..." : "Update Purchase"}
          </button>
        </div>
      </form>
    </div>
  );
}
