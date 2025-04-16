import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen pb-20 bg-gray-100">
      {/* Hero Section */}
      <header className="w-full px-[30px] py-10 text-white" style={{
        background: "linear-gradient(135deg, #00b4db, #0083b0, #00b4db, #0083b0)",
        backgroundSize: "400% 400%",
        animation: "flowBackground 15s ease infinite"
      }}>
        <style>{`
          @keyframes flowBackground {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
        <div className="max-w-screen-xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Our Service</h1>
          <p className="text-lg mb-6">Your one-stop solution for e-commerce and customer management.</p>
          <div className="flex justify-center gap-4">
            <a
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-white text-blue-600 hover:bg-gray-200 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              href="/login"
            >
              Click to login
            </a>
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <Image src="/ecommerce-icon.svg" alt="E-commerce Icon" width={50} height={50} />
            <Image src="/customer-management-icon.svg" alt="Customer Management Icon" width={50} height={50} />
          </div>
        </div>
      </header>
    </div>
  );
}
