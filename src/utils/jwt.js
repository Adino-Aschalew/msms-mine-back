const jwt = require('jsonwebtoken');

class JwtUtils {
  static generateToken(payload, expiresIn = process.env.JWT_EXPIRES_IN || '24h') {
    try {
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
      return token;
    } catch (error) {
      throw new Error(`Failed to generate token: ${error.message}`);
    }
  }

  static generateRefreshToken(payload, expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d') {
    try {
      const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
      return refreshToken;
    } catch (error) {
      throw new Error(`Failed to generate refresh token: ${error.message}`);
    }
  }

  static verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw new Error(`Failed to verify token: ${error.message}`);
      }
    }
  }

  static decodeToken(token) {
    try {
      const decoded = jwt.decode(token, { complete: true });
      return decoded;
    } catch (error) {
      throw new Error(`Failed to decode token: ${error.message}`);
    }
  }

  static getTokenExpiration(token) {
    try {
      const decoded = jwt.decode(token);
      return decoded ? decoded.exp : null;
    } catch (error) {
      return null;
    }
  }

  static isTokenExpired(token) {
    try {
      const expiration = this.getTokenExpiration(token);
      if (!expiration) return true;
      
      return Date.now() >= expiration * 1000;
    } catch (error) {
      return true;
    }
  }

  static generateAuthToken(user) {
    const payload = {
      userId: user.id,
      employeeId: user.employee_id,
      role: user.role,
      username: user.username
    };

    const token = this.generateToken(payload);
    const refreshToken = this.generateRefreshToken({ userId: user.id });

    return {
      token,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      user: {
        id: user.id,
        employee_id: user.employee_id,
        username: user.username,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        department: user.department
      }
    };
  }

  static generatePasswordResetToken(userId, expiresIn = '1h') {
    const payload = {
      userId,
      type: 'password_reset',
      timestamp: Date.now()
    };

    return this.generateToken(payload, expiresIn);
  }

  static generateEmailVerificationToken(userId, expiresIn = '24h') {
    const payload = {
      userId,
      type: 'email_verification',
      timestamp: Date.now()
    };

    return this.generateToken(payload, expiresIn);
  }

  static verifyPasswordResetToken(token) {
    try {
      const decoded = this.verifyToken(token);
      
      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid token type');
      }

      
      const tokenAge = Date.now() - decoded.timestamp;
      if (tokenAge > 24 * 60 * 60 * 1000) {
        throw new Error('Token has expired');
      }

      return decoded.userId;
    } catch (error) {
      throw new Error(`Invalid password reset token: ${error.message}`);
    }
  }

  static verifyEmailVerificationToken(token) {
    try {
      const decoded = this.verifyToken(token);
      
      if (decoded.type !== 'email_verification') {
        throw new Error('Invalid token type');
      }

      return decoded.userId;
    } catch (error) {
      throw new Error(`Invalid email verification token: ${error.message}`);
    }
  }

  static generateApiToken(userId, permissions = [], expiresIn = '1y') {
    const payload = {
      userId,
      permissions,
      type: 'api_token',
      timestamp: Date.now()
    };

    return this.generateToken(payload, expiresIn);
  }

  static verifyApiToken(token) {
    try {
      const decoded = this.verifyToken(token);
      
      if (decoded.type !== 'api_token') {
        throw new Error('Invalid token type');
      }

      return {
        userId: decoded.userId,
        permissions: decoded.permissions
      };
    } catch (error) {
      throw new Error(`Invalid API token: ${error.message}`);
    }
  }

  static extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  static createTokenPair(user) {
    const accessToken = this.generateToken({
      userId: user.id,
      employeeId: user.employee_id,
      role: user.role
    });

    const refreshToken = this.generateRefreshToken({
      userId: user.id
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    };
  }
}

module.exports = JwtUtils;
