import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import "../css/OrdersControlatempadmin.css";
import { useNavigate } from "react-router-dom";

function OrdersControlatempadmin() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get the current user
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      // Reference to the Firebase database
      const db = getDatabase();
      const ordersRef = ref(db, "orderstempadmin");
      
      // Fetch orders data
      onValue(ordersRef, (snapshot) => {
        const uniqueOrders = {};
        const grandTotalList = [];
        
        if (snapshot.exists()) {
          snapshot.forEach((userSnapshot) => {
            userSnapshot.forEach((orderSnapshot) => {
              const name = orderSnapshot.child("name0").val();
              const uri = orderSnapshot.child("uri0").val();
              const grandTotal = orderSnapshot.child("grandTotal0").val();
              const orderId = orderSnapshot.child("orderid0").val();
              const username = orderSnapshot.child("username").val();
              const delivered = orderSnapshot.child("delivered").val();
              const userId = orderSnapshot.child("userid0").val();
              
              // Only add delivered orders and avoid duplicates
              if (delivered === true && !uniqueOrders[orderId]) {
                const orderData = {
                  name,
                  uri,
                  grandTotal,
                  orderId,
                  delivered,
                  username,
                  userId // Store the userId for navigation
                };
                
                uniqueOrders[orderId] = orderData;
                grandTotalList.push(parseFloat(grandTotal));
              }
            });
          });
          
          // Calculate total amount
          const totalOrdersAmount = grandTotalList.reduce((sum, amount) => sum + amount, 0);
          
          // Update state with the orders and total
          const ordersList = Object.values(uniqueOrders);
          setOrders(ordersList);
          setFilteredOrders(ordersList);
          setTotalAmount(totalOrdersAmount);
        }
        
        setLoading(false);
      }, (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      });
    }
  }, []);
  
  // Handle search input changes with debounce
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchText) {
        const filtered = orders.filter(order => 
          order.orderId.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredOrders(filtered);
      } else {
        setFilteredOrders(orders);
      }
    }, 300);
    
    return () => clearTimeout(debounceTimeout);
  }, [searchText, orders]);
  
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };
  
  // Handle click on order item to navigate to order preview
  const handleOrderClick = (order) => {
    navigate(`/tempadmin/xeroxorderpreview?id=${order.orderId}&gt=${order.grandTotal}&userid=${order.userId}`);
  };
  
  return (
    <div className="orders-container">
      <div className="orders-dashboard">
        <div className="dashboard-header">
          <h2 className="orders-title">Delivered Orders</h2>
          <div className="total-amount-card">
            <div className="total-amount-icon">
              <i className="bx bx-money"></i>
            </div>
            <div className="total-amount-content">
              <span className="total-amount-label">Total Revenue</span>
              <h3 className="total-amount-value">₹{totalAmount.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        
        <div className="search-container">
          <i className="bx bx-search search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="Search by order ID"
            value={searchText}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="orders-summary">
          <div className="summary-card">
            <h4>Total Orders</h4>
            <span className="summary-value">{filteredOrders.length}</span>
          </div>
          <div className="summary-card">
            <h4>Avg. Order Value</h4>
            <span className="summary-value">
              ₹{filteredOrders.length > 0 
                ? (totalAmount / filteredOrders.length).toFixed(2) 
                : '0.00'}
            </span>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Loading orders...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div 
              key={order.orderId} 
              className="order-item"
              onClick={() => handleOrderClick(order)}
            >
              <div className="order-header">
                <h3>Order ID: {order.orderId}</h3>
                <span className="order-status">
                  <i className="bx bx-check-circle"></i> Delivered
                </span>
              </div>
              <div className="order-details">
                <div className="order-info">
                  <p><i className="bx bx-package"></i> <strong>Item:</strong> {order.name}</p>
                  <p><i className="bx bx-user"></i> <strong>Customer:</strong> {order.username}</p>
                </div>
                <div className="order-amount">
                  <span className="amount-label">Amount</span>
                  <span className="amount-value">₹{order.grandTotal}</span>
                </div>
              </div>
              <div className="order-footer">
                <button className="view-details-btn">
                  <i className="bx bx-show"></i> View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-orders">
          <i className="bx bx-package empty-icon"></i>
          <h3>No Orders Found</h3>
          <p>No delivered orders match your search criteria</p>
        </div>
      )}
    </div>
  );
}

export default OrdersControlatempadmin;