
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import '../css/XeroxAllordersAdmin.css';

function XeroxAllordersmAdmin() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  
  const database = getDatabase();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const pdfsRef = ref(database, 'pdfs');
        const pdfsSnapshot = await get(pdfsRef);
        
        const allOrders = [];
        
        if (pdfsSnapshot.exists()) {
          // Loop through all users
          pdfsSnapshot.forEach((userSnapshot) => {
            const userId = userSnapshot.key;
            
            userSnapshot.forEach((uniqueIdSnapshot) => {
              uniqueIdSnapshot.forEach((fileSnapshot) => {
                const name = fileSnapshot.child('name0').val();
                const uri = fileSnapshot.child('uri0').val();
                const grandTotal = fileSnapshot.child('grandTotal0').val();
                const orderId = fileSnapshot.child('orderid0').val();
                const delivered = fileSnapshot.child('delivered').val() || false;
                const username = fileSnapshot.child('username').val() || 'Unknown';
                
                // Add order with user information
                allOrders.push({
                  name,
                  uri,
                  grandTotal,
                  orderId,
                  delivered,
                  username,
                  userId
                });
              });
            });
          });
        }
        
        // Sort orders by delivery status (pending first) and then by orderId
        const sortedOrders = allOrders.sort((a, b) => {
          if (a.delivered === b.delivered) {
            return b.orderId.localeCompare(a.orderId); // Newest first
          }
          return a.delivered ? 1 : -1; // Pending orders first
        });
        
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
      } catch (error) {
        console.error('Error fetching all orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllOrders();
  }, []);
  
  // Filter orders based on search text (with debounce)
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchText.trim() === '') {
        setFilteredOrders(orders);
      } else {
        const searchLower = searchText.toLowerCase();
        const filtered = orders.filter(order => 
          order.orderId.toLowerCase().includes(searchLower) ||
          order.username.toLowerCase().includes(searchLower)
        );
        setFilteredOrders(filtered);
      }
    }, 300);
    
    return () => clearTimeout(debounceTimeout);
  }, [searchText, orders]);
  
  const handleOrderClick = (order) => {
    navigate(`/admin/xeroxorderpreview?id=${order.orderId}&gt=${order.grandTotal}&userid=${order.userId}`);
  };
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return (
    <div className="xerox-admin-orders-container">
      <h2>All Xerox Orders</h2>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Order ID or Username..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
        />
        <span className="search-icon">🔍</span>
      </div>
      
      <div className="orders-summary">
        <div className="summary-card">
          <h3>Total Orders</h3>
          <p>{orders.length}</p>
        </div>
        <div className="summary-card pending">
          <h3>Pending</h3>
          <p>{orders.filter(order => !order.delivered).length}</p>
        </div>
        <div className="summary-card delivered">
          <h3>Delivered</h3>
          <p>{orders.filter(order => order.delivered).length}</p>
        </div>
      </div>
      
      {filteredOrders.length === 0 ? (
        <div className="no-orders-message">
          <p>No orders found</p>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div 
              key={order.orderId} 
              className={`order-item ${order.delivered ? 'delivered-order' : 'pending-order'}`}
              onClick={() => handleOrderClick(order)}
            >
              <div className="order-info">
                <div className="order-header">
                  <div className="order-id">
                    <strong>Order ID:</strong> {order.orderId}
                  </div>
                  <div className={`delivery-status ${order.delivered ? 'delivered' : 'pending'}`}>
                    {order.delivered ? 'Delivered' : 'Pending'}
                  </div>
                </div>
                
                <div className="order-details">
                  <div className="detail">
                    <strong>Username:</strong> {order.username}
                  </div>
                  <div className="detail">
                    <strong>Document:</strong> {order.name}
                  </div>
                  <div className="detail">
                    <strong>Total:</strong> ₹{order.grandTotal}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default XeroxAllordersmAdmin;