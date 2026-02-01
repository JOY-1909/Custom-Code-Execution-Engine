const LanguageHandler = require('./languageHandler');
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('../config');

class CppHandler extends LanguageHandler {
    constructor() {
        super('cpp');
        this.gppPath = this.findCompiler();
        console.log(`[CppHandler] Using g++ at: ${this.gppPath}`);
    }

    /**
     * Find g++ compiler
     */
    findCompiler() {
        // Try to find g++ using 'where' command
        try {
            const result = execSync('where g++', { encoding: 'utf8', timeout: 5000 });
            const paths = result.trim().split('\r\n');
            if (paths.length > 0 && paths[0]) {
                return paths[0].trim();
            }
        } catch (e) {
            // Continue to fallback
        }

        // Known paths on Windows
        const commonPaths = [
            'C:\\ProgramData\\mingw64\\mingw64\\bin\\g++.exe',
            'C:\\ProgramData\\chocolatey\\bin\\g++.exe',
            'C:\\tools\\msys64\\mingw64\\bin\\g++.exe',
            'C:\\msys64\\mingw64\\bin\\g++.exe',
            'C:\\msys64\\ucrt64\\bin\\g++.exe',
            'C:\\mingw64\\bin\\g++.exe',
        ];

        for (const gppPath of commonPaths) {
            if (fs.existsSync(gppPath)) {
                return gppPath;
            }
        }

        return 'g++';
    }

    getExtension() {
        return '.cpp';
    }

    async compile(filePath, dirPath) {
        return new Promise((resolve) => {
            const outputPath = path.join(dirPath, 'program.exe');

            const proc = spawn(this.gppPath, [filePath, '-o', outputPath], {
                cwd: dirPath,
                timeout: config.TIMEOUT_MS,
                shell: false
            });

            let stderr = '';

            proc.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            proc.on('close', (exitCode) => {
                if (exitCode === 0) {
                    resolve({ success: true, outputPath });
                } else {
                    resolve({
                        success: false,
                        error: stderr || `Compilation failed (exit code: ${exitCode})`
                    });
                }
            });

            proc.on('error', (err) => {
                resolve({ success: false, error: `Compiler error: ${err.message}` });
            });
        });
    }

    /**
     * Override execute to handle paths with spaces properly
     */
    async execute(filePath, dirPath, input = '') {
        const exePath = path.join(dirPath, 'program.exe');

        return new Promise((resolve) => {
            const startTime = Date.now();
            let stdout = '';
            let stderr = '';
            let killed = false;

            // Use spawn without shell to handle paths with spaces
            const proc = spawn(exePath, [], {
                cwd: dirPath,
                timeout: config.TIMEOUT_MS,
                shell: false
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
                        stderr: stderr + '\nExecution timed out',
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

    getExecutionCommand(filePath, dirPath) {
        const exePath = path.join(dirPath, 'program.exe');
        return {
            command: exePath,
            args: []
        };
    }
}

module.exports = CppHandler;
