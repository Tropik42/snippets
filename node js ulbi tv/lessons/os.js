const os = require('node js ulbi tv/lessons/os');
const cluster = require('cluster');

// Показать платформу, на которой идёт работа
// console.log(os.platform());

// Показать архитектуру процессора
// console.log(os.arch());

// Показать инфу о процессоре
// console.log(os.cpus().length);

// Работа с процессами
// Если текущей процесс главный
if (cluster.isMaster) {
    for (let i = 0; i < os.cpus().length - 2; i++) {
        //запускаем дочерние процессы
        cluster.fork()
    }
    cluster.on('exit', (worker) => {
        console.log(`Воркер с pid = ${worker.process.pid} погиб`) //kill 2762800
        cluster.fork()
    })
} else {
    console.log((`Воркер с pid= ${process.pid} запущен`))
    setInterval(() => {
        console.log((`Воркер с pid= ${process.pid} ещё работает`))
    }, 5000)
}

// const cpus = os.cpus()
// Можно запустить процессы на каждом ядре (2 оставили на ОС)
// for (let i = 0; i < cpus.length - 2; i++) {
//     const CPUcore = cpus[i];
//     console.log('Запустить ещё один node js процесс');
// }

console.log(process.pid);

