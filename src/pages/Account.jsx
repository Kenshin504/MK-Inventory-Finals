import { useState, useContext, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { UploadCloud, Loader2 } from "lucide-react";

// Placeholder image URL
const placeholderImage = "http://localhost/Mk-Host-main/src/images/user-logo.png";

function Account() {
  const {
    imageSrc,
    setImageSrc,
    fullName,
    setFullName,
    email,
    setEmail,
    phone,
    setPhone,
  } = useContext(UserContext);

  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true" || false
  );

  const contentRef = useRef(null);

  const [tempFullName, setTempFullName] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [selectedFile, setSelectedFile] = useState(null); 
  const [showUpload, setShowUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const accountId = localStorage.getItem("accountId");
      if (!accountId) {
        navigate("/");
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(
          `http://localhost/Mk-Host-main/backend/GetAccountDetails.php?accountID=${accountId}`,
          {
            credentials: "include",
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.success) {
          setTempFullName(data.fullName);
          setTempEmail(data.email);
          setTempPhone(data.phoneNumber);

          // Update context which will automatically update localStorage
          setFullName(data.fullName);
          setEmail(data.email);
          setPhone(data.phoneNumber);

          // If a profile picture path is returned, use it
          if (data.profilePicture) {
            const imageUrl = `http://localhost/Mk-Host-main/${data.profilePicture}`;
            setImageSrc(imageUrl);
            localStorage.setItem("profileImage", imageUrl);
          } else {
            setImageSrc(placeholderImage);
          }
        } else {
          console.error("Failed to fetch user data:", data.error);
          setUploadError("Failed to load profile data. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUploadError("Error connecting to server. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, setFullName, setEmail, setPhone, setImageSrc]); 

  const handleDrop = (acceptedFiles, rejectedFiles) => {
    setUploadError(null);
    setSuccessMessage(null);
    
    if (rejectedFiles && rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        setUploadError('File is too large. Max 2MB allowed.');
      } else if (error.code === 'file-invalid-type') {
        setUploadError('Invalid file type. Only JPG, PNG, GIF allowed.');
      } else {
        setUploadError('Error uploading file.');
      }
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImageSrc(reader.result); 
      };
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.gif']
    },
    onDrop: handleDrop,
    multiple: false,
    maxSize: 2 * 1024 * 1024, // 2MB
  });

  const handleSave = async (event) => {
    event.preventDefault();
    setUploadError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    const accountId = localStorage.getItem("accountId");
    if (!accountId) {
      alert("User not logged in.");
      navigate("/");
      return;
    }

    // Basic form validation
    if (!tempFullName || !tempEmail || !tempPhone) {
      setUploadError("All fields are required.");
      setIsSaving(false);
      return;
    }

    const formData = new FormData();
    formData.append("accountID", accountId);
    formData.append("fullName", tempFullName);
    formData.append("email", tempEmail);
    formData.append("phoneNumber", tempPhone);

    if (selectedFile) {
      formData.append("profilePicture", selectedFile);
    }

    try {
      const response = await fetch(
        'http://localhost/Mk-Host-main/backend/UpdateAccount.php', 
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update context which will automatically update localStorage
        setFullName(tempFullName);
        setEmail(tempEmail);
        setPhone(tempPhone);

        // Handle profile picture update
        if (data.profilePicture) {
          const imageUrl = `http://localhost/Mk-Host-main/${data.profilePicture}`;
          setImageSrc(imageUrl);
          localStorage.setItem("profileImage", imageUrl);
        }

        setSuccessMessage("Profile updated successfully!");
        setSelectedFile(null);
        setShowUpload(false);
      } else {
        setUploadError(data.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setUploadError("Failed to connect to the server.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setShowUpload(false);
    setUploadError(null);
    
    // Revert to the original image if available
    const storedImage = localStorage.getItem("profileImage");
    setImageSrc(storedImage || placeholderImage);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout headerContent="Account Details" pageName="account">
      <div ref={contentRef} className="content">
        <div className="account-container">
          <form className="account-form" onSubmit={handleSave}>
            <div className="form-group">
              <label htmlFor="fullName">Name</label>
              <input
                id="fullName"
                type="text"
                className="editprofile-input"
                value={tempFullName}
                onChange={(e) => setTempFullName(e.target.value)}
                disabled={isSaving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="editprofile-input"
                value={tempEmail}
                onChange={(e) => setTempEmail(e.target.value)}
                disabled={isSaving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="text"
                className="editprofile-input"
                value={tempPhone}
                onChange={(e) => setTempPhone(e.target.value)}
                disabled={isSaving}
              />
            </div>

            {uploadError && (
              <div className="error-message">
                {uploadError}
              </div>
            )}

            {successMessage && (
              <div className="success-message">
                {successMessage}
              </div>
            )}

            <Button 
              type="submit" 
              className="saveprofile-button" 
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>

          <div className="change-picture">
            <div className="profile-picture-container">
              <img
                src={imageSrc || placeholderImage}
                className="account-pic"
                alt="Profile"
                onError={(e) => {
                  e.target.src = placeholderImage;
                }}
              />
            </div>

            <div className="button-container">
              <Button 
                onClick={() => setShowUpload(!showUpload)} 
                disabled={isSaving}
              >
                {showUpload ? "Hide Upload" : "Change Picture"}
              </Button>
            </div>

            {showUpload && (
              <div className="upload-section">
                <div 
                  {...getRootProps()} 
                  className={`upload-box ${isDragActive ? "drag-active" : ""}`}
                >
                  <input {...getInputProps()} />
                  <div className="upload-content">
                    <UploadCloud className="upload-icon" />
                    <p className="upload-text">
                      {isDragActive ? (
                        "Drop the image here"
                      ) : (
                        "Drag & drop or click to upload"
                      )}
                    </p>
                    <p className="upload-hint">
                      (JPG, PNG, GIF, max 2MB)
                    </p>
                    <Button 
                      type="button" 
                      className="mt-3" 
                      disabled={isSaving}
                    >
                      Choose File
                    </Button>
                  </div>
                </div>

                {selectedFile && (
                  <div className="file-info">
                    <p>
                      Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
                    </p>
                    <Button 
                      type="button" 
                      onClick={handleCancelUpload}
                      variant="secondary"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Account;