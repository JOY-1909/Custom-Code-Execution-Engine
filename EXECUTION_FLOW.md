# Execution Flow Documentation

## Overview

This document details the step-by-step execution flow for each supported language.

## General Execution Flow

```
1. Client submits code via POST /api/execute
2. Controller validates request (language, code size)
3. Executor creates temp directory with unique UUID
4. Code saved to temp file with appropriate extension
5. Language handler selected via Factory
6. Compile step (Java/C++ only)
7. Execute with timeout
8. Capture stdout, stderr, exit code
9. Cleanup temp files
10. Return JSON response
```

---

## Python Execution

### Flow
```
code → code.py → python code.py → stdout/stderr
```

### Details
- **Extension**: `.py`
- **Compilation**: None (interpreted)
- **Runtime**: `python` command
- **Command**: `python <filepath>`

### Example
```python
# Input
print("Hello, World!")

# Execution
python /temp/uuid/code.py

# Output
{"stdout": "Hello, World!\n", "status": "success"}
```

---

## JavaScript Execution

### Flow
```
code → code.js → node code.js → stdout/stderr
```

### Details
- **Extension**: `.js`
- **Compilation**: None (interpreted)
- **Runtime**: `node` command
- **Command**: `node <filepath>`

### Example
```javascript
// Input
console.log("Hello, World!");

// Execution
node /temp/uuid/code.js

// Output
{"stdout": "Hello, World!\n", "status": "success"}
```

---

## Java Execution

### Flow
```
code → Main.java → javac Main.java → Main.class → java Main → stdout/stderr
```

### Details
- **Extension**: `.java`
- **Compilation**: `javac` (required)
- **Runtime**: `java` command
- **Compile Command**: `javac <filepath>`
- **Execute Command**: `java -cp <dirpath> <classname>`

### Example
```java
// Input
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}

// Compilation
javac /temp/uuid/Main.java

// Execution
java -cp /temp/uuid Main

// Output
{"stdout": "Hello, World!\n", "status": "success"}
```

### Compilation Error Handling
```java
// Input (invalid)
public class Main {
    public static void main(String[] args) {
        System.out.println("Missing quote)
    }
}

// Output
{"stderr": "Main.java:3: error: unclosed string literal", "status": "error"}
```

---

## C++ Execution

### Flow
```
code → code.cpp → g++ code.cpp -o program.exe → ./program.exe → stdout/stderr
```

### Details
- **Extension**: `.cpp`
- **Compilation**: `g++` (required)
- **Runtime**: Compiled binary
- **Compile Command**: `g++ <filepath> -o <dirpath>/program.exe`
- **Execute Command**: `<dirpath>/program.exe`

### Example
```cpp
// Input
#include <iostream>
using namespace std;
int main() {
    cout << "Hello, World!" << endl;
    return 0;
}

// Compilation
g++ /temp/uuid/code.cpp -o /temp/uuid/program.exe

// Execution
/temp/uuid/program.exe

// Output
{"stdout": "Hello, World!\n", "status": "success"}
```

---

## Error Handling

| Error Type        | Handling                                      |
|-------------------|-----------------------------------------------|
| Compilation Error | Returned in `stderr`, `status: "error"`       |
| Runtime Error     | Returned in `stderr`, non-zero `exitCode`     |
| Timeout           | Process killed, timeout message in `stderr`   |
| System Error      | 500 response with error message               |

## Timeout Behavior

- Default timeout: 5000ms
- Process killed with SIGKILL on timeout
- Response includes timeout message in stderr
- Exit code set to -1
