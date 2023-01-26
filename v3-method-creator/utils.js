const fs = require("fs");
const path = require("path");

function toPascalCase (string) {
    return string
        .toLowerCase()
        .split(' ')
        .map(word => word
            .charAt(0)
            .toUpperCase() + word.slice(1)
        )
        .join('')
}

function toCamelCase (string) {
    const result =
        string
            .toLowerCase()
            .split(' ')
            .map(word => word
                .charAt(0)
                .toUpperCase() + word.slice(1)
            )
            .join('')

    return result
        .charAt(0)
        .toLowerCase() + result.slice(1)
}

function toKebabCase (string) {
    return string
        .toLowerCase()
        .split(' ')
        .join('-')
}

function toFlatCase (string) {
    return string
        .toLowerCase()
        .split(' ')
        .join('')
}

// МОДУЛЬ С СОЗДАНИЕМ ПАПОК И ФАЙЛОВ

function insertPattern (basePath, relativePath, insertBefore, pattern, offset = 0) {
    const indexText = fs.readFileSync(path.resolve(basePath, relativePath), 'utf-8');            // берём весь текст файла
    const insertPosition = +indexText.lastIndexOf(insertBefore) + offset;                               // определяем позицию вставки шаблона
    const textAfterInsertPosition = indexText.substring(insertPosition);                                // берём остаток файла, который запишется после вставки шаблона
    const fileDescriptor = fs.openSync(path.resolve(basePath, relativePath),'r+');                 // получаем дескриптор файла
    const bufferedText = new Buffer.from(pattern + textAfterInsertPosition)                   // берём шаблон и добавляем к нему остаток файла, чтобы не перезаписалось
    fs.writeSync(fileDescriptor, bufferedText, 0, bufferedText.length, insertPosition);           // записываем в файл шаблон+остаток
    fs.close(fileDescriptor, function(err, result) {if (err) console.log('Ошибко: ', err)});
}


module.exports = {
    toPascalCase,
    toCamelCase,
    toKebabCase,
    toFlatCase,
    insertPattern,
}
