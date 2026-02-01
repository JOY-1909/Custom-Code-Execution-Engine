# Security Documentation

## Current Security Measures

### 1. Timeout Enforcement
- **Default**: 5 seconds (configurable in `config.js`)
- **Mechanism**: Process killed via SIGKILL after timeout
- **Prevents**: Infinite loops, resource exhaustion

### 2. Code Size Limits
- **Maximum**: 100KB of source code
- **Enforced at**: Controller validation layer
- **Prevents**: Memory exhaustion from large payloads

### 3. File Isolation
- **Unique directories**: Each execution gets UUID-based temp directory
- **Automatic cleanup**: Files deleted after execution completes
- **Prevents**: Cross-execution file access

### 4. No Network Access (Design)
- Code executes in child processes
- No explicit network capabilities provided
- Standard library network functions may still work (limitation)

---

## Threat Model

### Attack Vector 1: Infinite Loop
```python
while True:
    pass
```
**Mitigation**: Timeout kills process after 5 seconds  
**Status**: ✅ Mitigated

### Attack Vector 2: Fork Bomb
```python
import os
while True:
    os.fork()
```
**Mitigation**: Timeout + OS process limits  
**Status**: ⚠️ Partially mitigated (depends on OS limits)

### Attack Vector 3: File System Access
```python
with open('/etc/passwd') as f:
    print(f.read())
```
**Current Status**: ❌ Not blocked (requires Docker isolation)  
**Future Mitigation**: Docker container with restricted filesystem

### Attack Vector 4: Memory Exhaustion
```python
x = 'A' * (10 ** 10)
```
**Current Status**: ⚠️ Limited by OS  
**Future Mitigation**: Docker memory limits

### Attack Vector 5: Network Exfiltration
```python
import socket
# Could potentially make connections
```
**Current Status**: ❌ Not blocked  
**Future Mitigation**: Docker network isolation

---

## Recommended Enhancements (Phase 3)

### Docker Isolation
```dockerfile
# Per-language Dockerfile
FROM python:3.11-slim
RUN useradd -m sandbox
USER sandbox
WORKDIR /sandbox
```

**Benefits**:
- Filesystem isolation
- Network isolation  
- Memory limits via `--memory`
- CPU limits via `--cpus`
- No privileged access

### Resource Limits
```javascript
// Docker run command
docker run --rm \
  --memory=128m \
  --cpus=0.5 \
  --network=none \
  --user sandbox \
  python:3.11 python /code/script.py
```

---

## Security Checklist

| Feature                    | Status        |
|----------------------------|---------------|
| Timeout enforcement        | ✅ Implemented |
| Code size limits           | ✅ Implemented |
| Temp file cleanup          | ✅ Implemented |
| Unique execution dirs      | ✅ Implemented |
| Docker isolation           | ⏳ Phase 3     |
| Memory limits              | ⏳ Phase 3     |
| CPU limits                 | ⏳ Phase 3     |
| Network isolation          | ⏳ Phase 3     |
| Filesystem restrictions    | ⏳ Phase 3     |
