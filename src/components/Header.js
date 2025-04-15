// src/components/Header.js
"use client";

export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-lg font-bold">CAMIA Freebie</h1>
        <nav>
          <ul className="flex space-x-6">
            <li><a href="/" className="hover:underline px-3 py-1">Home</a></li>
            <li><a href="/products" className="hover:underline px-3 py-1">Products</a></li>
            <li><a href="/customers" className="hover:underline px-3 py-1">Customers</a></li>
            <li><a href="/dashboard" className="hover:underline px-3 py-1">Dashboard</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
