const express = require('express');
const router = express.Router();
const executeController = require('../controllers/executeController');
const Executor = require('../engine/executor');
const { executionLimiter } = require('../middleware/rateLimiter');

// POST /api/execute - Execute code (with stricter rate limit)
router.post('/execute', executionLimiter, executeController.execute);

// GET /api/languages - List supported languages
router.get('/languages', executeController.getSupportedLanguages);

// GET /api/status - Get execution engine status
router.get('/status', (req, res) => {
    res.status(200).json({
        executionMode: Executor.getExecutionMode(),
        dockerAvailable: Executor.isDockerAvailable(),
        supportedLanguages: ['python', 'javascript', 'java', 'cpp'],
        rateLimits: {
            api: '30 requests/minute',
            execution: '10 executions/minute'
        }
    });
});

// GET /health - Health check for Docker/Kubernetes
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        executionMode: Executor.getExecutionMode()
    });
});

module.exports = router;
