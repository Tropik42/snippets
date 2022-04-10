const fs = require('fs');
const readline = require('readline');
const path = require('path')

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
    }
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
    let methodName = '';
    let basePath = '';
    const answers = await getAnswers();
    methodName = answers.find(answer => answer.label === 'methodName').answerText;
    basePath = answers.find(answer => answer.label === 'basePath').answerText;

    const data = {
        methodName,
        basePath,
    }

    return data
}

// МОДУЛЬ С СОЗДАНИЕМ ПАПОК И ФАЙЛОВ

async function testFs() {
    const {basePath, methodName} = await getVars()
    
    fs.mkdir(path.join(basePath, `${methodName}`), err => {
        console.log(err)
    })
}

testFs()


// fs.mkdir(path.join(basePath, 'src/lib/methods/test'), err => {
//     console.log(err)
// })








// спрашивать путь до папки с проектом DONE
// спрашивать нужно ли добавлять шаблон документации для метода
    // если нужна дока - спросить желаете ли ввести входные/выходные параметры
// спрашивать нужно ли создавать файл для юнит-тестов
// спрашивать нужно ли добавлять шаблон для автотестов
// можно ещё спрашивать за коллекцию для постмана

// преобразовать название в kebab-case
// преобразовать название в PascalCase
// преобразовать название в camelCase

// создать папку с методом

// создать файл index.js
// создать файл method-schema.js
// добавить ссылки на метод в корневой для methods файл index.js

// если нужен файл для юнит-тестов
// добавить файл юнит-тестов
// добавить ссылку на файл с тестом в корневой для юнит-тестов файл index.js
// добавить ссылки на метод в корневой для methods файл index.js

// если нужно добавить шаблон для документации
// добавить шаблон в doc/api/index.md

// если нужно добавить шаблон для автотестов
// добавить шаблон в payload/default.py
// добавить добавить шаблон test_amqp/test_smoke.py

// TODO проверять на длину
// TODO проверять на русские буквы
// TODO предлагать подтверждение результата

// fs.mkdir(path.join(basePath, 'src/lib/methods/test'), err => {
//     console.log(err)
// })


