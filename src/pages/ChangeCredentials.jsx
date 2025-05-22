import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Button from "../components/Button";

function ChangeCredentials() {
  const navigate = useNavigate();
  const contentRef = useRef(null);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true" || false
  );

  // We won't pre-fill password for security reasons
  const [currentUsername, setCurrentUsername] = useState(localStorage.getItem("username") || "");

  const [newUsername, setNewUsername] = useState(currentUsername); // Initialize with current username
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // Add success message state

  const handleSave = async (e) => { // Make handleSave async
    e.preventDefault();

    setError(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success messages

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const accountId = localStorage.getItem("accountId");
    if (!accountId) {
        setError("User not logged in.");
        // Maybe redirect to login after a delay
        setTimeout(() => navigate("/"), 2000);
        return;
    }

    const updatedCredentials = {
        accountID: accountId,
        newUsername: newUsername,
        newPassword: newPassword,
    };

    try {
        const response = await fetch('http://localhost/Mk-Host-main/backend/ChangeCredentials.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedCredentials),
        });

        const data = await response.json();

        if (data.success) {
            setSuccessMessage(data.message || "Credentials updated successfully!");
            setError(""); // Clear any lingering errors

            // Update username in localStorage if it changed
            if (currentUsername !== newUsername) {
                 localStorage.setItem("username", newUsername);
                 setCurrentUsername(newUsername); // Update local state as well
            }

            // It's generally safer to force re-login after password changes
            // but for this implementation, we show success and keep the user logged in.
            // In a real application, you might trigger a logout here.

            // Optionally navigate back to account page after a delay
            // setTimeout(() => navigate("/account"), 2000);

        } else {
            setError(data.error || "Failed to update credentials.");
            setSuccessMessage(""); // Clear success message on error
        }
    } catch (error) {
        console.error("Error updating credentials:", error);
        setError("Failed to connect to the server to update credentials.");
        setSuccessMessage(""); // Clear success message on error
    }
  };

  useEffect(() => {
    if (contentRef.current) {
      if (darkMode) {
        contentRef.current.classList.add("dark-mode");
      } else {
        contentRef.current.classList.remove("dark-mode");
      }
    }
  }, [darkMode]);

  return (
    <Layout headerContent="Change Username/Password" pageName="account">
      <div ref={contentRef} className="content">
        <div className="account-container">
          <form className="account-form" onSubmit={handleSave}>
            <b>Current Username</b>
             <p style={{ marginBottom: "40px" }}>
               {/* Display current username but make it read-only */}
               <input
                 type="text"
                 className="editprofile-input"
                 value={currentUsername}
                 readOnly // Make it read-only
                 style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed', fontStyle: "oblique", fontWeight: "bold" }} // Style to indicate read-only
               />
             </p>

            <b>Enter New Username</b>
            <p>
              <input
                type="text"
                className="editprofile-input"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required // Make username field required
              />
            </p>

            <b>Enter New Password</b>
            <div className="password-container">
              <p>
                <input
                  type={showPassword ? "text" : "password"}
                  className="editprofile-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required // Make password field required
                />
                <span
                  className="eye-icon"
                  style={{ paddingTop: "4px"}}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁"}
                </span>
              </p>
            </div>

            <b>Confirm New Password</b>
            <div className="password-container">
              <p>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="editprofile-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required // Make confirm password field required
                />
                <span
                  className="eye-icon"
                  style={{ paddingTop: "4px"}}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "🙈" : "👁"}
                </span>
              </p>
            </div>

            {/* Error message shown in red text */}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {/* Success message shown in green text */}
            {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}


            <Button type="submit" className="saveprofile-button">
              Save
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default ChangeCredentials;