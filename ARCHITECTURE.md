# Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ Code Editor │  │ Lang Select  │  │   Output Console       │  │
│  └─────────────┘  └──────────────┘  └────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP POST /api/execute
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER (Node.js)                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      API Layer                            │   │
│  │  routes.js → executeController.js                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Execution Engine                        │   │
│  │  executor.js → LanguageFactory → LanguageHandler          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 Language Handlers                         │   │
│  │  ┌─────────┐ ┌────────┐ ┌──────────┐ ┌─────────────────┐ │   │
│  │  │ Python  │ │  Java  │ │   C++    │ │   JavaScript    │ │   │
│  │  └─────────┘ └────────┘ └──────────┘ └─────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Utilities                               │   │
│  │  fileManager.js (temp files) │ logger.js (logging)        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SYSTEM RUNTIMES                              │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌────────────────┐    │
│  │ python  │  │  javac   │  │   g++   │  │     node       │    │
│  └─────────┘  └──────────┘  └─────────┘  └────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. API Layer (`src/api/`)
- **routes.js**: Defines REST endpoints
  - `POST /api/execute` - Execute code
  - `GET /api/languages` - List supported languages

### 2. Controller Layer (`src/controllers/`)
- **executeController.js**: Request validation and response formatting
  - Validates code and language fields
  - Enforces size limits (100KB)
  - Delegates to Executor

### 3. Execution Engine (`src/engine/`)
- **executor.js**: Orchestrates the execution pipeline
  - Creates temp files via fileManager
  - Gets appropriate handler via LanguageFactory
  - Runs compile step (if needed)
  - Runs execution step
  - Cleans up temp files

### 4. Language Handlers (`src/languages/`)
- **languageHandler.js**: Base class with execution logic
- **index.js**: Factory pattern for handler selection
- **pythonHandler.js**: Python execution (interpreted)
- **javascriptHandler.js**: Node.js execution (interpreted)
- **javaHandler.js**: Java compile + execute
- **cppHandler.js**: C++ compile + execute

### 5. Utilities (`src/utils/`)
- **fileManager.js**: Temp file creation and cleanup
- **logger.js**: Structured logging

## Design Patterns Used

| Pattern  | Usage                                       |
|----------|---------------------------------------------|
| Factory  | LanguageFactory creates language handlers   |
| Template | Base LanguageHandler with overridable steps |
| Strategy | Different handlers for different languages  |

## Data Flow

```
Request → Validation → TempFile Creation → Compile (optional) → Execute → Cleanup → Response
```
