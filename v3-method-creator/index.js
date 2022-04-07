const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let methodName = '';
let path = '';
// спрашивать путь до папки с проектом
// спрашивать нужно ли добавлять шаблон документации для метода
    // если нужна дока - спросить желаете ли ввести входные/выходные параметры
// спрашивать нужно ли создавать файл для юнит-тестов
// спрашивать нужно ли добавлять шаблон для автотестов
// можно ещё спрашивать за коллекцию для постмана

rl.question('Название метода? (вводить через пробел)', (answer) => {
    console.log(`Принятое название: ${answer}`);
    methodName = answer;
    rl.close();
});
rl.question('Путь до папки с сервисом?', (answer) => {
    console.log(`Принятый путь до папки: ${answer}`);
    methodName = answer;
    rl.close();
});

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


// Это работает:
// const fs = require('fs');
// const path = require('path');

// const basePath = '/home/vladimir_m/bb/v3/erai';

// fs.mkdir(path.join(basePath, 'src/lib/methods/test'), err => {
//     console.log(err)
// })
