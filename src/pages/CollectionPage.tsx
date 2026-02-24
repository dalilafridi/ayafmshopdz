import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {translate } from "@/lib/translate";

type Product = {
  id: string;
  slug: string;
  title: any;
  description: any;
  status: string;
  created_at: string;
};

export default function CollectionPage() {
  const { slug } = useParams();
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Load collection by slug
  useEffect(() => {
    async function loadCollection() {
      if (!slug) return;

      const { data, error } = await supabase
        .from("ecom_collections")
        .select("id")
        .eq("slug", slug)
        .maybeSingle(); // 👈 prevents 406

      if (error) {
        console.error("Collection load error:", error);
        setLoading(false);
        return;
      }

      setCollectionId(data?.id ?? null);
    }

    loadCollection();
  }, [slug]);

  // 2️⃣ Load product IDs from junction table
  useEffect(() => {
    async function loadProducts() {
      if (!collectionId) return;

      const { data: junctionData, error: junctionError } = await supabase
        .from("ecom_product_collections")
        .select("product_id, position")
        .eq("collection_id", collectionId)
        .order("position", { ascending: true });

      if (junctionError) {
        console.error("Junction fetch error:", junctionError);
        setLoading(false);
        return;
      }

      const productIds = junctionData?.map(j => j.product_id) || [];

      if (productIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      // 3️⃣ Load actual products
      const { data: productData, error: productError } = await supabase
        .from("ecom_products")
        .select("id, slug, title, description, status, created_at")
        .in("id", productIds)
        .eq("status", "active") // 👈 storefront safe
        .order("created_at", { ascending: false });

      if (productError) {
        console.error("Product fetch error:", productError);
        setLoading(false);
        return;
      }

      setProducts(productData || []);
      setLoading(false);
    }

    loadProducts();
  }, [collectionId]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 grid gap-6 md:grid-cols-3">
      {products.length === 0 && (
        <div>No products found in this collection.</div>
      )}

      {products.map(product => (
        <div key={product.id} className="border p-4 rounded">
          <h2 className="font-bold text-lg">
            {translate(product.title, "fr")}
          </h2>

          <p className="text-sm text-gray-600">
            {translate(product.description, "fr")}
          </p>
        </div>
      ))}
    </div>
  );
}