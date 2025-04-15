// context/AuthContext.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { subscribeToAuthChanges, signIn, signOut, resetPassword } from "../lib/services/authService";

// Create the auth context
const AuthContext = createContext();

/**
 * Auth context provider component
 * @param {object} props - Component props
 * @returns {JSX.Element} Auth context provider
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   */
  const login = async (email, password) => {
    try {
      setError(null);
      await signIn(email, password);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Sign out the current user
   */
  const logout = async () => {
    try {
      setError(null);
      await signOut();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Reset password for a user
   * @param {string} email - User email
   */
  const forgotPassword = async (email) => {
    try {
      setError(null);
      await resetPassword(email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    forgotPassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use the auth context
 * @returns {object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};