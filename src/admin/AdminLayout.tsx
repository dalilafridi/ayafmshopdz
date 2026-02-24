import { ReactNode } from "react";
import { supabase } from "../lib/supabase";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin-login";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-6">
        <h2 className="text-xl font-bold mb-8">Admin</h2>

        <nav className="space-y-4">
          <a
            href="/admin"
            className="block text-gray-700 hover:text-green-600"
          >
            Dashboard
          </a>

          <a
            href="/admin/products"
            className="block text-gray-700 hover:text-green-600"
          >
            Products
          </a>
        </nav>

        <button
          onClick={logout}
          className="mt-10 text-red-500 hover:text-red-700"
        >
          Logout
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 p-10">
        {children}
      </div>
    </div>
  );
  
}

