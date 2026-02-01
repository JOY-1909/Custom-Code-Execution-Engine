const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('./utils/logger');
const routes = require('./api/routes');
const { httpMetricsMiddleware, getMetrics, getContentType } = require('./utils/metrics');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Metrics middleware (track all requests)
app.use(httpMetricsMiddleware);

// Rate limiting for API routes
app.use('/api', apiLimiter);

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend')));

// API Routes
app.use('/api', routes);

// Prometheus Metrics Endpoint
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', getContentType());
        res.end(await getMetrics());
    } catch (err) {
        res.status(500).end(err.message);
    }
});

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
