const Location = require('./location.js')

class Vertex {
    #vertices = null // of LocationVertex | StateVertex | ActionVertex
    #associations = null
    static #hash = require('object-hash')

    visit(fun, ...args) { return fun.call(this, ...args) }

    get vertices() {
        if (!this.#vertices) this.#vertices = new Array()
        return this.#vertices
    }

    get associations() {
        if (!this.#associations) this.#associations = new Array()
        return this.#associations
    }

    associate(data) {
        this.associations.push(data)
    }

    get hash() {
        return Vertex.#hash
    }

    [require('util').inspect.custom](depth, options, inspect) {
        if (!this.#vertices && !this.#associations) {
            return options.stylize(`${this.constructor.name}::Empty`, 'special');
        }


        if (depth < 0) {
            return options.stylize(`[${this.constructor.name}]`, 'special')
        }
        else {
            const newOptions = Object.assign({}, options, {
                depth: options.depth === null ? null : options.depth - 1,
            });

            let projection = Object.create({})

            if (!!this.#vertices) {
                for (const [key, value] of Object.entries(this.#vertices)) {
                    projection = Object.assign(projection, { [value.id || key ]: value })
                }
            }

            if (!!this.#associations) {
                projection = Object.assign(projection, { ['?']: this.#associations })
            }

            return `${this.constructor.name} ${inspect(projection, newOptions)}`
        }

    }
}

class ActionVertex extends Vertex {
    constructor(data) {
        super(data)
        this.action = data.action
        this.associate({ aleph: data.aleph4action })
    }

    append(data) {
        for (const index in this.vertices) {
            const vertex = this.vertices[index]
            if (vertex instanceof LocationVertex) {
                if (vertex.matches(data)) {
                    return vertex.append(data)
                }
            }
            else throw { context: this, append: { data, vertex } }
        }

        const locationVertex = new LocationVertex(data)
        this.vertices.push(locationVertex)
        return locationVertex.append(data)
    }

    get id() {
        return `/${this.action}/`
    }

    matches (data) {
        return this.action == data.action
    }
}

class LocationVertex extends Vertex {
    #location
    constructor(data) {
        super(data)
        this.#location = new Location(data.state.loc)
    }

    append(data) {
        for (const index in this.vertices) {
            const vertex = this.vertices[index]
            if (vertex instanceof StateVertex) {
                if (vertex.matches(data)) {
                    return vertex.append(data)
                }
            }
            else throw { context: this, append: { data, vertex } }
        }
        const stateVertex = new StateVertex(data)
        this.vertices.push(stateVertex)
        return stateVertex.append(data)
    }

    get id() {
       return this.#location.id
    }

    matches(data) {
        return this.#location.equals(new Location(data.state.loc))
    }
}

class StateVertex extends Vertex {
    #state
    constructor(data) {
        super(data)
        this.#state = data.state
        this.associate({ aleph: data.aleph4state })
    }

    append(data) {
        for (const index in this.vertices) {
            const vertex = this.vertices[index]
            if (vertex instanceof ActionVertex) {
                if (vertex.matches(data)) {
                    return vertex
                }
            }
            else throw { context: this, append: { data, vertex } }
        }
        const actionVertex = new ActionVertex(data)
        this.vertices.push(actionVertex)
        return actionVertex
    }

    get id() {
        return `#|${this.hash(this.#state, { encoding: 'base64' })}|`
    }

    matches(data) {
        return this.hash(this.#state) === this.hash(data.state)
    }
}


class PrefixTree extends Vertex {
    append(data) {
        for (const index in this.vertices) {
            const vertex = this.vertices[index]
            if (vertex instanceof LocationVertex) {
                if (vertex.matches(data)) {
                    return vertex.append(data)
                }
            }
            else throw { context: this, append: { data, vertex } }
        }

        const locationVertex = new LocationVertex(data)
        this.vertices.push(locationVertex)
        return locationVertex.append(data)
    }
}

module.exports = PrefixTree
