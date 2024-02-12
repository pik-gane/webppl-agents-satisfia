const util = require('util')

class Location {
    #data
    constructor(data) {
        this.#data = data
    }

    equals(other) {
        if (this.#data.length != other.#data.length) return false

        for (const index in this.#data) {
            if (other.#data[index] != this.#data[index]) return false
        }

        return true
    }

    get id() {
        return `@(${this.#data.join(',')})`
    }

    [util.inspect.custom](depth, options, inspect) {
        if (depth < 0) return options.stylize('[Location]', 'special')
        return `Location (${this.id})`
    }
}

module.exports = Location
