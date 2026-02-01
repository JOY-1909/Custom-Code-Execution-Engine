# Scalability Documentation

## Current Architecture

### Single-Node Design
The current implementation runs as a single Node.js process handling all requests synchronously per execution.

```
[Client] → [Express Server] → [Child Process] → [Response]
```

### Current Limitations
- Sequential execution (one at a time per request)
- No request queuing
- Single process bottleneck

---

## Scalability Design

### Concurrency Model

Node.js handles concurrent HTTP requests natively. Code execution uses child processes which run in parallel:

```javascript
// Each execution spawns separate process
const proc = spawn(command, args, { timeout: 5000 });
```

**Current Capacity**: 5-10 concurrent executions (limited by system resources)

### Recommended Enhancements

#### 1. Worker Pool Pattern
```javascript
// Limit concurrent executions
const MAX_WORKERS = 4;
let activeWorkers = 0;
const queue = [];

async function executeWithPool(code, language) {
    if (activeWorkers >= MAX_WORKERS) {
        return new Promise(resolve => queue.push({ code, language, resolve }));
    }
    activeWorkers++;
    const result = await Executor.run(code, language);
    activeWorkers--;
    if (queue.length > 0) {
        const next = queue.shift();
        next.resolve(executeWithPool(next.code, next.language));
    }
    return result;
}
```

#### 2. Request Queue (Redis/Bull)
```
[Clients] → [API Server] → [Redis Queue] → [Worker Pool] → [Results]
```

#### 3. Horizontal Scaling
```
                    ┌──────────────┐
                    │ Load Balancer│
                    └──────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   ┌───────────┐    ┌───────────┐    ┌───────────┐
   │  Node 1   │    │  Node 2   │    │  Node 3   │
   │ (Workers) │    │ (Workers) │    │ (Workers) │
   └───────────┘    └───────────┘    └───────────┘
```

**Requirements for Horizontal Scaling**:
- Stateless execution engine (✅ current design)
- Shared queue (Redis)
- Load balancer (nginx, HAProxy)

---

## Performance Characteristics

### Baseline Metrics (Estimated)

| Metric                | Value           |
|-----------------------|-----------------|
| Startup Time          | ~50ms           |
| Simple Python Exec    | ~100-200ms      |
| Java Compile + Exec   | ~500-1000ms     |
| C++ Compile + Exec    | ~300-500ms      |
| Max Concurrent        | 5-10            |

### Bottlenecks

1. **Compilation**: Java/C++ compilation adds latency
2. **Process Spawn**: Child process creation overhead
3. **File I/O**: Temp file creation/deletion

### Optimization Opportunities

1. **Compiled Code Cache**: Cache .class/.exe for repeated code
2. **Pre-warmed Containers**: Keep Docker containers ready
3. **Memory Disk**: Use tmpfs for faster file operations

---

## Load Testing Plan

### Test Scenarios

1. **Sequential Baseline**
   - 10 sequential requests
   - Measure average response time

2. **Concurrent Load**
   - 5 simultaneous requests
   - Measure throughput and latency

3. **Stress Test**
   - 20+ concurrent requests
   - Verify graceful degradation

### Sample Test Script
```javascript
// test/load-test.js
const fetch = require('node-fetch');

async function runTest(concurrent) {
    const promises = Array(concurrent).fill().map(() =>
        fetch('http://localhost:3000/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language: 'python',
                code: 'print("test")'
            })
        })
    );
    
    const start = Date.now();
    await Promise.all(promises);
    console.log(`${concurrent} requests: ${Date.now() - start}ms`);
}

runTest(5);
```
