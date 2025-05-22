-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 22, 2025 at 03:19 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mk_inventory_ledger`
--

-- --------------------------------------------------------

--
-- Table structure for table `account`
--

CREATE TABLE `account` (
  `AccountID` int(11) NOT NULL,
  `Username` varchar(50) NOT NULL,
  `FullName` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `PhoneNumber` varchar(20) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Role` varchar(50) NOT NULL,
  `ProfilePicture` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `account`
--

INSERT INTO `account` (`AccountID`, `Username`, `FullName`, `Email`, `PhoneNumber`, `Password`, `Role`, `ProfilePicture`) VALUES
(1, 'admin', 'JM', 'testlol@gmail.com', '09923048708', '$2y$10$NXjrKwetzGkUQ5Bqojw53.aJK47UJQPCO46MlkRl22onM6Hy7DWOO', 'staff', NULL),
(2, 'krustyk', 'Mr. Krabs', 'krustykrab@gmail.com', '09923048708', '$2y$10$TTwPBM7hloEJdvQyzWOFEuQ5QtT7t0K.AIrSf6d1Aq//GwMtN8si6', 'owner', NULL),
(3, 'owner', 'MK', 'mk2025@gmail.com', '09103854395', '$2y$10$O4Cum/BbPeL6D5gbBa7stO6J9pxf6df.yLA5qkLSwP2Jmd63ePpy.', 'Owner', NULL),
(4, 'admin77', 'mia', 'mia@gmail.com', '09129856001', '$2y$10$R.vEa8xScJoONTDZsNCiXukEDqJyjuyhcS2IQcEhZ9VsVfFw2m.9G', 'Owner', 'profile_pictures/b0b8de149a7f89faf03f4a723da58e67.png'),
(5, 'ryan', 'Ryan', 'ryan@gmail.com', '0900001', '$2y$10$sGnnxIt7lcmi6gdndccl9uN4b/aXLZwkQosuUJgY.teAnwqzLY1XG', 'Owner', 'profile_pictures/fe2f1c0b52f0e6175703a026e14386ce.jpeg'),
(6, 'kinshin', 'kin', 'kinshin@gmail.com', '090002', '$2y$10$Kku.gRF3YEZ6aKdxHyIDpeg3EikFdU070n75vVYiyeXInziSVxLWe', 'Staff', 'profile_pictures/a943653cc79e9607d98215b884b18c12.png'),
(7, 'test12', 'test', 'test@gmail.com', '090001', '$2y$10$Bf/Ci.2LYo0I2suWjVV75.H.HcHyBIt5hyrzdqsbtvb5McLlryAvO', 'Staff', NULL),
(8, 'test123', 'test12', 'test12@gmail.com', '090001', '$2y$10$LXuOgyKqJGHnTW9CZSl9F.hj0xR4CvRxRF7cmEW10LNhfKeDplm3K', 'Staff', 'profile_pictures/e703abe1d99ede3a1f9351eac483ccb0.png'),
(9, 'staff10', 'mia rose', 'miarose@gmail.com', '09104912713', '$2y$10$xeemLWczIBhq/Uzeib58G..n8GBd5qqwoem9WGfUoqbUCN9l879aa', 'Staff', 'profile_pictures/7cae1890432907df6b087977bcf270d0.jpeg');

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `CustomerID` int(11) NOT NULL,
  `CustomerName` varchar(100) NOT NULL,
  `ContactInfo` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`CustomerID`, `CustomerName`, `ContactInfo`) VALUES
(1, 'Andes', NULL),
(2, 'Jazmin', NULL),
(3, 'Juan', NULL),
(4, 'Rosario', NULL),
(5, 'Mia', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `ProductID` int(11) NOT NULL,
  `Barcode` varchar(50) NOT NULL,
  `ProductName` varchar(100) NOT NULL,
  `ProdCategoryID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`ProductID`, `Barcode`, `ProductName`, `ProdCategoryID`) VALUES
(1, '000001', 'Choco Chips Cookies', 1),
(2, '000002', 'Instant Noodles Chicken', 4),
(3, '000003', 'Evaporated Milk', 3),
(4, '000004', 'Tomato Sauce', 7),
(5, '000005', 'White Bread', 10),
(6, '000006', 'Mineral Water 350ml', 5),
(7, '000007', 'Shampoo Sachet', 16),
(8, '000008', 'Alcohol 70%', 19),
(9, '000009', 'School Notebook', 14),
(10, '000010', 'Cooking Oil 1L', 8),
(11, '000011', 'Black Ballpen', 14),
(12, '000012', 'Blue Ballpen', 14),
(13, '000013', 'Pencil #1', 14),
(14, '000014', 'Pencil #2', 14);

-- --------------------------------------------------------

--
-- Table structure for table `productcategory`
--

CREATE TABLE `productcategory` (
  `ProdCategoryID` int(11) NOT NULL,
  `CategoryName` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `productcategory`
--

INSERT INTO `productcategory` (`ProdCategoryID`, `CategoryName`) VALUES
(8, 'Baking & Cooking Ingredients'),
(15, 'Basic Tools'),
(5, 'Beverages'),
(10, 'Bread & Pastries'),
(6, 'Canned Goods'),
(7, 'Condiments & Sauces'),
(3, 'Dairy'),
(12, 'Electronics'),
(18, 'Fragrances'),
(2, 'Frozen Products'),
(16, 'Hair Care'),
(13, 'Kitchen Tools'),
(4, 'Noodles'),
(20, 'Oral Care'),
(9, 'Powdered Goods'),
(11, 'Rice & Grains'),
(19, 'Sanitizers & Antiseptics'),
(14, 'School Supplies'),
(21, 'Shaving & Grooming'),
(1, 'Snacks'),
(17, 'Soap & Body Wash');

-- --------------------------------------------------------

--
-- Table structure for table `productprice`
--

CREATE TABLE `productprice` (
  `ProductID` int(11) NOT NULL,
  `UnitPrice` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `productprice`
--

INSERT INTO `productprice` (`ProductID`, `UnitPrice`) VALUES
(1, 25.00),
(2, 10.00),
(3, 30.00),
(4, 18.00),
(5, 22.00),
(6, 15.00),
(7, 7.00),
(8, 45.00),
(9, 15.00),
(10, 70.00),
(11, 8.00),
(12, 8.00),
(13, 8.00),
(14, 8.00);

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `InvoiceNo` int(11) NOT NULL,
  `AccountID` int(11) NOT NULL,
  `SalesDate` date NOT NULL,
  `CustomerID` int(11) DEFAULT NULL,
  `PaymentStatus` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`InvoiceNo`, `AccountID`, `SalesDate`, `CustomerID`, `PaymentStatus`) VALUES
(1, 4, '2025-04-15', 1, 'Paid'),
(2, 4, '2025-04-15', NULL, 'Paid'),
(3, 4, '2025-04-20', 2, 'Pending'),
(5, 4, '2025-04-22', NULL, 'Paid'),
(9, 4, '2025-04-28', NULL, 'Paid'),
(10, 4, '2025-04-29', 3, 'Pending'),
(11, 4, '2025-04-29', NULL, 'Paid'),
(12, 4, '2025-05-03', 4, 'Paid'),
(14, 4, '2025-05-06', NULL, 'Paid'),
(15, 4, '2025-05-22', NULL, 'Paid'),
(16, 4, '2025-05-22', 5, 'Paid');

-- --------------------------------------------------------

--
-- Table structure for table `salesitem`
--

CREATE TABLE `salesitem` (
  `SalesItemID` int(11) NOT NULL,
  `InvoiceNo` int(11) NOT NULL,
  `ProductID` int(11) NOT NULL,
  `QuantitySold` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salesitem`
--

INSERT INTO `salesitem` (`SalesItemID`, `InvoiceNo`, `ProductID`, `QuantitySold`) VALUES
(1, 1, 1, 5),
(2, 1, 2, 2),
(3, 2, 2, 12),
(4, 3, 1, 3),
(5, 3, 3, 2),
(10, 5, 9, 15),
(11, 5, 11, 10),
(12, 5, 12, 10),
(13, 5, 13, 10),
(14, 5, 14, 10),
(15, 9, 7, 10),
(16, 10, 11, 5),
(17, 10, 1, 2),
(18, 11, 2, 5),
(19, 11, 5, 3),
(20, 12, 3, 12),
(22, 14, 4, 3),
(23, 14, 6, 13),
(24, 14, 11, 6),
(25, 15, 8, 3),
(26, 16, 5, 3);

-- --------------------------------------------------------

--
-- Table structure for table `stocks`
--

CREATE TABLE `stocks` (
  `StockID` int(11) NOT NULL,
  `ProductID` int(11) NOT NULL,
  `SupplierID` int(11) NOT NULL,
  `DateStocked` date NOT NULL,
  `StockQuantity` int(11) NOT NULL,
  `UnitCost` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stocks`
--

INSERT INTO `stocks` (`StockID`, `ProductID`, `SupplierID`, `DateStocked`, `StockQuantity`, `UnitCost`) VALUES
(1, 2, 1, '2025-04-13', 100, 10.00),
(2, 1, 1, '2025-04-13', 120, 18.00),
(3, 3, 1, '2025-04-14', 150, 22.00),
(4, 4, 2, '2025-04-17', 180, 13.00),
(5, 5, 2, '2025-04-23', 120, 16.00),
(6, 6, 2, '2025-04-24', 200, 15.00),
(7, 7, 2, '2025-04-27', 210, 7.00),
(8, 9, 1, '2025-05-10', 50, 10.00),
(9, 11, 2, '2025-05-10', 100, 8.00),
(10, 12, 1, '2025-05-12', 100, 8.00),
(11, 13, 2, '2025-05-22', 100, 8.00),
(12, 14, 1, '2025-05-13', 100, 8.00),
(13, 8, 3, '2025-05-22', 25, 45.00),
(14, 2, 1, '2025-05-22', 20, 10.00);

-- --------------------------------------------------------

--
-- Table structure for table `supplier`
--

CREATE TABLE `supplier` (
  `SupplierID` int(11) NOT NULL,
  `SupplierName` varchar(100) NOT NULL,
  `SupplierContactNumber` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supplier`
--

INSERT INTO `supplier` (`SupplierID`, `SupplierName`, `SupplierContactNumber`) VALUES
(1, 'Universal Grocery Supply', NULL),
(2, 'Everyday Essentials Distributor', NULL),
(3, 'Clean & Care Wholesale', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`AccountID`),
  ADD UNIQUE KEY `Username` (`Username`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`CustomerID`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`ProductID`),
  ADD UNIQUE KEY `Barcode` (`Barcode`),
  ADD KEY `ProdCategoryID` (`ProdCategoryID`);

--
-- Indexes for table `productcategory`
--
ALTER TABLE `productcategory`
  ADD PRIMARY KEY (`ProdCategoryID`),
  ADD UNIQUE KEY `CategoryName` (`CategoryName`);

--
-- Indexes for table `productprice`
--
ALTER TABLE `productprice`
  ADD PRIMARY KEY (`ProductID`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`InvoiceNo`),
  ADD KEY `AccountID` (`AccountID`),
  ADD KEY `CustomerID` (`CustomerID`);

--
-- Indexes for table `salesitem`
--
ALTER TABLE `salesitem`
  ADD PRIMARY KEY (`SalesItemID`),
  ADD KEY `InvoiceNo` (`InvoiceNo`),
  ADD KEY `ProductID` (`ProductID`);

--
-- Indexes for table `stocks`
--
ALTER TABLE `stocks`
  ADD PRIMARY KEY (`StockID`),
  ADD KEY `ProductID` (`ProductID`),
  ADD KEY `SupplierID` (`SupplierID`);

--
-- Indexes for table `supplier`
--
ALTER TABLE `supplier`
  ADD PRIMARY KEY (`SupplierID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account`
--
ALTER TABLE `account`
  MODIFY `AccountID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `CustomerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `ProductID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `productcategory`
--
ALTER TABLE `productcategory`
  MODIFY `ProdCategoryID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `InvoiceNo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `salesitem`
--
ALTER TABLE `salesitem`
  MODIFY `SalesItemID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `stocks`
--
ALTER TABLE `stocks`
  MODIFY `StockID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `supplier`
--
ALTER TABLE `supplier`
  MODIFY `SupplierID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `product_ibfk_1` FOREIGN KEY (`ProdCategoryID`) REFERENCES `productcategory` (`ProdCategoryID`);

--
-- Constraints for table `productprice`
--
ALTER TABLE `productprice`
  ADD CONSTRAINT `productprice_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `product` (`ProductID`);

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`AccountID`) REFERENCES `account` (`AccountID`),
  ADD CONSTRAINT `sales_ibfk_2` FOREIGN KEY (`CustomerID`) REFERENCES `customer` (`CustomerID`);

--
-- Constraints for table `salesitem`
--
ALTER TABLE `salesitem`
  ADD CONSTRAINT `salesitem_ibfk_1` FOREIGN KEY (`InvoiceNo`) REFERENCES `sales` (`InvoiceNo`),
  ADD CONSTRAINT `salesitem_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `product` (`ProductID`);

--
-- Constraints for table `stocks`
--
ALTER TABLE `stocks`
  ADD CONSTRAINT `stocks_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `product` (`ProductID`),
  ADD CONSTRAINT `stocks_ibfk_2` FOREIGN KEY (`SupplierID`) REFERENCES `supplier` (`SupplierID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
