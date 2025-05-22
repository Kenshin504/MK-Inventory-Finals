import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Box,
  AlertCircle,
  Clipboard,
  ClipboardCheck,
} from "lucide-react";
import "../styles/NotFoundPage.css";

const NotFound = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [boxPosition, setBoxPosition] = useState(0);
  const [showBox, setShowBox] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setShowBox(true), 500);
    const boxAnimation = setInterval(
      () => setBoxPosition((prev) => (prev === 0 ? 1 : 0)),
      2000
    );
    return () => {
      clearTimeout(timer);
      clearInterval(boxAnimation);
    };
  }, []);

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-content-wrapper">
          <div
            className={`not-found-transition ${
              isVisible ? "visible" : "hidden"
            }`}
          >
            <div className="not-found-grid">
              {/* Left content */}
              <div className="not-found-left">
                <h1 className="error-code">
                  <span className="bounce-anim">4</span>
                  <span className="bounce-anim delay-75">0</span>
                  <span className="bounce-anim delay-150">4</span>
                </h1>
                <h2 className="error-title">Inventory Item Not Found</h2>
                <p className="error-description">
                  The inventory item or page you're looking for doesn't exist or
                  has been moved. Please check the reference number and try
                  again.
                </p>
                <button
                  className="back-button"
                  onClick={() => (window.location.href = "/")}
                >
                  <ArrowLeft className="button-icon" />
                  Back to Dashboard
                </button>
              </div>

              {/* Right content */}
              <div className="graphics-container">
                {/* Shelves */}
                <div className="shelves">
                  <div className="shelf-divider top-third"></div>
                  <div className="shelf-divider top-two-thirds"></div>

                  <Clipboard className="shelf-item item-1" />
                  <ClipboardCheck className="shelf-item item-2" />
                  <Box className="shelf-item item-3" />
                  <Box className="shelf-item item-4" />
                  <Box className="shelf-item item-5" />
                </div>

                {/* Animated search box */}
                {showBox && (
                  <div
                    className={`search-box ${
                      boxPosition === 0 ? "left-pos" : "right-pos"
                    }`}
                  >
                    <Box className="search-box-icon" />
                    <AlertCircle className="alert-icon" />
                  </div>
                )}

                {/* Scanning light */}
                <div className="scanning-light"></div>
              </div>
            </div>

            {/* Help section */}
            <div className="help-section">
              <h3 className="help-title">What can you do?</h3>
              <div className="help-grid">
                <div className="help-card">
                  <p className="help-text">
                    <span className="highlight">Check the inventory ID</span> -
                    Verify the item reference number is correct
                  </p>
                </div>
                <div className="help-card">
                  <p className="help-text">
                    <span className="highlight">Search the catalog</span> - Try
                    using our search function to find the item
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="not-found-footer">
          <div className="footer-content">
            Inventory Ledger System &copy; {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default NotFound;
