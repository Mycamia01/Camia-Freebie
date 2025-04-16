// src/components/Footer.js
"use client";

export default function Footer() {
  return (
    <footer className="bg-yellow-700 text-white p-4 mt-8 fixed bottom-0 w-full">
      <div className="container mx-auto text-center text-sm">
        &copy; {new Date().getFullYear()} Camia Freebie. All rights reserved.
      </div>
    </footer>
  );
}
