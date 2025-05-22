import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import SalesBarCharts from "../components/SalesBarChart";
import PieCharts from "../components/PieChart";
import StockBarCharts from "../components/StockBarChart"; // AreaChart component now displays Stock Movement (as BarChart)
import LineCharts from "../components/LineChart"; // LineChart component now displays Sales Movement (as AreaChart)
import KeyMetrics from "../components/KeyMetrics";
import { UserContext } from "../components/UserContext";
import { useContext } from "react";
import "../styles/pages.css";

function Dashboard() {
  const { imageSrc, setImageSrc, setFullName, setEmail, setPhone } = useContext(UserContext);
  // State for inventory data fetched from getInventoryData.php
  const [inventoryData, setInventoryData] = useState({
    inventoryMetrics: { // This will hold current metrics (low/out of stock, total cost)
      lowStockItems: 0,
      outOfStockItems: 0,
      totalStockCost: 0,
    },
    totalStockExpenses: 0, // Add state for Total Stock Expenses (time-filtered)
    totalRestockRecord: 0, // Add state for Total Restock Record (time-filtered)
    totalQuantitySoldByProduct: [], // Data for Bar/Pie charts (time-filtered quantity sold)
    netStockChangeOverTime: [], // Data for Area/Line charts (time-filtered net change)
    currentStockPerProduct: [], // Data for Stock Movement (AreaChart, now BarChart)
    salesTrendPerProduct: [], // Data for old Product Trend line chart (not used for new charts)
    totalSalesOverTime: [], // Data for Sales Movement (LineChart, now AreaChart)
  });

   // State for sales data fetched from getSales.php (for Key Metrics)
  const [salesData, setSalesData] = useState({
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    percentChanges: {
      totalSales: 0,
      totalOrders: 0,
      pendingOrders: 0
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("All"); // State for time filter

  const fetchData = async (filter) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch time-filtered sales data for Key Metrics
      const salesResponse = await fetch(`http://localhost/Mk-Host-main/backend/getSales.php?filter=${filter}`);
      if (!salesResponse.ok) {
        throw new Error('Failed to fetch sales data');
      }
      const salesJson = await salesResponse.json();
       if (salesJson.error) throw new Error(salesJson.error);
      setSalesData(salesJson); // Set sales data for Key Metrics


      // Fetch time-filtered inventory data for charts and new restock metrics
      const inventoryResponse = await fetch(`http://localhost/Mk-Host-main/backend/getInventoryData.php?filter=${filter}`);
      if (!inventoryResponse.ok) {
        throw new Error('Failed to fetch inventory data');
      }
      const inventoryJson = await inventoryResponse.json();
      if (inventoryJson.error) throw new Error(inventoryJson.error);
      setInventoryData({
        ...inventoryJson, // Keep existing data
        currentStockPerProduct: inventoryJson.currentStockPerProduct || [], // Handle potential missing data
        salesTrendPerProduct: inventoryJson.salesTrendPerProduct || [], // Handle potential missing data
        totalSalesOverTime: inventoryJson.totalSalesOverTime || [], // Handle potential missing data for total sales
      }); // Set all inventory-related data


    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(timeFilter); // Fetch data when the component mounts or filter changes
    // Optional: Set up interval for periodic refresh if needed
    // const interval = setInterval(() => fetchData(timeFilter), 30000);
    // return () => clearInterval(interval);
  }, [timeFilter]); // Re-run effect when timeFilter changes

    useEffect(() => {
    const fetchUserData = async () => {
      const accountId = localStorage.getItem("accountId");
      if (!accountId) return;

      try {
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
            setImageSrc("http://localhost/Mk-Host-main/src/images/user-logo.png");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [setFullName, setEmail, setPhone, setImageSrc]);

  const handleTimeFilterChange = (event) => {
    setTimeFilter(event.target.value);
  };


  if (loading) {
    return (
      <Layout>
        <div className="loading-container">Loading dashboard data...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error-container">Error: {error}</div>
      </Layout>
    );
  }

  const controlSelectStyle = {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "7px",
    marginLeft: "10px",
    cursor: "pointer",
    backgroundColor: "white",
    width: "200px", 
  };

  return (
    <Layout headerContent="Inventory and Sales Report" pageName="dashboard">
      <div className="dashboard-header"> 
        <div className="filter-container">
          <label htmlFor="timeFilter">Filter by:</label>
          <select
            id="timeFilter"
            value={timeFilter}
            onChange={handleTimeFilterChange}
            style={controlSelectStyle}
          >
            <option value="All">All</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Year">This Year</option>
          </select>
        </div>
      </div>


      <KeyMetrics
        // Pass the relevant data as props
        inventoryMetrics={inventoryData.inventoryMetrics} // Low stock, out of stock, total cost are current
        salesData={salesData} // Total sales, orders, pending are time-filtered
        totalStockCost={inventoryData.inventoryMetrics.totalStockCost} // Pass overall total stock cost
        totalStockExpenses={inventoryData.totalStockExpenses} // Pass time-filtered total stock expenses
        totalRestockRecord={inventoryData.totalRestockRecord} // Pass time-filtered total restock record
      />

      <div className="container-dashboard fade-in">
        <div className="card-graph">
           {/* Bar Chart shows Total Quantity Sold by Product (time-filtered) */}
          <SalesBarCharts stockData={inventoryData.totalQuantitySoldByProduct} />
        </div>

        <div className="card-graph">
           {/* Pie Chart shows Total Quantity Sold by Product (time-filtered) */}
            <PieCharts stockData={inventoryData.totalQuantitySoldByCategory} />
        </div>

        <div className="card-graph">
           {/* Area Chart (now BarChart) shows Stock Movement (Current Stock - NOT time-filtered) */}
          <StockBarCharts stockData={inventoryData.currentStockPerProduct} /> {/* Pass current stock data */}
        </div>

        <div className="card-graph">
           {/* Line Chart (now AreaChart) shows Sales Movement (Total Sales Over Time - time-filtered) */}
          <LineCharts salesData={inventoryData.totalSalesOverTime} /> {/* Pass total sales over time data */}
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;