import React, { useState, useEffect } from 'react';
import { database, auth } from './firebase'; 
import { ref, get } from 'firebase/database';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/ProductsAllordersadmin.css';

function ProductsAllordersadmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  const navigate = useNavigate();
  const isAdminView = location.pathname.includes('/admin/');

  useEffect(() => {
    fetchAllOrders();
  }, []); // Empty dependency array means this runs once on component mount
  
  const fetchAllOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const ordersUsersRef = ref(database, 'userorders');
      
      const snapshot = await get(ordersUsersRef);
      
      if (snapshot.exists()) {
        const allUsersData = snapshot.val();
        const allOrders = [];
        
        Object.keys(allUsersData).forEach(userId => {
          const userOrders = allUsersData[userId];
          
          Object.keys(userOrders).forEach(orderId => {
            if (userOrders[orderId] && typeof userOrders[orderId] === 'object') {
              
                const orderData = userOrders[orderId];
                const products = [];
                
                // Metadata fields to exclude from products array
                const metadataFields = ['address', 'phno', 'username', 'orderTimestamp', 
                                     'orderTotal', 'ordered', 'delivered', 'notes'];
                
                Object.keys(orderData).forEach(key => {
                  if (!metadataFields.includes(key) && 
                      orderData[key] && 
                      typeof orderData[key] === 'object' && 
                      orderData[key].productname) {
                    products.push(orderData[key]);
                  }
                });
                
                allOrders.push({
                  orderId: orderId,
                  userId: userId,
                  products: products,
                  ...userOrders[orderId]
                });
              
            }
          });
        });
        
        if (allOrders.length > 0) {
          allOrders.sort((a, b) => {
            const timestampA = a.orderTimestamp || 0;
            const timestampB = b.orderTimestamp || 0;
            return timestampB - timestampA;
          });
          setOrders(allOrders);
        } else {
          setOrders([]);
        }
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format timestamp
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

  const handleOrderClick = (order) => {
    if (isAdminView) {
      // Admin context - navigate to admin preview
      navigate(`/admin/OrderedProductpreviewadmin/${order.userId}/${order.orderId}`);
    } else {
      // Regular user context - use existing route
      navigate(`/OrderedProductpreview/${order.userId}/${order.orderId}`);
    }
  };
  
  const getImageFilename = (imageId) => {
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
        // other mappings
      };
    
    
    const filename = IMAGE_ID_MAPPING[imageId.toString()] || "unknowenprofile.png";
  
   
    return `/${filename}`;
  };

  // Helper function to determine order status
  const getOrderStatus = (order) => {
    if (order.delivered) {
      return { className: "status-deliveredp", text: "Delivered" };
    } else if (order.ordered) {
      return { className: "status-processingp", text: "Processing" };
    } else {
      return { className: "status-pendingp", text: "Pending" };
    }
  };

  return (
    <div className="orders-containerp">
      <div className="orders-headerp">
        
        <h1>{isAdminView ? "All Customer Orders" : "My Orders"}</h1>
      </div>

      {loading ? (
        <div className="loading-containerp">
          <div className="loading-spinnerp"></div>
          <p>Loading orders...</p>
        </div>
      ) : error ? (
        <div className="error-containerp">
          <p>{error}</p>
          <button className="retry-buttonp" onClick={fetchAllOrders}>Try Again</button>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-ordersp">
          <i className="bx bx-package empty-iconp"></i>
          <h2>No Orders Found</h2>
          <p>{isAdminView ? "There are no orders to process." : "You don't have any orders yet."}</p>
          {!isAdminView && (
            <button className="shop-now-btnp" onClick={() => window.location.href = '/shop'}>
              Shop Now
            </button>
          )}
        </div>
      ) : (
        <div className="orders-listp">
          {orders.map((order) => {
            const statusInfo = getOrderStatus(order);
            
            return (
              <div key={order.orderId} className="order-cardp" onClick={() => handleOrderClick(order)}>
                <div className="order-headerp">
                  <div className="order-infop">
                    <span className="order-idp">Order #{order.orderId.substring(0, 8)}</span>
                    <span className="order-datep">{formatDate(order.orderTimestamp)}</span>
                  </div>
                  <div className="order-statusp">
                    <span className={statusInfo.className}>{statusInfo.text}</span>
                  </div>
                </div>
                
                <div className="order-productsp">
                  {order.products.map((product, index) => (
                    <div key={index} className="product-itemp">
                      <div className="product-imagep">
                        <img 
                          src={getImageFilename(product.productimage)} 
                          alt={product.productname}  
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/unknowenprofile.png";
                          }}  
                        />
                      </div>
                      <div className="product-detailsp">
                        <h3>{product.productname}</h3>
                        <div className="product-metap">
                          <span className="product-qtyp">Qty: {product.qty}</span>
                          <span className="product-pricep">₹{product.productamt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="order-footerp">
                  <div className="shipping-infop">
                    <h4>Shipping Details</h4>
                    <p><strong>Name:</strong> {order.username}</p>
                    <p><strong>Phone:</strong> {order.phno}</p>
                    <p><strong>Address:</strong> {order.address}</p>
                    {order.notes && <p><strong>Notes:</strong> {order.notes}</p>}
                  </div>
                  <div className="order-summaryp">
                    <div className="total-amountp">
                      <span>Total Amount:</span>
                      <span className="amountp">₹{order.orderTotal}</span>
                    </div>
                    <button className="track-order-btnp">
                      View Details
                    </button>
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

export default ProductsAllordersadmin;