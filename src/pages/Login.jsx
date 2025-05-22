import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";

function Login() {
  const { setFullName, setEmail, setPhone, setImageSrc } = useContext(UserContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successPopupMessage, setSuccessPopupMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("userRole") && localStorage.getItem("accountId")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowSuccessPopup(false);
    setSuccessPopupMessage("");

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const response = await fetch("http://localhost/Mk-Host-main/backend/Login.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update context with user data
        setFullName(result.fullName);
        setEmail(result.email);
        setPhone(result.phoneNumber);
        
        // Store account ID and role in localStorage
        localStorage.setItem("accountId", result.accountID);
        localStorage.setItem("userRole", result.role);
        localStorage.setItem("username", result.username);

        setSuccessPopupMessage(
          <>Login successful! Welcome <strong>{result.username || username}</strong></>
        );
        setShowSuccessPopup(true);

        setTimeout(() => {
          setShowSuccessPopup(false);
          navigate("/dashboard");
        }, 2000);
      } else {
        setError(result.error || "Login failed.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to connect to the server or login.");
    }
  };

  return (
    <div className="login-page">
      <div className="card">
        <div className="heading-text">
          <div className="logo"></div>
        </div>
        <div className="form-part">
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                aria-label="username"
              />
              <label>
                {"Username".split("").map((char, i) => (
                  <span key={i} style={{ transitionDelay: `${i * 50}ms` }}>{char}</span>
                ))}
              </label>
            </div>

            <div className="form-control password-container">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-label="Password"
              />
              <label>
                {"Password".split("").map((char, i) => (
                  <span key={i} style={{ transitionDelay: `${i * 50}ms` }}>{char}</span>
                ))}
              </label>
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>

            {error && <p className="error-message" style={{ color: "red" }}>{error}</p>}

            <button className="login-button" type="submit">Login</button>

            <p style={{ textAlign: "center", marginTop: "10px" }}>
              Don't have an account?{" "}
              <span
                style={{ color: "#016962", fontWeight: "bold", cursor: "pointer" }}
                onClick={() => navigate("/create-account")}
              >
                Create one
              </span>
            </p>
          </form>
        </div>
      </div>

      {showSuccessPopup && (
        <div className="success-popup-container">
          <div className="alert success">{successPopupMessage}</div>
        </div>
      )}
    </div>
  );
}

export default Login;