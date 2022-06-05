module.exports = {
    questionList: [
        {
            questionText: 'Название метода? (через пробел)',
            label: 'methodName',
            check: () => {
                console.log('test')
            }
        },
        {
            questionText: 'Путь до сервиса?',
            label: 'basePath',
            check: () => {
                console.log('test2')
            }
        },
        {
            questionText: 'Вставить шаблон метода?',
            label: 'createMethod',
        },
        {
            questionText: 'Вставить шаблон документации?',
            label: 'createDoc',
        },
        {
            questionText: 'Создавать файл юнит-тестов?',
            label: 'createUnit',
        },
    ]
}
