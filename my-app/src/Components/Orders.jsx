import React, { useState, useEffect } from "react";
import { database } from "./firebase";
import { ref, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import "../css/Order.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = window.location;
  const isAdminView = location.pathname.includes("/admin/");

  // ✅ Static mapping embedded here
  const imageMapping = {
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

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const ordersRef = ref(database, "userorders");
      const snapshot = await get(ordersRef);

      if (!snapshot.exists()) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const allUsersData = snapshot.val();
      const allOrders = [];

      Object.entries(allUsersData || {}).forEach(([userId, userOrders]) => {
        if (!userOrders || typeof userOrders !== "object") return;

        Object.entries(userOrders).forEach(([orderId, orderData]) => {
          if (!orderData || typeof orderData !== "object") return;

          if (!orderData.delivered) {
            let products = [];

            if (orderData.items && typeof orderData.items === "object") {
              products = Object.values(orderData.items).map((item) =>
                item && typeof item === "object" ? item : {}
              );
            } else {
              const metaFields = [
                "address",
                "phno",
                "username",
                "orderTimestamp",
                "orderTotal",
                "ordered",
                "delivered",
                "notes",
              ];
              products = Object.keys(orderData)
                .filter(
                  (k) =>
                    !metaFields.includes(k) &&
                    orderData[k] &&
                    typeof orderData[k] === "object"
                )
                .map((k) => orderData[k]);
            }

            allOrders.push({
              orderId: orderId || Math.random().toString(),
              userId: userId || "unknown",
              products,
              orderTimestamp: orderData.orderTimestamp || 0,
              ...orderData,
            });
          }
        });
      });

      allOrders.sort(
        (a, b) => (b.orderTimestamp || 0) - (a.orderTimestamp || 0)
      );
      setOrders(allOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Use mapping + fallback
  const getImageUrl = (imageValue) => {
    const fallback = "/unknowenprofile.png";
    if (!imageValue) return fallback;

    const strVal = String(imageValue).trim();
    if (!strVal) return fallback;

    if (strVal.startsWith("http://") || strVal.startsWith("https://")) {
      return strVal;
    }
    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(strVal)) {
      return `/${strVal}`;
    }
    if (imageMapping[strVal]) {
      return `/${imageMapping[strVal]}`;
    }
    return fallback;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOrderClick = (order) => {
    if (!order || !order.userId || !order.orderId) return;
    const path = isAdminView
      ? `/admin/OrderedProductpreviewadmin/${order.userId}/${order.orderId}`
      : `/OrderedProductpreview/${order.userId}/${order.orderId}`;
    navigate(path);
  };

  const safeOrders = Array.isArray(orders) ? orders : [];

  return (
    <div className="orders-containera">
      <div className="orders-headera">
        <h1>{isAdminView ? "Manage Orders" : "My Orders"}</h1>
      </div>

      {loading ? (
        <div className="loading-containera">
          <div className="loading-spinnera"></div>
          <p>Loading your orders...</p>
        </div>
      ) : error ? (
        <div className="error-containera">
          <p>{error}</p>
          <button onClick={fetchAllOrders}>Try Again</button>
        </div>
      ) : safeOrders.length === 0 ? (
        <div className="empty-ordersa">
          <h2>No Pending Orders Found</h2>
          {!isAdminView && (
            <button
              className="shop-now-btna"
              onClick={() => navigate("/shop")}
            >
              Shop Now
            </button>
          )}
        </div>
      ) : (
        <div className="orders-lista">
          {safeOrders.map((order) => {
            const products = Array.isArray(order.products)
              ? order.products
              : [];

            return (
              <div
                key={order.orderId}
                className="order-carda"
                onClick={() => handleOrderClick(order)}
              >
                {/* Header */}
                <div className="order-headera">
                  <div className="order-infoa">
                    <span className="order-ida">
                      Order #{order.orderId.substring(0, 8)}
                    </span>
                    <span className="order-datea">
                      {formatDate(order.orderTimestamp)}
                    </span>
                  </div>
                  <div className="order-statusa">
                    {order.delivered ? (
                      <span className="status-badge delivered">Delivered</span>
                    ) : order.ordered ? (
                      <span className="status-badge pending">Processing</span>
                    ) : (
                      <span className="status-badge pending">Pending</span>
                    )}
                  </div>
                </div>

                {/* Products */}
                <div className="order-productsa">
                  {products.map((item, index) => {
                    const imgSrc = getImageUrl(item?.productimage);
                    const altText = item?.productname || "Product";
                    return (
                      <div key={index} className="product-itema">
                        <div className="product-imagea">
                          <img
                            src={imgSrc}
                            alt={altText}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/unknowenprofile.png";
                            }}
                          />
                        </div>
                        <div className="product-detailsa">
                          <h3>{item?.productname}</h3>
                          <div className="product-metaa">
                            <span className="product-qtyA">
                              Qty: {item?.qty || 1}
                            </span>
                            <span className="product-pricea">
                              ₹{item?.productamt || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="order-footera">
                  <div className="shipping-infoa">
                    <h4>Shipping Details</h4>
                    <p>
                      <strong>Name:</strong> {order.username}
                    </p>
                    <p>
                      <strong>Phone:</strong> {order.phno}
                    </p>
                    <p>
                      <strong>Address:</strong> {order.address}
                    </p>
                    {order.notes && (
                      <p>
                        <strong>Notes:</strong> {order.notes}
                      </p>
                    )}
                  </div>
                  <div className="order-summarya">
                    <div className="total-amounta">
                      <span>Total Amount:</span>
                      <span className="amounta">₹{order.orderTotal}</span>
                    </div>
                    <button className="track-order-btna">View Details</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Orders;
