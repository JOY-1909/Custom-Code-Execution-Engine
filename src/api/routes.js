const express = require('express');
const router = express.Router();
const executeController = require('../controllers/executeController');
const Executor = require('../engine/executor');

// POST /api/execute - Execute code
router.post('/execute', executeController.execute);

// GET /api/languages - List supported languages
router.get('/languages', executeController.getSupportedLanguages);

// GET /api/status - Get execution engine status
router.get('/status', (req, res) => {
    res.status(200).json({
        executionMode: Executor.getExecutionMode(),
        dockerAvailable: Executor.isDockerAvailable(),
        supportedLanguages: ['python', 'javascript', 'java', 'cpp']
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


