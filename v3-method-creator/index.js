const fs = require('fs');
const fsPromises = require('fs/promises')
const readline = require('readline');
const path = require('path')

// ШАБЛОНЫ
const {methodPattern} = require('./patterns/method')
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
    }
    
    if (createDoc) { // Вставить шаблон документации
        const docText = await fsPromises.readFile(path.resolve(basePath, 'doc/api/index.md'), 'utf-8')
        const insertPosition = +docText.lastIndexOf('[Output](#output-') + 51
        const position = +docText.lastIndexOf('[Output](#output-')

        file_content = docText.substring(position+22);
        var file = fs.openSync(path.resolve(basePath, 'doc/api/index.md'),'r+');
        var bufferedText = new Buffer(TOCPattern+file_content);
        fs.writeSync(file, bufferedText, 0, bufferedText.length, insertPosition);
        await fsPromises
            .appendFile(
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

// спрашивать нужно ли создавать файл для юнит-тестов DONE

// преобразовать название в kebab-case DONE
// преобразовать название в PascalCase DONE
// преобразовать название в camelCase DONE

// если нужен корневой метод
// создать папку с методом DONE
    // создать файл index.js DONE
    // создать файл method-schema.js DONE
    // TODO: добавить ссылки на метод в корневой для methods файл index.js

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

// чего ещё можна
// спрашивать нужно ли добавлять шаблон для автотестов NOTE
// можно ещё спрашивать за коллекцию для постмана NOTE
// спрашивать желаете ли ввести входные/выходные параметры NOTE 

// fs.mkdir(path.join(basePath, 'src/lib/methods/test'), err => {
//     console.log(err)
// })


