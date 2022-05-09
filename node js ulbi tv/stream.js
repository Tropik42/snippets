// В Node.js есть 4 типа стримов

// Readable - чтение
// Writable - запись
// Duplex - для чтения и записи Readable + Writable
// Transform - такой же, как Duplex, но может изменить данные по мере чтения

// По умолчанию один кусочек - 64 Кб

const fs = require('fs')
const path = require('path')

// // Прочитать файл целиком:
// fs.readFile(path.resolve(__dirname, 'test.txt'), (err, data) => {
//     if (err) {
//         throw err;
//     }
//     console.log(data);
// })

// Читать файл с помощью стримов:
// const stream = fs.createReadStream(path.resolve(__dirname, 'test.txt'))

// chunk - кусочек файла, который прочитали
// stream.on('data',  (chunk) => {
//     console.log(chunk);
// })
// stream.on('end', () => console.log('Закончено чтение'))
// stream.on('open', () => console.log('Начато чтение'))
// stream.on('error', (e) => console.log(e))

// const writableStream = fs.createWriteStream(path.resolve(__dirname, 'test2.txt'))

// for (let i = 0; i < 20; i++) {
//     writableStream.write(i + '\n');
// }

// writableStream.end()
// writableStream.close()
// writableStream.destroy()
// writableStream.on('error')

// Когда работаем с http - внутри тоже идёт работа со стримами

const http = require('http');

http.createServer((req, res) => {
    //req - readable stream
    //res - writable stream
    const stream = fs.createReadStream(path.resolve(__dirname, 'test.txt'))

    stream.on('data', chunk => res.write(chunk))
    stream.on('end', chunk => res.end())
    // Сетевое подключение медленнее, чем чтение файла
    // Стрим закончит читать раньше, чем пользователь скачает файл
    stream.pipe(res)
})