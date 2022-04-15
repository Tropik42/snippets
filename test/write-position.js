const fs = require('fs')
const path = require('path');

// fs.stat('C:\\Users\\Valdemar\\Desktop\\История\\Лапин Юрий Андреевич', (err, stats) => {
//   if (err) {
//     console.error(err)
//     return
//   }
//   //сведения о файле содержатся в аргументе `stats`
//   console.log(stats);
// })

// fs.open('test.txt', 'r+', (err, fd) => {
//   //fd - это дескриптор файла
//   console.log(fd);
//   fs.write(fd, '12345', 3, (err) => console.log(err))
// })


fs.open('test.txt', 'r+', (err, fd) => {
    //fd - это дескриптор файла
    // console.log(fd);
    fs.read(fd, (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        console.log(data)
    })
    // fs.write(fd, '12345', 3, (err) => console.log(err))
  })