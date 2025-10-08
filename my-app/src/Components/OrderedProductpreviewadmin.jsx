import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { database } from "./firebase";
import { ref as dbRef, onValue, update, set, get } from "firebase/database";
import { getStorage, ref as storageRef, getDownloadURL } from "firebase/storage";
import "../css/OrderedProductpreviewadmin.css";

function OrderedProductpreviewadmin() {
  const { orderId, userId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [imageMap, setImageMap] = useState({});
  const [imageUrlCache, setImageUrlCache] = useState({}); // key = original product.productimage value -> resolved URL
  const navigate = useNavigate();

  useEffect(() => {
    if (userId && orderId) {
      loadImageMapping();
      const unsubscribe = fetchOrderDetails(userId, orderId);
      return () => {
        if (typeof unsubscribe === "function") unsubscribe();
      };
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, orderId]);

  // Load imageNames node
  const loadImageMapping = async () => {
    try {
      const imgRef = dbRef(database, "imageNames");
      const snapshot = await get(imgRef);
      if (snapshot.exists()) {
        setImageMap(snapshot.val());
      } else {
        setImageMap({});
      }
    } catch (err) {
      console.error("Error loading imageNames mapping:", err);
      setImageMap({});
    }
  };

  // Fetch order details
  const fetchOrderDetails = (uid, oid) => {
    setLoading(true);
    const orderRef = dbRef(database, `userorders/${uid}/${oid}`);

    const unsubscribe = onValue(
      orderRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setOrder(null);
          setLoading(false);
          return;
        }

        const data = snapshot.val();
        const metaKeys = [
          "orderTotal",
          "orderTimestamp",
          "username",
          "phno",
          "notes",
          "ordered",
          "odered",
          "delivered",
          "address",
          "items",
        ];

        const items =
          data.items ||
          Object.fromEntries(
            Object.entries(data).filter(([k]) => !metaKeys.includes(k))
          );

        const products = Object.values(items).map((item) => ({
          ...item,
          // keep the original productimage string (could be full URL, filename, or numeric ID)
          productimage: item.productimage || "/unknowenprofile.png",
        }));

        setOrder({
          orderId: oid,
          orderTotal: data.orderTotal || 0,
          orderTimestamp: data.orderTimestamp || null,
          products,
          username: data.username || "Unknown",
          phno: data.phno || "",
          notes: data.notes || "",
          ordered: data.ordered || data.odered || false,
          delivered: data.delivered || false,
          address: data.address || "No address provided",
        });

        setLoading(false);
      },
      (error) => {
        console.error("❌ Error fetching order details:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  };

  // When we have order + imageMap, try to prefetch/resolve images
  useEffect(() => {
    if (order && order.products && Object.keys(imageMap).length >= 0) {
      prefetchImages(order.products);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, imageMap]);

  // Prefetch and cache resolved image URLs
  const prefetchImages = async (products) => {
    const storage = getStorage();
    const newCache = { ...imageUrlCache };

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      // use the raw productimage string as cache key (works for "http...", "2131230840", "about_us.png", etc.)
      const key = p.productimage || `__unknown_${i}`;

      if (newCache[key]) continue; // already resolved

      try {
        const resolved = await resolveImageToUrl(key, storage);
        newCache[key] = resolved;
      } catch (err) {
        console.warn("Could not resolve image for", key, err);
        newCache[key] = "/unknowenprofile.png";
      }
    }

    setImageUrlCache(newCache);
  };

  // Try to resolve: (1) full http URL, (2) numeric id -> filename via imageMap -> Storage, (3) filename -> Storage, (4) fallback to /filename in public, finally placeholder.
  const resolveImageToUrl = async (imgValue, storage) => {
    if (!imgValue) return "/unknowenprofile.png";

    // Already a full URL (Firebase download URL or external)
    if (typeof imgValue === "string" && imgValue.startsWith("http")) {
      return imgValue;
    }

    // Determine filename (if numeric id, map it)
    let fileName = imgValue;
    if (/^\d+$/.test(String(imgValue))) {
      fileName = imageMap[String(imgValue)] || null;
    }

    // If mapping produced null, treat original value as filename
    if (!fileName) fileName = String(imgValue);

    // If the value already looks like a public path, return it
    if (fileName.startsWith("/")) return fileName;

    // Candidate storage object paths to try (order matters)
    const candidatePaths = [
      fileName,
      `images/${fileName}`,
      `product_images/${fileName}`,
      `uploads/${fileName}`,
      `assets/${fileName}`,
    ];

    // If fileName has no extension, also try adding common extensions
    if (!/\.(png|jpg|jpeg|webp|gif)$/i.test(fileName)) {
      candidatePaths.unshift(`${fileName}.png`, `${fileName}.jpg`, `${fileName}.jpeg`);
    }

    // Try each candidate path with Firebase Storage
    for (let path of candidatePaths) {
      try {
        const sRef = storageRef(storage, path);
        const url = await getDownloadURL(sRef);
        if (url) return url;
      } catch (err) {
        // console.debug(`Storage lookup failed for ${path}`, err);
        // try next candidate
      }
    }

    // final fallback: attempt to use public folder path (e.g., /about_us.png) — browser will handle 404 and onError will swap to placeholder
    return `/${fileName}`;
  };

  // Mark as delivered
  const markAsDelivered = () => {
    if (!orderId || !userId) return;
    setUpdating(true);

    const orderRef = dbRef(database, `userorders/${userId}/${orderId}`);
    update(orderRef, { delivered: true })
      .then(() => {
        const destRef = dbRef(database, `deliveredordersadmin/${orderId}`);
        if (order) {
          const updatedOrder = { ...order, delivered: true };
          set(destRef, updatedOrder)
            .then(() => {
              setUpdating(false);
              setOrder((prev) => ({ ...prev, delivered: true }));
              alert("✅ Order marked as delivered successfully!");
            })
            .catch((err) => {
              console.error("Error writing to deliveredordersadmin:", err);
              setUpdating(false);
            });
        }
      })
      .catch((err) => {
        console.error("Error updating order:", err);
        setUpdating(false);
      });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    const d = new Date(timestamp);
    return d.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const OrderStatusTracker = ({ order }) => {
    const steps = [
      { label: "Order Placed", active: true, icon: "✔" },
      { label: "Processing", active: order?.ordered, icon: "📦" },
      { label: "Delivered", active: order?.delivered, icon: "●" },
    ];
    return (
      <div className="status-tracker">
        {steps.map((s, i) => (
          <div key={i} className="status-step">
            <div className={`circle ${s.active ? "active" : ""}`}>{s.icon}</div>
            <span className={`label ${s.active ? "active" : ""}`}>{s.label}</span>
            {i < steps.length - 1 && (
              <div className={`line ${steps[i + 1].active ? "active" : ""}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Immediate fallback for rendering while async resolution completes
  const immediateSrcFor = (imgVal) => {
    if (!imgVal) return "/unknowenprofile.png";
    const s = String(imgVal);
    if (s.startsWith("http")) return s;
    if (/^\d+$/.test(s)) {
      const fname = imageMap[s];
      if (fname) return `/${fname}`; // public fallback while Storage resolution happens
      return "/unknowenprofile.png";
    }
    if (/\.(png|jpg|jpeg|webp|gif)$/i.test(s)) return `/${s}`;
    return "/unknowenprofile.png";
  };

  return (
    <div className="order-details-container">
      <div className="order-details-header">
        <h1>Order Details</h1>
      </div>

      {loading ? (
        <div className="profile-loading">
          <div className="spinner" />
        </div>
      ) : order ? (
        <div className="order-details-content">
          {/* Order Summary */}
          <div className="order-summary-card">
            <div className="order-header-section">
              <div className="order-id-section">
               <h2>Order #{order.orderId.slice(0, 8)}</h2>
               <span className="order-date">
               {new Date(order.orderTimestamp).toLocaleDateString("en-IN", {
               year: "numeric",
               month: "short",
               day: "numeric",
            })}
              </span>
            </div>
            </div>

            <OrderStatusTracker order={order} />

            <div className="shipping-address-section">
              <h3>
                <i className="bx bx-map"></i> Shipping Address
              </h3>
              <div className="address-details">
                <p className="recipient-name">{order.username}</p>
                <p className="phone-number">
                  <i className="bx bx-phone"></i> {order.phno}
                </p>
                <p className="full-address">
                  <i className="bx bx-home"></i> {order.address}
                </p>
                {order.notes && (
                  <p className="order-notes">
                    <i className="bx bx-note"></i> <strong>Notes:</strong> {order.notes}
                  </p>
                )}
              </div>
            </div>

            {!order.delivered && (
              <div className="admin-actions">
                <button
                  className="mark-as-delivered-btn"
                  onClick={markAsDelivered}
                  disabled={updating}
                >
                  {updating ? "Updating..." : "Mark as Delivered"}
                </button>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="order-items-section">
            <h3>Order Items</h3>
            <div className="order-items-list">
              {order.products.map((product, index) => {
                const key = product.productimage || `__unknown_${index}`;
                const resolved = imageUrlCache[key];
                const src = resolved || immediateSrcFor(product.productimage);

                return (
                  <div key={index} className="order-product-item">
                    <div className="product-image">
                      <img
                        src={src}
                        alt={product.productname}
                        onError={(e) => {
                          // set broken images to placeholder and cache it to avoid repeated failed loads
                          e.target.onerror = null;
                          e.target.src = "/unknowenprofile.png";
                          setImageUrlCache((prev) => ({ ...prev, [key]: "/unknowenprofile.png" }));
                        }}
                      />
                    </div>
                    <div className="product-info">
                      <h4 className="product-name">{product.productname}</h4>
                      <div className="product-meta">
                        <span className="product-price">₹{product.productamt}</span>
                        <span className="product-quantity">Qty: {product.qty}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="payment-summary-section">
            <h3>
              <i className="bx bx-credit-card"></i> Payment Summary
            </h3>
            <div className="payment-details">
              <div className="payment-row">
                <span>Subtotal</span>
                <span className="amount">₹{order.orderTotal}</span>
              </div>
              <div className="payment-row">
                <span>Shipping Fee</span>
                <span className="amount free">FREE</span>
              </div>
              <div className="payment-divider" />
              <div className="payment-row total">
                <span>Total</span>
                <span className="amount total-amount">₹{order.orderTotal}</span>
              </div>
              <div className="payment-method">
                <i className="bx bx-money"></i> Cash on Delivery
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="order-not-found">
          <i className="bx bx-error-circle" />
          <h2>Order Not Found</h2>
          <button className="back-to-orders" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      )}
    </div>
  );
}

export default OrderedProductpreviewadmin;
