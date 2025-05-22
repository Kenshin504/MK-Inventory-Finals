import { useEffect, useState } from "react";
import Layout from "../components/Layout";

const SALES_PER_PAGE = 10;

function Sales() {
  const getLocalDate = () => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
  };

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    date: getLocalDate(),
    customer: "",
    status: "Paid",
    numProducts: 1,
    products: [{ barcode: "", quantity: "" }],
  });

  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [sortColumn, setSortColumn] = useState(null); // For generic table header sorting
  const [sortOrder, setSortOrder] = useState("asc"); // For generic table header sorting

  const [dateSortOrder, setDateSortOrder] = useState("asc"); // Specific for the "Sort Date" button

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost/Mk-Host-main/backend/Sales.php", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (response.ok && result.success) {
        const groupedSales = result.sales.reduce((acc, item) => {
          if (!acc[item.invoiceNo]) {
            acc[item.invoiceNo] = {
              invoiceNo: item.invoiceNo,
              date: item.date,
              customer: item.customer,
              status: item.status,
              totalSaleAmount: 0,
              products: [],
            };
          }
          acc[item.invoiceNo].products.push({
            barcode: item.barcode,
            product: item.product,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalItemPrice: item.total,
          });
          acc[item.invoiceNo].totalSaleAmount += item.total;
          return acc;
        }, {});
        setSales(Object.values(groupedSales));
      } else {
        setError(result.error || "Failed to fetch sales data.");
      }
    } catch (err) {
      console.error("Fetch sales error:", err);
      setError("Failed to connect to the server or fetch sales data.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumProductsChange = (e) => {
    const num = parseInt(e.target.value, 10);
    if (isNaN(num) || num < 1) {
      return;
    }
    setFormData((prev) => {
      const newProducts = Array.from({ length: num }, (_, i) =>
        prev.products[i] || { barcode: "", quantity: "" }
      );
      return { ...prev, numProducts: num, products: newProducts };
    });
  };

  const handleProductInputChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newProducts = [...prev.products];
      newProducts[index] = { ...newProducts[index], [name]: value };
      return { ...prev, products: newProducts };
    });
  };

  const handleAddSale = async () => {
    const { date, customer, status, products } = formData;
    for (const product of products) {
      if (!product.barcode || !product.quantity || product.quantity <= 0) {
        setError("Please fill in all barcode and quantity fields for each product and ensure quantity is positive.");
        return;
      }
    }
    const accountId = localStorage.getItem("accountId");
    if (!accountId) {
      setError("User account ID not found. Please log in again.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost/Mk-Host-main/backend/sales.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, date, customer, status, products }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        fetchSales();
        setFormData({
          date: getLocalDate(),
          customer: "",
          status: "Paid",
          numProducts: 1,
          products: [{ barcode: "", quantity: "" }],
        });
        setIsFormVisible(false);
        alert("Sale added successfully!"); // Added alert message
      } else {
        setError(result.error || "Failed to add sale.");
      }
    } catch (err) {
      console.error("Add sale error:", err);
      setError("Failed to connect to the server or add sale.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (invoiceNo, newStatus) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost/Mk-Host-main/backend/sales.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceNo: invoiceNo, status: newStatus }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        fetchSales();
      } else {
        setError(result.error || "Failed to update payment status.");
      }
    } catch (err) {
      console.error("Update status error:", err);
      setError("Failed to connect to the server or update status.");
    } finally {
      setLoading(false);
    }
  };

  // Generic handler for table header sorting (not used for 'Date' column header)
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortOrder("asc"); // Always start with 'asc' when changing sort column
    }
    setCurrentPage(1); // Reset to page 1 on sort
  };

  // Specific handler for the "Sort Date" button
  const handleSortDateButtonClick = () => {
    setSortColumn('date'); // Ensure sortColumn is 'date' for the sorting logic
    setDateSortOrder(prevOrder => (prevOrder === "asc" ? "desc" : "asc")); // Toggle date specific order
    setCurrentPage(1);
  };

  const getSortedSales = () => {
    let processedSales = [...sales];

    if (filter !== "all") {
      processedSales = processedSales.filter((s) => s.status.toLowerCase() === filter.toLowerCase());
    }

    if (searchTerm) {
      processedSales = processedSales.filter(sale => {
        const term = searchTerm.toLowerCase();
        const matchesInvoiceNo = sale.invoiceNo.toLowerCase().includes(term);
        const matchesCustomer = sale.customer && sale.customer.toLowerCase().includes(term);
        const matchesProducts = sale.products.some(p =>
          p.product && p.product.toLowerCase().includes(term)
        );
        return matchesInvoiceNo || matchesCustomer || matchesProducts;
      });
    }

    if (sortColumn) {
      processedSales.sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];

        // Determine the effective sortOrder to use
        let currentSortOrder = sortOrder;
        if (sortColumn === 'date') {
            currentSortOrder = dateSortOrder; // Use the dedicated dateSortOrder for 'date' column
        }

        if (sortColumn === 'date') {
          aVal = new Date(a.date);
          bVal = new Date(b.date);
        } else if (sortColumn === 'totalSaleAmount') {
          aVal = parseFloat(a.totalSaleAmount);
          bVal = parseFloat(b.totalSaleAmount);
        } else if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return currentSortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return currentSortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    return processedSales;
  };

  const sortedSales = getSortedSales();
  const totalPages = Math.ceil(sortedSales.length / SALES_PER_PAGE);
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));

  const paginatedSales = sortedSales.slice(
    (safeCurrentPage - 1) * SALES_PER_PAGE,
    safeCurrentPage * SALES_PER_PAGE
  );
  
  useEffect(() => {
      if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
      } else if (currentPage !== 1 && totalPages === 0 && sortedSales.length === 0) {
          setCurrentPage(1);
      }
  }, [sortedSales.length, currentPage, totalPages]);

  // Styles for input and select elements
  const controlInputStyle = {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "7px",
    marginRight: "15px",
  };

  const controlSelectStyle = {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "7px",
    marginRight: "15px",
    cursor: "pointer",
    backgroundColor: "white",
  };

  // Style for control buttons, ensuring it's identical to Stocks.jsx for consistent spacing
  // The primary visual styling (padding, background, border, etc.) is expected from the 'edit-button' class.
  const controlButtonStyle = {
    marginRight: "15px",
  };

  return (
    <Layout headerContent="Sales Log" pageName="sales">
      <div className="sales-controls" style={{ marginBottom: "20px", display: "block", alignItems: "center"}}>
        <input
          type="text"
          placeholder="🔍︎ Search Invoice, Customer, Product"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); 
          }}
          style={{...controlInputStyle, width: "280px"}}
        />
        <select
          id="salesFilter"
          className="filter" // Retain class if it has other base styles
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setCurrentPage(1);
          }}
          style={{...controlSelectStyle, width: "170px"}}
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>

        <button
          className="edit-button" // Uses the same class as Stocks.jsx
          style={controlButtonStyle} // Uses the same style as Stocks.jsx
          onClick={handleSortDateButtonClick} // Call the specific handler for date sorting
        >
          Sort Date {dateSortOrder === 'asc' ? '↓' : '↑'} {/* Always show arrow based on dateSortOrder */}
        </button>

        <button 
          className="edit-button" // Assumes 'Add Sales' also uses 'edit-button' for its base style
          onClick={() => { setIsFormVisible(true); setError(""); }}
          // No explicit 'controlButtonStyle' here if it's the last button or has different spacing needs
        >
          Add Sales
        </button>
      </div>

      {loading && <p>Loading sales data...</p>}

      {isFormVisible && (
        <div className="sales-form-container" style={{ border: "2px solid #ccc", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
          <h3 style={{ paddingLeft: "20px" }}>Add Sale</h3>
          <div className="product-form"> {/* Assuming product-form class provides grid layout */}
            {error && <p style={{ color: "red", gridColumn: '1 / -1' }}>{error}</p>}
            <div>
              <label htmlFor="date">Date:</label><br/>
              <input id="date" name="date" type="date" style={{ marginTop: "10px" }} value={formData.date} onChange={handleInputChange} required />
            </div>
            <div>
              <label htmlFor="customer">Customer Name:</label><br/>
              <input id="customer" name="customer" style={{ marginTop: "10px" }} placeholder="Customer (optional)" value={formData.customer} onChange={handleInputChange} />
            </div>
            <div>
              <label htmlFor="status">Payment Status:</label><br/>
              <select id="status" name="status" className="payment-status" style={{ width: "40%", marginTop: "10px" }} value={formData.status} onChange={handleInputChange}>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="numProducts">Number of Products Purchased:</label><br/>
              <input
                id="numProducts"
                type="number"
                value={formData.numProducts}
                onChange={handleNumProductsChange}
                required min="1"
                style={{ width: "20%", marginTop: "10px" }}
              />
            </div>
            
            <label htmlFor="salesItem" style={{ fontWeight: "bold", marginBottom: "0px", marginTop: "10px" }}>Sales Item/s: </label>
            <div className="sales-item-container" style={{ gridColumn: '1 / -1' }}>
              {Array.from({ length: formData.numProducts }).map((_, index) => (
                <div key={index} className="sales-item"> {/* Assuming sales-item class provides flex layout */}
                  <div style={{ flex: 1 }}>
                    <label htmlFor={`barcode-${index}`}>Barcode: </label>
                    <input
                      id={`barcode-${index}`}
                      name="barcode"
                      placeholder={`Product ${index + 1} Barcode`}
                      value={formData.products[index]?.barcode || ""}
                      onChange={(e) => handleProductInputChange(index, e)}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor={`quantity-${index}`}>Quantity: </label>
                    <input
                      id={`quantity-${index}`}
                      name="quantity"
                      type="number"
                      placeholder="Quantity (pcs)"
                      value={formData.products[index]?.quantity || ""}
                      onChange={(e) => handleProductInputChange(index, e)}
                      required
                      min="1"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "15px", gridColumn: '1 / -1' }}>
              <button style={{ marginTop: "15px" }} onClick={handleAddSale} disabled={loading}>Submit</button>
              <button style={{ marginTop: "15px" }} onClick={() => { setIsFormVisible(false); setError(""); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <h3>Transaction History</h3> 
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort("invoiceNo")} style={{cursor: "pointer"}}>
                Invoice No. {sortColumn === 'invoiceNo' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th> {/* No onClick for Date column in table header */}
                Date
              </th>
              <th>Products Sold</th>
              <th onClick={() => handleSort("totalSaleAmount")} style={{cursor: "pointer"}}>
                Total Sales Amount {sortColumn === 'totalSaleAmount' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort("customer")} style={{cursor: "pointer"}}>
                Customer {sortColumn === 'customer' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {!loading && paginatedSales.length === 0 ? (
              <tr><td colSpan="6">No sales recorded {searchTerm && "for your current search/filter"}</td></tr>
            ) : (
              paginatedSales.map((sale) => (
                <tr key={sale.invoiceNo}>
                  <td>{sale.invoiceNo}</td>
                  <td>{sale.date}</td>
                  <td>
                    <ul style={{ position: "initial" }}>
                      {sale.products.map((product, pIndex) => (
                        <li key={pIndex} style={{ margin: "0", padding: "0", lineHeight: "1.7", textAlign: "left" }}>
                          {product.product} ({product.quantity} pcs) - ₱{parseFloat(product.totalItemPrice).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>₱{parseFloat(sale.totalSaleAmount).toFixed(2)}</td>
                  <td>{sale.customer || "-"}</td>
                  <td>
                    <select
                      value={sale.status}
                      onChange={(e) => handleStatusChange(sale.invoiceNo, e.target.value)}
                      style={{
                        backgroundColor: sale.status === "Paid" ? "#4CAF50" : "#FFA500",
                        color: "white",
                        padding: "4px 10px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                       disabled={loading}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="prev-next-button" style={{ marginTop: "10px" }}>
        <button
          className="previous"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={safeCurrentPage === 1 || loading || totalPages <=1}
        >
          &laquo; Previous
        </button>
        <span>Page {safeCurrentPage} of {totalPages || 1}</span>
        <button
          className="next"
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={safeCurrentPage === totalPages || loading || totalPages <=1}
        >
          Next &raquo;
        </button>
      </div>
    </Layout>
  );
}

export default Sales;