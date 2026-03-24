const NotificationService = require('./src/services/notification.service');

async function testNotificationService() {
  try {
    console.log('🧪 Testing Notification Service...');
    
    // Test the sendEmail method
    const result = await NotificationService.sendEmail(
      'test@example.com',
      'Test Subject',
      'Test Message'
    );
    
    console.log('✅ Notification service test result:', result);
    
  } catch (error) {
    console.log('❌ Notification service test failed:', error.message);
  }
}

testNotificationService();
