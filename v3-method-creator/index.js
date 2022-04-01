const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let methodName = '';


rl.question('Название метода? (вводить через пробел)', (answer) => {
    // TODO: Log the answer in a database
    console.log(`Принятое название: ${answer}`);
    methodName = answer;

    rl.close();
});

fs.mkdir()


// TODO проверять на длину
// TODO проверять на русские буквы
// TODO предлагать подтверждение результата
