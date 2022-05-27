const fs = require('fs');
const pg = require('pg-promise');
const {spawn} = require('child_process');

const {proto_remove} = require('./erai_remove_proto')
const {v3_remove} = require('./erai_remove_v3')

const config = require('./config' + (process.env.NODE_ENV ? '.' + process.env.NODE_ENV  : ''));

const childProcess = [];
const spawnBastion = config => new Promise((res, rej) => {
    const {port, bastionHost, bastionUser = 'developer'} = config;
    if(!port || !bastionHost) {
        console.error(`Skip spawn bastion`, config);
        return res();
    } else console.log(`Spawn bastion proxy ${bastionHost}...`);

    const proxyProcess = spawn('ssh',
        `-L ${port}:${bastionHost} ${bastionUser}@external.infra.bingo.zone -N`.split(' '), {detached: true,});

    childProcess.push(proxyProcess);
    proxyProcess.stdout.on('data', (data) => console.log('stdout:', data.toString()));
    proxyProcess.stderr.on('data', (data) => console.log('stderr:', data.toString()));
    proxyProcess.stderr.on('data', (data) => data.includes('bind: Address already in use') ? proxyProcess.kill() : rej(data));

    proxyProcess.on('spawn', (code) => (console.log(`spawned`), setTimeout(() => res(), 2000)));
    // proxyProcess.on('close', (code) => console.log(`process exited with code ${code}`));

    proxyProcess.unref();
});

const dbEraiL3 = pg({})(config.erail3db);

let exists_in_proto = [];
let exists_in_v3 = [];
let not_in_v3 = [];
let not_in_proto = [];
let count = 0;

function compare () {
    console.log('в прототипе на удаление: ', proto_remove.length)
    console.log('в в3 на удаление: ', v3_remove.length)

    for (let i of proto_remove) {
        let trans = v3_remove.find(item => item === i)
        if (trans) {
            exists_in_proto.push(trans);
            exists_in_v3.push(trans);
        } else {
            not_in_v3.push(i)
        }
    }

    for (let i of v3_remove) {
        let trans = proto_remove.find(item => item === i)
        if (trans) {
        } else {
            not_in_proto.push(i)
        }
    }

    console.log('есть в прототипе: ', exists_in_proto.length)
    console.log('есть в в3: ', exists_in_v3.length)

    console.log('нет в в3, но есть в прототипе: ', not_in_v3.length)
    console.log('нет в прототипе, но есть в в3: ', not_in_proto.length)

    console.log(not_in_proto)
}



const main = async () => {
    // await spawnBastion(config.erail3db);
    compare();

    for (let i of not_in_v3) {
        // const i = not_in_v3
        // console.log(i)
        const transData = await dbEraiL3.query(
            `
        SELECT
             erai_id                AS "eraiId"
            ,erai_amount            AS "eraiAmount"
            ,hall_id                AS "hallId"
            ,erai_occurred_at::TEXT AS "eraiOccurredAt"
        FROM
            "erai-l3--58fd77dl".transactions
        WHERE
            erai_id = $1;
        `,
        [i]
        )

        console.log(transData)

        fs.appendFile(
            'remove_not_in_v3_compare.txt',
            'Данные из таблицы transactions: \n' + JSON.stringify(transData[0]) + '\n \n',
            (err) => {
            if (err) throw err;
        })

        const {eraiAmount, hallId, eraiOccurredAt} = transData[0]
        console.log(eraiOccurredAt)
        const bankData = await dbEraiL3.query(
        `
        SELECT
             bt.bank_transaction_id AS "bankTransactionId"
            ,bt.bank_report_id      AS "bankReport"
            ,bt.amount
            ,bt.utc_datetime::TEXT  AS "utcDatetime"
            ,d.hall_id              AS "hallId"
        FROM
                      "erai-l3--58fd77dl".bank_transactions bt
            LEFT JOIN "erai-l3--58fd77dl".devices           d ON bt.device_number = d.device_number
        WHERE
            TRUE
            AND bt.amount = ${eraiAmount}
            AND d.hall_id = ${hallId}
            AND bt.utc_datetime > $1::timestamptz - INTERVAL '2 minute'
            AND bt.utc_datetime < $1::timestamptz + INTERVAL '1 minute'
          ;
        `,[eraiOccurredAt]
        )

        count++
        fs.appendFile(
            'remove_not_in_v3_compare.txt',
            'Данные из таблицы bank_transactions: \n' + JSON.stringify(bankData[0]) + `\n Номер транзакции: ${count}` + '\n \n',
            (err) => {
                if (err) throw err;
            })
    }

}

main();

// TRUE
// AND bt.amount = amount
// AND d.hall_id = $2
// AND bt.utc_datetime > ($3::timestamptz - INTERVAL '1 minute')
// AND bt.utc_datetime < ($4::timestamptz + INTERVAL '2 minute')
// [amount, hallId, new Date(+eraiOccurredAt - 60 * 1000), new Date(+eraiOccurredAt + 120 * 1000)]



// compare();
