const Emitter = require('node js ulbi tv/lessons/events');

const emitter = new Emitter();

// emitter.on('message', (data, second, third) => { //если нужно сгенерировать событие только одинраз, юзаем .once
//     console.log('Вы прислали сообщение' + data);
//     console.log('Второй аргумент' + second);
// })

const MESSAGE = process.env.message || '';

// if (MESSAGE) {
//     emitter.emit('message', MESSAGE, 123)
// } else {
//     emitter.emit('message', 'Вы не указали сообщение')
// }

const callback = (data, second, third) => {
    console.log('вы прислали сообщение ' + data);
    console.log('второй аргумент ' + second);
}

emitter.once('message', callback)

emitter.emit('message')
emitter.emit('message')
emitter.emit('message')
emitter.emit('message')
emitter.emit('message')
emitter.emit('message')

emitter.removeAllListeners() // удалить все слушатели
emitter.removeListener('message', callback) // удалить конкретный слушатель


// Когда удобно использовать? 
// http
// websockets
// long pulling
// clusters