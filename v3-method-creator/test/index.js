const {MethodInterface} = require('@bb/offline-core');
const methodSchema = require('./method-schema.js');

/** @class */
class test extends MethodInterface {
    /**
     * API method
     * @param {Object} request Request
     * @return {Object} response
     */
    async run(request) {
        this.commons.validateMessage(methodSchema, request);
    }
}

module.exports = test;
