require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const path = require('path');

const routes = require('./routes');
const SchedulerService = require('./services/scheduler.service');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

const app = express();

// Middleware
// Configure CORS for frontend development and production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost ports
    if (process.env.NODE_ENV === 'development') {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8080',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:8080'
      ];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    }
    
    // In production, check against environment variable
    const allowedProductionOrigins = process.env.ALLOWED_ORIGINS ? 
      process.env.ALLOWED_ORIGINS.split(',') : [];
    
    if (allowedProductionOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Allow cookies for authentication
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api', routes);

// Initialize scheduler service
SchedulerService.initialize();

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
