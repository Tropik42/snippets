const fs = require('fs');
const fsPromises = require('fs/promises')
const readline = require('readline');
const path = require('path')

// ШАБЛОНЫ
const {methodPattern} = require('./patterns/method')
const {methodSchemaPattern} = require('./patterns/methodShema')

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

    const data = {
        methodName,
        basePath,
        createMethod,
        createDoc,
    }

    return data
}

// МОДУЛЬ С СОЗДАНИЕМ ПАПОК И ФАЙЛОВ

async function testFs() {
    const {basePath, methodName, createMethod, createDoc} = await getVars()

    if (createMethod) { // Создать папку с методом в src
        await fsPromises.mkdir(path.join(basePath, 'src/lib/methods', `${methodName}`))
        await fsPromises.writeFile(path.join(basePath, 'src/lib/methods', `${methodName}`, 'index.js'), `${methodPattern.replace(/MethodName/g, methodName)}`)
        await fsPromises.writeFile(path.join(basePath, 'src/lib/methods', `${methodName}`, 'method-schema.js'), `${methodSchemaPattern.replace(/MethodName/g, methodName)}`)
    }

    if (createDoc) { // Вставить шаблон документации
        fs.open(path.resolve(basePath, 'doc/api/index.md'), 'r+', (err, fd) => {
            //fd - это дескриптор файла
            // console.log(fd);
            fs.read(fd, (err, data) => {
                if (err) {
                    console.error(err)
                    return
                }
                console.log(data)
            })
            fs.write(fd, '12345', 3, (err) => console.log(err))
          })
    }
}

testFs()

// fs.mkdir(path.join(basePath, 'src/lib/methods/test'), err => {
//     console.log(err)
// })



// top level await

// спрашивать путь до папки с проектом DONE

// TODO: спрашивать нужно ли добавлять шаблон документации для метода
// если нужно добавить шаблон для документации
    // TODO: добавить шаблон в doc/api/index.md

    // TODO: спрашивать желаете ли ввести входные/выходные параметры 


// TODO: спрашивать нужно ли создавать файл для юнит-тестов
// TODO: спрашивать нужно ли добавлять шаблон для автотестов
// можно ещё спрашивать за коллекцию для постмана

// TODO: преобразовать название в kebab-case
// TODO: преобразовать название в PascalCase
// TODO: преобразовать название в camelCase

// если нужен корневой метод
// создать папку с методом DONE
    // создать файл index.js DONE
    // создать файл method-schema.js DONE
    // TODO: добавить ссылки на метод в корневой для methods файл index.js

// если нужен файл для юнит-тестов
// TODO: добавить файл юнит-тестов
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

// fs.mkdir(path.join(basePath, 'src/lib/methods/test'), err => {
//     console.log(err)
// })


