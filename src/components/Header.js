"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "../lib/services/authService";

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await signOut();
    await logout();
    router.push("/");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  if (!mounted) return null;

  return (
    <>
      <header className="bg-indigo-900 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-lg font-bold">CAMIA Freebie</h1>
          <nav>
            <ul className="flex space-x-6 items-center">
              {/* Show Home button only on login page */}
              {pathname === "/login" && (
                <li>
                  <button
                    onClick={() => router.push("/")}
                    className="hover:underline px-3 py-1"
                  >
                    Home
                  </button>
                </li>
              )}

              <li>
                <a href="/dashboard" className="hover:underline px-3 py-1">
                  Dashboard
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

              {/* Show logout only if logged in */}
              {isAuthenticated && (
                <li>
                  <button
                    onClick={handleLogoutClick}
                    className="hover:underline px-3 py-1 flex items-center space-x-1"
                    aria-label="Logout"
                  >
                    <span>Logout</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
                      />
                    </svg>
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-gray-900">
            <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
            <p className="mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
