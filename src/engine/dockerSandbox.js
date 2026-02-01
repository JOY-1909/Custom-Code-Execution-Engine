const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const logger = require('../utils/logger');

const DOCKER_IMAGES = {
    python: 'code-exec-python',
    javascript: 'code-exec-node',
    java: 'code-exec-java',
    cpp: 'code-exec-cpp'
};

const DOCKER_COMMANDS = {
    python: (filePath) => ['python3', filePath],
    javascript: (filePath) => ['node', filePath],
    java: (filePath, className) => ['sh', '-c', `cp ${filePath} /tmp/ && javac /tmp/*.java && java -cp /tmp ${className}`],
    cpp: (filePath) => ['sh', '-c', `cp ${filePath} /tmp/code.cpp && g++ /tmp/code.cpp -o /tmp/program && /tmp/program`]
};

class DockerSandbox {
    constructor(options = {}) {
        this.memoryLimit = options.memoryLimit || '128m';
        this.cpuLimit = options.cpuLimit || '0.5';
        this.timeout = options.timeout || config.TIMEOUT_MS;
        this.networkDisabled = options.networkDisabled !== false;
    }

    /**
     * Execute code in a Docker container
     * @param {string} language - Language identifier
     * @param {string} codePath - Path to code file on host
     * @param {string} dirPath - Directory containing the code
     * @param {object} options - Additional options (input for stdin)
     * @returns {Promise<object>} - Execution result
     */
    async execute(language, codePath, dirPath, options = {}) {
        const image = DOCKER_IMAGES[language];
        if (!image) {
            return {
                stdout: '',
                stderr: `No Docker image configured for language: ${language}`,
                exitCode: -1,
                executionTime: 0,
                status: 'error'
            };
        }

        const filename = path.basename(codePath);
        const className = filename.replace('.java', '');
        const containerCodePath = `/sandbox/${filename}`;

        // Build Docker run command
        const dockerArgs = [
            'run',
            '--rm',                                    // Remove container after execution
            '-i',                                      // Interactive mode for stdin
            `--memory=${this.memoryLimit}`,            // Memory limit
            `--cpus=${this.cpuLimit}`,                 // CPU limit
            '--pids-limit=50',                         // Limit number of processes
            '--tmpfs', '/tmp:rw,size=64m',             // Writable temp space
            '-v', `${dirPath}:/sandbox:ro`,            // Mount code directory read-only
            '-w', '/sandbox'                           // Working directory
        ];

        // Disable network if configured
        if (this.networkDisabled) {
            dockerArgs.push('--network=none');
        }

        // Add image name
        dockerArgs.push(image);

        // Add execution command
        const execCmd = DOCKER_COMMANDS[language](containerCodePath, className);
        dockerArgs.push(...execCmd);

        return new Promise((resolve) => {
            const startTime = Date.now();
            let stdout = '';
            let stderr = '';
            let killed = false;

            logger.info(`Docker command: docker ${dockerArgs.join(' ')}`);

            const proc = spawn('docker', dockerArgs, {
                timeout: this.timeout
            });

            // Set timeout
            const timeoutHandle = setTimeout(() => {
                killed = true;
                proc.kill('SIGKILL');
            }, this.timeout);

            // Pipe stdin input if provided
            if (options.input && proc.stdin) {
                proc.stdin.write(options.input);
                proc.stdin.end();
            } else if (proc.stdin) {
                proc.stdin.end();
            }

            proc.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            proc.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            proc.on('close', (exitCode) => {
                clearTimeout(timeoutHandle);
                const executionTime = Date.now() - startTime;

                if (killed) {
                    resolve({
                        stdout,
                        stderr: stderr + `\nExecution timed out (limit: ${this.timeout}ms)`,
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
                clearTimeout(timeoutHandle);
                resolve({
                    stdout: '',
                    stderr: `Docker execution error: ${err.message}`,
                    exitCode: -1,
                    executionTime: Date.now() - startTime,
                    status: 'error'
                });
            });
        });
    }

    /**
     * Check if Docker is available
     */
    static async isAvailable() {
        return new Promise((resolve) => {
            const proc = spawn('docker', ['--version']);
            proc.on('close', (code) => resolve(code === 0));
            proc.on('error', () => resolve(false));
        });
    }

    /**
     * Check if Docker images are built
     */
    static async areImagesBuilt() {
        const images = Object.values(DOCKER_IMAGES);
        for (const image of images) {
            const exists = await new Promise((resolve) => {
                const proc = spawn('docker', ['image', 'inspect', image]);
                proc.on('close', (code) => resolve(code === 0));
                proc.on('error', () => resolve(false));
            });
            if (!exists) return false;
        }
        return true;
    }

    /**
     * Build all Docker images for code execution
     */
    static async buildImages(dockerDir) {
        const builds = [
            { name: 'code-exec-python', file: 'Dockerfile.python' },
            { name: 'code-exec-node', file: 'Dockerfile.node' },
            { name: 'code-exec-java', file: 'Dockerfile.java' },
            { name: 'code-exec-cpp', file: 'Dockerfile.cpp' }
        ];

        for (const build of builds) {
            const dockerfilePath = path.join(dockerDir, build.file);
            if (!fs.existsSync(dockerfilePath)) {
                logger.warn(`Dockerfile not found: ${dockerfilePath}`);
                continue;
            }

            logger.info(`Building Docker image: ${build.name}`);
            await new Promise((resolve, reject) => {
                const proc = spawn('docker', [
                    'build',
                    '-t', build.name,
                    '-f', dockerfilePath,
                    dockerDir
                ]);

                proc.stdout.on('data', (data) => process.stdout.write(data));
                proc.stderr.on('data', (data) => process.stderr.write(data));
                proc.on('close', (code) => {
                    if (code === 0) {
                        logger.info(`Successfully built ${build.name}`);
                        resolve();
                    } else {
                        reject(new Error(`Failed to build ${build.name}`));
                    }
                });
            });
        }
    }
}

module.exports = DockerSandbox;
