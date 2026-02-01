const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const fs = require('fs');

// Ensure temp directory exists
if (!fs.existsSync(config.TEMP_DIR)) {
    fs.mkdirSync(config.TEMP_DIR, { recursive: true });
    logger.info(`Created temp directory at ${config.TEMP_DIR}`);
}

app.listen(config.PORT, () => {
    logger.info(`Code Execution Engine Server running on port ${config.PORT}`);
});
