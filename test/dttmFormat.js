function dttmFormat(dttm = new Date(), format = 'yyyy-mm-dd hh:MM:ss') {
    const date = new Date(dttm);
    const replaces = {
        yyyy: `${date.getFullYear()}`,
        mm: `0${date.getMonth() + 1}`.slice(-2),
        dd: `0${date.getDate()}`.slice(-2),
        hh: `0${date.getHours()}`.slice(-2),
        MM: `0${date.getMinutes()}`.slice(-2),
        ii: `0${date.getMinutes()}`.slice(-2),
        ss: `0${date.getSeconds()}`.slice(-2),
        SSS: `00${date.getMilliseconds()}`.slice(-3),
    };

    return Object
        .keys(replaces)
        .reduce((acc, name) => acc.replace(name, replaces[name]), format);
}

console.log(dttmFormat(`2022-06-30 00:00:00`))
