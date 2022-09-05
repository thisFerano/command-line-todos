const config = require('./data/response.json')

module.exports = class Response {
    constructor() {
        this.home = {
            main: config.home.main,
            remove: config.home.remove
        },
        this.local = {
            main: config.local.main
        },
        this.online = {
            // main: config.online.main
        }
        this.global = {
            bye: config.global.bye,
            not_available: config.global.not_available,
            wrong_input: config.global.wrong_input,
            simple: config.global.simple
        }
    }
}