-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: May 13, 2026 at 12:57 AM
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
-- Database: `microfinance_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `ai_forecasts`
--

CREATE TABLE `ai_forecasts` (
  `id` int(11) NOT NULL,
  `forecast_type` enum('USER_REGISTRATION','LOAN_DEMAND','LIQUIDITY','RISK_INDICATORS') NOT NULL,
  `forecast_period` enum('MONTHLY','QUARTERLY','YEARLY') NOT NULL,
  `target_date` date NOT NULL,
  `predicted_value` decimal(15,2) NOT NULL,
  `confidence_score` decimal(5,2) DEFAULT 0.00,
  `model_version` varchar(50) NOT NULL,
  `training_data_period_start` date NOT NULL,
  `training_data_period_end` date NOT NULL,
  `actual_value` decimal(15,2) DEFAULT NULL,
  `accuracy_score` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `record_id` int(11) DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `table_name`, `record_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-07 17:17:25'),
(2, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-07 17:52:58'),
(3, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-07 17:53:07'),
(4, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-07 17:53:20'),
(5, NULL, 'LOAN_COMMITTEE_ADMIN_CREATED', NULL, NULL, NULL, '{\"first_name\":\"aster\",\"last_name\":\"mulu\",\"email\":\"gasha@gmail.com\",\"phone_number\":\"+123456789\",\"password\":\"Ada@1234\",\"role\":\"LOAN_COMMITTEE\",\"department\":\"Finance\",\"job_title\":\"Loan Officer\",\"employee_id\":\"ADM52086\",\"committee_level\":\"LEVEL_1\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 17:59:12'),
(6, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"gashaw@gmail.com\"}', 'ADMIN', '::1', '2026-04-07 17:59:42'),
(7, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"gasha@gmail.com\"}', 'ADMIN', '::1', '2026-04-07 18:00:33'),
(8, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"gashaw@gmail.com\"}', 'ADMIN', '::1', '2026-04-07 18:02:12'),
(9, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"gasha@gmail.com\"}', 'ADMIN', '::1', '2026-04-07 18:02:17'),
(10, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"gasha@gmail.com\"}', 'ADMIN', '::1', '2026-04-07 18:03:58'),
(11, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-09 17:21:55'),
(12, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-09 17:23:12'),
(13, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"gasha@gmail.com\"}', 'ADMIN', '::1', '2026-04-09 17:24:38'),
(14, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-09 17:25:07'),
(15, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"gasha@gmail.com\"}', 'ADMIN', '::1', '2026-04-09 17:33:16'),
(16, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"gasha@gmail.com\"}', 'ADMIN', '::1', '2026-04-09 17:33:28'),
(17, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"gasha@gmail.com\"}', 'ADMIN', '::1', '2026-04-09 17:37:31'),
(18, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-09 17:37:47'),
(19, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"gasha@gmail.com\"}', 'ADMIN', '::1', '2026-04-09 17:39:16'),
(20, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-09 17:39:32'),
(21, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-09 17:39:47'),
(22, 5, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"EMP001\"}', 'EMPLOYEE', '::1', '2026-04-09 17:41:03'),
(23, 5, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"EMP001\"}', 'EMPLOYEE', '::1', '2026-04-09 17:41:24'),
(24, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"gasha@gmail.com\"}', 'ADMIN', '::1', '2026-04-09 17:50:13'),
(25, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-09 17:53:20'),
(26, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"gasha@gmail.com\"}', 'ADMIN', '::1', '2026-04-09 17:53:31'),
(27, 5, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"EMP001\"}', 'EMPLOYEE', '::1', '2026-04-09 17:53:52'),
(28, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-09 17:57:04'),
(29, 5, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"EMP001\"}', 'EMPLOYEE', '::1', '2026-04-09 18:14:13'),
(30, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"gasha@gmail.com\"}', 'ADMIN', '::1', '2026-04-09 18:24:30'),
(31, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-09 18:25:09'),
(32, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"gasha@gmail.com\"}', 'ADMIN', '::1', '2026-04-09 18:25:26'),
(33, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"gasha@gmail.com\"}', 'ADMIN', '::1', '2026-04-09 18:25:38'),
(34, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-09 18:26:10'),
(35, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-09 18:26:18'),
(36, 5, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"EMP001\"}', 'EMPLOYEE', '::1', '2026-04-09 18:26:35'),
(37, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"gasha@gmail.com\"}', 'ADMIN', '::1', '2026-04-09 18:27:42'),
(38, 5, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"EMP001\"}', 'EMPLOYEE', '::1', '2026-04-09 18:27:53'),
(39, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"gasha@gmail.com\"}', 'ADMIN', '::1', '2026-04-09 18:28:06'),
(40, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"gasha@gmail.com\"}', 'ADMIN', '::1', '2026-04-09 18:28:23'),
(41, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-09 18:30:46'),
(42, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-09 18:31:00'),
(43, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-09 18:31:08'),
(44, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-09 18:32:04'),
(45, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-09 18:32:35'),
(46, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"gasha@gmail.com\"}', 'ADMIN', '::1', '2026-04-09 18:32:45'),
(47, 5, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"EMP001\"}', 'EMPLOYEE', '::1', '2026-04-09 18:32:53'),
(48, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-09 18:33:12'),
(49, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"gasha@gmail.com\"}', 'ADMIN', '::1', '2026-04-09 18:33:22'),
(50, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"admin@msms.com\"}', 'ADMIN', '::1', '2026-04-09 18:33:31'),
(51, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"gasha@gmail.com\"}', 'ADMIN', '::1', '2026-04-09 18:33:42'),
(52, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"gasha@gmail.com\"}', 'ADMIN', '::1', '2026-04-09 18:34:59'),
(53, 7, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"Ade@gmail.com\"}', 'ADMIN', '::1', '2026-04-28 18:30:36'),
(54, 7, 'PROFILE_UPDATED', 'users', 7, NULL, '{\"updated_fields\":[\"first_name\",\"last_name\",\"phone_number\",\"address\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-28 18:55:39'),
(55, 7, 'PROFILE_UPDATE', 'employee_profiles', NULL, NULL, '{\"first_name\":\"Bula\",\"last_name\":\"mula\",\"phone_number\":\"\",\"address\":\"\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-28 18:55:39'),
(56, 7, 'PROFILE_UPDATED', 'users', 7, NULL, '{\"updated_fields\":[\"first_name\",\"last_name\",\"phone_number\",\"address\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-28 19:01:51'),
(57, 7, 'PROFILE_UPDATE', 'employee_profiles', NULL, NULL, '{\"first_name\":\"Bula\",\"last_name\":\"mula\",\"phone_number\":\"\",\"address\":\"sderser\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-28 19:01:51'),
(58, 7, 'PROFILE_UPDATED', 'users', 7, NULL, '{\"updated_fields\":[\"first_name\",\"last_name\",\"phone_number\",\"address\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-28 19:02:51'),
(59, 7, 'PROFILE_UPDATE', 'employee_profiles', NULL, NULL, '{\"first_name\":\"Bula\",\"last_name\":\"mula\",\"phone_number\":\"\",\"address\":\"sderserswerswer\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-28 19:02:51'),
(60, 7, 'SYSTEM_CONFIG_UPDATE', NULL, NULL, NULL, '{\"system_name\":\"Microfinance Management System\",\"organization_name\":\"MSMS Organization\",\"admin_email\":\"admin@msms.com\",\"support_email\":\"support@msms.com\",\"timezone\":\"UTC+3\",\"date_format\":\"YYYY-MM-DD\",\"currency\":\"USD\",\"fiscal_year_start\":\"January\",\"session_timeout_minutes\":30,\"password_min_length\":8,\"password_expiry_days\":90,\"max_login_attempts\":5,\"lockout_duration_minutes\":15,\"require_two_factor\":false,\"ip_restriction\":false,\"allowed_ips\":\"\",\"email_notifications\":true,\"system_alerts\":true,\"user_activity_logs\":true,\"backup_notifications\":true,\"loan_notifications\":true,\"payment_notifications\":true,\"system_maintenance_mode\":true,\"debug_mode\":true,\"log_level\":\"INFO\",\"backup_schedule\":\"daily\",\"data_retention\":\"7years\",\"max_file_upload_size_mb\":10,\"allowed_file_types\":\"pdf,doc,docx,xls,xlsx,csv\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-28 19:47:02'),
(61, 7, 'SYSTEM_CONFIG_UPDATE', NULL, NULL, NULL, '{\"system_name\":\"Microfinance Management System\",\"organization_name\":\"MSMS Organization\",\"admin_email\":\"admin@msms.com\",\"support_email\":\"support@msms.com\",\"timezone\":\"UTC+3\",\"date_format\":\"YYYY-MM-DD\",\"currency\":\"USD\",\"fiscal_year_start\":\"January\",\"session_timeout_minutes\":30,\"password_min_length\":8,\"password_expiry_days\":90,\"max_login_attempts\":5,\"lockout_duration_minutes\":15,\"require_two_factor\":false,\"ip_restriction\":false,\"allowed_ips\":\"\",\"email_notifications\":true,\"system_alerts\":true,\"user_activity_logs\":true,\"backup_notifications\":true,\"loan_notifications\":true,\"payment_notifications\":true,\"system_maintenance_mode\":true,\"debug_mode\":true,\"log_level\":\"INFO\",\"backup_schedule\":\"daily\",\"data_retention\":\"7years\",\"max_file_upload_size_mb\":10,\"allowed_file_types\":\"pdf,doc,docx,xls,xlsx,csv\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-28 19:50:59'),
(62, 7, 'SYSTEM_CONFIG_UPDATE', NULL, NULL, NULL, '{\"system_name\":\"Microfinance Management System\",\"organization_name\":\"MSMS Organization\",\"admin_email\":\"admin@msms.com\",\"support_email\":\"fthdrgt\",\"date_format\":\"YYYY-MM-DD\",\"session_timeout_minutes\":30,\"password_min_length\":8,\"password_expiry_days\":90,\"max_login_attempts\":5,\"lockout_duration_minutes\":15,\"require_two_factor\":false,\"ip_restriction\":false,\"allowed_ips\":\"\",\"email_notifications\":true,\"system_alerts\":true,\"user_activity_logs\":true,\"backup_notifications\":true,\"loan_notifications\":true,\"payment_notifications\":true,\"system_maintenance_mode\":true,\"debug_mode\":true,\"log_level\":\"INFO\",\"backup_schedule\":\"daily\",\"data_retention\":\"7years\",\"max_file_upload_size_mb\":10,\"allowed_file_types\":\"pdf,doc,docx,xls,xlsx,csv\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-28 20:01:06'),
(63, 7, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"ade@gmail.com\",\"attempts\":1}', 'ADMIN', '::1', '2026-04-30 17:30:19'),
(64, 7, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"ade@gmail.com\"}', 'ADMIN', '::1', '2026-04-30 17:30:26'),
(65, 7, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"ade@gmail.com\"}', 'ADMIN', '::1', '2026-04-30 17:37:37'),
(66, 7, 'SYSTEM_CONFIG_UPDATE', NULL, NULL, NULL, '{\"email_notifications\":false,\"system_alerts\":true,\"user_activity_logs\":true,\"backup_notifications\":true,\"loan_notifications\":false,\"payment_notifications\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-30 17:41:13'),
(67, 7, 'SYSTEM_CONFIG_UPDATE', NULL, NULL, NULL, '{\"email_notifications\":true,\"system_alerts\":true,\"user_activity_logs\":true,\"backup_notifications\":true,\"loan_notifications\":true,\"payment_notifications\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-30 17:41:14'),
(68, 7, 'PROFILE_UPDATED', 'users', 7, NULL, '{\"updated_fields\":[\"first_name\",\"last_name\",\"phone_number\",\"address\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-30 17:44:49'),
(69, 7, 'PROFILE_UPDATE', 'employee_profiles', NULL, NULL, '{\"first_name\":\"Bulaa\",\"last_name\":\"mula\",\"phone_number\":\"\",\"address\":\"sderserswerswer\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-30 17:44:49'),
(70, 7, 'HR_ADMIN_CREATED', NULL, NULL, NULL, '{\"first_name\":\"Abebe\",\"last_name\":\"Kebede\",\"email\":\"abebe@gmail.com\",\"phone_number\":\"+123456789\",\"password\":\"Ada@1234\",\"role\":\"HR_ADMIN\",\"department\":\"HR\",\"job_title\":\"HR Manager\",\"employee_id\":\"ADM06187\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-30 17:51:46'),
(71, 8, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"Abebe@gmail.com\"}', 'ADMIN', '::1', '2026-04-30 17:52:46'),
(72, 7, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"ade@gmail.com\",\"attempts\":1}', 'ADMIN', '::1', '2026-04-30 18:28:24'),
(73, 8, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"Abebe@gmail.com\"}', 'ADMIN', '::1', '2026-04-30 18:28:55'),
(74, 8, 'DASHBOARD_STATS_UPDATED', 'dashboard_stats', NULL, NULL, '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-30 18:33:14'),
(75, 8, 'DASHBOARD_STATS_UPDATED', NULL, NULL, NULL, '{\"totalEmployees\":3,\"activeEmployees\":3,\"terminatedRate\":0,\"employeeGrowthRate\":0,\"pendingApprovals\":2,\"lastUpdated\":\"2026-04-30T18:33:14.881Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-30 18:33:14'),
(76, 8, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"Abebe@gmail.com\"}', 'ADMIN', '::1', '2026-04-30 19:00:10'),
(77, 8, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"Abebe@gmail.com\",\"attempts\":1}', 'ADMIN', '::1', '2026-05-05 18:15:24'),
(78, 8, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"Abebe@gmail.com\",\"attempts\":2}', 'ADMIN', '::1', '2026-05-05 18:15:59'),
(79, 8, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"Abebe@gmail.com\",\"attempts\":3}', 'ADMIN', '::1', '2026-05-05 18:17:51'),
(80, 8, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"Abebe@gmail.com\",\"attempts\":4}', 'ADMIN', '::1', '2026-05-05 18:18:02'),
(81, 7, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"ade@gmail.com\",\"attempts\":2}', 'ADMIN', '::1', '2026-05-05 18:18:17'),
(82, 8, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"Abebe@gmail.com\",\"attempts\":5}', 'ADMIN', '::1', '2026-05-05 18:18:24'),
(83, 7, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"Ade@gmail.com\"}', 'ADMIN', '::1', '2026-05-05 18:26:10'),
(84, 7, 'HR_ADMIN_CREATED', NULL, NULL, NULL, '{\"first_name\":\"kassa\",\"last_name\":\"chala\",\"email\":\"chala@gmail.com\",\"phone_number\":\"+123456789\",\"password\":\"Ade@1234\",\"role\":\"HR_ADMIN\",\"department\":\"HR\",\"job_title\":\"HR Manager\",\"employee_id\":\"ADM20468\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 18:27:01'),
(85, 9, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"chala@gmail.com\"}', 'ADMIN', '::1', '2026-05-05 18:27:45'),
(86, 9, 'EMPLOYEE_CREATED', 'users', 10, NULL, '{\"employee_id\":\"EMP023\",\"username\":\"kibret@gmail.com\",\"email\":\"kibret@gmail.com\",\"role\":\"EMPLOYEE\",\"department\":\"Design\",\"job_grade\":\"Full-time\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 18:29:22'),
(87, 10, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"kibret@gmail.com\",\"attempts\":1}', 'ADMIN', '::1', '2026-05-05 18:31:27'),
(88, 10, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"kibret@gmail.com\",\"attempts\":2}', 'ADMIN', '::1', '2026-05-05 18:31:47'),
(89, 10, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"kibret@gmail.com\"}', 'ADMIN', '::1', '2026-05-05 18:32:36'),
(90, 10, 'PASSWORD_CHANGED', 'users', 10, NULL, '{\"password_change_required\":false,\"forced_change\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 18:32:57'),
(91, 10, 'PASSWORD_CHANGE', NULL, NULL, NULL, '{\"newPassword\":\"Adino@123\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 18:32:57'),
(92, 7, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"ade@gmail.com\"}', 'ADMIN', '::1', '2026-05-05 18:33:24'),
(93, 9, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"chala@gmail.com\"}', 'ADMIN', '::1', '2026-05-05 18:34:01'),
(94, 10, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"kibret@gmail.com\"}', 'ADMIN', '::1', '2026-05-05 18:34:22'),
(95, 10, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"kibret@gmail.com\"}', 'ADMIN', '::1', '2026-05-05 18:35:29'),
(96, 9, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"chala@gmail.com\"}', 'ADMIN', '::1', '2026-05-05 18:35:59'),
(97, 9, 'EMPLOYEE_CREATED', 'users', 11, NULL, '{\"employee_id\":\"EMP0034\",\"username\":\"dushu@gmail.com\",\"email\":\"dushu@gmail.com\",\"role\":\"EMPLOYEE\",\"department\":\"Legal\",\"job_grade\":\"Full-time\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 18:36:46'),
(98, 11, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"dushu@gmail.com\"}', 'ADMIN', '::1', '2026-05-05 18:37:13'),
(99, 11, 'PASSWORD_CHANGED', 'users', 11, NULL, '{\"password_change_required\":false,\"forced_change\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 18:37:27'),
(100, 11, 'PASSWORD_CHANGE', NULL, NULL, NULL, '{\"newPassword\":\"Adino@1234\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 18:37:27'),
(101, 11, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"dushu@gmail.com\"}', 'ADMIN', '::1', '2026-05-05 18:37:48'),
(102, 11, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"dushu@gmail.com\",\"attempts\":1}', 'ADMIN', '::1', '2026-05-05 18:38:01'),
(103, 11, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"dushu@gmail.com\"}', 'ADMIN', '::1', '2026-05-05 18:38:06'),
(104, 11, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"dushu@gmail.com\"}', 'ADMIN', '::1', '2026-05-05 18:40:58'),
(105, 11, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"dushu@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 18:46:05'),
(106, 11, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"dushu@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 18:48:41'),
(107, 7, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"ade@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 18:50:03'),
(108, 9, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"chala@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 18:50:23'),
(109, 7, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"ade@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 18:51:23'),
(110, 11, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"dushu@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 18:51:39'),
(111, 10, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"kibret@gmail.com\",\"attempts\":1}', 'EMPLOYEE', '::1', '2026-05-05 18:51:51'),
(112, 9, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"chala@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 18:52:04'),
(113, 9, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"chala@gmail.com\",\"attempts\":1}', 'EMPLOYEE', '::1', '2026-05-05 18:52:21'),
(114, 9, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"chala@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 18:52:28'),
(115, 9, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"chala@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 18:53:06'),
(116, 9, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"chala@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 18:53:17'),
(117, 9, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"chala@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 18:54:52'),
(118, 9, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"chala@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 18:55:44'),
(119, 9, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"chala@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 18:56:04'),
(120, 9, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"chala@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 18:57:26'),
(121, 9, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"chala@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 18:58:38'),
(122, 11, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"dushu@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 18:59:04'),
(123, 7, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"ade@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 18:59:15'),
(124, 9, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"chala@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 18:59:58'),
(125, 9, 'EMPLOYEE_CREATED', 'users', 12, NULL, '{\"employee_id\":\"EMP0112\",\"username\":\"gamma@gmail.com\",\"email\":\"gamma@gmail.com\",\"role\":\"EMPLOYEE\",\"department\":\"Engineering\",\"job_grade\":\"Full-time\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:00:54'),
(126, 12, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"gamma@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 19:01:23'),
(127, 12, 'PASSWORD_CHANGED', 'users', 12, NULL, '{\"password_change_required\":false,\"forced_change\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:01:40'),
(128, 12, 'PASSWORD_CHANGE', NULL, NULL, NULL, '{\"newPassword\":\"Adino@1234\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:01:41'),
(129, 11, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"dushu@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 19:14:56'),
(130, 9, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"chala@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 19:15:06'),
(131, 9, 'EMPLOYEE_CREATED', 'users', 13, NULL, '{\"employee_id\":\"EMP432\",\"username\":\"adinoaschlew@gmail.com\",\"email\":\"adinoaschlew@gmail.com\",\"role\":\"EMPLOYEE\",\"department\":\"Engineering\",\"job_grade\":\"Full-time\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:16:38'),
(132, 13, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', 'EMPLOYEE', '::1', '2026-05-05 19:17:15'),
(133, 13, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:20:01'),
(134, 13, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:23:46'),
(135, 13, 'PASSWORD_CHANGED', 'users', 13, NULL, '{\"password_change_required\":false,\"forced_change\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:24:14'),
(136, 13, 'PASSWORD_CHANGE', NULL, NULL, NULL, '{\"newPassword\":\"Ade@1234\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:24:14'),
(137, 9, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"chala@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:26:19'),
(138, 9, 'EMPLOYMENT_STATUS_UPDATE', 'employee_profiles', 13, NULL, '{\"old_status\":\"ACTIVE\",\"new_status\":\"TERMINATED\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:26:33'),
(139, 9, 'EMPLOYMENT_STATUS_UPDATE', NULL, 13, NULL, '{\"employment_status\":\"TERMINATED\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:26:33'),
(140, 9, 'EMPLOYMENT_STATUS_UPDATE', 'employee_profiles', 13, NULL, '{\"old_status\":\"TERMINATED\",\"new_status\":\"TERMINATED\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:27:09'),
(141, 9, 'EMPLOYMENT_STATUS_UPDATE', NULL, 13, NULL, '{\"employment_status\":\"TERMINATED\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:27:10'),
(142, 9, 'EMPLOYEE_CREATED', 'users', 14, NULL, '{\"employee_id\":\"EMP4545\",\"username\":\"adinoaschalew1995@gmail.com\",\"email\":\"adinoaschalew1995@gmail.com\",\"role\":\"EMPLOYEE\",\"department\":\"Engineering\",\"job_grade\":\"Full-time\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:29:22'),
(143, 9, 'EMPLOYMENT_STATUS_UPDATE', 'employee_profiles', 13, NULL, '{\"old_status\":\"TERMINATED\",\"new_status\":\"TERMINATED\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:29:46'),
(144, 9, 'EMPLOYMENT_STATUS_UPDATE', NULL, 13, NULL, '{\"employment_status\":\"TERMINATED\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:29:46'),
(145, 9, 'EMPLOYMENT_STATUS_UPDATE', 'employee_profiles', 13, NULL, '{\"old_status\":\"TERMINATED\",\"new_status\":\"TERMINATED\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:29:53'),
(146, 9, 'EMPLOYMENT_STATUS_UPDATE', NULL, 13, NULL, '{\"employment_status\":\"TERMINATED\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:29:53'),
(147, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:30:23'),
(148, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:32:10'),
(149, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:36:30'),
(150, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:36:42'),
(151, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:36:52'),
(152, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:37:01'),
(153, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:37:12'),
(154, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:43:29'),
(155, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:47:19'),
(156, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:47:29'),
(157, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:47:53'),
(158, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\",\"attempts\":1}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:49:20'),
(159, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:49:25'),
(160, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\",\"attempts\":1}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:49:46'),
(161, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\",\"attempts\":2}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:49:54'),
(162, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:50:12'),
(163, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:52:12'),
(164, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:52:16'),
(165, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:54:15'),
(166, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:54:24'),
(167, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:56:14'),
(168, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 19:59:38'),
(169, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 21:28:47'),
(170, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 21:33:08'),
(171, NULL, 'OTP_SEND_ERROR', 'otp_records', NULL, NULL, '{\"email\":\"test@example.com\",\"error\":\"Cannot read properties of undefined (reading \'checkRateLimit\')\"}', '::1', 'node', '2026-05-05 21:34:34'),
(172, NULL, 'OTP_VERIFY_ERROR', 'otp_records', NULL, NULL, '{\"email\":\"test@example.com\",\"error\":\"Cannot read properties of undefined (reading \'checkRateLimit\')\"}', '::1', 'node', '2026-05-05 21:34:34'),
(173, NULL, 'OTP_SEND_ERROR', 'otp_records', NULL, NULL, '{\"email\":\"test@example.com\",\"error\":\"Cannot read properties of undefined (reading \'checkRateLimit\')\"}', '::1', 'node', '2026-05-05 21:36:42'),
(174, NULL, 'OTP_VERIFY_ERROR', 'otp_records', NULL, NULL, '{\"email\":\"test@example.com\",\"error\":\"Cannot read properties of undefined (reading \'checkRateLimit\')\"}', '::1', 'node', '2026-05-05 21:36:43'),
(175, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-05 21:40:25'),
(176, NULL, 'OTP_SEND_ATTEMPT_INVALID_USER', 'otp_records', NULL, NULL, '{\"email\":\"test@example.com\"}', '::1', 'node', '2026-05-05 21:41:02'),
(177, NULL, 'OTP_VERIFY_FAILED', 'otp_records', NULL, NULL, '{\"email\":\"test@example.com\",\"reason\":\"No OTP found for this email. Please request a new one.\",\"remainingAttempts\":3}', '::1', 'node', '2026-05-05 21:41:02'),
(178, NULL, 'OTP_SEND_ERROR', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"error\":\"Failed to generate OTP\"}', '::1', 'node', '2026-05-05 21:42:21'),
(179, 5, 'LOGIN_COMPLETED', 'users', 5, NULL, '{\"email\":\"john.doe@msms.com\",\"email_verified\":true}', '::1', 'node', '2026-05-05 21:42:23'),
(180, 5, 'EMAIL_VERIFIED', 'users', 5, NULL, '{\"email\":\"john.doe@msms.com\"}', '::1', 'node', '2026-05-05 21:42:23'),
(181, NULL, 'OTP_SEND_ERROR', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"error\":\"Failed to generate OTP\"}', '::1', 'node', '2026-05-05 21:48:12'),
(182, 5, 'LOGIN_COMPLETED', 'users', 5, NULL, '{\"email\":\"john.doe@msms.com\",\"email_verified\":true}', '::1', 'node', '2026-05-05 21:48:12'),
(183, 5, 'EMAIL_VERIFIED', 'users', 5, NULL, '{\"email\":\"john.doe@msms.com\"}', '::1', 'node', '2026-05-05 21:48:12'),
(184, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 17:53:07'),
(185, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 17:53:47'),
(186, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 17:58:13'),
(187, NULL, 'OTP_SEND_ERROR', 'otp_records', NULL, NULL, '{\"email\":\"adinoaschalew1995@gmail.com\",\"error\":\"Failed to generate OTP\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 17:58:14'),
(188, NULL, 'OTP_SEND_ERROR', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"error\":\"Failed to generate OTP\"}', '::1', NULL, '2026-05-06 17:59:57'),
(189, NULL, 'OTP_SEND_ERROR', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"error\":\"Failed to generate OTP\"}', '::1', NULL, '2026-05-06 18:00:27'),
(190, NULL, 'OTP_SEND_ERROR', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"error\":\"Failed to generate OTP\"}', '::1', NULL, '2026-05-06 18:01:40'),
(191, NULL, 'OTP_SEND_ERROR', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"error\":\"Failed to generate OTP\"}', '::1', NULL, '2026-05-06 18:01:52'),
(192, NULL, 'OTP_SEND_ERROR', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"error\":\"Failed to generate OTP\"}', '::1', NULL, '2026-05-06 18:02:38'),
(193, NULL, 'OTP_SEND_ERROR', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"error\":\"Failed to generate OTP\"}', '::1', NULL, '2026-05-06 18:03:25'),
(194, 5, 'OTP_SENT', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"loginContext\":{\"ipAddress\":\"::1\"}}', '::1', NULL, '2026-05-06 18:07:45'),
(195, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 18:08:32'),
(196, NULL, 'OTP_SENT', 'otp_records', NULL, NULL, '{\"email\":\"adinoaschalew1995@gmail.com\",\"loginContext\":{\"ipAddress\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 18:08:34'),
(197, NULL, 'OTP_RESENT', 'otp_records', NULL, NULL, '{\"email\":\"adinoaschalew1995@gmail.com\",\"loginContext\":{\"ipAddress\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 18:09:48'),
(198, 5, 'LOGIN_COMPLETED', 'users', 5, NULL, '{\"email\":\"john.doe@msms.com\",\"email_verified\":true}', '::1', NULL, '2026-05-06 18:11:47'),
(199, 5, 'EMAIL_VERIFIED', 'users', 5, NULL, '{\"email\":\"john.doe@msms.com\"}', '::1', NULL, '2026-05-06 18:11:47'),
(200, 5, 'OTP_SENT', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"loginContext\":{\"ipAddress\":\"::1\"}}', '::1', NULL, '2026-05-06 18:11:51'),
(201, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 18:12:49'),
(202, NULL, 'OTP_SENT', 'otp_records', NULL, NULL, '{\"email\":\"adinoaschalew1995@gmail.com\",\"loginContext\":{\"ipAddress\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 18:12:51'),
(203, NULL, 'OTP_VERIFY_ERROR', 'otp_records', NULL, NULL, '{\"email\":\"adinoaschalew1995@gmail.com\",\"error\":\"OTPService.verifyOTPCode is not a function\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 18:14:22'),
(204, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 18:14:46'),
(205, NULL, 'OTP_SENT', 'otp_records', NULL, NULL, '{\"email\":\"adinoaschalew1995@gmail.com\",\"loginContext\":{\"ipAddress\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 18:14:48'),
(206, NULL, 'OTP_VERIFY_ERROR', 'otp_records', NULL, NULL, '{\"email\":\"adinoaschalew1995@gmail.com\",\"error\":\"OTPService.verifyOTPCode is not a function\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 18:15:12'),
(207, 5, 'OTP_SENT', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"loginContext\":{\"ipAddress\":\"::1\"}}', '::1', NULL, '2026-05-06 18:15:40'),
(208, NULL, 'OTP_VERIFY_ERROR', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"error\":\"OTPService.verifyOTPCode is not a function\"}', '::1', NULL, '2026-05-06 18:15:40'),
(209, NULL, 'OTP_VERIFY_ERROR', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"error\":\"OTPService.verifyOTPCode is not a function\"}', '::1', NULL, '2026-05-06 18:15:40'),
(210, NULL, 'OTP_VERIFY_ERROR', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"error\":\"OTPService.verifyOTPCode is not a function\"}', '::1', NULL, '2026-05-06 18:15:40'),
(211, 5, 'OTP_SENT', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"loginContext\":{\"ipAddress\":\"::1\"}}', '::1', NULL, '2026-05-06 18:16:01'),
(212, NULL, 'OTP_VERIFY_FAILED', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"reason\":\"No OTP found for this email. Please request a new one.\",\"remainingAttempts\":3}', '::1', NULL, '2026-05-06 18:16:01'),
(213, NULL, 'OTP_VERIFY_FAILED', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"reason\":\"No OTP found for this email. Please request a new one.\",\"remainingAttempts\":3}', '::1', NULL, '2026-05-06 18:16:01'),
(214, NULL, 'OTP_VERIFY_FAILED', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"reason\":\"No OTP found for this email. Please request a new one.\",\"remainingAttempts\":3}', '::1', NULL, '2026-05-06 18:16:02'),
(215, 5, 'OTP_SENT', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"loginContext\":{\"ipAddress\":\"::1\"}}', '::1', NULL, '2026-05-06 18:16:53'),
(216, NULL, 'OTP_VERIFY_FAILED', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"reason\":\"Invalid OTP. 2 attempts remaining.\",\"remainingAttempts\":2}', '::1', NULL, '2026-05-06 18:16:53'),
(217, NULL, 'OTP_VERIFY_FAILED', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"reason\":\"No OTP found for this email. Please request a new one.\",\"remainingAttempts\":3}', '::1', NULL, '2026-05-06 18:16:53'),
(218, NULL, 'OTP_VERIFY_FAILED', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"reason\":\"No OTP found for this email. Please request a new one.\",\"remainingAttempts\":3}', '::1', NULL, '2026-05-06 18:16:54'),
(219, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 18:17:14'),
(220, NULL, 'OTP_SENT', 'otp_records', NULL, NULL, '{\"email\":\"adinoaschalew1995@gmail.com\",\"loginContext\":{\"ipAddress\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 18:17:17'),
(221, NULL, 'OTP_VERIFY_FAILED', 'otp_records', NULL, NULL, '{\"email\":\"adinoaschalew1995@gmail.com\",\"reason\":\"No OTP found for this email. Please request a new one.\",\"remainingAttempts\":3}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 18:17:33'),
(222, 5, 'OTP_SENT', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"loginContext\":{\"ipAddress\":\"::1\"}}', '::1', NULL, '2026-05-06 18:18:29'),
(223, NULL, 'OTP_VERIFY_FAILED', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"reason\":\"Invalid OTP. 2 attempts remaining.\",\"remainingAttempts\":2}', '::1', NULL, '2026-05-06 18:18:30'),
(224, 5, 'OTP_SENT', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"loginContext\":{\"ipAddress\":\"::1\"}}', '::1', NULL, '2026-05-06 18:19:00'),
(225, NULL, 'OTP_VERIFY_FAILED', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\",\"reason\":\"Invalid OTP. 2 attempts remaining.\",\"remainingAttempts\":2}', '::1', NULL, '2026-05-06 18:19:01'),
(226, NULL, 'OTP_VERIFIED', 'otp_records', NULL, NULL, '{\"email\":\"john.doe@msms.com\"}', '::1', NULL, '2026-05-06 18:19:38'),
(227, NULL, 'OTP_RESENT', 'otp_records', NULL, NULL, '{\"email\":\"adinoaschalew1995@gmail.com\",\"loginContext\":{\"ipAddress\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 18:19:47'),
(228, NULL, 'OTP_VERIFIED', 'otp_records', NULL, NULL, '{\"email\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 18:20:18'),
(229, NULL, 'LOGIN_COMPLETED', 'users', 14, NULL, '{\"email\":\"adinoaschalew1995@gmail.com\",\"email_verified\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 18:20:19'),
(230, NULL, 'EMAIL_VERIFIED', 'users', 14, NULL, '{\"email\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 18:20:19'),
(231, NULL, 'PASSWORD_CHANGED', 'users', 14, NULL, '{\"password_change_required\":false,\"forced_change\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 18:20:48'),
(232, NULL, 'PASSWORD_CHANGE', NULL, NULL, NULL, '{\"newPassword\":\"Adino@1234\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 18:20:48'),
(233, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 18:21:58'),
(234, 11, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"dushu@gmail.com\",\"attempts\":1}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 19:04:11'),
(235, 11, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"dushu@gmail.com\",\"attempts\":2}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 19:04:22'),
(236, 11, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"dushu@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 19:04:29'),
(237, 11, 'PASSWORD_CHANGED', 'users', 11, NULL, '{\"password_change_required\":false,\"forced_change\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 19:04:47'),
(238, 11, 'PASSWORD_CHANGE', NULL, NULL, NULL, '{\"newPassword\":\"Adino@1234\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 19:04:48'),
(239, 11, 'SAVINGS_ACCOUNT_CREATE', 'savings_accounts', 2, NULL, '{\"saving_percentage\":15}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 19:17:55'),
(240, 11, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"dushu@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 19:36:46');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `table_name`, `record_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`) VALUES
(241, 11, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"dushu@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 20:11:12'),
(242, 11, 'REQUEST_CREATED', 'savings_requests', 1, NULL, '{\"old_value\":\"15.00\",\"new_value\":25,\"savings_type\":\"PERCENTAGE\"}', NULL, NULL, '2026-05-06 20:11:59'),
(243, 11, 'REQUEST_SUBMITTED', 'savings_requests', 1, NULL, '{\"new_value\":\"25\",\"savings_type\":\"PERCENTAGE\",\"effective_date\":\"2026-05-30\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 20:11:59'),
(244, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 20:30:48'),
(245, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 20:30:54'),
(246, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 20:30:56'),
(247, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 20:30:57'),
(248, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 20:31:09'),
(249, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 20:31:18'),
(250, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 20:31:25'),
(251, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 20:31:26'),
(252, NULL, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"adinoaschalew1995@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-06 20:31:40'),
(253, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 18:30:50'),
(254, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 18:30:57'),
(255, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 18:31:11'),
(256, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 18:31:13'),
(257, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 18:31:22'),
(258, NULL, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"adinoaschlew@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 18:31:24'),
(259, 8, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"abebe@gmail.com\",\"attempts\":6}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 18:32:12'),
(260, 7, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"ade@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 18:33:15'),
(261, 7, 'HR_ADMIN_CREATED', NULL, NULL, NULL, '{\"first_name\":\"girma\",\"last_name\":\"hibret\",\"email\":\"hibret@gmail.com\",\"phone_number\":\"+652347236\",\"password\":\"Ade@1234\",\"role\":\"HR_ADMIN\",\"department\":\"HR\",\"job_title\":\"HR Manager\",\"employee_id\":\"ADM82549\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 18:51:23'),
(262, 7, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"ade@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 19:08:25'),
(263, 7, 'LOGIN_FAILED', 'users', NULL, NULL, '{\"identifier\":\"ade@gmail.com\",\"attempts\":1}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 19:20:02'),
(264, 7, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"ade@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 19:20:05'),
(265, 7, 'FINANCE_ADMIN_CREATED', NULL, NULL, NULL, '{\"first_name\":\"awe \",\"last_name\":\"xdfv\",\"email\":\"df@zsdf.f\",\"phone_number\":\"+652347236\",\"password\":\"Ade@1234\",\"role\":\"FINANCE_ADMIN\",\"department\":\"Finance\",\"job_title\":\"Finance Manager\",\"employee_id\":\"ADM45670\",\"group\":\"FINANCE\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 19:20:46'),
(266, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 19:22:15'),
(267, 7, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"ade@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 19:27:00'),
(268, 7, 'TOKEN_REFRESH', 'users', 7, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 20:07:07'),
(269, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 20:11:28'),
(270, 15, 'SETTINGS_UPDATED', 'user_preferences', NULL, NULL, '{\"category\":\"personal\",\"settings\":[\"theme\",\"emailNotifications\",\"pushNotifications\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 20:22:13'),
(271, 15, 'SETTINGS_UPDATED', 'user_preferences', NULL, NULL, '{\"category\":\"personal\",\"settings\":[\"theme\",\"emailNotifications\",\"pushNotifications\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 20:22:15'),
(272, 15, 'DASHBOARD_STATS_UPDATED', 'dashboard_stats', NULL, NULL, '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 20:28:06'),
(273, 15, 'DASHBOARD_STATS_UPDATED', NULL, NULL, NULL, '{\"lastUpdated\":\"2026-05-12T20:28:06.449Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 20:28:06'),
(274, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 20:33:39'),
(275, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 20:39:02'),
(276, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 20:41:13'),
(277, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 20:41:29'),
(278, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 20:41:53'),
(279, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 20:45:21'),
(280, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 20:46:03'),
(281, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 20:47:24'),
(282, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 20:49:00'),
(283, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 20:51:19'),
(284, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 20:55:13'),
(285, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 20:56:02'),
(286, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 20:57:30'),
(287, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 20:58:56'),
(288, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 21:03:01'),
(289, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 21:04:19'),
(290, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 21:05:53'),
(291, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 21:07:07'),
(292, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 21:08:15'),
(293, 15, 'TOKEN_REFRESH', 'users', 15, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 22:14:33'),
(294, 15, 'TOKEN_REFRESH', 'users', 15, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 22:14:33'),
(295, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 22:15:53'),
(296, 15, 'LOGIN_SUCCESS', 'users', NULL, NULL, '{\"identifier\":\"hibret@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 22:22:31'),
(297, 15, 'DASHBOARD_STATS_UPDATED', 'dashboard_stats', NULL, NULL, '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 22:41:56'),
(298, 15, 'DASHBOARD_STATS_UPDATED', NULL, NULL, NULL, '{\"totalEmployees\":9,\"activeEmployees\":8,\"terminatedRate\":0,\"employeeGrowthRate\":0,\"pendingApprovals\":8,\"lastUpdated\":\"2026-05-12T22:41:54.362Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-12 22:41:56');

-- --------------------------------------------------------

--
-- Table structure for table `employee_profiles`
--

CREATE TABLE `employee_profiles` (
  `profile_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `grandfather_name` varchar(100) DEFAULT NULL,
  `department` varchar(100) NOT NULL,
  `job_grade` varchar(50) NOT NULL,
  `job_title` varchar(100) DEFAULT NULL,
  `job_role` varchar(100) DEFAULT NULL,
  `salary` decimal(15,2) NOT NULL,
  `employment_status` enum('ACTIVE','INACTIVE','TERMINATED') NOT NULL DEFAULT 'ACTIVE',
  `status` enum('active','inactive') DEFAULT 'active',
  `hire_date` date NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `profile_picture` longtext DEFAULT NULL,
  `committee_level` int(11) DEFAULT 1,
  `max_loan_amount` decimal(15,2) DEFAULT 100000.00,
  `hr_verified` tinyint(1) DEFAULT 0,
  `hr_verification_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_profiles`
--

INSERT INTO `employee_profiles` (`profile_id`, `user_id`, `employee_id`, `first_name`, `last_name`, `grandfather_name`, `department`, `job_grade`, `job_title`, `job_role`, `salary`, `employment_status`, `status`, `hire_date`, `phone`, `phone_number`, `address`, `profile_picture`, `committee_level`, `max_loan_amount`, `hr_verified`, `hr_verification_date`, `created_at`, `updated_at`) VALUES
(5, 5, 'EMP001', 'John', 'Doe', 'Robert', 'Engineering', 'SENIOR_DEVELOPER', 'Software Developer', 'Backend Developer', 45000.00, 'ACTIVE', 'active', '2024-01-15', '+251910000005', '+251910000005', '123 Main St', NULL, 1, 100000.00, 1, '2026-04-06 16:50:48', '2026-04-06 16:50:48', '2026-04-06 16:50:48'),
(7, 7, 'ADMIN002', 'Bulaa', 'mula', NULL, 'IT', 'A1', NULL, NULL, 0.00, 'ACTIVE', 'active', '2026-04-28', NULL, '', 'sderserswerswer', NULL, 1, 100000.00, 0, NULL, '2026-04-28 18:26:42', '2026-04-30 17:44:49'),
(8, 8, 'ADM06187', 'Abebe', 'Kebede', NULL, 'HR', 'GRADE_1', 'HR Manager', NULL, 0.00, 'ACTIVE', 'active', '2026-04-30', NULL, '+123456789', NULL, NULL, 1, 100000.00, 0, NULL, '2026-04-30 17:51:46', '2026-04-30 17:51:46'),
(9, 9, 'ADM20468', 'kassa', 'chala', NULL, 'HR', 'GRADE_1', 'HR Manager', NULL, 0.00, 'ACTIVE', 'active', '2026-05-05', NULL, '+123456789', NULL, NULL, 1, 100000.00, 0, NULL, '2026-05-05 18:27:01', '2026-05-05 18:27:01'),
(10, 10, 'EMP023', 'jass', 'mulyu', 'kkiki', 'Design', 'Full-time', NULL, 'product desingn', 45000.00, 'ACTIVE', 'active', '2026-05-05', '+12343546556', NULL, 'rklt', NULL, 1, 100000.00, 0, NULL, '2026-05-05 18:29:22', '2026-05-05 18:29:22'),
(11, 11, 'EMP0034', 'kucha', 'mula', 'dushu', 'Legal', 'Full-time', NULL, 'dfggg', 230000.00, 'ACTIVE', 'active', '2026-05-05', '+234345', NULL, 'eerg', NULL, 1, 100000.00, 0, NULL, '2026-05-05 18:36:46', '2026-05-05 18:36:46'),
(12, 12, 'EMP0112', 'birhan', 'tiru', 'gomma', 'Engineering', 'Full-time', NULL, 'kjdh ehjfkj', 34000.00, 'ACTIVE', 'active', '2026-05-05', '+87243698', NULL, 'kjefh', NULL, 1, 100000.00, 0, NULL, '2026-05-05 19:00:54', '2026-05-05 19:00:54'),
(13, 13, 'EMP432', 'ABABA', 'KARA', 'TSEW', 'Engineering', 'Full-time', NULL, 'gouttt', 45550.00, 'TERMINATED', 'active', '2026-05-05', '+12356789', NULL, 'esf efrsedf', NULL, 1, 100000.00, 0, NULL, '2026-05-05 19:16:38', '2026-05-05 19:29:53'),
(15, 15, 'ADM82549', 'girma', 'hibret', NULL, 'HR', 'GRADE_1', 'HR Manager', NULL, 0.00, 'ACTIVE', 'active', '2026-05-12', NULL, '+652347236', NULL, NULL, 1, 100000.00, 0, NULL, '2026-05-12 18:51:23', '2026-05-12 18:51:23');

-- --------------------------------------------------------

--
-- Table structure for table `generated_reports`
--

CREATE TABLE `generated_reports` (
  `id` int(11) NOT NULL,
  `report_name` varchar(200) NOT NULL,
  `report_type` enum('OPERATIONAL','FINANCIAL','AUDIT','FORECAST_COMPARISON') NOT NULL,
  `generated_by` int(11) NOT NULL,
  `filters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`filters`)),
  `file_path` varchar(500) NOT NULL,
  `file_format` enum('PDF','CSV','EXCEL') NOT NULL,
  `generation_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `parameters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parameters`)),
  `record_count` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `generated_reports`
--

INSERT INTO `generated_reports` (`id`, `report_name`, `report_type`, `generated_by`, `filters`, `file_path`, `file_format`, `generation_date`, `parameters`, `record_count`) VALUES
(1, 'loan_portfolio_report_2026-04-28', 'FINANCIAL', 7, '{}', '/reports/loan_portfolio_1777407529298.json', 'CSV', '2026-04-28 20:18:49', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `guarantors`
--

CREATE TABLE `guarantors` (
  `id` int(11) NOT NULL,
  `loan_application_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `guarantor_type` enum('INTERNAL','EXTERNAL') NOT NULL,
  `guarantor_name` varchar(200) NOT NULL,
  `guarantor_id` varchar(100) NOT NULL,
  `relationship` varchar(100) NOT NULL,
  `monthly_income` decimal(15,2) NOT NULL,
  `contact_phone` varchar(20) NOT NULL,
  `contact_email` varchar(150) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `id_document_path` varchar(500) DEFAULT NULL,
  `income_proof_path` varchar(500) DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 0,
  `approved_by` int(11) DEFAULT NULL,
  `approval_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loans`
--

CREATE TABLE `loans` (
  `id` int(11) NOT NULL,
  `loan_application_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `principal_amount` decimal(15,2) NOT NULL,
  `loan_amount` decimal(15,2) NOT NULL,
  `interest_rate` decimal(5,2) DEFAULT 11.00,
  `total_interest` decimal(15,2) NOT NULL,
  `total_repayment` decimal(15,2) NOT NULL,
  `monthly_repayment` decimal(15,2) NOT NULL,
  `monthly_deduction` decimal(15,2) NOT NULL,
  `duration_months` int(11) NOT NULL,
  `remaining_balance` decimal(15,2) NOT NULL,
  `outstanding_balance` decimal(15,2) NOT NULL,
  `paid_amount` decimal(15,2) DEFAULT 0.00,
  `interest_paid` decimal(15,2) DEFAULT 0.00,
  `status` enum('ACTIVE','COMPLETED','DEFAULTED','SUSPENDED') DEFAULT 'ACTIVE',
  `start_date` date DEFAULT NULL,
  `disbursement_date` timestamp NULL DEFAULT NULL,
  `maturity_date` date DEFAULT NULL,
  `application_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loan_applications`
--

CREATE TABLE `loan_applications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `requested_amount` decimal(15,2) NOT NULL,
  `purpose` text NOT NULL,
  `loan_type` varchar(50) DEFAULT 'Personal',
  `repayment_duration_months` int(11) NOT NULL CHECK (`repayment_duration_months` >= 6 and `repayment_duration_months` <= 60),
  `monthly_income` decimal(15,2) NOT NULL,
  `status` enum('PENDING','UNDER_REVIEW','APPROVED','REJECTED','DISBURSED','COMPLETED') DEFAULT 'PENDING',
  `reviewed_by` int(11) DEFAULT NULL,
  `review_date` timestamp NULL DEFAULT NULL,
  `review_comments` text DEFAULT NULL,
  `approved_amount` decimal(15,2) DEFAULT NULL,
  `approved_term_months` int(11) DEFAULT NULL,
  `approval_document_path` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loan_repayments`
--

CREATE TABLE `loan_repayments` (
  `id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `principal_amount` decimal(15,2) NOT NULL,
  `interest_amount` decimal(15,2) NOT NULL,
  `balance_before` decimal(15,2) NOT NULL,
  `balance_after` decimal(15,2) NOT NULL,
  `due_date` date DEFAULT NULL,
  `status` enum('PENDING','PAID','OVERDUE') DEFAULT 'PENDING',
  `repayment_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `reference_id` varchar(100) DEFAULT NULL,
  `payroll_batch_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loan_transactions`
--

CREATE TABLE `loan_transactions` (
  `id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `transaction_type` enum('PAYMENT','REPAYMENT','PENALTY','FEE','DISBURSEMENT') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `principal_amount` decimal(15,2) DEFAULT 0.00,
  `interest_amount` decimal(15,2) DEFAULT 0.00,
  `penalty_amount` decimal(15,2) DEFAULT 0.00,
  `balance_after_transaction` decimal(15,2) NOT NULL,
  `transaction_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `payment_method` varchar(50) DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('PENDING','COMPLETED','FAILED','CANCELLED') DEFAULT 'COMPLETED',
  `processed_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `notification_type` enum('INFO','SUCCESS','WARNING','ERROR') DEFAULT 'INFO',
  `is_read` tinyint(1) DEFAULT 0,
  `reference_id` varchar(100) DEFAULT NULL,
  `link` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `notification_type`, `is_read`, `reference_id`, `link`, `created_at`, `read_at`) VALUES
(1, 7, 'New Finance Admin Added', 'You have successfully added awe  xdfv (ADM45670) as a new Finance Admin.', 'SUCCESS', 0, 'ADM45670', NULL, '2026-05-12 19:20:46', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `otp_records`
--

CREATE TABLE `otp_records` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `hashed_code` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `attempts` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores OTP codes for email verification with security features';

-- --------------------------------------------------------

--
-- Table structure for table `payroll_batches`
--

CREATE TABLE `payroll_batches` (
  `id` int(11) NOT NULL,
  `batch_name` varchar(200) NOT NULL,
  `upload_user_id` int(11) NOT NULL,
  `total_employees` int(11) NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `payroll_date` date NOT NULL,
  `status` enum('UPLOADED','VALIDATED','CONFIRMED','PROCESSED','REVERSED') DEFAULT 'UPLOADED',
  `file_path` varchar(500) NOT NULL,
  `cloudinary_url` varchar(500) DEFAULT NULL,
  `public_id` varchar(255) DEFAULT NULL,
  `validation_errors` text DEFAULT NULL,
  `payroll_month` int(11) DEFAULT NULL,
  `payroll_year` int(11) DEFAULT NULL,
  `confirmed_by` int(11) DEFAULT NULL,
  `confirmed_date` timestamp NULL DEFAULT NULL,
  `processed_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll_details`
--

CREATE TABLE `payroll_details` (
  `id` int(11) NOT NULL,
  `payroll_batch_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `gross_salary` decimal(15,2) NOT NULL,
  `net_salary` decimal(15,2) NOT NULL,
  `savings_deduction` decimal(15,2) DEFAULT 0.00,
  `loan_repayment_deduction` decimal(15,2) DEFAULT 0.00,
  `total_deductions` decimal(15,2) DEFAULT 0.00,
  `final_amount` decimal(15,2) NOT NULL,
  `payment_status` enum('PENDING','PAID','FAILED') DEFAULT 'PENDING',
  `payment_date` timestamp NULL DEFAULT NULL,
  `payment_reference` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `penalties`
--

CREATE TABLE `penalties` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `penalty_type` enum('MISSED_SAVINGS','LOAN_DEFAULT','LATE_PAYMENT') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `reason` text NOT NULL,
  `reference_id` varchar(100) DEFAULT NULL,
  `status` enum('ACTIVE','PAID','WAIVED') DEFAULT 'ACTIVE',
  `due_date` date NOT NULL,
  `paid_date` timestamp NULL DEFAULT NULL,
  `paid_amount` decimal(15,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `performance_reviews`
--

CREATE TABLE `performance_reviews` (
  `id` int(11) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `reviewer_id` int(11) DEFAULT NULL,
  `review_type` enum('monthly','quarterly','annual') NOT NULL DEFAULT 'monthly',
  `review_date` date NOT NULL,
  `next_review_date` date DEFAULT NULL,
  `status` enum('pending','in_progress','completed','overdue') NOT NULL DEFAULT 'pending',
  `score` decimal(5,2) DEFAULT NULL,
  `ratings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ratings`)),
  `goals` text DEFAULT NULL,
  `achievements` text DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `manager_comments` text DEFAULT NULL,
  `employee_comments` text DEFAULT NULL,
  `action_items` text DEFAULT NULL,
  `overall_rating` enum('excellent','good','satisfactory','needs_improvement','unsatisfactory') DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `performance_reviews`
--

INSERT INTO `performance_reviews` (`id`, `employee_id`, `reviewer_id`, `review_type`, `review_date`, `next_review_date`, `status`, `score`, `ratings`, `goals`, `achievements`, `feedback`, `manager_comments`, `employee_comments`, `action_items`, `overall_rating`, `is_active`, `created_at`, `updated_at`) VALUES
(2, 'EMP001', NULL, 'quarterly', '2026-03-06', '2026-06-06', 'completed', 85.50, NULL, NULL, NULL, 'Employee shows consistent performance and meets expectations.', NULL, NULL, NULL, 'good', 1, '2026-04-06 16:51:27', '2026-04-06 16:51:27');

-- --------------------------------------------------------

--
-- Table structure for table `savings_accounts`
--

CREATE TABLE `savings_accounts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `savings_type` enum('PERCENTAGE','FIXED_AMOUNT') DEFAULT 'PERCENTAGE',
  `saving_percentage` decimal(5,2) DEFAULT 15.00 CHECK (`saving_percentage` >= 15 and `saving_percentage` <= 65),
  `fixed_amount` decimal(15,2) DEFAULT 0.00,
  `current_balance` decimal(15,2) DEFAULT 0.00,
  `total_contributions` decimal(15,2) DEFAULT 0.00,
  `interest_earned` decimal(15,2) DEFAULT 0.00,
  `account_status` enum('ACTIVE','FROZEN','CLOSED') DEFAULT 'ACTIVE',
  `is_active` tinyint(1) DEFAULT 1,
  `is_frozen` tinyint(1) DEFAULT 0,
  `is_paused` tinyint(1) DEFAULT 0,
  `current_version_id` int(11) DEFAULT NULL,
  `lock_period_end_date` date DEFAULT NULL,
  `last_contribution_date` timestamp NULL DEFAULT NULL,
  `last_request_date` date DEFAULT NULL,
  `total_requests_count` int(11) DEFAULT 0,
  `approved_requests_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `savings_accounts`
--

INSERT INTO `savings_accounts` (`id`, `user_id`, `employee_id`, `savings_type`, `saving_percentage`, `fixed_amount`, `current_balance`, `total_contributions`, `interest_earned`, `account_status`, `is_active`, `is_frozen`, `is_paused`, `current_version_id`, `lock_period_end_date`, `last_contribution_date`, `last_request_date`, `total_requests_count`, `approved_requests_count`, `created_at`, `updated_at`) VALUES
(1, 5, 'EMP001', 'PERCENTAGE', 15.00, 0.00, 5000.00, 5000.00, 0.00, 'ACTIVE', 1, 0, 0, 1, NULL, NULL, NULL, 0, 0, '2026-04-06 16:50:49', '2026-04-06 16:50:49'),
(2, 11, 'EMP0034', 'PERCENTAGE', 15.00, 0.00, 0.00, 0.00, 0.00, 'ACTIVE', 1, 0, 0, 2, NULL, NULL, '2026-05-06', 1, 0, '2026-05-06 19:17:54', '2026-05-06 20:11:59');

-- --------------------------------------------------------

--
-- Table structure for table `savings_configuration`
--

CREATE TABLE `savings_configuration` (
  `id` int(11) NOT NULL,
  `config_key` varchar(100) NOT NULL,
  `config_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`config_value`)),
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `savings_configuration`
--

INSERT INTO `savings_configuration` (`id`, `config_key`, `config_value`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'min_savings_percentage', '{\"value\": 15}', 'Minimum percentage allowed for payroll deduction', 1, '2026-04-06 16:50:49', '2026-04-06 16:50:49'),
(2, 'max_savings_percentage', '{\"value\": 65}', 'Maximum percentage allowed for payroll deduction', 1, '2026-04-06 16:50:49', '2026-04-06 16:50:49'),
(3, 'max_total_deduction_ratio', '{\"value\": 50}', 'Maximum total deduction ratio (loans + savings) allowed', 1, '2026-04-06 16:50:49', '2026-04-06 16:50:49'),
(4, 'min_net_salary_threshold', '{\"value\": 2000}', 'Minimum net salary threshold that must be maintained after all deductions', 1, '2026-04-06 16:50:49', '2026-04-06 16:50:49');

-- --------------------------------------------------------

--
-- Table structure for table `savings_requests`
--

CREATE TABLE `savings_requests` (
  `id` int(11) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `request_type` varchar(50) NOT NULL,
  `old_value` decimal(15,2) NOT NULL,
  `new_value` decimal(15,2) NOT NULL,
  `savings_type` enum('PERCENTAGE','FIXED_AMOUNT') NOT NULL,
  `effective_date` date NOT NULL,
  `requested_effective_date` date NOT NULL,
  `status` enum('PENDING','UNDER_REVIEW','APPROVED','REJECTED','CANCELLED','APPLIED') DEFAULT 'PENDING',
  `workflow_stage` varchar(50) DEFAULT 'SUBMITTED',
  `salary_snapshot` decimal(15,2) DEFAULT NULL,
  `loan_deductions_snapshot` decimal(15,2) DEFAULT NULL,
  `current_deduction_ratio` decimal(5,2) DEFAULT NULL,
  `projected_deduction_ratio` decimal(5,2) DEFAULT NULL,
  `simulation_result` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`simulation_result`)),
  `reason` text DEFAULT NULL,
  `urgency_level` enum('NORMAL','URGENT','CRITICAL') DEFAULT 'NORMAL',
  `submitted_by` int(11) NOT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `final_approved_by` int(11) DEFAULT NULL,
  `final_approved_at` timestamp NULL DEFAULT NULL,
  `final_approval_comments` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `savings_requests`
--

INSERT INTO `savings_requests` (`id`, `employee_id`, `user_id`, `request_type`, `old_value`, `new_value`, `savings_type`, `effective_date`, `requested_effective_date`, `status`, `workflow_stage`, `salary_snapshot`, `loan_deductions_snapshot`, `current_deduction_ratio`, `projected_deduction_ratio`, `simulation_result`, `reason`, `urgency_level`, `submitted_by`, `submitted_at`, `updated_at`, `final_approved_by`, `final_approved_at`, `final_approval_comments`) VALUES
(1, 'EMP0034', 11, 'PERCENTAGE_CHANGE', 15.00, 25.00, 'PERCENTAGE', '2026-05-30', '2026-05-30', 'PENDING', 'SUBMITTED', 230000.00, 0.00, 15.00, 25.00, '{\"current\":{\"value\":\"15.00\",\"type\":\"PERCENTAGE\",\"deduction\":34500,\"netSalary\":195500,\"deductionRatio\":15},\"proposed\":{\"value\":25,\"type\":\"PERCENTAGE\",\"deduction\":57500,\"netSalary\":172500,\"deductionRatio\":25},\"impact\":{\"monthlyDifference\":23000,\"annualDifference\":276000,\"projectedAnnualSavings\":690000},\"validation\":{\"isValid\":true,\"violations\":[]},\"effectiveDate\":\"2026-05-30\",\"canSubmit\":true}', 'awewe qweawe qweaw q2EAQWE', 'NORMAL', 11, '2026-05-06 20:11:59', '2026-05-06 20:11:59', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `savings_transactions`
--

CREATE TABLE `savings_transactions` (
  `id` int(11) NOT NULL,
  `savings_account_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `transaction_type` enum('CONTRIBUTION','INTEREST','PENALTY','WITHDRAWAL') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `balance_before` decimal(15,2) NOT NULL,
  `balance_after` decimal(15,2) NOT NULL,
  `reference_id` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `transaction_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `payroll_batch_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `savings_transactions`
--

INSERT INTO `savings_transactions` (`id`, `savings_account_id`, `user_id`, `transaction_type`, `amount`, `balance_before`, `balance_after`, `reference_id`, `description`, `transaction_date`, `payroll_batch_id`) VALUES
(1, 1, 5, 'CONTRIBUTION', 5000.00, 0.00, 5000.00, NULL, 'Initial savings contribution', '2026-04-06 16:50:49', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `savings_update_requests`
--

CREATE TABLE `savings_update_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `old_percentage` decimal(5,2) NOT NULL,
  `new_percentage` decimal(5,2) NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `reviewed_by` int(11) DEFAULT NULL,
  `review_date` timestamp NULL DEFAULT NULL,
  `review_comments` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `savings_versions`
--

CREATE TABLE `savings_versions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `version_number` int(11) NOT NULL,
  `savings_type` enum('PERCENTAGE','FIXED_AMOUNT') NOT NULL,
  `savings_value` decimal(15,2) NOT NULL,
  `status` enum('ACTIVE','INACTIVE','PENDING','REPLACED') DEFAULT 'PENDING',
  `effective_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `activated_at` timestamp NULL DEFAULT NULL,
  `replaced_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `savings_versions`
--

INSERT INTO `savings_versions` (`id`, `user_id`, `version_number`, `savings_type`, `savings_value`, `status`, `effective_date`, `expiry_date`, `created_at`, `activated_at`, `replaced_at`) VALUES
(1, 5, 1, 'PERCENTAGE', 15.00, 'ACTIVE', '2024-01-15', NULL, '2026-04-06 16:50:49', '2026-04-06 16:50:49', NULL),
(2, 11, 1, 'PERCENTAGE', 15.00, 'ACTIVE', '2026-05-06', NULL, '2026-05-06 19:17:55', '2026-05-06 19:17:55', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `system_configuration`
--

CREATE TABLE `system_configuration` (
  `id` int(11) NOT NULL,
  `config_key` varchar(100) NOT NULL,
  `config_value` text NOT NULL,
  `config_type` enum('STRING','NUMBER','BOOLEAN','JSON') DEFAULT 'STRING',
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_configuration`
--

INSERT INTO `system_configuration` (`id`, `config_key`, `config_value`, `config_type`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'system_name', 'Microfinance Management System', 'STRING', 'Setting: system_name', 1, '2026-04-28 19:46:58', '2026-04-28 19:46:58'),
(2, 'organization_name', 'MSMS Organization', 'STRING', 'Setting: organization_name', 1, '2026-04-28 19:46:59', '2026-04-28 19:46:59'),
(3, 'admin_email', 'admin@msms.com', 'STRING', 'Setting: admin_email', 1, '2026-04-28 19:46:59', '2026-04-28 19:46:59'),
(4, 'support_email', 'fthdrgt', 'STRING', 'Setting: support_email', 1, '2026-04-28 19:46:59', '2026-04-28 20:01:03'),
(5, 'timezone', 'UTC+3', 'STRING', 'Setting: timezone', 1, '2026-04-28 19:46:59', '2026-04-28 19:46:59'),
(6, 'date_format', 'YYYY-MM-DD', 'STRING', 'Setting: date_format', 1, '2026-04-28 19:46:59', '2026-04-28 19:46:59'),
(7, 'currency', 'USD', 'STRING', 'Setting: currency', 1, '2026-04-28 19:46:59', '2026-04-28 19:46:59'),
(8, 'fiscal_year_start', 'January', 'STRING', 'Setting: fiscal_year_start', 1, '2026-04-28 19:47:00', '2026-04-28 19:47:00'),
(9, 'session_timeout_minutes', '30', 'NUMBER', 'Setting: session_timeout_minutes', 1, '2026-04-28 19:47:00', '2026-04-28 19:47:00'),
(10, 'password_min_length', '8', 'NUMBER', 'Setting: password_min_length', 1, '2026-04-28 19:47:00', '2026-04-28 19:47:00'),
(11, 'password_expiry_days', '90', 'NUMBER', 'Setting: password_expiry_days', 1, '2026-04-28 19:47:00', '2026-04-28 19:47:00'),
(12, 'max_login_attempts', '5', 'NUMBER', 'Setting: max_login_attempts', 1, '2026-04-28 19:47:00', '2026-04-28 19:47:00'),
(13, 'lockout_duration_minutes', '15', 'NUMBER', 'Setting: lockout_duration_minutes', 1, '2026-04-28 19:47:01', '2026-04-28 19:47:01'),
(14, 'require_two_factor', 'false', 'BOOLEAN', 'Setting: require_two_factor', 1, '2026-04-28 19:47:01', '2026-04-28 19:47:01'),
(15, 'ip_restriction', 'false', 'BOOLEAN', 'Setting: ip_restriction', 1, '2026-04-28 19:47:01', '2026-04-28 19:47:01'),
(16, 'allowed_ips', '', 'STRING', 'Setting: allowed_ips', 1, '2026-04-28 19:47:01', '2026-04-28 19:47:01'),
(17, 'email_notifications', 'true', 'BOOLEAN', 'Setting: email_notifications', 1, '2026-04-28 19:47:01', '2026-04-30 17:41:14'),
(18, 'system_alerts', 'true', 'BOOLEAN', 'Setting: system_alerts', 1, '2026-04-28 19:47:01', '2026-04-28 19:47:01'),
(19, 'user_activity_logs', 'true', 'BOOLEAN', 'Setting: user_activity_logs', 1, '2026-04-28 19:47:01', '2026-04-28 19:47:01'),
(20, 'backup_notifications', 'true', 'BOOLEAN', 'Setting: backup_notifications', 1, '2026-04-28 19:47:02', '2026-04-28 19:47:02'),
(21, 'loan_notifications', 'true', 'BOOLEAN', 'Setting: loan_notifications', 1, '2026-04-28 19:47:02', '2026-04-30 17:41:14'),
(22, 'payment_notifications', 'true', 'BOOLEAN', 'Setting: payment_notifications', 1, '2026-04-28 19:47:02', '2026-04-30 17:41:14'),
(23, 'system_maintenance_mode', 'true', 'BOOLEAN', 'Setting: system_maintenance_mode', 1, '2026-04-28 19:47:02', '2026-04-28 19:47:02'),
(24, 'debug_mode', 'true', 'BOOLEAN', 'Setting: debug_mode', 1, '2026-04-28 19:47:02', '2026-04-28 19:47:02'),
(25, 'log_level', 'INFO', 'STRING', 'Setting: log_level', 1, '2026-04-28 19:47:02', '2026-04-28 19:47:02'),
(26, 'backup_schedule', 'daily', 'STRING', 'Setting: backup_schedule', 1, '2026-04-28 19:47:02', '2026-04-28 19:47:02'),
(27, 'data_retention', '7years', 'STRING', 'Setting: data_retention', 1, '2026-04-28 19:47:02', '2026-04-28 19:47:02'),
(28, 'max_file_upload_size_mb', '10', 'NUMBER', 'Setting: max_file_upload_size_mb', 1, '2026-04-28 19:47:02', '2026-04-28 19:47:02'),
(29, 'allowed_file_types', 'pdf,doc,docx,xls,xlsx,csv', 'STRING', 'Setting: allowed_file_types', 1, '2026-04-28 19:47:02', '2026-04-28 19:47:02'),
(97, 'marketing_emails', 'false', 'BOOLEAN', 'Enable/disable marketing emails for all users', 1, '2026-04-30 17:41:52', '2026-04-30 17:41:52');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `category` varchar(50) NOT NULL,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`settings`)),
  `updated_by` int(11) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('EMPLOYEE','LOAN_COMMITTEE','FINANCE_ADMIN','HR','ADMIN') NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `email_verified` tinyint(1) DEFAULT 0,
  `is_first_login` tinyint(1) DEFAULT 1,
  `password_change_required` tinyint(1) DEFAULT 0,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `failed_login_attempts` int(11) DEFAULT 0,
  `last_failed_login` datetime DEFAULT NULL,
  `password_changed_at` datetime DEFAULT NULL,
  `email_verification_code` varchar(6) DEFAULT NULL,
  `email_verification_expires` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `employee_id`, `username`, `email`, `password_hash`, `role`, `is_active`, `email_verified`, `is_first_login`, `password_change_required`, `reset_token`, `reset_token_expiry`, `first_name`, `last_name`, `phone_number`, `created_at`, `updated_at`, `last_login`, `failed_login_attempts`, `last_failed_login`, `password_changed_at`, `email_verification_code`, `email_verification_expires`) VALUES
(5, 'EMP001', 'EMP001', 'john.doe@msms.com', '$2a$12$A233dQjDh42aflzqUNiOZ.7oGI3Iw0h0jLav891EVw1qey8JPRWoW', 'EMPLOYEE', 1, 1, 1, 0, NULL, NULL, 'John', 'Doe', NULL, '2026-04-06 16:50:48', '2026-05-06 18:11:47', '2026-04-09 18:32:53', 0, NULL, NULL, NULL, NULL),
(7, 'ADMIN002', 'ade', 'ade@gmail.com', '$2a$12$FXEl0UKSCeNKACx9zwe2XuoUPbWwsyb7Eq5b9.57684YysNIqmCiK', 'ADMIN', 1, 1, 1, 0, NULL, NULL, 'Bulaa', 'mula', NULL, '2026-04-28 18:26:41', '2026-05-12 19:27:00', '2026-05-12 19:27:00', 0, NULL, NULL, NULL, NULL),
(8, 'ADM06187', 'abebe@gmail.com', 'abebe@gmail.com', '$2a$12$EGG2hhqfUZ2OgUR47UKmneJIBKZNm.I/RRMROY3jlXyl4s9SzN0Um', 'HR', 1, 0, 1, 0, NULL, NULL, 'Abebe', 'Kebede', '+123456789', '2026-04-30 17:51:46', '2026-05-12 18:32:12', '2026-04-30 19:00:09', 6, '2026-05-12 21:32:12', NULL, NULL, NULL),
(9, 'ADM20468', 'chala@gmail.com', 'chala@gmail.com', '$2a$12$Tt.nvdZ50ujZtjgDlcRmJ./JjxlsiYqd/fa42q3xy4xjIsbrUFF/i', 'HR', 1, 0, 1, 0, NULL, NULL, 'kassa', 'chala', '+123456789', '2026-05-05 18:27:00', '2026-05-05 19:26:19', '2026-05-05 19:26:19', 0, NULL, NULL, NULL, NULL),
(10, 'EMP023', 'kibret@gmail.com', 'kibret@gmail.com', '$2a$12$cRNl0WVXH49qThU3yO0mCO6ecPZExHPHDvIa.Ebu5PP4FwfZcPiIy', 'EMPLOYEE', 1, 0, 1, 0, NULL, NULL, NULL, NULL, NULL, '2026-05-05 18:29:21', '2026-05-05 19:44:52', '2026-05-05 18:35:29', 1, '2026-05-05 21:51:51', NULL, NULL, NULL),
(11, 'EMP0034', 'dushu@gmail.com', 'dushu@gmail.com', '$2a$12$tQvgJdvY7OHO4xBnLIbEgeZuXux0T/a3DVnin4z64.qMfJ1fJcyja', 'EMPLOYEE', 1, 1, 1, 0, NULL, NULL, 'kucha', 'mula', NULL, '2026-05-05 18:36:46', '2026-05-06 20:11:12', '2026-05-06 20:11:12', 0, NULL, NULL, NULL, NULL),
(12, 'EMP0112', 'gamma@gmail.com', 'gamma@gmail.com', '$2a$12$bM5xiIXtjIcLyEX8lOIJZ./PTyE5mGqcBv2MbhqfrGuuxc31cIFPW', 'EMPLOYEE', 1, 0, 1, 0, NULL, NULL, NULL, NULL, NULL, '2026-05-05 19:00:54', '2026-05-05 19:44:52', '2026-05-05 19:01:23', 0, NULL, NULL, NULL, NULL),
(13, 'EMP432', 'adinoaschlew@gmail.com', 'adinoaschlew@gmail.com', '$2a$12$qXIoFbB9riaY4ks6nR.cV.FrtF//NWU.EeSC.94JTeHc0gdGAVVCa', 'EMPLOYEE', 0, 0, 1, 0, NULL, NULL, NULL, NULL, NULL, '2026-05-05 19:16:37', '2026-05-12 18:28:01', '2026-05-05 19:23:46', 0, NULL, NULL, NULL, NULL),
(15, 'ADM82549', 'hibret@gmail.com', 'hibret@gmail.com', '$2a$12$cMFieHH7/dRMvAW6Myh5/OCGXS1szYQetGdwrPTYUUlqcAB7eptRm', 'HR', 1, 0, 1, 0, NULL, NULL, 'girma', 'hibret', '+652347236', '2026-05-12 18:51:23', '2026-05-12 22:22:30', '2026-05-12 22:22:30', 0, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_preferences`
--

CREATE TABLE `user_preferences` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `category` varchar(50) NOT NULL,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`settings`)),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_preferences`
--

INSERT INTO `user_preferences` (`id`, `user_id`, `category`, `settings`, `updated_at`, `created_at`) VALUES
(1, 15, 'personal', '{\"theme\":\"dark\",\"emailNotifications\":true,\"pushNotifications\":true}', '2026-05-12 20:22:15', '2026-05-12 20:22:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ai_forecasts`
--
ALTER TABLE `ai_forecasts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_forecast_type` (`forecast_type`),
  ADD KEY `idx_target_date` (`target_date`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_model_version` (`model_version`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_table_name` (`table_name`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_record_id` (`record_id`),
  ADD KEY `idx_audit_logs_user_action` (`user_id`,`action`,`created_at`);

--
-- Indexes for table `employee_profiles`
--
ALTER TABLE `employee_profiles`
  ADD PRIMARY KEY (`profile_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_employment_status` (`employment_status`),
  ADD KEY `idx_hr_verified` (`hr_verified`),
  ADD KEY `idx_department` (`department`),
  ADD KEY `idx_profile_picture` (`profile_picture`(768)),
  ADD KEY `idx_salary` (`salary`);

--
-- Indexes for table `generated_reports`
--
ALTER TABLE `generated_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_generated_by` (`generated_by`),
  ADD KEY `idx_report_type` (`report_type`),
  ADD KEY `idx_generation_date` (`generation_date`),
  ADD KEY `idx_report_name` (`report_name`);

--
-- Indexes for table `guarantors`
--
ALTER TABLE `guarantors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_loan_application_id` (`loan_application_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_guarantor_id` (`guarantor_id`),
  ADD KEY `idx_is_approved` (`is_approved`),
  ADD KEY `idx_approved_by` (`approved_by`);

--
-- Indexes for table `loans`
--
ALTER TABLE `loans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `loan_application_id` (`loan_application_id`),
  ADD KEY `idx_loan_application_id` (`loan_application_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_disbursement_date` (`disbursement_date`);

--
-- Indexes for table `loan_applications`
--
ALTER TABLE `loan_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_reviewed_by` (`reviewed_by`);

--
-- Indexes for table `loan_repayments`
--
ALTER TABLE `loan_repayments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_loan_id` (`loan_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_repayment_date` (`repayment_date`),
  ADD KEY `idx_payroll_batch_id` (`payroll_batch_id`),
  ADD KEY `idx_reference_id` (`reference_id`),
  ADD KEY `idx_due_date` (`due_date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `loan_transactions`
--
ALTER TABLE `loan_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `processed_by` (`processed_by`),
  ADD KEY `idx_loan_id` (`loan_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_transaction_type` (`transaction_type`),
  ADD KEY `idx_transaction_date` (`transaction_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_reference_number` (`reference_number`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_is_read` (`is_read`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_notification_type` (`notification_type`);

--
-- Indexes for table `otp_records`
--
ALTER TABLE `otp_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_active_otp` (`email`,`expires_at`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_expires_at` (`expires_at`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `payroll_batches`
--
ALTER TABLE `payroll_batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_upload_user_id` (`upload_user_id`),
  ADD KEY `idx_payroll_date` (`payroll_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_confirmed_by` (`confirmed_by`),
  ADD KEY `idx_cloudinary_url` (`cloudinary_url`),
  ADD KEY `idx_payroll_month` (`payroll_month`),
  ADD KEY `idx_payroll_year` (`payroll_year`);

--
-- Indexes for table `payroll_details`
--
ALTER TABLE `payroll_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payroll_batch_id` (`payroll_batch_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_payment_status` (`payment_status`),
  ADD KEY `idx_payment_date` (`payment_date`);

--
-- Indexes for table `penalties`
--
ALTER TABLE `penalties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_penalty_type` (`penalty_type`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_due_date` (`due_date`),
  ADD KEY `idx_reference_id` (`reference_id`);

--
-- Indexes for table `performance_reviews`
--
ALTER TABLE `performance_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reviewer_id` (`reviewer_id`),
  ADD KEY `idx_performance_reviews_employee` (`employee_id`),
  ADD KEY `idx_performance_reviews_status` (`status`),
  ADD KEY `idx_performance_reviews_date` (`review_date`),
  ADD KEY `idx_performance_reviews_type` (`review_type`);

--
-- Indexes for table `savings_accounts`
--
ALTER TABLE `savings_accounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_account_status` (`account_status`),
  ADD KEY `idx_last_contribution_date` (`last_contribution_date`);

--
-- Indexes for table `savings_configuration`
--
ALTER TABLE `savings_configuration`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `config_key` (`config_key`),
  ADD KEY `idx_config_key` (`config_key`);

--
-- Indexes for table `savings_requests`
--
ALTER TABLE `savings_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submitted_by` (`submitted_by`),
  ADD KEY `final_approved_by` (`final_approved_by`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_submitted_at` (`submitted_at`);

--
-- Indexes for table `savings_transactions`
--
ALTER TABLE `savings_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_savings_account_id` (`savings_account_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_transaction_type` (`transaction_type`),
  ADD KEY `idx_transaction_date` (`transaction_date`),
  ADD KEY `idx_payroll_batch_id` (`payroll_batch_id`),
  ADD KEY `idx_reference_id` (`reference_id`);

--
-- Indexes for table `savings_update_requests`
--
ALTER TABLE `savings_update_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reviewed_by` (`reviewed_by`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `savings_versions`
--
ALTER TABLE `savings_versions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `system_configuration`
--
ALTER TABLE `system_configuration`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `config_key` (`config_key`),
  ADD KEY `idx_config_key` (`config_key`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_config_type` (`config_type`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_category` (`category`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_system_settings_category` (`category`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_reset_token` (`reset_token`),
  ADD KEY `idx_reset_token_expiry` (`reset_token_expiry`),
  ADD KEY `idx_users_email_verification_code` (`email_verification_code`),
  ADD KEY `idx_users_email_verification_expires` (`email_verification_expires`),
  ADD KEY `idx_users_is_first_login` (`is_first_login`);

--
-- Indexes for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_category` (`user_id`,`category`),
  ADD KEY `idx_user_preferences_user_id` (`user_id`),
  ADD KEY `idx_user_preferences_category` (`category`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ai_forecasts`
--
ALTER TABLE `ai_forecasts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=299;

--
-- AUTO_INCREMENT for table `employee_profiles`
--
ALTER TABLE `employee_profiles`
  MODIFY `profile_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `generated_reports`
--
ALTER TABLE `generated_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `guarantors`
--
ALTER TABLE `guarantors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loans`
--
ALTER TABLE `loans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_applications`
--
ALTER TABLE `loan_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_repayments`
--
ALTER TABLE `loan_repayments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_transactions`
--
ALTER TABLE `loan_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `otp_records`
--
ALTER TABLE `otp_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `payroll_batches`
--
ALTER TABLE `payroll_batches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payroll_details`
--
ALTER TABLE `payroll_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `penalties`
--
ALTER TABLE `penalties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `performance_reviews`
--
ALTER TABLE `performance_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `savings_accounts`
--
ALTER TABLE `savings_accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `savings_configuration`
--
ALTER TABLE `savings_configuration`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `savings_requests`
--
ALTER TABLE `savings_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `savings_transactions`
--
ALTER TABLE `savings_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `savings_update_requests`
--
ALTER TABLE `savings_update_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `savings_versions`
--
ALTER TABLE `savings_versions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `system_configuration`
--
ALTER TABLE `system_configuration`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `user_preferences`
--
ALTER TABLE `user_preferences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `employee_profiles`
--
ALTER TABLE `employee_profiles`
  ADD CONSTRAINT `employee_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `generated_reports`
--
ALTER TABLE `generated_reports`
  ADD CONSTRAINT `generated_reports_ibfk_1` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `guarantors`
--
ALTER TABLE `guarantors`
  ADD CONSTRAINT `guarantors_ibfk_1` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `guarantors_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `guarantors_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `loans`
--
ALTER TABLE `loans`
  ADD CONSTRAINT `loans_ibfk_1` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loans_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_applications`
--
ALTER TABLE `loan_applications`
  ADD CONSTRAINT `loan_applications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_applications_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `loan_repayments`
--
ALTER TABLE `loan_repayments`
  ADD CONSTRAINT `loan_repayments_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_repayments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_transactions`
--
ALTER TABLE `loan_transactions`
  ADD CONSTRAINT `loan_transactions_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_transactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_transactions_ibfk_3` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `otp_records`
--
ALTER TABLE `otp_records`
  ADD CONSTRAINT `fk_otp_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payroll_batches`
--
ALTER TABLE `payroll_batches`
  ADD CONSTRAINT `payroll_batches_ibfk_1` FOREIGN KEY (`upload_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payroll_batches_ibfk_2` FOREIGN KEY (`confirmed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payroll_details`
--
ALTER TABLE `payroll_details`
  ADD CONSTRAINT `payroll_details_ibfk_1` FOREIGN KEY (`payroll_batch_id`) REFERENCES `payroll_batches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payroll_details_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `penalties`
--
ALTER TABLE `penalties`
  ADD CONSTRAINT `penalties_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `performance_reviews`
--
ALTER TABLE `performance_reviews`
  ADD CONSTRAINT `performance_reviews_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee_profiles` (`employee_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `performance_reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `savings_accounts`
--
ALTER TABLE `savings_accounts`
  ADD CONSTRAINT `savings_accounts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `savings_requests`
--
ALTER TABLE `savings_requests`
  ADD CONSTRAINT `savings_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `savings_requests_ibfk_2` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `savings_requests_ibfk_3` FOREIGN KEY (`final_approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `savings_transactions`
--
ALTER TABLE `savings_transactions`
  ADD CONSTRAINT `savings_transactions_ibfk_1` FOREIGN KEY (`savings_account_id`) REFERENCES `savings_accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `savings_transactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `savings_update_requests`
--
ALTER TABLE `savings_update_requests`
  ADD CONSTRAINT `savings_update_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `savings_update_requests_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `savings_versions`
--
ALTER TABLE `savings_versions`
  ADD CONSTRAINT `savings_versions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD CONSTRAINT `system_settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD CONSTRAINT `user_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
