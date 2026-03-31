const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'microfinance_system',
  port: process.env.DB_PORT || 3306, // Standard MySQL port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Remove problematic options that might cause connection issues
  // acquireTimeout: 60000,
  // timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4',
  // Add connection retry logic
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

const pool = mysql.createPool(dbConfig);

module.exports = {
  pool,
  async query(sql, params = []) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
  
  async getConnection() {
    try {
      return await pool.getConnection();
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  },
  
  async transaction(callback) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};
