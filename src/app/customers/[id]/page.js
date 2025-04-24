// app/customers/[id]/page.js
"use client";

import { useEffect, use } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import CustomerForm from "../CustomerForm";

export default function EditCustomer(props) {
  const params = use(props.params);
  const { id } = params;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render the customer form with the id
  return <CustomerForm customerId={id} />;
}
