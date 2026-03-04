require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const path = require('path');

const routes = require('./routes');
const SchedulerService = require('./services/scheduler.service');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

const app = express();

// Middleware
app.use(cors());
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
