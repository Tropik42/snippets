const fs = require('fs');
const path = require('path')
const {toCamelCase, toKebabCase, insertPattern} = require('../utils.js')
const patterns = require('../patterns')

function createSrcMethodFiles(methodName, basePath) {
    fs.mkdirSync(path.join(basePath, 'src/lib/methods', `${toKebabCase(methodName)}`))
    fs.writeFileSync(path.join(basePath, 'src/lib/methods', `${toKebabCase(methodName)}`, `index.js`),
        `${patterns.methodPattern.replace(/MethodName/g, toPascalCase(methodName))}`
    )
    fs.writeFileSync(path.join(basePath, 'src/lib/methods', `${toKebabCase(methodName)}`, 'method-schema.js'),
        `${patterns.methodSchemaPattern.replace(/MethodName/g, toCamelCase(methodName))}`
    )

    insertPattern(
        basePath,
        `src/lib/methods/index.js`,
        'module.exports',
        patterns.methodIndexRequirePattern
            .replace(/MethodName/g, toPascalCase(methodName))
            .replace(/method-name/g, toKebabCase(methodName)),
        -1
    );

    insertPattern(
        basePath,
        'src/lib/methods/index.js',
        '};',
        patterns.methodIndexExportsPattern
            .replace(/MethodName/g, toPascalCase(methodName)),
        -1
    );
}

module.exports = {createSrcMethodFiles};
