const LanguageHandler = require('./languageHandler');

class JavaScriptHandler extends LanguageHandler {
    constructor() {
        super('javascript');
    }

    getExtension() {
        return '.js';
    }

    getExecutionCommand(filePath, dirPath) {
        return {
            command: 'node',
            args: [`"${filePath}"`]
        };
    }
}

module.exports = JavaScriptHandler;
