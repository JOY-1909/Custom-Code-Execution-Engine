/**
 * Prometheus Metrics for Code Execution Engine
 * Exposes /metrics endpoint for monitoring
 */

const client = require('prom-client');

// Create a Registry
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

const codeExecutionDuration = new client.Histogram({
    name: 'code_execution_duration_seconds',
    help: 'Duration of code execution in seconds',
    labelNames: ['language', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const codeExecutionTotal = new client.Counter({
    name: 'code_executions_total',
    help: 'Total number of code executions',
    labelNames: ['language', 'status']
});

const activeExecutions = new client.Gauge({
    name: 'active_executions',
    help: 'Number of currently running code executions'
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(codeExecutionDuration);
register.registerMetric(codeExecutionTotal);
register.registerMetric(activeExecutions);

// Middleware to track HTTP request duration
const httpMetricsMiddleware = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
    });

    next();
};

// Functions to record execution metrics
const recordExecution = (language, status, durationMs) => {
    codeExecutionTotal.labels(language, status).inc();
    codeExecutionDuration.labels(language, status).observe(durationMs / 1000);
};

const incrementActiveExecutions = () => activeExecutions.inc();
const decrementActiveExecutions = () => activeExecutions.dec();

// Get metrics
const getMetrics = async () => {
    return await register.metrics();
};

const getContentType = () => {
    return register.contentType;
};

module.exports = {
    httpMetricsMiddleware,
    recordExecution,
    incrementActiveExecutions,
    decrementActiveExecutions,
    getMetrics,
    getContentType
};
