import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { translate } from "@/lib/translate";

type Product = {
  id: string;
  slug: string;
  title: any;
  description: any;
  created_at: string;
  status?: string;
};

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadCollectionPage() {
      console.log("Loading collection page for slug:", slug);

      setLoading(true);
      setErrorMessage(null);

      if (!slug) {
        setErrorMessage("No collection slug provided.");
        setLoading(false);
        return;
      }

      // 1️⃣ Fetch collection
      const { data: collection, error: collectionError } = await supabase
        .from("ecom_collections")
        .select("id, name")
        .eq("slug", slug)
        .maybeSingle();

      if (collectionError) {
        console.error("Collection fetch error:", collectionError);
        setErrorMessage("Failed to load collection.");
        setLoading(false);
        return;
      }

      if (!collection) {
        console.warn("Collection not found.");
        setErrorMessage("Collection not found.");
        setLoading(false);
        return;
      }

      console.log("Collection found:", collection);

      // 2️⃣ Fetch product IDs from junction table
      const { data: junctionData, error: junctionError } = await supabase
        .from("ecom_product_collections")
        .select("product_id, position")
        .eq("collection_id", collection.id)
        .order("position", { ascending: true });

      if (junctionError) {
        console.error("Junction fetch error:", junctionError);
        setErrorMessage("Failed to load collection products.");
        setLoading(false);
        return;
      }

      console.log("Junction rows:", junctionData);

      const productIds = junctionData?.map((row) => row.product_id) ?? [];

      if (productIds.length === 0) {
        console.log("No products in this collection.");
        setProducts([]);
        setLoading(false);
        return;
      }

      // 3️⃣ Fetch actual products
      const { data: productData, error: productError } = await supabase
        .from("ecom_products")
        .select("*")
        .in("id", productIds);

      if (productError) {
        console.error("Product fetch error:", productError);
        setErrorMessage("Failed to load products.");
        setLoading(false);
        return;
      }

      console.log("Products fetched:", productData);

      setProducts(productData ?? []);
      setLoading(false);
    }

    loadCollectionPage();
  }, [slug]);

  // ========================
  // RENDER LOGIC
  // ========================

  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        Loading...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="p-6 text-red-500">
        {errorMessage}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-6 text-gray-600">
        No products found in this collection.
      </div>
    );
  }

  return (
    <div className="p-6 grid gap-6 md:grid-cols-3">
      {products.map((product) => (
        <div
          key={product.id}
          className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold">
            {translate(product.title, "fr")}
          </h2>

          <p className="text-sm text-gray-600 mt-2">
            {translate(product.description, "fr")}
          </p>
        </div>
      ))}
    </div>
  );
}