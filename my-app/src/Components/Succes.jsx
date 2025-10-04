import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Success() {
  const navigate = useNavigate();
  const [showAnimation, setShowAnimation] = useState(true);
  
  useEffect(() => {
    // Set a timeout to redirect after 2 seconds
    const redirectTimeout = setTimeout(() => {
      setShowAnimation(false);
      navigate('/'); // Navigate to home page
    }, 2000);
    
    // Clean up the timeout if component unmounts
    return () => clearTimeout(redirectTimeout);
  }, [navigate]);
  
  return (
    <div className="success-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      {showAnimation && (
        <>
          <div className="checkmark-circle" style={{
            position: 'relative',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#4BB543',
            marginBottom: '20px'
          }}>
            <div className="checkmark" style={{
              color: 'white',
              fontSize: '50px',
              fontWeight: 'bold'
            }}>
              ✓
            </div>
          </div>
          <h1 style={{
            color: '#333',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            Order Confirmed
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            marginTop: '10px'
          }}>
            Redirecting to home...
          </p>
        </>
      )}
    </div>
  );
}

export default Success;