const cloudinary = require('cloudinary').v2;
const CloudinaryStorage = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'microfinance/payroll', // Folder name in Cloudinary
    allowed_formats: ['csv', 'xlsx', 'xls'], // Allowed file formats
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `payroll-${uniqueSuffix}`;
    },
    resource_type: 'raw' // For non-image files like CSV/Excel
  }
});

module.exports = {
  cloudinary,
  storage
};
