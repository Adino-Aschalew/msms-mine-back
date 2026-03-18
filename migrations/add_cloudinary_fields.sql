-- Migration to add Cloudinary fields to payroll_batches table
-- Run this migration after updating the code

USE microfinance_system;

ALTER TABLE payroll_batches 
ADD COLUMN cloudinary_url VARCHAR(500) NULL AFTER file_path,
ADD COLUMN public_id VARCHAR(200) NULL AFTER cloudinary_url;

-- Add indexes for better performance
ALTER TABLE payroll_batches 
ADD INDEX idx_cloudinary_url (cloudinary_url),
ADD INDEX idx_public_id (public_id);

-- Update existing records to have NULL values for new columns
-- This is handled automatically by ALTER TABLE
