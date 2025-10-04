import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { auth, database } from './firebase';
import { ref, onValue } from 'firebase/database';
import "../css/Tempadmin.css";

function Tempadmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navbarRef = useRef(null);

  // Get user details from localStorage
  const userId = localStorage.getItem("userId");
  const userEmail = localStorage.getItem("userEmail");

  const getActiveClass = (path) => (location.pathname === path ? "active" : "");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navigateToProfile = () => {
    navigate("/tempadmin/profile");
  };

  // Fetch user profile image
  useEffect(() => {
    if (userId) {
      const userRef = ref(database, `users/${userId}`);
      
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData && userData.profileImageUrl) {
          setProfileImageUrl(userData.profileImageUrl);
        } else {
          // Always use person3.jpg as the default profile image
          setProfileImageUrl("/person3.jpg");
        }
      }, (error) => {
        console.error("Error fetching user profile:", error);
        setProfileImageUrl("/person3.jpg"); // Use default image on error
      });
    } else {
      setProfileImageUrl("/person3.jpg"); // Use default image if no userId
    }
  }, [userId]);

  // Close menu when clicking outside navbar
  useEffect(() => {
    function handleClickOutside(event) {
      if (navbarRef.current && !navbarRef.current.contains(event.target) && isMenuOpen) {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close menu when route changes
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  return (
    <div className="tempadmin-containero">
      <header className="header-container">
        <div className="header-content">
          <div className="header-logo">
            <h3>Xerox Shop Panel</h3>
          </div>

          <div ref={navbarRef} className="navbar-container">
            <nav className={`navbar ${isMenuOpen ? "active" : ""}`}>
              <div className="menu-header">
                <h4>Menu</h4>
                <button className="close-btn" onClick={closeMenu}>
                  <i className="bx bx-x"></i>
                </button>
              </div>

              <div className="nav-actions">
                <ul className="nav-links">
                  <li>
                    <Link 
                      to="/tempadmin/XeroxOrdertempadmin" 
                      className={getActiveClass("/tempadmin/XeroxOrdertempadmin")}
                    >
                      <i className="bx bx-copy"></i>
                      <span>Xerox Orders</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/tempadmin/OrdersControlatempadmin" 
                      className={getActiveClass("/tempadmin/OrdersControlatempadmin")}
                    >
                      <i className="bx bx-list-ul"></i>
                      <span>Total Orders</span>
                    </Link>
                  </li>
                </ul>
                <div className="cart-pro">
                  <div className="profile-link" onClick={navigateToProfile}>
                    <img
                      src="/person3.jpg"
                      alt="Profile"
                      className="profile-image"
                    />
                  </div>
                </div>
              </div>
            </nav>

            {isMenuOpen && (
              <div className="navbar-backdrop" onClick={closeMenu}></div>
            )}
          </div>

          <div className="mobile-controls">
            <button className="menu-toggle" onClick={toggleMenu}>
              <i className="bx bx-menu"></i>
            </button>
          </div>
        </div>
      </header>

      <div className="tempadmin-contento">
        <Outlet />
      </div>
    </div>
  );
}

export default Tempadmin;