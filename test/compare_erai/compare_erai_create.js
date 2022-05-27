const {proto_create} = require("./erai_create_proto");
const {v3_create} = require("./erai_create_v3");

let exists_in_proto = [];
let exists_in_v3 = [];
let not_in_v3 = [];
let not_in_proto = [];
let count = 0;

function compare () {
    console.log('в прототипе на досыл: ', proto_create.length)
    console.log('в в3 на досыл: ', v3_create.length)

    for (let i of proto_create) {
        let trans = v3_create.find(item => item === i)
        if (trans) {
            exists_in_proto.push(trans);
            exists_in_v3.push(trans);
        } else {
            not_in_v3.push(i)
        }
    }

    for (let i of v3_create) {
        let trans = proto_create.find(item => item === i)
        if (trans) {
        } else {
            not_in_proto.push(i)
        }
    }

    console.log('есть в прототипе: ', exists_in_proto.length)
    console.log('есть в в3: ', exists_in_v3.length)

    console.log('нет в в3, но есть в прототипе: ', not_in_v3.length)
    console.log('нет в прототипе, но есть в в3: ', not_in_proto.length)
}

const main = () => {
    compare()
}

main()
