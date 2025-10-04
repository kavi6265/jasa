import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, child } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import '../css/XeroxOrderuser.css';

function XeroxOrderUser() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const auth = getAuth();
  const database = getDatabase();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          // Redirect to login if not authenticated
          navigate('/login');
          return;
        }
        
        const userId = currentUser.uid;
        const pdfsRef = ref(database, 'pdfs');
        const pdfsSnapshot = await get(pdfsRef);
        
        const uniqueOrders = {};
        
        if (pdfsSnapshot.exists()) {
          // Navigate to user's orders
          const userSnapshot = pdfsSnapshot.child(userId);
          
          if (userSnapshot.exists()) {
            userSnapshot.forEach((uniqueIdSnapshot) => {
              uniqueIdSnapshot.forEach((fileSnapshot) => {
                const name = fileSnapshot.child('name0').val();
                const uri = fileSnapshot.child('uri0').val();
                const grandTotal = fileSnapshot.child('grandTotal0').val();
                const orderId = fileSnapshot.child('orderid0').val();
                const delivered = fileSnapshot.child('delivered').val() || false;
                const username = fileSnapshot.child('username').val();
                
                // Store only unique orders based on orderId
                if (!uniqueOrders[orderId]) {
                  uniqueOrders[orderId] = {
                    name,
                    uri,
                    grandTotal: grandTotal,
                    orderId,
                    delivered,
                    username
                  };
                }
              });
            });
          }
        }
        
        // Convert unique orders object to array
        const ordersList = Object.values(uniqueOrders);
        setOrders(ordersList);
        setFilteredOrders(ordersList);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [navigate]);
  
  // Filter orders based on search text (with debounce)
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchText.trim() === '') {
        setFilteredOrders(orders);
      } else {
        const filtered = orders.filter(order => 
          order.orderId.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredOrders(filtered);
      }
    }, 300);
    
    return () => clearTimeout(debounceTimeout);
  }, [searchText, orders]);
  
  const handleOrderClick = (order) => {
    // Navigate to order preview page instead of using window.location
    navigate(`/Xeroxorderpreview?id=${order.orderId}&gt=${order.grandTotal}`);
  };
  
  // Use the same loading indicator as in the Profile component
  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return (
    <div className="xerox-orders-container">
      <h2>My Xerox Orders</h2>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search order by ID..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input5"
        />
        
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
              className="order-item"
              onClick={() => handleOrderClick(order)}
            >
              <div className="order-info">
                <div className="order-id">
                  <span>Order ID:</span> {order.orderId}
                </div>
                <div className="order-total">
                  <span>Total:</span> ₹{order.grandTotal}
                </div>
                <div className="user-name">
                  <span>Name:</span> {order.username}
                </div>
                <div className={`delivery-status ${order.delivered ? 'delivered' : 'pending'}`}>
                  {order.delivered ? 'Delivered' : 'Pending'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default XeroxOrderUser;