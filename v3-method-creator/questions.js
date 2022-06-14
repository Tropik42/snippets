module.exports = {
    questionList: [
        {
            questionText: 'Название метода? (слова через пробел)',
            label: 'methodName',
            check: () => {
                console.log('test')
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
            questionText: 'Создавать файл юнит-тестов? (y/n),
            label: 'createUnit',
        },
    ]
}
