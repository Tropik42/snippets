const http = require('http');
const EventEmitter = require('events');
const PORT = process.env.PORT || 5000;

const emitter = new EventEmitter();

class Router {
    constructor() {
        this.endpoints = {}
    }

    request(method = 'GET', path, handler) {
        if(!this.endpoints[path]) {
            this.endpoints[path] = {}
        }
        const endpoint = this.endpoints[path];

        if(endpoint[method]) {
            throw new Error(`[${method}] по адресу ${path} уже существует`)
        }

        endpoint[method] = handler
    }
}

const server = http.createServer((req, res) => {
    // res.writeHead(200, {
    //     'Content-type': 'text/html; charset=utf8'
    // })
    res.writeHead(200, {
        'Content-type': 'application/json'
    })
    if(req.url === '/users') {
        return res.end(JSON.stringify([
            {id: 1, name: 'Sex'}
        ]))
    }
    if(req.url === '/posts') {
        return res.end('POSTS')
    }
    res.end(req.url)
})

server.listen(PORT, () => console.log(`Server started on port ${PORT}`))
