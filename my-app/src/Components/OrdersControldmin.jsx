import { useState, useEffect, useRef } from "react";
import { database } from "./firebase"; // Assuming you have Firebase configured
import { ref, onValue, remove } from "firebase/database";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../css/OrdersControldmin.css";

function OrdersControldmin() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedItems, setSelectedItems] = useState({});
  const debounceTimeout = useRef(null);
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    const ordersRef = ref(database, "orderstempadmin");

    onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const uniqueOrders = {};
        let grandTotalList = [];

        snapshot.forEach((orderIdSnapshot) => {
          orderIdSnapshot.forEach((detailsSnapshot) => {
            const orderData = detailsSnapshot.val();
            
            // Check if the property exists in the order data
            const name = orderData.name0 || '';
            const uri = orderData.uri0 || '';
            const grandTotal = orderData.grandTotal0 || '0';
            const orderId = orderData.orderid0 || '';
            const username = orderData.username || '';
            const delivered = orderData.delivered || false;
            const userId = orderData.userid0 || '';
            
            if (delivered === true && !uniqueOrders[orderId]) {
              uniqueOrders[orderId] = {
                name: name,
                uri: uri,
                grandTotal0: grandTotal,
                orderid0: orderId,
                delivered: delivered,
                username: username,
                userid0: userId // Store the userid0 property
              };
              
              grandTotalList.push(parseFloat(grandTotal) || 0);
            }
          });
        });

        // Calculate total amount
        const totalAmount = grandTotalList.reduce((acc, curr) => acc + curr, 0);
        setTotalAmount(totalAmount);

        // Convert object to array for rendering
        const ordersArray = Object.values(uniqueOrders);
        setOrders(ordersArray);
        setFilteredOrders(ordersArray);
        setLoading(false);
      } else {
        setOrders([]);
        setFilteredOrders([]);
        setLoading(false);
      }
    });
  }, []);

  const handleSearch = (text) => {
    setSearchText(text);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      if (text.trim() === "") {
        setFilteredOrders(orders);
      } else {
        const filtered = orders.filter((order) =>
          order.orderid0.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredOrders(filtered);
      }
    }, 300);
  };

  const toggleSelectItem = (orderId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const deleteSelectedItems = () => {
    const selectedOrderIds = Object.keys(selectedItems).filter(
      (key) => selectedItems[key]
    );

    if (selectedOrderIds.length === 0) return;

    selectedOrderIds.forEach((orderId) => {
      const orderRef = ref(database, `orderstempadmin/${orderId}`);
      remove(orderRef)
        .then(() => {
          console.log(`Order ${orderId} deleted successfully`);
          // Update local state to remove deleted items
          setOrders((prev) =>
            prev.filter((order) => order.orderid0 !== orderId)
          );
          setFilteredOrders((prev) =>
            prev.filter((order) => order.orderid0 !== orderId)
          );
          // Clear selection state for the deleted item
          setSelectedItems((prev) => {
            const newSelection = { ...prev };
            delete newSelection[orderId];
            return newSelection;
          });
        })
        .catch((error) => {
          console.error(`Error deleting order ${orderId}:`, error);
        });
    });
  };

  const navigateToOrderDetails = (orderId, grandTotal, userId) => {
    console.log("Navigating with userId:", userId);
    // Navigate to XeroxOrderPreview with required parameters
    navigate(
      `/admin/xeroxorderpreview?id=${orderId}&gt=${grandTotal}&userid=${userId || ''}`
    );
  };

  return (
    <div className="orders-admin-container">
      <div className="orders-admin-header">
        <h2>Orders Management</h2>
        <div className="total-amount">
          <span>Total Amount: </span>
          <span className="amount">₹ {totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input-container">
          <i className="search-icon">🔍</i>
          <input
            type="text"
            placeholder="Search by Order ID"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="delete-button" onClick={deleteSelectedItems}>
          Delete Selected
        </button>
      </div>

      {loading ? (
        <div className="profile-loading">
          <div className="spinner"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="no-orders">No orders found</div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div
              key={order.orderid0}
              className="order-item"
              onClick={() =>
                navigateToOrderDetails(
                  order.orderid0,
                  order.grandTotal0,
                  order.userid0
                )
              }
            >
              <div
                className="order-checkbox"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelectItem(order.orderid0);
                }}
              >
                <input
                  type="checkbox"
                  checked={!!selectedItems[order.orderid0]}
                  onChange={() => {}} // Controlled component needs onChange handler
                />
              </div>
              <div className="order-details">
                <div className="order-id">Order ID: {order.orderid0}</div>
                <div className="order-username">Customer: {order.username}</div>
                <div className="order-total">Total: ₹ {order.grandTotal0}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersControldmin;