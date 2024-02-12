class TrajectoriesDistributionForwardDiagramVisitor {
    static visit (root, trajectory, parameters) {
        const [data, ...reminder] = trajectory
        const vertex = root.append(data)
        if (reminder.length > 0) {
            vertex.visit(TrajectoriesDistributionForwardDiagramVisitor.visit,
                vertex, reminder, parameters
            )
        }

        vertex.associate({ P: parameters.prob } )
    }
}
module.exports = TrajectoriesDistributionForwardDiagramVisitor
