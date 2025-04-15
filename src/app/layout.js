// app/layout.js
"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "../context/AuthContext";
import { DashboardProvider } from "../context/DashboardContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <DashboardProvider>
            <Header />
            {children}
            <Footer />
          </DashboardProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
