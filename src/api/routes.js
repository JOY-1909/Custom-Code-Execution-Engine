const express = require('express');
const router = express.Router();
const executeController = require('../controllers/executeController');

// POST /api/execute - Execute code
router.post('/execute', executeController.execute);

// GET /api/languages - List supported languages
router.get('/languages', executeController.getSupportedLanguages);

// GET /health - Health check for Docker/Kubernetes
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

module.exports = router;

