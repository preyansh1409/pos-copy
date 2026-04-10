≡ƒæë db.js loaded
Γ£à my sql connected succesfully
TABLE_MARKER: barcodes
CREATE TABLE `barcodes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_code` varchar(255) DEFAULT NULL,
  `barcode` varchar(50) DEFAULT NULL,
  `client_id` int(11) DEFAULT 1,
  `custom_code` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `barcode_client_id` (`barcode`,`client_id`)
) ENGINE=InnoDB AUTO_INCREMENT=131 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
TABLE_MARKER: cash_refunds
CREATE TABLE `cash_refunds` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_no` varchar(50) NOT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT 0.00,
  `issued_by` varchar(100) DEFAULT 'Staff',
  `refund_date` datetime DEFAULT current_timestamp(),
  `phone` varchar(20) DEFAULT NULL,
  `returned_items` longtext DEFAULT NULL,
  `redeemed_invoice_no` varchar(50) DEFAULT NULL,
  `redeemed_date` datetime DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Issued',
  `refund_mode` varchar(20) DEFAULT 'Cash',
  `client_id` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_invoice` (`invoice_no`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
TABLE_MARKER: category_gst
CREATE TABLE `category_gst` (
  `category` varchar(255) NOT NULL,
  `gst` decimal(5,2) DEFAULT 5.00,
  `client_id` int(11) DEFAULT 1,
  PRIMARY KEY (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
TABLE_MARKER: credit_notes
CREATE TABLE `credit_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `credit_note_no` varchar(50) NOT NULL,
  `invoice_no` varchar(50) NOT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT 0.00,
  `issued_by` varchar(100) DEFAULT 'Staff',
  `issued_date` datetime DEFAULT current_timestamp(),
  `status` varchar(50) DEFAULT 'Issued',
  `phone` varchar(20) DEFAULT NULL,
  `returned_items` longtext DEFAULT NULL,
  `redeemed_invoice_no` varchar(50) DEFAULT NULL,
  `redeemed_date` datetime DEFAULT NULL,
  `client_id` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `credit_note_no` (`credit_note_no`),
  KEY `idx_cn` (`credit_note_no`),
  KEY `idx_invoice` (`invoice_no`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
TABLE_MARKER: dayout_reports
CREATE TABLE `dayout_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_date` date NOT NULL,
  `report_time` varchar(20) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `net_cash` decimal(12,2) DEFAULT 0.00,
  `online_collection` decimal(12,2) DEFAULT 0.00,
  `grand_total` decimal(12,2) DEFAULT 0.00,
  `counted_cash` decimal(12,2) DEFAULT 0.00,
  `note_counts` longtext DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `client_id` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_date` (`report_date`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
TABLE_MARKER: edit_logs
CREATE TABLE `edit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_no` varchar(50) NOT NULL,
  `client_name` varchar(100) DEFAULT NULL,
  `old_data` longtext DEFAULT NULL,
  `new_data` longtext DEFAULT NULL,
  `edited_by` varchar(100) NOT NULL,
  `edit_time` datetime DEFAULT current_timestamp(),
  `client_id` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_invoice` (`invoice_no`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
TABLE_MARKER: item_replacements
CREATE TABLE `item_replacements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_no` varchar(50) NOT NULL,
  `client_name` varchar(100) DEFAULT NULL,
  `replacement_date` datetime DEFAULT current_timestamp(),
  `original_items` longtext NOT NULL,
  `replaced_items` longtext NOT NULL,
  `original_total` decimal(10,2) DEFAULT 0.00,
  `new_total` decimal(10,2) DEFAULT 0.00,
  `processed_by` varchar(100) DEFAULT 'Staff',
  `notes` text DEFAULT NULL,
  `is_return_exchange` tinyint(4) DEFAULT 1,
  `client_id` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_invoice` (`invoice_no`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
TABLE_MARKER: login_logs
CREATE TABLE `login_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `device_info` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Success',
  `login_time` datetime DEFAULT current_timestamp(),
  `client_id` int(11) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
TABLE_MARKER: masterdata
CREATE TABLE `masterdata` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` varchar(255) NOT NULL,
  `item` varchar(255) NOT NULL,
  `color` varchar(50) DEFAULT NULL,
  `size` varchar(10) DEFAULT NULL,
  `barcode` varchar(50) DEFAULT NULL,
  `product_code` varchar(255) DEFAULT NULL,
  `sizes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `client_id` int(11) DEFAULT 1,
  `original_barcode` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `barcode_client_idx` (`barcode`,`client_id`)
) ENGINE=InnoDB AUTO_INCREMENT=841 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;
TABLE_MARKER: purchase_edit_logs
CREATE TABLE `purchase_edit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_no` varchar(50) NOT NULL,
  `supplier_name` varchar(100) DEFAULT NULL,
  `old_data` longtext DEFAULT NULL,
  `new_data` longtext DEFAULT NULL,
  `edited_by` varchar(100) NOT NULL,
  `edit_time` datetime DEFAULT current_timestamp(),
  `client_id` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_invoice` (`invoice_no`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
TABLE_MARKER: purchases
CREATE TABLE `purchases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier_name` varchar(255) DEFAULT NULL,
  `gstin` varchar(50) DEFAULT NULL,
  `invoice_no` varchar(50) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `payment_mode` varchar(50) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  `size` varchar(10) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `qty` int(11) DEFAULT 0,
  `rate` decimal(10,2) DEFAULT 0.00,
  `gst_percent` decimal(5,2) DEFAULT 0.00,
  `amount` decimal(10,2) DEFAULT 0.00,
  `client_id` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_invoice` (`invoice_no`),
  KEY `idx_purchase_date` (`purchase_date`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
TABLE_MARKER: replacements
CREATE TABLE `replacements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `original_invoice` varchar(50) NOT NULL,
  `new_invoice` varchar(50) DEFAULT NULL,
  `client_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `replacement_date` datetime DEFAULT current_timestamp(),
  `old_items` longtext DEFAULT NULL,
  `new_items` longtext DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `processed_by` varchar(100) DEFAULT 'Sales',
  `client_id` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_rep_inv` (`original_invoice`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
TABLE_MARKER: sales_items
CREATE TABLE `sales_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_no` varchar(50) NOT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `sale_date` datetime DEFAULT current_timestamp(),
  `category` varchar(255) DEFAULT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  `size` varchar(10) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `qty` int(11) DEFAULT 1,
  `price` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) DEFAULT 0.00,
  `gst_percent` decimal(5,2) DEFAULT 5.00,
  `grand_total` decimal(10,2) DEFAULT 0.00,
  `payment_mode` varchar(50) DEFAULT 'Cash',
  `payment_status` varchar(50) DEFAULT 'Paid',
  `is_cn_update` tinyint(1) DEFAULT 0,
  `is_cash_refunded` tinyint(4) DEFAULT 0,
  `is_returned` tinyint(4) DEFAULT 0,
  `is_replaced` tinyint(1) DEFAULT 0,
  `client_id` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_invoice` (`invoice_no`),
  KEY `idx_sale_date` (`sale_date`)
) ENGINE=InnoDB AUTO_INCREMENT=436 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
TABLE_MARKER: sales_users
CREATE TABLE `sales_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `client_id` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
TABLE_MARKER: shop_config
CREATE TABLE `shop_config` (
  `id` int(11) NOT NULL,
  `shop_name` varchar(255) DEFAULT 'Prestige Garments',
  `address` text DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `gstin` varchar(20) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `client_id` int(11) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
TABLE_MARKER: stock_adjustments
CREATE TABLE `stock_adjustments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` varchar(255) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `size` varchar(10) NOT NULL,
  `color` varchar(50) NOT NULL,
  `qty` int(11) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `adjustment_date` datetime DEFAULT current_timestamp(),
  `processed_by` varchar(255) DEFAULT 'Admin',
  `adjusted_by` varchar(255) DEFAULT NULL,
  `type` enum('reduce','increase') DEFAULT 'reduce',
  `client_id` int(11) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
TABLE_MARKER: suppliers
CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `gstin` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `client_id` int(11) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
TABLE_MARKER: system_stock
CREATE TABLE `system_stock` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` varchar(255) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `color` varchar(50) NOT NULL,
  `size` varchar(10) NOT NULL,
  `available` int(11) DEFAULT 0,
  `client_id` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_stock` (`category`,`item_name`,`color`,`size`)
) ENGINE=InnoDB AUTO_INCREMENT=467 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
TABLE_MARKER: users
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `created_by` varchar(255) DEFAULT 'System',
  `created_at` datetime DEFAULT current_timestamp(),
  `email` varchar(255) DEFAULT NULL,
  `business_name` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` enum('pending','active','rejected') DEFAULT 'active',
  `client_id` int(11) DEFAULT 1,
  `custom_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
