import "../styles/nav.css";
import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "./UserContext";

function SideBar({ collapsed, setCollapsed, username }) {
 const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  // const currentPath = window.location.pathname;
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();

  const isActive = (path) => (currentPath === path ? "active-link" : "");

  // Function to handle collapsing the sidebar when the main logo is clicked
  const handleCollapse = () => {
    if (!collapsed) { // Only collapse if it's currently expanded
      setCollapsed(true);
    }
  };

  return (
    <div className={`side-bar ${collapsed ? "collapsed" : ""}`}>

<div className="side-content">
        {/* Render content only when not collapsed */}
        {!collapsed && (
          <>
            <div className="logo-section">
              {/* Wrap the logo-part in a clickable element */}
              <div
                className="logo-part"
                alt="MK Inventory Logo"
                onClick={handleCollapse} 
                style={{ cursor: 'pointer' }} 
                title="Click to collapse sidebar" 
              ></div>
              <h3 className="welcome-text">Welcome, {username || "User"}!</h3>
            </div>
            <div className="links">
              <Link to="/dashboard" className={isActive("/dashboard")}>
                <span className="link-content">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="black" viewBox="0 0 24 24">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z" />
                  </svg>
                  <span>Dashboard</span> 
                </span>
              </Link>

              <Link to="/products" className={isActive("/products")}>
                <span className="link-content">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="black" viewBox="0 0 24 24">
                    <path d="M16 6V4H8v2H2v14h20V6h-6zM8 8h8v2H8V8zm0 4h8v2H8v-2zm0 4h5v2H8v-2z" />
                  </svg>
                  <span>Products</span>
                </span>
              </Link>

              <Link to="/stocks" className={isActive("/stocks")}>
                <span className="link-content">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="black" viewBox="0 0 24 24">
                     <path d="M3 17h2v-7H3v7zm4 0h2v-4H7v4zm4 0h2v-10h-2v10zm4 0h2v-2h-2v2zm4 0h2v-13h-2v13z" />
                   </svg>
                   <span>Stocks</span>
                </span>
              </Link>

              <Link to="/sales" className={isActive("/sales")}>
                <span className="link-content">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="black" viewBox="0 0 24 24">
                     <path d="M7 18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm10 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM6.16 7l1.66 5h8.36l1.45-5H6.16zM6 6h12l1.25 4.5-1.75 6H6l-1.75-6L6 6z" />
                   </svg>
                   <span>Sales</span>
                </span>
              </Link>

              <Link to="/account" className={isActive("/account")}>
                <span className="link-content">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="black" viewBox="0 0 24 24">
                     <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                   </svg>
                   <span>Account</span>
                </span>
              </Link>

              <Link to="/staff-list" className={isActive("/staff-list")}>
                 <span className="link-content">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="black" viewBox="0 0 24 24">
                     <path d="M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05.58.81.97 1.79.97 2.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                   </svg>
                   <span>Manage Staff</span>
                 </span>
              </Link>

              <Link to="/about" className={isActive("/about")}>
                  <span className="link-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="black"
                      viewBox="0 0 24 24"
                    >
                      <path d="M11 7h2v2h-2V7zm0 4h2v6h-2v-6zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                    </svg>
                    <span>About</span>
                  </span>
                </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SideBar;