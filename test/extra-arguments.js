// что будет, если передать в функцию лишний аргумент?

function printNorm(a, b) {
    console.log(a)
    console.log(b)
}

function printExcess(a, b, c) {
    console.log(a)
    console.log(b)
    console.log(c)
}

function test() {
    printNorm('a', 'b', 'c')
    printExcess('a', 'b', 'c')
}

test()

// функция проигнорирует лишний аргумент и отработает с теми, которые ожидает получить
