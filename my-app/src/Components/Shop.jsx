import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import { database, auth } from "./firebase";
import { ref, push, set, get } from "firebase/database";
import "../css/shop.css";

// Static image mapping
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

// Reverse mapping
const REVERSE_IMAGE_MAPPING = Object.fromEntries(
  Object.entries(IMAGE_ID_MAPPING).map(([id, filename]) => [filename, id])
);

const Shop = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchFocused, setSearchFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [dynamicProducts, setDynamicProducts] = useState([]);

  const products = [
    { img: "casio991.jpg", brand: "Casio", name: "FX-991MS Scientific Calculator", price: "₹1165" },
    { img: "caltrix.jpg", brand: "Caltrix", name: "CX-991S Scientific Calculator", price: "₹600" },
    { img: "graphh.png", brand: "SVE SIDDHI VINAYAK ENTERPRISES", name: "Graph Notebook - A4 Size, 100 Pages", price: "₹100" },
    { img: "xooblack.png", brand: "Hauser", name: "XO Ball Pen - Black Ink", price: "₹10" },
    { img: "xoblue.png", brand: "Hauser", name: "XO Ball Pen - Blue Ink", price: "₹10" },
    { img: "stylishpenblue.jpg", brand: "Stylish", name: "X3 Ball Pen - Blue (0.7mm)", price: "₹7" },
    { img: "stylishblackpen.png", brand: "Stylish", name: "X3 Ball Pen - Black (0.7mm)", price: "₹7" },
    { img: "athreenotee.jpg", brand: "Jasa Essential", name: "A3 Drawing Book", price: "₹80" },
    { img: "tippencil.png", brand: "Faber-Castell", name: "Tri-Click Mechanical Pencil 0.7mm", price: "₹15" },
    { img: "bipolar.jpg", brand: "Jasa Essential", name: "Bipolar Graph Book (100 sheets)", price: "₹100" },
    { img: "tipbox.png", brand: "Camlin Kokuyo", name: "0.7mm B Lead Tube", price: "₹5" },
    { img: "scale.png", brand: "Camlin", name: "Exam Portfolio Scale 30cm", price: "₹10" },
    { img: "eraser.png", brand: "Apsara", name: "White Eraser", price: "₹5" },
    { img: "drafter.png", brand: "ORFORX", name: "Mini Drafter with Steel Rod", price: "₹350" },
    { img: "afoursheet.png", brand: "TNPL", name: "A4 Copier Paper 80 GSM (500 Sheets)", price: "₹280" },
    { img: "note.png", brand: "Classmate", name: "Long Size Notebook A4 - 120 Pages (UnRuled)", price: "₹60" },
    { img: "smallnote.jpg", brand: "Classmate", name: "Small Size Notebook - 120 Pages (Ruled)", price: "₹40" },
    { img: "labcourt.png", brand: "ALIS", name: "Unisex Lab Coat/Apron Cotton White", price: "₹500" },
    { img: "stabler.jpg", brand: "Kangaro", name: "No. 10 Stapler", price: "₹60" },
  ];

  const [offerImages, setOfferImages] = useState([
    { img: "stylishpenblue.jpg", product: products.find(p => p.img === "stylishpenblue.jpg") },
    { img: "smallnote.jpg", product: products.find(p => p.img === "smallnote.jpg") },
    { img: "caltrix.jpg", product: products.find(p => p.img === "caltrix.jpg") }
  ]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % offerImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [offerImages.length]);

  const categories = ["All", "Casio", "Classmate", "Faber-Castell", "Hauser", "Jasa Essential"];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) fetchCart(currentUser.uid);
      else setCartItems([]);
    });
    return () => unsubscribe();
  }, []);

  const fetchCart = async (uid) => {
    setLoading(true);
    try {
      const userCartRef = ref(database, `userscart/${uid}`);
      const snapshot = await get(userCartRef);
      const items = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => items.push({ id: child.key, ...child.val() }));
      }
      setCartItems(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const productsRef = ref(database, "products");
        const snapshot = await get(productsRef);
        if (snapshot.exists()) {
          const fetchedProducts = [];
          snapshot.forEach((child) => {
            const product = child.val();
            fetchedProducts.push({
              img: product.imageUrl || "/placeholder.png",
              brand: product.brand || "Unknown",
              name: product.name,
              price: product.price,
              rating: product.rating || 0,
            });
          });
          setDynamicProducts(fetchedProducts);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const allProducts = [...products, ...dynamicProducts];
  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || product.brand === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getImageIdForFilename = (filename) => REVERSE_IMAGE_MAPPING[filename] || "0";
  const isProductInCart = (product) => cartItems.some((item) => item.productname === product.name);

  const showToastNotification = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const addToCart = async (e, product) => {
    e.stopPropagation();
    if (!user) {
      showToastNotification("Please login to add items to cart", "warning");
      navigate("/login");
      return;
    }
    if (isProductInCart(product)) {
      showToastNotification("This product is already in your cart!", "info");
      return;
    }
    const imageId = getImageIdForFilename(product.img);
    const productData = {
      productname: product.name,
      productimage: parseInt(imageId, 10),
      productamt: product.price.replace("₹", ""),
      qty: 1,
      rating: product.rating || 0,
      discription: `Brand: ${product.brand}, Product: ${product.name}`,
    };
    setLoading(true);
    try {
      const userCartRef = ref(database, `userscart/${user.uid}`);
      const newProductRef = push(userCartRef);
      await set(newProductRef, productData);
      setCartItems([...cartItems, { id: newProductRef.key, ...productData }]);
      showToastNotification("Product added to cart successfully!", "success");
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToastNotification("Failed to add product to cart.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => navigate("/product", { state: { product } });
  const handleCategoryClick = (category) => setActiveCategory(category);
  const clearSearch = () => setSearchQuery("");
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="shop-container">
      {showToast && <div className={`toast-notification ${toastType}`}>{toastMessage}</div>}

      {/* Offers Slideshow - TOP */}
      <section className="offers-slideshow-section">
      {offerImages.length > 0 && (
      <div className="slideshow-wrapper">
      {/* left text */}
      <div className="slideshow-content">
        <h2>{offerImages[currentSlide].product?.brand}</h2>
        <p>{offerImages[currentSlide].product?.name}</p>
        <p className="price">{offerImages[currentSlide].product?.price}</p>
      </div>

      {/* right product image */}
      <img
        className="offers-slideshow-img"
        src={offerImages[currentSlide].img}
        alt="Offer Slide"
        onClick={() => handleProductClick(offerImages[currentSlide].product)}
      />

      {/* dots */}
      <div className="dots-container">
        {offerImages.map((_, index) => (
          <span
            key={index}
            className={`dot ${currentSlide === index ? "active" : ""}`}
            onClick={() => setCurrentSlide(index)}
          ></span>
        ))}
      </div>
    </div>
  )}
</section>


      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2>Find Your Perfect Stationery</h2>
          <p>Discover quality supplies for school, college, and office needs</p>
          <div className={`search-containershop ${searchFocused ? "focused" : ""}`}>
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {searchQuery && <button className="clear-search" onClick={clearSearch}>×</button>}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-btn ${activeCategory === category ? "active" : ""}`}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </section>

      {/* Products Grid */}
      <section className="products-section">
        <div className="products-grid">
          {filteredProducts.map((product, index) => {
            const inCart = isProductInCart(product);
            return (
              <div
                className="product-card"
                key={index}
                onClick={() => handleProductClick(product)}
              >
                <div className="product-image-container">
                  <img src={product.img || "/placeholder.png"} alt={product.name} />
                  <div className="product-actions">
                    <button
                      className={`cart-btn ${inCart ? "in-cart" : ""}`}
                      onClick={(e) => addToCart(e, product)}
                    >
                      <i className={`bx ${inCart ? "bx-check" : "bx-cart"}`}></i>
                    </button>
                    <button
                      className="view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product);
                      }}
                    >
                      <i className="bx bx-show"></i>
                    </button>
                  </div>
                </div>

                <div className="product-info">
                  <span className="product-brand">{product.brand}</span>
                  <h5 className="product-name">{product.name}</h5>
                  <div className="product-footer">
                    <span className="product-price">{product.price}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <button className="scroll-to-top" onClick={scrollToTop}>↑</button>

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
            <p><i className="bx bx-map"></i>2/3 line medu pension line 2 nd street  line medu , salem 636006</p>
            <p><i className="bx bx-phone"></i> (+91) 7418676705</p>
            <p><i className="bx bx-envelope"></i> jasaessential@gmail.com</p>
          </div>
        </div>
        
        <div className="footer-bottom" style={{display:"block"}}>
          <p>&copy; 2025 Jasa Essential. All Rights Reserved.</p>
          <div className="footer-content">
            <p className="copyright1" style={{flexDirection:"row"}}>
              Developed by <a href="https://rapcodetechsolutions.netlify.app/" className="develop-aa">
                <img src="/Rapcode.png" style={{width:"20px",height:"20px",display:"flex",margin:"auto",flexDirection:"row", marginLeft:"10px"}} alt="RapCode Logo" />
                RapCode Tech Solutions
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Shop;
