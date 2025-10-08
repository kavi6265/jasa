import React, { useState, useEffect } from "react";
import { database, auth } from "./firebase"; 
import { ref, set, get, push } from "firebase/database";
import { useNavigate } from "react-router-dom";
import "../css/Checkout.css";

// Image ID mapping
const IMAGE_ID_MAPPING = {
  "2131230840": "about_us.png",
  "2131230841": "afoursheet.png",
  "2131230842": "athreenote.png",
  "2131230843": "athreenotee.jpg",
  "2131230844": "athreenotess.jpg",
  "2131230847": "back.png",
  "2131230848": "backround_btn_profile.png",
  "2131230849": "backroundblack_btn_profile.png",
  "2131230850": "backspalsh.png",
  "2131230851": "badge_background.png",
  "2131230852": "banner_bgprofile.png",
  "2131230853": "baseline_add_24.png",
  "2131230854": "baseline_arrow_back_24.png",
  "2131230855": "baseline_call_24.png",
  "2131230856": "baseline_delete_24.png",
  "2131230857": "baseline_edit_24.png",
  "2131230858": "baseline_email_24.png",
  "2131230859": "baseline_file_download_24.png",
  "2131230860": "baseline_file_upload_24.png",
  "2131230861": "baseline_history_24.png",
  "2131230862": "baseline_home_24.png",
  "2131230863": "baseline_info_24.png",
  "2131230864": "baseline_keyboard_backspace_24.png",
  "2131230865": "baseline_local_printshop_24.png",
  "2131230866": "baseline_location_on_24.png",
  "2131230867": "baseline_lock_reset_24.png",
  "2131230868": "baseline_logout_24.png",
  "2131230869": "baseline_menu_24.png",
  "2131230870": "baseline_menu_book_24.png",
  "2131230871": "baseline_minimize_24.png",
  "2131230872": "baseline_person_24.png",
  "2131230873": "baseline_person_add_alt_1_24.png",
  "2131230874": "baseline_preview_24.png",
  "2131230875": "baseline_privacy_tip_24.png",
  "2131230876": "baseline_remove_red_eye_24.png",
  "2131230877": "baseline_search_24.png",
  "2131230878": "baseline_settings_24.png",
  "2131230879": "baseline_shopping_cart_24.png",
  "2131230880": "baseline_smartphone_24.png",
  "2131230881": "bikelogo.png",
  "2131230882": "bipolar.jpg",
  "2131230883": "black_circle.png",
  "2131230884": "bookimg.png",
  "2131230885": "books.png",
  "2131230886": "borrderlines.png",
  "2131230887": "btn_1.png",
  "2131230888": "btn_3.png",
  "2131230889": "btn_4.png",
  "2131230898": "btnbackroundprofile.png",
  "2131230899": "button_background.png",
  "2131230900": "calculatordeli.png",
  "2131230901": "calculatorr.png",
  "2131230902": "caltrix.jpg",
  "2131230957": "casio991.jpg",
  "2131230958": "circles.png",
  "2131230978": "cx.png",
  "2131230979": "cxd.png",
  "2131230985": "drafte1.png",
  "2131230986": "drafter.png",
  "2131230987": "drafter1.jpg",
  "2131230988": "draftercombo.png",
  "2131230989": "edittext_background.png",
  "2131230990": "edittext_background_wh.png",
  "2131230991": "eraser.png",
  "2131230992": "file_paths.png",
  "2131230993": "files.jpg",
  "2131230994": "flair.jpg",
  "2131230997": "gradient_circle.png",
  "2131230998": "graph.png",
  "2131230999": "graphh.png",
  "2131231000": "graybackround.png",
  "2131231001": "greycircle.png",
  "2131231002": "header_back.png",
  "2131231003": "home_bg_green.png",
  "2131231004": "hotot.jpg",
  "2131231005": "htt.jpg",
  "2131231008": "ic_baseline_email_24.png",
  "2131231009": "ic_baseline_person_24.png",
  "2131231010": "ic_baseline_security_24.png",
  "2131231020": "ic_launcher_background.png",
  "2131231021": "ic_launcher_foreground.png",
  "2131231033": "iconwhapp.png",
  "2131231035": "instalogo.png",
  "2131231036": "jasalogo.png",
  "2131231037": "jasalogo512px.png",
  "2131231038": "labcourt.png",
  "2131231039": "laodingpng.png",
  "2131231040": "lavender_round.png",
  "2131231062": "minus.png",
  "2131231100": "nav_item_background.png",
  "2131231101": "nav_profile.png",
  "2131231102": "nav_share.png",
  "2131231104": "note.png",
  "2131231118": "onebyone.png",
  "2131231119": "onebytwo.png",
  "2131231120": "pdflogo.png",
  "2131231121": "pen.png",
  "2131231122": "pencilcombo.png",
  "2131231123": "pencombo.png",
  "2131231124": "person3.jpg",
  "2131231125": "phonelogo.png",
  "2131231126": "phonepay.png",
  "2131231127": "phto.jpg",
  "2131231128": "pngegg.png",
  "2131231130": "previeew_bg.png",
  "2131231131": "productbackround.png",
  "2131231132": "productimagee.png",
  "2131231133": "profile_bg_green.png",
  "2131231134": "qrcodesalem.jpg",
  "2131231135": "rapcode.png",
  "2131231136": "red_circle.png",
  "2131231137": "review.png",
  "2131231138": "scale.png",
  "2131231139": "search_icon.png",
  "2131231140": "smallnote.jpg",
  "2131231141": "social_btn_background.png",
  "2131231142": "stabler.jpg",
  "2131231143": "stylishblackpen.png",
  "2131231144": "stylishpenblue.jpg",
  "2131231146": "tick.png",
  "2131231147": "tipbox.png",
  "2131231148": "tippencil.png",
  "2131231151": "top_background.png",
  "2131231152": "uioop.png",
  "2131231153": "unknowenprofile.png",
  "2131231154": "upload.png",
  "2131231155": "upload2.png",
  "2131231156": "uploadqr.png",
  "2131231157": "vcc.jpg",
  "2131231158": "welcome.png",
  "2131231159": "white_box.png",
  "2131231160": "whitebg_profile.png",
  "2131231161": "whitebgcircleprofile.png",
  "2131231162": "whiteblack_bg.png",
  "2131231163": "women1.png",
  "2131231164": "xoblue.png",
  "2131231165": "xooblack.png"
};

// Extract image name from path
const extractImageName = (imagePath) => {
  if (!imagePath || typeof imagePath !== "string") return "";
  const parts = imagePath.split("/");
  return parts[parts.length - 1];
};

// Get image URL from IMAGE_ID_MAPPING or fallback
const getImageUrl = (imageIdOrPath) => {
  if (!imageIdOrPath) return "/unknowenprofile.png";

  // If it's an ID in mapping
  if (IMAGE_ID_MAPPING[imageIdOrPath]) return `/${IMAGE_ID_MAPPING[imageIdOrPath]}`;

  // If it's a path or URL, extract filename and match mapping
  const name = extractImageName(imageIdOrPath);
  const id = Object.keys(IMAGE_ID_MAPPING).find(key => IMAGE_ID_MAPPING[key] === name);
  return id ? `/${IMAGE_ID_MAPPING[id]}` : imageIdOrPath;
};

const Checkout = () => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [formData, setFormData] = useState({ username: "", phno: "", address: "" });

  const navigate = useNavigate();

  // Auth and fetch cart
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user details
        const userRef = ref(database, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setFormData({
            username: userData.name || "",
            phno: userData.phno || "",
            address: userData.address || ""
          });
        }
        fetchCartItems(currentUser.uid);
      } else {
        setLoading(false);
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch cart items from userscart
  const fetchCartItems = async (userId) => {
    setLoading(true);
    try {
      const cartRef = ref(database, `userscart/${userId}`);
      const snapshot = await get(cartRef);
      if (snapshot.exists()) {
        const items = [];
        snapshot.forEach(child => {
          items.push({ id: child.key, ...child.val() });
        });
        setCartItems(items);
        calculateTotal(items);
      } else {
        setCartItems([]);
        navigate("/cart");
      }
    } catch (err) {
      console.error("Error fetching cart items:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + (parseFloat(item.productamt) * item.qty), 0);
    setTotalAmount(total);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    if (!formData.username || !formData.phno || !formData.address) {
      alert("Please fill all fields");
      return;
    }
    if (totalAmount < 50) {
      alert("Minimum order amount is ₹50. Please add more items to your cart.");
      return;
    }

    const orderId = push(ref(database, "orders")).key;
    const orderTimestamp = Date.now();

    const orderItems = {};
    cartItems.forEach(item => {
      orderItems[item.id] = {
        productname: item.productname,
        productamt: item.productamt,
        productimage: item.productimage || "2131231153",
        qty: item.qty,
        rating: item.rating || 0,
        description: item.description || ""
      };
    });

    const completeOrder = {
      username: formData.username,
      phno: formData.phno,
      address: formData.address,
      orderTimestamp,
      orderTotal: totalAmount.toFixed(2),
      ordered: true,
      delivered: false,
      items: orderItems
    };

    try {
      const orderRef = ref(database, `userorders/${user.uid}/${orderId}`);
      await set(orderRef, completeOrder);

      // Clear cart
      const cartRef = ref(database, `userscart/${user.uid}`);
      await set(cartRef, null);

      navigate("/success", { state: { orderId, totalAmount: totalAmount.toFixed(2) } });
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order");
    }
  };

  if (loading) return <div className="section-p1"><h2>Loading checkout...</h2></div>;

  return (
    <div>
      <section id="page-header" className="about-header">
        <h2>#checkout</h2>
        <p>Complete your purchase</p>
      </section>

      <section id="checkout" className="section-p1">
        <div className="checkout-container">
          <div className="shipping-details">
            <h3>Shipping Details</h3>
            <form onSubmit={handlePlaceOrder}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phno" value={formData.phno} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Delivery Address</label>
                <textarea name="address" value={formData.address} onChange={handleInputChange} required rows="4"></textarea>
              </div>
              <button type="submit" className="normal">Confirm Order</button>
            </form>
          </div>

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <div className="item-info">
                    <img
                      src={getImageUrl(item.productimage)}
                      alt={item.productname}
                      className="summary-img"
                      onError={(e) => { e.target.src = "/unknowenprofile.png"; }}
                    />
                    <div>
                      <h4>{item.productname}</h4>
                      <p>Qty: {item.qty}</p>
                    </div>
                  </div>
                  <div className="item-price">₹{(parseFloat(item.productamt) * item.qty).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="summary-total">
              <div className="total-row"><span>Subtotal</span><span>₹{totalAmount.toFixed(2)}</span></div>
              <div className="total-row"><span>Shipping</span><span>Free</span></div>
              <div className="total-row final-total"><span>Total</span><span>₹{totalAmount.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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

export default Checkout;
