import { useState, useEffect, useContext } from "react"; // Added useContext
import "../styles/nav.css";
import { useNavigate } from "react-router-dom"; // BrowserRouter, Routes, Route, Link removed as they are not used directly here
import TopBar from "../components/TopBar";
import OwnerSideBar from "../components/Owner_SideBar";
import StaffSideBar from "../components/Staff_SideBar";
// import { UserContext } from "../components/UserContext"; // If UserContext is needed directly in Layout

function Layout({ children, headerContent, pageName }) { // Added headerContent and pageName props
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth <= 992);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState("User");
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    const storedUsername = localStorage.getItem("username");

    if (storedRole) {
      setUserRole(storedRole);
      if (storedUsername) {
        setUsername(storedUsername);
      }
    } else {
      // Only navigate if not on the login page implicitly
      // This depends on your routing setup for "/"
      // If "/" is login, this is fine.
      if (window.location.pathname !== "/") {
        navigate("/");
      }
    }

    const handleResize = () => {
      if (window.innerWidth <= 992) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener("resize", handleResize);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    localStorage.removeItem("accountId");
    localStorage.removeItem("profileImage");
    // Potentially clear other relevant localStorage items
    setUserRole(null);
    setUsername("User");
    navigate("/");
  };

  const renderSidebar = () => {
    if (userRole === "Owner" || userRole === "owner") {
      return <OwnerSideBar collapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} username={username} />;
    } else if (userRole === "Staff" || userRole === "staff") {
      return <StaffSideBar collapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} username={username} />;
    }
    return null;
  };

  return (
    <>
      <TopBar
        collapsed={isSidebarCollapsed}
        setCollapsed={setIsSidebarCollapsed}
        username={username} // Pass username if TopBar uses it
        onLogout={handleLogout}
      />

      {renderSidebar()}

      {/* Page Header Section - Moved here and controlled by props */}
      {headerContent && pageName && (
        <div
          className={`page-header-${pageName}`}
          style={{
            marginLeft: isSidebarCollapsed ? "0px" : "240px",
            width: isSidebarCollapsed ? "100%" : "calc(100% - 240px)",
            transition: "margin-left 0.3s ease, width 0.3s ease",
            boxSizing: "border-box",
            marginTop: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: "10px",
            paddingBottom: "10px",
            textAlign: "center",
          }}
        >
          <div className="page-header-overlay">
            <b className="content-header">{headerContent}</b>
          </div>
      </div>
      )}

      <div
        className="content-section fade-in"
        style={{
          marginTop: (headerContent && pageName) ? "0px" : "80px",
          marginLeft: isSidebarCollapsed ? "0px" : "240px",
          width: isSidebarCollapsed ? "100%" : "calc(100% - 240px)",
          transition: "margin-left 0.3s ease, width 0.3s ease",
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
    </>
  );
}

export default Layout;