class BackwardDiagramVisitor {
    static visit (root, trajectory, parameters) {
        const reminder = [...trajectory]
        const data = reminder.pop()
        const vertex = root.append(data)
        if (reminder.length > 0) {
            vertex.visit(TrajectoriesDistributionBackwardDiagramVisitor.visit,
                vertex, reminder, parameters
            )
        }

        vertex.associate({ P: parameters.prob } )
    }
}

module.exports = BackwardDiagramVisitor
