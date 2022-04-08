const fs = require('fs');
const readline = require('readline');
const path = require('path')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const labels = [
    {
        question: '',
        label: '',
        answer: '',
    },
    'methodName', 'basePath'
];
const answersList = ['Название метода? (через пробел)', 'Путь до сервиса?'];
// let methodName = '';
// let basePath = '';

// function getDiceAnswer() {
//     return new Promise(resolve => {
//         rl.question("Test ?: ", (answer) => {
//             resolve(answer);
//             console.log("test: ", answer);
//             rl.close();
//         });
//     });
// }

const answers = [
    {
        question: '',

    }
];

function ask(questionText, answer, label) {
    return new Promise((resolve, reject) => {
        rl.question(questionText, (answer) => {
            answers.push(answer);
            resolve(answer);
            console.log("test: ", answer);
        });
    });
}

async function getAnswers() {
    for (let label of labels) {
        await ask(label.question);
    }
    rl.close();
    //this line won't execute until the answer is ready
    console.log(answers)
}

getAnswers();

// function ask(questionText) {
//     return new Promise((resolve, reject) => {
//         rl.question(questionText, (input) => resolve(input));
//     });
// }

// ask('Название метода? (через пробел)')
//     .then((result) => {
//         methodName = result;
//         console.log(result);
//         return ask('Путь до сервиса?');
//     })
//     .then(result => {
//         basePath = result;
//         console.log(result);
//         rl.close();
//     });














// спрашивать путь до папки с проектом
// спрашивать нужно ли добавлять шаблон документации для метода
    // если нужна дока - спросить желаете ли ввести входные/выходные параметры
// спрашивать нужно ли создавать файл для юнит-тестов
// спрашивать нужно ли добавлять шаблон для автотестов
// можно ещё спрашивать за коллекцию для постмана

// преобразовать название в kebab-case
// преобразовать название в PascalCase
// преобразовать название в camelCase

// создать папку с методом
// fs.mkdir(path.join(basePath, 'src/lib/methods/test'), err => {
//     console.log(err)
// })
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
