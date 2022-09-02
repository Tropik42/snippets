const fs = require('fs');
const pg = require('pg-promise');
const axios = require('axios');
const {spawn} = require('child_process');
const {v4} = require('uuid')

const config = require('./config' + (process.env.NODE_ENV ? '.' + process.env.NODE_ENV  : ''));

// const request = {
//     dt: '2022-07-26'
// }

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
const dbReceiptL3 = pg({})(config.receiptl3db);
const dbEraiL3 = pg({})(config.erail3db);

const getV3Receipts = async () => {
    const receiptsFromV3 = await dbReceiptL3.query(
        `
        SELECT
             fn
            ,fd_number AS "fdNumber"
            ,amount
        FROM
            "receipt--l3-d00bed00".receipts
        WHERE
            dttm::DATE = $1
            AND status = 'received'
        ;
        `,
        [`${request.dt}`]
    )

    console.log(receiptsFromV3.length);


    fs.appendFile(
        `receiptsFromV3_${request.dt}.json`,
        JSON.stringify(receiptsFromV3),
        (err) => {
            if (err) console.log(err)
        }
    )
}

const getERAISumState = async (dt) => {
    const eraiSumState = await dbEraiL3.query(
        `
            WITH date AS (
                SELECT
                     report_type
                    ,erai_report_id
                FROM
                    "erai--l3-58fd77dl".erai_reports
                WHERE
                    report_date = $1
            )
            -- сумма транзакций в ЕРАИ по IN
            SELECT 'IN' AS dst, sum(amount) FROM "erai--l3-58fd77dl".erai_transactions WHERE erai_report_id = (SELECT erai_report_id FROM date WHERE report_type = 'deposits') AND method = 'C'
            UNION
            -- сумма транзакций в ЕРАИ по OUT
            SELECT 'OUT' AS dst, sum(amount) FROM "erai--l3-58fd77dl".erai_transactions WHERE erai_report_id = (SELECT erai_report_id FROM date WHERE report_type = 'payments') AND method = 'C'
            UNION
            -- сумма транзакций в ЕРАИ по CARD_OUT
            SELECT 'CARD_OUT' AS dst, sum(amount) FROM "erai--l3-58fd77dl".erai_transactions WHERE erai_report_id = (SELECT erai_report_id FROM date WHERE report_type = 'payments') AND method = 'N'
            -- количество транзакций по OUT и CARD_OUT
            UNION
            SELECT 'count' AS dst, (
                (SELECT count(*) FROM "erai--l3-58fd77dl".erai_transactions WHERE erai_report_id = (SELECT erai_report_id FROM date WHERE report_type = 'payments') AND method = 'C')
                +
                (SELECT count(*) FROM "erai--l3-58fd77dl".erai_transactions WHERE erai_report_id = (SELECT erai_report_id FROM date WHERE report_type = 'payments') AND method = 'N')
            );
        `,
        [`${dt}`]
    )

    return eraiSumState.reduce(
        (acc, item) => Object.assign(acc, { [item.dst]: item.sum}), {});
}

async function getDifference(eraiSumState) {
    console.log('состояние дня в ЕРАИ', eraiSumState);

    const ofdSumState = {
        IN: '31 832 934'.replace(/ /g, ''),
        OUT: '51 616 482,20'.replace(/ /g, '').replace(',', '.'),
        CARD_OUT: '13 725 610'.replace(/ /g, ''),
        count: '12 074'.replace(/ /g, ''),
    }

    const dif =  {
        IN: +ofdSumState.IN - +eraiSumState.IN,
        OUT: +ofdSumState.OUT - +eraiSumState.OUT,
        CARD_OUT: +ofdSumState.CARD_OUT - +eraiSumState.CARD_OUT,
        count: +ofdSumState.count - +eraiSumState.count,
    }
    console.log('Разница: ', dif)
    if (dif.IN === 0 && dif.OUT === 0 && dif.CARD_OUT === 0 && dif.count === 0) {
        console.log('СВЕДЕНО');
    }
    return dif;
}

// function calculateTransactionSums({IN, OUT, CARD_OUT, count}) {
//     // по IN
//     if (IN > 0) {
//         if (IN < 10000) {
//             console.log('Легче докинуть руками')
//         }
//     }
//
//     // по OUT
//     if (OUT > 0) {
//         if (OUT > 10000) {
//
//         }
//     }
// }


async function processing(dt) {
    const eraiSumState = await getERAISumState(dt).catch()
    const dif = getDifference(eraiSumState).catch()
    // const transactionSums = calculateTransactionSums(dif);
}

processing('2022-07-01').catch()


async function createTransactions (number, dt, type, dst, amount) {
    for (let i = 0; i < number; i++) {
        let createTransaction = JSON.stringify({
            "id": v4(),
            "locale": "ru",
            "domain": "erai",
            "event": type,
            "data": {
                "transactionId": (1010 + i),
                "accountId": "1",
                "walletId": 1,
                "hallId": 88,
                "cliId": 999,
                "chunkId": 888,
                "dst": dst,
                "amount": amount,
                "dttm": `${dt}T${Math.floor(Math.random() * (20 - 11)) + 11}:${Math.floor(Math.random() * (59 - 11)) + 11}:37.961+03:00`,
                "ofd": true
            },
            "tokens": {
                "id": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InBlcm1pc3Npb25JZCI6MH0sImdhdGVzIjpbImdhdGUtLWwxLWQ3ODllMjMxIl0sInBlcm1pc3Npb25zIjp7IndhbGxldCI6WyJwcm9jZXNzSW5UcmFuc2FjdGlvbnMiLCJwcm9jZXNzT3V0VHJhbnNhY3Rpb25zIl0sImVyYWkiOlsiY3JlYXRlRGVwb3NpdCIsImNyZWF0ZVBheW1lbnQiLCJyZW1vdmVEZXBvc2l0IiwicmVtb3ZlUGF5bWVudCIsImNyZWF0ZUVyYWlSZXBvcnQiLCJjcmVhdGVPZmRSZXBvcnQiLCJjcmVhdGVEaWZmUmVwb3J0IiwiaW5pdGlhbGl6ZURpZmZUcmFuc2FjdGlvbnNDcmVhdGUiLCJpbml0aWFsaXplRGlmZlRyYW5zYWN0aW9uc1JlbW92ZSIsImluaXRpYWxpemVTeW5jRGF5IiwiaW5pdGlhbGl6ZVN5bmMiXX19.VpUJCgH7hLj95AtYGkJ4-q1TAJ7d4Y_3rJbqKGQ4Mn6u9B2nT8CXBgA4UnVfqCR6Rs-3nhKkvM-8z1KWsX3amvQ9w86yZdgW8NZFEMiGP7FFd4_2W1ZhjHr3M4u2gZ8s31yeh4UDG0lsgw0e8zUphwPHm8OogHj1-Kq60H2kPlZIj-1N0DIg01kzPttimP5bW7OzQzh-lVQ0jq1joYV9-3t6hvhWS792kgfzrgGMweK1IUfQyTOvqAgz8vVUsmtlWAgBb0J0Dl_edfKp-fJu6cVKUXJPS62llVRCqueJYG7Ra-8h7ZfIW4jOriO5-i6Z5WKCO1c6WP9sskPEqq01yA",
                "access": "access"
            }
        });
        console.log(createTransaction, 'count', i)
        const axiosConfig = {
            method: 'post',
            url: 'http://prod-gate.v3.offline.bingo.zone/api/v1/rest/',
            headers: {
                'Content-type': 'application/json'
            },
            data : createTransaction
        };
        // axios(axiosConfig)
        //     .then(function (response) {
        //         console.log(JSON.stringify(response.data));
        //     })
        //     .catch(function (error) {
        //         console.log(error);
        //     });
    }
}

async function removeTransactions (amount, number, dt, type, method, sendQuery) {
    const eraiReportIds = await dbEraiL3.query(
        `
            select
                r.erai_report_id AS "eraiReportId"
            from
                "erai--l3-58fd77dl".reports r
                inner join "erai--l3-58fd77dl".transactions t on r.report_id = t.report_id
                inner join "erai--l3-58fd77dl".erai_transactions et on t.erai_id = et.erai_id
            where
                et.amount = $1
                and et.erai_report_id = (select erai_report_id from "erai--l3-58fd77dl".erai_reports WHERE report_type = 'payments' and report_date = $2)
                and method = $3
            limit $4;
        `,
        [amount, `${dt}`, method, number]
    )

    console.log(eraiReportIds)
    console.log(eraiReportIds.length)

    if (sendQuery) {
        for (let {eraiReportId} of eraiReportIds) {
            let removeTransaction = JSON.stringify({
                "id": v4(),
                "locale": "ru",
                "domain": "erai",
                "event": type,
                "data": {
                    "eraiReportId": eraiReportId,
                    "reason": "Incorrect transactions made by the operator at the point of sale"
                },
                "tokens": {
                    "id": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InBlcm1pc3Npb25JZCI6MH0sImdhdGVzIjpbImdhdGUtLWwxLWQ3ODllMjMxIl0sInBlcm1pc3Npb25zIjp7IndhbGxldCI6WyJwcm9jZXNzSW5UcmFuc2FjdGlvbnMiLCJwcm9jZXNzT3V0VHJhbnNhY3Rpb25zIl0sImVyYWkiOlsiY3JlYXRlRGVwb3NpdCIsImNyZWF0ZVBheW1lbnQiLCJyZW1vdmVEZXBvc2l0IiwicmVtb3ZlUGF5bWVudCIsImNyZWF0ZUVyYWlSZXBvcnQiLCJjcmVhdGVPZmRSZXBvcnQiLCJjcmVhdGVEaWZmUmVwb3J0IiwiaW5pdGlhbGl6ZURpZmZUcmFuc2FjdGlvbnNDcmVhdGUiLCJpbml0aWFsaXplRGlmZlRyYW5zYWN0aW9uc1JlbW92ZSIsImluaXRpYWxpemVTeW5jRGF5IiwiaW5pdGlhbGl6ZVN5bmMiXX19.VpUJCgH7hLj95AtYGkJ4-q1TAJ7d4Y_3rJbqKGQ4Mn6u9B2nT8CXBgA4UnVfqCR6Rs-3nhKkvM-8z1KWsX3amvQ9w86yZdgW8NZFEMiGP7FFd4_2W1ZhjHr3M4u2gZ8s31yeh4UDG0lsgw0e8zUphwPHm8OogHj1-Kq60H2kPlZIj-1N0DIg01kzPttimP5bW7OzQzh-lVQ0jq1joYV9-3t6hvhWS792kgfzrgGMweK1IUfQyTOvqAgz8vVUsmtlWAgBb0J0Dl_edfKp-fJu6cVKUXJPS62llVRCqueJYG7Ra-8h7ZfIW4jOriO5-i6Z5WKCO1c6WP9sskPEqq01yA",
                    "access": "access"
                }
            });
            console.log(removeTransaction, 'eraiReportId', eraiReportId)
            const axiosConfig = {
                method: 'post',
                url: 'http://prod-gate.v3.offline.bingo.zone/api/v1/rest/',
                headers: {
                    'Content-type': 'application/json'
                },
                data: removeTransaction
            };
            axios(axiosConfig)
                .then(function (response) {
                    console.log(JSON.stringify(response.data));
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    }
}

createTransactions(100, '2022-07-01', 'createDeposit', 'IN', 10000).catch()
removeTransactions(250, 1, '2022-07-02', 'removePayment', 'C', false).catch()
