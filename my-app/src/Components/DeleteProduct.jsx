import { useState, useEffect } from "react";
import { ref, onValue, remove } from "firebase/database";
import { database } from "./firebase";
import "../css/Admin1.css";

function DeleteProduct() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const productsRef = ref(database, "products");
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setProducts(productList);
      } else {
        setProducts([]);
      }
    });
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      remove(ref(database, `products/${id}`))
        .then(() => alert("✅ Product deleted successfully"))
        .catch((err) => console.error("❌ Delete failed:", err));
    }
  };

  // 🔍 Filter products based on search query
  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="delete-product-container">
      <h2>Delete Products</h2>

      {/* 🔍 Search Bar */}
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />

      {filteredProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul className="product-list">
          {filteredProducts.map((product) => (
            <li key={product.id} className="product-item">
              <div className="product-info">
                <strong>{product.name}</strong> <br />
                <span>Price: {product.price || "N/A"}</span>
              </div>
              <button
                className="delete-btn"
                onClick={() => handleDelete(product.id)}
              >
                <i className="bx bx-trash"></i> Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DeleteProduct;
