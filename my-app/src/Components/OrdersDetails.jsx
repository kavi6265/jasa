import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { database } from "./firebase";
import { ref, get } from "firebase/database";
import "../css/OrderDetail.css";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      
      try {
        const storedOrder = localStorage.getItem("selectedOrder");
        
        if (storedOrder) {
          const parsedOrder = JSON.parse(storedOrder);
          setOrder(parsedOrder);
          setLoading(false);
          return;
        }
        
        if (id) {
          const ordersUsersRef = ref(database, 'ordersusers');
          const snapshot = await get(ordersUsersRef);
          
          if (snapshot.exists()) {
            const allUsersData = snapshot.val();
            let foundOrder = null;
            
            Object.keys(allUsersData).some(userId => {
              const userOrders = allUsersData[userId];
              if (userOrders && userOrders[id]) {
                foundOrder = {
                  id: id,
                  userId: userId,
                  ...userOrders[id]
                };
                return true;
              }
              return false;
            });
            
            if (foundOrder) {
              setOrder(foundOrder);
            } else {
              setError(`Order not found: ${id}`);
            }
          } else {
            setError("No orders data available");
          }
        } else {
          setError("No order ID provided");
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Date not available";
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleProductClick = (product) => {
    try {
      // Prepare the product object to match ProductView expectations
      const productToPass = {
        img: product.img,
        name: product.productname,
        brand: product.brand || 'Unknown Brand',
        price: `₹${product.productamt}`,
        description: product.description || 'No description available'
      };

      // Navigate to product view with the prepared product object
      navigate('/product', { 
        state: { 
          product: productToPass,
          fromOrder: true 
        } 
      });
    } catch (error) {
      console.error("Error navigating to product view:", error);
    }
  };

  if (loading) {
    return (
      <div className="section-p1">
        <h2>Loading order details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-p1">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleBackClick} className="normal">Back to Orders</button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="section-p1">
        <div className="error-container">
          <h2>Order Not Found</h2>
          <p>The requested order could not be found.</p>
          <button onClick={handleBackClick} className="normal">Back to Orders</button>
        </div>
      </div>
    );
  }

  const getOrderItems = () => {
    const metadataFields = ['id', 'userId', 'address', 'phno', 'username', 'orderTimestamp', 
                           'orderTotal', 'odered', 'delivered'];
    
    return Object.keys(order)
      .filter(key => 
        !metadataFields.includes(key) && 
        order[key] && 
        typeof order[key] === 'object' && 
        order[key].productname
      )
      .map(key => order[key]);
  };

  const orderItems = getOrderItems();

  return (
    <div>
      <section id="page-header" className="about-header">
        <h2>#Order Details</h2>
        <p>Order #{order.id && order.id.slice(-8)}</p>
      </section>

      <section id="order-detail" className="section-p1">
        <div className="order-detail-container">
          <div className="order-header">
            <button onClick={handleBackClick} className="back-button">← Back to Orders</button>
            <div className="order-status">
              <span className={order.delivered ? "status-delivered" : "status-processing"}>
                {order.delivered ? "Delivered" : "Processing"}
              </span>
            </div>
          </div>

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="order-info">
              <div className="info-item">
                <span className="label">Order ID:</span>
                <span className="value">{order.id}</span>
              </div>
              <div className="info-item">
                <span className="label">Date:</span>
                <span className="value">{formatDate(order.orderTimestamp)}</span>
              </div>
              <div className="info-item">
                <span className="label">Customer:</span>
                <span className="value">{order.username}</span>
              </div>
              <div className="info-item">
                <span className="label">Phone:</span>
                <span className="value">{order.phno || "Not provided"}</span>
              </div>
              <div className="info-item">
                <span className="label">Address:</span>
                <span className="value">{order.address || "Not provided"}</span>
              </div>
              <div className="info-item">
                <span className="label">Total Amount:</span>
                <span className="value price">₹{order.orderTotal}</span>
              </div>
            </div>
          </div>

          <div className="order-items">
        <h3>Order Items</h3>
        {orderItems.length === 0 ? (
          <p>No items found in this order.</p>
        ) : (
          <div className="items-container">
            {orderItems.map((item, index) => (
              <div 
                key={index} 
                className="order-item-card"
                onClick={() => handleProductClick(item)}
              >
                {item.img && (
                  <div className="item-image">
                    <img src={item.img} alt={item.productname} />
                  </div>
                )}
                <div className="item-details">
                  <h4>{item.productname}</h4>
                  <p>Price: ₹{item.productamt}</p>
                  <p>Quantity: {item.qty}</p>
                  <p>Subtotal: ₹{(item.productamt * item.qty).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
       
      </section>
    </div>
  );
};

export default OrderDetail;