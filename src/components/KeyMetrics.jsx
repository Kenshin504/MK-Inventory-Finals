import React from "react"; 
import "../styles/KeyMetrics.css";

function KeyMetrics({ inventoryMetrics, salesData, totalStockCost, totalStockExpenses, totalRestockRecord }) {
 
  // Format currency with peso sign
  const formatCurrency = (value) => {
    // Ensure value is a number before formatting
    const numberValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numberValue)) {
      return "₱0.00"; // Handle cases where value is not a valid number
    }
    return "₱" + numberValue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  if (!inventoryMetrics || !salesData) {
      return null;
  }


  return (
    <div className="key-metrics-container">
      <div className="key-metrics-header">
        <div className="key-metrics-title">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v18h18" />
            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
          </svg>
          <h2>Key Metrics</h2>
        </div>
        <div className="key-metrics-actions">
        </div>
      </div>

      <div className="key-metrics-cards">
        {/* Total Sales (from salesData) */}
        <div className="metric-card">
          <div className="metric-icon sales-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-label">Total Sales</div>
            {/* Access totalSales directly from salesData prop */}
            <div className="metric-value">
              {formatCurrency(salesData.totalSales)}
            </div>
            {/* Check if percentChanges exists before accessing its properties */}
            {salesData.percentChanges && (
              <div
                className={`metric-change ${
                  // Access percentChanges from salesData prop
                  salesData.percentChanges.totalSales >= 0 ? "positive" : "negative"
                }`}
              >
                {salesData.percentChanges.totalSales >= 0 ? "+" : ""}
                {/* Access percentChanges directly from salesData prop */}
                {salesData.percentChanges.totalSales.toFixed(1)}% vs last period
              </div>
            )}
          </div>
        </div>

        {/* Total Orders (from salesData) */}
        <div className="metric-card">
          <div className="metric-icon orders-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6.331 8h11.339a2 2 0 0 1 1.977 2.304l-1.255 8.152a3 3 0 0 1 -2.966 2.544h-6.852a3 3 0 0 1 -2.965 -2.544l-1.255 -8.152a2 2 0 0 1 1.977 -2.304z" />
              <path d="M9 11v-5a3 3 0 0 1 6 0v5" />
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-label">Total Customer Purchases</div>
            {/* Access totalOrders directly from salesData prop */}
            <div className="metric-value">{salesData.totalOrders}</div>
             {/* Check if percentChanges exists before accessing its properties */}
            {salesData.percentChanges && (
              <div
                className={`metric-change ${
                  // Access percentChanges from salesData prop
                  salesData.percentChanges.totalOrders >= 0
                    ? "positive"
                    : "negative"
                }`}
              >
                {salesData.percentChanges.totalOrders >= 0 ? "+" : ""}
                {/* Access percentChanges directly from salesData prop */}
                {salesData.percentChanges.totalOrders.toFixed(1)}% vs last period
              </div>
            )}
          </div>
        </div>

         {/* Total Stock Expenses (from totalStockExpenses prop) */}
        <div className="metric-card">
          <div className="metric-icon cost-icon"> 
             <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-label">Total Stock Expenses</div>
            <div className="metric-value">{formatCurrency(totalStockExpenses)}</div>
             <div className="metric-change neutral">
               Period Total
             </div>
          </div>
        </div>


        {/* Total Restock Record (from totalRestockRecord prop) */}
         <div className="metric-card">
          <div className="metric-icon stock-record-icon"> 
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73Z"/><path d="m3.3 7 8.7 5 8.7-5"/><line x1="12" x2="12" y1="12" y2="22"/></svg> {/* Using a package icon */}
          </div>
          <div className="metric-content">
            <div className="metric-label">Total Restock Record</div>
            <div className="metric-value">{totalRestockRecord}</div>
             <div className="metric-change neutral">
               Period Count
             </div>
          </div>
        </div>

        {/* Pending Orders (from salesData) */}
        <div className="metric-card">
          <div className="metric-icon pending-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-label">Pending Payments</div>
             {/* Access pendingOrders directly from salesData prop */}
            <div className="metric-value">{salesData.pendingOrders}</div>
             <div className="metric-change neutral">
               Current Count
             </div>
          </div>
        </div>

        {/* Low Stock Status (from inventoryMetrics) - Current Count */}
        <div className="metric-card">
          <div className="metric-icon low-stock-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-label">Low Stock Items</div>
            <div className="metric-value">
              <div style={{ marginBottom: '4px' }}>
                {inventoryMetrics.lowStockItems}
              </div>
            </div>
             <div className="metric-change neutral">
               Current Count
             </div>
          </div>
        </div>

        {/* Out of Stock Status (from inventoryMetrics) - Current Count */}
        <div className="metric-card">
          <div className="metric-icon out-of-stock-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-label">Out of Stock Items</div>
            <div className="metric-value">
              <div style={{ marginBottom: '4px' }}>
                 {inventoryMetrics.outOfStockItems}
              </div>
            </div>
             <div className="metric-change neutral">
               Current Count
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KeyMetrics;