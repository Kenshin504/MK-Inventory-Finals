import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const STAFFS_PER_PAGE = 10;

function StaffList() {
  const navigate = useNavigate();
  const [staffs, setStaffs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null); // State for delete specific errors

  // Fetch staff data on component mount
  useEffect(() => {
    const fetchStaffs = async () => {
      const accountId = localStorage.getItem("accountId");
      const userRole = localStorage.getItem("userRole");

      // Basic check if user is logged in and has appropriate role
      if (!accountId || userRole !== 'Owner') {
         alert("You are not authorized to view this page.");
         navigate("/dashboard");
         return;
      }

      setIsLoading(true); // Set loading before fetch
      setError(null); // Clear previous fetch errors

      try {
        const response = await fetch('http://localhost/Mk-Host-main/backend/GetStaffAccounts.php');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setStaffs(data.staffs);
          setError(null);
        } else {
          console.error("Failed to fetch staff accounts:", data.error);
          setError(data.error || "Failed to fetch staff accounts.");
          setStaffs([]);
        }
      } catch (error) {
        console.error("Error fetching staff accounts:", error);
        setError("Failed to connect to the server or fetch data.");
        setStaffs([]);
      } finally {
        setIsLoading(false); // Set loading to false after fetch attempt
      }
    };

    fetchStaffs();

  }, [navigate]); // Add navigate to dependencies


  // Handle account deletion
  const handleDelete = async (accountID, username) => {
    // Confirmation prompt
    const confirmed = window.confirm(`Are you sure you want to delete the account for "${username}"?`);

    if (confirmed) {
      setIsLoading(true); // Show loading indicator during deletion
      setDeleteError(null); // Clear previous delete errors

      try {
        const response = await fetch('http://localhost/Mk-Host-main/backend/DeleteAccount.php', {
          method: 'POST', // Using POST with a body for simplicity, DELETE with body is less common
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accountID: accountID }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Remove the deleted staff member from the state
          setStaffs(prevStaffs => prevStaffs.filter(staff => staff.AccountID !== accountID));
          alert(data.message || "Account deleted successfully!");
          setDeleteError(null); // Clear delete error on success

        } else {
          console.error("Failed to delete account:", data.error);
           // Display backend error message or a default one
          setDeleteError(data.error || "Failed to delete account.");
          alert("Failed to delete account: " + (data.error || "Unknown error"));
        }
      } catch (error) {
        console.error("Error deleting account:", error);
         // Display a network error message
        setDeleteError("Failed to connect to the server to delete account.");
        alert("Failed to connect to the server to delete account.");
      } finally {
        setIsLoading(false); // Hide loading indicator
      }
    }
  };


  const totalPages = Math.ceil(staffs.length / STAFFS_PER_PAGE);
  const paginatedStaffs = staffs.slice(
    (currentPage - 1) * STAFFS_PER_PAGE,
    currentPage * STAFFS_PER_PAGE
  );

  return (
    <Layout headerContent="Staff List" pageName="staffList">
      {isLoading && <div>Loading staff accounts...</div>}
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
      {deleteError && <div style={{ color: "red" }}>Delete Error: {deleteError}</div>} {/* Display delete errors */}


      {!isLoading && !error && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Actions</th> {/* Added Actions column header */}
              </tr>
            </thead>
            <tbody>
              {paginatedStaffs.length === 0 ? (
                <tr>
                  {/* Adjusted colspan to 5 */}
                  <td colSpan="5">No staff accounts available</td>
                </tr>
              ) : (
                paginatedStaffs.map((staff) => (
                  <tr key={staff.AccountID}>
                    <td>{staff.Username}</td>
                    <td>{staff.FullName}</td>
                    <td>{staff.Email}</td>
                    <td>{staff.PhoneNumber}</td>
                    {/* Added Actions data cell */}
                    <td style={{ width: "1%", whiteSpace: "nowrap" }}>
                      {/* Add Edit button here if needed in the future */}
                      {/* <button className="action-button edit-button">Edit</button> */}
                      <button
                         className="product-action-button" // Use a specific class for styling
                         onClick={() => handleDelete(staff.AccountID, staff.Username)} // Pass AccountID and Username
                         disabled={isLoading} // Disable button while loading/deleting
                      >
                         Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}


      <div className="prev-next-button" style={{ marginTop: "10px" }}>
        <button
          className="previous"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || isLoading || error}
        >
          &laquo; Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="next"
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages || isLoading || error}
        >
          Next &raquo;
        </button>
      </div>
    </Layout>
  );
}

export default StaffList;
