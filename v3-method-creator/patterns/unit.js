module.exports = {unitPattern: 
`const {testUtils, testStorage} = require('@bb/offline-test');

const MSG = {
    domain: 'domain',
    event: 'methodName',
    replyTo: {
        exchange: 'test',
        event: 'test',
    },
};

module.exports = [
    {
        name: 'standard parameters, valid request',
        get request() {
            return {
                message: {
                    ...testStorage.core.commons.getMessage(MSG),
                    data: {
                    },
                },
            };
        },
        response: {
            message: {data: {}},
        },
        sourcesRmqPublishAdvanced: request => testUtils.done(request),
        sourcesDbGetConnection: options => {
            const name = options.name.split('_')[0];
            switch (name) {
                case 'methodName':
                    return;
                default:
                    throw new Error('Incorrect query');
            }
        },
    },

    {
        name: 'invalid schema',
        positive: false,
        get request() {
            return {
                message: {
                    ...testStorage.core.commons.getMessage(MSG),
                    data: {
                    },
                },
            };
        },
        response: {
            message: {
                errors: [
                    {
                        code: -32600,
                        data: {},
                        message: 'should have required property \\'limit\\' in \\'#/properties/data/required\\'',
                    },
                ],
            },
        },
        sourcesRmqPublishAdvanced: request => testUtils.done(request),
    },
];    
`
};
        