const data = {
    test: 1,
    _test: 42

};
const proxyData = new Proxy(data, {
    get(target, prop) {
        if (prop.indexOf('_') === 0) {
            throw new Error('Хрен тебе')
        }

        const value = target[prop];
        console.log("get data: ", value);
        return typeof value === "function" ? value.bind(target) : value;
    },
    set(target, prop, value) {
        target[prop] = value;
        console.log(`${prop}: ${value}`);
        return true;
    },
});

proxyData.test; // 'get data: 1'
proxyData.test2 = 'string'; // 'test2: string'
proxyData._test; // 'test2: string'
