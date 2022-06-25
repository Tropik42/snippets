const MS_IN_HOUR = 60 * 60 * 1000;

function formatDateTimezone(dttm, hallTz) {
    const tz = hallTz * 60;
    const tzM = tz % 60;
    const tzH = (tz - tzM) / 60;

    return new Date(+new Date(dttm) + hallTz * 60 * 60 * 1000)
        .toISOString()
        .replace('Z', `${tzH > 0 ? '+' : '-'}${(`0${~~tzH}`).slice(-2)}:${(`0${tzM}`).slice(-2)}`);
}

const tz = 5
const receiptDate = "2017.06.23 18:58:00.000"
const dttm = new Date(+new Date(`${receiptDate.split(' ')[0].replace(/\./g, '-')}T${receiptDate.split(' ')[1]}Z`) - tz * MS_IN_HOUR)
const beginDttm = new Date(+dttm - 60 * 1000);
const endDttm = new Date(+dttm + 60 * 1000);

console.log('dttm', dttm)
console.log('beginDttm', beginDttm)
console.log('endDttm', endDttm)
// console.log('test', new Date(+new Date(result) - 3 * MS_IN_HOUR))

console.log(new Date("2017-06-23T18:58:00.000Z"))
console.log(new Date("2017.06.23 18:58:00.000"))
console.log(new Date("2017-06-23 18:58:00.000"))
console.log(formatDateTimezone(dttm,tz))


