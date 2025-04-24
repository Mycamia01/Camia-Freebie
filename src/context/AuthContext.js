// context/AuthContext.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { subscribeToAuthChanges, signIn, signOut, resetPassword } from "../lib/services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user);
      setLoading(false);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      await signIn(email, password);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      await resetPassword(email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    forgotPassword,
    isAuthenticated: !!user,
    isAuthReady, // 👈 add this
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
