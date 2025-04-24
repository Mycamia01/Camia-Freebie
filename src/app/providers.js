// app/providers.js
"use client";

import { AuthProvider } from "../context/AuthContext";
import { DashboardProvider } from "../context/DashboardContext";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <DashboardProvider>{children}</DashboardProvider>
    </AuthProvider>
  );
}
