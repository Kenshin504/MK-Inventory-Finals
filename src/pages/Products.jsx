import { useEffect, useState, useRef } from "react";
import Layout from "../components/Layout";
// Removed { UploadCloud } from "lucide-react";

const PRODUCTS_PER_PAGE = 10;

// Define the comprehensive list of product categories for the form dropdown
const PRODUCT_CATEGORIES = [
  "", // Default empty option
  "Snacks",
  "Frozen Products",
  "Dairy",
  "Noodles",
  "Beverages",
  "Canned Goods",
  "Condiments & Sauces",
  "Baking & Cooking Ingredients", // Includes Sugar/Salt variants
  "Powdered Goods", // Added category for coffee, powdered drinks, soups, etc.
  "Bread & Pastries",
  "Rice & Grains",
  "Electronics",
  "Kitchen Tools",
  "School Supplies",
  "Basic Tools",
  "Hair Care", // Shampoo/Conditioner
  "Soap & Body Wash", // Soap
  "Fragrances", // Perfume/Deodorant
  "Sanitizers & Antiseptics", // Alcohol
  "Oral Care", // Toothbrush/Toothpaste
  "Shaving & Grooming", // Razors
];


function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    productID: null,
    barcode: "",
    name: "",
    price: "",
    category: "", // Initialize with empty string to match default select option
    // Removed image field
  });

  const [editProductId, setEditProductId] = useState(null);
  // Removed previewImage state
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all"); // State for the filter dropdown
  const [currentPage, setCurrentPage] = useState(1);
  // Removed showUpload state

  // Removed fileInputRef

  // Fetch products from the backend on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      // Use direct hardcoded URL
      const response = await fetch("http://localhost/Mk-Host-main/backend/products.php", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Include authorization header if your backend requires it
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setProducts(result.products);
      } else {
        setError(result.error || "Failed to fetch products.");
      }
    } catch (err) {
      console.error("Fetch products error:", err);
      setError("Failed to connect to the server or fetch products.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Removed handleImageUpload function

  const handleAddOrUpdateProduct = async () => {
    // Removed image from formData destructuring
    const { productID, barcode, name, price, category } = formData;

    // Removed image check from validation
    if (!barcode || !name || !price || !category) {
      setError("Please fill in all fields.");
      return;
    }

    // Basic price validation
     if (isNaN(price) || parseFloat(price) < 0) {
         setError("Price must be a non-negative number.");
         return;
     }


    const data = new FormData();
    if (productID) {
      data.append("productID", productID);
    }
    data.append("barcode", barcode);
    data.append("name", name);
    data.append("price", price);
    data.append("category", category);
    // Removed appending image data


    setLoading(true);
    setError("");

    try {
      // Use direct hardcoded URL
      const response = await fetch("http://localhost/Mk-Host-main/backend/Products.php", {
        method: "POST",
        body: data,
      });
      const result = await response.json();

      if (response.ok && result.success) {
        // Instead of refetching all products, update the state directly
        // This is more efficient, especially for large lists
        if (productID) {
            // Update existing product in state
            setProducts(prevProducts =>
                prevProducts.map(p =>
                    p.ProductID === productID ? result.product : p
                )
            );
             alert(result.message || "Product updated successfully!");
        } else {
            // Add new product to state
            setProducts(prevProducts => [...prevProducts, result.product]);
            alert(result.message || "Product added successfully!");
        }


        setFormData({ // Reset form data
          productID: null,
          barcode: "",
          name: "",
          price: "",
          category: "",
          // Removed image field
        });
        // Removed setPreviewImage(null);
        setEditProductId(null);
        setIsFormVisible(false);
        setError(""); // Clear error on success

      } else {
        setError(result.error || `Failed to ${productID ? "update" : "add"} product.`);
      }
    } catch (err) {
      console.error(`${productID ? "Update" : "Add"} product error:`, err);
      setError(`Failed to connect to the server or ${productID ? "update" : "add"} product.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      productID: product.ProductID,
      barcode: product.Barcode,
      name: product.ProductName,
      price: product.UnitPrice, // Ensure price is a number if needed for input type="number"
      category: product.CategoryName,
      // Removed image from setFormData
    });
    // Removed setPreviewImage(product.Image);
    setEditProductId(product.ProductID);
    setIsFormVisible(true);
    setError(""); // Clear error when opening form
  };

  const handleDelete = async (productID) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (confirmed) {
      setLoading(true);
      setError("");
      try {
         const response = await fetch("http://localhost/Mk-Host-main/backend/products.php", {
             method: "DELETE",
             headers: {
                 "Content-Type": "application/json",
             },
             body: JSON.stringify({ productID: productID }),
         });
         const result = await response.json();

         if (response.ok && result.success) {
             // Remove the deleted product from the state
             setProducts(prev => prev.filter(p => p.ProductID !== productID));
             alert(result.message || "Product deleted successfully!");
         } else {
             setError(result.error || "Failed to delete product.");
         }
      } catch (err) {
          console.error("Delete product error:", err);
          setError("Failed to connect to the server or delete product.");
      } finally {
          setLoading(false);
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.ProductName.toLowerCase().includes(search.toLowerCase()) ||
                          p.Barcode.toLowerCase().includes(search.toLowerCase());
    // Ensure p.CategoryName is not null or undefined before calling toLowerCase()
    const matchesCategory =
      filterCategory === "all" || (p.CategoryName && p.CategoryName.toLowerCase() === filterCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  // Ensure currentPage doesn't exceed totalPages after filtering/deleting
   const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));


  const paginatedProducts = filteredProducts.slice(
    (safeCurrentPage - 1) * PRODUCTS_PER_PAGE,
    safeCurrentPage * PRODUCTS_PER_PAGE
  );

   // Update currentPage if it's now out of bounds
   useEffect(() => {
       if (currentPage > totalPages && totalPages > 0) {
           setCurrentPage(totalPages);
       } else if (currentPage > 1 && totalPages === 0 && filteredProducts.length === 0) { // Added condition for when all products are filtered out
           setCurrentPage(1);
       }
   }, [filteredProducts.length, currentPage, totalPages]);

  // Consistent styles for controls
  const controlInputStyle = {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "7px",
    marginRight: "15px",
    width: "300px", // Original width from previous inputStyle
  };

  const controlSelectStyle = {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "7px",
    marginRight: "15px",
    cursor: "pointer",
    backgroundColor: "white",
    width: "200px", // Original width from previous selectStyle
  };

  // Categories for the filter dropdown (dynamically generated from products)
  const filterCategories = ["all", ...new Set(products.map(p => p.CategoryName).filter(name => name))]; // Filter out null/undefined category names


  return (
    <Layout headerContent="Product Catalog" pageName="product">
      <div className="product-nav" style={{ marginBottom: "20px", display: "block", alignItems: "center" }}>
        <input
          type="text"
          placeholder="🔍︎ Search by Barcode or Name"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // Reset to page 1 on search
          }}
          style={controlInputStyle}
        />
        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setCurrentPage(1); // Reset to page 1 on filter change
          }}
          className="filter" // Retain class if it provides other base styles
          style={controlSelectStyle}
        >
          {filterCategories.map(category => (
             <option key={category} value={category}>{category === 'all' ? 'All Categories' : category}</option>
          ))}
        </select>
        <button
          className="edit-button"
          onClick={() => {
            setFormData({ // Reset form data for add
              productID: null,
              barcode: "",
              name: "",
              price: "",
              category: "", 
            });
            setEditProductId(null);
            setIsFormVisible(true);
            setError(""); 
          }}
        >
          Add Product
        </button>
      </div>

      {loading && <p>Loading products...</p>}

      {isFormVisible && (
        <div className="product-form-container" style={{ border: "2px solid #ccc", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
          <h3 style={{ paddingLeft: "20px" }}>{editProductId !== null ? "Edit Product" : "Add Product"}</h3>
          <div className="product-form">
            {error && <p style={{ color: "red", gridColumn: '1 / -1' }}>{error}</p>}
            <div>
              <label htmlFor="barcode">Barcode:</label><br/>
              <input
                id="barcode"
                name="barcode"
                placeholder="Barcode"
                style={{ marginTop: "10px" }}
                value={formData.barcode}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="name">Product Name:</label><br/>
              <input
                id="name"
                name="name"
                placeholder="Product Name"
                style={{ marginTop: "10px" }}
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="price">Price:</label><br/>
              <input
                id="price"
                name="price"
                type="number"
                placeholder="Price"
                style={{ width: "50%", marginTop: "10px" }}
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label htmlFor="category">Product Category:</label><br/>
              <select
                id="category"
                name="category"
                value={formData.category}
                style={{ width: "50%" , marginTop: "10px" }}
                onChange={handleInputChange}
                className="product-category"
                required
              >
                <option value="">Select Category</option>
                {PRODUCT_CATEGORIES.slice(1).map(category => (
                    <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: "15px", gridColumn: '1 / -1' }}>
              <button onClick={handleAddOrUpdateProduct} disabled={loading}>Submit</button>
              <button
                onClick={() => {
                  setIsFormVisible(false);
                  setEditProductId(null);
                  setError("");
                  setFormData({
                     productID: null,
                     barcode: "",
                     name: "",
                     price: "",
                     category: "",
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <h3>Merchandise List</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Barcode</th>
              <th>Product</th>
              <th>Price</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan="5">No products available { (search || filterCategory !== 'all') && "for your current search/filter"}</td>
              </tr>
            ) : (
              paginatedProducts.map((product) => (
                <tr key={product.ProductID}>
                  <td>{product.Barcode}</td>
                  <td>{product.ProductName}</td>
                  <td>₱{parseFloat(product.UnitPrice).toFixed(2)}</td>
                  <td>{product.CategoryName}</td>
                  <td style={{ width: "1%", whiteSpace: "nowrap" }}>
                    <button
                      className="product-action-button"
                      style={{ marginLeft:"0px" }}
                      onClick={() => handleEdit(product)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="product-action-button"
                      style={{ marginRight:"0px" }}
                      onClick={() => handleDelete(product.ProductID)}
                      disabled={loading}
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

      <div className="prev-next-button" style={{ marginTop: "10px" }}>
        <button
          className="previous"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={safeCurrentPage === 1 || loading || totalPages <= 1}
        >
          &laquo; Previous
        </button>
        <span>
          Page {safeCurrentPage} of {totalPages || 1}
        </span>
        <button
          className="next"
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={safeCurrentPage === totalPages || loading || totalPages <= 1}
        >
          Next &raquo;
        </button>
      </div>
    </Layout>
  );
}

export default Products;