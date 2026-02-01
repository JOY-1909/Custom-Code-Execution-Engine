const { spawn } = require('child_process');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Base Language Handler class
 */
class LanguageHandler {
    constructor(name) {
        this.name = name;
    }

    /**
     * Get file extension for this language
     */
    getExtension() {
        throw new Error('getExtension() must be implemented');
    }

    /**
     * Compile the code (if needed)
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async compile(filePath, dirPath) {
        return { success: true }; // Default: no compilation needed
    }

    /**
     * Get the execution command
     * @returns {object} - { command: string, args: string[] }
     */
    getExecutionCommand(filePath, dirPath) {
        throw new Error('getExecutionCommand() must be implemented');
    }

    /**
     * Execute the code and return results
     * @param {string} filePath - Path to the code file
     * @param {string} dirPath - Directory containing the code
     * @param {string} input - Optional stdin input
     */
    async execute(filePath, dirPath, input = '') {
        const { command, args } = this.getExecutionCommand(filePath, dirPath);

        return new Promise((resolve) => {
            const startTime = Date.now();
            let stdout = '';
            let stderr = '';
            let killed = false;

            const proc = spawn(command, args, {
                cwd: dirPath,
                timeout: config.TIMEOUT_MS,
                shell: true
            });

            // Set timeout
            const timeout = setTimeout(() => {
                killed = true;
                proc.kill('SIGKILL');
            }, config.TIMEOUT_MS);

            // Pipe stdin input if provided
            if (input && proc.stdin) {
                proc.stdin.write(input);
                proc.stdin.end();
            }

            proc.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            proc.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            proc.on('close', (exitCode) => {
                clearTimeout(timeout);
                const executionTime = Date.now() - startTime;

                if (killed) {
                    resolve({
                        stdout,
                        stderr: stderr + '\nExecution timed out (limit: ' + config.TIMEOUT_MS + 'ms)',
                        exitCode: -1,
                        executionTime,
                        status: 'error'
                    });
                } else {
                    resolve({
                        stdout,
                        stderr,
                        exitCode: exitCode || 0,
                        executionTime,
                        status: exitCode === 0 ? 'success' : 'error'
                    });
                }
            });

            proc.on('error', (err) => {
                clearTimeout(timeout);
                resolve({
                    stdout: '',
                    stderr: `Execution error: ${err.message}`,
                    exitCode: -1,
                    executionTime: Date.now() - startTime,
                    status: 'error'
                });
            });
        });
    }
}

module.exports = LanguageHandler;
