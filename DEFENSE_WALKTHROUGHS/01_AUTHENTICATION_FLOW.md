# Authentication Flow - Line by Line Walkthrough

> **Updated implementation:** The live API uses `src/modules/auth/` (routes, validation, controller, service). See **`01B_AUTHENTICATION_MODULE_CURRENT.md`** for the current module-based flow. This document still explains core concepts using the legacy `src/controllers/authController.js` and `src/models/User.js` patterns, which remain valid for understanding bcrypt, JWT, and middleware.

## Overview
The authentication flow handles user login, registration, token refresh, and password management. This walkthrough covers the complete authentication process from request to response.

---

## 1. Login Flow

### File: `src/controllers/authController.js` (Lines 5-40)

```javascript
exports.login = async (req, res) => {
```
**Line 5:** Exports the login function as an async handler to handle HTTP requests.

```javascript
  try {
```
**Line 6:** Starts a try-catch block to handle any errors that occur during the login process.

```javascript
    const { employee_id, password } = req.body;
```
**Line 7:** Destructures employee_id and password from the request body.

```javascript
    if (!employee_id || !password) {
```
**Line 8:** Checks if either employee_id or password is missing (falsy value).

```javascript
      return res.status(400).json({
```
**Line 9:** If validation fails, returns a 400 Bad Request response.

```javascript
        success: false,
```
**Line 10:** Sets success flag to false in the response.

```javascript
        message: 'Employee ID and password are required'
```
**Line 11:** Provides an error message indicating which fields are required.

```javascript
      });
```
**Line 12:** Closes the JSON response object.

```javascript
    }
```
**Line 13:** Closes the validation if block.

```javascript
    const result = await User.authenticate(employee_id, password);
```
**Line 14:** Calls the User.authenticate method with employee_id and password, awaiting the result. This method handles password verification and token generation.

```javascript
    if (result.success) {
```
**Line 15:** Checks if authentication was successful.

```javascript
      await auditLog(
```
**Line 16:** If successful, logs the login event to the audit trail for security tracking.

```javascript
        result.user.id,
```
**Line 17:** Passes the user ID as the first parameter to auditLog.

```javascript
        'LOGIN_SUCCESS',
```
**Line 18:** Specifies the action type as 'LOGIN_SUCCESS'.

```javascript
        'users',
```
**Line 19:** Specifies the table name as 'users'.

```javascript
        result.user.id,
```
**Line 20:** Passes the record ID (user ID) for tracking.

```javascript
        null,
```
**Line 21:** No old values to track for login (null).

```javascript
        { last_login: new Date() },
```
**Line 22:** Tracks the new value (last_login timestamp) for audit purposes.

```javascript
        req.ip,
```
**Line 23:** Passes the client IP address for security logging.

```javascript
        req.get('User-Agent')
```
**Line 24:** Passes the user agent string for device/browser identification.

```javascript
      );
```
**Line 25:** Closes the auditLog function call.

```javascript
      res.json({
```
**Line 26:** Returns a JSON response with authentication success.

```javascript
        success: true,
```
**Line 27:** Sets success flag to true.

```javascript
        message: 'Login successful',
```
**Line 28:** Provides a success message.

```javascript
        data: {
```
**Line 29:** Starts the data object containing user and token information.

```javascript
          user: result.user,
```
**Line 30:** Includes the user object with user details.

```javascript
          token: result.token,
```
**Line 31:** Includes the JWT access token for subsequent authenticated requests.

```javascript
          refreshToken: result.refreshToken
```
**Line 32:** Includes the refresh token for obtaining new access tokens.

```javascript
        }
```
**Line 33:** Closes the data object.

```javascript
      });
```
**Line 34:** Closes the JSON response.

```javascript
    } else {
```
**Line 35:** If authentication failed (else block).

```javascript
      await auditLog(
```
**Line 36:** Logs the failed login attempt for security monitoring.

```javascript
        null,
```
**Line 37:** No user ID available for failed login (null).

```javascript
        'LOGIN_FAILED',
```
**Line 38:** Specifies the action type as 'LOGIN_FAILED'.

```javascript
        'users',
```
**Line 39:** Specifies the table name as 'users'.

```javascript
        null,
```
**Line 40:** No record ID (null).

```javascript
        null,
```
**Line 41:** No old values (null).

```javascript
        { employee_id },
```
**Line 42:** Tracks the attempted employee_id for security analysis.

```javascript
        req.ip,
```
**Line 43:** Passes the client IP address.

```javascript
        req.get('User-Agent')
```
**Line 44:** Passes the user agent string.

```javascript
      );
```
**Line 45:** Closes the auditLog function call.

```javascript
      return res.status(401).json({
```
**Line 46:** Returns a 401 Unauthorized response.

```javascript
        success: false,
```
**Line 47:** Sets success flag to false.

```javascript
        message: result.message || 'Invalid credentials'
```
**Line 48:** Returns the error message from the authentication result or a default message.

```javascript
      });
```
**Line 49:** Closes the JSON response.

```javascript
    }
```
**Line 50:** Closes the if-else block.

```javascript
  } catch (error) {
```
**Line 51:** Catches any unexpected errors in the try block.

```javascript
    console.error('Login error:', error);
```
**Line 52:** Logs the error to the console for debugging.

```javascript
    res.status(500).json({
```
**Line 53:** Returns a 500 Internal Server Error response.

```javascript
      success: false,
```
**Line 54:** Sets success flag to false.

```javascript
      message: 'Internal server error'
```
**Line 55:** Returns a generic error message (doesn't expose internal details).

```javascript
    });
```
**Line 56:** Closes the JSON response.

```javascript
  }
```
**Line 57:** Closes the catch block.

```javascript
};
```
**Line 58:** Closes the login function.

---

## 2. User Authentication Method

### File: `src/models/User.js` (Lines 70-112)

```javascript
  static async authenticate(employee_id, password) {
```
**Line 70:** Defines a static async method for user authentication that takes employee_id and password.

```javascript
    const query = `
```
**Line 71:** Starts a SQL query string to find the user by employee_id.

```javascript
      SELECT u.*, ep.first_name, ep.last_name, ep.department, ep.salary, sa.saving_percentage
```
**Line 72:** Selects all user columns plus employee profile and savings account information.

```javascript
      FROM users u
```
**Line 73:** Specifies the users table with alias 'u'.

```javascript
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
```
**Line 74:** Left joins employee_profiles to get employee details.

```javascript
      LEFT JOIN savings_accounts sa ON u.id = sa.user_id AND sa.account_status = 'ACTIVE'
```
**Line 75:** Left joins savings_accounts to get active savings account with saving percentage.

```javascript
      WHERE u.employee_id = ? AND u.is_active = true
```
**Line 76:** Filters by employee_id and ensures the user account is active.

```javascript
    `;
```
**Line 77:** Closes the SQL query string.

```javascript
    const users = await db.query(query, [employee_id]);
```
**Line 78:** Executes the query with employee_id as a parameter (prevents SQL injection).

```javascript
    if (!users || users.length === 0) {
```
**Line 79:** Checks if no user was found in the database.

```javascript
      return { success: false, message: 'Invalid credentials' };
```
**Line 80:** Returns failure with a generic message (doesn't reveal if user exists).

```javascript
    }
```
**Line 81:** Closes the if block.

```javascript
    const user = users[0];
```
**Line 82:** Gets the first (and only) user from the result array.

```javascript
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
```
**Line 83:** Uses bcrypt.compare to securely compare the provided password with the stored hash. This is a constant-time comparison to prevent timing attacks.

```javascript
    if (!isValidPassword) {
```
**Line 84:** Checks if the password comparison failed.

```javascript
      return { success: false, message: 'Invalid credentials' };
```
**Line 85:** Returns failure with generic message (security best practice).

```javascript
    }
```
**Line 86:** Closes the if block.

```javascript
    if (!user.is_active) {
```
**Line 87:** Double-checks if the user account is active (redundant check for safety).

```javascript
      return { success: false, message: 'Account is inactive' };
```
**Line 88:** Returns failure if account is inactive.

```javascript
    }
```
**Line 89:** Closes the if block.

```javascript
    const token = jwt.sign(
```
**Line 90:** Starts generating a JWT access token.

```javascript
      { userId: user.id, role: user.role },
```
**Line 91:** Creates the token payload with user ID and role.

```javascript
      process.env.JWT_SECRET,
```
**Line 92:** Signs the token with the secret key from environment variables.

```javascript
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
```
**Line 93:** Sets token expiration (default 1 hour if not configured).

```javascript
    );
```
**Line 94:** Closes the jwt.sign function call.

```javascript
    const refreshToken = jwt.sign(
```
**Line 95:** Starts generating a refresh token (longer-lived).

```javascript
      { userId: user.id },
```
**Line 96:** Creates refresh token payload with only user ID (minimal data).

```javascript
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
```
**Line 97:** Signs with refresh secret or falls back to main secret.

```javascript
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
```
**Line 98:** Sets longer expiration (default 7 days).

```javascript
    );
```
**Line 99:** Closes the jwt.sign function call.

```javascript
    await db.query(
```
**Line 100:** Updates the user's last_login timestamp.

```javascript
      'UPDATE users SET last_login = NOW() WHERE id = ?',
```
**Line 101:** SQL update to set last_login to current timestamp.

```javascript
      [user.id]
```
**Line 102:** Parameter for the user ID.

```javascript
    );
```
**Line 103:** Closes the query execution.

```javascript
    const { password_hash, ...userWithoutPassword } = user;
```
**Line 104:** Destructures to remove password_hash from the user object before returning (security).

```javascript
    return {
```
**Line 105:** Returns the authentication result object.

```javascript
      success: true,
```
**Line 106:** Sets success flag to true.

```javascript
      user: userWithoutPassword,
```
**Line 107:** Includes user object without sensitive password hash.

```javascript
      token,
```
**Line 108:** Includes the access token.

```javascript
      refreshToken
```
**Line 109:** Includes the refresh token.

```javascript
    };
```
**Line 110:** Closes the return object.

```javascript
  }
```
**Line 111:** Closes the authenticate method.

```javascript
```
**Line 112:** Empty line for readability.

---

## 3. Registration Flow

### File: `src/controllers/authController.js` (Lines 42-88)

```javascript
exports.register = async (req, res) => {
```
**Line 42:** Exports the register function as an async handler.

```javascript
  try {
```
**Line 43:** Starts try-catch block for error handling.

```javascript
    const {
```
**Line 44:** Starts destructuring required fields from request body.

```javascript
      employee_id,
```
**Line 45:** Employee ID (unique identifier).

```javascript
      username,
```
**Line 46:** Username (unique).

```javascript
      email,
```
**Line 47:** Email address (unique).

```javascript
      password,
```
**Line 48:** Password (will be hashed).

```javascript
      confirm_password,
```
**Line 49:** Password confirmation field.

```javascript
      role = 'EMPLOYEE'
```
**Line 50:** Role with default value 'EMPLOYEE'.

```javascript
    } = req.body;
```
**Line 51:** Closes destructuring from req.body.

```javascript
    if (!employee_id || !username || !email || !password) {
```
**Line 52:** Validates that all required fields are present.

```javascript
      return res.status(400).json({
```
**Line 53:** Returns 400 Bad Request if validation fails.

```javascript
        success: false,
```
**Line 54:** Sets success to false.

```javascript
        message: 'All required fields must be provided'
```
**Line 55:** Error message indicating missing fields.

```javascript
      });
```
**Line 56:** Closes JSON response.

```javascript
    }
```
**Line 57:** Closes validation if block.

```javascript
    if (password !== confirm_password) {
```
**Line 58:** Validates that password and confirm_password match.

```javascript
      return res.status(400).json({
```
**Line 59:** Returns 400 Bad Request if passwords don't match.

```javascript
        success: false,
```
**Line 60:** Sets success to false.

```javascript
        message: 'Passwords do not match'
```
**Line 61:** Error message for password mismatch.

```javascript
      });
```
**Line 62:** Closes JSON response.

```javascript
    }
```
**Line 63:** Closes validation if block.

```javascript
    if (password.length < 8) {
```
**Line 64:** Validates minimum password length (8 characters).

```javascript
      return res.status(400).json({
```
**Line 65:** Returns 400 Bad Request if password is too short.

```javascript
        success: false,
```
**Line 66:** Sets success to false.

```javascript
        message: 'Password must be at least 8 characters long'
```
**Line 67:** Error message for weak password.

```javascript
      });
```
**Line 68:** Closes JSON response.

```javascript
    }
```
**Line 69:** Closes validation if block.

```javascript
    const userId = await User.create({
```
**Line 70:** Calls User.create method to create the user in the database.

```javascript
      employee_id,
```
**Line 71:** Passes employee_id.

```javascript
      username,
```
**Line 72:** Passes username.

```javascript
      email,
```
**Line 73:** Passes email.

```javascript
      password,
```
**Line 74:** Passes password (will be hashed in User.create).

```javascript
      role
```
**Line 75:** Passes role.

```javascript
    });
```
**Line 76:** Closes the User.create call.

```javascript
    await auditLog(
```
**Line 77:** Logs the user registration event.

```javascript
      userId,
```
**Line 78:** Passes the new user ID.

```javascript
      'USER_REGISTER',
```
**Line 79:** Action type: USER_REGISTER.

```javascript
      'users',
```
**Line 80:** Table name: users.

```javascript
      userId,
```
**Line 81:** Record ID: userId.

```javascript
      null,
```
**Line 82:** No old values (new user).

```javascript
      { employee_id, username, email, role },
```
**Line 83:** New values for audit trail.

```javascript
      req.ip,
```
**Line 84:** Client IP address.

```javascript
      req.get('User-Agent')
```
**Line 85:** User agent string.

```javascript
    );
```
**Line 86:** Closes auditLog call.

```javascript
    res.status(201).json({
```
**Line 87:** Returns 201 Created response.

```javascript
      success: true,
```
**Line 88:** Sets success to true.

```javascript
      message: 'User registered successfully',
```
**Line 89:** Success message.

```javascript
      data: { userId }
```
**Line 90:** Returns the new user ID.

```javascript
    });
```
**Line 91:** Closes JSON response.

```javascript
  } catch (error) {
```
**Line 92:** Catches any errors.

```javascript
    console.error('Registration error:', error);
```
**Line 93:** Logs error for debugging.

```javascript
    if (error.code === 'ER_DUP_ENTRY') {
```
**Line 94:** Checks for duplicate entry error (unique constraint violation).

```javascript
      return res.status(409).json({
```
**Line 95:** Returns 409 Conflict for duplicate.

```javascript
        success: false,
```
**Line 96:** Sets success to false.

```javascript
        message: 'Employee ID, username, or email already exists'
```
**Line 97:** Error message indicating which field is duplicate.

```javascript
      });
```
**Line 98:** Closes JSON response.

```javascript
    }
```
**Line 99:** Closes duplicate check if block.

```javascript
    res.status(500).json({
```
**Line 100:** Returns 500 for other errors.

```javascript
      success: false,
```
**Line 101:** Sets success to false.

```javascript
      message: 'Internal server error'
```
**Line 102:** Generic error message.

```javascript
    });
```
**Line 103:** Closes JSON response.

```javascript
  }
```
**Line 104:** Closes catch block.

```javascript
};
```
**Line 105:** Closes register function.

---

## 4. User Creation Method

### File: `src/models/User.js` (Lines 6-32)

```javascript
  static async create({ employee_id, username, email, password, role }) {
```
**Line 6:** Defines static async method to create a user.

```javascript
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
```
**Line 7:** Gets bcrypt salt rounds from environment or defaults to 12. Higher rounds = more secure but slower.

```javascript
    const password_hash = await bcrypt.hash(password, saltRounds);
```
**Line 8:** Hashes the password using bcrypt with the specified salt rounds. This is a one-way hash - cannot be decrypted.

```javascript
    const query = `
```
**Line 9:** Starts SQL INSERT query.

```javascript
      INSERT INTO users (employee_id, username, email, password_hash, role)
```
**Line 10:** Specifies columns to insert into.

```javascript
      VALUES (?, ?, ?, ?, ?)
```
**Line 11:** Parameterized values (prevents SQL injection).

```javascript
    `;
```
**Line 12:** Closes SQL string.

```javascript
    try {
```
**Line 13:** Starts try block for error handling.

```javascript
      const result = await db.query(query, [
```
**Line 14:** Executes the INSERT query with parameters.

```javascript
        employee_id,
```
**Line 15:** First parameter: employee_id.

```javascript
        username,
```
**Line 16:** Second parameter: username.

```javascript
        email,
```
**Line 17:** Third parameter: email.

```javascript
        password_hash,
```
**Line 18:** Fourth parameter: hashed password (never plain text).

```javascript
        role
```
**Line 19:** Fifth parameter: role.

```javascript
      ]);
```
**Line 20:** Closes the query execution.

```javascript
      return result.insertId;
```
**Line 21:** Returns the auto-generated ID of the new user.

```javascript
    } catch (error) {
```
**Line 22:** Catches database errors.

```javascript
      if (error.code === 'ER_DUP_ENTRY') {
```
**Line 23:** Checks for duplicate entry error code.

```javascript
        if (error.message.includes('employee_id')) {
```
**Line 24:** Checks if error is about employee_id duplicate.

```javascript
          throw new Error('Employee ID already exists');
```
**Line 25:** Throws specific error for employee_id duplicate.

```javascript
        } else if (error.message.includes('username')) {
```
**Line 26:** Checks if error is about username duplicate.

```javascript
          throw new Error('Username already exists');
```
**Line 27:** Throws specific error for username duplicate.

```javascript
        } else if (error.message.includes('email')) {
```
**Line 28:** Checks if error is about email duplicate.

```javascript
          throw new Error('Email already exists');
```
**Line 29:** Throws specific error for email duplicate.

```javascript
        }
```
**Line 30:** Closes if-else chain.

```javascript
      }
```
**Line 31:** Closes duplicate check.

```javascript
      throw error;
```
**Line 32:** Re-throws the error if not a duplicate entry.

```javascript
    }
```
**Line 33:** Closes catch block.

```javascript
  }
```
**Line 34:** Closes create method.

---

## 5. Token Refresh Flow

### File: `src/controllers/authController.js` (Lines 90-133)

```javascript
exports.refreshToken = async (req, res) => {
```
**Line 90:** Exports refreshToken function as async handler.

```javascript
  try {
```
**Line 91:** Starts try-catch block.

```javascript
    const { refreshToken } = req.body;
```
**Line 92:** Extracts refreshToken from request body.

```javascript
    if (!refreshToken) {
```
**Line 93:** Validates that refreshToken is provided.

```javascript
      return res.status(400).json({
```
**Line 94:** Returns 400 Bad Request if missing.

```javascript
        success: false,
```
**Line 95:** Sets success to false.

```javascript
        message: 'Refresh token is required'
```
**Line 96:** Error message.

```javascript
      });
```
**Line 97:** Closes JSON response.

```javascript
    }
```
**Line 98:** Closes validation if block.

```javascript
    const decoded = jwt.verify(
```
**Line 99:** Verifies the refresh token using JWT.

```javascript
      refreshToken,
```
**Line 100:** The token to verify.

```javascript
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
```
**Line 101:** The secret key to verify against.

```javascript
    );
```
**Line 102:** Closes jwt.verify call.

```javascript
    const user = await User.findById(decoded.userId);
```
**Line 103:** Fetches the user from database using the userId from the token.

```javascript
    if (!user || !user.is_active) {
```
**Line 104:** Checks if user exists and is active.

```javascript
      return res.status(401).json({
```
**Line 105:** Returns 401 if user invalid.

```javascript
        success: false,
```
**Line 106:** Sets success to false.

```javascript
        message: 'Invalid refresh token'
```
**Line 107:** Error message.

```javascript
      });
```
**Line 108:** Closes JSON response.

```javascript
    }
```
**Line 109:** Closes validation if block.

```javascript
    const newToken = jwt.sign(
```
**Line 110:** Generates a new access token.

```javascript
      { userId: user.id, role: user.role },
```
**Line 111:** Token payload with user ID and role.

```javascript
      process.env.JWT_SECRET,
```
**Line 112:** Secret key.

```javascript
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
```
**Line 113:** Expiration time.

```javascript
    );
```
**Line 114:** Closes jwt.sign call.

```javascript
    await auditLog(
```
**Line 115:** Logs the token refresh event.

```javascript
      user.id,
```
**Line 116:** User ID.

```javascript
      'TOKEN_REFRESH',
```
**Line 117:** Action type.

```javascript
      'users',
```
**Line 118:** Table name.

```javascript
      user.id,
```
**Line 119:** Record ID.

```javascript
      null,
```
**Line 120:** No old values.

```javascript
      null,
```
**Line 121:** No new values (token not stored in DB).

```javascript
      req.ip,
```
**Line 122:** IP address.

```javascript
      req.get('User-Agent')
```
**Line 123:** User agent.

```javascript
    );
```
**Line 124:** Closes auditLog call.

```javascript
    res.json({
```
**Line 125:** Returns JSON response.

```javascript
      success: true,
```
**Line 126:** Sets success to true.

```javascript
      message: 'Token refreshed successfully',
```
**Line 127:** Success message.

```javascript
      data: {
```
**Line 128:** Starts data object.

```javascript
        token: newToken
```
**Line 129:** New access token.

```javascript
      }
```
**Line 130:** Closes data object.

```javascript
    });
```
**Line 131:** Closes JSON response.

```javascript
  } catch (error) {
```
**Line 132:** Catches errors (invalid token, etc.).

```javascript
    return res.status(401).json({
```
**Line 133:** Returns 401 for invalid token.

```javascript
      success: false,
```
**Line 134:** Sets success to false.

```javascript
      message: 'Invalid or expired refresh token'
```
**Line 135:** Error message.

```javascript
    });
```
**Line 136:** Closes JSON response.

```javascript
  }
```
**Line 137:** Closes catch block.

```javascript
};
```
**Line 138:** Closes refreshToken function.

---

## 6. Password Change Flow

### File: `src/controllers/authController.js` (Lines 135-187)

```javascript
exports.changePassword = async (req, res) => {
```
**Line 135:** Exports changePassword function.

```javascript
  try {
```
**Line 136:** Starts try-catch block.

```javascript
    const { current_password, new_password, confirm_password } = req.body;
```
**Line 137:** Extracts password fields from request body.

```javascript
    const userId = req.user.id;
```
**Line 138:** Gets user ID from the authenticated request (set by auth middleware).

```javascript
    if (!current_password || !new_password || !confirm_password) {
```
**Line 139:** Validates all password fields are present.

```javascript
      return res.status(400).json({
```
**Line 140:** Returns 400 if validation fails.

```javascript
        success: false,
```
**Line 141:** Sets success to false.

```javascript
        message: 'All password fields are required'
```
**Line 142:** Error message.

```javascript
      });
```
**Line 143:** Closes JSON response.

```javascript
    }
```
**Line 144:** Closes validation if block.

```javascript
    if (new_password !== confirm_password) {
```
**Line 145:** Validates new passwords match.

```javascript
      return res.status(400).json({
```
**Line 146:** Returns 400 if mismatch.

```javascript
        success: false,
```
**Line 147:** Sets success to false.

```javascript
        message: 'New passwords do not match'
```
**Line 148:** Error message.

```javascript
      });
```
**Line 149:** Closes JSON response.

```javascript
    }
```
**Line 150:** Closes validation if block.

```javascript
    if (new_password.length < 8) {
```
**Line 151:** Validates minimum password length.

```javascript
      return res.status(400).json({
```
**Line 152:** Returns 400 if too short.

```javascript
        success: false,
```
**Line 153:** Sets success to false.

```javascript
        message: 'Password must be at least 8 characters long'
```
**Line 154:** Error message.

```javascript
      });
```
**Line 155:** Closes JSON response.

```javascript
    }
```
**Line 156:** Closes validation if block.

```javascript
    const user = await User.findById(userId);
```
**Line 157:** Fetches user from database.

```javascript
    if (!user) {
```
**Line 158:** Checks if user exists.

```javascript
      return res.status(404).json({
```
**Line 159:** Returns 404 if not found.

```javascript
        success: false,
```
**Line 160:** Sets success to false.

```javascript
        message: 'User not found'
```
**Line 161:** Error message.

```javascript
      });
```
**Line 162:** Closes JSON response.

```javascript
    }
```
**Line 163:** Closes validation if block.

```javascript
    const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
```
**Line 164:** Verifies current password is correct.

```javascript
    if (!isValidPassword) {
```
**Line 165:** Checks if current password is invalid.

```javascript
      return res.status(401).json({
```
**Line 166:** Returns 401 if invalid.

```javascript
        success: false,
```
**Line 167:** Sets success to false.

```javascript
        message: 'Current password is incorrect'
```
**Line 168:** Error message.

```javascript
      });
```
**Line 169:** Closes JSON response.

```javascript
    }
```
**Line 170:** Closes validation if block.

```javascript
    await User.updatePassword(userId, new_password);
```
**Line 171:** Calls User.updatePassword to update the password.

```javascript
    await auditLog(
```
**Line 172:** Logs the password change event.

```javascript
      userId,
```
**Line 173:** User ID.

```javascript
      'PASSWORD_CHANGE',
```
**Line 174:** Action type.

```javascript
      'users',
```
**Line 175:** Table name.

```javascript
      userId,
```
**Line 176:** Record ID.

```javascript
      null,
```
**Line 177:** No old values (password hash not logged for security).

```javascript
      null,
```
**Line 178:** No new values (password hash not logged).

```javascript
      req.ip,
```
**Line 179:** IP address.

```javascript
      req.get('User-Agent')
```
**Line 180:** User agent.

```javascript
    );
```
**Line 181:** Closes auditLog call.

```javascript
    res.json({
```
**Line 182:** Returns JSON response.

```javascript
      success: true,
```
**Line 183:** Sets success to true.

```javascript
      message: 'Password changed successfully'
```
**Line 184:** Success message.

```javascript
    });
```
**Line 185:** Closes JSON response.

```javascript
  } catch (error) {
```
**Line 186:** Catches errors.

```javascript
    console.error('Password change error:', error);
```
**Line 187:** Logs error.

```javascript
    res.status(500).json({
```
**Line 188:** Returns 500.

```javascript
      success: false,
```
**Line 189:** Sets success to false.

```javascript
      message: 'Internal server error'
```
**Line 190:** Error message.

```javascript
    });
```
**Line 191:** Closes JSON response.

```javascript
  }
```
**Line 192:** Closes catch block.

```javascript
};
```
**Line 193:** Closes changePassword function.

---

## 7. Authentication Middleware

### File: `src/middleware/auth.js` (Lines 4-48)

```javascript
const authMiddleware = async (req, res, next) => {
```
**Line 4:** Defines authentication middleware function.

```javascript
  try {
```
**Line 5:** Starts try-catch block.

```javascript
    const token = req.header('Authorization')?.replace('Bearer ', '');
```
**Line 6:** Extracts token from Authorization header, removes 'Bearer ' prefix if present. Optional chaining handles missing header.

```javascript
    if (!token) {
```
**Line 7:** Checks if token is missing.

```javascript
      return res.status(401).json({
```
**Line 8:** Returns 401 Unauthorized.

```javascript
        success: false,
```
**Line 9:** Sets success to false.

```javascript
        message: 'Access denied. No token provided.'
```
**Line 10:** Error message.

```javascript
      });
```
**Line 11:** Closes JSON response.

```javascript
    }
```
**Line 12:** Closes validation if block.

```javascript
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
```
**Line 13:** Verifies the token using the secret key. Throws error if invalid or expired.

```javascript
    const user = await User.findById(decoded.userId);
```
**Line 14:** Fetches user from database using userId from token payload.

```javascript
    if (!user) {
```
**Line 15:** Checks if user exists.

```javascript
      return res.status(401).json({
```
**Line 16:** Returns 401 if user not found.

```javascript
        success: false,
```
**Line 17:** Sets success to false.

```javascript
        message: 'Invalid token. User not found.'
```
**Line 18:** Error message.

```javascript
      });
```
**Line 19:** Closes JSON response.

```javascript
    }
```
**Line 20:** Closes validation if block.

```javascript
    if (!user.is_active) {
```
**Line 21:** Checks if user account is active.

```javascript
      return res.status(401).json({
```
**Line 22:** Returns 401 if inactive.

```javascript
        success: false,
```
**Line 23:** Sets success to false.

```javascript
        message: 'Account is inactive.'
```
**Line 24:** Error message.

```javascript
      });
```
**Line 25:** Closes JSON response.

```javascript
    }
```
**Line 26:** Closes validation if block.

```javascript
    req.user = user;
```
**Line 27:** Attaches user object to request for use in subsequent middleware/routes.

```javascript
    next();
```
**Line 28:** Calls next() to pass control to the next middleware or route handler.

```javascript
  } catch (error) {
```
**Line 29:** Catches errors (invalid token, etc.).

```javascript
    return res.status(401).json({
```
**Line 30:** Returns 401 for any authentication error.

```javascript
      success: false,
```
**Line 31:** Sets success to false.

```javascript
      message: 'Invalid token.'
```
**Line 32:** Generic error message (doesn't expose specific error).

```javascript
    });
```
**Line 33:** Closes JSON response.

```javascript
  }
```
**Line 34:** Closes catch block.

```javascript
};
```
**Line 35:** Closes middleware function.

---

## 8. Role Authorization Middleware

### File: `src/middleware/auth.js` (Lines 50-76)

```javascript
const roleMiddleware = (allowedRoles) => {
```
**Line 50:** Defines a middleware factory that takes allowed roles as parameter.

```javascript
  return (req, res, next) => {
```
**Line 51:** Returns the actual middleware function.

```javascript
    if (!req.user) {
```
**Line 52:** Checks if user is attached to request (should be set by auth middleware).

```javascript
      return res.status(401).json({
```
**Line 53:** Returns 401 if no user.

```javascript
        success: false,
```
**Line 54:** Sets success to false.

```javascript
        message: 'Authentication required.'
```
**Line 55:** Error message.

```javascript
      });
```
**Line 56:** Closes JSON response.

```javascript
    }
```
**Line 57:** Closes validation if block.

```javascript
    const userRole = req.user.role ? req.user.role.toUpperCase() : '';
```
**Line 58:** Gets user role and converts to uppercase for case-insensitive comparison.

```javascript
    const uppercaseAllowedRoles = allowedRoles.map(r => r.toUpperCase());
```
**Line 59:** Converts all allowed roles to uppercase.

```javascript
    if (!uppercaseAllowedRoles.includes(userRole)) {
```
**Line 60:** Checks if user role is in the allowed roles list.

```javascript
      console.log(`Role middleware - Access denied. User role '${userRole}' not in allowed list [${uppercaseAllowedRoles.join(', ')}]`);
```
**Line 61:** Logs the access denial for debugging.

```javascript
      return res.status(403).json({
```
**Line 62:** Returns 403 Forbidden (not 401 - user is authenticated but not authorized).

```javascript
        success: false,
```
**Line 63:** Sets success to false.

```javascript
        message: 'Access denied. Insufficient permissions.'
```
**Line 64:** Error message.

```javascript
      });
```
**Line 65:** Closes JSON response.

```javascript
    }
```
**Line 66:** Closes validation if block.

```javascript
    next();
```
**Line 67:** Calls next() to proceed if authorized.

```javascript
  };
```
**Line 68:** Closes returned middleware function.

```javascript
};
```
**Line 69:** Closes middleware factory.

---

## Summary

The authentication flow implements a comprehensive security system with:

1. **Password Security:** bcrypt hashing with configurable salt rounds (default 12)
2. **Token-based Auth:** JWT access tokens (1h) and refresh tokens (7d)
3. **Input Validation:** Required fields, password matching, minimum length
4. **Audit Logging:** All authentication events logged with IP and user agent
5. **Error Handling:** Specific error messages for different failure scenarios
6. **Middleware Chain:** Authentication followed by role-based authorization
7. **Security Best Practices:** Generic error messages, no password exposure in logs, constant-time password comparison
