import React, { useState } from "react";
import { ref as dbRef, set, get, query, orderByKey, limitToLast } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { database, storage } from "./firebase";
import "../css/AddProduct.css";

function AddProduct() {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName || !description || !price || !imageFile) {
      alert("Please fill all fields and upload an image.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Determine next numeric key
      const productsRef = dbRef(database, "products");
      const lastProductQuery = query(productsRef, orderByKey(), limitToLast(1));
      const snapshot = await get(lastProductQuery);

      let nextKey = 2131230958; // Default starting number if no products exist
      if (snapshot.exists()) {
        const lastKey = Object.keys(snapshot.val())[0];
        nextKey = parseInt(lastKey, 10) + 1;
      }

      // Step 2: Upload image to Firebase Storage
      const imageRef = storageRef(storage, `images/${nextKey}_${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);

      // Step 3: Save product info with numeric key
      await set(dbRef(database, `products/${nextKey}`), {
        name: productName,
        description: description,
        price: price,
        brand: brand,
        imageUrl: imageUrl, // store Firebase Storage URL
      });

      alert("Product added successfully!");
      setProductName("");
      setDescription("");
      setPrice("");
      setBrand("");
      setImageFile(null);
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product">
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}

export default AddProduct;
