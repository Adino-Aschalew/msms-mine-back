const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function migrateConsolidated() {
  try {
    console.log('🚀 Starting consolidated migration using schema_clean.sql...');
    
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    };
    
    console.log(`🔗 Connecting to MySQL at ${dbConfig.host}:${dbConfig.port}...`);
    
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Database connected');
    
    const schemaFile = path.join(__dirname, '../schema_clean.sql');
    if (!fs.existsSync(schemaFile)) {
      console.error(`❌ schema_clean.sql not found at ${schemaFile}`);
      process.exit(1);
    }
    
    const sql = fs.readFileSync(schemaFile, 'utf8');
    
    console.log('📄 Executing schema_clean.sql (this will drop and recreate the database if configured)...');
    
    // We should drop it manually if we want to ensure new columns are added 
    // because CREATE TABLE IF NOT EXISTS skips existing tables
    console.log(`🗑️  Dropping database ${process.env.DB_NAME || 'microfinance_system'} to ensure clean slate...`);
    await connection.execute(`DROP DATABASE IF EXISTS \`${process.env.DB_NAME || 'microfinance_system'}\``);
    
    // The script starts with CREATE DATABASE IF NOT EXISTS, so we can just run it
    await connection.query(sql);
    
    console.log('✅ schema_clean.sql executed successfully');
    
    await connection.end();
    console.log('🎉 Consolidated migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateConsolidated();
