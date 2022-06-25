const fs = require('fs');
const fsPromises = require('fs/promises')
const readline = require('readline');
const path = require('path')

// УТИЛИТЫ
const {
    toPascalCase,
    toCamelCase,
    toFlatCase,
    toKebabCase
} = require('./utils');

// ШАБЛОНЫ
const patterns = require('./patterns');

// МОДУЛЬ С ВЫЯСНЕНИЕМ ИНФОРМАЦИИ
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const {questionList} = require('./questions')

const answers = [];

// задать вопросик
function ask({questionText, label, check}) {
    return new Promise((resolve, reject) => {
        rl.question(questionText, (answer) => {
            check && check();
            answers.push(
                {
                    answerText: answer,
                    label,
                }
            );
            resolve(answer);
        });
    });
}

// https://habr.com/ru/company/ruvds/blog/431078/

// получить ответы на все вопросики
async function getAnswers() {
    for (const question of questionList) {
        await ask(question);
    }
    rl.close();

    return answers;
}

// ПАРСЕР ОТВЕТОВ

async function getVars() {
    const answers = await getAnswers();

    const methodName = answers.find(answer => answer.label === 'methodName').answerText;
    const basePath = answers.find(answer => answer.label === 'basePath').answerText;
    const createMethod = answers.find(answer => answer.label === 'createMethod').answerText.includes('y');
    const createDoc = answers.find(answer => answer.label === 'createDoc').answerText.includes('y');
    const createUnit = answers.find(answer => answer.label === 'createUnit').answerText.includes('y');

    return {
        methodName,
        basePath,
        createMethod,
        createDoc,
        createUnit,
    }
}

// МОДУЛЬ С СОЗДАНИЕМ ПАПОК И ФАЙЛОВ

function insertPattern(basePath, relativePath, insertBefore, pattern, offset = 0) {
    const indexText = fs.readFileSync(path.resolve(basePath, relativePath), 'utf-8');            // берём весь текст файла
    const insertPosition = +indexText.lastIndexOf(insertBefore) + offset;                                         // определяем позицию вставки шаблона
    const textAfterInsertPosition = indexText.substring(insertPosition);                                // берём остаток файла, который запишется после вставки шаблона
    const fileDescriptor = fs.openSync(path.resolve(basePath, relativePath),'r+');                 // получаем дескриптор файла
    const bufferedText = new Buffer.from(pattern + textAfterInsertPosition)                       // берём шаблон и добавляем к нему остаток файла, чтобы не перезаписалось
    fs.writeSync(fileDescriptor, bufferedText, 0, bufferedText.length, insertPosition);           // записываем в файл шаблон+остаток
    fs.close(fileDescriptor);
}

async function testFs() {
    const {basePath, methodName, createMethod, createDoc, createUnit} = await getVars()

    if (createMethod) { // Создать папку с методом в src
        // fs.mkdirSync(path.join(basePath, 'src/lib/methods', `${toKebabCase(methodName)}`))
        // fs.writeFileSync(path.join(basePath, 'src/lib/methods', `${toKebabCase(methodName)}`, 'index.js'),
        //     `${patterns.methodPattern.replace(/MethodName/g, toPascalCase(methodName))}`
        // )
        // fs.writeFileSync(path.join(basePath, 'src/lib/methods', `${toKebabCase(methodName)}`, 'method-schema.js'),
        //     `${patterns.methodSchemaPattern.replace(/MethodName/g, toCamelCase(methodName))}`
        // )
        //
        // insertPattern(
        //     basePath,
        //     'src/lib/methods/index.js',
        //     'module.exports',
        //     patterns.methodIndexRequirePattern
        //         .replace(/MethodName/g, toPascalCase(methodName))
        //         .replace(/method-name/g, toKebabCase(methodName)),
        //     -1
        // );
        //
        // insertPattern(
        //     basePath,
        //     'src/lib/methods/index.js',
        //     '};',
        //     patterns.methodIndexExportsPattern
        //         .replace(/MethodName/g, toPascalCase(methodName)),
        //     -1
        // );
    }

    if (createDoc) { // Вставить шаблон документации
        const docText = await fs.readFileSync(path.resolve(basePath, 'doc/api/index.md'), 'utf-8')
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
        const bufferedText = new Buffer(
                patterns.TOCPattern
                    .replace(/methodName/g, toCamelCase(methodName)) //подставить название метода
                    .replace(/methodname/g, toFlatCase(methodName)) // подставить тег (#..)
                    .replace(/orderNumber/g, +numberOfTOCDescription + 1) // подставить циферки, увеличенные на 1
                +file_content
            );
        fs.writeSync(file, bufferedText, 0, bufferedText.length, insertPosition);
        await fsPromises.appendFile( // вставить описание метода
            path.resolve(basePath, 'doc/api/index.md'),
            patterns.descriptionPattern.replace(/MethodName/g, toCamelCase(methodName))
        )
        fs.close(file);
    }

    if (createUnit) {
        await fsPromises.writeFile(
            path.join(
                basePath,
                'src/test/cases',
                `${toKebabCase(methodName)}.js`
            ),
            `${patterns.unitPattern.replace(/MethodName/g, toCamelCase(methodName))}`
        )

        // вставить название метода в require
        // берём весь текст файла
        const indexText = await fsPromises.readFile(path.resolve(basePath, 'src/test/cases/index.js'), 'utf-8')
        // определяем позицию вставки шаблона
        const insertPosition = +indexText.lastIndexOf('module.exports')
        // определяем позицию начала остатка файла, который должен записаться после шаблона
        const position = +indexText.lastIndexOf('module.exports')
        // берём остаток файла, который запишется после вставки шаблона
        file_content = indexText.substring(position);
        // получаем дескриптор файла
        var file = fs.openSync(path.resolve(basePath, 'src/test/cases/index.js'),'r+');
        // берём шаблон и добавляем к нему остаток файла, чтобы не перезаписалось
        var bufferedText = new Buffer(
            patterns.unitIndexRequirePattern
                .replace(/methodName/g, toCamelCase(methodName))
                .replace(/method-name/g, toKebabCase(methodName))
            +file_content
        );
        // записываем в файл шаблон+остаток
        fs.writeSync(file, bufferedText, 0, bufferedText.length, insertPosition-3);//-3 чтобы вернуться на строку выше
        fs.close(file);

        // вставить название метода в exports
        const indexTextRequire = await fsPromises.readFile(path.resolve(basePath, 'src/test/cases/index.js'), 'utf-8')
        const insertPositionRequire = +indexTextRequire.lastIndexOf('};')
        // определяем позицию начала остатка файла, который должен записаться после шаблона
        const positionRequire = +indexTextRequire.lastIndexOf('};')
        // берём остаток файла, который запишется после вставки шаблона
        file_content_require = indexTextRequire.substring(positionRequire);
        // получаем дескриптор файла
        var fileRequire = fs.openSync(path.resolve(basePath, 'src/test/cases/index.js'),'r+');
        // берём шаблон и добавляем к нему остаток файла, чтобы не перезаписалось
        var bufferedTextRequire = new Buffer(
            patterns.unitIndexExportsPattern
                .replace(/methodName/g, toCamelCase(methodName))
                +file_content_require
            );
        // записываем в файл шаблон+остаток
        fs.writeSync(fileRequire, bufferedTextRequire, 0, bufferedTextRequire.length, insertPositionRequire-2);//-2 чтобы вернуться на строку выше
        fs.close(fileRequire);
    }
}

testFs()
