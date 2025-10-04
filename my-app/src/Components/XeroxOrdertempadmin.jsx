import { useState, useEffect, useRef } from "react";
import { ref, onValue, getDatabase } from "firebase/database";
import { useNavigate } from "react-router-dom";
import "../css/XeroxOrdertempadmin.css";

function XeroxOrdertempadmin() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const debounceTimerRef = useRef(null);
  const navigate = useNavigate();

  const handleOrderClick = (order) => {
    // Navigate to order preview page with correct parameters using the order object
    navigate(`/tempadmin/XeroxOrderpreviewtempadmin/${order.userId}/${order.orderId}/${order.grandTotal}`);
  };

  useEffect(() => {
    // Initialize Firebase database reference
    const database = getDatabase();
    const pdfsRef = ref(database, "pdfs");

    // Fetch orders from Firebase
    onValue(pdfsRef, (snapshot) => {
      try {
        const uniqueOrders = {};
        
        // Process the data to properly capture userId and orderId
        snapshot.forEach((userIdSnapshot) => {
          const userId = userIdSnapshot.key; // This is the userId
          
          userIdSnapshot.forEach((orderIdSnapshot) => {
            const orderId = orderIdSnapshot.key; // This is the orderId
            
            // Check if at least one file in this order is not delivered
            let someFileNotDelivered = false;
            let orderData = null;
            
            orderIdSnapshot.forEach((fileSnapshot) => {
              const fileData = fileSnapshot.val();
              
              // If this is the first file we've seen for this order, or we haven't found any undelivered files yet
              if (!orderData) {
                orderData = {
                  name: fileData.name0,
                  uri: fileData.uri0,
                  grandTotal: fileData.grandTotal0,
                  orderId: orderId,
                  delivered: fileData.delivered || false,
                  username: fileData.username,
                  userId: userId // Store the userId
                };
              }
              
              // Check if this file is not delivered
              if (!fileData.delivered) {
                someFileNotDelivered = true;
              }
            });
            
            // Only add this order if we have data and at least one file is not delivered
            if (orderData && someFileNotDelivered && !uniqueOrders[orderId]) {
              uniqueOrders[orderId] = orderData;
            }
          });
        });

        // Convert to array for rendering
        const ordersArray = Object.values(uniqueOrders);
        setOrders(ordersArray);
        setFilteredOrders(ordersArray);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    }, (error) => {
      console.error("Database error:", error);
      setLoading(false);
    });
  }, []);

  // Handle search with debounce
  const handleSearch = (e) => {
    const text = e.target.value;
    setSearchText(text);

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new timer for filtering
    debounceTimerRef.current = setTimeout(() => {
      filterOrders(text);
    }, 300);
  };

  // Filter orders based on search text
  const filterOrders = (text) => {
    if (!text.trim()) {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter(order => 
      order.orderId.toLowerCase().includes(text.toLowerCase()) ||
      (order.username && order.username.toLowerCase().includes(text.toLowerCase()))
    );
    setFilteredOrders(filtered);
  };

  return (
    <div className="temp-admin-containero">
      <div className="search-containero">
        <div className="search-input-wrappero">
          <i className="search-icono fas fa-search"></i>
          <input
            type="text"
            className="search-inputo"
            placeholder="Search by Order ID or Username"
            value={searchText}
            onChange={handleSearch}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-containero">
          <div className="spinnero"></div>
          <p>Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="no-orders-messageo">
          <p>No orders found</p>
        </div>
      ) : (
        <div className="orders-listo">
          {filteredOrders.map((order) => (
            <div 
              key={order.orderId} 
              className="order-cardo"
              onClick={() => handleOrderClick(order)}
            >
              <div className="order-headero">
                <span className="order-ido">Order #{order.orderId}</span>
              </div>
              <div className="order-detailso">
                <div className="customer-infoo">
                  <span className="customer-nameo">{order.username}</span>
                  <span className="document-nameo">{order.name}</span>
                </div>
                <div className="price-tago">
                  <span>₹ {order.grandTotal}</span>
                </div>
              </div>
              <div className="order-statuso">
                <span className="status-indicatoro pendingo"></span>
                <span className="status-texto">Processing</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default XeroxOrdertempadmin;