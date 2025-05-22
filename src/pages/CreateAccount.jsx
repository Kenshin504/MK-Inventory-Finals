import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateAccount() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  const newAccount = {
    username,
    password,
    role,
    fullName,
    email,
    phoneNumber,
  };

  try {
    const response = await fetch('http://localhost/Mk-Host-main/backend/CreateAccount.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newAccount),
    });

    const data = await response.json();

    if (data.success) {
      alert("Account created successfully!");
      navigate("/");
    } else {
      setError(data.error || "Something went wrong.");
    }
  } catch (error) {
    console.error("Error submitting account:", error);
    setError("Failed to connect to the server.");
  }
};
  return (
    <div className="login-page">
      <div className="card">
        <div className="heading-text" style={{ marginBottom: "0px" }}>
          <div className="logo" style={{ width: "270px", height: "220px" }}></div>
        </div>
        <div className="form-part" style={{ marginBottom: "0" }}>
          <form onSubmit={handleSubmit}>
            <p style={{ fontWeight: "bold", fontSize: "20px", marginTop: "0px", marginBottom: "0px" }}>
              Create an Account
            </p>
            
            <div className="form-control">
              <select
                value={role}
                className="user-type"
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="">Select Account Type</option>
                <option value="Staff">For Staff</option>
                <option value="Owner">For Owner</option>
              </select>
            </div>

            {/* Full Name */}
            <div className="form-control">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <label>
                <span style={{ transitionDelay: "0ms" }}>N</span>
                <span style={{ transitionDelay: "50ms" }}>a</span>
                <span style={{ transitionDelay: "100ms" }}>m</span>
                <span style={{ transitionDelay: "150ms" }}>e</span>
              </label>
            </div>

            <div style={{ display: "flex", gap: "30px" }}>
              {/* Email */}
              <div className="form-control">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label>
                  <span style={{ transitionDelay: "0ms" }}>E</span>
                  <span style={{ transitionDelay: "50ms" }}>m</span>
                  <span style={{ transitionDelay: "100ms" }}>a</span>
                  <span style={{ transitionDelay: "150ms" }}>i</span>
                  <span style={{ transitionDelay: "200ms" }}>l</span>
                </label>
              </div>

              {/* Phone Number */}
              <div className="form-control">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
                <label>
                  <span style={{ transitionDelay: "0ms" }}>P</span>
                  <span style={{ transitionDelay: "50ms" }}>h</span>
                  <span style={{ transitionDelay: "100ms" }}>o</span>
                  <span style={{ transitionDelay: "150ms" }}>n</span>
                  <span style={{ transitionDelay: "200ms" }}>e</span>
                  <span style={{ transitionDelay: "250ms" }}> </span>
                  <span style={{ transitionDelay: "300ms" }}>N</span>
                  <span style={{ transitionDelay: "350ms" }}>u</span>
                  <span style={{ transitionDelay: "400ms" }}>m</span>
                  <span style={{ transitionDelay: "450ms" }}>b</span>
                  <span style={{ transitionDelay: "500ms" }}>e</span>
                  <span style={{ transitionDelay: "550ms" }}>r</span>
                </label>
              </div>
            </div>

            {/* Username */}
            <div className="form-control">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <label>
                <span style={{ transitionDelay: "0ms" }}>U</span>
                <span style={{ transitionDelay: "50ms" }}>s</span>
                <span style={{ transitionDelay: "100ms" }}>e</span>
                <span style={{ transitionDelay: "150ms" }}>r</span>
                <span style={{ transitionDelay: "200ms" }}>n</span>
                <span style={{ transitionDelay: "250ms" }}>a</span>
                <span style={{ transitionDelay: "300ms" }}>m</span>
                <span style={{ transitionDelay: "350ms" }}>e</span>
              </label>
            </div>

            {/* Password */}
            <div className="form-control password-container">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label>
                <span style={{ transitionDelay: "0ms" }}>P</span>
                <span style={{ transitionDelay: "50ms" }}>a</span>
                <span style={{ transitionDelay: "100ms" }}>s</span>
                <span style={{ transitionDelay: "150ms" }}>s</span>
                <span style={{ transitionDelay: "200ms" }}>w</span>
                <span style={{ transitionDelay: "250ms" }}>o</span>
                <span style={{ transitionDelay: "300ms" }}>r</span>
                <span style={{ transitionDelay: "350ms" }}>d</span>
              </label>
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button className="login-button" type="submit">
              Create Account
            </button>

            <p
              style={{
                textAlign: "center",
                marginTop: "10px",
                paddingBottom: "0",
                color: "#016962",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onClick={() => navigate("/")}
            >
              Already have an account?
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateAccount;
