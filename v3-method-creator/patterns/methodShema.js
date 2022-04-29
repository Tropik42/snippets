module.exports = {methodSchemaPattern: 
`const {                
} = require('../schema-properties.js');

module.exports = {
    id: 'MethodName',
    type: 'object',
    required: ['data'],
    properties: {
        data: {
            type: 'object',
            required: [
            ],
            properties: {
            },
        },
    },
};
`
};
    