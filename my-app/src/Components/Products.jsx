import { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { database } from "./firebase";
import "../css/Products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsRef = ref(database, "products");

    onValue(productsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const productList = Object.entries(data).map(([id, product]) => ({
        id,
        ...product,
      }));
      setProducts(productList);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id) => {
    try {
      await remove(ref(database, `products/${id}`));
      alert("✅ Product deleted successfully!");
    } catch (err) {
      alert("❌ Error deleting product: " + err.message);
    }
  };

  return (
    <div className="products-container">
      <h2>All Products</h2>
      {loading ? (
        <p>Loading products…</p>
      ) : products.length === 0 ? (
        <p>No products available.</p>
      ) : (
        <div className="product-list">
          {products.map(({ id, name, description, price, imageUrl }) => (
            <div className="product-card" key={id}>
              <img
                src={imageUrl || "/default-product.png"}
                alt={name || "No Name"}
                className="product-img"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
              <h3>{name}</h3>
              <p>{description}</p>
              <p>₹{price}</p>
              <button onClick={() => handleDelete(id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;
