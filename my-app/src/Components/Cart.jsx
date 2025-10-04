// Cart.js
import React, { useState, useEffect } from "react";
import { database, auth } from "./firebase";
import { ref, remove, update, get, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import "../css/Cart.css";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [imageMap, setImageMap] = useState({}); // imageNames node
  const [productsMap, setProductsMap] = useState({}); // products node (id -> product data)
  const navigate = useNavigate();

  // Auth listener
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setCartItems([]);
        setLoading(false);
        navigate("/login");
      } else {
        setLoading(true);
        // when user logs in we rely on listeners below to populate maps and cart
      }
    });
    return () => unsub();
  }, [navigate]);

  // Real-time listener for products node (keeps productsMap up-to-date)
  useEffect(() => {
    const productsRef = ref(database, "products");
    const unsubProducts = onValue(productsRef, (snapshot) => {
      const map = {};
      snapshot.forEach((child) => {
        const p = child.val() || {};
        // Normalize fields that might contain image info
        map[child.key] = {
          id: child.key,
          img: p.imageUrl || p.image || p.img || p.imagePath || null,
          filename: p.filename || null,
          name: p.name || p.title || null,
          price: p.price ?? null,
          raw: p // store raw object if needed
        };
      });
      setProductsMap(map);
    }, (err) => {
      console.error("products onValue error:", err);
    });

    return () => {
      unsubProducts();
    };
  }, []);

  // Real-time listener for imageNames node (your mapping)
  useEffect(() => {
    const imagesRef = ref(database, "imageNames");
    const unsubImages = onValue(imagesRef, (snapshot) => {
      if (snapshot.exists()) {
        setImageMap(snapshot.val());
      } else {
        setImageMap({});
      }
    }, (err) => {
      console.error("imageNames onValue error:", err);
    });

    return () => unsubImages();
  }, []);

  // Real-time listener for the user's cart (updates when items added/removed)
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const userCartRef = ref(database, `userscart/${user.uid}`);
    const unsubCart = onValue(userCartRef, (snapshot) => {
      const items = [];
      snapshot.forEach((child) => {
        items.push({
          id: child.key,
          ...child.val()
        });
      });
      setCartItems(items);
      calculateTotal(items);
      setLoading(false);
    }, (err) => {
      console.error("userscart onValue error:", err);
      setLoading(false);
    });

    return () => unsubCart();
  }, [user]);

  // Helpers
  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => {
      const qty = Number(item.qty) || 1;
      const amt = parseFloat(item.productamt) || 0;
      return sum + amt * qty;
    }, 0);
    setTotalAmount(total);
  };

  const handleRemoveItem = (itemId) => {
    if (!user) return;
    const itemRef = ref(database, `userscart/${user.uid}/${itemId}`);
    remove(itemRef).catch((err) => console.error("remove error:", err));
  };

  const handleQuantityChange = (itemId, newQty) => {
    if (!user || newQty < 1) return;
    const itemRef = ref(database, `userscart/${user.uid}/${itemId}`);
    update(itemRef, { qty: newQty }).catch((err) => console.error("update qty error:", err));
  };

  // Resolve image using (1) product record, (2) direct URL, (3) imageNames mapping, (4) fallback
  const getImageResource = (imageId, productId) => {
    // 1) If productId exists, try productsMap first
    if (productId && productsMap[productId]) {
      const p = productsMap[productId];
      const pimg = p.img ?? p.filename ?? null;

      if (pimg) {
        if (typeof pimg === "string") {
          if (pimg.startsWith("http")) return pimg; // full Firebase URL
          // if product stores an image-id (digits) that maps via imageMap
          if (/^\d+$/.test(pimg) && imageMap[pimg]) return `/${imageMap[pimg]}`;
          // if looks like a filename (ends with extension) return from public root
          if (/\.(png|jpe?g|gif|svg)$/i.test(pimg)) return `/${pimg}`;
          // fallback: return as root path (some product entries might store filenames without extension checking)
          return `/${pimg}`;
        }
      }
    }

    // 2) If imageId is a full URL
    if (imageId && typeof imageId === "string" && imageId.startsWith("http")) {
      return imageId;
    }

    // 3) If imageId matches imageMap (imageNames node)
    if (imageId != null) {
      const idString = imageId.toString();
      const filename = imageMap[idString];
      if (filename) return `/${filename}`; // public root
      // if imageId itself looks like a filename (rare) return directly
      if (/\.(png|jpe?g|gif|svg)$/i.test(idString)) return `/${idString}`;
    }

    // 4) fallback
    return "/unknowenprofile.png";
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader" />
        <h2>Loading your cart...</h2>
      </div>
    );
  }

  return (
    <div className="cart-pagecart">
      <section className="page-headercart">
        <h2 className="page-header-titlecart">#cart</h2>
        <p className="page-header-desccart">View your selected items</p>
      </section>

      <section className="cart-containercart">
        {cartItems.length === 0 ? (
          <div className="empty-cartcart">
            <i className="bx bx-cart-alt empty-cart-iconcart" />
            <h2 className="empty-cart-titlecart">Your cart is empty</h2>
            <button onClick={() => navigate("/shop")} className="shop-btncart">
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-table-containercart">
              <table className="cart-tablecart">
                <thead className="cart-table-headcart">
                  <tr className="cart-table-rowcart">
                    <th>Remove</th>
                    <th>Image</th>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>

                <tbody>
                  {cartItems.map((item) => {
                    // pass both productimage and productId so resolution can try products node as source
                    const src = getImageResource(item.productimage, item.productId);
                    return (
                      <tr key={item.id}>
                        <td>
                          <button onClick={() => handleRemoveItem(item.id)} className="remove-btncart">
                            <i className="bx bx-x-circle" />
                          </button>
                        </td>
                        <td>
                          <img
                            src={src}
                            alt={item.productname}
                            className="product-thumbnail-imgcart"
                            onError={(e) => {
                              console.warn("Image load failed, fallback:", e.target.src);
                              e.target.src = "/unknowenprofile.png";
                            }}
                          />
                        </td>
                        <td>{item.productname}</td>
                        <td>₹{item.productamt}</td>
                        <td>
                          <div className="quantity-controlcart">
                            <button onClick={() => handleQuantityChange(item.id, (Number(item.qty) || 1) - 1)}>-</button>
                            <span>{item.qty}</span>
                            <button onClick={() => handleQuantityChange(item.id, (Number(item.qty) || 1) + 1)}>+</button>
                          </div>
                        </td>
                        <td>₹{((parseFloat(item.productamt) || 0) * (Number(item.qty) || 1)).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="cart-summarycart">
              <div className="summary-contentcart">
                <h3 className="summary-titlecart">Cart Totals</h3>
                <div className="summary-linecart">
                  <span className="summary-line-labelcart">Cart Subtotal</span>
                  <span className="summary-line-valuecart">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="summary-linecart">
                  <span className="summary-line-labelcart">Shipping</span>
                  <span className="summary-line-valuecart">Free</span>
                </div>
                <div className="summary-linecart totalcart">
                  <span className="summary-line-labelcart">Total</span>
                  <span className="summary-line-valuecart">₹{totalAmount.toFixed(2)}</span>
                </div>
                <button onClick={handleCheckout} className="checkout-btncart">
                  Proceed to checkout
                </button>
              </div>
            </div>
          </>
        )}
      </section>
      <footer className="modern-footer">
        <div className="footer-content">
          <div className="footer-column brand-column">
            <h3>Jasa Essential</h3>
            <p>Your trusted partner for quality stationery products for students and professionals. We offer a wide range of supplies at competitive prices.</p>
            <div className="social-icons">
              
              <a href="https://www.instagram.com/jasa_essential?igsh=MWVpaXJiZGhzeDZ4Ng=="><i className="bx bxl-instagram"></i></a>
              
            </div>
          </div>
          
          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#">Shop</a></li>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h4>Customer Service</h4>
            <ul>
              <li><a href="#">My Account</a></li>
              <li><a href="#">Order History</a></li>
              <li><a href="#">Shipping Policy</a></li>
              <li><a href="#">Returns & Exchanges</a></li>
              <li><a href="#">Terms & Conditions</a></li>
            </ul>
          </div>
          
          <div className="footer-column contact-info">
            <h4>Contact Us</h4>
            <p><i className="bx bx-map"></i> 2/3 line medu pension line 2 nd street  line medu , salem 636006</p>
            <p><i className="bx bx-phone"></i> (+91) 7418676705</p>
            
            <p><i className="bx bx-envelope"></i> jasaessential@gmail.com</p>
          </div>
        </div>
        
        <div className="footer-bottom" style={{display:"block"}}>
          <p>&copy; 2025 Jasa Essential. All Rights Reserved.</p>
          {/* <div className="payment-methods">
            <i className="bx bxl-visa"></i>
            <i className="bx bxl-mastercard"></i>
            <i className="bx bxl-paypal"></i>
            <i className="bx bxl-google-pay"></i>
          </div> */}
          <div className="footer-content">
        <p className="copyright1" style={{flexDirection:"row"}}>Developed by <a href="https://rapcodetechsolutions.netlify.app/" className="develop-aa"><img src="/Rapcode.png" style={{width:"20px",height:"20px",display:"flex",margin:"auto",flexDirection:"row", marginLeft:"10px"}} alt="RapCode Logo"></img>RapCode Tech Solutions</a></p>
      </div>
        </div>
      </footer>
    </div>
  );
};

export default Cart;
