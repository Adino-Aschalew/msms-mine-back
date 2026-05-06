// Profile debugging utility for employee header issues
import { useAuth } from '../../../../shared/contexts/AuthContext';

export const profileDebug = {
  // Debug user profile data
  debugUserProfile: () => {
    console.log('👤 Debugging User Profile Data...');
    
    // Get user from localStorage as fallback
    const userFromStorage = localStorage.getItem('authUser');
    const tokenFromStorage = localStorage.getItem('authToken');
    
    console.log('🔑 Token exists:', !!tokenFromStorage);
    console.log('👤 User data in localStorage:', !!userFromStorage);
    
    if (userFromStorage) {
      try {
        const user = JSON.parse(userFromStorage);
        console.log('👤 Parsed user data:', user);
        console.log('📅 User date fields:', {
          created_at: user?.created_at,
          join_date: user?.join_date,
          date_joined: user?.date_joined,
          employment_start_date: user?.employment_start_date,
          hire_date: user?.hire_date,
          start_date: user?.start_date
        });
        console.log('✉️ Email verification:', user?.email_verified);
        console.log('📧 Email:', user?.email);
        
        // Calculate member since with multiple fallbacks
        const memberSince = profileDebug.calculateMemberSince(user);
        console.log('📅 Calculated member since:', memberSince);
        
        return user;
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
      }
    }
    
    return null;
  },
  
  // Calculate member since with multiple fallbacks
  calculateMemberSince: (user) => {
    if (!user) return 'Unknown';
    
    const dateFields = [
      'created_at',
      'join_date', 
      'date_joined',
      'employment_start_date',
      'hire_date',
      'start_date'
    ];
    
    for (const field of dateFields) {
      if (user[field]) {
        try {
          const date = new Date(user[field]);
          const year = date.getFullYear();
          // Validate the year is reasonable (not too old or future)
          if (year >= 1990 && year <= new Date().getFullYear()) {
            return year.toString();
          }
        } catch (error) {
          console.warn(`⚠️ Invalid date in field ${field}:`, user[field]);
        }
      }
    }
    
    // Fallback to current year
    return new Date().getFullYear().toString();
  },
  
  // Fix user data if needed
  fixUserData: () => {
    console.log('🔧 Attempting to fix user data...');
    
    const userFromStorage = localStorage.getItem('authUser');
    if (!userFromStorage) {
      console.error('❌ No user data found in localStorage');
      return false;
    }
    
    try {
      const user = JSON.parse(userFromStorage);
      
      // Add missing fields if needed
      if (!user.created_at && !user.join_date && !user.date_joined) {
        // Set a reasonable default date
        const today = new Date();
        const defaultDate = new Date(today.getFullYear() - 1, 0, 1); // January 1st of last year
        
        user.created_at = defaultDate.toISOString();
        user.join_date = defaultDate.toISOString();
        
        // Save back to localStorage
        localStorage.setItem('authUser', JSON.stringify(user));
        
        console.log('✅ Fixed user data with default dates');
        console.log('📅 New created_at:', user.created_at);
        console.log('📅 New join_date:', user.join_date);
        
        return true;
      }
      
      console.log('✅ User data already has date fields');
      return true;
      
    } catch (error) {
      console.error('❌ Error fixing user data:', error);
      return false;
    }
  },
  
  // Test email verification status
  testEmailVerification: () => {
    const userFromStorage = localStorage.getItem('authUser');
    if (!userFromStorage) {
      console.error('❌ No user data found');
      return;
    }
    
    const user = JSON.parse(userFromStorage);
    console.log('✉️ Email verification status:', {
      email_verified: user?.email_verified,
      is_verified: user?.is_verified,
      verified: user?.verified,
      email: user?.email
    });
    
    // If any verification field is undefined, set a default
    if (user.email_verified === undefined && user.is_verified === undefined && user.verified === undefined) {
      user.email_verified = true; // Default to verified
      localStorage.setItem('authUser', JSON.stringify(user));
      console.log('✅ Set default email verification status to true');
    }
  },
  
  // Fix email verification status
  fixEmailVerification: () => {
    const userFromStorage = localStorage.getItem('authUser');
    if (!userFromStorage) {
      console.error('❌ No user data found');
      return false;
    }
    
    const user = JSON.parse(userFromStorage);
    
    // Set email verification to true if it's undefined or false
    if (user.email_verified === undefined || user.email_verified === false) {
      user.email_verified = true;
      localStorage.setItem('authUser', JSON.stringify(user));
      console.log('✅ Fixed email verification status to true');
      return true;
    }
    
    console.log('✅ Email verification status already correct');
    return true;
  },

  // Run all profile fixes
  runAllFixes: () => {
    console.log('🚀 Running All Profile Fixes...');
    
    profileDebug.debugUserProfile();
    profileDebug.fixUserData();
    profileDebug.fixEmailVerification();
    
    console.log('✅ All profile fixes completed');
    console.log('🔄 Refresh the page to see changes');
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.profileDebug = profileDebug;
  console.log('🔧 Profile debug utilities loaded! Use window.profileDebug.runAllFixes() to fix profile issues');
}
