const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

const fileManager = {
    /**
     * Create a temporary file with the given code
     * @param {string} code - The code content
     * @param {string} extension - File extension (e.g., '.py', '.js')
     * @returns {object} - { id, filePath, dirPath }
     */
    createTempFile(code, extension) {
        const id = uuidv4();
        const dirPath = path.join(config.TEMP_DIR, id);

        // Create directory for this execution
        fs.mkdirSync(dirPath, { recursive: true });

        // Determine filename
        let filename;
        if (extension === '.java') {
            // Java requires class name to match filename
            const classMatch = code.match(/public\s+class\s+(\w+)/);
            filename = classMatch ? `${classMatch[1]}.java` : 'Main.java';
        } else {
            filename = `code${extension}`;
        }

        const filePath = path.join(dirPath, filename);
        fs.writeFileSync(filePath, code);

        return { id, filePath, dirPath, filename };
    },

    /**
     * Cleanup temporary files for a given execution
     * @param {string} dirPath - Directory path to remove
     */
    cleanup(dirPath) {
        try {
            if (fs.existsSync(dirPath)) {
                fs.rmSync(dirPath, { recursive: true, force: true });
            }
        } catch (err) {
            console.error(`Cleanup failed for ${dirPath}:`, err.message);
        }
    }
};

module.exports = fileManager;
