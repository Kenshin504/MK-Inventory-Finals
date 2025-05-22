import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from "react";
import { UserProvider } from "./components/UserContext"; // Import the UserProvider
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Stocks from "./pages/Stocks";
import Sales from "./pages/Sales";
import Account from "./pages/Account";
import About from "./pages/About";
import Layout from "./components/Layout";
import NotFoundPage from "./pages/NotFoundPage";
import ChangeCredentials from "./pages/ChangeCredentials";
import CreateAccount from "./pages/CreateAccount";
import StaffList from "./pages/StaffList";
import "./App.css";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />{" "}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/account" element={<Account />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/change-credentials" element={<ChangeCredentials />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/staff-list" element={<StaffList />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
