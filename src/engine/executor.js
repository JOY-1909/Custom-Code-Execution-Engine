const LanguageFactory = require('../languages');
const fileManager = require('../utils/fileManager');
const ComplexityAnalyzer = require('../utils/complexityAnalyzer');
const DockerSandbox = require('./dockerSandbox');
const logger = require('../utils/logger');
const { recordExecution, incrementActiveExecutions, decrementActiveExecutions } = require('../utils/metrics');

// Check if Docker is available at startup
let dockerAvailable = false;
let useDocker = process.env.USE_DOCKER === 'true';

(async () => {
    dockerAvailable = await DockerSandbox.isAvailable();
    logger.info(`Docker availability: ${dockerAvailable}`);
    if (useDocker && !dockerAvailable) {
        logger.warn('USE_DOCKER=true but Docker is not available. Falling back to direct execution.');
        useDocker = false;
    }
})();

const Executor = {
    /**
     * Execute code in the specified language
     * @param {string} code - Source code to execute
     * @param {string} language - Language identifier
     * @param {string} input - Optional stdin input
     * @param {object} options - Execution options
     * @returns {Promise<object>} - Execution result with complexity analysis
     */
    async run(code, language, input = '', options = {}) {
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
        const startTime = Date.now();
        incrementActiveExecutions();

        try {
            // Create temp file
            tempFile = fileManager.createTempFile(code, handler.getExtension());
            logger.info(`Created temp file: ${tempFile.filePath}`);

            // Check if we should use Docker isolation
            const shouldUseDocker = options.useDocker || (useDocker && dockerAvailable);

            if (shouldUseDocker) {
                // Execute in Docker container
                logger.info(`Executing ${language} code in Docker container...`);
                const sandbox = new DockerSandbox({
                    memoryLimit: options.memoryLimit || '128m',
                    cpuLimit: options.cpuLimit || '0.5',
                    networkDisabled: options.networkDisabled !== false
                });

                const result = await sandbox.execute(language, tempFile.filePath, tempFile.dirPath, { input });
                result.complexity = complexity;
                result.executionMode = 'docker';

                logger.info(`Docker execution completed with exit code: ${result.exitCode}`);
                recordExecution(language, result.status, result.executionTime);
                return result;
            }

            // Compile if needed (direct execution mode)
            const compileResult = await handler.compile(tempFile.filePath, tempFile.dirPath);

            if (!compileResult.success) {
                logger.info(`Compilation failed for ${language}`);
                return {
                    stdout: '',
                    stderr: compileResult.error,
                    exitCode: 1,
                    executionTime: 0,
                    status: 'error',
                    complexity,
                    executionMode: 'direct'
                };
            }

            // Execute with input
            logger.info(`Executing ${language} code...`);
            const result = await handler.execute(tempFile.filePath, tempFile.dirPath, input);
            logger.info(`Execution completed with exit code: ${result.exitCode}`);

            // Add complexity to result
            result.complexity = complexity;
            result.executionMode = 'direct';

            recordExecution(language, result.status, result.executionTime);
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
            decrementActiveExecutions();
            // Cleanup
            if (tempFile) {
                fileManager.cleanup(tempFile.dirPath);
                logger.info(`Cleaned up: ${tempFile.dirPath}`);
            }
        }
    },

    /**
     * Check if Docker mode is available
     */
    isDockerAvailable() {
        return dockerAvailable;
    },

    /**
     * Get execution mode
     */
    getExecutionMode() {
        return useDocker && dockerAvailable ? 'docker' : 'direct';
    }
};

module.exports = Executor;
