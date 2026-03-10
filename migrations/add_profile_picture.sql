-- Add profile_picture column to employee_profiles table
-- This migration adds support for profile picture uploads

ALTER TABLE employee_profiles 
ADD COLUMN profile_picture VARCHAR(500) NULL 
AFTER address;

-- Create index for faster lookups
CREATE INDEX idx_profile_picture ON employee_profiles(profile_picture);
