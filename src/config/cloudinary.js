const cloudinary = require('cloudinary').v2;
const CloudinaryStorage = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Configure Cloudinary storage for multer (v2.x compatible)
let storage;
try {
  storage = CloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'microfinance/payroll',
    allowedFormats: ['csv', 'xlsx', 'xls'],
    params: {
      resource_type: 'raw'
    },
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `payroll-${uniqueSuffix}`;
    }
  });
  console.log('✅ Cloudinary storage initialized successfully');
} catch (error) {
  console.error('❌ Cloudinary storage initialization failed:', error.message);
  // Fallback or better let it fail explicitly but with a log
  throw error;
}

module.exports = {
  cloudinary,
  storage
};
