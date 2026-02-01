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
            command: 'python3',
            args: [`"${filePath}"`]
        };
    }
}

module.exports = PythonHandler;
