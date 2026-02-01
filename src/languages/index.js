const PythonHandler = require('./pythonHandler');
const JavaScriptHandler = require('./javascriptHandler');
const JavaHandler = require('./javaHandler');
const CppHandler = require('./cppHandler');

const handlers = {
    python: new PythonHandler(),
    javascript: new JavaScriptHandler(),
    java: new JavaHandler(),
    cpp: new CppHandler()
};

const LanguageFactory = {
    /**
     * Get handler for a specific language
     * @param {string} language - Language identifier
     * @returns {LanguageHandler|null}
     */
    getHandler(language) {
        return handlers[language] || null;
    },

    /**
     * Get list of supported languages
     */
    getSupportedLanguages() {
        return Object.keys(handlers);
    },

    /**
     * Check if a language is supported
     */
    isSupported(language) {
        return language in handlers;
    }
};

module.exports = LanguageFactory;
