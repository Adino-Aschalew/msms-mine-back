const bcrypt = require('bcryptjs');

class HashUtils {
  static async hashPassword(password, saltRounds = 12) {
    try {
      const saltRoundsToUse = saltRounds || parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(password, saltRoundsToUse);
      return hashedPassword;
    } catch (error) {
      throw new Error(`Failed to hash password: ${error.message}`);
    }
  }

  static async comparePassword(password, hashedPassword) {
    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      return isMatch;
    } catch (error) {
      throw new Error(`Failed to compare password: ${error.message}`);
    }
  }

  static generateRandomToken(length = 32) {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
  }

  static generateApiKey() {
    const crypto = require('crypto');
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    return `api_${timestamp}_${randomBytes}`;
  }

  static hashApiKey(apiKey) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  static async hashData(data) {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(data));
    return hash.digest('hex');
  }

  static generateSecureId(prefix = '') {
    const crypto = require('crypto');
    const timestamp = Date.now().toString(36);
    const randomBytes = crypto.randomBytes(8).toString('hex');
    return prefix ? `${prefix}_${timestamp}_${randomBytes}` : `${timestamp}_${randomBytes}`;
  }

  static async createHashedToken(payload, secret = process.env.JWT_SECRET) {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    const hash = hmac.digest('hex');
    
    
    const token = Buffer.from(JSON.stringify(payload)).toString('base64') + '.' + hash;
    return token;
  }

  static async verifyHashedToken(token, secret = process.env.JWT_SECRET) {
    try {
      const [payloadBase64, hash] = token.split('.');
      
      
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(payloadBase64);
      const expectedHash = hmac.digest('hex');
      
      if (hash !== expectedHash) {
        throw new Error('Invalid token hash');
      }
      
      
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
      return payload;
    } catch (error) {
      throw new Error(`Failed to verify token: ${error.message}`);
    }
  }
}

module.exports = HashUtils;
