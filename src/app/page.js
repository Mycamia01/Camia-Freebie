'use client';

import { Users, Package, ShoppingCart, LogIn } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="max-h-screen bg-gray-100 flex items-center justify-center">
      {/* Full-Screen Hero Section */}
      <header
        className="w-full text-white flex flex-col justify-center items-center px-6 py-23"
        style={{
          background: "linear-gradient(135deg, #00b4db, #0083b0, #00b4db, #0083b0)",
          backgroundSize: "400% 400%",
          animation: "flowBackground 15s ease infinite",
        }}
      >
        <style>{`
          @keyframes flowBackground {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>

        <div className="max-w-screen-lg w-full text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome CAMIA Employees</h1>
          <p className="text-xl mb-4">1 Customer to 1 Buy to all our LOYALS.</p>
          <p className="text-lg mb-8">We hope you have good news! ADD A NEW CUSTOMER!</p>

          <a
            className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-200 rounded-full font-medium text-base px-6 py-3 transition"
            href="/login"
          >
            <LogIn size={20} /> Click to login
          </a>

          {/* Features Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-12">
            <FeatureCard icon={<Users size={36} />} title="Customer Management" description="Add, view, and manage your loyal customers." />
            <FeatureCard icon={<Package size={36} />} title="Product Management" description="Track and update products efficiently." />
            <FeatureCard icon={<ShoppingCart size={36} />} title="Purchase Details" description="Monitor all purchases and order history." />
          </div>
        </div>
      </header>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 text-gray-800 shadow-md hover:scale-[1.02] transition-transform hover:shadow-lg">
      <div className="flex items-center justify-center mb-4 text-blue-600">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

