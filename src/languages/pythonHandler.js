const LanguageHandler = require('./languageHandler');

class PythonHandler extends LanguageHandler {
    constructor() {
        super('python');
    }

    getExtension() {
        return '.py';
    }

    getExecutionCommand(filePath, dirPath) {
        return {
            command: 'python',
            args: [`"${filePath}"`]
        };
    }
}

module.exports = PythonHandler;
