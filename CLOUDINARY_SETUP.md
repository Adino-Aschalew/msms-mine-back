# Cloudinary Setup Guide

## 1. Create Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email address

## 2. Get Your Credentials
1. Log in to Cloudinary dashboard
2. Go to **Settings** → **Account**
3. Copy your:
   - **Cloud name**
   - **API Key** 
   - **API Secret**

## 3. Update Environment Variables
Add these to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 4. Run Database Migration
```bash
mysql -u root -p microfinance_system < migrations/add_cloudinary_fields.sql
```

## 5. Test the Setup
```bash
npm run dev
```

## 6. Upload a Test Payroll File
Use the finance portal or API to upload a CSV/Excel file to test Cloudinary integration.

## Benefits of Cloudinary Storage
- **Secure**: Files stored in cloud with encryption
- **Scalable**: No local disk space limitations
- **Reliable**: Automatic backups and redundancy
- **Fast**: CDN delivery for quick access
- **Managed**: No manual file cleanup required

## File Storage Structure
- **Folder**: `microfinance/payroll/`
- **Naming**: `payroll-{timestamp}-{randomId}`
- **Formats**: CSV, XLSX, XLS
- **Max Size**: 10MB per file

## Security Notes
- Keep your Cloudinary credentials secure
- Files are stored as private resources
- Access is controlled through signed URLs
- Automatic cleanup of failed uploads
