# Code Execution Engine

[![CI/CD](https://github.com/YOUR_USERNAME/code-execution-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/code-execution-engine/actions/workflows/ci.yml)

A production-grade, secure code execution engine that supports multiple programming languages. Built from scratch without external execution APIs.

## Features

- **Multi-Language Support**: Python, JavaScript (Node.js), Java, C++
- **Secure Execution**: Timeout limits, file isolation, cleanup
- **Modern UI**: TakeUforward-style dark-themed code editor
- **Auto Complexity Analysis**: Automatic Big-O detection
- **RESTful API**: Clean JSON API for code execution
- **CI/CD Ready**: GitHub Actions workflow included
- **Docker Ready**: Production Dockerfile and docker-compose

## Quick Start

### Prerequisites

- Node.js (v18+)
- Python 3
- Java JDK (javac, java)
- G++ compiler
- (Optional) Docker for containerized deployment

### Installation

```bash
cd code-execution-engine
npm install
npm start
```

Open `http://localhost:3000` in your browser.

---

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

### Using Dockerfile

```bash
docker build -t code-execution-engine .
docker run -p 3000:3000 code-execution-engine
```

---

## CI/CD Pipeline

This project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:

1. **Tests** on Node.js 18.x and 20.x
2. **Sets up** Python, Java, and G++
3. **Runs** automated tests
4. **Builds** Docker images for all languages
5. **Scans** for security vulnerabilities

### To Enable CI/CD:

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Code Execution Engine"
   git remote add origin https://github.com/YOUR_USERNAME/code-execution-engine.git
   git push -u origin main
   ```

2. GitHub Actions will automatically run on each push.

---

## API Usage

### Execute Code

```bash
POST /api/execute
Content-Type: application/json

{
  "language": "python",
  "code": "print('Hello, World!')",
  "input": ""
}
```

### Response

```json
{
  "stdout": "Hello, World!\n",
  "stderr": "",
  "exitCode": 0,
  "executionTime": 45,
  "status": "success",
  "complexity": {
    "timeComplexity": "O(1)",
    "spaceComplexity": "O(1)"
  }
}
```

### Health Check

```bash
GET /health
```

---

## Project Structure

```
code-execution-engine/
├── .github/workflows/ci.yml  # CI/CD Pipeline
├── src/
│   ├── engine/executor.js    # Execution orchestrator
│   ├── languages/            # Language handlers
│   ├── utils/                # Utilities
│   └── frontend/             # Web UI
├── docker/                   # Language-specific Dockerfiles
├── Dockerfile                # Production image
├── docker-compose.yml
└── Documentation:
    ├── ARCHITECTURE.md
    ├── EXECUTION_FLOW.md
    ├── SECURITY.md
    └── SCALABILITY.md
```

## Supported Languages

| Language   | Compiler/Runtime | Complexity |
|------------|------------------|------------|
| Python     | python3          | O(1)-O(n³) |
| JavaScript | node             | O(1)-O(n³) |
| Java       | javac + java     | O(1)-O(n³) |
| C++        | g++              | O(1)-O(n³) |

## Security

- **Timeout**: 5 second execution limit
- **File Isolation**: Unique temp directories
- **Cleanup**: Auto-delete temp files
- **Size Limits**: 100KB max code
- **Docker**: Container isolation ready

## License

ISC
