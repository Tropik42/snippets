const { rejects } = require('assert');
const fs = require('fs');
const { resolve } = require('path');
const path = require('path');

//Создать папку синхронно, recursive для создания папок внутри
// fs.mkdirSync(path.resolve(__dirname, 'dir', 'dir2', 'dir3'), {recursive: true})

//создать папку асинхронно
// fs.mkdir(path.resolve(__dirname, 'dir'), (err) => {
//     if (err) {
//         console.log(err);
//         return;
//     }
//     console.log('Папка создана');
// })

//удалять папки
// fs.rmdir(path.resolve(__dirname, 'dir'), (err) => {
//     if(err) {
//         throw err;
//     }
// })

// создать файл, второй аргумент - что записать в файл, третий аргумент - как обработать ошибко
// fs.writeFile(path.resolve(__dirname, 'test.txt'), 'test 1 2 3', (err) => {
//     if (err) {
//         throw err;
//     }
//     console.log('Файл готово, начальник');
// });

// добавить чёта в файл, второй аргумент - что добавить в файл, третий аргумент - как обработать ошибко
// fs.appendFile(path.resolve(__dirname, 'test.txt'), ' добавлено типа', (err) => {
//     if (err) {
//         throw err;
//     }
//     console.log('Файл дописан, начальник');
// });

// создать файл, а потом (внезапно) дополнить его
// fs.writeFile(path.resolve(__dirname, 'test.txt'), 'test 1 2 3', (err) => {
//     if (err) {
//         throw err;
//     }
//     console.log('Файл готово, начальник');
//     fs.appendFile(path.resolve(__dirname, 'test.txt'), ' добавлено типа', (err) => {
//         if (err) {
//             throw err;
//         }
//         console.log('Файл дописан, начальник');
//     });
// });

//Свой вариант функции для записи файлов на диск с использованием промисов

const writeFileAsync = async (path, data) => {
    return new Promise((res, rej) => fs.writeFile(path, data, (err) => {
        if(err) {
            return rej(err.message)
        }
        res()
    }))
}

const appendFileAsync = async (path, data) => {
    return new Promise((res, rej) => fs.appendFile(path, data, (err) => {
        if(err) {
            return rej(err.message)
        }
        res()
    }))
}

//теперь не нужно всякий раз передавать колбэк в функцию, промис помогает упростить код
writeFileAsync(path.resolve(__dirname, 'test.txt'), 'data')
    .then(() => appendFileAsync(path.resolve(__dirname, 'test.txt'), '123'))
    .then(() => appendFileAsync(path.resolve(__dirname, 'test.txt'), '456'))
    .then(() => appendFileAsync(path.resolve(__dirname, 'test.txt'), '789'))
    .catch(err => console.log(err))