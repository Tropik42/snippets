const fs = require('fs');
const path = require('path')
const {toCamelCase, toFlatCase} = require('../utils.js')
const patterns = require('../patterns')

function createDocFiles(methodName, basePath) {
    const docText = fs.readFileSync(path.resolve(basePath, 'doc/api/index.md'), 'utf-8')
    const isSecondMethod = docText.includes('description') && !docText.includes('description-') // определить, не второй ли это метод в документации
    const insertPosition = isSecondMethod
        ? +docText.lastIndexOf('[Output](#output') + 48
        : +docText.lastIndexOf('[Output](#output-') + 50
    const position = isSecondMethod
        ? +docText.lastIndexOf('[Output](#output') + 20
        : +docText.lastIndexOf('[Output](#output-') + 22

    const numberOfTOCDescription = isSecondMethod
        ? '0' // если это второй метод в документации, в теге будет 1 (#description-1)
        : docText // найти номер метода в TOC
            .match(/#description-[\d]{0,2}/g)
            .pop()
            .split('-')[1]

    const file_content = docText.substring(position);
    const file = fs.openSync(path.resolve(basePath, 'doc/api/index.md'),'r+');
    const bufferedText = new Buffer.from(
        patterns.TOCPattern
            .replace(/methodName/g, toCamelCase(methodName)) //подставить название метода
            .replace(/methodname/g, toFlatCase(methodName)) // подставить тег (#..)
            .replace(/orderNumber/g, +numberOfTOCDescription + 1) // подставить циферки, увеличенные на 1
        +file_content
    );
    fs.writeSync(file, bufferedText, 0, bufferedText.length, insertPosition);
    fs.appendFileSync( // вставить описание метода
        path.resolve(basePath, 'doc/api/index.md'),
        patterns.descriptionPattern.replace(/MethodName/g, toCamelCase(methodName))
    )
    fs.close(file, function(err, result) {if (err) console.log('Ошибко: ', err)});
}

module.exports = {createDocFiles};
