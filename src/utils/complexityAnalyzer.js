/**
 * Code Complexity Analyzer
 * Analyzes code to estimate time and space complexity based on patterns
 */

class ComplexityAnalyzer {
    /**
     * Analyze code and return complexity estimates
     * @param {string} code - Source code to analyze
     * @param {string} language - Programming language
     * @returns {object} - { timeComplexity, spaceComplexity, explanation }
     */
    static analyze(code, language) {
        const normalizedCode = this.normalizeCode(code, language);

        const timeAnalysis = this.analyzeTimeComplexity(normalizedCode, language);
        const spaceAnalysis = this.analyzeSpaceComplexity(normalizedCode, language);

        return {
            timeComplexity: timeAnalysis.complexity,
            timeExplanation: timeAnalysis.explanation,
            spaceComplexity: spaceAnalysis.complexity,
            spaceExplanation: spaceAnalysis.explanation
        };
    }

    /**
     * Normalize code for analysis (remove comments, strings)
     */
    static normalizeCode(code, language) {
        let normalized = code;

        // Remove single-line comments
        normalized = normalized.replace(/\/\/.*$/gm, '');
        normalized = normalized.replace(/#.*$/gm, '');

        // Remove multi-line comments
        normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '');
        normalized = normalized.replace(/"""[\s\S]*?"""/g, '');
        normalized = normalized.replace(/'''[\s\S]*?'''/g, '');

        // Remove strings (simplified)
        normalized = normalized.replace(/"[^"]*"/g, '""');
        normalized = normalized.replace(/'[^']*'/g, "''");

        return normalized.toLowerCase();
    }

    /**
     * Analyze time complexity
     */
    static analyzeTimeComplexity(code, language) {
        const patterns = {
            // Recursion patterns (exponential or logarithmic)
            recursion: {
                patterns: [
                    /function\s+\w+\s*\([^)]*\)[^{]*\{[^}]*\1\s*\(/,
                    /def\s+(\w+)\s*\([^)]*\):[^:]*\1\s*\(/,
                    /(\w+)\s*\([^)]*\)[^{]*\{[^}]*\1\s*\([^)]*\/\s*2/  // divide by 2 = log n
                ],
                complexity: 'O(2^n)',
                explanation: 'Recursive calls detected'
            }
        };

        // Count loop nesting
        const loopPatterns = {
            python: /\b(for|while)\b/g,
            javascript: /\b(for|while|forEach|map|filter|reduce)\b/g,
            java: /\b(for|while)\b/g,
            cpp: /\b(for|while)\b/g
        };

        const loopPattern = loopPatterns[language] || loopPatterns.javascript;
        const lines = code.split('\n');

        let maxNesting = 0;
        let currentNesting = 0;
        let hasRecursion = false;
        let hasBinarySearch = false;
        let hasSorting = false;
        let hasHashMap = false;

        // Detect patterns
        const binarySearchPatterns = [
            /mid\s*=.*\/\s*2/,
            /left.*right.*mid/,
            /low.*high.*mid/,
            /binary.?search/i
        ];

        const sortingPatterns = [
            /\.sort\s*\(/,
            /sorted\s*\(/,
            /Arrays\.sort/,
            /Collections\.sort/,
            /std::sort/,
            /merge.?sort|quick.?sort|heap.?sort/i
        ];

        const hashPatterns = [
            /\bdict\s*\(/,
            /\bset\s*\(/,
            /\{\s*\}/,
            /new\s+HashMap/,
            /new\s+HashSet/,
            /new\s+Map\s*\(/,
            /new\s+Set\s*\(/,
            /unordered_map/,
            /unordered_set/
        ];

        // Check for special patterns
        hasBinarySearch = binarySearchPatterns.some(p => p.test(code));
        hasSorting = sortingPatterns.some(p => p.test(code));
        hasHashMap = hashPatterns.some(p => p.test(code));

        // Analyze line by line for loop nesting
        for (const line of lines) {
            const loopMatches = line.match(loopPattern);
            if (loopMatches) {
                currentNesting += loopMatches.length;
            }

            // Check for closing braces/dedent (simplified)
            const closingBraces = (line.match(/\}/g) || []).length;
            currentNesting = Math.max(0, currentNesting - closingBraces);

            maxNesting = Math.max(maxNesting, currentNesting);
        }

        // Simple loop count (fallback)
        const allLoops = code.match(loopPattern);
        const loopCount = allLoops ? allLoops.length : 0;

        // Estimate nesting based on indentation patterns for Python
        if (language === 'python') {
            const indentPattern = /^(\s*)(?:for|while)\b/gm;
            let match;
            const indentLevels = [];
            while ((match = indentPattern.exec(code)) !== null) {
                indentLevels.push(match[1].length);
            }
            if (indentLevels.length > 0) {
                const uniqueLevels = [...new Set(indentLevels)].sort((a, b) => a - b);
                maxNesting = Math.max(maxNesting, uniqueLevels.length);
            }
        }

        // Determine complexity
        let complexity, explanation;

        if (hasBinarySearch && maxNesting <= 1) {
            complexity = 'O(log n)';
            explanation = 'Binary search pattern detected';
        } else if (hasSorting && maxNesting <= 1) {
            complexity = 'O(n log n)';
            explanation = 'Sorting operation detected';
        } else if (hasSorting && maxNesting >= 2) {
            complexity = 'O(n² log n)';
            explanation = 'Sorting with nested loops';
        } else if (maxNesting >= 3 || loopCount >= 3) {
            complexity = 'O(n³)';
            explanation = 'Triple nested loops detected';
        } else if (maxNesting >= 2 || loopCount >= 2) {
            complexity = 'O(n²)';
            explanation = 'Nested loops detected';
        } else if (maxNesting >= 1 || loopCount >= 1) {
            if (hasHashMap) {
                complexity = 'O(n)';
                explanation = 'Single loop with hash lookups';
            } else {
                complexity = 'O(n)';
                explanation = 'Single loop iteration';
            }
        } else {
            complexity = 'O(1)';
            explanation = 'Constant time - no loops detected';
        }

        return { complexity, explanation };
    }

    /**
     * Analyze space complexity
     */
    static analyzeSpaceComplexity(code, language) {
        const arrayPatterns = [
            /\[\s*\]\s*\*\s*n/,           // Python: [0] * n
            /\[.*for.*in.*\]/,             // Python list comprehension
            /new\s+\w+\s*\[\s*n/,          // Java/C++: new int[n]
            /new\s+Array\s*\(\s*n/,        // JS: new Array(n)
            /vector<.*>\s*\(\s*n/,         // C++: vector<int>(n)
            /malloc\s*\(/,                 // C: malloc
            /new\s+ArrayList/,             // Java ArrayList
            /\.slice\s*\(/,                // JS slice (creates copy)
            /\.copy\s*\(/,                 // Python copy
            /deepcopy/,                    // Python deepcopy
        ];

        const hashPatterns = [
            /\bdict\s*\(/,
            /\bset\s*\(/,
            /new\s+HashMap/,
            /new\s+HashSet/,
            /new\s+Map\s*\(/,
            /new\s+Set\s*\(/,
            /unordered_map/,
            /unordered_set/,
            /\{\}/,
        ];

        const recursionPatterns = [
            /def\s+\w+.*:\s*\n.*\1\s*\(/,
            /function\s+\w+.*\{[^}]*\1\s*\(/,
        ];

        let hasArray = arrayPatterns.some(p => p.test(code));
        let hasHash = hashPatterns.some(p => p.test(code));
        let hasRecursion = recursionPatterns.some(p => p.test(code));

        // Check for 2D arrays
        const matrix2D = [
            /\[\[/,
            /\[\s*\[\]/,
            /new\s+\w+\s*\[\s*\w+\s*\]\s*\[\s*\w+\s*\]/,
            /vector<\s*vector/,
        ];
        let has2DArray = matrix2D.some(p => p.test(code));

        let complexity, explanation;

        if (has2DArray) {
            complexity = 'O(n²)';
            explanation = '2D array/matrix storage';
        } else if (hasRecursion) {
            complexity = 'O(n)';
            explanation = 'Recursion stack space';
        } else if (hasArray || hasHash) {
            complexity = 'O(n)';
            explanation = 'Linear data structure (array/hash)';
        } else {
            complexity = 'O(1)';
            explanation = 'Constant space - only primitives';
        }

        return { complexity, explanation };
    }
}

module.exports = ComplexityAnalyzer;
