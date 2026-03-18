require('dotenv').config({ path: '../.env' });

const { cloudinary } = require('../src/config/cloudinary');

async function testCloudinaryConnection() {
  try {
    console.log('Testing Cloudinary configuration...');
    
    // Check if credentials are set
    if (!cloudinary.config().cloud_name || !cloudinary.config().api_key || !cloudinary.config().api_secret) {
      console.error('❌ Cloudinary credentials not configured');
      console.log('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file');
      return;
    }
    
    console.log('✅ Cloudinary credentials found');
    console.log(`Cloud Name: ${cloudinary.config().cloud_name}`);
    
    // Test API access by listing folders
    const result = await cloudinary.api.sub_folders('/');
    console.log('✅ Cloudinary API connection successful');
    console.log('Available folders:', result.folders.map(f => f.name));
    
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    
    if (error.message.includes('credentials')) {
      console.log('Please check your Cloudinary credentials in the .env file');
    } else if (error.message.includes('network')) {
      console.log('Please check your internet connection');
    } else {
      console.log('Please verify your Cloudinary account is active');
    }
  }
}

testCloudinaryConnection();
