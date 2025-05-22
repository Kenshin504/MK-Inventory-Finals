import { useEffect, useState } from "react";
import Layout from "../components/Layout";

function Stocks() {
  const getLocalDate = () => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
  };

  const [stockList, setStockList] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newStock, setNewStock] = useState({
    date: getLocalDate(),
    barcode: "",
    supplier: "",
    quantity: "",
    unitCost: "",
    totalCost: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort order for barcode

  const [historySortOrder, setHistorySortOrder] = useState("asc"); // Default sort order for history date

  const [submittingStock, setSubmittingStock] = useState(false);

  const stocksPerPage = 10;
  const [stockListPage, setStockListPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  useEffect(() => {
    fetchStockList();
  }, []);

  useEffect(() => {
    if (showHistory) {
      fetchStockHistory();
    } else {
      // setStockHistory([]); // Keep history data if already fetched, just hide it
      // setHistoryPage(1); // Reset page only if you want to clear pagination state on hide
    }
  }, [showHistory]);

  const fetchStockList = async () => {
    setLoadingList(true);
    // setError(""); // Clear error only for this fetch, not global error
    try {
      const response = await fetch("http://localhost/Mk-Host-main/backend/Stocks.php?type=list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setStockList(result.stockList);
      } else {
        if (!submittingStock) { // Avoid overriding submission errors
          setError(result.error || "Failed to fetch stock list.");
        }
      }
    } catch (err) {
      console.error("Fetch stock list error:", err);
      if (!submittingStock) {
        setError("Failed to connect to the server or fetch stock list.");
      }
    } finally {
      setLoadingList(false);
    }
  };

  const fetchStockHistory = async () => {
    setLoadingHistory(true);
    // setError("");
    try {
      const response = await fetch("http://localhost/Mk-Host-main/backend/Stocks.php?type=history", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setStockHistory(result.history);
      } else {
         if (!submittingStock) {
            setError(result.error || "Failed to fetch stock history.");
         }
      }
    } catch (err) {
      console.error("Fetch stock history error:", err);
       if (!submittingStock) {
            setError("Failed to connect to the server or fetch stock history.");
       }
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchProductByBarcode = async (barcode) => {
    try {
      const response = await fetch(`http://localhost/Mk-Host-main/backend/Products.php?barcode=${encodeURIComponent(barcode)}`);
      const result = await response.json();
      if (response.ok && result.success && result.product) {
        return result.product;
      } else {
        console.warn("Product not found or backend error for barcode:", barcode, result.error);
        return null;
      }
    } catch (err) {
      console.error("Fetch product by barcode failed:", err);
      throw err; // Rethrow to be caught by handleSubmitStock
    }
  };

  const handleAddStockClick = () => {
    setError(""); // Clear previous errors when opening form
    setNewStock({
      date: getLocalDate(),
      barcode: "",
      supplier: "",
      quantity: "",
      unitCost: "",
      totalCost: "",
    });
    setIsPopupVisible(true);
  };

  const handleStockChange = (e) => {
    const { name, value } = e.target;
    setNewStock((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "quantity" || name === "unitCost") {
        const quantity = parseFloat(updated.quantity || 0);
        const unitCost = parseFloat(updated.unitCost || 0);
        updated.totalCost = (quantity * unitCost).toFixed(2);
      }
      return updated;
    });
  };

  const handleSubmitStock = async () => {
    setError(""); // Clear previous form errors
    setSubmittingStock(true);

    if (!newStock.date || !newStock.barcode || !newStock.supplier || newStock.quantity === "" || newStock.unitCost === "") {
      setError("Please fill in all fields.");
      setSubmittingStock(false);
      return;
    }
    const quantity = parseFloat(newStock.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      setError("Quantity must be a positive number.");
      setSubmittingStock(false);
      return;
    }
    const unitCost = parseFloat(newStock.unitCost);
    if (isNaN(unitCost) || unitCost < 0) {
      setError("Unit Cost must be a non-negative number.");
      setSubmittingStock(false);
      return;
    }

    try {
      const product = await fetchProductByBarcode(newStock.barcode);
      if (!product) {
        setError(`Product with barcode "${newStock.barcode}" not found. Please ensure the product exists in the Product Catalog or enter a valid barcode.`);
        setSubmittingStock(false);
        return;
      }
    } catch (fetchError) {
      setError("An error occurred while verifying the product barcode. Please try again.");
      setSubmittingStock(false);
      return;
    }

    const data = new FormData();
    data.append("date", newStock.date);
    data.append("barcode", newStock.barcode); // This is the ProductBarcode
    data.append("supplier", newStock.supplier);
    data.append("quantity", newStock.quantity);
    data.append("unitCost", newStock.unitCost);
    // totalCost is calculated and stored if your backend handles it, or just for display

    try {
      const response = await fetch("http://localhost/Mk-Host-main/backend/Stocks.php", {
        method: "POST",
        body: data, // Sending as FormData
      });
      const result = await response.json();

      if (response.ok && result.success) {
        fetchStockList(); // Refresh current stock list
        if (showHistory) {
          fetchStockHistory(); // Refresh history if visible
        }
        setNewStock({
          date: getLocalDate(), barcode: "", supplier: "",
          quantity: "", unitCost: "", totalCost: "",
        });
        setIsPopupVisible(false);
        // setError(""); // Clear error on success handled by initial setError("")
        alert(result.message || "Stock added successfully!");
      } else {
        setError(result.error || "Failed to add stock. Please check details and try again.");
      }
    } catch (err) {
      console.error("Add stock error:", err);
      setError("Failed to connect to the server or add stock. Please try again later.");
    } finally {
      setSubmittingStock(false);
    }
  };

  const filteredStockList = stockList
    .filter(item => {
      const itemBarcode = item.barcode || ""; // Ensure barcode is a string
      const matchesSearch = itemBarcode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === "all" || (item.status && item.status.toLowerCase() === filterStatus.toLowerCase());
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const barcodeA = a.barcode || "";
      const barcodeB = b.barcode || "";
      if (sortOrder === "asc") {
        return barcodeA.localeCompare(barcodeB);
      } else {
        return barcodeB.localeCompare(barcodeA);
      }
    });

  const stockListTotalPages = Math.ceil(filteredStockList.length / stocksPerPage);
  const safeStockListPage = Math.max(1, Math.min(stockListPage, stockListTotalPages || 1));

  // Function to get sorted stock history
  const getSortedStockHistory = () => {
    let processedHistory = [...stockHistory]; // Start with a copy

    processedHistory.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      if (historySortOrder === "asc") {
        return dateA - dateB; // Ascending date
      } else {
        return dateB - dateA; // Descending date
      }
    });
    return processedHistory;
  };

  const sortedStockHistory = getSortedStockHistory(); // Get sorted history
  const historyTotalPages = Math.ceil(sortedStockHistory.length / stocksPerPage); // Use sorted history for total pages
  const safeHistoryPage = Math.max(1, Math.min(historyPage, historyTotalPages || 1));


  const paginatedStockList = filteredStockList.slice(
    (safeStockListPage - 1) * stocksPerPage,
    safeStockListPage * stocksPerPage
  );

  const paginatedStockHistory = sortedStockHistory.slice( // Use sorted history for pagination
    (safeHistoryPage - 1) * stocksPerPage,
    safeHistoryPage * stocksPerPage
  );

  useEffect(() => {
      if (stockListPage > stockListTotalPages && stockListTotalPages > 0) {
          setStockListPage(stockListTotalPages);
      } else if (stockListPage !== 1 && stockListTotalPages === 0 && filteredStockList.length === 0) {
          setStockListPage(1);
      }
  }, [filteredStockList.length, stockListPage, stockListTotalPages]);

  // Handler for sorting history by date
  const handleSortHistoryDate = () => {
    setHistorySortOrder(order => order === "asc" ? "desc" : "asc"); // Toggle sort order
    setHistoryPage(1); // Reset to page 1 on sort
  };

  // Consistent styles for controls
  const controlInputStyle = {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "7px",
    marginRight: "15px",
    width: "250px", // Adjusted width for Stocks layout
  };

  const controlSelectStyle = {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "7px",
    marginRight: "15px",
    cursor: "pointer",
    backgroundColor: "white",
    width: "180px", // Adjusted width for Stocks layout
  };
  
  const controlButtonStyle = { // Added for consistent button margin
    marginRight: "15px",
  };


  return (
    <Layout headerContent="Stock Records" pageName="stocks">
      <div className="stock-nav" style={{ marginBottom: "20px", display: "block", alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="🔍︎ Search by Barcode"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setStockListPage(1); 
          }}
          style={controlInputStyle}
        />
        <select
          className="filter" // Retain class if it provides other base styles
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setStockListPage(1);
          }}
          style={controlSelectStyle}
        >
          <option value="all">All Status</option>
          <option value="fully stocked">Fully Stocked</option>
          <option value="low on stock">Low on Stock</option>
          <option value="out of stock">Out of Stock</option>
        </select>
        <button 
            onClick={() => {
                setSortOrder(order => order === "asc" ? "desc" : "asc");
                setStockListPage(1);
            }} 
            className="edit-button" 
            style={controlButtonStyle}
        >
          Sort Barcode {sortOrder === "asc" ? "↓" : "↑"}
        </button>
        <button onClick={handleAddStockClick} className="edit-button" style={controlButtonStyle}>
            Add Stock
        </button>
        <button onClick={() => setShowHistory(prev => !prev)} className="edit-button">
          {showHistory ? "Hide Stock History" : "Show Stock History"}
        </button>
      </div>

      {isPopupVisible && (
        <div className="stock-form-container" style={{ border: "2px solid #ccc", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
          <h3 style={{ paddingLeft: "20px" }}>Add New Stock</h3>
          <div className="product-form"> {/* Assuming product-form provides grid layout */}
            {error && <p style={{ color: "red", gridColumn: '1 / -1' }}>{error}</p>}
            <div>
              <label htmlFor="date">Date:</label><br/>
              <input id="date" type="date" name="date" style={{ marginTop: "10px" }} value={newStock.date} onChange={handleStockChange} required />
            </div>
            <div>
              <label htmlFor="barcode">Product Barcode:</label><br/>
              <input id="barcode" type="text" name="barcode" placeholder="Product Barcode" style={{ marginTop: "10px" }} value={newStock.barcode} onChange={handleStockChange} required />
            </div>
            <div>
              <label htmlFor="supplier">Supplier:</label><br/>
              <input id="supplier" type="text" name="supplier" placeholder="Supplier" style={{ marginTop: "10px" }} value={newStock.supplier} onChange={handleStockChange} required />
            </div>
            <div>
              <label htmlFor="quantity">Quantity:</label><br/>
              <input id="quantity" type="number" name="quantity" placeholder="Quantity (pcs)" style={{ marginTop: "10px" }} value={newStock.quantity} onChange={handleStockChange} required min="1" />
            </div>
            <div>
              <label htmlFor="unitCost">Unit Cost:</label><br/>
              <input id="unitCost" type="number" name="unitCost" placeholder="Unit Cost" style={{ width: "50%", marginTop: "10px" }} value={newStock.unitCost} onChange={handleStockChange} required min="0" step="0.01" />
            </div>
            <div>
              <label htmlFor="totalCost">Total Cost:</label><br/>
              <input id="totalCost" type="number" name="totalCost" placeholder="Total Cost" style={{ width: "50%", marginTop: "10px" }} value={newStock.totalCost} readOnly disabled />
            </div>
            <div style={{ marginTop: "15px", gridColumn: '1 / -1' }}>
              <button style={{ marginTop: "15px" }} onClick={handleSubmitStock} disabled={submittingStock}>
                {submittingStock ? 'Adding Stock...' : 'Add Stock'}
              </button>
              <button style={{ marginTop: "15px" }} onClick={() => { setIsPopupVisible(false); setError(""); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <h3>Current Stock</h3>
      {loadingList && <p>Loading stock list...</p>}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Barcode</th>
              <th>Available Stock</th>
              <th>Stock Status</th>
            </tr>
          </thead>
          <tbody>
            {!loadingList && paginatedStockList.length === 0 ? (
              <tr><td colSpan="3">No stocks available { (searchTerm || filterStatus !== 'all') && "for your current search/filter"}</td></tr>
            ) : (
              paginatedStockList.map((item) => (
                <tr key={item.id || item.barcode}> {/* Added fallback key */}
                  <td>{item.barcode}</td>
                  <td>{item.quantity}</td>
                  <td style={{
                    backgroundColor: item.status === "Fully Stocked" ? "green" :
                      item.status === "Low on Stock" ? "orange" :
                        item.status === "Out of Stock" ? "red" : "transparent", // Added default
                    color: item.status === "Fully Stocked" || item.status === "Low on Stock" || item.status === "Out of Stock" ? "white" : "black", // Added default text color
                  }}>
                    {item.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="prev-next-button" style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
        <button onClick={() => setStockListPage(p => Math.max(1, p - 1))} disabled={safeStockListPage === 1 || loadingList || stockListTotalPages <= 1}>
          &laquo; Previous
        </button>
        <span>Page {safeStockListPage} of {stockListTotalPages || 1}</span>
        <button onClick={() => setStockListPage(p => Math.min(stockListTotalPages, p + 1))} disabled={safeStockListPage === stockListTotalPages || loadingList || stockListTotalPages <= 1}>
          Next &raquo;
        </button>
      </div>

      {showHistory && (
        <>
          <h3 style={{ marginTop: "40px" }}>Stock History</h3>
          <div className="stock-history-controls" style={{ marginBottom: "20px" }}>
            <button
                onClick={handleSortHistoryDate} // Call the new handler
                className="edit-button"
                style={controlButtonStyle}
            >
                Sort Date {historySortOrder === "asc" ? "↓" : "↑"} {/* Display arrow based on historySortOrder */}
            </button>
          </div>
          {loadingHistory && <p>Loading stock history...</p>}
          {!loadingHistory && stockHistory.length === 0 && (
            <p>No stock history available.</p>
          )}
          {stockHistory.length > 0 && (
            <>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date Stocked<br />(Year-Month-Day)</th>
                      <th>Barcode</th> {/* Added Barcode for clarity */}
                      <th>Product Name</th> {/* New column */}
                      <th>Supplier</th>
                      <th>Quantity (pcs)</th>
                      <th>Unit Cost</th>
                      <th>Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStockHistory.map((stock) => (
                      <tr key={stock.id}>
                        <td>{stock.date}</td>
                        <td>{stock.barcode}</td> {/* Display Barcode */}
                        <td>{stock.productName}</td> {/* Display Product Name */}
                        <td>{stock.supplier}</td>
                        <td>{stock.quantity}</td>
                        <td>₱{parseFloat(stock.unitCost).toFixed(2)}</td>
                        <td>₱{parseFloat(stock.totalCost).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="prev-next-button" style={{ marginTop: "20px", marginBottom: "50px", display: "flex", justifyContent: "center" }}>
                <button onClick={() => setHistoryPage(p => Math.max(1, p - 1))} disabled={safeHistoryPage === 1 || loadingHistory || historyTotalPages <=1 }>
                  &laquo; Previous
                </button>
                <span>Page {safeHistoryPage} of {historyTotalPages || 1}</span>
                <button onClick={() => setHistoryPage(p => Math.min(historyTotalPages, p + 1))} disabled={safeHistoryPage === historyTotalPages || loadingHistory || historyTotalPages <=1 }>
                  Next &raquo;
                </button>
              </div>
            </>
          )}
        </>
      )}
    </Layout>
  );
}

export default Stocks;