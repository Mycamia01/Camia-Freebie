// src/components/Header.js
"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoginClick = () => {
    router.push("/login");
  };

  const handleLogoutClick = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="bg-indigo-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-lg font-bold">CAMIA Freebie</h1>
        <nav>
          <ul className="flex space-x-6 items-center">
            <li>
              <a href="/" className="hover:underline px-3 py-1">
                Home
              </a>
            </li>
            <li>
              <a href="/products" className="hover:underline px-3 py-1">
                Products
              </a>
            </li>
            <li>
              <a href="/customers" className="hover:underline px-3 py-1">
                Customers
              </a>
            </li>
            <li>
              <a href="/dashboard" className="hover:underline px-3 py-1">
                Dashboard
              </a>
            </li>
            <li>
              {mounted && (
                !isAuthenticated ? (
                  <button
                    onClick={handleLoginClick}
                    className="hover:underline px-3 py-1 bg-gray-700 rounded"
                    aria-label="Login"
                  >
                    Login
                  </button>
                ) : (
                  <button
                    onClick={handleLogoutClick}
                    className="hover:underline px-3 py-1 bg-gray-700 rounded"
                    aria-label="Logout"
                  >
                    Logout
                  </button>
                )
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
