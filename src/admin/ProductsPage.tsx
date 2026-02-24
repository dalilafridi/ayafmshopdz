import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import AdminLayout from "./AdminLayout";
import ProductModal from "./ProductModal";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("ecom_products")
      .select("*")
      .order("created_at", { ascending: false });

    setProducts(data || []);
    setLoading(false);
  };

  return (
  <AdminLayout>
    <h1 className="text-2xl font-semibold mb-6">
      Products
    </h1>

    {loading ? (
      <p>Loading...</p>
    ) : (
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedProduct(p)}
              >
                <td className="p-4">{p.name}</td>
                <td className="p-4">
                  {p.price.toLocaleString()} DA
                </td>
                <td className="p-4">
                  {p.inventory_qty}
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      p.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {/* 🔥 ADD THIS RIGHT HERE */}
    {selectedProduct && (
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSaved={fetchProducts}
      />
    )}
  </AdminLayout>
);
}