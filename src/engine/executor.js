const LanguageFactory = require('../languages');
const fileManager = require('../utils/fileManager');
const ComplexityAnalyzer = require('../utils/complexityAnalyzer');
const logger = require('../utils/logger');

const Executor = {
    /**
     * Execute code in the specified language
     * @param {string} code - Source code to execute
     * @param {string} language - Language identifier
     * @param {string} input - Optional stdin input
     * @returns {Promise<object>} - Execution result with complexity analysis
     */
    async run(code, language, input = '') {
        const handler = LanguageFactory.getHandler(language);

        if (!handler) {
            return {
                stdout: '',
                stderr: `Unsupported language: ${language}. Supported: ${LanguageFactory.getSupportedLanguages().join(', ')}`,
                exitCode: -1,
                executionTime: 0,
                status: 'error'
            };
        }

        // Analyze complexity before execution
        const complexity = ComplexityAnalyzer.analyze(code, language);
        logger.info(`Complexity analysis: Time=${complexity.timeComplexity}, Space=${complexity.spaceComplexity}`);

        let tempFile = null;

        try {
            // Create temp file
            tempFile = fileManager.createTempFile(code, handler.getExtension());
            logger.info(`Created temp file: ${tempFile.filePath}`);

            // Compile if needed
            const compileResult = await handler.compile(tempFile.filePath, tempFile.dirPath);

            if (!compileResult.success) {
                logger.info(`Compilation failed for ${language}`);
                return {
                    stdout: '',
                    stderr: compileResult.error,
                    exitCode: 1,
                    executionTime: 0,
                    status: 'error',
                    complexity
                };
            }

            // Execute with input
            logger.info(`Executing ${language} code...`);
            const result = await handler.execute(tempFile.filePath, tempFile.dirPath, input);
            logger.info(`Execution completed with exit code: ${result.exitCode}`);

            // Add complexity to result
            result.complexity = complexity;

            return result;

        } catch (error) {
            logger.error('Executor error:', error);
            return {
                stdout: '',
                stderr: `Internal error: ${error.message}`,
                exitCode: -1,
                executionTime: 0,
                status: 'error',
                complexity
            };
        } finally {
            // Cleanup
            if (tempFile) {
                fileManager.cleanup(tempFile.dirPath);
                logger.info(`Cleaned up: ${tempFile.dirPath}`);
            }
        }
    }
};

module.exports = Executor;
