const axios = require('axios');

const httpCallerOfd = {
    baseURL: 'https://ofv-api-v0-1-1.evotor.ru/v1/client/',
    token: '28C9C5AE77F999A529DD3B24B734CB88',
    sleepTimeout: 200,
}
const OFD_RECEIPTS_LIMIT = 5000;
const request = {
    dt: '2022-06-14'
}


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

async function test() {
    const scope = await getScope(request);
    console.log(scope)
    const receipts = await getReceipts(scope);
    console.log(receipts.length)

    // console.log(receipts[0])

    // const test = receipts.find(({fiscalDriveNumber: fn, fiscalDocumentNumber: fdNumber}) => fn === fn && fdNumber === fdNumber)

    const filtered = receipts.filter(({totalSum}) => totalSum<=0)
    console.log(filtered.length)

    // const convertedReceipts = receipts.map(({fiscalDriveNumber: fn, fiscalDocumentNumber: fdNumber}) => ({fn, fdNumber}))
    // console.log(convertedReceipts.length)
    // const stringyfiedReceipts = convertedReceipts.map(({fn, fdNumber}) => JSON.stringify({fn, fdNumber}))
    // console.log(stringyfiedReceipts.length)
    // const dedublicatedArray = [...new Set(stringyfiedReceipts)]
    // console.log(dedublicatedArray.length)
    // const dublicateReceipts = [];
    // for (const {fiscalDriveNumber: fn, fiscalDocumentNumber: fdNumber} of receipts) {
    //     const findedReceipt = receipts.find(({fn, fdNumber}) => fn === fn && fdNumber === fdNumber);
    //
    // }
    // console.log(dedublicatedArray.length)
}

test()
