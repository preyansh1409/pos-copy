-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: .0.0.1
-- Generation Time: Feb 24, 2026 at 12:30 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */
;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
;
/*!40101 SET NAMES utf8mb4 */
;
--
-- Database: `garment_db`
--
CREATE DATABASE IF NOT EXISTS `garment_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `garment_db`;
-- --------------------------------------------------------
--
-- Table structure for table `barcodes`
--

CREATE TABLE `barcodes` (
  `id` int(11) NOT NULL,
  `product_code` varchar(255) DEFAULT NULL,
  `barcode` varchar(255) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `barcodes`
--

INSERT INTO `barcodes` (`id`, `product_code`, `barcode`)
VALUES (1, '701', 'PRD-000036-S-Black'),
  (2, '702', 'PRD-000036-S-White'),
  (3, '703', 'PRD-000036-S-Blue'),
  (4, '704', 'PRD-000036-S-Grey'),
  (5, '705', 'PRD-000036-M-Black'),
  (6, '706', 'PRD-000036-M-White'),
  (7, '707', 'PRD-000036-M-Blue'),
  (8, '708', 'PRD-000036-M-Grey'),
  (9, '709', 'PRD-000036-L-Black'),
  (10, '710', 'PRD-000036-L-White'),
  (11, '711', 'PRD-000036-L-Blue'),
  (12, '712', 'PRD-000036-L-Grey'),
  (13, '713', 'PRD-000036-XL-Black'),
  (14, '714', 'PRD-000036-XL-White'),
  (15, '715', 'PRD-000036-XL-Blue'),
  (16, '716', 'PRD-000036-XL-Grey'),
  (17, '717', 'PRD-000036-XXL-Black'),
  (18, '718', 'PRD-000036-XXL-White'),
  (19, '719', 'PRD-000036-XXL-Blue'),
  (20, '720', 'PRD-000036-XXL-Grey'),
  (21, '721', 'PRD-000037-S-Black'),
  (22, '722', 'PRD-000037-S-White'),
  (23, '723', 'PRD-000037-S-Blue'),
  (24, '724', 'PRD-000037-S-Grey'),
  (25, '725', 'PRD-000037-M-Black'),
  (26, '726', 'PRD-000037-M-White'),
  (27, '727', 'PRD-000037-M-Blue'),
  (28, '728', 'PRD-000037-M-Grey'),
  (29, '729', 'PRD-000037-L-Black'),
  (30, '730', 'PRD-000037-L-White'),
  (31, '731', 'PRD-000037-L-Blue'),
  (32, '732', 'PRD-000037-L-Grey'),
  (33, '733', 'PRD-000037-XL-Black'),
  (34, '734', 'PRD-000037-XL-White'),
  (35, '735', 'PRD-000037-XL-Blue'),
  (36, '736', 'PRD-000037-XL-Grey'),
  (37, '737', 'PRD-000037-XXL-Black'),
  (38, '738', 'PRD-000037-XXL-White'),
  (39, '739', 'PRD-000037-XXL-Blue'),
  (40, '740', 'PRD-000037-XXL-Grey'),
  (41, '741', 'PRD-000038-S-Black'),
  (42, '742', 'PRD-000038-S-White'),
  (43, '743', 'PRD-000038-S-Blue'),
  (44, '744', 'PRD-000038-S-Grey'),
  (45, '745', 'PRD-000038-M-Black'),
  (46, '746', 'PRD-000038-M-White'),
  (47, '747', 'PRD-000038-M-Blue'),
  (48, '748', 'PRD-000038-M-Grey'),
  (49, '749', 'PRD-000038-L-Black'),
  (50, '750', 'PRD-000038-L-White'),
  (51, '751', 'PRD-000038-L-Blue'),
  (52, '752', 'PRD-000038-L-Grey'),
  (53, '753', 'PRD-000038-XL-Black'),
  (54, '754', 'PRD-000038-XL-White'),
  (55, '755', 'PRD-000038-XL-Blue'),
  (56, '756', 'PRD-000038-XL-Grey'),
  (57, '757', 'PRD-000038-XXL-Black'),
  (58, '758', 'PRD-000038-XXL-White'),
  (59, '759', 'PRD-000038-XXL-Blue'),
  (60, '760', 'PRD-000038-XXL-Grey'),
  (61, '761', 'PRD-000039-S-Black'),
  (62, '762', 'PRD-000039-S-White'),
  (63, '763', 'PRD-000039-S-Blue'),
  (64, '764', 'PRD-000039-S-Grey'),
  (65, '765', 'PRD-000039-M-Black'),
  (66, '766', 'PRD-000039-M-White'),
  (67, '767', 'PRD-000039-M-Blue'),
  (68, '768', 'PRD-000039-M-Grey'),
  (69, '769', 'PRD-000039-L-Black'),
  (70, '770', 'PRD-000039-L-White'),
  (71, '771', 'PRD-000039-L-Blue'),
  (72, '772', 'PRD-000039-L-Grey'),
  (73, '773', 'PRD-000039-XL-Black'),
  (74, '774', 'PRD-000039-XL-White'),
  (75, '775', 'PRD-000039-XL-Blue'),
  (76, '776', 'PRD-000039-XL-Grey'),
  (77, '777', 'PRD-000039-XXL-Black'),
  (78, '778', 'PRD-000039-XXL-White'),
  (79, '779', 'PRD-000039-XXL-Blue'),
  (80, '780', 'PRD-000039-XXL-Grey'),
  (86, '796', 'PRD-000001-S-green'),
  (87, '797', 'PRD-000001-M-green'),
  (88, '798', 'PRD-000001-L-green'),
  (89, '799', 'PRD-000001-XL-green'),
  (90, '800', 'PRD-000001-XXL-green');
-- --------------------------------------------------------
--
-- Table structure for table `category_gst`
--

CREATE TABLE `category_gst` (
  `category` varchar(255) NOT NULL,
  `gst` decimal(5, 2) DEFAULT 5.00
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- --------------------------------------------------------
--
-- Table structure for table `edit_logs`
--

CREATE TABLE `edit_logs` (
  `id` int(11) NOT NULL,
  `invoice_no` varchar(50) NOT NULL,
  `client_name` varchar(100) DEFAULT NULL,
  `old_data` longtext DEFAULT NULL,
  `new_data` longtext DEFAULT NULL,
  `edited_by` varchar(100) NOT NULL,
  `edit_time` datetime DEFAULT current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `edit_logs`
--

INSERT INTO `edit_logs` (
    `id`,
    `invoice_no`,
    `client_name`,
    `old_data`,
    `new_data`,
    `edited_by`,
    `edit_time`
  )
VALUES (
    1,
    'INV-1329',
    'test21',
    '{\"client_name\":\"test1\",\"phone\":\"test2\",\"payment_status\":\"Received\",\"grand_total\":\"314.00\",\"items\":[{\"category\":\"Round Neck T-Shirts\",\"item_name\":\"Plain Round Neck\",\"size\":\"L\",\"color\":\"White\",\"qty\":1,\"price\":\"299.00\"}]}',
    '{\"client_name\":\"test21\",\"phone\":\"test4\",\"payment_status\":\"Done\",\"grand_total\":\"0.00\",\"items\":[{\"category\":\"Round Neck T-Shirts\",\"item_name\":\"Plain Round Neck\",\"size\":\"L\",\"color\":\"White\",\"qty\":\"2\",\"price\":\"299.00\",\"total\":null,\"gst\":\"5.00\",\"payment_status\":\"Received\"}]}',
    'Admin',
    '2026-02-20 15:36:27'
  ),
  (
    3,
    'INV-1329',
    'test1',
    '{\"client_name\":\"test2\",\"grand_total\":\"313.95\",\"items\":[{\"category\":\"Round Neck T-Shirts\",\"item_name\":\"Plain Round Neck\",\"size\":\"L\",\"color\":\"White\",\"qty\":1,\"price\":\"299.00\"}]}',
    '{\"client_name\":\"test1\",\"grand_total\":\"627.90\",\"items\":[{\"category\":\"Round Neck T-Shirts\",\"item_name\":\"Plain Round Neck\",\"size\":\"L\",\"color\":\"White\",\"qty\":2,\"price\":\"299.00\",\"total\":\"299.00\",\"gst\":\"5.00\",\"payment_status\":\"Done\"}]}',
    'Admin',
    '2026-02-20 15:54:39'
  );
-- --------------------------------------------------------
--
-- Table structure for table `login_logs`
--

CREATE TABLE `login_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `device_info` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Success',
  `login_time` datetime DEFAULT current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `login_logs`
--

INSERT INTO `login_logs` (
    `id`,
    `user_id`,
    `username`,
    `role`,
    `ip_address`,
    `device_info`,
    `status`,
    `login_time`
  )
VALUES (
    1,
    2,
    '1111',
    'sales',
    '::1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0',
    'Success',
    '2026-02-20 13:53:38'
  ),
  (
    2,
    3,
    '2222',
    'manager',
    '::1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0',
    'Success',
    '2026-02-20 13:55:13'
  ),
  (
    3,
    2,
    '1111',
    'sales',
    '::1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0',
    'Success',
    '2026-02-20 17:44:07'
  ),
  (
    4,
    2,
    '1111',
    'sales',
    '::1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0',
    'Success',
    '2026-02-23 13:04:44'
  );
-- --------------------------------------------------------
--
-- Table structure for table `masterdata`
--

CREATE TABLE `masterdata` (
  `id` int(11) NOT NULL,
  `category` varchar(255) NOT NULL,
  `item` varchar(255) NOT NULL,
  `color` varchar(50) DEFAULT NULL,
  `size` varchar(10) DEFAULT NULL,
  `barcode` varchar(255) DEFAULT NULL,
  `product_code` varchar(255) DEFAULT NULL,
  `sizes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `masterdata`
--

INSERT INTO `masterdata` (
    `id`,
    `category`,
    `item`,
    `color`,
    `size`,
    `barcode`,
    `product_code`,
    `sizes`,
    `created_at`
  )
VALUES (
    1,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'Black',
    'S',
    'PRD-000001-S-Black',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    2,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'White',
    'S',
    'PRD-000001-S-White',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    3,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'Blue',
    'S',
    'PRD-000001-S-Blue',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    4,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'Grey',
    'S',
    'PRD-000001-S-Grey',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    5,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'Black',
    'M',
    'PRD-000001-M-Black',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    6,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'White',
    'M',
    'PRD-000001-M-White',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    7,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'Blue',
    'M',
    'PRD-000001-M-Blue',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    8,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'Grey',
    'M',
    'PRD-000001-M-Grey',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    9,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'Black',
    'L',
    'PRD-000001-L-Black',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    10,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'White',
    'L',
    'PRD-000001-L-White',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    11,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'Blue',
    'L',
    'PRD-000001-L-Blue',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    12,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'Grey',
    'L',
    'PRD-000001-L-Grey',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    13,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'Black',
    'XL',
    'PRD-000001-XL-Black',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    14,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'White',
    'XL',
    'PRD-000001-XL-White',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    15,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'Blue',
    'XL',
    'PRD-000001-XL-Blue',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    16,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'Grey',
    'XL',
    'PRD-000001-XL-Grey',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    17,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'Black',
    'XXL',
    'PRD-000001-XXL-Black',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    18,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'White',
    'XXL',
    'PRD-000001-XXL-White',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    19,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'Blue',
    'XXL',
    'PRD-000001-XXL-Blue',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    20,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'Grey',
    'XXL',
    'PRD-000001-XXL-Grey',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    21,
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'Black',
    'S',
    'PRD-000002-S-Black',
    'PRD-000002',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    22,
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'White',
    'S',
    'PRD-000002-S-White',
    'PRD-000002',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    23,
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'Blue',
    'S',
    'PRD-000002-S-Blue',
    'PRD-000002',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    24,
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'Grey',
    'S',
    'PRD-000002-S-Grey',
    'PRD-000002',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    25,
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'Black',
    'M',
    'PRD-000002-M-Black',
    'PRD-000002',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    26,
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'White',
    'M',
    'PRD-000002-M-White',
    'PRD-000002',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    27,
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'Blue',
    'M',
    'PRD-000002-M-Blue',
    'PRD-000002',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    28,
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'Grey',
    'M',
    'PRD-000002-M-Grey',
    'PRD-000002',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    29,
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'Black',
    'L',
    'PRD-000002-L-Black',
    'PRD-000002',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    30,
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'White',
    'L',
    'PRD-000002-L-White',
    'PRD-000002',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    31,
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'Blue',
    'L',
    'PRD-000002-L-Blue',
    'PRD-000002',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    32,
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'Grey',
    'L',
    'PRD-000002-L-Grey',
    'PRD-000002',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    33,
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'Black',
    'XL',
    'PRD-000002-XL-Black',
    'PRD-000002',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    34,
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'White',
    'XL',
    'PRD-000002-XL-White',
    'PRD-000002',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    35,
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'Blue',
    'XL',
    'PRD-000002-XL-Blue',
    'PRD-000002',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    36,
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'Grey',
    'XL',
    'PRD-000002-XL-Grey',
    'PRD-000002',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    37,
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'Black',
    'XXL',
    'PRD-000002-XXL-Black',
    'PRD-000002',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    38,
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'White',
    'XXL',
    'PRD-000002-XXL-White',
    'PRD-000002',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    39,
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'Blue',
    'XXL',
    'PRD-000002-XXL-Blue',
    'PRD-000002',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    40,
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'Grey',
    'XXL',
    'PRD-000002-XXL-Grey',
    'PRD-000002',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    41,
    'Round Neck T-Shirts',
    'Striped Round Neck',
    'Black',
    'S',
    'PRD-000003-S-Black',
    'PRD-000003',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    42,
    'Round Neck T-Shirts',
    'Striped Round Neck',
    'White',
    'S',
    'PRD-000003-S-White',
    'PRD-000003',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    43,
    'Round Neck T-Shirts',
    'Striped Round Neck',
    'Blue',
    'S',
    'PRD-000003-S-Blue',
    'PRD-000003',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    44,
    'Round Neck T-Shirts',
    'Striped Round Neck',
    'Grey',
    'S',
    'PRD-000003-S-Grey',
    'PRD-000003',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    45,
    'Round Neck T-Shirts',
    'Striped Round Neck',
    'Black',
    'M',
    'PRD-000003-M-Black',
    'PRD-000003',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    46,
    'Round Neck T-Shirts',
    'Striped Round Neck',
    'White',
    'M',
    'PRD-000003-M-White',
    'PRD-000003',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:46'
  ),
  (
    47,
    'Round Neck T-Shirts',
    'Striped Round Neck',
    'Blue',
    'M',
    'PRD-000003-M-Blue',
    'PRD-000003',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    48,
    'Round Neck T-Shirts',
    'Striped Round Neck',
    'Grey',
    'M',
    'PRD-000003-M-Grey',
    'PRD-000003',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    49,
    'Round Neck T-Shirts',
    'Striped Round Neck',
    'Black',
    'L',
    'PRD-000003-L-Black',
    'PRD-000003',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    50,
    'Round Neck T-Shirts',
    'Striped Round Neck',
    'White',
    'L',
    'PRD-000003-L-White',
    'PRD-000003',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    51,
    'Round Neck T-Shirts',
    'Striped Round Neck',
    'Blue',
    'L',
    'PRD-000003-L-Blue',
    'PRD-000003',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    52,
    'Round Neck T-Shirts',
    'Striped Round Neck',
    'Grey',
    'L',
    'PRD-000003-L-Grey',
    'PRD-000003',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    53,
    'Round Neck T-Shirts',
    'Striped Round Neck',
    'Black',
    'XL',
    'PRD-000003-XL-Black',
    'PRD-000003',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    54,
    'Round Neck T-Shirts',
    'Striped Round Neck',
    'White',
    'XL',
    'PRD-000003-XL-White',
    'PRD-000003',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    55,
    'Round Neck T-Shirts',
    'Striped Round Neck',
    'Blue',
    'XL',
    'PRD-000003-XL-Blue',
    'PRD-000003',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    56,
    'Round Neck T-Shirts',
    'Striped Round Neck',
    'Grey',
    'XL',
    'PRD-000003-XL-Grey',
    'PRD-000003',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    57,
    'Round Neck T-Shirts',
    'Striped Round Neck',
    'Black',
    'XXL',
    'PRD-000003-XXL-Black',
    'PRD-000003',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    58,
    'Round Neck T-Shirts',
    'Striped Round Neck',
    'White',
    'XXL',
    'PRD-000003-XXL-White',
    'PRD-000003',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    59,
    'Round Neck T-Shirts',
    'Striped Round Neck',
    'Blue',
    'XXL',
    'PRD-000003-XXL-Blue',
    'PRD-000003',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    60,
    'Round Neck T-Shirts',
    'Striped Round Neck',
    'Grey',
    'XXL',
    'PRD-000003-XXL-Grey',
    'PRD-000003',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    61,
    'Polo T-Shirts',
    'Solid Polo T-Shirt',
    'Black',
    'S',
    'PRD-000004-S-Black',
    'PRD-000004',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    62,
    'Polo T-Shirts',
    'Solid Polo T-Shirt',
    'White',
    'S',
    'PRD-000004-S-White',
    'PRD-000004',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    63,
    'Polo T-Shirts',
    'Solid Polo T-Shirt',
    'Blue',
    'S',
    'PRD-000004-S-Blue',
    'PRD-000004',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    64,
    'Polo T-Shirts',
    'Solid Polo T-Shirt',
    'Grey',
    'S',
    'PRD-000004-S-Grey',
    'PRD-000004',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    65,
    'Polo T-Shirts',
    'Solid Polo T-Shirt',
    'Black',
    'M',
    'PRD-000004-M-Black',
    'PRD-000004',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    66,
    'Polo T-Shirts',
    'Solid Polo T-Shirt',
    'White',
    'M',
    'PRD-000004-M-White',
    'PRD-000004',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    67,
    'Polo T-Shirts',
    'Solid Polo T-Shirt',
    'Blue',
    'M',
    'PRD-000004-M-Blue',
    'PRD-000004',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    68,
    'Polo T-Shirts',
    'Solid Polo T-Shirt',
    'Grey',
    'M',
    'PRD-000004-M-Grey',
    'PRD-000004',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    69,
    'Polo T-Shirts',
    'Solid Polo T-Shirt',
    'Black',
    'L',
    'PRD-000004-L-Black',
    'PRD-000004',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    70,
    'Polo T-Shirts',
    'Solid Polo T-Shirt',
    'White',
    'L',
    'PRD-000004-L-White',
    'PRD-000004',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    71,
    'Polo T-Shirts',
    'Solid Polo T-Shirt',
    'Blue',
    'L',
    'PRD-000004-L-Blue',
    'PRD-000004',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    72,
    'Polo T-Shirts',
    'Solid Polo T-Shirt',
    'Grey',
    'L',
    'PRD-000004-L-Grey',
    'PRD-000004',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    73,
    'Polo T-Shirts',
    'Solid Polo T-Shirt',
    'Black',
    'XL',
    'PRD-000004-XL-Black',
    'PRD-000004',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    74,
    'Polo T-Shirts',
    'Solid Polo T-Shirt',
    'White',
    'XL',
    'PRD-000004-XL-White',
    'PRD-000004',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    75,
    'Polo T-Shirts',
    'Solid Polo T-Shirt',
    'Blue',
    'XL',
    'PRD-000004-XL-Blue',
    'PRD-000004',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    76,
    'Polo T-Shirts',
    'Solid Polo T-Shirt',
    'Grey',
    'XL',
    'PRD-000004-XL-Grey',
    'PRD-000004',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    77,
    'Polo T-Shirts',
    'Solid Polo T-Shirt',
    'Black',
    'XXL',
    'PRD-000004-XXL-Black',
    'PRD-000004',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    78,
    'Polo T-Shirts',
    'Solid Polo T-Shirt',
    'White',
    'XXL',
    'PRD-000004-XXL-White',
    'PRD-000004',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    79,
    'Polo T-Shirts',
    'Solid Polo T-Shirt',
    'Blue',
    'XXL',
    'PRD-000004-XXL-Blue',
    'PRD-000004',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    80,
    'Polo T-Shirts',
    'Solid Polo T-Shirt',
    'Grey',
    'XXL',
    'PRD-000004-XXL-Grey',
    'PRD-000004',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    81,
    'Polo T-Shirts',
    'Striped Polo T-Shirt',
    'Black',
    'S',
    'PRD-000005-S-Black',
    'PRD-000005',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    82,
    'Polo T-Shirts',
    'Striped Polo T-Shirt',
    'White',
    'S',
    'PRD-000005-S-White',
    'PRD-000005',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    83,
    'Polo T-Shirts',
    'Striped Polo T-Shirt',
    'Blue',
    'S',
    'PRD-000005-S-Blue',
    'PRD-000005',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    84,
    'Polo T-Shirts',
    'Striped Polo T-Shirt',
    'Grey',
    'S',
    'PRD-000005-S-Grey',
    'PRD-000005',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    85,
    'Polo T-Shirts',
    'Striped Polo T-Shirt',
    'Black',
    'M',
    'PRD-000005-M-Black',
    'PRD-000005',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    86,
    'Polo T-Shirts',
    'Striped Polo T-Shirt',
    'White',
    'M',
    'PRD-000005-M-White',
    'PRD-000005',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    87,
    'Polo T-Shirts',
    'Striped Polo T-Shirt',
    'Blue',
    'M',
    'PRD-000005-M-Blue',
    'PRD-000005',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    88,
    'Polo T-Shirts',
    'Striped Polo T-Shirt',
    'Grey',
    'M',
    'PRD-000005-M-Grey',
    'PRD-000005',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    89,
    'Polo T-Shirts',
    'Striped Polo T-Shirt',
    'Black',
    'L',
    'PRD-000005-L-Black',
    'PRD-000005',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    90,
    'Polo T-Shirts',
    'Striped Polo T-Shirt',
    'White',
    'L',
    'PRD-000005-L-White',
    'PRD-000005',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    91,
    'Polo T-Shirts',
    'Striped Polo T-Shirt',
    'Blue',
    'L',
    'PRD-000005-L-Blue',
    'PRD-000005',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    92,
    'Polo T-Shirts',
    'Striped Polo T-Shirt',
    'Grey',
    'L',
    'PRD-000005-L-Grey',
    'PRD-000005',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    93,
    'Polo T-Shirts',
    'Striped Polo T-Shirt',
    'Black',
    'XL',
    'PRD-000005-XL-Black',
    'PRD-000005',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    94,
    'Polo T-Shirts',
    'Striped Polo T-Shirt',
    'White',
    'XL',
    'PRD-000005-XL-White',
    'PRD-000005',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    95,
    'Polo T-Shirts',
    'Striped Polo T-Shirt',
    'Blue',
    'XL',
    'PRD-000005-XL-Blue',
    'PRD-000005',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    96,
    'Polo T-Shirts',
    'Striped Polo T-Shirt',
    'Grey',
    'XL',
    'PRD-000005-XL-Grey',
    'PRD-000005',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    97,
    'Polo T-Shirts',
    'Striped Polo T-Shirt',
    'Black',
    'XXL',
    'PRD-000005-XXL-Black',
    'PRD-000005',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    98,
    'Polo T-Shirts',
    'Striped Polo T-Shirt',
    'White',
    'XXL',
    'PRD-000005-XXL-White',
    'PRD-000005',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    99,
    'Polo T-Shirts',
    'Striped Polo T-Shirt',
    'Blue',
    'XXL',
    'PRD-000005-XXL-Blue',
    'PRD-000005',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    100,
    'Polo T-Shirts',
    'Striped Polo T-Shirt',
    'Grey',
    'XXL',
    'PRD-000005-XXL-Grey',
    'PRD-000005',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    101,
    'Polo T-Shirts',
    'Logo Polo T-Shirt',
    'Black',
    'S',
    'PRD-000006-S-Black',
    'PRD-000006',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    102,
    'Polo T-Shirts',
    'Logo Polo T-Shirt',
    'White',
    'S',
    'PRD-000006-S-White',
    'PRD-000006',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    103,
    'Polo T-Shirts',
    'Logo Polo T-Shirt',
    'Blue',
    'S',
    'PRD-000006-S-Blue',
    'PRD-000006',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    104,
    'Polo T-Shirts',
    'Logo Polo T-Shirt',
    'Grey',
    'S',
    'PRD-000006-S-Grey',
    'PRD-000006',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    105,
    'Polo T-Shirts',
    'Logo Polo T-Shirt',
    'Black',
    'M',
    'PRD-000006-M-Black',
    'PRD-000006',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    106,
    'Polo T-Shirts',
    'Logo Polo T-Shirt',
    'White',
    'M',
    'PRD-000006-M-White',
    'PRD-000006',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    107,
    'Polo T-Shirts',
    'Logo Polo T-Shirt',
    'Blue',
    'M',
    'PRD-000006-M-Blue',
    'PRD-000006',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    108,
    'Polo T-Shirts',
    'Logo Polo T-Shirt',
    'Grey',
    'M',
    'PRD-000006-M-Grey',
    'PRD-000006',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    109,
    'Polo T-Shirts',
    'Logo Polo T-Shirt',
    'Black',
    'L',
    'PRD-000006-L-Black',
    'PRD-000006',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    110,
    'Polo T-Shirts',
    'Logo Polo T-Shirt',
    'White',
    'L',
    'PRD-000006-L-White',
    'PRD-000006',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    111,
    'Polo T-Shirts',
    'Logo Polo T-Shirt',
    'Blue',
    'L',
    'PRD-000006-L-Blue',
    'PRD-000006',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    112,
    'Polo T-Shirts',
    'Logo Polo T-Shirt',
    'Grey',
    'L',
    'PRD-000006-L-Grey',
    'PRD-000006',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    113,
    'Polo T-Shirts',
    'Logo Polo T-Shirt',
    'Black',
    'XL',
    'PRD-000006-XL-Black',
    'PRD-000006',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    114,
    'Polo T-Shirts',
    'Logo Polo T-Shirt',
    'White',
    'XL',
    'PRD-000006-XL-White',
    'PRD-000006',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    115,
    'Polo T-Shirts',
    'Logo Polo T-Shirt',
    'Blue',
    'XL',
    'PRD-000006-XL-Blue',
    'PRD-000006',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    116,
    'Polo T-Shirts',
    'Logo Polo T-Shirt',
    'Grey',
    'XL',
    'PRD-000006-XL-Grey',
    'PRD-000006',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    117,
    'Polo T-Shirts',
    'Logo Polo T-Shirt',
    'Black',
    'XXL',
    'PRD-000006-XXL-Black',
    'PRD-000006',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    118,
    'Polo T-Shirts',
    'Logo Polo T-Shirt',
    'White',
    'XXL',
    'PRD-000006-XXL-White',
    'PRD-000006',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    119,
    'Polo T-Shirts',
    'Logo Polo T-Shirt',
    'Blue',
    'XXL',
    'PRD-000006-XXL-Blue',
    'PRD-000006',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    120,
    'Polo T-Shirts',
    'Logo Polo T-Shirt',
    'Grey',
    'XXL',
    'PRD-000006-XXL-Grey',
    'PRD-000006',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    121,
    'Shirts',
    'Casual Shirt',
    'Black',
    'S',
    'PRD-000007-S-Black',
    'PRD-000007',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    122,
    'Shirts',
    'Casual Shirt',
    'White',
    'S',
    'PRD-000007-S-White',
    'PRD-000007',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    123,
    'Shirts',
    'Casual Shirt',
    'Blue',
    'S',
    'PRD-000007-S-Blue',
    'PRD-000007',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    124,
    'Shirts',
    'Casual Shirt',
    'Grey',
    'S',
    'PRD-000007-S-Grey',
    'PRD-000007',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    125,
    'Shirts',
    'Casual Shirt',
    'Black',
    'M',
    'PRD-000007-M-Black',
    'PRD-000007',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    126,
    'Shirts',
    'Casual Shirt',
    'White',
    'M',
    'PRD-000007-M-White',
    'PRD-000007',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
,
    'Shirts',
    'Casual Shirt',
    'Blue',
    'M',
    'PRD-000007-M-Blue',
    'PRD-000007',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    128,
    'Shirts',
    'Casual Shirt',
    'Grey',
    'M',
    'PRD-000007-M-Grey',
    'PRD-000007',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    129,
    'Shirts',
    'Casual Shirt',
    'Black',
    'L',
    'PRD-000007-L-Black',
    'PRD-000007',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    130,
    'Shirts',
    'Casual Shirt',
    'White',
    'L',
    'PRD-000007-L-White',
    'PRD-000007',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    131,
    'Shirts',
    'Casual Shirt',
    'Blue',
    'L',
    'PRD-000007-L-Blue',
    'PRD-000007',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    132,
    'Shirts',
    'Casual Shirt',
    'Grey',
    'L',
    'PRD-000007-L-Grey',
    'PRD-000007',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    133,
    'Shirts',
    'Casual Shirt',
    'Black',
    'XL',
    'PRD-000007-XL-Black',
    'PRD-000007',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    134,
    'Shirts',
    'Casual Shirt',
    'White',
    'XL',
    'PRD-000007-XL-White',
    'PRD-000007',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    135,
    'Shirts',
    'Casual Shirt',
    'Blue',
    'XL',
    'PRD-000007-XL-Blue',
    'PRD-000007',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    136,
    'Shirts',
    'Casual Shirt',
    'Grey',
    'XL',
    'PRD-000007-XL-Grey',
    'PRD-000007',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    137,
    'Shirts',
    'Casual Shirt',
    'Black',
    'XXL',
    'PRD-000007-XXL-Black',
    'PRD-000007',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    138,
    'Shirts',
    'Casual Shirt',
    'White',
    'XXL',
    'PRD-000007-XXL-White',
    'PRD-000007',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    139,
    'Shirts',
    'Casual Shirt',
    'Blue',
    'XXL',
    'PRD-000007-XXL-Blue',
    'PRD-000007',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    140,
    'Shirts',
    'Casual Shirt',
    'Grey',
    'XXL',
    'PRD-000007-XXL-Grey',
    'PRD-000007',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    141,
    'Shirts',
    'Formal Shirt',
    'Black',
    'S',
    'PRD-000008-S-Black',
    'PRD-000008',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    142,
    'Shirts',
    'Formal Shirt',
    'White',
    'S',
    'PRD-000008-S-White',
    'PRD-000008',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    143,
    'Shirts',
    'Formal Shirt',
    'Blue',
    'S',
    'PRD-000008-S-Blue',
    'PRD-000008',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    144,
    'Shirts',
    'Formal Shirt',
    'Grey',
    'S',
    'PRD-000008-S-Grey',
    'PRD-000008',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    145,
    'Shirts',
    'Formal Shirt',
    'Black',
    'M',
    'PRD-000008-M-Black',
    'PRD-000008',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    146,
    'Shirts',
    'Formal Shirt',
    'White',
    'M',
    'PRD-000008-M-White',
    'PRD-000008',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    147,
    'Shirts',
    'Formal Shirt',
    'Blue',
    'M',
    'PRD-000008-M-Blue',
    'PRD-000008',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    148,
    'Shirts',
    'Formal Shirt',
    'Grey',
    'M',
    'PRD-000008-M-Grey',
    'PRD-000008',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    149,
    'Shirts',
    'Formal Shirt',
    'Black',
    'L',
    'PRD-000008-L-Black',
    'PRD-000008',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    150,
    'Shirts',
    'Formal Shirt',
    'White',
    'L',
    'PRD-000008-L-White',
    'PRD-000008',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    151,
    'Shirts',
    'Formal Shirt',
    'Blue',
    'L',
    'PRD-000008-L-Blue',
    'PRD-000008',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    152,
    'Shirts',
    'Formal Shirt',
    'Grey',
    'L',
    'PRD-000008-L-Grey',
    'PRD-000008',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    153,
    'Shirts',
    'Formal Shirt',
    'Black',
    'XL',
    'PRD-000008-XL-Black',
    'PRD-000008',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    154,
    'Shirts',
    'Formal Shirt',
    'White',
    'XL',
    'PRD-000008-XL-White',
    'PRD-000008',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    155,
    'Shirts',
    'Formal Shirt',
    'Blue',
    'XL',
    'PRD-000008-XL-Blue',
    'PRD-000008',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    156,
    'Shirts',
    'Formal Shirt',
    'Grey',
    'XL',
    'PRD-000008-XL-Grey',
    'PRD-000008',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    157,
    'Shirts',
    'Formal Shirt',
    'Black',
    'XXL',
    'PRD-000008-XXL-Black',
    'PRD-000008',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    158,
    'Shirts',
    'Formal Shirt',
    'White',
    'XXL',
    'PRD-000008-XXL-White',
    'PRD-000008',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    159,
    'Shirts',
    'Formal Shirt',
    'Blue',
    'XXL',
    'PRD-000008-XXL-Blue',
    'PRD-000008',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    160,
    'Shirts',
    'Formal Shirt',
    'Grey',
    'XXL',
    'PRD-000008-XXL-Grey',
    'PRD-000008',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    161,
    'Shirts',
    'Checked Shirt',
    'Black',
    'S',
    'PRD-000009-S-Black',
    'PRD-000009',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    162,
    'Shirts',
    'Checked Shirt',
    'White',
    'S',
    'PRD-000009-S-White',
    'PRD-000009',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    163,
    'Shirts',
    'Checked Shirt',
    'Blue',
    'S',
    'PRD-000009-S-Blue',
    'PRD-000009',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    164,
    'Shirts',
    'Checked Shirt',
    'Grey',
    'S',
    'PRD-000009-S-Grey',
    'PRD-000009',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    165,
    'Shirts',
    'Checked Shirt',
    'Black',
    'M',
    'PRD-000009-M-Black',
    'PRD-000009',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    166,
    'Shirts',
    'Checked Shirt',
    'White',
    'M',
    'PRD-000009-M-White',
    'PRD-000009',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    167,
    'Shirts',
    'Checked Shirt',
    'Blue',
    'M',
    'PRD-000009-M-Blue',
    'PRD-000009',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    168,
    'Shirts',
    'Checked Shirt',
    'Grey',
    'M',
    'PRD-000009-M-Grey',
    'PRD-000009',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    169,
    'Shirts',
    'Checked Shirt',
    'Black',
    'L',
    'PRD-000009-L-Black',
    'PRD-000009',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    170,
    'Shirts',
    'Checked Shirt',
    'White',
    'L',
    'PRD-000009-L-White',
    'PRD-000009',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    171,
    'Shirts',
    'Checked Shirt',
    'Blue',
    'L',
    'PRD-000009-L-Blue',
    'PRD-000009',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    172,
    'Shirts',
    'Checked Shirt',
    'Grey',
    'L',
    'PRD-000009-L-Grey',
    'PRD-000009',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    173,
    'Shirts',
    'Checked Shirt',
    'Black',
    'XL',
    'PRD-000009-XL-Black',
    'PRD-000009',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    174,
    'Shirts',
    'Checked Shirt',
    'White',
    'XL',
    'PRD-000009-XL-White',
    'PRD-000009',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    175,
    'Shirts',
    'Checked Shirt',
    'Blue',
    'XL',
    'PRD-000009-XL-Blue',
    'PRD-000009',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    176,
    'Shirts',
    'Checked Shirt',
    'Grey',
    'XL',
    'PRD-000009-XL-Grey',
    'PRD-000009',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    177,
    'Shirts',
    'Checked Shirt',
    'Black',
    'XXL',
    'PRD-000009-XXL-Black',
    'PRD-000009',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    178,
    'Shirts',
    'Checked Shirt',
    'White',
    'XXL',
    'PRD-000009-XXL-White',
    'PRD-000009',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    179,
    'Shirts',
    'Checked Shirt',
    'Blue',
    'XXL',
    'PRD-000009-XXL-Blue',
    'PRD-000009',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    180,
    'Shirts',
    'Checked Shirt',
    'Grey',
    'XXL',
    'PRD-000009-XXL-Grey',
    'PRD-000009',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    181,
    'Shirts',
    'Printed Shirt',
    'Black',
    'S',
    'PRD-000010-S-Black',
    'PRD-000010',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    182,
    'Shirts',
    'Printed Shirt',
    'White',
    'S',
    'PRD-000010-S-White',
    'PRD-000010',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    183,
    'Shirts',
    'Printed Shirt',
    'Blue',
    'S',
    'PRD-000010-S-Blue',
    'PRD-000010',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    184,
    'Shirts',
    'Printed Shirt',
    'Grey',
    'S',
    'PRD-000010-S-Grey',
    'PRD-000010',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    185,
    'Shirts',
    'Printed Shirt',
    'Black',
    'M',
    'PRD-000010-M-Black',
    'PRD-000010',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    186,
    'Shirts',
    'Printed Shirt',
    'White',
    'M',
    'PRD-000010-M-White',
    'PRD-000010',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    187,
    'Shirts',
    'Printed Shirt',
    'Blue',
    'M',
    'PRD-000010-M-Blue',
    'PRD-000010',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    188,
    'Shirts',
    'Printed Shirt',
    'Grey',
    'M',
    'PRD-000010-M-Grey',
    'PRD-000010',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    189,
    'Shirts',
    'Printed Shirt',
    'Black',
    'L',
    'PRD-000010-L-Black',
    'PRD-000010',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    190,
    'Shirts',
    'Printed Shirt',
    'White',
    'L',
    'PRD-000010-L-White',
    'PRD-000010',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    191,
    'Shirts',
    'Printed Shirt',
    'Blue',
    'L',
    'PRD-000010-L-Blue',
    'PRD-000010',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    192,
    'Shirts',
    'Printed Shirt',
    'Grey',
    'L',
    'PRD-000010-L-Grey',
    'PRD-000010',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    193,
    'Shirts',
    'Printed Shirt',
    'Black',
    'XL',
    'PRD-000010-XL-Black',
    'PRD-000010',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    194,
    'Shirts',
    'Printed Shirt',
    'White',
    'XL',
    'PRD-000010-XL-White',
    'PRD-000010',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    195,
    'Shirts',
    'Printed Shirt',
    'Blue',
    'XL',
    'PRD-000010-XL-Blue',
    'PRD-000010',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    196,
    'Shirts',
    'Printed Shirt',
    'Grey',
    'XL',
    'PRD-000010-XL-Grey',
    'PRD-000010',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    197,
    'Shirts',
    'Printed Shirt',
    'Black',
    'XXL',
    'PRD-000010-XXL-Black',
    'PRD-000010',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    198,
    'Shirts',
    'Printed Shirt',
    'White',
    'XXL',
    'PRD-000010-XXL-White',
    'PRD-000010',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    199,
    'Shirts',
    'Printed Shirt',
    'Blue',
    'XXL',
    'PRD-000010-XXL-Blue',
    'PRD-000010',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    200,
    'Shirts',
    'Printed Shirt',
    'Grey',
    'XXL',
    'PRD-000010-XXL-Grey',
    'PRD-000010',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    201,
    'Shirts',
    'Denim Shirt',
    'Black',
    'S',
    'PRD-000011-S-Black',
    'PRD-000011',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    202,
    'Shirts',
    'Denim Shirt',
    'White',
    'S',
    'PRD-000011-S-White',
    'PRD-000011',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    203,
    'Shirts',
    'Denim Shirt',
    'Blue',
    'S',
    'PRD-000011-S-Blue',
    'PRD-000011',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    204,
    'Shirts',
    'Denim Shirt',
    'Grey',
    'S',
    'PRD-000011-S-Grey',
    'PRD-000011',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    205,
    'Shirts',
    'Denim Shirt',
    'Black',
    'M',
    'PRD-000011-M-Black',
    'PRD-000011',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    206,
    'Shirts',
    'Denim Shirt',
    'White',
    'M',
    'PRD-000011-M-White',
    'PRD-000011',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    207,
    'Shirts',
    'Denim Shirt',
    'Blue',
    'M',
    'PRD-000011-M-Blue',
    'PRD-000011',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    208,
    'Shirts',
    'Denim Shirt',
    'Grey',
    'M',
    'PRD-000011-M-Grey',
    'PRD-000011',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    209,
    'Shirts',
    'Denim Shirt',
    'Black',
    'L',
    'PRD-000011-L-Black',
    'PRD-000011',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    210,
    'Shirts',
    'Denim Shirt',
    'White',
    'L',
    'PRD-000011-L-White',
    'PRD-000011',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    211,
    'Shirts',
    'Denim Shirt',
    'Blue',
    'L',
    'PRD-000011-L-Blue',
    'PRD-000011',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    212,
    'Shirts',
    'Denim Shirt',
    'Grey',
    'L',
    'PRD-000011-L-Grey',
    'PRD-000011',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    213,
    'Shirts',
    'Denim Shirt',
    'Black',
    'XL',
    'PRD-000011-XL-Black',
    'PRD-000011',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    214,
    'Shirts',
    'Denim Shirt',
    'White',
    'XL',
    'PRD-000011-XL-White',
    'PRD-000011',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    215,
    'Shirts',
    'Denim Shirt',
    'Blue',
    'XL',
    'PRD-000011-XL-Blue',
    'PRD-000011',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    216,
    'Shirts',
    'Denim Shirt',
    'Grey',
    'XL',
    'PRD-000011-XL-Grey',
    'PRD-000011',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    217,
    'Shirts',
    'Denim Shirt',
    'Black',
    'XXL',
    'PRD-000011-XXL-Black',
    'PRD-000011',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    218,
    'Shirts',
    'Denim Shirt',
    'White',
    'XXL',
    'PRD-000011-XXL-White',
    'PRD-000011',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    219,
    'Shirts',
    'Denim Shirt',
    'Blue',
    'XXL',
    'PRD-000011-XXL-Blue',
    'PRD-000011',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    220,
    'Shirts',
    'Denim Shirt',
    'Grey',
    'XXL',
    'PRD-000011-XXL-Grey',
    'PRD-000011',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    221,
    'Jeans',
    'Slim Fit Jeans',
    'Black',
    'S',
    'PRD-000012-S-Black',
    'PRD-000012',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    222,
    'Jeans',
    'Slim Fit Jeans',
    'White',
    'S',
    'PRD-000012-S-White',
    'PRD-000012',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    223,
    'Jeans',
    'Slim Fit Jeans',
    'Blue',
    'S',
    'PRD-000012-S-Blue',
    'PRD-000012',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    224,
    'Jeans',
    'Slim Fit Jeans',
    'Grey',
    'S',
    'PRD-000012-S-Grey',
    'PRD-000012',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    225,
    'Jeans',
    'Slim Fit Jeans',
    'Black',
    'M',
    'PRD-000012-M-Black',
    'PRD-000012',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    226,
    'Jeans',
    'Slim Fit Jeans',
    'White',
    'M',
    'PRD-000012-M-White',
    'PRD-000012',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    227,
    'Jeans',
    'Slim Fit Jeans',
    'Blue',
    'M',
    'PRD-000012-M-Blue',
    'PRD-000012',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    228,
    'Jeans',
    'Slim Fit Jeans',
    'Grey',
    'M',
    'PRD-000012-M-Grey',
    'PRD-000012',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    229,
    'Jeans',
    'Slim Fit Jeans',
    'Black',
    'L',
    'PRD-000012-L-Black',
    'PRD-000012',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    230,
    'Jeans',
    'Slim Fit Jeans',
    'White',
    'L',
    'PRD-000012-L-White',
    'PRD-000012',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    231,
    'Jeans',
    'Slim Fit Jeans',
    'Blue',
    'L',
    'PRD-000012-L-Blue',
    'PRD-000012',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    232,
    'Jeans',
    'Slim Fit Jeans',
    'Grey',
    'L',
    'PRD-000012-L-Grey',
    'PRD-000012',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    233,
    'Jeans',
    'Slim Fit Jeans',
    'Black',
    'XL',
    'PRD-000012-XL-Black',
    'PRD-000012',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    234,
    'Jeans',
    'Slim Fit Jeans',
    'White',
    'XL',
    'PRD-000012-XL-White',
    'PRD-000012',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    235,
    'Jeans',
    'Slim Fit Jeans',
    'Blue',
    'XL',
    'PRD-000012-XL-Blue',
    'PRD-000012',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    236,
    'Jeans',
    'Slim Fit Jeans',
    'Grey',
    'XL',
    'PRD-000012-XL-Grey',
    'PRD-000012',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    237,
    'Jeans',
    'Slim Fit Jeans',
    'Black',
    'XXL',
    'PRD-000012-XXL-Black',
    'PRD-000012',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    238,
    'Jeans',
    'Slim Fit Jeans',
    'White',
    'XXL',
    'PRD-000012-XXL-White',
    'PRD-000012',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    239,
    'Jeans',
    'Slim Fit Jeans',
    'Blue',
    'XXL',
    'PRD-000012-XXL-Blue',
    'PRD-000012',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    240,
    'Jeans',
    'Slim Fit Jeans',
    'Grey',
    'XXL',
    'PRD-000012-XXL-Grey',
    'PRD-000012',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    241,
    'Jeans',
    'Regular Fit Jeans',
    'Black',
    'S',
    'PRD-000013-S-Black',
    'PRD-000013',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    242,
    'Jeans',
    'Regular Fit Jeans',
    'White',
    'S',
    'PRD-000013-S-White',
    'PRD-000013',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    243,
    'Jeans',
    'Regular Fit Jeans',
    'Blue',
    'S',
    'PRD-000013-S-Blue',
    'PRD-000013',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    244,
    'Jeans',
    'Regular Fit Jeans',
    'Grey',
    'S',
    'PRD-000013-S-Grey',
    'PRD-000013',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    245,
    'Jeans',
    'Regular Fit Jeans',
    'Black',
    'M',
    'PRD-000013-M-Black',
    'PRD-000013',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    246,
    'Jeans',
    'Regular Fit Jeans',
    'White',
    'M',
    'PRD-000013-M-White',
    'PRD-000013',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    247,
    'Jeans',
    'Regular Fit Jeans',
    'Blue',
    'M',
    'PRD-000013-M-Blue',
    'PRD-000013',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    248,
    'Jeans',
    'Regular Fit Jeans',
    'Grey',
    'M',
    'PRD-000013-M-Grey',
    'PRD-000013',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    249,
    'Jeans',
    'Regular Fit Jeans',
    'Black',
    'L',
    'PRD-000013-L-Black',
    'PRD-000013',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    250,
    'Jeans',
    'Regular Fit Jeans',
    'White',
    'L',
    'PRD-000013-L-White',
    'PRD-000013',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    251,
    'Jeans',
    'Regular Fit Jeans',
    'Blue',
    'L',
    'PRD-000013-L-Blue',
    'PRD-000013',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    252,
    'Jeans',
    'Regular Fit Jeans',
    'Grey',
    'L',
    'PRD-000013-L-Grey',
    'PRD-000013',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    253,
    'Jeans',
    'Regular Fit Jeans',
    'Black',
    'XL',
    'PRD-000013-XL-Black',
    'PRD-000013',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    254,
    'Jeans',
    'Regular Fit Jeans',
    'White',
    'XL',
    'PRD-000013-XL-White',
    'PRD-000013',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    255,
    'Jeans',
    'Regular Fit Jeans',
    'Blue',
    'XL',
    'PRD-000013-XL-Blue',
    'PRD-000013',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    256,
    'Jeans',
    'Regular Fit Jeans',
    'Grey',
    'XL',
    'PRD-000013-XL-Grey',
    'PRD-000013',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    257,
    'Jeans',
    'Regular Fit Jeans',
    'Black',
    'XXL',
    'PRD-000013-XXL-Black',
    'PRD-000013',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    258,
    'Jeans',
    'Regular Fit Jeans',
    'White',
    'XXL',
    'PRD-000013-XXL-White',
    'PRD-000013',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    259,
    'Jeans',
    'Regular Fit Jeans',
    'Blue',
    'XXL',
    'PRD-000013-XXL-Blue',
    'PRD-000013',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    260,
    'Jeans',
    'Regular Fit Jeans',
    'Grey',
    'XXL',
    'PRD-000013-XXL-Grey',
    'PRD-000013',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    261,
    'Jeans',
    'Skinny Fit Jeans',
    'Black',
    'S',
    'PRD-000014-S-Black',
    'PRD-000014',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    262,
    'Jeans',
    'Skinny Fit Jeans',
    'White',
    'S',
    'PRD-000014-S-White',
    'PRD-000014',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    263,
    'Jeans',
    'Skinny Fit Jeans',
    'Blue',
    'S',
    'PRD-000014-S-Blue',
    'PRD-000014',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    264,
    'Jeans',
    'Skinny Fit Jeans',
    'Grey',
    'S',
    'PRD-000014-S-Grey',
    'PRD-000014',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    265,
    'Jeans',
    'Skinny Fit Jeans',
    'Black',
    'M',
    'PRD-000014-M-Black',
    'PRD-000014',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    266,
    'Jeans',
    'Skinny Fit Jeans',
    'White',
    'M',
    'PRD-000014-M-White',
    'PRD-000014',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    267,
    'Jeans',
    'Skinny Fit Jeans',
    'Blue',
    'M',
    'PRD-000014-M-Blue',
    'PRD-000014',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    268,
    'Jeans',
    'Skinny Fit Jeans',
    'Grey',
    'M',
    'PRD-000014-M-Grey',
    'PRD-000014',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    269,
    'Jeans',
    'Skinny Fit Jeans',
    'Black',
    'L',
    'PRD-000014-L-Black',
    'PRD-000014',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    270,
    'Jeans',
    'Skinny Fit Jeans',
    'White',
    'L',
    'PRD-000014-L-White',
    'PRD-000014',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    271,
    'Jeans',
    'Skinny Fit Jeans',
    'Blue',
    'L',
    'PRD-000014-L-Blue',
    'PRD-000014',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    272,
    'Jeans',
    'Skinny Fit Jeans',
    'Grey',
    'L',
    'PRD-000014-L-Grey',
    'PRD-000014',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    273,
    'Jeans',
    'Skinny Fit Jeans',
    'Black',
    'XL',
    'PRD-000014-XL-Black',
    'PRD-000014',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    274,
    'Jeans',
    'Skinny Fit Jeans',
    'White',
    'XL',
    'PRD-000014-XL-White',
    'PRD-000014',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    275,
    'Jeans',
    'Skinny Fit Jeans',
    'Blue',
    'XL',
    'PRD-000014-XL-Blue',
    'PRD-000014',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    276,
    'Jeans',
    'Skinny Fit Jeans',
    'Grey',
    'XL',
    'PRD-000014-XL-Grey',
    'PRD-000014',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    277,
    'Jeans',
    'Skinny Fit Jeans',
    'Black',
    'XXL',
    'PRD-000014-XXL-Black',
    'PRD-000014',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    278,
    'Jeans',
    'Skinny Fit Jeans',
    'White',
    'XXL',
    'PRD-000014-XXL-White',
    'PRD-000014',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    279,
    'Jeans',
    'Skinny Fit Jeans',
    'Blue',
    'XXL',
    'PRD-000014-XXL-Blue',
    'PRD-000014',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    280,
    'Jeans',
    'Skinny Fit Jeans',
    'Grey',
    'XXL',
    'PRD-000014-XXL-Grey',
    'PRD-000014',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    281,
    'Jeans',
    'Stretchable Jeans',
    'Black',
    'S',
    'PRD-000015-S-Black',
    'PRD-000015',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    282,
    'Jeans',
    'Stretchable Jeans',
    'White',
    'S',
    'PRD-000015-S-White',
    'PRD-000015',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    283,
    'Jeans',
    'Stretchable Jeans',
    'Blue',
    'S',
    'PRD-000015-S-Blue',
    'PRD-000015',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    284,
    'Jeans',
    'Stretchable Jeans',
    'Grey',
    'S',
    'PRD-000015-S-Grey',
    'PRD-000015',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    285,
    'Jeans',
    'Stretchable Jeans',
    'Black',
    'M',
    'PRD-000015-M-Black',
    'PRD-000015',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    286,
    'Jeans',
    'Stretchable Jeans',
    'White',
    'M',
    'PRD-000015-M-White',
    'PRD-000015',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    287,
    'Jeans',
    'Stretchable Jeans',
    'Blue',
    'M',
    'PRD-000015-M-Blue',
    'PRD-000015',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    288,
    'Jeans',
    'Stretchable Jeans',
    'Grey',
    'M',
    'PRD-000015-M-Grey',
    'PRD-000015',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    289,
    'Jeans',
    'Stretchable Jeans',
    'Black',
    'L',
    'PRD-000015-L-Black',
    'PRD-000015',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    290,
    'Jeans',
    'Stretchable Jeans',
    'White',
    'L',
    'PRD-000015-L-White',
    'PRD-000015',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    291,
    'Jeans',
    'Stretchable Jeans',
    'Blue',
    'L',
    'PRD-000015-L-Blue',
    'PRD-000015',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    292,
    'Jeans',
    'Stretchable Jeans',
    'Grey',
    'L',
    'PRD-000015-L-Grey',
    'PRD-000015',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    293,
    'Jeans',
    'Stretchable Jeans',
    'Black',
    'XL',
    'PRD-000015-XL-Black',
    'PRD-000015',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    294,
    'Jeans',
    'Stretchable Jeans',
    'White',
    'XL',
    'PRD-000015-XL-White',
    'PRD-000015',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    295,
    'Jeans',
    'Stretchable Jeans',
    'Blue',
    'XL',
    'PRD-000015-XL-Blue',
    'PRD-000015',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    296,
    'Jeans',
    'Stretchable Jeans',
    'Grey',
    'XL',
    'PRD-000015-XL-Grey',
    'PRD-000015',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    297,
    'Jeans',
    'Stretchable Jeans',
    'Black',
    'XXL',
    'PRD-000015-XXL-Black',
    'PRD-000015',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    298,
    'Jeans',
    'Stretchable Jeans',
    'White',
    'XXL',
    'PRD-000015-XXL-White',
    'PRD-000015',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    299,
    'Jeans',
    'Stretchable Jeans',
    'Blue',
    'XXL',
    'PRD-000015-XXL-Blue',
    'PRD-000015',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    300,
    'Jeans',
    'Stretchable Jeans',
    'Grey',
    'XXL',
    'PRD-000015-XXL-Grey',
    'PRD-000015',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    301,
    'T-Shirts & Tops',
    'Round Neck T-Shirt',
    'Black',
    'S',
    'PRD-000016-S-Black',
    'PRD-000016',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    302,
    'T-Shirts & Tops',
    'Round Neck T-Shirt',
    'White',
    'S',
    'PRD-000016-S-White',
    'PRD-000016',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    303,
    'T-Shirts & Tops',
    'Round Neck T-Shirt',
    'Blue',
    'S',
    'PRD-000016-S-Blue',
    'PRD-000016',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    304,
    'T-Shirts & Tops',
    'Round Neck T-Shirt',
    'Grey',
    'S',
    'PRD-000016-S-Grey',
    'PRD-000016',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    305,
    'T-Shirts & Tops',
    'Round Neck T-Shirt',
    'Black',
    'M',
    'PRD-000016-M-Black',
    'PRD-000016',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    306,
    'T-Shirts & Tops',
    'Round Neck T-Shirt',
    'White',
    'M',
    'PRD-000016-M-White',
    'PRD-000016',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    307,
    'T-Shirts & Tops',
    'Round Neck T-Shirt',
    'Blue',
    'M',
    'PRD-000016-M-Blue',
    'PRD-000016',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    308,
    'T-Shirts & Tops',
    'Round Neck T-Shirt',
    'Grey',
    'M',
    'PRD-000016-M-Grey',
    'PRD-000016',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    309,
    'T-Shirts & Tops',
    'Round Neck T-Shirt',
    'Black',
    'L',
    'PRD-000016-L-Black',
    'PRD-000016',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    310,
    'T-Shirts & Tops',
    'Round Neck T-Shirt',
    'White',
    'L',
    'PRD-000016-L-White',
    'PRD-000016',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    311,
    'T-Shirts & Tops',
    'Round Neck T-Shirt',
    'Blue',
    'L',
    'PRD-000016-L-Blue',
    'PRD-000016',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    312,
    'T-Shirts & Tops',
    'Round Neck T-Shirt',
    'Grey',
    'L',
    'PRD-000016-L-Grey',
    'PRD-000016',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    313,
    'T-Shirts & Tops',
    'Round Neck T-Shirt',
    'Black',
    'XL',
    'PRD-000016-XL-Black',
    'PRD-000016',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    314,
    'T-Shirts & Tops',
    'Round Neck T-Shirt',
    'White',
    'XL',
    'PRD-000016-XL-White',
    'PRD-000016',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    315,
    'T-Shirts & Tops',
    'Round Neck T-Shirt',
    'Blue',
    'XL',
    'PRD-000016-XL-Blue',
    'PRD-000016',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    316,
    'T-Shirts & Tops',
    'Round Neck T-Shirt',
    'Grey',
    'XL',
    'PRD-000016-XL-Grey',
    'PRD-000016',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    317,
    'T-Shirts & Tops',
    'Round Neck T-Shirt',
    'Black',
    'XXL',
    'PRD-000016-XXL-Black',
    'PRD-000016',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    318,
    'T-Shirts & Tops',
    'Round Neck T-Shirt',
    'White',
    'XXL',
    'PRD-000016-XXL-White',
    'PRD-000016',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    319,
    'T-Shirts & Tops',
    'Round Neck T-Shirt',
    'Blue',
    'XXL',
    'PRD-000016-XXL-Blue',
    'PRD-000016',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    320,
    'T-Shirts & Tops',
    'Round Neck T-Shirt',
    'Grey',
    'XXL',
    'PRD-000016-XXL-Grey',
    'PRD-000016',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    321,
    'T-Shirts & Tops',
    'V-Neck T-Shirt',
    'Black',
    'S',
    'PRD-000017-S-Black',
    'PRD-000017',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    322,
    'T-Shirts & Tops',
    'V-Neck T-Shirt',
    'White',
    'S',
    'PRD-000017-S-White',
    'PRD-000017',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    323,
    'T-Shirts & Tops',
    'V-Neck T-Shirt',
    'Blue',
    'S',
    'PRD-000017-S-Blue',
    'PRD-000017',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    324,
    'T-Shirts & Tops',
    'V-Neck T-Shirt',
    'Grey',
    'S',
    'PRD-000017-S-Grey',
    'PRD-000017',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    325,
    'T-Shirts & Tops',
    'V-Neck T-Shirt',
    'Black',
    'M',
    'PRD-000017-M-Black',
    'PRD-000017',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    326,
    'T-Shirts & Tops',
    'V-Neck T-Shirt',
    'White',
    'M',
    'PRD-000017-M-White',
    'PRD-000017',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    327,
    'T-Shirts & Tops',
    'V-Neck T-Shirt',
    'Blue',
    'M',
    'PRD-000017-M-Blue',
    'PRD-000017',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    328,
    'T-Shirts & Tops',
    'V-Neck T-Shirt',
    'Grey',
    'M',
    'PRD-000017-M-Grey',
    'PRD-000017',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    329,
    'T-Shirts & Tops',
    'V-Neck T-Shirt',
    'Black',
    'L',
    'PRD-000017-L-Black',
    'PRD-000017',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    330,
    'T-Shirts & Tops',
    'V-Neck T-Shirt',
    'White',
    'L',
    'PRD-000017-L-White',
    'PRD-000017',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    331,
    'T-Shirts & Tops',
    'V-Neck T-Shirt',
    'Blue',
    'L',
    'PRD-000017-L-Blue',
    'PRD-000017',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    332,
    'T-Shirts & Tops',
    'V-Neck T-Shirt',
    'Grey',
    'L',
    'PRD-000017-L-Grey',
    'PRD-000017',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    333,
    'T-Shirts & Tops',
    'V-Neck T-Shirt',
    'Black',
    'XL',
    'PRD-000017-XL-Black',
    'PRD-000017',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    334,
    'T-Shirts & Tops',
    'V-Neck T-Shirt',
    'White',
    'XL',
    'PRD-000017-XL-White',
    'PRD-000017',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    335,
    'T-Shirts & Tops',
    'V-Neck T-Shirt',
    'Blue',
    'XL',
    'PRD-000017-XL-Blue',
    'PRD-000017',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    336,
    'T-Shirts & Tops',
    'V-Neck T-Shirt',
    'Grey',
    'XL',
    'PRD-000017-XL-Grey',
    'PRD-000017',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    337,
    'T-Shirts & Tops',
    'V-Neck T-Shirt',
    'Black',
    'XXL',
    'PRD-000017-XXL-Black',
    'PRD-000017',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    338,
    'T-Shirts & Tops',
    'V-Neck T-Shirt',
    'White',
    'XXL',
    'PRD-000017-XXL-White',
    'PRD-000017',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    339,
    'T-Shirts & Tops',
    'V-Neck T-Shirt',
    'Blue',
    'XXL',
    'PRD-000017-XXL-Blue',
    'PRD-000017',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    340,
    'T-Shirts & Tops',
    'V-Neck T-Shirt',
    'Grey',
    'XXL',
    'PRD-000017-XXL-Grey',
    'PRD-000017',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    341,
    'T-Shirts & Tops',
    'Printed T-Shirt',
    'Black',
    'S',
    'PRD-000018-S-Black',
    'PRD-000018',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    342,
    'T-Shirts & Tops',
    'Printed T-Shirt',
    'White',
    'S',
    'PRD-000018-S-White',
    'PRD-000018',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    343,
    'T-Shirts & Tops',
    'Printed T-Shirt',
    'Blue',
    'S',
    'PRD-000018-S-Blue',
    'PRD-000018',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    344,
    'T-Shirts & Tops',
    'Printed T-Shirt',
    'Grey',
    'S',
    'PRD-000018-S-Grey',
    'PRD-000018',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    345,
    'T-Shirts & Tops',
    'Printed T-Shirt',
    'Black',
    'M',
    'PRD-000018-M-Black',
    'PRD-000018',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    346,
    'T-Shirts & Tops',
    'Printed T-Shirt',
    'White',
    'M',
    'PRD-000018-M-White',
    'PRD-000018',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    347,
    'T-Shirts & Tops',
    'Printed T-Shirt',
    'Blue',
    'M',
    'PRD-000018-M-Blue',
    'PRD-000018',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    348,
    'T-Shirts & Tops',
    'Printed T-Shirt',
    'Grey',
    'M',
    'PRD-000018-M-Grey',
    'PRD-000018',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    349,
    'T-Shirts & Tops',
    'Printed T-Shirt',
    'Black',
    'L',
    'PRD-000018-L-Black',
    'PRD-000018',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    350,
    'T-Shirts & Tops',
    'Printed T-Shirt',
    'White',
    'L',
    'PRD-000018-L-White',
    'PRD-000018',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    351,
    'T-Shirts & Tops',
    'Printed T-Shirt',
    'Blue',
    'L',
    'PRD-000018-L-Blue',
    'PRD-000018',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    352,
    'T-Shirts & Tops',
    'Printed T-Shirt',
    'Grey',
    'L',
    'PRD-000018-L-Grey',
    'PRD-000018',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    353,
    'T-Shirts & Tops',
    'Printed T-Shirt',
    'Black',
    'XL',
    'PRD-000018-XL-Black',
    'PRD-000018',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    354,
    'T-Shirts & Tops',
    'Printed T-Shirt',
    'White',
    'XL',
    'PRD-000018-XL-White',
    'PRD-000018',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    355,
    'T-Shirts & Tops',
    'Printed T-Shirt',
    'Blue',
    'XL',
    'PRD-000018-XL-Blue',
    'PRD-000018',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    356,
    'T-Shirts & Tops',
    'Printed T-Shirt',
    'Grey',
    'XL',
    'PRD-000018-XL-Grey',
    'PRD-000018',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    357,
    'T-Shirts & Tops',
    'Printed T-Shirt',
    'Black',
    'XXL',
    'PRD-000018-XXL-Black',
    'PRD-000018',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    358,
    'T-Shirts & Tops',
    'Printed T-Shirt',
    'White',
    'XXL',
    'PRD-000018-XXL-White',
    'PRD-000018',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    359,
    'T-Shirts & Tops',
    'Printed T-Shirt',
    'Blue',
    'XXL',
    'PRD-000018-XXL-Blue',
    'PRD-000018',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    360,
    'T-Shirts & Tops',
    'Printed T-Shirt',
    'Grey',
    'XXL',
    'PRD-000018-XXL-Grey',
    'PRD-000018',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    361,
    'T-Shirts & Tops',
    'Crop Top',
    'Black',
    'S',
    'PRD-000019-S-Black',
    'PRD-000019',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    362,
    'T-Shirts & Tops',
    'Crop Top',
    'White',
    'S',
    'PRD-000019-S-White',
    'PRD-000019',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    363,
    'T-Shirts & Tops',
    'Crop Top',
    'Blue',
    'S',
    'PRD-000019-S-Blue',
    'PRD-000019',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    364,
    'T-Shirts & Tops',
    'Crop Top',
    'Grey',
    'S',
    'PRD-000019-S-Grey',
    'PRD-000019',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    365,
    'T-Shirts & Tops',
    'Crop Top',
    'Black',
    'M',
    'PRD-000019-M-Black',
    'PRD-000019',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    366,
    'T-Shirts & Tops',
    'Crop Top',
    'White',
    'M',
    'PRD-000019-M-White',
    'PRD-000019',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    367,
    'T-Shirts & Tops',
    'Crop Top',
    'Blue',
    'M',
    'PRD-000019-M-Blue',
    'PRD-000019',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    368,
    'T-Shirts & Tops',
    'Crop Top',
    'Grey',
    'M',
    'PRD-000019-M-Grey',
    'PRD-000019',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    369,
    'T-Shirts & Tops',
    'Crop Top',
    'Black',
    'L',
    'PRD-000019-L-Black',
    'PRD-000019',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    370,
    'T-Shirts & Tops',
    'Crop Top',
    'White',
    'L',
    'PRD-000019-L-White',
    'PRD-000019',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    371,
    'T-Shirts & Tops',
    'Crop Top',
    'Blue',
    'L',
    'PRD-000019-L-Blue',
    'PRD-000019',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    372,
    'T-Shirts & Tops',
    'Crop Top',
    'Grey',
    'L',
    'PRD-000019-L-Grey',
    'PRD-000019',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    373,
    'T-Shirts & Tops',
    'Crop Top',
    'Black',
    'XL',
    'PRD-000019-XL-Black',
    'PRD-000019',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    374,
    'T-Shirts & Tops',
    'Crop Top',
    'White',
    'XL',
    'PRD-000019-XL-White',
    'PRD-000019',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    375,
    'T-Shirts & Tops',
    'Crop Top',
    'Blue',
    'XL',
    'PRD-000019-XL-Blue',
    'PRD-000019',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    376,
    'T-Shirts & Tops',
    'Crop Top',
    'Grey',
    'XL',
    'PRD-000019-XL-Grey',
    'PRD-000019',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    377,
    'T-Shirts & Tops',
    'Crop Top',
    'Black',
    'XXL',
    'PRD-000019-XXL-Black',
    'PRD-000019',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    378,
    'T-Shirts & Tops',
    'Crop Top',
    'White',
    'XXL',
    'PRD-000019-XXL-White',
    'PRD-000019',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    379,
    'T-Shirts & Tops',
    'Crop Top',
    'Blue',
    'XXL',
    'PRD-000019-XXL-Blue',
    'PRD-000019',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    380,
    'T-Shirts & Tops',
    'Crop Top',
    'Grey',
    'XXL',
    'PRD-000019-XXL-Grey',
    'PRD-000019',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    381,
    'T-Shirts & Tops',
    'Long Top',
    'Black',
    'S',
    'PRD-000020-S-Black',
    'PRD-000020',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    382,
    'T-Shirts & Tops',
    'Long Top',
    'White',
    'S',
    'PRD-000020-S-White',
    'PRD-000020',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    383,
    'T-Shirts & Tops',
    'Long Top',
    'Blue',
    'S',
    'PRD-000020-S-Blue',
    'PRD-000020',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    384,
    'T-Shirts & Tops',
    'Long Top',
    'Grey',
    'S',
    'PRD-000020-S-Grey',
    'PRD-000020',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    385,
    'T-Shirts & Tops',
    'Long Top',
    'Black',
    'M',
    'PRD-000020-M-Black',
    'PRD-000020',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    386,
    'T-Shirts & Tops',
    'Long Top',
    'White',
    'M',
    'PRD-000020-M-White',
    'PRD-000020',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    387,
    'T-Shirts & Tops',
    'Long Top',
    'Blue',
    'M',
    'PRD-000020-M-Blue',
    'PRD-000020',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    388,
    'T-Shirts & Tops',
    'Long Top',
    'Grey',
    'M',
    'PRD-000020-M-Grey',
    'PRD-000020',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    389,
    'T-Shirts & Tops',
    'Long Top',
    'Black',
    'L',
    'PRD-000020-L-Black',
    'PRD-000020',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    390,
    'T-Shirts & Tops',
    'Long Top',
    'White',
    'L',
    'PRD-000020-L-White',
    'PRD-000020',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  );
INSERT INTO `masterdata` (
    `id`,
    `category`,
    `item`,
    `color`,
    `size`,
    `barcode`,
    `product_code`,
    `sizes`,
    `created_at`
  )
VALUES (
    391,
    'T-Shirts & Tops',
    'Long Top',
    'Blue',
    'L',
    'PRD-000020-L-Blue',
    'PRD-000020',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    392,
    'T-Shirts & Tops',
    'Long Top',
    'Grey',
    'L',
    'PRD-000020-L-Grey',
    'PRD-000020',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    393,
    'T-Shirts & Tops',
    'Long Top',
    'Black',
    'XL',
    'PRD-000020-XL-Black',
    'PRD-000020',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    394,
    'T-Shirts & Tops',
    'Long Top',
    'White',
    'XL',
    'PRD-000020-XL-White',
    'PRD-000020',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    395,
    'T-Shirts & Tops',
    'Long Top',
    'Blue',
    'XL',
    'PRD-000020-XL-Blue',
    'PRD-000020',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    396,
    'T-Shirts & Tops',
    'Long Top',
    'Grey',
    'XL',
    'PRD-000020-XL-Grey',
    'PRD-000020',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    397,
    'T-Shirts & Tops',
    'Long Top',
    'Black',
    'XXL',
    'PRD-000020-XXL-Black',
    'PRD-000020',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    398,
    'T-Shirts & Tops',
    'Long Top',
    'White',
    'XXL',
    'PRD-000020-XXL-White',
    'PRD-000020',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    399,
    'T-Shirts & Tops',
    'Long Top',
    'Blue',
    'XXL',
    'PRD-000020-XXL-Blue',
    'PRD-000020',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    400,
    'T-Shirts & Tops',
    'Long Top',
    'Grey',
    'XXL',
    'PRD-000020-XXL-Grey',
    'PRD-000020',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    401,
    'Shirts',
    'Casual Shirt',
    'Black',
    'S',
    'PRD-000021-S-Black',
    'PRD-000021',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    402,
    'Shirts',
    'Casual Shirt',
    'White',
    'S',
    'PRD-000021-S-White',
    'PRD-000021',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    403,
    'Shirts',
    'Casual Shirt',
    'Blue',
    'S',
    'PRD-000021-S-Blue',
    'PRD-000021',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    404,
    'Shirts',
    'Casual Shirt',
    'Grey',
    'S',
    'PRD-000021-S-Grey',
    'PRD-000021',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    405,
    'Shirts',
    'Casual Shirt',
    'Black',
    'M',
    'PRD-000021-M-Black',
    'PRD-000021',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    406,
    'Shirts',
    'Casual Shirt',
    'White',
    'M',
    'PRD-000021-M-White',
    'PRD-000021',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    407,
    'Shirts',
    'Casual Shirt',
    'Blue',
    'M',
    'PRD-000021-M-Blue',
    'PRD-000021',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    408,
    'Shirts',
    'Casual Shirt',
    'Grey',
    'M',
    'PRD-000021-M-Grey',
    'PRD-000021',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    409,
    'Shirts',
    'Casual Shirt',
    'Black',
    'L',
    'PRD-000021-L-Black',
    'PRD-000021',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    410,
    'Shirts',
    'Casual Shirt',
    'White',
    'L',
    'PRD-000021-L-White',
    'PRD-000021',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    411,
    'Shirts',
    'Casual Shirt',
    'Blue',
    'L',
    'PRD-000021-L-Blue',
    'PRD-000021',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    412,
    'Shirts',
    'Casual Shirt',
    'Grey',
    'L',
    'PRD-000021-L-Grey',
    'PRD-000021',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    413,
    'Shirts',
    'Casual Shirt',
    'Black',
    'XL',
    'PRD-000021-XL-Black',
    'PRD-000021',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    414,
    'Shirts',
    'Casual Shirt',
    'White',
    'XL',
    'PRD-000021-XL-White',
    'PRD-000021',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    415,
    'Shirts',
    'Casual Shirt',
    'Blue',
    'XL',
    'PRD-000021-XL-Blue',
    'PRD-000021',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    416,
    'Shirts',
    'Casual Shirt',
    'Grey',
    'XL',
    'PRD-000021-XL-Grey',
    'PRD-000021',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    417,
    'Shirts',
    'Casual Shirt',
    'Black',
    'XXL',
    'PRD-000021-XXL-Black',
    'PRD-000021',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    418,
    'Shirts',
    'Casual Shirt',
    'White',
    'XXL',
    'PRD-000021-XXL-White',
    'PRD-000021',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    419,
    'Shirts',
    'Casual Shirt',
    'Blue',
    'XXL',
    'PRD-000021-XXL-Blue',
    'PRD-000021',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    420,
    'Shirts',
    'Casual Shirt',
    'Grey',
    'XXL',
    'PRD-000021-XXL-Grey',
    'PRD-000021',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    421,
    'Shirts',
    'Checked Shirt',
    'Black',
    'S',
    'PRD-000022-S-Black',
    'PRD-000022',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    422,
    'Shirts',
    'Checked Shirt',
    'White',
    'S',
    'PRD-000022-S-White',
    'PRD-000022',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    423,
    'Shirts',
    'Checked Shirt',
    'Blue',
    'S',
    'PRD-000022-S-Blue',
    'PRD-000022',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    424,
    'Shirts',
    'Checked Shirt',
    'Grey',
    'S',
    'PRD-000022-S-Grey',
    'PRD-000022',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    425,
    'Shirts',
    'Checked Shirt',
    'Black',
    'M',
    'PRD-000022-M-Black',
    'PRD-000022',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    426,
    'Shirts',
    'Checked Shirt',
    'White',
    'M',
    'PRD-000022-M-White',
    'PRD-000022',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    427,
    'Shirts',
    'Checked Shirt',
    'Blue',
    'M',
    'PRD-000022-M-Blue',
    'PRD-000022',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    428,
    'Shirts',
    'Checked Shirt',
    'Grey',
    'M',
    'PRD-000022-M-Grey',
    'PRD-000022',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    429,
    'Shirts',
    'Checked Shirt',
    'Black',
    'L',
    'PRD-000022-L-Black',
    'PRD-000022',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    430,
    'Shirts',
    'Checked Shirt',
    'White',
    'L',
    'PRD-000022-L-White',
    'PRD-000022',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    431,
    'Shirts',
    'Checked Shirt',
    'Blue',
    'L',
    'PRD-000022-L-Blue',
    'PRD-000022',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    432,
    'Shirts',
    'Checked Shirt',
    'Grey',
    'L',
    'PRD-000022-L-Grey',
    'PRD-000022',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    433,
    'Shirts',
    'Checked Shirt',
    'Black',
    'XL',
    'PRD-000022-XL-Black',
    'PRD-000022',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    434,
    'Shirts',
    'Checked Shirt',
    'White',
    'XL',
    'PRD-000022-XL-White',
    'PRD-000022',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    435,
    'Shirts',
    'Checked Shirt',
    'Blue',
    'XL',
    'PRD-000022-XL-Blue',
    'PRD-000022',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    436,
    'Shirts',
    'Checked Shirt',
    'Grey',
    'XL',
    'PRD-000022-XL-Grey',
    'PRD-000022',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    437,
    'Shirts',
    'Checked Shirt',
    'Black',
    'XXL',
    'PRD-000022-XXL-Black',
    'PRD-000022',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    438,
    'Shirts',
    'Checked Shirt',
    'White',
    'XXL',
    'PRD-000022-XXL-White',
    'PRD-000022',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    439,
    'Shirts',
    'Checked Shirt',
    'Blue',
    'XXL',
    'PRD-000022-XXL-Blue',
    'PRD-000022',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    440,
    'Shirts',
    'Checked Shirt',
    'Grey',
    'XXL',
    'PRD-000022-XXL-Grey',
    'PRD-000022',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    441,
    'Shirts',
    'Printed Shirt',
    'Black',
    'S',
    'PRD-000023-S-Black',
    'PRD-000023',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    442,
    'Shirts',
    'Printed Shirt',
    'White',
    'S',
    'PRD-000023-S-White',
    'PRD-000023',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    443,
    'Shirts',
    'Printed Shirt',
    'Blue',
    'S',
    'PRD-000023-S-Blue',
    'PRD-000023',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    444,
    'Shirts',
    'Printed Shirt',
    'Grey',
    'S',
    'PRD-000023-S-Grey',
    'PRD-000023',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    445,
    'Shirts',
    'Printed Shirt',
    'Black',
    'M',
    'PRD-000023-M-Black',
    'PRD-000023',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    446,
    'Shirts',
    'Printed Shirt',
    'White',
    'M',
    'PRD-000023-M-White',
    'PRD-000023',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    447,
    'Shirts',
    'Printed Shirt',
    'Blue',
    'M',
    'PRD-000023-M-Blue',
    'PRD-000023',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    448,
    'Shirts',
    'Printed Shirt',
    'Grey',
    'M',
    'PRD-000023-M-Grey',
    'PRD-000023',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    449,
    'Shirts',
    'Printed Shirt',
    'Black',
    'L',
    'PRD-000023-L-Black',
    'PRD-000023',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    450,
    'Shirts',
    'Printed Shirt',
    'White',
    'L',
    'PRD-000023-L-White',
    'PRD-000023',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    451,
    'Shirts',
    'Printed Shirt',
    'Blue',
    'L',
    'PRD-000023-L-Blue',
    'PRD-000023',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    452,
    'Shirts',
    'Printed Shirt',
    'Grey',
    'L',
    'PRD-000023-L-Grey',
    'PRD-000023',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    453,
    'Shirts',
    'Printed Shirt',
    'Black',
    'XL',
    'PRD-000023-XL-Black',
    'PRD-000023',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    454,
    'Shirts',
    'Printed Shirt',
    'White',
    'XL',
    'PRD-000023-XL-White',
    'PRD-000023',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    455,
    'Shirts',
    'Printed Shirt',
    'Blue',
    'XL',
    'PRD-000023-XL-Blue',
    'PRD-000023',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    456,
    'Shirts',
    'Printed Shirt',
    'Grey',
    'XL',
    'PRD-000023-XL-Grey',
    'PRD-000023',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    457,
    'Shirts',
    'Printed Shirt',
    'Black',
    'XXL',
    'PRD-000023-XXL-Black',
    'PRD-000023',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    458,
    'Shirts',
    'Printed Shirt',
    'White',
    'XXL',
    'PRD-000023-XXL-White',
    'PRD-000023',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    459,
    'Shirts',
    'Printed Shirt',
    'Blue',
    'XXL',
    'PRD-000023-XXL-Blue',
    'PRD-000023',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    460,
    'Shirts',
    'Printed Shirt',
    'Grey',
    'XXL',
    'PRD-000023-XXL-Grey',
    'PRD-000023',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    461,
    'Shirts',
    'Denim Shirt',
    'Black',
    'S',
    'PRD-000024-S-Black',
    'PRD-000024',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    462,
    'Shirts',
    'Denim Shirt',
    'White',
    'S',
    'PRD-000024-S-White',
    'PRD-000024',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    463,
    'Shirts',
    'Denim Shirt',
    'Blue',
    'S',
    'PRD-000024-S-Blue',
    'PRD-000024',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    464,
    'Shirts',
    'Denim Shirt',
    'Grey',
    'S',
    'PRD-000024-S-Grey',
    'PRD-000024',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    465,
    'Shirts',
    'Denim Shirt',
    'Black',
    'M',
    'PRD-000024-M-Black',
    'PRD-000024',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    466,
    'Shirts',
    'Denim Shirt',
    'White',
    'M',
    'PRD-000024-M-White',
    'PRD-000024',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    467,
    'Shirts',
    'Denim Shirt',
    'Blue',
    'M',
    'PRD-000024-M-Blue',
    'PRD-000024',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    468,
    'Shirts',
    'Denim Shirt',
    'Grey',
    'M',
    'PRD-000024-M-Grey',
    'PRD-000024',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    469,
    'Shirts',
    'Denim Shirt',
    'Black',
    'L',
    'PRD-000024-L-Black',
    'PRD-000024',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    470,
    'Shirts',
    'Denim Shirt',
    'White',
    'L',
    'PRD-000024-L-White',
    'PRD-000024',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    471,
    'Shirts',
    'Denim Shirt',
    'Blue',
    'L',
    'PRD-000024-L-Blue',
    'PRD-000024',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    472,
    'Shirts',
    'Denim Shirt',
    'Grey',
    'L',
    'PRD-000024-L-Grey',
    'PRD-000024',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    473,
    'Shirts',
    'Denim Shirt',
    'Black',
    'XL',
    'PRD-000024-XL-Black',
    'PRD-000024',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    474,
    'Shirts',
    'Denim Shirt',
    'White',
    'XL',
    'PRD-000024-XL-White',
    'PRD-000024',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    475,
    'Shirts',
    'Denim Shirt',
    'Blue',
    'XL',
    'PRD-000024-XL-Blue',
    'PRD-000024',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    476,
    'Shirts',
    'Denim Shirt',
    'Grey',
    'XL',
    'PRD-000024-XL-Grey',
    'PRD-000024',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    477,
    'Shirts',
    'Denim Shirt',
    'Black',
    'XXL',
    'PRD-000024-XXL-Black',
    'PRD-000024',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    478,
    'Shirts',
    'Denim Shirt',
    'White',
    'XXL',
    'PRD-000024-XXL-White',
    'PRD-000024',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    479,
    'Shirts',
    'Denim Shirt',
    'Blue',
    'XXL',
    'PRD-000024-XXL-Blue',
    'PRD-000024',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    480,
    'Shirts',
    'Denim Shirt',
    'Grey',
    'XXL',
    'PRD-000024-XXL-Grey',
    'PRD-000024',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    481,
    'Jeans',
    'Skinny Jeans',
    'Black',
    'S',
    'PRD-000025-S-Black',
    'PRD-000025',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    482,
    'Jeans',
    'Skinny Jeans',
    'White',
    'S',
    'PRD-000025-S-White',
    'PRD-000025',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    483,
    'Jeans',
    'Skinny Jeans',
    'Blue',
    'S',
    'PRD-000025-S-Blue',
    'PRD-000025',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    484,
    'Jeans',
    'Skinny Jeans',
    'Grey',
    'S',
    'PRD-000025-S-Grey',
    'PRD-000025',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    485,
    'Jeans',
    'Skinny Jeans',
    'Black',
    'M',
    'PRD-000025-M-Black',
    'PRD-000025',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    486,
    'Jeans',
    'Skinny Jeans',
    'White',
    'M',
    'PRD-000025-M-White',
    'PRD-000025',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    487,
    'Jeans',
    'Skinny Jeans',
    'Blue',
    'M',
    'PRD-000025-M-Blue',
    'PRD-000025',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    488,
    'Jeans',
    'Skinny Jeans',
    'Grey',
    'M',
    'PRD-000025-M-Grey',
    'PRD-000025',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    489,
    'Jeans',
    'Skinny Jeans',
    'Black',
    'L',
    'PRD-000025-L-Black',
    'PRD-000025',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    490,
    'Jeans',
    'Skinny Jeans',
    'White',
    'L',
    'PRD-000025-L-White',
    'PRD-000025',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    491,
    'Jeans',
    'Skinny Jeans',
    'Blue',
    'L',
    'PRD-000025-L-Blue',
    'PRD-000025',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    492,
    'Jeans',
    'Skinny Jeans',
    'Grey',
    'L',
    'PRD-000025-L-Grey',
    'PRD-000025',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    493,
    'Jeans',
    'Skinny Jeans',
    'Black',
    'XL',
    'PRD-000025-XL-Black',
    'PRD-000025',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    494,
    'Jeans',
    'Skinny Jeans',
    'White',
    'XL',
    'PRD-000025-XL-White',
    'PRD-000025',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    495,
    'Jeans',
    'Skinny Jeans',
    'Blue',
    'XL',
    'PRD-000025-XL-Blue',
    'PRD-000025',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    496,
    'Jeans',
    'Skinny Jeans',
    'Grey',
    'XL',
    'PRD-000025-XL-Grey',
    'PRD-000025',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    497,
    'Jeans',
    'Skinny Jeans',
    'Black',
    'XXL',
    'PRD-000025-XXL-Black',
    'PRD-000025',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    498,
    'Jeans',
    'Skinny Jeans',
    'White',
    'XXL',
    'PRD-000025-XXL-White',
    'PRD-000025',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    499,
    'Jeans',
    'Skinny Jeans',
    'Blue',
    'XXL',
    'PRD-000025-XXL-Blue',
    'PRD-000025',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    500,
    'Jeans',
    'Skinny Jeans',
    'Grey',
    'XXL',
    'PRD-000025-XXL-Grey',
    'PRD-000025',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    501,
    'Jeans',
    'High-Waist Jeans',
    'Black',
    'S',
    'PRD-000026-S-Black',
    'PRD-000026',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    502,
    'Jeans',
    'High-Waist Jeans',
    'White',
    'S',
    'PRD-000026-S-White',
    'PRD-000026',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    503,
    'Jeans',
    'High-Waist Jeans',
    'Blue',
    'S',
    'PRD-000026-S-Blue',
    'PRD-000026',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    504,
    'Jeans',
    'High-Waist Jeans',
    'Grey',
    'S',
    'PRD-000026-S-Grey',
    'PRD-000026',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    505,
    'Jeans',
    'High-Waist Jeans',
    'Black',
    'M',
    'PRD-000026-M-Black',
    'PRD-000026',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    506,
    'Jeans',
    'High-Waist Jeans',
    'White',
    'M',
    'PRD-000026-M-White',
    'PRD-000026',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    507,
    'Jeans',
    'High-Waist Jeans',
    'Blue',
    'M',
    'PRD-000026-M-Blue',
    'PRD-000026',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    508,
    'Jeans',
    'High-Waist Jeans',
    'Grey',
    'M',
    'PRD-000026-M-Grey',
    'PRD-000026',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    509,
    'Jeans',
    'High-Waist Jeans',
    'Black',
    'L',
    'PRD-000026-L-Black',
    'PRD-000026',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    510,
    'Jeans',
    'High-Waist Jeans',
    'White',
    'L',
    'PRD-000026-L-White',
    'PRD-000026',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    511,
    'Jeans',
    'High-Waist Jeans',
    'Blue',
    'L',
    'PRD-000026-L-Blue',
    'PRD-000026',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    512,
    'Jeans',
    'High-Waist Jeans',
    'Grey',
    'L',
    'PRD-000026-L-Grey',
    'PRD-000026',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    513,
    'Jeans',
    'High-Waist Jeans',
    'Black',
    'XL',
    'PRD-000026-XL-Black',
    'PRD-000026',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    514,
    'Jeans',
    'High-Waist Jeans',
    'White',
    'XL',
    'PRD-000026-XL-White',
    'PRD-000026',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    515,
    'Jeans',
    'High-Waist Jeans',
    'Blue',
    'XL',
    'PRD-000026-XL-Blue',
    'PRD-000026',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    516,
    'Jeans',
    'High-Waist Jeans',
    'Grey',
    'XL',
    'PRD-000026-XL-Grey',
    'PRD-000026',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    517,
    'Jeans',
    'High-Waist Jeans',
    'Black',
    'XXL',
    'PRD-000026-XXL-Black',
    'PRD-000026',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    518,
    'Jeans',
    'High-Waist Jeans',
    'White',
    'XXL',
    'PRD-000026-XXL-White',
    'PRD-000026',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    519,
    'Jeans',
    'High-Waist Jeans',
    'Blue',
    'XXL',
    'PRD-000026-XXL-Blue',
    'PRD-000026',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    520,
    'Jeans',
    'High-Waist Jeans',
    'Grey',
    'XXL',
    'PRD-000026-XXL-Grey',
    'PRD-000026',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    521,
    'Jeans',
    'Mom Fit Jeans',
    'Black',
    'S',
    'PRD-000027-S-Black',
    'PRD-000027',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    522,
    'Jeans',
    'Mom Fit Jeans',
    'White',
    'S',
    'PRD-000027-S-White',
    'PRD-000027',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    523,
    'Jeans',
    'Mom Fit Jeans',
    'Blue',
    'S',
    'PRD-000027-S-Blue',
    'PRD-000027',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    524,
    'Jeans',
    'Mom Fit Jeans',
    'Grey',
    'S',
    'PRD-000027-S-Grey',
    'PRD-000027',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    525,
    'Jeans',
    'Mom Fit Jeans',
    'Black',
    'M',
    'PRD-000027-M-Black',
    'PRD-000027',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    526,
    'Jeans',
    'Mom Fit Jeans',
    'White',
    'M',
    'PRD-000027-M-White',
    'PRD-000027',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    527,
    'Jeans',
    'Mom Fit Jeans',
    'Blue',
    'M',
    'PRD-000027-M-Blue',
    'PRD-000027',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    528,
    'Jeans',
    'Mom Fit Jeans',
    'Grey',
    'M',
    'PRD-000027-M-Grey',
    'PRD-000027',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    529,
    'Jeans',
    'Mom Fit Jeans',
    'Black',
    'L',
    'PRD-000027-L-Black',
    'PRD-000027',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    530,
    'Jeans',
    'Mom Fit Jeans',
    'White',
    'L',
    'PRD-000027-L-White',
    'PRD-000027',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    531,
    'Jeans',
    'Mom Fit Jeans',
    'Blue',
    'L',
    'PRD-000027-L-Blue',
    'PRD-000027',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    532,
    'Jeans',
    'Mom Fit Jeans',
    'Grey',
    'L',
    'PRD-000027-L-Grey',
    'PRD-000027',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    533,
    'Jeans',
    'Mom Fit Jeans',
    'Black',
    'XL',
    'PRD-000027-XL-Black',
    'PRD-000027',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    534,
    'Jeans',
    'Mom Fit Jeans',
    'White',
    'XL',
    'PRD-000027-XL-White',
    'PRD-000027',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    535,
    'Jeans',
    'Mom Fit Jeans',
    'Blue',
    'XL',
    'PRD-000027-XL-Blue',
    'PRD-000027',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    536,
    'Jeans',
    'Mom Fit Jeans',
    'Grey',
    'XL',
    'PRD-000027-XL-Grey',
    'PRD-000027',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    537,
    'Jeans',
    'Mom Fit Jeans',
    'Black',
    'XXL',
    'PRD-000027-XXL-Black',
    'PRD-000027',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    538,
    'Jeans',
    'Mom Fit Jeans',
    'White',
    'XXL',
    'PRD-000027-XXL-White',
    'PRD-000027',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    539,
    'Jeans',
    'Mom Fit Jeans',
    'Blue',
    'XXL',
    'PRD-000027-XXL-Blue',
    'PRD-000027',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    540,
    'Jeans',
    'Mom Fit Jeans',
    'Grey',
    'XXL',
    'PRD-000027-XXL-Grey',
    'PRD-000027',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    541,
    'Jeans',
    'Straight Fit Jeans',
    'Black',
    'S',
    'PRD-000028-S-Black',
    'PRD-000028',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    542,
    'Jeans',
    'Straight Fit Jeans',
    'White',
    'S',
    'PRD-000028-S-White',
    'PRD-000028',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    543,
    'Jeans',
    'Straight Fit Jeans',
    'Blue',
    'S',
    'PRD-000028-S-Blue',
    'PRD-000028',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    544,
    'Jeans',
    'Straight Fit Jeans',
    'Grey',
    'S',
    'PRD-000028-S-Grey',
    'PRD-000028',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    545,
    'Jeans',
    'Straight Fit Jeans',
    'Black',
    'M',
    'PRD-000028-M-Black',
    'PRD-000028',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    546,
    'Jeans',
    'Straight Fit Jeans',
    'White',
    'M',
    'PRD-000028-M-White',
    'PRD-000028',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    547,
    'Jeans',
    'Straight Fit Jeans',
    'Blue',
    'M',
    'PRD-000028-M-Blue',
    'PRD-000028',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    548,
    'Jeans',
    'Straight Fit Jeans',
    'Grey',
    'M',
    'PRD-000028-M-Grey',
    'PRD-000028',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    549,
    'Jeans',
    'Straight Fit Jeans',
    'Black',
    'L',
    'PRD-000028-L-Black',
    'PRD-000028',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    550,
    'Jeans',
    'Straight Fit Jeans',
    'White',
    'L',
    'PRD-000028-L-White',
    'PRD-000028',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    551,
    'Jeans',
    'Straight Fit Jeans',
    'Blue',
    'L',
    'PRD-000028-L-Blue',
    'PRD-000028',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    552,
    'Jeans',
    'Straight Fit Jeans',
    'Grey',
    'L',
    'PRD-000028-L-Grey',
    'PRD-000028',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    553,
    'Jeans',
    'Straight Fit Jeans',
    'Black',
    'XL',
    'PRD-000028-XL-Black',
    'PRD-000028',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    554,
    'Jeans',
    'Straight Fit Jeans',
    'White',
    'XL',
    'PRD-000028-XL-White',
    'PRD-000028',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    555,
    'Jeans',
    'Straight Fit Jeans',
    'Blue',
    'XL',
    'PRD-000028-XL-Blue',
    'PRD-000028',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    556,
    'Jeans',
    'Straight Fit Jeans',
    'Grey',
    'XL',
    'PRD-000028-XL-Grey',
    'PRD-000028',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    557,
    'Jeans',
    'Straight Fit Jeans',
    'Black',
    'XXL',
    'PRD-000028-XXL-Black',
    'PRD-000028',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    558,
    'Jeans',
    'Straight Fit Jeans',
    'White',
    'XXL',
    'PRD-000028-XXL-White',
    'PRD-000028',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    559,
    'Jeans',
    'Straight Fit Jeans',
    'Blue',
    'XXL',
    'PRD-000028-XXL-Blue',
    'PRD-000028',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    560,
    'Jeans',
    'Straight Fit Jeans',
    'Grey',
    'XXL',
    'PRD-000028-XXL-Grey',
    'PRD-000028',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    561,
    'Clothing',
    'Top',
    'Black',
    'S',
    'PRD-000029-S-Black',
    'PRD-000029',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    562,
    'Clothing',
    'Top',
    'White',
    'S',
    'PRD-000029-S-White',
    'PRD-000029',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    563,
    'Clothing',
    'Top',
    'Blue',
    'S',
    'PRD-000029-S-Blue',
    'PRD-000029',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    564,
    'Clothing',
    'Top',
    'Grey',
    'S',
    'PRD-000029-S-Grey',
    'PRD-000029',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    565,
    'Clothing',
    'Top',
    'Black',
    'M',
    'PRD-000029-M-Black',
    'PRD-000029',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    566,
    'Clothing',
    'Top',
    'White',
    'M',
    'PRD-000029-M-White',
    'PRD-000029',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    567,
    'Clothing',
    'Top',
    'Blue',
    'M',
    'PRD-000029-M-Blue',
    'PRD-000029',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    568,
    'Clothing',
    'Top',
    'Grey',
    'M',
    'PRD-000029-M-Grey',
    'PRD-000029',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    569,
    'Clothing',
    'Top',
    'Black',
    'L',
    'PRD-000029-L-Black',
    'PRD-000029',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    570,
    'Clothing',
    'Top',
    'White',
    'L',
    'PRD-000029-L-White',
    'PRD-000029',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    571,
    'Clothing',
    'Top',
    'Blue',
    'L',
    'PRD-000029-L-Blue',
    'PRD-000029',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    572,
    'Clothing',
    'Top',
    'Grey',
    'L',
    'PRD-000029-L-Grey',
    'PRD-000029',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    573,
    'Clothing',
    'Top',
    'Black',
    'XL',
    'PRD-000029-XL-Black',
    'PRD-000029',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    574,
    'Clothing',
    'Top',
    'White',
    'XL',
    'PRD-000029-XL-White',
    'PRD-000029',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    575,
    'Clothing',
    'Top',
    'Blue',
    'XL',
    'PRD-000029-XL-Blue',
    'PRD-000029',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    576,
    'Clothing',
    'Top',
    'Grey',
    'XL',
    'PRD-000029-XL-Grey',
    'PRD-000029',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    577,
    'Clothing',
    'Top',
    'Black',
    'XXL',
    'PRD-000029-XXL-Black',
    'PRD-000029',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    578,
    'Clothing',
    'Top',
    'White',
    'XXL',
    'PRD-000029-XXL-White',
    'PRD-000029',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    579,
    'Clothing',
    'Top',
    'Blue',
    'XXL',
    'PRD-000029-XXL-Blue',
    'PRD-000029',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    580,
    'Clothing',
    'Top',
    'Grey',
    'XXL',
    'PRD-000029-XXL-Grey',
    'PRD-000029',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    581,
    'Clothing',
    'T-Shirt',
    'Black',
    'S',
    'PRD-000030-S-Black',
    'PRD-000030',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    582,
    'Clothing',
    'T-Shirt',
    'White',
    'S',
    'PRD-000030-S-White',
    'PRD-000030',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    583,
    'Clothing',
    'T-Shirt',
    'Blue',
    'S',
    'PRD-000030-S-Blue',
    'PRD-000030',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    584,
    'Clothing',
    'T-Shirt',
    'Grey',
    'S',
    'PRD-000030-S-Grey',
    'PRD-000030',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    585,
    'Clothing',
    'T-Shirt',
    'Black',
    'M',
    'PRD-000030-M-Black',
    'PRD-000030',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    586,
    'Clothing',
    'T-Shirt',
    'White',
    'M',
    'PRD-000030-M-White',
    'PRD-000030',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    587,
    'Clothing',
    'T-Shirt',
    'Blue',
    'M',
    'PRD-000030-M-Blue',
    'PRD-000030',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    588,
    'Clothing',
    'T-Shirt',
    'Grey',
    'M',
    'PRD-000030-M-Grey',
    'PRD-000030',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    589,
    'Clothing',
    'T-Shirt',
    'Black',
    'L',
    'PRD-000030-L-Black',
    'PRD-000030',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    590,
    'Clothing',
    'T-Shirt',
    'White',
    'L',
    'PRD-000030-L-White',
    'PRD-000030',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    591,
    'Clothing',
    'T-Shirt',
    'Blue',
    'L',
    'PRD-000030-L-Blue',
    'PRD-000030',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    592,
    'Clothing',
    'T-Shirt',
    'Grey',
    'L',
    'PRD-000030-L-Grey',
    'PRD-000030',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    593,
    'Clothing',
    'T-Shirt',
    'Black',
    'XL',
    'PRD-000030-XL-Black',
    'PRD-000030',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    594,
    'Clothing',
    'T-Shirt',
    'White',
    'XL',
    'PRD-000030-XL-White',
    'PRD-000030',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    595,
    'Clothing',
    'T-Shirt',
    'Blue',
    'XL',
    'PRD-000030-XL-Blue',
    'PRD-000030',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    596,
    'Clothing',
    'T-Shirt',
    'Grey',
    'XL',
    'PRD-000030-XL-Grey',
    'PRD-000030',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    597,
    'Clothing',
    'T-Shirt',
    'Black',
    'XXL',
    'PRD-000030-XXL-Black',
    'PRD-000030',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    598,
    'Clothing',
    'T-Shirt',
    'White',
    'XXL',
    'PRD-000030-XXL-White',
    'PRD-000030',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    599,
    'Clothing',
    'T-Shirt',
    'Blue',
    'XXL',
    'PRD-000030-XXL-Blue',
    'PRD-000030',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    600,
    'Clothing',
    'T-Shirt',
    'Grey',
    'XXL',
    'PRD-000030-XXL-Grey',
    'PRD-000030',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    601,
    'Clothing',
    'Dress',
    'Black',
    'S',
    'PRD-000031-S-Black',
    'PRD-000031',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    602,
    'Clothing',
    'Dress',
    'White',
    'S',
    'PRD-000031-S-White',
    'PRD-000031',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    603,
    'Clothing',
    'Dress',
    'Blue',
    'S',
    'PRD-000031-S-Blue',
    'PRD-000031',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    604,
    'Clothing',
    'Dress',
    'Grey',
    'S',
    'PRD-000031-S-Grey',
    'PRD-000031',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    605,
    'Clothing',
    'Dress',
    'Black',
    'M',
    'PRD-000031-M-Black',
    'PRD-000031',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    606,
    'Clothing',
    'Dress',
    'White',
    'M',
    'PRD-000031-M-White',
    'PRD-000031',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    607,
    'Clothing',
    'Dress',
    'Blue',
    'M',
    'PRD-000031-M-Blue',
    'PRD-000031',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    608,
    'Clothing',
    'Dress',
    'Grey',
    'M',
    'PRD-000031-M-Grey',
    'PRD-000031',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    609,
    'Clothing',
    'Dress',
    'Black',
    'L',
    'PRD-000031-L-Black',
    'PRD-000031',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    610,
    'Clothing',
    'Dress',
    'White',
    'L',
    'PRD-000031-L-White',
    'PRD-000031',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    611,
    'Clothing',
    'Dress',
    'Blue',
    'L',
    'PRD-000031-L-Blue',
    'PRD-000031',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    612,
    'Clothing',
    'Dress',
    'Grey',
    'L',
    'PRD-000031-L-Grey',
    'PRD-000031',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    613,
    'Clothing',
    'Dress',
    'Black',
    'XL',
    'PRD-000031-XL-Black',
    'PRD-000031',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    614,
    'Clothing',
    'Dress',
    'White',
    'XL',
    'PRD-000031-XL-White',
    'PRD-000031',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    615,
    'Clothing',
    'Dress',
    'Blue',
    'XL',
    'PRD-000031-XL-Blue',
    'PRD-000031',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    616,
    'Clothing',
    'Dress',
    'Grey',
    'XL',
    'PRD-000031-XL-Grey',
    'PRD-000031',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    617,
    'Clothing',
    'Dress',
    'Black',
    'XXL',
    'PRD-000031-XXL-Black',
    'PRD-000031',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    618,
    'Clothing',
    'Dress',
    'White',
    'XXL',
    'PRD-000031-XXL-White',
    'PRD-000031',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    619,
    'Clothing',
    'Dress',
    'Blue',
    'XXL',
    'PRD-000031-XXL-Blue',
    'PRD-000031',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    620,
    'Clothing',
    'Dress',
    'Grey',
    'XXL',
    'PRD-000031-XXL-Grey',
    'PRD-000031',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    621,
    'Clothing',
    'Frock',
    'Black',
    'S',
    'PRD-000032-S-Black',
    'PRD-000032',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    622,
    'Clothing',
    'Frock',
    'White',
    'S',
    'PRD-000032-S-White',
    'PRD-000032',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    623,
    'Clothing',
    'Frock',
    'Blue',
    'S',
    'PRD-000032-S-Blue',
    'PRD-000032',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    624,
    'Clothing',
    'Frock',
    'Grey',
    'S',
    'PRD-000032-S-Grey',
    'PRD-000032',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    625,
    'Clothing',
    'Frock',
    'Black',
    'M',
    'PRD-000032-M-Black',
    'PRD-000032',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    626,
    'Clothing',
    'Frock',
    'White',
    'M',
    'PRD-000032-M-White',
    'PRD-000032',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    627,
    'Clothing',
    'Frock',
    'Blue',
    'M',
    'PRD-000032-M-Blue',
    'PRD-000032',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    628,
    'Clothing',
    'Frock',
    'Grey',
    'M',
    'PRD-000032-M-Grey',
    'PRD-000032',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    629,
    'Clothing',
    'Frock',
    'Black',
    'L',
    'PRD-000032-L-Black',
    'PRD-000032',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    630,
    'Clothing',
    'Frock',
    'White',
    'L',
    'PRD-000032-L-White',
    'PRD-000032',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    631,
    'Clothing',
    'Frock',
    'Blue',
    'L',
    'PRD-000032-L-Blue',
    'PRD-000032',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    632,
    'Clothing',
    'Frock',
    'Grey',
    'L',
    'PRD-000032-L-Grey',
    'PRD-000032',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    633,
    'Clothing',
    'Frock',
    'Black',
    'XL',
    'PRD-000032-XL-Black',
    'PRD-000032',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    634,
    'Clothing',
    'Frock',
    'White',
    'XL',
    'PRD-000032-XL-White',
    'PRD-000032',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    635,
    'Clothing',
    'Frock',
    'Blue',
    'XL',
    'PRD-000032-XL-Blue',
    'PRD-000032',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    636,
    'Clothing',
    'Frock',
    'Grey',
    'XL',
    'PRD-000032-XL-Grey',
    'PRD-000032',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    637,
    'Clothing',
    'Frock',
    'Black',
    'XXL',
    'PRD-000032-XXL-Black',
    'PRD-000032',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    638,
    'Clothing',
    'Frock',
    'White',
    'XXL',
    'PRD-000032-XXL-White',
    'PRD-000032',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    639,
    'Clothing',
    'Frock',
    'Blue',
    'XXL',
    'PRD-000032-XXL-Blue',
    'PRD-000032',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    640,
    'Clothing',
    'Frock',
    'Grey',
    'XXL',
    'PRD-000032-XXL-Grey',
    'PRD-000032',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    641,
    'Clothing',
    'Skirt',
    'Black',
    'S',
    'PRD-000033-S-Black',
    'PRD-000033',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    642,
    'Clothing',
    'Skirt',
    'White',
    'S',
    'PRD-000033-S-White',
    'PRD-000033',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    643,
    'Clothing',
    'Skirt',
    'Blue',
    'S',
    'PRD-000033-S-Blue',
    'PRD-000033',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    644,
    'Clothing',
    'Skirt',
    'Grey',
    'S',
    'PRD-000033-S-Grey',
    'PRD-000033',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    645,
    'Clothing',
    'Skirt',
    'Black',
    'M',
    'PRD-000033-M-Black',
    'PRD-000033',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    646,
    'Clothing',
    'Skirt',
    'White',
    'M',
    'PRD-000033-M-White',
    'PRD-000033',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    647,
    'Clothing',
    'Skirt',
    'Blue',
    'M',
    'PRD-000033-M-Blue',
    'PRD-000033',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    648,
    'Clothing',
    'Skirt',
    'Grey',
    'M',
    'PRD-000033-M-Grey',
    'PRD-000033',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    649,
    'Clothing',
    'Skirt',
    'Black',
    'L',
    'PRD-000033-L-Black',
    'PRD-000033',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    650,
    'Clothing',
    'Skirt',
    'White',
    'L',
    'PRD-000033-L-White',
    'PRD-000033',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    651,
    'Clothing',
    'Skirt',
    'Blue',
    'L',
    'PRD-000033-L-Blue',
    'PRD-000033',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    652,
    'Clothing',
    'Skirt',
    'Grey',
    'L',
    'PRD-000033-L-Grey',
    'PRD-000033',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    653,
    'Clothing',
    'Skirt',
    'Black',
    'XL',
    'PRD-000033-XL-Black',
    'PRD-000033',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    654,
    'Clothing',
    'Skirt',
    'White',
    'XL',
    'PRD-000033-XL-White',
    'PRD-000033',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    655,
    'Clothing',
    'Skirt',
    'Blue',
    'XL',
    'PRD-000033-XL-Blue',
    'PRD-000033',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    656,
    'Clothing',
    'Skirt',
    'Grey',
    'XL',
    'PRD-000033-XL-Grey',
    'PRD-000033',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    657,
    'Clothing',
    'Skirt',
    'Black',
    'XXL',
    'PRD-000033-XXL-Black',
    'PRD-000033',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    658,
    'Clothing',
    'Skirt',
    'White',
    'XXL',
    'PRD-000033-XXL-White',
    'PRD-000033',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    659,
    'Clothing',
    'Skirt',
    'Blue',
    'XXL',
    'PRD-000033-XXL-Blue',
    'PRD-000033',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    660,
    'Clothing',
    'Skirt',
    'Grey',
    'XXL',
    'PRD-000033-XXL-Grey',
    'PRD-000033',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    661,
    'Clothing',
    'Jeans',
    'Black',
    'S',
    'PRD-000034-S-Black',
    'PRD-000034',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    662,
    'Clothing',
    'Jeans',
    'White',
    'S',
    'PRD-000034-S-White',
    'PRD-000034',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    663,
    'Clothing',
    'Jeans',
    'Blue',
    'S',
    'PRD-000034-S-Blue',
    'PRD-000034',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    664,
    'Clothing',
    'Jeans',
    'Grey',
    'S',
    'PRD-000034-S-Grey',
    'PRD-000034',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    665,
    'Clothing',
    'Jeans',
    'Black',
    'M',
    'PRD-000034-M-Black',
    'PRD-000034',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    666,
    'Clothing',
    'Jeans',
    'White',
    'M',
    'PRD-000034-M-White',
    'PRD-000034',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    667,
    'Clothing',
    'Jeans',
    'Blue',
    'M',
    'PRD-000034-M-Blue',
    'PRD-000034',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    668,
    'Clothing',
    'Jeans',
    'Grey',
    'M',
    'PRD-000034-M-Grey',
    'PRD-000034',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    669,
    'Clothing',
    'Jeans',
    'Black',
    'L',
    'PRD-000034-L-Black',
    'PRD-000034',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    670,
    'Clothing',
    'Jeans',
    'White',
    'L',
    'PRD-000034-L-White',
    'PRD-000034',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    671,
    'Clothing',
    'Jeans',
    'Blue',
    'L',
    'PRD-000034-L-Blue',
    'PRD-000034',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    672,
    'Clothing',
    'Jeans',
    'Grey',
    'L',
    'PRD-000034-L-Grey',
    'PRD-000034',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:47'
  ),
  (
    673,
    'Clothing',
    'Jeans',
    'Black',
    'XL',
    'PRD-000034-XL-Black',
    'PRD-000034',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    674,
    'Clothing',
    'Jeans',
    'White',
    'XL',
    'PRD-000034-XL-White',
    'PRD-000034',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    675,
    'Clothing',
    'Jeans',
    'Blue',
    'XL',
    'PRD-000034-XL-Blue',
    'PRD-000034',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    676,
    'Clothing',
    'Jeans',
    'Grey',
    'XL',
    'PRD-000034-XL-Grey',
    'PRD-000034',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    677,
    'Clothing',
    'Jeans',
    'Black',
    'XXL',
    'PRD-000034-XXL-Black',
    'PRD-000034',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    678,
    'Clothing',
    'Jeans',
    'White',
    'XXL',
    'PRD-000034-XXL-White',
    'PRD-000034',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    679,
    'Clothing',
    'Jeans',
    'Blue',
    'XXL',
    'PRD-000034-XXL-Blue',
    'PRD-000034',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    680,
    'Clothing',
    'Jeans',
    'Grey',
    'XXL',
    'PRD-000034-XXL-Grey',
    'PRD-000034',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    681,
    'Clothing',
    'Leggings',
    'Black',
    'S',
    'PRD-000035-S-Black',
    'PRD-000035',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    682,
    'Clothing',
    'Leggings',
    'White',
    'S',
    'PRD-000035-S-White',
    'PRD-000035',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    683,
    'Clothing',
    'Leggings',
    'Blue',
    'S',
    'PRD-000035-S-Blue',
    'PRD-000035',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    684,
    'Clothing',
    'Leggings',
    'Grey',
    'S',
    'PRD-000035-S-Grey',
    'PRD-000035',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    685,
    'Clothing',
    'Leggings',
    'Black',
    'M',
    'PRD-000035-M-Black',
    'PRD-000035',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    686,
    'Clothing',
    'Leggings',
    'White',
    'M',
    'PRD-000035-M-White',
    'PRD-000035',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    687,
    'Clothing',
    'Leggings',
    'Blue',
    'M',
    'PRD-000035-M-Blue',
    'PRD-000035',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    688,
    'Clothing',
    'Leggings',
    'Grey',
    'M',
    'PRD-000035-M-Grey',
    'PRD-000035',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    689,
    'Clothing',
    'Leggings',
    'Black',
    'L',
    'PRD-000035-L-Black',
    'PRD-000035',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    690,
    'Clothing',
    'Leggings',
    'White',
    'L',
    'PRD-000035-L-White',
    'PRD-000035',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    691,
    'Clothing',
    'Leggings',
    'Blue',
    'L',
    'PRD-000035-L-Blue',
    'PRD-000035',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    692,
    'Clothing',
    'Leggings',
    'Grey',
    'L',
    'PRD-000035-L-Grey',
    'PRD-000035',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    693,
    'Clothing',
    'Leggings',
    'Black',
    'XL',
    'PRD-000035-XL-Black',
    'PRD-000035',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    694,
    'Clothing',
    'Leggings',
    'White',
    'XL',
    'PRD-000035-XL-White',
    'PRD-000035',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    695,
    'Clothing',
    'Leggings',
    'Blue',
    'XL',
    'PRD-000035-XL-Blue',
    'PRD-000035',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    696,
    'Clothing',
    'Leggings',
    'Grey',
    'XL',
    'PRD-000035-XL-Grey',
    'PRD-000035',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    697,
    'Clothing',
    'Leggings',
    'Black',
    'XXL',
    'PRD-000035-XXL-Black',
    'PRD-000035',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    698,
    'Clothing',
    'Leggings',
    'White',
    'XXL',
    'PRD-000035-XXL-White',
    'PRD-000035',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    699,
    'Clothing',
    'Leggings',
    'Blue',
    'XXL',
    'PRD-000035-XXL-Blue',
    'PRD-000035',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    700,
    'Clothing',
    'Leggings',
    'Grey',
    'XXL',
    'PRD-000035-XXL-Grey',
    'PRD-000035',
    'S,M,L,XL,XXL',
    '2026-02-20 14:08:48'
  ),
  (
    701,
    'test100',
    'test1',
    'Black',
    'S',
    'PRD-000036-S-Black',
    'PRD-000036',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    702,
    'test100',
    'test1',
    'White',
    'S',
    'PRD-000036-S-White',
    'PRD-000036',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    703,
    'test100',
    'test1',
    'Blue',
    'S',
    'PRD-000036-S-Blue',
    'PRD-000036',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    704,
    'test100',
    'test1',
    'Grey',
    'S',
    'PRD-000036-S-Grey',
    'PRD-000036',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    705,
    'test100',
    'test1',
    'Black',
    'M',
    'PRD-000036-M-Black',
    'PRD-000036',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    706,
    'test100',
    'test1',
    'White',
    'M',
    'PRD-000036-M-White',
    'PRD-000036',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    707,
    'test100',
    'test1',
    'Blue',
    'M',
    'PRD-000036-M-Blue',
    'PRD-000036',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    708,
    'test100',
    'test1',
    'Grey',
    'M',
    'PRD-000036-M-Grey',
    'PRD-000036',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    709,
    'test100',
    'test1',
    'Black',
    'L',
    'PRD-000036-L-Black',
    'PRD-000036',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    710,
    'test100',
    'test1',
    'White',
    'L',
    'PRD-000036-L-White',
    'PRD-000036',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    711,
    'test100',
    'test1',
    'Blue',
    'L',
    'PRD-000036-L-Blue',
    'PRD-000036',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    712,
    'test100',
    'test1',
    'Grey',
    'L',
    'PRD-000036-L-Grey',
    'PRD-000036',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    713,
    'test100',
    'test1',
    'Black',
    'XL',
    'PRD-000036-XL-Black',
    'PRD-000036',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    714,
    'test100',
    'test1',
    'White',
    'XL',
    'PRD-000036-XL-White',
    'PRD-000036',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    715,
    'test100',
    'test1',
    'Blue',
    'XL',
    'PRD-000036-XL-Blue',
    'PRD-000036',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    716,
    'test100',
    'test1',
    'Grey',
    'XL',
    'PRD-000036-XL-Grey',
    'PRD-000036',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    717,
    'test100',
    'test1',
    'Black',
    'XXL',
    'PRD-000036-XXL-Black',
    'PRD-000036',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    718,
    'test100',
    'test1',
    'White',
    'XXL',
    'PRD-000036-XXL-White',
    'PRD-000036',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    719,
    'test100',
    'test1',
    'Blue',
    'XXL',
    'PRD-000036-XXL-Blue',
    'PRD-000036',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    720,
    'test100',
    'test1',
    'Grey',
    'XXL',
    'PRD-000036-XXL-Grey',
    'PRD-000036',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    721,
    'test100',
    'test2',
    'Black',
    'S',
    'PRD-000037-S-Black',
    'PRD-000037',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    722,
    'test100',
    'test2',
    'White',
    'S',
    'PRD-000037-S-White',
    'PRD-000037',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    723,
    'test100',
    'test2',
    'Blue',
    'S',
    'PRD-000037-S-Blue',
    'PRD-000037',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    724,
    'test100',
    'test2',
    'Grey',
    'S',
    'PRD-000037-S-Grey',
    'PRD-000037',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    725,
    'test100',
    'test2',
    'Black',
    'M',
    'PRD-000037-M-Black',
    'PRD-000037',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    726,
    'test100',
    'test2',
    'White',
    'M',
    'PRD-000037-M-White',
    'PRD-000037',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    727,
    'test100',
    'test2',
    'Blue',
    'M',
    'PRD-000037-M-Blue',
    'PRD-000037',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    728,
    'test100',
    'test2',
    'Grey',
    'M',
    'PRD-000037-M-Grey',
    'PRD-000037',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    729,
    'test100',
    'test2',
    'Black',
    'L',
    'PRD-000037-L-Black',
    'PRD-000037',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    730,
    'test100',
    'test2',
    'White',
    'L',
    'PRD-000037-L-White',
    'PRD-000037',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    731,
    'test100',
    'test2',
    'Blue',
    'L',
    'PRD-000037-L-Blue',
    'PRD-000037',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    732,
    'test100',
    'test2',
    'Grey',
    'L',
    'PRD-000037-L-Grey',
    'PRD-000037',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    733,
    'test100',
    'test2',
    'Black',
    'XL',
    'PRD-000037-XL-Black',
    'PRD-000037',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    734,
    'test100',
    'test2',
    'White',
    'XL',
    'PRD-000037-XL-White',
    'PRD-000037',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    735,
    'test100',
    'test2',
    'Blue',
    'XL',
    'PRD-000037-XL-Blue',
    'PRD-000037',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    736,
    'test100',
    'test2',
    'Grey',
    'XL',
    'PRD-000037-XL-Grey',
    'PRD-000037',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    737,
    'test100',
    'test2',
    'Black',
    'XXL',
    'PRD-000037-XXL-Black',
    'PRD-000037',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    738,
    'test100',
    'test2',
    'White',
    'XXL',
    'PRD-000037-XXL-White',
    'PRD-000037',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    739,
    'test100',
    'test2',
    'Blue',
    'XXL',
    'PRD-000037-XXL-Blue',
    'PRD-000037',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    740,
    'test100',
    'test2',
    'Grey',
    'XXL',
    'PRD-000037-XXL-Grey',
    'PRD-000037',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    741,
    'test100',
    'test3',
    'Black',
    'S',
    'PRD-000038-S-Black',
    'PRD-000038',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    742,
    'test100',
    'test3',
    'White',
    'S',
    'PRD-000038-S-White',
    'PRD-000038',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    743,
    'test100',
    'test3',
    'Blue',
    'S',
    'PRD-000038-S-Blue',
    'PRD-000038',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    744,
    'test100',
    'test3',
    'Grey',
    'S',
    'PRD-000038-S-Grey',
    'PRD-000038',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    745,
    'test100',
    'test3',
    'Black',
    'M',
    'PRD-000038-M-Black',
    'PRD-000038',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    746,
    'test100',
    'test3',
    'White',
    'M',
    'PRD-000038-M-White',
    'PRD-000038',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    747,
    'test100',
    'test3',
    'Blue',
    'M',
    'PRD-000038-M-Blue',
    'PRD-000038',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    748,
    'test100',
    'test3',
    'Grey',
    'M',
    'PRD-000038-M-Grey',
    'PRD-000038',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    749,
    'test100',
    'test3',
    'Black',
    'L',
    'PRD-000038-L-Black',
    'PRD-000038',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    750,
    'test100',
    'test3',
    'White',
    'L',
    'PRD-000038-L-White',
    'PRD-000038',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    751,
    'test100',
    'test3',
    'Blue',
    'L',
    'PRD-000038-L-Blue',
    'PRD-000038',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    752,
    'test100',
    'test3',
    'Grey',
    'L',
    'PRD-000038-L-Grey',
    'PRD-000038',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    753,
    'test100',
    'test3',
    'Black',
    'XL',
    'PRD-000038-XL-Black',
    'PRD-000038',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    754,
    'test100',
    'test3',
    'White',
    'XL',
    'PRD-000038-XL-White',
    'PRD-000038',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    755,
    'test100',
    'test3',
    'Blue',
    'XL',
    'PRD-000038-XL-Blue',
    'PRD-000038',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    756,
    'test100',
    'test3',
    'Grey',
    'XL',
    'PRD-000038-XL-Grey',
    'PRD-000038',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    757,
    'test100',
    'test3',
    'Black',
    'XXL',
    'PRD-000038-XXL-Black',
    'PRD-000038',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    758,
    'test100',
    'test3',
    'White',
    'XXL',
    'PRD-000038-XXL-White',
    'PRD-000038',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    759,
    'test100',
    'test3',
    'Blue',
    'XXL',
    'PRD-000038-XXL-Blue',
    'PRD-000038',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    760,
    'test100',
    'test3',
    'Grey',
    'XXL',
    'PRD-000038-XXL-Grey',
    'PRD-000038',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    761,
    'test100',
    'test4',
    'Black',
    'S',
    'PRD-000039-S-Black',
    'PRD-000039',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    762,
    'test100',
    'test4',
    'White',
    'S',
    'PRD-000039-S-White',
    'PRD-000039',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    763,
    'test100',
    'test4',
    'Blue',
    'S',
    'PRD-000039-S-Blue',
    'PRD-000039',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    764,
    'test100',
    'test4',
    'Grey',
    'S',
    'PRD-000039-S-Grey',
    'PRD-000039',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    765,
    'test100',
    'test4',
    'Black',
    'M',
    'PRD-000039-M-Black',
    'PRD-000039',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    766,
    'test100',
    'test4',
    'White',
    'M',
    'PRD-000039-M-White',
    'PRD-000039',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    767,
    'test100',
    'test4',
    'Blue',
    'M',
    'PRD-000039-M-Blue',
    'PRD-000039',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    768,
    'test100',
    'test4',
    'Grey',
    'M',
    'PRD-000039-M-Grey',
    'PRD-000039',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    769,
    'test100',
    'test4',
    'Black',
    'L',
    'PRD-000039-L-Black',
    'PRD-000039',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    770,
    'test100',
    'test4',
    'White',
    'L',
    'PRD-000039-L-White',
    'PRD-000039',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    771,
    'test100',
    'test4',
    'Blue',
    'L',
    'PRD-000039-L-Blue',
    'PRD-000039',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    772,
    'test100',
    'test4',
    'Grey',
    'L',
    'PRD-000039-L-Grey',
    'PRD-000039',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    773,
    'test100',
    'test4',
    'Black',
    'XL',
    'PRD-000039-XL-Black',
    'PRD-000039',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    774,
    'test100',
    'test4',
    'White',
    'XL',
    'PRD-000039-XL-White',
    'PRD-000039',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    775,
    'test100',
    'test4',
    'Blue',
    'XL',
    'PRD-000039-XL-Blue',
    'PRD-000039',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    776,
    'test100',
    'test4',
    'Grey',
    'XL',
    'PRD-000039-XL-Grey',
    'PRD-000039',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    777,
    'test100',
    'test4',
    'Black',
    'XXL',
    'PRD-000039-XXL-Black',
    'PRD-000039',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    778,
    'test100',
    'test4',
    'White',
    'XXL',
    'PRD-000039-XXL-White',
    'PRD-000039',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    779,
    'test100',
    'test4',
    'Blue',
    'XXL',
    'PRD-000039-XXL-Blue',
    'PRD-000039',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    780,
    'test100',
    'test4',
    'Grey',
    'XXL',
    'PRD-000039-XXL-Grey',
    'PRD-000039',
    'S,M,L,XL,XXL',
    '2026-02-20 14:10:59'
  ),
  (
    796,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'green',
    'S',
    'PRD-000001-S-green',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 15:26:35'
  ),
  (
    797,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'green',
    'M',
    'PRD-000001-M-green',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 15:26:35'
  ),
  (
    798,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'green',
    'L',
    'PRD-000001-L-green',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 15:26:35'
  ),
  (
    799,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'green',
    'XL',
    'PRD-000001-XL-green',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 15:26:35'
  ),
  (
    800,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'green',
    'XXL',
    'PRD-000001-XXL-green',
    'PRD-000001',
    'S,M,L,XL,XXL',
    '2026-02-20 15:26:35'
  );
-- --------------------------------------------------------
--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` int(11) NOT NULL,
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
  `rate` decimal(10, 2) DEFAULT 0.00,
  `gst_percent` decimal(5, 2) DEFAULT 0.00,
  `amount` decimal(10, 2) DEFAULT 0.00
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `purchases`
--

INSERT INTO `purchases` (
    `id`,
    `supplier_name`,
    `gstin`,
    `invoice_no`,
    `purchase_date`,
    `payment_mode`,
    `payment_status`,
    `category`,
    `item_name`,
    `size`,
    `color`,
    `qty`,
    `rate`,
    `gst_percent`,
    `amount`
  )
VALUES (
    10,
    'test100000',
    '8520',
    '7410',
    '2026-02-18',
    'Cash',
    'Paid',
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'M',
    'Blue',
    2,
    299.00,
    5.00,
    627.90
  ),
  (
    11,
    'test2',
    '5678',
    '1234',
    '2026-02-24',
    'Online',
    'Paid',
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'M',
    'Black',
    4,
    299.00,
    5.00,
    1255.80
  );
-- --------------------------------------------------------
--
-- Table structure for table `purchase_edit_logs`
--

CREATE TABLE `purchase_edit_logs` (
  `id` int(11) NOT NULL,
  `invoice_no` varchar(50) NOT NULL,
  `supplier_name` varchar(100) DEFAULT NULL,
  `old_data` longtext DEFAULT NULL,
  `new_data` longtext DEFAULT NULL,
  `edited_by` varchar(100) NOT NULL,
  `edit_time` datetime DEFAULT current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `purchase_edit_logs`
--

INSERT INTO `purchase_edit_logs` (
    `id`,
    `invoice_no`,
    `supplier_name`,
    `old_data`,
    `new_data`,
    `edited_by`,
    `edit_time`
  )
VALUES (
    4,
    '7410',
    'test10000',
    '{\"supplier_name\":\"test1000\",\"purchase_date\":\"2026-02-20\",\"grand_total\":\"313.95\",\"items\":[{\"category\":\"Round Neck T-Shirts\",\"item_name\":\"Plain Round Neck\",\"size\":\"M\",\"color\":\"Blue\",\"qty\":1,\"rate\":\"299.00\",\"amount\":\"313.95\"}]}',
    '{\"supplier_name\":\"test10000\",\"purchase_date\":\"2026-02-19\",\"grand_total\":\"627.90\",\"items\":[{\"category\":\"Round Neck T-Shirts\",\"item_name\":\"Plain Round Neck\",\"size\":\"S\",\"color\":\"Blue\",\"qty\":2,\"rate\":299,\"gst\":5,\"total\":627.9,\"amount\":627.9}]}',
    'Admin',
    '2026-02-20 17:15:24'
  ),
  (
    5,
    '7410',
    'test100000',
    '{\"supplier_name\":\"test10000\",\"items\":[{\"category\":\"Round Neck T-Shirts\",\"item_name\":\"Plain Round Neck\",\"size\":\"S\",\"color\":\"Blue\",\"qty\":2,\"rate\":\"299.00\",\"amount\":\"627.90\"}]}',
    '{\"supplier_name\":\"test100000\",\"items\":[{\"category\":\"Round Neck T-Shirts\",\"item_name\":\"Plain Round Neck\",\"size\":\"M\",\"color\":\"Blue\",\"qty\":2,\"rate\":299,\"gst\":5,\"total\":627.9,\"amount\":627.9}]}',
    'Admin',
    '2026-02-20 17:33:26'
  );
-- --------------------------------------------------------
--
-- Table structure for table `sales_items`
--

CREATE TABLE `sales_items` (
  `id` int(11) NOT NULL,
  `invoice_no` varchar(50) NOT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `sale_date` datetime DEFAULT current_timestamp(),
  `category` varchar(255) DEFAULT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  `size` varchar(10) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `qty` int(11) DEFAULT 1,
  `price` decimal(10, 2) DEFAULT 0.00,
  `total` decimal(10, 2) DEFAULT 0.00,
  `gst_percent` decimal(5, 2) DEFAULT 5.00,
  `grand_total` decimal(10, 2) DEFAULT 0.00,
  `payment_mode` varchar(50) DEFAULT 'Cash',
  `payment_status` varchar(50) DEFAULT 'Paid'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `sales_items`
--

INSERT INTO `sales_items` (
    `id`,
    `invoice_no`,
    `client_name`,
    `phone`,
    `sale_date`,
    `category`,
    `item_name`,
    `size`,
    `color`,
    `qty`,
    `price`,
    `total`,
    `gst_percent`,
    `grand_total`,
    `payment_mode`,
    `payment_status`
  )
VALUES (
    4,
    'INV - 1329',
    'test1',
    'test4',
    '2026-02-20 13:54:10',
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'L',
    'White',
    2,
    299.00,
    598.00,
    5.00,
    627.90,
    'Cash',
    'Done'
  ),
  (
    5,
    'INV - 8990 ',
    'test2',
    '78456123',
    '2026-02-24 15:22:16',
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'XL',
    'Blue',
    1,
    349.00,
    349.00,
    5.00,
    366.00,
    'Online',
    'Received'
  );
-- --------------------------------------------------------
--
-- Table structure for table `sales_users`
--

CREATE TABLE `sales_users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- --------------------------------------------------------
--
-- Table structure for table `stock`
--

CREATE TABLE `stock` (
  `id` int(11) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `size` varchar(10) DEFAULT NULL,
  `available` int(11) DEFAULT 0,
  `purchased` int(11) DEFAULT 0,
  `sold` int(11) DEFAULT 0,
  `barcode` varchar(255) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- --------------------------------------------------------
--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `gstin` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- --------------------------------------------------------
--
-- Table structure for table `system_stock`
--

CREATE TABLE `system_stock` (
  `id` int(11) NOT NULL,
  `category` varchar(255) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `color` varchar(50) NOT NULL,
  `size` varchar(10) NOT NULL,
  `available` int(11) DEFAULT 0
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `system_stock`
--

INSERT INTO `system_stock` (
    `id`,
    `category`,
    `item_name`,
    `color`,
    `size`,
    `available`
  )
VALUES (
    1,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'White',
    'L',
    -2
  ),
  (
    2,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'Blue',
    'M',
    2
  ),
  (
    6,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'Blue',
    's',
    0
  ),
  (
    7,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'Grey',
    'XL',
    0
  ),
  (
    9,
    'Round Neck T-Shirts',
    'Striped Round Neck',
    'Black',
    'L',
    0
  ),
  (
    10,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'Blue',
    'L',
    0
  ),
  (
    15,
    'Round Neck T-Shirts',
    'Printed Round Neck',
    'Blue',
    'XL',
    -1
  ),
  (
    16,
    'Round Neck T-Shirts',
    'Plain Round Neck',
    'Black',
    'M',
    4
  );
-- --------------------------------------------------------
--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `created_by` varchar(255) DEFAULT 'System',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `users`
--

INSERT INTO `users` (
    `id`,
    `name`,
    `username`,
    `password`,
    `role`,
    `created_by`,
    `created_at`
  )
VALUES (
    1,
    'Main Admin',
    'admin',
    '$2b$10$XRUqIByBWKiyV5kBrU6A6ubez.qWXdSCm45qLNVlTzLOhNkzEtVGG',
    'admin',
    'System',
    '2026-02-20 13:41:24'
  ),
  (
    2,
    'admin',
    '1111',
    '$2b$10$jCfZqNfcJHYZg41WJViH/u7zgFqW1BsLsYhP.BwOicrhng6aOWDsm',
    'sales',
    'Admin',
    '2026-02-20 13:52:39'
  ),
  (
    4,
    'preyansh',
    '2222',
    '$2b$10$YX/ik4R1zjEj00GzG1Li.eTKgG66D0ksOYvqBPi4dsQG.TYZU6YO.',
    'manager',
    'Admin@123',
    '2026-02-24 16:52:25'
  );
--
-- Indexes for dumped tables
--

--
-- Indexes for table `barcodes`
--
ALTER TABLE `barcodes`
ADD PRIMARY KEY (`id`);
--
-- Indexes for table `category_gst`
--
ALTER TABLE `category_gst`
ADD PRIMARY KEY (`category`);
--
-- Indexes for table `edit_logs`
--
ALTER TABLE `edit_logs`
ADD PRIMARY KEY (`id`),
  ADD KEY `idx_invoice` (`invoice_no`);
--
-- Indexes for table `login_logs`
--
ALTER TABLE `login_logs`
ADD PRIMARY KEY (`id`);
--
-- Indexes for table `masterdata`
--
ALTER TABLE `masterdata`
ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `barcode` (`barcode`);
--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
ADD PRIMARY KEY (`id`),
  ADD KEY `idx_invoice` (`invoice_no`),
  ADD KEY `idx_purchase_date` (`purchase_date`);
--
-- Indexes for table `purchase_edit_logs`
--
ALTER TABLE `purchase_edit_logs`
ADD PRIMARY KEY (`id`),
  ADD KEY `idx_invoice` (`invoice_no`);
--
-- Indexes for table `sales_items`
--
ALTER TABLE `sales_items`
ADD PRIMARY KEY (`id`),
  ADD KEY `idx_invoice` (`invoice_no`),
  ADD KEY `idx_sale_date` (`sale_date`);
--
-- Indexes for table `sales_users`
--
ALTER TABLE `sales_users`
ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);
--
-- Indexes for table `stock`
--
ALTER TABLE `stock`
ADD PRIMARY KEY (`id`);
--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
ADD PRIMARY KEY (`id`);
--
-- Indexes for table `system_stock`
--
ALTER TABLE `system_stock`
ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_stock` (`category`, `item_name`, `color`, `size`);
--
-- Indexes for table `users`
--
ALTER TABLE `users`
ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);
--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `barcodes`
--
ALTER TABLE `barcodes`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 91;
--
-- AUTO_INCREMENT for table `edit_logs`
--
ALTER TABLE `edit_logs`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 4;
--
-- AUTO_INCREMENT for table `login_logs`
--
ALTER TABLE `login_logs`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 5;
--
-- AUTO_INCREMENT for table `masterdata`
--
ALTER TABLE `masterdata`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 801;
--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 12;
--
-- AUTO_INCREMENT for table `purchase_edit_logs`
--
ALTER TABLE `purchase_edit_logs`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 6;
--
-- AUTO_INCREMENT for table `sales_items`
--
ALTER TABLE `sales_items`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 6;
--
-- AUTO_INCREMENT for table `sales_users`
--
ALTER TABLE `sales_users`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `stock`
--
ALTER TABLE `stock`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `system_stock`
--
ALTER TABLE `system_stock`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 17;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 5;
COMMIT;
-- --------------------------------------------------------
-- Table structure for table `clients`
--
CREATE TABLE `clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_name` varchar(255) NOT NULL,
  `business_name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `plans`
--
CREATE TABLE `plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `plan_name` varchar(100) NOT NULL,
  `duration_months` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `client_software_credentials`
--
CREATE TABLE `client_software_credentials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `activation_date` date NOT NULL,
  `end_date` date NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */
;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */
;