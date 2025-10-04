import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { auth, database } from "./Components/firebase";
import { getDatabase, ref, onValue } from "firebase/database";
import Home from "./Components/Home";
import Shop from "./Components/Shop";
import Xerox from "./Components/Xerox";
import About from "./Components/About";
import ProductsAllordersadmin from "./Components/ProductsAllordersadmin";
import ProfileTempadmin from "./Components/ProfileTempadmin";
import Contact from "./Components/Contact";
import OrderedProductpreviewadmin from "./Components/OrderedProductpreviewadmin";
import Cart from "./Components/Cart";
import Login from "./Components/Login";
import XeroxOrderpreviewtempadmin from "./Components/XeroxOrderpreviewtempadmin";
import EditProfile from "./Components/EditProfile";
import Signup from "./Components/Signup";
import XeroxAllordersAdmin from "./Components/XeroxAllordersAdmin";
import OrdersControlatempadmin from "./Components/OrdersControlatempadmin";
import Success from "./Components/Succes";
import ProductView from "./Components/ProductView";
import XeroxOrdertempadmin from "./Components/XeroxOrdertempadmin";
import OrdersControldmin from "./Components/OrdersControldmin";
import Admin from "./Components/Admin";
import Orders from "./Components/Orders";

import Tempadmincontrol from "./Components/Tempadmincontrol";
import Checkout from "./Components/Checkout";
import Profile from "./Components/Profile";
import ProductOrderUser from "./Components/ProductOrderUser";
import OrderDetail from "./Components/OrdersDetails";
import Profileadmin from "./Components/Profileadmin";
import Tempadmin from "./Components/Tempadmin";
import ConfirmOrder from "./Components/ConfirmOrder";
import OrderedProductpreview from "./Components/OrderedProductpreview";
import Payment from "./Components/Payment";
import "./css/index.css";
import XeroxOrderUser from "./Components/XeroxOrdersuser";
import Xeroxorderpreview from "./Components/Xeroxoderpreview"; 
import XeroxAllordersmAdmin from "./Components/XeroxAllordersmAdmin";
import AddProduct from "./Components/AddProduct";
import Products from "./Components/Products";

// Navbar component
function Navbar({ user, profileImageUrl }) {
  const location = useLocation();
  const navigate = useNavigate();

  // State for mobile menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Ref for clicking outside to close menu
  const navbarRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside navbar
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        navbarRef.current &&
        !navbarRef.current.contains(event.target) &&
        isMenuOpen
      ) {
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

  const getActiveClass = (path) => (location.pathname === path ? "active" : "");

  return (
    <header className="header-container">
      <div className="header-content">
        <div className="header-logo">
          <h3>Jasa Essential</h3>
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
                  <Link to="/home" className={getActiveClass("/home")}>
                    <i className="bx bx-home-alt"></i>
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className={getActiveClass("/shop")}>
                    <i className="bx bx-store"></i>
                    <span>Shop</span>
                  </Link>
                </li>
                <li>
                  <Link to="/xerox" className={getActiveClass("/xerox")}>
                    <i className="bx bx-copy"></i>
                    <span>Xerox</span>
                  </Link>
                </li>
                {/* Add cart and profile or login and signup links based on auth state */}
                {user ? (
                  <>
                    <li className="mobile-only-nav-item">
                      <Link to="/cart" className={getActiveClass("/cart")}>
                        <i className="bx bx-shopping-bag"></i>
                        <span>Cart</span>
                      </Link>
                    </li>
                    <li className="mobile-only-nav-item">
                      <Link to="/profile" className={getActiveClass("/profile")}>
                        <i className="bx bx-user"></i>
                        <span>Profile</span>
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="mobile-only-nav-item">
                      <Link to="/login" className={getActiveClass("/login")}>
                        <i className="bx bx-log-in"></i>
                        <span>Login</span>
                      </Link>
                    </li>
                    <li className="mobile-only-nav-item">
                      <Link to="/signup" className={getActiveClass("/signup")}>
                        <i className="bx bx-user-plus"></i>
                        <span>Signup</span>
                      </Link>
                    </li>
                  </>
                )}
              </ul>

              {/* Desktop view auth controls - hide on mobile */}
              {user ? (
                <div className="cart-pro desktop-only">
                  <Link
                    to="/cart"
                    className={`cart-icon ${getActiveClass("/cart")}`}
                  >
                    <i className="bx bx-shopping-bag"></i>
                  </Link>

                  <Link
                    to="/profile"
                    className={`profile-link ${getActiveClass("/profile")}`}
                  >
                    <img
                      src={profileImageUrl || "person3.jpg"}
                      alt="Profile"
                      className="profile-image"
                    />
                  </Link>
                </div>
              ) : (
                <div className="auth-buttons desktop-only">
                  <Link to="/login" className={`login-btn ${getActiveClass("/login")}`}>
                    <i className="bx bx-log-in"></i>
                    <span>Login</span>
                  </Link>
                  <Link to="/signup" className={`signup-btn ${getActiveClass("/signup")}`}>
                    <i className="bx bx-user-plus"></i>
                    <span>Signup</span>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {isMenuOpen && (
            <div className="navbar-backdrop" onClick={closeMenu}></div>
          )}
        </div>

        <div className="mobile-controls">
          {user ? (
            <>
              <Link to="/cart" className="mobile-cart">
                <i className="bx bx-shopping-bag"></i>
              </Link>
              <Link to="/profile" className="mobile-profile">
                <img
                  src={profileImageUrl || "person3.jpg"}
                  alt="Profile"
                  className="mobile-profile-image"
                />
              </Link>
            </>
          ) : (
            <Link to="/login" className="mobile-login">
              <i className="bx bx-log-in"></i>
            </Link>
          )}
          <button className="menu-toggle" onClick={toggleMenu}>
            <i className="bx bx-menu"></i>
          </button>
        </div>
      </div>
    </header>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [userRole, setUserRole] = useState("user"); // Default role
  const [loading, setLoading] = useState(true);
  const [tempAdmins, setTempAdmins] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const admins = [
    "saleem1712005@gmail.com",
    "jayaraman00143@gmail.com",
    "abcd1234@gmail.com",
  ];

  const fetchUserProfile = (userId) => {
    const db = getDatabase();
    const userRef = ref(db, `users/${userId}`);

    onValue(
      userRef,
      (snapshot) => {
        const userData = snapshot.val();
        if (userData && userData.profileImageUrl) {
          setProfileImageUrl(userData.profileImageUrl);
        } else {
          setProfileImageUrl(null);
        }
      },
      (error) => {
        console.error("Error fetching user profile:", error);
        setProfileImageUrl(null);
      }
    );
  };

  // Fetch current temp admins from Firebase
  const fetchTempAdmins = () => {
    const tempAdminsRef = ref(database, "tempadmin");

    onValue(
      tempAdminsRef,
      (snapshot) => {
        const tempAdminsList = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const tempAdminEmail = childSnapshot.child("email").val();
            if (tempAdminEmail) {
              tempAdminsList.push(tempAdminEmail.toLowerCase());
            }
          });
        }
        setTempAdmins(tempAdminsList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching temp admins:", error);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchTempAdmins();
  }, []);

  const determineUserRole = (email) => {
    const lowerEmail = email.toLowerCase();
    if (admins.includes(lowerEmail)) {
      return "admin";
    } else if (tempAdmins.includes(lowerEmail)) {
      return "tempadmin";
    } else {
      return "user";
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem("userEmail", currentUser.email);
        localStorage.setItem("userId", currentUser.uid);

        fetchUserProfile(currentUser.uid);

        // Always fetch the latest temp admin list when determining role
        const tempAdminsRef = ref(database, "tempadmin");

        onValue(tempAdminsRef, (snapshot) => {
          const tempAdminsList = [];
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const tempAdminEmail = childSnapshot.child("email").val();
              if (tempAdminEmail) {
                tempAdminsList.push(tempAdminEmail.toLowerCase());
              }
            });
          }

          setTempAdmins(tempAdminsList);

          // Use the fresh temp admin list to determine role
          const lowerEmail = currentUser.email.toLowerCase();
          const role = admins.includes(lowerEmail)
            ? "admin"
            : tempAdminsList.includes(lowerEmail)
            ? "tempadmin"
            : "user";

          setUserRole(role);
          localStorage.setItem("userRole", role);

          // Redirect logged-in users based on role
          if (
            location.pathname === "/login" ||
            location.pathname === "/signup"
          ) {
            const routeToNavigate =
              role === "admin"
                ? "/admin"
                : role === "tempadmin"
                ? "/tempadmin"
                : "/xerox";  // Changed from "/home" to "/xerox"
            navigate(routeToNavigate);
          }
        });
      } else {
        setUser(null);
        setProfileImageUrl(null);
        setUserRole("user");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        
        // Only redirect to login for protected routes
        const protectedRoutes = [
          "/cart", 
          "/profile", 
          "/edit-profile",
          "/payment",
          "/xeroxordersuser",
          "/confirm-order",
          "/ProductOrderUser",
          "/checkout",
          "/success"
        ];
        
        // Check if current path is protected
        if (protectedRoutes.includes(location.pathname) || 
            location.pathname.includes("/OrderedProductpreview/") ||
            location.pathname.includes("/order-detail/")) {
          navigate("/login", { state: { from: location.pathname }});
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  // Function to check if the current route should show navbar
  const shouldShowNavbar = () => {
    // Don't show navbar on admin/tempadmin routes
    if (
      location.pathname.startsWith("/admin") ||
      location.pathname.startsWith("/tempadmin")
    ) {
      return false;
    }

    return true;
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  
    return (
      <>
        {/* Show navbar on all routes except admin/tempadmin */}
        {shouldShowNavbar() && (
          <Navbar user={user} profileImageUrl={profileImageUrl} />
        )}
    
        <Routes>
          <Route
            path="/"
            element={
              userRole === "admin" ? (
                <Navigate to="/admin" />
              ) : userRole === "tempadmin" ? (
                <Navigate to="/tempadmin" />
              ) : (
                <Xerox />
              )
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/product" element={<ProductView />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/checkout" 
            element={user ? <Checkout /> : <Navigate to="/login" state={{ from: "/checkout" }} />} 
          />
          <Route 
            path="/order-detail/:id" 
            element={user ? <OrderDetail /> : <Navigate to="/login" state={{ from: location.pathname }} />} 
          />
          <Route
            path="/home"
            element={
              userRole === "admin" ? (
                <Navigate to="/admin" />
              ) : userRole === "tempadmin" ? (
                <Navigate to="/tempadmin" />
              ) : (
                <Home />
              )
            }
          />
          {/* Allow access to Shop without authentication */}
          <Route path="/shop" element={<Shop />} />
          <Route 
            path="/success" 
            element={user ? <Success /> : <Navigate to="/login" />} 
          />
          <Route
            path="/edit-profile"
            element={user ? <EditProfile /> : <Navigate to="/login" state={{ from: "/edit-profile" }} />}
          />
          {/* Allow access to Xerox without authentication */}
          <Route path="/xerox" element={<Xerox />} />
          <Route 
            path="/payment" 
            element={user ? <Payment /> : <Navigate to="/login" state={{ from: "/payment" }} />} 
          />
          <Route
            path="/xeroxordersuser"
            element={user ? <XeroxOrderUser /> : <Navigate to="/login" state={{ from: "/xeroxordersuser" }} />}
          />
          <Route
            path="/OrderedProductpreview/:userId/:orderId"
            element={user ? <OrderedProductpreview /> : <Navigate to="/login" />}
          />
          <Route
            path="/confirm-order"
            element={user ? <ConfirmOrder /> : <Navigate to="/login" state={{ from: "/confirm-order" }} />}
          />
          <Route
            path="/ProductOrderUser"
            element={user ? <ProductOrderUser /> : <Navigate to="/login" state={{ from: "/ProductOrderUser" }} />}
          />
          <Route path="/about" element={<About />} />
          <Route
            path="/Xeroxorderpreview"
            element={user ? <Xeroxorderpreview /> : <Navigate to="/login" />}
          />
          <Route path="/contact" element={<Contact />} />
          <Route 
            path="/cart" 
            element={user ? <Cart /> : <Navigate to="/login" state={{ from: "/cart" }} />} 
          />
          <Route 
            path="/profile" 
            element={user ? <Profile /> : <Navigate to="/login" state={{ from: "/profile" }} />} 
          />
    
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={userRole === "admin" ? <Admin /> : <Navigate to="/login" />}
          >
            <Route index element={<Navigate to="/admin/orders" replace />} />
            <Route path="orders" element={<Orders />} />
            <Route
              path="OrderedProductpreviewadmin/:userId/:orderId"
              element={<OrderedProductpreviewadmin />}
            />
            <Route
              path="xeroxallordersadmin"
              element={<XeroxAllordersAdmin />}
            />
            <Route
              path="ProductsAllordersadmin"
              element={<ProductsAllordersadmin />}
            />
            <Route
              path="XeroxAllordersmAdmin"
              element={<XeroxAllordersmAdmin />}
            />
            <Route path="xeroxorderpreview" element={<Xeroxorderpreview />} />
            <Route path="Profileadmin" element={<Profileadmin />} />
            <Route path="tempadmincontrol" element={<Tempadmincontrol />} />
            <Route path="OrdersControldmin" element={<OrdersControldmin />} />
          </Route>
    
          {/* Temp Admin Routes */}
          <Route
            path="/tempadmin"
            element={
              userRole === "tempadmin" ? <Tempadmin /> : <Navigate to="/login" />
            }
          >
            <Route
              index
              element={<Navigate to="/tempadmin/XeroxOrdertempadmin" replace />}
            />
            <Route path="XeroxOrdertempadmin" element={<XeroxOrdertempadmin />} />
            <Route path="xeroxorderpreview" element={<Xeroxorderpreview />} />
            {/* Adding an alternative route for nested navigation */}
            <Route path="OrdersControlatempadmin/xeroxorderpreview" element={<Xeroxorderpreview />} />
            <Route
              path="XeroxOrderpreviewtempadmin/:userId/:orderId/:gt"
              element={<XeroxOrderpreviewtempadmin />}
            />
            <Route
              path="OrdersControlatempadmin"
              element={<OrdersControlatempadmin />}
            />
            <Route
              path="xeroxallordersadmin"
              element={<XeroxAllordersAdmin />}
            />
             <Route
              path="profile"
              element={<ProfileTempadmin />}
            />
          </Route>
          <Route path="/admin" element={<Admin />}>
          <Route path="addproduct" element={<AddProduct />} />
          <Route path="products" element={<Products />} />
          
          
        </Route>
        </Routes>
      </>
    );
}

export default App;