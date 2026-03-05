const validateLogin = (req, res, next) => {
  const { employee_id, password } = req.body;
  
  if (!employee_id || !password) {
    return res.status(400).json({
      success: false,
      message: 'Employee ID and password are required'
    });
  }
  
  if (typeof employee_id !== 'string' || employee_id.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Employee ID must be a non-empty string'
    });
  }
  
  if (typeof password !== 'string' || password.length < 1) {
    return res.status(400).json({
      success: false,
      message: 'Password is required'
    });
  }
  
  next();
};

const validateRegister = (req, res, next) => {
  const { employee_id, email, password, confirm_password } = req.body;
  
  // Check required fields
  if (!employee_id || !email || !password || !confirm_password) {
    return res.status(400).json({
      success: false,
      message: 'Employee ID, email, password, and confirm password are required'
    });
  }
  
  // Validate employee_id
  if (typeof employee_id !== 'string' || employee_id.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Employee ID must be a non-empty string'
    });
  }
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }
  
  // Validate password
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long'
    });
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    });
  }
  
  // Check password confirmation
  if (password !== confirm_password) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match'
    });
  }
  
  next();
};

const validateChangePassword = (req, res, next) => {
  const { current_password, new_password, confirm_password } = req.body;
  
  if (!current_password || !new_password || !confirm_password) {
    return res.status(400).json({
      success: false,
      message: 'All password fields are required'
    });
  }
  
  if (new_password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 8 characters long'
    });
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(new_password)) {
    return res.status(400).json({
      success: false,
      message: 'New password must contain at least one uppercase letter, one lowercase letter, and one number'
    });
  }
  
  if (new_password !== confirm_password) {
    return res.status(400).json({
      success: false,
      message: 'New passwords do not match'
    });
  }
  
  next();
};

const validateUpdateProfile = (req, res, next) => {
  const { first_name, last_name, phone, address } = req.body;
  
  // All fields are optional, but validate if provided
  if (first_name && (typeof first_name !== 'string' || first_name.trim().length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'First name must be a non-empty string'
    });
  }
  
  if (last_name && (typeof last_name !== 'string' || last_name.trim().length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'Last name must be a non-empty string'
    });
  }
  
  if (phone && !/^[+]?[\d\s\-\(\)]+$/.test(phone)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid phone number'
    });
  }
  
  if (address && (typeof address !== 'string' || address.trim().length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'Address must be a non-empty string'
    });
  }
  
  next();
};

const validateRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required'
    });
  }
  
  if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token must be a non-empty string'
    });
  }
  
  next();
};

const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  
  // Check required fields
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email address is required'
    });
  }
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }
  
  next();
};

const validateResetPassword = (req, res, next) => {
  const { token, newPassword } = req.body;
  
  // Check required fields
  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Reset token and new password are required'
    });
  }
  
  // Validate password
  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long'
    });
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
    return res.status(400).json({
      success: false,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    });
  }
  
  next();
};

module.exports = {
  validateLogin,
  validateRegister,
  validateChangePassword,
  validateUpdateProfile,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword
};
