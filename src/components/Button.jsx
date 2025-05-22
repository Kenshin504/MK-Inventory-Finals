import React from "react";

const Button = ({ children, onClick, className = "", type = "button" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 bg-green-600 text-white font-semibold rounded-full shadow-md hover:bg-green-700 transition ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
