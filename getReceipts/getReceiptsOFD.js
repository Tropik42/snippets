const axios = require('axios');
const fs = require('fs');
const {halls} = require(`./halls.json`);

const hallsObject = halls.reduce((acc, {hallId, tz}) => {
    acc[hallId] = tz;
    return acc;
}, {})

const httpCallerOfd = {
    baseURL: 'https://ofv-api-v0-1-1.evotor.ru/v1/client/',
    token: '28C9C5AE77F999A529DD3B24B734CB88',
    sleepTimeout: 200,
}
const OFD_RECEIPTS_LIMIT = 5000;
const MS_IN_HOUR = 60 * 60 * 1000;

const request = {
    dt: '2022-07-24'
}


/**
 * Get scope
 * @param {Object} request Request
 * @return {Object} scope
 */
// Подготовим все входные данные для запроса чеков
async function getScope({dt, beginDttm, endDttm, rns}) {
    const scope = {
        dt,
        beginDttm: dt ? `${dt} 00:00:00` : dttmFormat(beginDttm),
        endDttm: dt ? `${dt} 23:59:59` : dttmFormat(endDttm),
        rnList: rns || await getKkts(),
        data: {},
        receipts: [],
    };

    return scope;
}

// Заберём все кктшки, которые есть у ББ
/**
 * Get kkts
 * @return {Promise<Array>} kkts
 */
async function getKkts() {
    const {kktList} = await sendHttpRequest({path: 'kkts'});
    console.log('kkt list: ', kktList)

    // console.log(kktList.orgBranches[0].kkts)
    return kktList.orgBranches[0].kkts
        .map(kkt => ({...kkt, hallId: parseInt(kkt.kktName.replace(/\D/g, ''), 10)}))
        .map(({kktRegNumber}) => kktRegNumber);
}

//метод для отправления запросика по адресочку
/**
 * Send http request
 * @param {String} path Ofd endpoint
 * @param {Number} retryAttempts - Retry attempts counter
 * @return {Promise<Object|String>} http response
 */
async function sendHttpRequest({path, retryAttempts = 20}) {
    try {
        const {baseURL, token} = httpCallerOfd;
        const {data} = await axios.request({
            url: `${baseURL}${path}`,
            method: 'GET',
            headers: {Token: token, Accept: 'application/json'},
        });

        return data;
    } catch (error) {
        if (error.response && [500, 502, 503].includes(error.response.status) && retryAttempts > 0) {
            await new Promise(resolve => setTimeout(resolve, httpCallerOfd.sleepTimeout));
            return sendHttpRequest({path, retryAttempts: retryAttempts - 1});
        }

        throw new Error(error.message, {path});
    }
}

//запросим чеки у ОФД
/**
 * Get receipts by kkt
 * @param {Object} scope Scope
 * @return {Promise<Number>} result count
 */
async function getReceipts(scope) {
    let i = 0;
    await Promise.all(scope.rnList.map(async rn => {
        await new Promise(resolve => {
            setTimeout(resolve, i += httpCallerOfd.sleepTimeout);
        });

        const {receipts} = await sendHttpRequest({
            path: `receipts?kktRegId=${rn}&dateFrom=${scope.beginDttm}&dateTo=${scope.endDttm}`,
        });

        if (receipts && receipts.length >= OFD_RECEIPTS_LIMIT) {
            throw new Error(`Receipts limited by ${OFD_RECEIPTS_LIMIT}!`);
        }

        receipts && scope.receipts.push(...receipts);
    }));

    console.log(`GetReceipts: Get ${scope.receipts.length} receipts count`);

    return scope.receipts;
}

/**
 * Date format with tz
 * @param {Object} date Datetime
 * @param {Number} hallTZ Hall timezone
 * @return {String} datetime
 */
function dateFormatWithTz(date, hallTZ = 0) {
    const tz = hallTZ * 60;
    const tzM = tz % 60;
    const tzH = (tz - tzM) / 60;

    const dttm = new Date(+date + hallTZ * MS_IN_HOUR)
        .toISOString()
        .split('.')[0];

    return `${dttm}${tzH < 0 ? '-' : '+'}${(`0${~~tzH}`).slice(-2)}:${(`0${tzM}`).slice(-2)}`;
}

function saveFile(fileName, data) {
    const jsonContent = JSON.stringify(data)
    fs.writeFile(`${fileName}.json`, jsonContent, 'utf8', error => {
        if (error) {
            throw error;
        }
    });
}

async function saveReports(data) {
    const scope = await getScope(data);
    const rawReceipts = await getReceipts(scope);
    const receipts = rawReceipts.map(el => {
        const hallId = +el.kktName.replace(/\D/g, '');
        const tz = hallsObject[hallId];
        el.dttm = new Date(+new Date(`${el.receiptDate.split(' ')[0].replace(/\./g, '-')}T${el.receiptDate.split(' ')[1]}Z`) - tz * MS_IN_HOUR);
        el.beginDttm = new Date(+el.dttm - 60 * 1000);
        el.endDttm = new Date(+el.dttm + 120 * 1000);
        el.dateFormatWithTz = dateFormatWithTz(el.dttm, tz);
        el.amount = el.totalSum / 100;
        el.dst = `${el.ecashTotalSum && 'CARD_' || ''}${el.operationType === 1 && 'IN' || 'OUT'}`;
        el.paytype = el.ecashTotalSum === 0 ? 'cash' : 'cashless';
        el.fdNumber = el.fiscalDocumentNumber;
        el.fn = el.fiscalDriveNumber;
        el.hallId = hallId;
        return el;
    })
    saveFile(`receiptsFromOFD_${data.dt}.json`, {receipts});
}

// async function processing(data) {
//     const {receipts} = require(`receiptsFromOFD_${data.dt}.json`);
//     return receipts
//         .map(el => {
//             const hallId = +el.kktName.replace(/\D/g, '');
//             const tz = hallsObject[hallId];
//             el.dttm = new Date(+new Date(`${el.receiptDate.split(' ')[0].replace(/\./g, '-')}T${el.receiptDate.split(' ')[1]}Z`) - tz * MS_IN_HOUR);
//             el.beginDttm = new Date(+el.dttm - 60 * 1000);
//             el.endDttm = new Date(+el.dttm + 120 * 1000);
//             el.dateFormatWithTz = dateFormatWithTz(el.dttm, tz);
//             el.amount = el.totalSum / 100;
//             el.dst = `${el.ecashTotalSum && 'CARD_' || ''}${el.operationType === 1 && 'IN' || 'OUT'}`;
//             el.paytype = el.ecashTotalSum === 0 ? 'cash' : 'cashless';
//             el.fdNumber = el.fiscalDocumentNumber;
//             el.fn = el.fiscalDriveNumber;
//             el.hallId = hallId;
//             return el;
//         })
//         // .filter(({dst}) => dst === 'OUT')
//         // .filter(({fn, fdNumber}) => fn === '9960440300095051' && fdNumber === 68876)
//         .sort(({dttm}) => dttm);
//
//     // console.log('Params', createReceiptBatch(minReceipts));
//
//     // const maxReceipts = sortReceipts.slice(sortReceipts.length - batchLength);
//     // console.log('Maximums', maxReceipts);
// }

saveReports({dt: '2022-07-24'}).catch(error => console.log(`Save reports error '${error.message}'`));
// processing({dt: '2022-07-24'}).catch(error => console.log(`Processing error '${error.message}'`));


//СЕЙЧАС Я БУДУ ЗАБИРАТЬ ВСЕ ЧЕКИ
// async function test() {
//     const scope = await getScope(request);
//     console.log(`Scope received:`, scope);
//     const receiptsRaw = await getReceipts(scope);
//     const receipts = receiptsRaw.map((
//         {
//             fiscalDriveNumber: fn,
//             fiscalDocumentNumber: fdNumber,
//             kktRegId: rn,
//             totalSum: amount,
//             ecashTotalSum,
//             operationType,
//             ...el
//         }) => (
//         {
//             fn,
//             fdNumber,
//             amount: amount / 100,
//             dst: `${ecashTotalSum && 'CARD_' || ''}${operationType === 1 && 'IN' || 'OUT'}`,
//             rn,
//             ...el
//         }))
//     console.log(receipts.length)
//
//     // fs.appendFile(
//     //     'receiptsFromOFD.json',
//     //     'module.exports = {receiptsOFD:',
//     //     (err) => {
//     //         if (err) console.log(err)
//     //     }
//     // )
//
//     fs.appendFile(
//         `receiptsFromOFD_${scope.dt}.json`,
//         JSON.stringify(receipts),
//         (err) => {
//             if (err) console.log(err)
//         }
//     )
//
//     // fs.appendFile(
//     //     'receiptsFromOFD.js',
//     //     '}',
//     //     (err) => {
//     //         if (err) console.log(err)
//     //     }
//     // )
//
//     // console.log(receipts[0])
//
//     // const test = receipts.find(({fiscalDriveNumber: fn, fiscalDocumentNumber: fdNumber}) => fn === fn && fdNumber === fdNumber)
// }

// поехали
// test()
