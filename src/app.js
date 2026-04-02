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
    
    if (!origin) return callback(null, true);
    
    
    if (process.env.NODE_ENV === 'development') {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173'
      ];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    }
    
    
    const allowedProductionOrigins = process.env.ALLOWED_ORIGINS ? 
      process.env.ALLOWED_ORIGINS.split(',') : [];
    
    if (allowedProductionOrigins.includes(origin)) {
      return callback(null, true);
    }
    
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
