const fs = require('fs');
const fsPromises = require('fs/promises')
const readline = require('readline');
const path = require('path')

// ШАБЛОНЫ
const {methodPattern} = require('./patterns/method')
const {methodSchemaPattern} = require('./patterns/methodShema')
const {TOC} = require('./patterns/docPattern')

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
        const docText = await fsPromises.readFile(path.resolve(basePath, 'doc/api/index.md'), 'utf-8')
        const insertPosition = +docText.lastIndexOf('[Output](#output-') + 51
        const position = +docText.lastIndexOf('[Output](#output-')

        console.log(insertPosition, docText.length);

        file_content = docText.substring(position);
        var file = fs.openSync(path.resolve(basePath, 'doc/api/index.md'),'r+');
        var bufferedText = new Buffer(TOC+file_content);
        fs.writeSync(file, bufferedText, 0, bufferedText.length, insertPosition);
        fs.close(file);

        // fs.open(path.resolve(basePath, 'doc/api/index.md'), 'r+', (err, fd) => {
        //     //fd - это дескриптор файла
        //     fs.write(fd, TOC, insertPosition, 'utf-8', (err) => console.log(err, insertPosition))
        // })
    }
}

// var position = 5;
// var file_path = 'file.txt';
// var new_text = 'abcde';

// fs.readFile(file_path, function read(err, data) {
//     if (err) {
//         throw err;
//     }
//     var file_content = data.toString();
//     file_content = file_content.substring(position);
//     var file = fs.openSync(file_path,'r+');
//     var bufferedText = new Buffer(new_text+file_content);
//     fs.writeSync(file, bufferedText, 0, bufferedText.length, position);
//     fs.close(file);
// });

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


