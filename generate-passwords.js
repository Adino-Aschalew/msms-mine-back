const bcrypt = require('bcryptjs');

async function generatePasswords() {
  const saltRounds = 12;
  
  const adminPassword = 'admin123';
  const hrPassword = 'Hr123456';
  
  const adminHash = await bcrypt.hash(adminPassword, saltRounds);
  const hrHash = await bcrypt.hash(hrPassword, saltRounds);
  
  console.log('Admin password hash:', adminHash);
  console.log('HR password hash:', hrHash);
  
  // Test the hashes
  const adminValid = await bcrypt.compare('admin123', adminHash);
  const hrValid = await bcrypt.compare('Hr123456', hrHash);
  
  console.log('Admin hash valid:', adminValid);
  console.log('HR hash valid:', hrValid);
}

generatePasswords();
