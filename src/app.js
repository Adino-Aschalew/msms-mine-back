require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const path = require('path');

const routes = require('./routes');
const SchedulerService = require('./services/scheduler.service');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

const app = express();



const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost and common local network IP patterns
    if (process.env.NODE_ENV === 'development') {
      const isLocalHost = origin.includes('localhost') || origin.includes('127.0.0.1');
      const isLocalIP = /^http:\/\/(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(origin);
      
      if (isLocalHost || isLocalIP) {
        return callback(null, true);
      }
    }
    
    // Check ALLOWED_ORIGINS and CORS_ORIGIN from environment
    const allowedFromEnv = [
      ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
      ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [])
    ];
    
    if (allowedFromEnv.includes(origin)) {
      return callback(null, true);
    }
    
    console.error(`CORS Reject: Origin [${origin}] not allowed`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


app.use('/api', routes);


SchedulerService.initialize();


app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
