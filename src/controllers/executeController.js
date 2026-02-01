const Executor = require('../engine/executor');
const LanguageFactory = require('../languages');
const logger = require('../utils/logger');

const executeController = {
    async execute(req, res) {
        const { code, language, input } = req.body;

        // Validation
        if (!code || typeof code !== 'string') {
            return res.status(400).json({
                status: 'error',
                message: 'Missing or invalid "code" field'
            });
        }

        if (!language || typeof language !== 'string') {
            return res.status(400).json({
                status: 'error',
                message: 'Missing or invalid "language" field'
            });
        }

        if (!LanguageFactory.isSupported(language)) {
            return res.status(400).json({
                status: 'error',
                message: `Unsupported language: "${language}". Supported: ${LanguageFactory.getSupportedLanguages().join(', ')}`
            });
        }

        // Size limit check (100KB max)
        if (code.length > 100 * 1024) {
            return res.status(400).json({
                status: 'error',
                message: 'Code exceeds maximum size limit (100KB)'
            });
        }

        try {
            logger.info(`Execution request: language=${language}, codeLength=${code.length}`);

            const result = await Executor.run(code, language, input || '');

            res.json(result);
        } catch (error) {
            logger.error('Controller error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error',
                stderr: error.message
            });
        }
    },

    getSupportedLanguages(req, res) {
        res.json({
            languages: LanguageFactory.getSupportedLanguages()
        });
    }
};

module.exports = executeController;
