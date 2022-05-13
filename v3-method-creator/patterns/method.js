module.exports = {methodPattern:
`const {MethodInterface} = require('@bb/offline-core');
const methodSchema = require('./method-schema.js');

/** @class */
class MethodName extends MethodInterface {
    /**
     * API method
     * @param {Object} request Request
     * @return {Object} response
     */
    async run(request) {
        this.commons.validateMessage(methodSchema, request);
    }
}

module.exports = MethodName;
`,

indexRequirePattern:
`
const MethodName = require('./method-name');

`,

indexExportsPattern:
`
    MethodName,
`
};
