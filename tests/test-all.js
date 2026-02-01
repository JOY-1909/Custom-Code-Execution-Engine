// Test suite for the Code Execution Engine
// Run with: node tests/test-all.js

const http = require('http');

const API_URL = 'http://localhost:3000/api/execute';

const testCases = [
    {
        name: 'Python - Hello World',
        language: 'python',
        code: 'print("Hello from Python!")',
        expectedOutput: 'Hello from Python!'
    },
    {
        name: 'JavaScript - Hello World',
        language: 'javascript',
        code: 'console.log("Hello from Node.js!");',
        expectedOutput: 'Hello from Node.js!'
    },
    {
        name: 'Java - Hello World',
        language: 'java',
        code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}`,
        expectedOutput: 'Hello from Java!'
    },
    {
        name: 'C++ - Hello World',
        language: 'cpp',
        code: `#include <iostream>
using namespace std;
int main() {
    cout << "Hello from C++!" << endl;
    return 0;
}`,
        expectedOutput: 'Hello from C++!'
    },
    {
        name: 'Python - Syntax Error',
        language: 'python',
        code: 'print("unclosed',
        expectError: true
    },
    {
        name: 'Python - Math',
        language: 'python',
        code: 'print(2 + 2)',
        expectedOutput: '4'
    }
];

async function runTest(testCase) {
    return new Promise((resolve) => {
        const data = JSON.stringify({
            language: testCase.language,
            code: testCase.code
        });

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/execute',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    const passed = testCase.expectError
                        ? result.status === 'error'
                        : result.stdout.includes(testCase.expectedOutput);

                    resolve({
                        name: testCase.name,
                        passed,
                        result
                    });
                } catch (e) {
                    resolve({
                        name: testCase.name,
                        passed: false,
                        error: e.message
                    });
                }
            });
        });

        req.on('error', (e) => {
            resolve({
                name: testCase.name,
                passed: false,
                error: e.message
            });
        });

        req.write(data);
        req.end();
    });
}

async function runAllTests() {
    console.log('Running Code Execution Engine Tests\n');
    console.log('='.repeat(50));

    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
        const result = await runTest(testCase);

        if (result.passed) {
            console.log(`✅ PASS: ${result.name}`);
            passed++;
        } else {
            console.log(`❌ FAIL: ${result.name}`);
            console.log(`   Error: ${result.error || JSON.stringify(result.result)}`);
            failed++;
        }
    }

    console.log('='.repeat(50));
    console.log(`\nResults: ${passed} passed, ${failed} failed`);

    process.exit(failed > 0 ? 1 : 0);
}

runAllTests();
