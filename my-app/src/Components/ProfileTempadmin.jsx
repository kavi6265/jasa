import React, { useState, useEffect } from "react";
import { auth, database } from "./firebase";
import { useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import "../css/ProfileTempadmin.css";

function ProfileTempadmin() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get userId from localStorage instead of auth.currentUser
    const userId = localStorage.getItem("userId");

    if (!userId) {
      navigate("/login");
      return;
    }

    // Reference to the tempadmin1 data path
    const userRef = ref(database, `tempadmin1/${userId}`);

    const unsubscribe = onValue(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setUserData(snapshot.val());
        } else {
          // Fallback data if tempadmin1 data doesn't exist
          const email = localStorage.getItem("userEmail") || "";
          setUserData({
            name: "Tempadmin",
            email: email,
            phno: "",
            profileImageUrl: "/person3.jpg",
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching tempadmin data:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      auth
        .signOut()
        .then(() => {
          // Clear all user data from localStorage
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userId");
          localStorage.removeItem("userRole");
          localStorage.removeItem("selectedOrder");

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
            <h1>{userData?.name || "Tempadmin"}</h1>
            <p>{userData?.email}</p>
          </div>
        </div>

        <div className="profile-card">
          <h2>Admin Information</h2>
          <div className="profile-details">
            <div className="detail-row">
              <div className="detail-label">Name</div>
              <div className="detail-value">
                {userData?.name || "Tempadmin"}
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Email</div>
              <div className="detail-value">{userData?.email}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Phone</div>
              <div className="detail-value">
                {userData?.phone || "Not provided"}
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Role</div>
              <div className="detail-value">Temporary Admin</div>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button
            onClick={() => navigate("/tempadmin/xeroxallordersadmin")}
            className="action-button xerox"
          >
            <span className="action-icon">📄</span>
            <span>Xerox Orders</span>
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

export default ProfileTempadmin;
