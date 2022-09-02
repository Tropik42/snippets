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

/**
 * Get scope
 * @param {Object} request Request
 * @return {Object} scope
 */
async function getScope({dt, beginDttm, endDttm, rns}) {
    const scope = {
        beginDttm: dt ? `${dt} 00:00:00` : dttmFormat(beginDttm),
        endDttm: dt ? `${dt} 23:59:59` : dttmFormat(endDttm),
        rnList: rns || await getKkts(),
        data: {},
        receipts: [],
    };

    console.log((`${this.name}: Start sync`, scope));

    return scope;
}

/**
 * Get kkts
 * @return {Promise<Array>} kkts
 */
async function getKkts() {
    const {kktList} = await sendHttpRequest({path: 'kkts'});

    // console.log(kktList.orgBranches[0].kkts)
    return kktList.orgBranches[0].kkts
        .map(kkt => ({...kkt, hallId: parseInt(kkt.kktName.replace(/\D/g, ''), 10)}))
        .map(({kktRegNumber}) => kktRegNumber);
}

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
    const receipts = await getReceipts(scope);
    saveFile(data.dt, {receipts});
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

function createReceiptBatch(batch) {
    const params = batch.reduce((acc, receipt) => {
        acc.hallIds.push(receipt.hallId);
        acc.dsts.push(receipt.dst);
        acc.amounts.push(receipt.amount);
        acc.phones.push(receipt.phone || '79000000000');
        acc.paytypes.push(receipt.paytype);
        acc.dttms.push(dateFormatWithTz(receipt.dttm, receipt.tz));
        acc.recipients.push(receipt.recipient || null);
        acc.documentSeriesNumbers.push(receipt.documentSeriesNumber || null);
        acc.clients.push(receipt.client || null);
        acc.rns.push(receipt.rn || null);
        acc.fns.push(receipt.fn || null);
        acc.changeNumbers.push(receipt.changeNumber || null);
        acc.fdNumbers.push(receipt.fdNumber || null);

        return acc;
    }, {
        accountId: '1',
        walletId: 1,
        hallIds: [],
        cliId: 1,
        dsts: [],
        amounts: [],
        phones: [],
        paytypes: [],
        dttms: [],
        recipients: [],
        documentSeriesNumbers: [],
        clients: [],
        rns: [],
        fns: [],
        changeNumbers: [],
        fdNumbers: [],
        status: 'received',
        chunkId: 998,
    });

    return params;
}

async function processing(data) {
    const {receipts} = require(`./${data.dt}.json`);
    const sortReceipts = receipts
        .map(el => {
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
        // .filter(({dst}) => dst === 'OUT')
        // .filter(({fn, fdNumber}) => fn === '9960440300095051' && fdNumber === 68876)
        .sort(({dttm}) => dttm);

    const batchLength = 3
    const minReceipts = sortReceipts.slice(0, batchLength);
    console.log('Minimums', minReceipts);

    // console.log('Params', createReceiptBatch(minReceipts));

    // const maxReceipts = sortReceipts.slice(sortReceipts.length - batchLength);
    // console.log('Maximums', maxReceipts);
}

//saveReports({dt: '2022-07-24'}).catch(error => console.log(`Save reports error '${error.message}'`));
processing({dt: '2022-07-24'}).catch(error => console.log(`Processing error '${error.message}'`));

const {receipts} = require(`./2022-07-24.json`)
console.log('>>>>>>', receipts.length);

// const result = receipts.reduce((acc, {ecashTotalSum, operationType, totalSum}) => {
//     // if (`${ecashTotalSum && 'CARD_' || ''}${operationType === 1 && 'IN' || 'OUT'}` === 'CARD_OUT') {
//     if (`${ecashTotalSum && 'CARD_' || ''}${operationType === 0 && 'OUT' || "IN"}` === 'CARD_OUT') {
//         acc.count++;
//         acc.amount += ecashTotalSum / 100;
//     }
//
//     return acc;
// }, {
//     count: 0,
//     amount: 0,
// });
//
// console.log('>>>', result);

// console.log('>>>>', receipts.find(el => el.fiscalDriveNumber === '9960440300094654' && el.fiscalDocumentNumber === 11428));

