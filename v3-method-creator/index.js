const fs = require('fs');
const fsPromises = require('fs/promises')
const readline = require('readline');
const path = require('path')

// ШАБЛОНЫ
const {
    methodPattern,
    indexRequirePattern,
    indexExportsPattern
} = require('./patterns/method')
const {methodSchemaPattern} = require('./patterns/methodShema')
const {unitPattern} = require('./patterns/unit')
const {TOCPattern, descriptionPattern} = require('./patterns/docPattern')

// МОДУЛЬ С ВЫЯСНЕНИЕМ ИНФОРМАЦИИ

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const answersList = [
    {
        answerText: 'Название метода? (через пробел)',
        label: 'methodName',
    },
    {
        answerText: 'Путь до сервиса?',
        label: 'basePath',
    },
    {
        answerText: 'Вставить шаблон метода?',
        label: 'createMethod',
    },
    {
        answerText: 'Вставить шаблон документации?',
        label: 'createDoc',
    },
    {
        answerText: 'Создавать файл юнит-тестов?',
        label: 'createUnit',
    },
];

/* {
    answerText: ''
}
*/
const answers = [];

// задать вопросик
function ask({answerText, label}) {
    return new Promise((resolve, reject) => {
        rl.question(answerText, (answer) => {
            answers.push(
                {
                    answerText: answer,
                    label,
                }
            );
            resolve(answer);
            console.log("test: ", answer);
        });
    });
}

// получить ответы на все вопросики
async function getAnswers() {
    for (let answer of answersList) {
        await ask(answer);
    }
    rl.close();
    // console.log(answers);
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

    const data = {
        methodName,
        basePath,
        createMethod,
        createDoc,
        createUnit,
    }

    return data
}

// МОДУЛЬ С СОЗДАНИЕМ ПАПОК И ФАЙЛОВ

async function testFs() {
    const {basePath, methodName, createMethod, createDoc, createUnit} = await getVars()

    if (createMethod) { // Создать папку с методом в src
        await fsPromises.mkdir(
            path.join(
                basePath,
                'src/lib/methods',
                `${toKebabCase(methodName)}`
            )
        )
        await fsPromises.writeFile(
            path.join(
                basePath,
                'src/lib/methods',
                `${toKebabCase(methodName)}`,
                'index.js'
            ),
            `${methodPattern.replace(/MethodName/g, toPascalCase(methodName))}`
        )
        await fsPromises.writeFile(
            path.join(
                basePath,
                'src/lib/methods',
                `${toKebabCase(methodName)}`,
                'method-schema.js'
            ),
            `${methodSchemaPattern.replace(/MethodName/g, toCamelCase(methodName))}`
        )

        // вставить название метода в require
        // берём весь текст файла
        const indexText = await fsPromises.readFile(path.resolve(basePath, 'src/lib/methods/index.js'), 'utf-8')
        // определяем позицию вставки шаблона
        const insertPosition = +indexText.lastIndexOf('module.exports')
        // определяем позицию начала остатка файла, который должен записаться после шаблона
        const position = +indexText.lastIndexOf('module.exports')
        // берём остаток файла, который запишется после вставки шаблона
        file_content = indexText.substring(position);
        // получаем дескриптор файла
        var file = fs.openSync(path.resolve(basePath, 'src/lib/methods/index.js'),'r+');
        // берём шаблон и добавляем к нему остаток файла, чтобы не перезаписалось
        var bufferedText = new Buffer(
            indexRequirePattern
                .replace(/methodName/g, toCamelCase(methodName))
                .replace(/method-name/g, toKebabCase(methodName))
            +file_content
        );
        // записываем в файл шаблон+остаток
        fs.writeSync(file, bufferedText, 0, bufferedText.length, insertPosition-2);//-2 чтобы вернуться на строку выше
        fs.close(file);

        // вставить название метода в exports
        const indexTextRequire = await fsPromises.readFile(path.resolve(basePath, 'src/lib/methods/index.js'), 'utf-8')
        const insertPositionRequire = +indexTextRequire.lastIndexOf('};')
        // определяем позицию начала остатка файла, который должен записаться после шаблона
        const positionRequire = +indexTextRequire.lastIndexOf('};')
        // берём остаток файла, который запишется после вставки шаблона
        file_content_require = indexTextRequire.substring(positionRequire);
        // получаем дескриптор файла
        var fileRequire = fs.openSync(path.resolve(basePath, 'src/lib/methods/index.js'),'r+');
        // берём шаблон и добавляем к нему остаток файла, чтобы не перезаписалось
        var bufferedTextRequire = new Buffer(
                indexExportsPattern
                .replace(/methodName/g, toCamelCase(methodName))
                +file_content_require
            );
        // записываем в файл шаблон+остаток
        fs.writeSync(fileRequire, bufferedTextRequire, 0, bufferedTextRequire.length, insertPositionRequire-2);//-2 чтобы вернуться на строку выше
        fs.close(fileRequire);
    }

    if (createDoc) { // Вставить шаблон документации
        const docText = await fsPromises.readFile(path.resolve(basePath, 'doc/api/index.md'), 'utf-8')
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
                TOCPattern
                    .replace(/methodName/g, toCamelCase(methodName)) //подставить название метода
                    .replace(/methodname/g, toFlatCase(methodName)) // подставить тег (#..)
                    .replace(/orderNumber/g, +numberOfTOCDescription + 1) // подставить циферки, увеличенные на 1
                +file_content
            );
        fs.writeSync(file, bufferedText, 0, bufferedText.length, insertPosition);
        await fsPromises.appendFile( // вставить описание метода
            path.resolve(basePath, 'doc/api/index.md'),
            descriptionPattern.replace(/MethodName/g, toCamelCase(methodName))
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
            `${unitPattern.replace(/MethodName/g, toCamelCase(methodName))}`
        )
    }
}

// UTILS
function toPascalCase (string) {
    return string
        .toLowerCase()
        .split(' ')
        .map(word => word
            .charAt(0)
            .toUpperCase() + word.slice(1)
        )
        .join('')
}

function toCamelCase (string) {
    const result =
    string
        .toLowerCase()
        .split(' ')
        .map(word => word
            .charAt(0)
            .toUpperCase() + word.slice(1)
        )
        .join('')

    return result
        .charAt(0)
        .toLowerCase() + result.slice(1)
}

function toKebabCase (string) {
    return string
        .toLowerCase()
        .split(' ')
        .join('-')
}

function toFlatCase (string) {
    return string
        .toLowerCase()
        .split(' ')
        .join('')
}

testFs()

// fs.mkdir(path.join(basePath, 'src/lib/methods/test'), err => {
//     console.log(err)
// })



// top level await

// спрашивать путь до папки с проектом DONE

// спрашивать нужно ли добавлять шаблон документации для метода DONE
// если нужно добавить шаблон для документации
    // добавить шаблон TOC в doc/api/index.md DONE
    // добавить шаблон description в doc/api/index.md DONE
    // реплэйсить название в шаблоне TOC DONE
    // менять цифры в шаблоне TOC DONE
    // добавить цифры в шаблоне TOC, если это второй метод (проверять на наличие цифр в строке) DONE

// спрашивать нужно ли создавать файл для юнит-тестов DONE

// преобразовывать название в kebab-case DONE
// преобразовывать название в PascalCase DONE
// преобразовывать название в camelCase DONE
// TODO: преобразовывать название в слитное

// если нужен корневой метод
// создать папку с методом DONE
    // создать файл index.js DONE
    // создать файл method-schema.js DONE
    // добавить ссылки на метод в корневой для methods файл index.js DONE
    // TODO: в methods/index.js в название импортируемого класса с большой буквы

// если нужен файл для юнит-тестов
// добавить файл юнит-тестов DONE
// TODO: добавить ссылку на файл с тестом в корневой для юнит-тестов файл index.js
// TODO: добавить ссылки на метод в корневой для methods файл index.js

// если нужно добавить шаблон для автотестов
// добавить шаблон в payload/default.py
// добавить добавить шаблон test_amqp/test_smoke.py

// обработка ответов
// TODO: проверять на длину
// TODO: проверять на русские буквы
// TODO: предлагать подтверждение результата

// обработка ошибок
// TODO: папка с названием ${name} уже существует
// TODO: файл с названием ${name} уже существует

// декомпозиция
// TODO: убрать методы utils в отдельный файл
// TODO: убрать вопросы (answers) в отдельный файл

// документация
// ввести использование JS Doc

// рефакторинг
// TODO: вынести логику записи в указанную точку файла в отдельную функцию

// кроссплатформенность
// TODO: в ubuntu не работает добавление названия класса в экспортируемые классы в methods/index.js

// чего ещё можна
// спрашивать нужно ли добавлять шаблон для автотестов NOTE
// можно ещё спрашивать за коллекцию для постмана NOTE
// спрашивать желаете ли ввести входные/выходные параметры NOTE

// fs.mkdir(path.join(basePath, 'src/lib/methods/test'), err => {
//     console.log(err)
// })
