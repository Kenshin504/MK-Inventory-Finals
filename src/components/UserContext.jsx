import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Initialize state from localStorage if available
  const [imageSrc, setImageSrc] = useState(() => {
    return localStorage.getItem("profileImage") || "src/images/user-logo.png";
  });
  const [fullName, setFullName] = useState(() => localStorage.getItem("fullName") || "");
  const [birthday, setBirthday] = useState(() => localStorage.getItem("birthday") || "");
  const [email, setEmail] = useState(() => localStorage.getItem("email") || "");
  const [phone, setPhone] = useState(() => localStorage.getItem("phone") || "");

  // Sync context changes to localStorage
  useEffect(() => {
    localStorage.setItem("profileImage", imageSrc);
  }, [imageSrc]);

  useEffect(() => {
    localStorage.setItem("fullName", fullName);
  }, [fullName]);

  useEffect(() => {
    localStorage.setItem("birthday", birthday);
  }, [birthday]);

  useEffect(() => {
    localStorage.setItem("email", email);
  }, [email]);

  useEffect(() => {
    localStorage.setItem("phone", phone);
  }, [phone]);

  return (
    <UserContext.Provider
      value={{
        imageSrc,
        setImageSrc,
        fullName,
        setFullName,
        birthday,
        setBirthday,
        email,
        setEmail,
        phone,
        setPhone,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};