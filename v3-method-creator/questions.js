module.exports = {
    questionList: [
        {
            questionText: 'Название метода? (слова через пробел)',
            label: 'methodName',
            check: (answer) => {
                answer.length < 3 &&
                console.log('Название метода должно быть длиннее 3 символов')
            }
        },
        {
            questionText: 'Абсолютный путь до сервиса?',
            label: 'basePath',
            check: () => {
                console.log('test2')
            }
        },
        {
            questionText: 'Вставить шаблон метода? (y/n)',
            label: 'createMethod',
        },
        {
            questionText: 'Вставить шаблон документации? (y/n)',
            label: 'createDoc',
        },
        {
            questionText: 'Создавать файл юнит-тестов? (y/n)',
            label: 'createUnit',
        },
    ]
}
