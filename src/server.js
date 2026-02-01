const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const fs = require('fs');

// Create temp dir if missing
if (!fs.existsSync(config.TEMP_DIR)) {
    fs.mkdirSync(config.TEMP_DIR, { recursive: true });
}

app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`);
});
