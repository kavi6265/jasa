import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { database } from './firebase';
import { ref, onValue } from 'firebase/database';
import '../css/OrderedProductpreview.css';

function OrderedProductpreview() {
  const { orderId, userId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (orderId && userId) {
      fetchOrderDetails(userId, orderId);
    }
  }, [orderId, userId]);

  const fetchOrderDetails = (userId, orderId) => {
    setLoading(true);
    const orderRef = ref(database, `userorders/${userId}/${orderId}`);

    onValue(orderRef, (snapshot) => {
      if (snapshot.exists()) {
        const orderData = snapshot.val();

        const orderTotal = orderData.orderTotal;
        const orderTimestamp = orderData.orderTimestamp;
        const username = orderData.username;
        const phno = orderData.phno;
        const notes = orderData.notes;
        const ordered = orderData.odered;
        const delivered = orderData.delivered;
        const address = orderData.address;

        const products = [];
        if (orderData.items) {
          Object.keys(orderData.items).forEach((key) => {
            products.push(orderData.items[key]);
          });
        }

        setOrder({
          orderId,
          orderTotal,
          orderTimestamp,
          products,
          username,
          phno,
          notes,
          ordered,
          delivered,
          address
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching order details:", error);
      setLoading(false);
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handles both mapped IDs and full URLs
  const getImageUrl = (imageIdOrUrl) => {
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
  "2131231165": "xooblack.png",
      // ... add all your mappings
    };

    if (!imageIdOrUrl) return "/unknowenprofile.png";

    const key = imageIdOrUrl.toString();
    let filename = IMAGE_ID_MAPPING[key] || imageIdOrUrl;

    // If it's a URL already, return it; otherwise assume it's in public folder
    if (filename.startsWith("http") || filename.startsWith("/")) return filename;
    return `/${filename}`;
  };

  const handleProductClick = (product) => {
    const formattedProduct = {
      name: product.productname,
      price: `₹${product.productamt}`,
      img: getImageUrl(product.productimage),
      brand: product.productcompany || "Category",
      description: product.productdesc || "No description available"
    };
    navigate("/product", { state: { product: formattedProduct } });
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const getOrderStatusClass = () => {
    if (order?.delivered) return "status-pill delivered";
    if (order?.ordered) return "status-pill processing";
    return "status-pill pending";
  };

  const getOrderStatusText = () => {
    if (order?.delivered) return "Delivered";
    if (order?.ordered) return "Processing";
    return "Pending";
  };
  const OrderStatusTracker = ({ order }) => {
    const steps = [
      { label: "Order Placed", active: true, icon: "✔" },
      { label: "Processing", active: order?.ordered, icon: "📦" },
      { label: "Delivered", active: order?.delivered, icon: "●" },
    ];

    return (
      <div className="status-tracker">
        {steps.map((step, index) => (
          <div key={index} className="status-step">
            <div className={`circle ${step.active ? "active" : ""}`}>
              {step.icon}
            </div>
            <span className={`label ${step.active ? "active" : ""}`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`line ${steps[index + 1].active ? "active" : ""}`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="order-details-container">
      <div className="order-details-header">
        <h1>Order Details</h1>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading order details...</p>
        </div>
      ) : order ? (
        <div className="order-details-content">

          <div className="order-summary-card">
            <div className="order-header-section">
              <div className="order-id-section">
                <h2>Order #{order.orderId.substring(0, 8)}</h2>
                <span className="order-date">{formatDate(order.orderTimestamp)}</span>
              </div>
              <div className={getOrderStatusClass()}>
                {getOrderStatusText()}
              </div>
            </div>
            <OrderStatusTracker order={order} />
            <div className="shipping-address-section">
              <h3><i className="bx bx-map"></i> Shipping Address</h3>
              <div className="address-details">
                <p className="recipient-name">{order.username}</p>
                <p className="phone-number"><i className="bx bx-phone"></i> {order.phno}</p>
                <p className="full-address"><i className="bx bx-home"></i> {order.address}</p>
                {order.notes && <p className="order-notes"><i className="bx bx-note"></i> <strong>Notes:</strong> {order.notes}</p>}
              </div>
            </div>
          </div>

          <div className="order-items-section">
            <h3>Order Items</h3>
            <div className="order-items-list">
              {order.products.map((product, index) => (
                <div key={index} className="order-product-item" onClick={() => handleProductClick(product)}>
                  <div className="product-image">
                    <img
                      src={getImageUrl(product.productimage)}
                      alt={product.productname}
                      onError={(e) => { e.target.onerror = null; e.target.src = "/unknowenprofile.png"; }}
                    />
                  </div>
                  <div className="product-info">
                    <h4 className="product-name">{product.productname}</h4>
                    <div className="product-meta">
                      <span className="product-price">₹{product.productamt}</span>
                      <span className="product-quantity">Qty: {product.qty}</span>
                    </div>
                  </div>
                  <div className="view-product">
                    <span className="view-product-text">View</span>
                    <i className="bx bx-right-arrow-alt"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="payment-summary-section1">
            <h3><i className="bx bx-credit-card"></i> Payment Summary</h3>
            <div className="payment-details">
              <div className="payment-row">
                <span>Subtotal</span>
                <span className="amount">₹{order.orderTotal}</span>
              </div>
              <div className="payment-row">
                <span>Shipping Fee</span>
                <span className="amount free">FREE</span>
              </div>
              <div className="payment-divider"></div>
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
          <i className="bx bx-error-circle"></i>
          <h2>Order Not Found</h2>
          <p>Sorry, we couldn't find the order you're looking for.</p>
          <button className="back-to-orders" onClick={handleBackClick}>
            Back to My Orders
          </button>
        </div>
      )}
    </div>
  );
}

export default OrderedProductpreview;
