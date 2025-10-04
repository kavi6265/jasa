import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { database, auth } from "./firebase";
import { ref, push, set, onValue, get } from "firebase/database";
import "../css/ProductView.css";

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

function ProductView() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentProduct, setCurrentProduct] = useState(location.state?.product || null);
  const [dynamicProducts, setDynamicProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isInCart, setIsInCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showCartPreview, setShowCartPreview] = useState(false);

  // Auth listener & cart
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      if (user) {
        const cartRef = ref(database, `userscart/${user.uid}`);
        onValue(cartRef, snapshot => {
          const data = snapshot.val();
          const items = data ? Object.values(data) : [];
          setCartItems(items);
          setCartCount(items.length);
          if (currentProduct) {
            setIsInCart(items.some(item => item.productname === currentProduct.name));
          }
        });
      }
    });
    return () => unsubscribe();
  }, [currentProduct]);

  // Fetch products dynamically
  useEffect(() => {
    const productsRef = ref(database, "products");
    onValue(productsRef, snapshot => {
      const data = snapshot.val();
      const items = data ? Object.values(data) : [];
      setDynamicProducts(items.map(item => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        description: item.description,
        img: item.imageUrl
      })));
      setLoading(false);
    });
  }, []);

  if (!currentProduct) {
    return (
      <div className="product-not-found section-p1">
        <h2>Product not found</h2>
        <button className="normal" onClick={() => navigate("/")}>Return to Shop</button>
      </div>
    );
  }

  const showNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getImagePath = (img) => {
    if (!img) return "/unknowenprofile.png";
    if (img.startsWith("/") || img.startsWith("http")) return img;
    const entry = Object.entries(IMAGE_ID_MAPPING).find(([_, val]) => val === img);
    return entry ? `/${entry[1]}` : "/unknowenprofile.png";
  };

  const checkIfProductInCart = (product) => {
    return cartItems.some(item => item.productname === product.name);
  };

  const addToCart = (productToAdd = currentProduct, qty = quantity) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (checkIfProductInCart(productToAdd)) {
      showNotification(`${productToAdd.name} is already in your cart!`);
      return;
    }
    const cartRef = ref(database, `userscart/${currentUser.uid}`);
    const newItemRef = push(cartRef);
    const itemData = {
      key: newItemRef.key,
      productname: productToAdd.name,
      productamt: productToAdd.price.replace("₹",""),
      productimage: productToAdd.img,
      qty,
      rating: 0,
      discription: productToAdd.description || `Brand: ${productToAdd.brand}`
    };
    set(newItemRef, itemData).then(() => {
      showNotification(`${productToAdd.name} added to cart!`);
      setShowCartPreview(true);
      setTimeout(() => setShowCartPreview(false), 5000);
      setIsInCart(true);
    }).catch(err => {
      console.error(err);
      alert("Failed to add to cart");
    });
  };

  const goToCart = () => navigate("/cart");

  const relatedProducts = () => {
    const sameBrand = dynamicProducts.filter(item => item.id !== currentProduct.id && item.brand === currentProduct.brand);
    const others = dynamicProducts.filter(item => item.id !== currentProduct.id && !sameBrand.includes(item));
    return [...sameBrand, ...others].slice(0, 3);
  };

  return (
    <div>
      {/* Toast */}
      <div className={`toast ${showToast ? "show" : ""}`}>
        <i className={`bx ${toastMessage.includes("already") ? "bx-info-circle" : "bx-check-circle"}`}></i>
        <span>{toastMessage}</span>
      </div>

      {/* Cart Preview */}
      {showCartPreview && (
        <div className="cart-preview-overlay">
          <div className="cart-preview">
            <div className="cart-preview-header">
              <h3>Cart Preview</h3>
              <i className="bx bx-x" onClick={() => setShowCartPreview(false)}></i>
            </div>
            <div className="cart-preview-items">
              {cartItems.slice(-3).map((item, idx) => (
                <div className="cart-preview-item" key={idx}>
                  <div className="cart-preview-img">
                    <img src={getImagePath(item.productimage)} alt={item.productname} />
                  </div>
                  <div className="cart-preview-details">
                    <h4>{item.productname}</h4>
                    <p>₹{item.productamt} x {item.qty}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-preview-footer">
              <span>{cartItems.length} items in cart</span>
              <button className="normal" onClick={goToCart}>View Cart</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Details */}
      <section id="prodetails" className="section-p1">
        <div className="single-pro-image">
          <img src={getImagePath(currentProduct.img)} alt={currentProduct.name} width="100%" />
          <div className="small-img-group">
            {[...Array(4)].map((_, idx) => (
              <div className="small-img-col" key={idx}>
                <img src={getImagePath(currentProduct.img)} alt="Thumbnail" className="small-img" />
              </div>
            ))}
          </div>
        </div>
        <div className="single-pro-details">
          <h6>Home / {currentProduct.brand}</h6>
          <h4>{currentProduct.name}</h4>
          <div className="price-container"><h3>{currentProduct.price}</h3></div>
          <div className="add-to-cart-container">
            <div className="quantity-controls">
              <button onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)} disabled={isInCart}>-</button>
              <input type="number" value={quantity} min="1" onChange={e => setQuantity(e.target.value)} disabled={isInCart}/>
              <button onClick={() => setQuantity(q => q + 1)} disabled={isInCart}>+</button>
            </div>
            {isInCart ? (
              <button className="normal in-cart-btn" onClick={goToCart}><i className="bx bx-check"></i> Already in Cart</button>
            ) : (
              <button className="normal add-cart-btn" onClick={() => addToCart()}><i className="bx bx-cart-add"></i> Add To Cart</button>
            )}
          </div>
          <div className="product-info">
            <h4>Product Details</h4>
            <span>{currentProduct.description || "No description available"}</span>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="product1" className="section-p1">
        <h2>Newly Added Products</h2>
        <div className="pro-container">
          {dynamicProducts.map((item, idx) => (
            <div className="pro" key={idx} onClick={() => navigate("/product", { state: { product: item } })}>
              <img src={getImagePath(item.img)} alt={item.name} />
              <div className="des">
                <span>{item.brand}</span>
                <h5>{item.name}</h5>
                <div className="price-tag"><h4>{item.price}</h4></div>
              </div>
              {checkIfProductInCart(item) ? (
                <a href="#" onClick={e => { e.preventDefault(); showNotification(`${item.name} is already in your cart!`); }}>
                  <i className="bx bx-check cart-added"></i>
                </a>
              ) : (
                <a href="#" onClick={e => { e.preventDefault(); addToCart(item, 1); }}>
                  <i className="bx bx-cart cart"></i>
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Related Products */}
      <section id="related-products" className="section-p1">
        <h2>Related Products</h2>
        <div className="pro-container">
          {relatedProducts().map((item, idx) => (
            <div className="pro" key={idx} onClick={() => navigate("/product", { state: { product: item } })}>
              <img src={getImagePath(item.img)} alt={item.name} />
              <div className="des">
                <span>{item.brand}</span>
                <h5>{item.name}</h5>
                <div className="price-tag"><h4>{item.price}</h4></div>
              </div>
              {checkIfProductInCart(item) ? (
                <a href="/calculatordeli.png" onClick={e => { e.preventDefault(); showNotification(`${item.name} is already in your cart!`); }}>
                  <i className="bx bx-check cart-added"></i>
                </a>
              ) : (
                <a href="#" onClick={e => { e.preventDefault(); addToCart(item, 1); }}>
                  <i className="bx bx-cart cart"></i>
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      {/* Footer */}
<footer className="footer">
  <div className="footer-container">
    {/* About */}
    <div className="footer-col about">
      <h3>Jasa Essential</h3>
      <p>
        Your trusted partner for quality stationery products for students and professionals. 
        We offer a wide range of supplies at competitive prices.
      </p>
      <div className="social-icons">
        <a href="#"><i className="bx bxl-instagram"></i></a>
      </div>
    </div>

    {/* Quick Links */}
    <div className="footer-col">
      <h4>Quick Links</h4>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/shop">Shop</a></li>
        <li><a href="/about">About Us</a></li>
        <li><a href="/contact">Contact</a></li>
        <li><a href="/faq">FAQ</a></li>
      </ul>
    </div>

    {/* Customer Service */}
    <div className="footer-col">
      <h4>Customer Service</h4>
      <ul>
        <li><a href="/account">My Account</a></li>
        <li><a href="/orders">Order History</a></li>
        <li><a href="/shipping">Shipping Policy</a></li>
        <li><a href="/returns">Returns & Exchanges</a></li>
        <li><a href="/terms">Terms & Conditions</a></li>
      </ul>
    </div>

    {/* Contact Us */}
    <div className="footer-col">
      <h4>Contact Us</h4>
      <ul className="contact-info">
        <li><i className="bx bx-map"></i> 2/3 line medu pension line, Salem 636006</li>
        <li><i className="bx bx-phone"></i> (+91) 7418676705</li>
        <li><i className="bx bx-envelope"></i> jasaessential@gmail.com</li>
      </ul>
    </div>
  </div>

  <div className="footer-bottom">
    <p>© 2025 Jasa Essential. All Rights Reserved.</p>
    <p>Developed by <strong>RapCode Tech Solutions</strong></p>
  </div>
</footer>

    </div>
  );
}

export default ProductView;
