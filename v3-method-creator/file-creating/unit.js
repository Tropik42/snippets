const fs = require('fs');
const path = require('path')
const {toCamelCase, toKebabCase, insertPattern} = require('../utils.js')
const patterns = require('../patterns')

function createUnitTestFiles(methodName, basePath) {
    fs.writeFileSync(
        path.join(
            basePath,
            'src/test/cases',
            `${toKebabCase(methodName)}.js`
        ),
        `${patterns.unitPattern.replace(/methodName/g, toCamelCase(methodName))}`
    )

    insertPattern(
        basePath,
        `src/test/cases/index.js`,
        'module.exports',
        patterns.unitIndexRequirePattern
            .replace(/methodName/g, toCamelCase(methodName))
            .replace(/method-name/g, toKebabCase(methodName)),
        -2
    );

    insertPattern(
        basePath,
        `src/test/cases/index.js`,
        '};',
        patterns.unitIndexExportsPattern
            .replace(/methodName/g, toCamelCase(methodName))
            .replace(/method-name/g, toKebabCase(methodName)),
        -1
    );
}

module.exports = {createUnitTestFiles};
