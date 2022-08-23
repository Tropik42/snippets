const readline = require('readline');

const {
    createUnitTestFiles,
    createSrcMethodFiles,
    createDocFiles,
} = require('./file-creating')

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

async function testFs() {
    const {basePath, methodName, createMethod, createDoc, createUnit} = await getVars()

    createMethod && createSrcMethodFiles(methodName, basePath);
    createUnit && createUnitTestFiles(methodName, basePath);
    createDoc && createDocFiles(methodName, basePath);
}

testFs()
