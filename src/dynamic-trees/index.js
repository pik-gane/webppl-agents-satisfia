const structure = {
    structure: {
        PrefixTree: require('./structure/prefix-tree.js')
    },
    visitors: {
        forward: require('./visitors/forward-diagram-visitor.js'),
        backward: require('./visitors/backward-diagram-visitor.js')
    }
}

module.exports = structure
