const testArray = [{fn: 1, fd: 'test'}, {fn: 2, fd: 'test'}, {fn: 1, fd: 'test'}, {fn: 1, fd: 'test'}]

// const convertedArray =testArray.map(({fn, fd}) => ({fn, fd}))
const convertedArray = testArray.map(({fn, fd}) => ({fn, fd}))
// console.log('convertedArray', convertedArray)

const stringArray = testArray.map(({fn, fd}) => JSON.stringify({fn, fd}))
console.log(stringArray)


const deduplicatedArray = [...new Set(stringArray)]
console.log('deduplicatedArray', deduplicatedArray)

// for (const el of convertedArray) {
//     const terp = el
//     const index = convertedArray.indexOf(el)
//     console.log('index', index)
//     convertedArray.splice(index)
//     const find = convertedArray.find(({fn, fd}) => fn === terp.fn && fd === terp.fd)
//     console.log('find', find)
// }

// for (let i = 0; i < convertedArray.length; i++) {
//     const el = convertedArray[i];
//     const find = convertedArray.find(({fn, fd}) => fn === el.fn && fd === el.fd)
//     console.log(find)
// }

// console.log(convertedArray)

//
// const targetArray = convertedArray.filter(e => deduplicatedArray.has(e))
// console.log('targetArray', targetArray)

// const array = []
// for (const {fn, fd} of testArray) {
//     const find = testArray.find(({fn, fd}) => fn === fn && fd === fd)
//     console.log()
// }



// const array = []
// for (const {fn, fd} of testArray) {
//     const find = testArray.find(({fn, fd}) => fn === fn && fd === fd)
//     console.log()
// }

// const filtered = testArray.filter(({fn, fd}) => fn === fn && fd === fd)
// console.log('filt', filtered)

// const test = testArray.filter(el => testArray.find(el => el === 1) === el)
//
// console.log(test)
//
//
// test
