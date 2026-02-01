#!/usr/bin/env node
/**
 * Build Docker images for code execution sandbox
 * Run: node scripts/build-docker-images.js
 */

const path = require('path');
const DockerSandbox = require('../src/engine/dockerSandbox');

async function main() {
    console.log('='.repeat(50));
    console.log('Building Docker Images for Code Execution Engine');
    console.log('='.repeat(50));
    console.log();

    // Check if Docker is available
    const dockerAvailable = await DockerSandbox.isAvailable();
    if (!dockerAvailable) {
        console.error('❌ Docker is not available. Please install Docker Desktop and try again.');
        process.exit(1);
    }

    console.log('✓ Docker is available');
    console.log();

    // Build images
    const dockerDir = path.join(__dirname, '..', 'docker');
    console.log(`Building images from: ${dockerDir}`);
    console.log();

    try {
        await DockerSandbox.buildImages(dockerDir);
        console.log();
        console.log('='.repeat(50));
        console.log('✅ All Docker images built successfully!');
        console.log('='.repeat(50));
        console.log();
        console.log('To enable Docker isolation, start the server with:');
        console.log('  USE_DOCKER=true npm start');
        console.log();
    } catch (error) {
        console.error();
        console.error('❌ Failed to build Docker images:', error.message);
        process.exit(1);
    }
}

main();
