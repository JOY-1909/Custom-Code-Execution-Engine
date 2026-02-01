const path = require('path');

module.exports = {
    PORT: process.env.PORT || 3000,
    TEMP_DIR: path.join(__dirname, '../temp'),
    TIMEOUT_MS: 5000, // Default execution timeout
    MEMORY_LIMIT_MB: 128,
};
