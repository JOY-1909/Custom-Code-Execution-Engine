const LanguageHandler = require('./languageHandler');
const { spawn } = require('child_process');
const path = require('path');
const config = require('../config');

class JavaHandler extends LanguageHandler {
    constructor() {
        super('java');
    }

    getExtension() {
        return '.java';
    }

    async compile(filePath, dirPath) {
        return new Promise((resolve) => {
            const proc = spawn('javac', [`"${filePath}"`], {
                cwd: dirPath,
                timeout: config.TIMEOUT_MS,
                shell: true
            });

            let stderr = '';

            proc.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            proc.on('close', (exitCode) => {
                if (exitCode === 0) {
                    resolve({ success: true });
                } else {
                    resolve({ success: false, error: stderr || 'Compilation failed' });
                }
            });

            proc.on('error', (err) => {
                resolve({ success: false, error: `Compiler error: ${err.message}` });
            });
        });
    }

    getExecutionCommand(filePath, dirPath) {
        // Extract class name from filename
        const filename = path.basename(filePath, '.java');
        return {
            command: 'java',
            args: ['-cp', `"${dirPath}"`, filename]
        };
    }
}

module.exports = JavaHandler;
