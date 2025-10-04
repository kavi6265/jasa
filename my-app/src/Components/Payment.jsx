import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getDatabase, ref as dbRef, set, get, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import "../css/Payment.css";

function Payment() {
  const [address, setAddress] = useState("");
  const [isAddressSelected, setIsAddressSelected] = useState(false);
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState("");
  const [deliveryTimeSlots, setDeliveryTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderInfo, setOrderInfo] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const database = getDatabase();
  
  useEffect(() => {
    // Get order info from navigation state
    if (location.state && location.state.orderInfo) {
      setOrderInfo(location.state.orderInfo);
      setTotalAmount(location.state.orderInfo.totalCost);
    } else {
      // If no order info is available, try to get from sessionStorage or redirect
      const storedTotalCost = sessionStorage.getItem('totalCost');
      if (storedTotalCost) {
        setTotalAmount(parseFloat(storedTotalCost));
      } else {
        navigate('/xerox');
        return;
      }
    }
    
    // Fetch user's address from database
    fetchUserAddress();
    
    // Generate delivery time slots based on current time
    generateDeliveryTimeSlots();
  }, [location, navigate]);
  
  const generateDeliveryTimeSlots = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const timeSlots = [];
    
    // Helper function to get day label
    const getDayLabel = (daysFromToday) => {
      if (daysFromToday === 0) return "Today";
      if (daysFromToday === 1) return "Tomorrow";
      const date = new Date(Date.now() + daysFromToday * 24 * 60 * 60 * 1000);
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };
    
    // Time slot definitions
    const morningSlot = "8:30 AM to 9:30 AM";
    const afternoonSlot = "12:30 PM to 2:00 PM";
    const eveningSlot = "4:00 PM to 5:00 PM";
    
    // Logic based on current time
    if (currentHour < 9) {
      // Before 9 AM - show today afternoon and evening, plus tomorrow all slots
      timeSlots.push({
        id: 'today-afternoon',
        label: `${afternoonSlot} (${getDayLabel(0)})`,
        value: `${afternoonSlot} - ${getDayLabel(0)}`,
        date: new Date().toDateString()
      });
      timeSlots.push({
        id: 'today-evening',
        label: `${eveningSlot} (${getDayLabel(0)})`,
        value: `${eveningSlot} - ${getDayLabel(0)}`,
        date: new Date().toDateString()
      });
      
      // Add tomorrow's all slots
      timeSlots.push({
        id: 'tomorrow-morning',
        label: `${morningSlot} (${getDayLabel(1)})`,
        value: `${morningSlot} - ${getDayLabel(1)}`,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString()
      });
      timeSlots.push({
        id: 'tomorrow-afternoon',
        label: `${afternoonSlot} (${getDayLabel(1)})`,
        value: `${afternoonSlot} - ${getDayLabel(1)}`,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString()
      });
      timeSlots.push({
        id: 'tomorrow-evening',
        label: `${eveningSlot} (${getDayLabel(1)})`,
        value: `${eveningSlot} - ${getDayLabel(1)}`,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString()
      });
      
    } else if (currentHour >= 9 && currentHour < 12) {
      // Between 9 AM to 12 PM - show today evening and tomorrow all slots
      timeSlots.push({
        id: 'today-evening',
        label: `${eveningSlot} (${getDayLabel(0)})`,
        value: `${eveningSlot} - ${getDayLabel(0)}`,
        date: new Date().toDateString()
      });
      
      // Add tomorrow's all slots
      timeSlots.push({
        id: 'tomorrow-morning',
        label: `${morningSlot} (${getDayLabel(1)})`,
        value: `${morningSlot} - ${getDayLabel(1)}`,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString()
      });
      timeSlots.push({
        id: 'tomorrow-afternoon',
        label: `${afternoonSlot} (${getDayLabel(1)})`,
        value: `${afternoonSlot} - ${getDayLabel(1)}`,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString()
      });
      timeSlots.push({
        id: 'tomorrow-evening',
        label: `${eveningSlot} (${getDayLabel(1)})`,
        value: `${eveningSlot} - ${getDayLabel(1)}`,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString()
      });
      
    } else if (currentHour >= 12 && currentHour < 19) {
      // Between 12 PM to 7 PM - show tomorrow morning onwards (all tomorrow slots)
      timeSlots.push({
        id: 'tomorrow-morning',
        label: `${morningSlot} (${getDayLabel(1)})`,
        value: `${morningSlot} - ${getDayLabel(1)}`,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString()
      });
      timeSlots.push({
        id: 'tomorrow-afternoon',
        label: `${afternoonSlot} (${getDayLabel(1)})`,
        value: `${afternoonSlot} - ${getDayLabel(1)}`,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString()
      });
      timeSlots.push({
        id: 'tomorrow-evening',
        label: `${eveningSlot} (${getDayLabel(1)})`,
        value: `${eveningSlot} - ${getDayLabel(1)}`,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString()
      });
      
    } else {
      // After 7 PM - show tomorrow afternoon onwards
      timeSlots.push({
        id: 'tomorrow-afternoon',
        label: `${afternoonSlot} (${getDayLabel(1)})`,
        value: `${afternoonSlot} - ${getDayLabel(1)}`,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString()
      });
      timeSlots.push({
        id: 'tomorrow-evening',
        label: `${eveningSlot} (${getDayLabel(1)})`,
        value: `${eveningSlot} - ${getDayLabel(1)}`,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString()
      });
    }
    
    setDeliveryTimeSlots(timeSlots);
  };
  
  const fetchUserAddress = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setError("User not authenticated. Please login again.");
        return;
      }
      
      const userRef = dbRef(database, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.address) {
          setAddress(userData.address);
        }
      }
    } catch (error) {
      console.error("Error fetching user address:", error);
      setError("Failed to load address. Please enter it manually.");
    }
  };
  
  const handleAddressChange = (e) => {
    setAddress(e.target.value);
    // Update database with new address (debounce this in a real app)
    updateAddressInDatabase(e.target.value);
  };
  
  const updateAddressInDatabase = async (newAddress) => {
    if (!newAddress.trim()) return;
    
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      
      const userRef = dbRef(database, `users/${userId}`);
      await update(userRef, { address: newAddress });
    } catch (error) {
      console.error("Error updating address:", error);
    }
  };
  
  const handleDeliveryTimeChange = (timeSlot) => {
    setSelectedDeliveryTime(timeSlot.value);
  };
  
  const handleGoBack = () => {
    // Show confirmation dialog
    if (window.confirm("Are you sure you want to go back to the main screen?")) {
      navigate('/');
    }
  };
  
  const handleConfirmOrder = async () => {
    // Validate inputs
    if (!validateInputs()) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setError("User not authenticated. Please login again.");
        setIsLoading(false);
        return;
      }
      
      const orderId = orderInfo?.orderId || "order_" + Date.now().toString().substring(0, 9);
      
      // Create order details object
      const orderDetails = {
        orderId: orderId,
        userId: userId,
        address: address,
        totalAmount: totalAmount,
        paidAmount: 0,
        balanceAmount: totalAmount,
        timestamp: Date.now(),
        deliveryTime: selectedDeliveryTime
      };
      
      // Save order details to database
      const orderScreenshotsRef = dbRef(database, `uploadscreenshots/${orderId}`);
      await set(orderScreenshotsRef, orderDetails);
      
      // Update delivery time for all files
      await updateDeliveryTimeForAllFiles(orderId);
      
      // Navigate to success page
      navigate('/success');
    } catch (error) {
      console.error("Error placing order:", error);
      setError(`Failed to place order: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateDeliveryTimeForAllFiles = async (orderId) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      
      const filesRef = dbRef(database, `pdfs/${userId}/${orderId}`);
      const snapshot = await get(filesRef);
      
      if (snapshot.exists()) {
        const updatePromises = [];
        snapshot.forEach((fileSnapshot) => {
          const updateData = {
            deliveryTime: selectedDeliveryTime
          };
          updatePromises.push(update(fileSnapshot.ref, updateData));
        });
        
        await Promise.all(updatePromises);
      }
    } catch (error) {
      console.error("Error updating paid status and delivery time:", error);
    }
  };
  
  const validateInputs = () => {
    if (!address.trim()) {
      setError("Address cannot be empty");
      return false;
    }
    
    if (!isAddressSelected) {
      setError("Please select the address");
      return false;
    }
    
    if (!selectedDeliveryTime) {
      setError("Please select a delivery time");
      return false;
    }
    
    return true;
  };
  
  return (
    <div className="payment-container">
      <div className="header">
        <h1 className="title2">Payment</h1>
      </div>
      
      <div className="payment-content">
        <div className="amount-section">
          <h2>Grand Total</h2>
          <div className="amount">₹ {totalAmount.toFixed(2)}</div>
        </div>
        
        <div className="address-section">
          <h3>Delivery Address</h3>
          <textarea
            className="address-input"
            value={address}
            onChange={handleAddressChange}
            placeholder="Enter your delivery address"
            rows={4}
          />
          
          <div className="address-confirm">
            <input
              type="checkbox"
              id="confirmAddress"
              checked={isAddressSelected}
              onChange={() => setIsAddressSelected(!isAddressSelected)}
            />
            <label htmlFor="confirmAddress">Confirm this address for delivery</label>
          </div>
        </div>
        
        <div className="delivery-time-section">
          <h3>Select Delivery Time</h3>
          <div className="time-slots">
            {deliveryTimeSlots.map((timeSlot) => (
              <div key={timeSlot.id} className="time-slot-option">
                <input
                  type="radio"
                  id={timeSlot.id}
                  name="deliveryTime"
                  value={timeSlot.value}
                  checked={selectedDeliveryTime === timeSlot.value}
                  onChange={() => handleDeliveryTimeChange(timeSlot)}
                />
                <label htmlFor={timeSlot.id} className="time-slot-label">
                  {timeSlot.label}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <button
          className="order-button"
          onClick={handleConfirmOrder}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}

export default Payment;