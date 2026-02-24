import { useState } from "react";
import { supabase } from "../lib/supabase";

interface Product {
  id: string;
  name: string;
  price: number;
  inventory_qty: number;
  status: string;
}

interface Props {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}

export default function ProductModal({
  product,
  onClose,
  onSaved,
}: Props) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState<number>(product.price);
  const [inventory, setInventory] = useState<number>(
    product.inventory_qty
  );
  const [status, setStatus] = useState(product.status);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("ecom_products")
      .update({
        name,
        price,
        inventory_qty: inventory,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="bg-white w-full max-w-xl rounded-2xl shadow-xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold mb-6">
          Edit Product
        </h2>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label
              htmlFor="product-name"
              className="block text-sm font-medium mb-2"
            >
              Product Name
            </label>
            <input
              id="product-name"
              type="text"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="product-price"
              className="block text-sm font-medium mb-2"
            >
              Price (DA)
            </label>
            <input
              id="product-price"
              type="number"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={price}
              onChange={(e) =>
                setPrice(Number(e.target.value))
              }
            />
          </div>

          {/* Inventory */}
          <div>
            <label
              htmlFor="product-inventory"
              className="block text-sm font-medium mb-2"
            >
              Inventory Quantity
            </label>
            <input
              id="product-inventory"
              type="number"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={inventory}
              onChange={(e) =>
                setInventory(Number(e.target.value))
              }
            />
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="product-status"
              className="block text-sm font-medium mb-2"
            >
              Status
            </label>
            <select
              id="product-status"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 border rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}