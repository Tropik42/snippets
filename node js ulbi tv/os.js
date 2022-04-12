const os = require('os');
const cluster = require('cluster');

// Показать платформу, на которой идёт работа
// console.log(os.platform());

// Показать архитектуру процессора
// console.log(os.arch());

// Показать инфу о процессоре
// console.log(os.cpus().length);



const cpus = os.cpus()

// Можно запустить процессы на каждом ядре (2 оставили на ОС)
for (let i = 0; i < cpus.length - 2; i++) {
    const CPUcore = cpus[i];
    console.log('Запустить ещё один node js процесс');
}

console.log(process.pid);

