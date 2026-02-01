const API_URL = '/api/execute';

const codeEditor = document.getElementById('code-editor');
const inputBox = document.getElementById('input-box');
const languageSelect = document.getElementById('language-select');
const runBtn = document.getElementById('run-btn');
const outputConsole = document.getElementById('output-console');
const execTimeSpan = document.getElementById('exec-time');
const memoryUsageSpan = document.getElementById('memory-usage');
const statusText = document.getElementById('status-text');
const statusIcon = document.querySelector('.status-icon');
const timeComplexity = document.getElementById('time-complexity');
const spaceComplexity = document.getElementById('space-complexity');
const timeExplanation = document.getElementById('time-explanation');
const spaceExplanation = document.getElementById('space-explanation');

// Tab functionality
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(`${target}-section`).classList.add('active');
    });
});

// Default code templates - simple Hello World
const defaultCode = {
    python: `# Write your Python code here
print("Hello, World!")`,

    javascript: `// Write your JavaScript code here
console.log("Hello, World!");`,

    java: `public class Main {
    public static void main(String[] args) {
        // Write your Java code here
        System.out.println("Hello, World!");
    }
}`,

    cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your C++ code here
    cout << "Hello, World!" << endl;
    return 0;
}`
};

// Default input (empty)
const defaultInput = ``;

// Initialize
codeEditor.value = defaultCode[languageSelect.value];
inputBox.value = defaultInput;

// Language change handler
languageSelect.addEventListener('change', () => {
    codeEditor.value = defaultCode[languageSelect.value] || '';
});

// Run button handler
runBtn.addEventListener('click', runCode);

async function runCode() {
    const code = codeEditor.value;
    const input = inputBox.value;
    const language = languageSelect.value;

    if (!code.trim()) {
        showOutput('Please enter some code to execute.', true);
        return;
    }

    setLoading(true);

    // Switch to output tab
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    document.querySelector('[data-tab="output"]').classList.add('active');
    document.getElementById('output-section').classList.add('active');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language, input }),
        });

        const result = await response.json();

        if (result.status === 'success' || result.status === 'error') {
            let output = '';
            if (result.stdout) output += result.stdout;
            if (result.stderr) output += (output ? '\n' : '') + result.stderr;

            showOutput(output || '(No output)', result.status === 'error');
            showMetrics(result.executionTime, result.memoryUsage, result.status);

            // Show auto-detected complexity
            if (result.complexity) {
                showComplexity(result.complexity);
            }
        } else {
            showOutput(result.message || 'Unknown error occurred', true);
            showMetrics(0, 0, 'error');
        }
    } catch (error) {
        showOutput(`Connection error: ${error.message}`, true);
        showMetrics(0, 0, 'error');
    } finally {
        setLoading(false);
    }
}

function showOutput(text, isError = false) {
    outputConsole.innerHTML = '';
    const span = document.createElement('span');
    span.textContent = text;
    if (isError) span.classList.add('output-error');
    outputConsole.appendChild(span);
}

function showMetrics(time, memory, status) {
    execTimeSpan.textContent = time !== undefined ? `${time} ms` : '-- ms';
    memoryUsageSpan.textContent = memory !== undefined ? `${memory} MB` : '~1 MB';

    // Update status
    statusIcon.className = 'metric-icon status-icon';
    statusText.className = 'metric-value';

    if (status === 'success') {
        statusIcon.classList.add('success');
        statusText.textContent = 'Accepted';
        statusText.classList.add('status-success');
    } else {
        statusIcon.classList.add('error');
        statusText.textContent = 'Error';
        statusText.classList.add('status-error');
    }
}

function showComplexity(complexity) {
    // Time complexity
    timeComplexity.textContent = complexity.timeComplexity || '--';
    timeExplanation.textContent = complexity.timeExplanation || '';

    // Space complexity
    spaceComplexity.textContent = complexity.spaceComplexity || '--';
    spaceExplanation.textContent = complexity.spaceExplanation || '';

    // Color coding based on complexity
    colorCodeComplexity(timeComplexity, complexity.timeComplexity);
    colorCodeComplexity(spaceComplexity, complexity.spaceComplexity);
}

function colorCodeComplexity(element, value) {
    // Remove existing classes
    element.style.color = '';

    // Color based on efficiency
    const colors = {
        'O(1)': '#4caf50',        // Green - best
        'O(log n)': '#8bc34a',    // Light green
        'O(n)': '#ffeb3b',        // Yellow - good
        'O(n log n)': '#ff9800',  // Orange
        'O(n²)': '#ff5722',       // Deep orange
        'O(n³)': '#f44336',       // Red - bad
        'O(2^n)': '#9c27b0',      // Purple - worst
    };

    element.style.color = colors[value] || '#dcdcaa';
}

function setLoading(loading) {
    runBtn.disabled = loading;
    if (loading) {
        runBtn.innerHTML = '<span class="loading"></span>';
        outputConsole.innerHTML = '<span class="output-placeholder">Running...</span>';
        statusText.textContent = 'Running...';
        statusText.className = 'metric-value status-running';
        statusIcon.className = 'metric-icon status-icon';

        // Reset complexity
        timeComplexity.textContent = '...';
        spaceComplexity.textContent = '...';
        timeExplanation.textContent = 'Analyzing...';
        spaceExplanation.textContent = 'Analyzing...';
    } else {
        runBtn.innerHTML = '<span class="btn-icon">▶</span> Run';
    }
}

// Tab key support
codeEditor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = codeEditor.selectionStart;
        const end = codeEditor.selectionEnd;
        codeEditor.value = codeEditor.value.substring(0, start) + '    ' + codeEditor.value.substring(end);
        codeEditor.selectionStart = codeEditor.selectionEnd = start + 4;
    }
});

// Ctrl+Enter to run
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
    }
});
