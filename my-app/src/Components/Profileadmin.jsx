import "../css/Profileadmin.css"
import React, { useState, useEffect } from 'react';
import { auth, database } from './firebase';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';


function Profileadmin() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const userRef = ref(database, `admins/${user.uid}`);
    
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.val());
      } else {
        setUserData({
          name: user.displayName || 'Admin',
          email: user.email,
          phno: user.phno,
          profileImageUrl: user.photoURL || '/person3.jpg'
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      auth.signOut()
        .then(() => {
          localStorage.removeItem('cart');
          localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    
    // Reset all user-related state
    setUser(null);
    setProfileImageUrl(null);
    setUserRole("user");
    
    // Navigate to login page
    navigate("/login");
        })
        .catch((error) => {
          console.error("Error logging out:", error);
        });
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-cover"></div>
          <div className="profile-avatar">
            <img 
              src={userData?.profileImageUrl || "/person3.jpg"} 
              alt="Profile" 
            />
          </div>
          <div className="profile-info">
            <h1>{userData?.name || 'Admin'}</h1>
            <p>{userData?.email}</p>
          </div>
        </div>

        <div className="profile-card">
          <h2>Personal Information</h2>
          <div className="profile-details">
            <div className="detail-row">
              <div className="detail-label">Name</div>
              <div className="detail-value">{userData?.name || 'Admin'}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">Email</div>
              <div className="detail-value">{userData?.email}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">Phone</div>
              <div className="detail-value">{userData?.phno || 'Not provided'}</div>
            </div>
          </div>
        </div>

        <div className="profile-actions">
        
          
        <button
            onClick={() => navigate("/admin/XeroxAllordersmAdmin")}
            className="action-button xerox"
          >
            <span className="action-icon">📄</span>
            <span>Xerox Orders</span>
          </button>

          <button onClick={() => navigate("/admin/ProductsAllordersadmin")} className="action-button stationary">
            <span className="action-icon">📚</span>
            <span>Stationary Orders</span>
          </button>
          
          <button onClick={handleLogout} className="action-button logout">
            <span className="action-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profileadmin;