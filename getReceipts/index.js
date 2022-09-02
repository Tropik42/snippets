const dt = '2022-07-24'
const receiptsV3 = require(`./receiptsFromV3_${dt}.json`)
// const receiptsOFD = require(`./receiptsFromOFD_${dt}.json`)
const {receipts: receiptsOFD} = require(`./receiptsFromOFD_${dt}.json`)

console.log('Количество чеков в таблице ресипт:', receiptsV3.length);
// console.log('Количество чеков в ОФД:', receiptsOFD.length);
console.log('Количество чеков в ОФД:', receiptsOFD.length);

function compare (receiptsV3, receiptsOFD) {
    const existsOnlyInOFD = []

    for (const receiptOFD of receiptsOFD) {
        const result = receiptsV3.findIndex(({fn, fdNumber}) => (fn === receiptOFD.fn && fdNumber === receiptOFD.fdNumber))
        if (result !== -1) {
            receiptsV3.splice(result, 1)
        }

        if (result === -1) {
            existsOnlyInOFD.push(receiptOFD)
        }
    }

    console.log('Есть в ОФД, но нет в в3: ', existsOnlyInOFD)
    console.log('Есть в в3, но нет в ОФД: ', receiptsV3)
}

// function getSum () {
//     const sum = receiptsOFD.reduce((acc, {dst, amount}) => {
//         dst === 'IN' && (acc.sumIN += amount)
//         dst === 'OUT' && (acc.sumOUT += amount)
//         dst === 'CARD_OUT' && (acc.sumCARD_OUT += amount)
//
//         return acc
//     }, {
//         sumIN: 0,
//         sumOUT: 0,
//         sumCARD_OUT: 0
//     })
//
//     console.log('суммы: ', sum)
// }

compare(receiptsV3, receiptsOFD)
// getSum()
