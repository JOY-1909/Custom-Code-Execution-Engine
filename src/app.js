const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('./utils/logger');
const routes = require('./api/routes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend')));

// API Routes
app.use('/api', routes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Serve frontend for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Error Handling
app.use((err, req, res, next) => {
    logger.error('Unhandled Error', err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

module.exports = app;
