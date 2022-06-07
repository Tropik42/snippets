function formatDateTimezone(dttm, hallTz) {
    const tz = hallTz * 60;
    const tzM = tz % 60;
    const tzH = (tz - tzM) / 60;

    return new Date(+new Date(dttm) + hallTz * 60 * 60 * 1000)
        .toISOString()
        .replace('Z', `${tzH > 0 ? '+' : '-'}${(`0${~~tzH}`).slice(-2)}:${(`0${tzM}`).slice(-2)}`);
}

console.log(formatDateTimezone("2021-09-15T11:25:32.961+00:00",5))
