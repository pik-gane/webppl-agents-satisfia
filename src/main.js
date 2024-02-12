// 

const dynamicTrees = require('./dynamic-trees')
const PrefixTree = dynamicTrees.structure.PrefixTree
const TrajectoriesDistributionForwardDiagramVisitor = dynamicTrees.visitors.forward
const TrajectoriesDistributionBackwardDiagramVisitor = dynamicTrees.visitors.backward

// TODO: how to move the functions to other js files and still make them available in webppl code??? 

var locActionData2ASCIIdefaultFormat = function (x) {
    // up to two decimal places if > 0.005, otherwise whitespace
    var y = Math.round(x * 100) / 100;
    return x == "?" ? " ?? "
        : x === undefined ? "    "
        : 5e-3 <= x && x < 10 ? y.toFixed(2)
        : 10 <= x && x < 100 ? y.toFixed(1)
        : 100 <= x && x < 10000 ? y
        : 10000 <= x ? y.toExponential(0).replace('+','')
        : -5e-3 >= x && x > -10 ? y.toFixed(1)
        : -10 >= x && x > -1000 ? y
        : -1000 >= x ? y.toExponential(0).replace('+','')
        : " ~0 "
        ;
};

var onlyNonnegativeFormat = function (x) {
    // up to two decimal places if > 0.005, otherwise whitespace
    return x == "?" ? " ?? "
        : x === undefined ? "    "
        : x > 5e-3 ? (Math.round(x * 100) / 100).toFixed(2)
        : x < -5e-3 ? (Math.round(x * 100) / 100).toFixed(1)
        : "    "
        ;
};

var prettyState = function (state) { return "(" + state.loc[0] + "," + state.loc[1] + ")-" + state.timeLeft; };

module.exports = {

    emptySet: () => new Set(),

    setFrom: (arg) => new Set(arg),

    objectFromPairs: (pairs) => {
        var result = {};
        for (var index in pairs) {
            var [key, value] = pairs[index];
            result[key] = value;
        }
        return result;
    },

    min: (arr) => Math.min.apply(null, arr),

    max: (arr) => Math.max.apply(null, arr),

    time: () => new Date().getTime(),

    locActionData2ASCIIdefaultFormat,

    onlyNonnegativeFormat,

    stateActionData2locActionData: function (stateActionData, stateActionPairs) {
        var locActionData = {}, timeLeft = {};
        for (var index in stateActionPairs) {
            var [state, action] = stateActionPairs[index]
            var loc = JSON.stringify(state.loc);
            var actionData = locActionData[loc];
            if (!actionData) {
                actionData = {};
                locActionData[loc] = actionData;
            }
            var val = stateActionData[index];
            if (!actionData[action]) {
                actionData[action] = val;
                timeLeft[[loc, action]] = state.timeLeft;
            } else if (state.timeLeft > timeLeft[[loc, action]]) {
                actionData[action] = val;
                timeLeft[[loc, action]] = state.timeLeft;
            } else if (state.timeLeft == timeLeft[[loc, action]] && val != actionData[action]) {
                console.log("WARNING: multiple entries for state", state, "action", action, "values", val, actionData[action]);
                actionData[action] = "?"; // TODO: how to handle this case?
            } 
        }
        return locActionData;
    },

    trajDist2LocActionData: function (trajDist, trajData) {
        var keys = Object.keys(trajDist), 
            V = {}, 
            Q = {},
            cupLoss = {},
            messingPotential = {},
            combinedLoss = {},
            actionFrequency = {};
        for (var index in keys) {
            var trajString = keys[index], 
                data = trajData[index],
                traj = JSON.parse(trajString), 
                val = trajDist[trajString], 
                prob = val.prob;
            for (var t in traj) {
                var stepData = traj[t], 
                    additionalData = data[t],
                    state = stepData.state, 
                    action = stepData.action, 
                    loc = JSON.stringify(state.loc);
//                char[loc] = state.name[0];
                var freq = actionFrequency[loc], 
                    q = Q[loc],
                    cL = cupLoss[loc],
                    combined = combinedLoss[loc],
                    mP = messingPotential[loc];
                V[loc] = Math.max(V[loc] || -1e10, additionalData.V);
                if (!q) { q = Q[loc] = {}; }
                if (!cL) { cL = cupLoss[loc] = {}; }
                if (!combined) { combined = combinedLoss[loc] = {}; }
                if (!mP) { mP = messingPotential[loc] = {}; }
                q[action] = Math.max(q[action] || -1e10, additionalData.Q);
                cL[action] = Math.max(cL[action] || -1e10, additionalData.cupLoss);
                combined[action] = Math.max(combined[action] || -1e10, additionalData.combinedLoss);
                mP[action] = Math.max(mP[action] || -1e10, additionalData.messingPotential);
                if (!freq) { actionFrequency[loc] = freq = {}; }
                freq[action] = (freq[action] || 0) + prob;
            }
        }
        return { V, Q, cupLoss, messingPotential, combinedLoss, actionFrequency };
    },

    locActionData2ASCII: function (
            locActionData,  // object keyed by JSON.stringify([x, y]), values are objects keyed by actions "u", "d", "l", "r"
            format = locActionData2ASCIIdefaultFormat  // optional value formatting function, should produce strings of length 4.
    ) {
        var locs = Object.keys(locActionData).map((l) => JSON.parse(l)), 
            xs = locs.map((l) => l[0]), ys = locs.map((l) => l[1]),
            minX = Math.min(...xs)-1, maxX = Math.max(...xs)+1, 
            minY = Math.min(...ys)-1, maxY = Math.max(...ys)+1;
//        console.log("xs", xs, "ys", ys, "minX", minX, "maxX", maxX, "minY", minY, "maxY", maxY);
        var asciiArt = "   ";
        for (var y = maxY; y >= minY; y--) {
            for (var x = minX; x <= maxX; x++) {
                asciiArt += "+––––––––––––––";
            }
            asciiArt += "+\n   ";
            for (var x = minX; x <= maxX; x++) {
                asciiArt += "|     " + format((locActionData[JSON.stringify([x, y])] || {})["u"]) + "     ";
            }
            asciiArt += "|\n"+String(y).padStart(2,' ')+" ";
            for (var x = minX; x <= maxX; x++) {
                asciiArt += "| " + format((locActionData[JSON.stringify([x, y])] || {})["l"]) 
                            + "    " + format((locActionData[JSON.stringify([x, y])] || {})["r"]) + " ";
            }
            asciiArt += "|\n   ";
            for (var x = minX; x <= maxX; x++) {
                asciiArt += "|     " + format((locActionData[JSON.stringify([x, y])] || {})["d"]) + "     ";
            }
            asciiArt += "|\n   ";
        }
        for (var x = minX; x <= maxX; x++) {
            asciiArt += "+––––––––––––––";
        }
        asciiArt += "+\n   ";
        for (var x = minX; x <= maxX; x++) {
            asciiArt += "       "+String(x).padStart(2,' ')+"      ";
        }
        asciiArt += "\n";
        return asciiArt;
    },

    printPolicy: function(padding, support, ps) {
        for (var i = 0; i < support.length; i++) {
            console.log(padding,"| | action",support[i][0],"aspiration",support[i][1],"prob.",ps[i]);
          }  
    },

    prettyState,

    trajDist2simpleJSON: function(trajDist) {
        var keys = Object.keys(trajDist),
            result = [];
        for (var index in keys) {
            var trajString = keys[index], 
                traj = JSON.parse(trajString), 
                val = trajDist[trajString], 
                prob = val.prob,
                trajOut = traj.map((stepData) => [prettyState(stepData.state), stepData.action]);
                res = [prob, trajOut]
                ;
            result.push(res);
        }
        return result;
    },

    debug: {
        inspect: function(...args) {
            const util = require('util')
            return util.inspect(...args)
        },
        trajectoriesDistribution: {
            diagrams: {
                forward: function (data) {
                    const distribution = data.getDist()
                    const result = new PrefixTree()
                    for(var key in distribution) {
                        TrajectoriesDistributionForwardDiagramVisitor.visit(result, JSON.parse(key), distribution[key])
                    }
                    return result
                },
                backward: function(data) {
                    const distribution = data.getDist()
                    const result = new PrefixTree()
                    for(var key in distribution) {
                        TrajectoriesDistributionBackwardDiagramVisitor.visit(result, JSON.parse(key), distribution[key])
                    }
                    return result
                }
            }
        }
    },

    // TO BE MOVED TO src/utils/metalog.js:

    /* TODO:
     * Stragegy:
     * - Solve the polynomial moment equations for the parameters: https://www.wikiwand.com/en/Metalog_distribution#Moments
     * - Substitute the approximated parameters into the quantile function: https://www.wikiwand.com/en/Metalog_distribution#Definition_and_quantile_function
     * - Solve the latter for the lower and upper aspiration bound to get the desired probability.
     * - use https://github.com/Pterodactylus/Ceres.js as solver?
     */

    estimateMetalog: function (moments) { 
        /*
         * Example for computing the probability p2-p1 of falling into interval [b1,b2] 
         * for given mean, variance, and skewness, using three parameters a1, a2, a3:
         *    mean = a1 + a3/2
         *    variance = pi²a2²/3 + a3²/12 + pi²a3²/36
         *    skewness = pi²a2²a3 + pi²a3³/24
         * TODO: how to form this system of equations for arbitrary number of moments? Does this help: http://www.metalogdistributions.com/moments.html ?
         */
        console.log("Hi");
        return undefined; // TODO
    },
        
    metalogCDF: function (params, x) { 
        /*
         * Example for three parameters a1, a2, a3:
         *    x = a1 + (a2 + a3 (p - .5)) logit(p)
         * In general:
         *    z = p - 1/2
         *    mu = a1 + a4 z + a5 z² + a7 z³ + a9 z⁴ + ...
         *    s = a2 + a3 z + a6 z² + a8 z³ + ...
         *    x = mu + s logit(p).
         */
        return undefined; // TODO
    },

    moments2probInInterval: function (moments, lo, hi) {
        var params = this.estimateMetalog(moments);
        return this.metalogCDF(params, hi) - this.metalogCDF(params, lo);
    },

    testMetalog: function (metalog) {
        // TODO: some monte carlo simulation starting with randomly drawn parameters, then computing the moments, then computing the probability of falling into an interval, then comparing this to the true probability
        var fn1 = function f1(x){
            return (x[0]+10*x[1]-20); //this equation is of the form f1(x) = 0 
        }
    
        var fn2 = function f2(x){
            return (Math.sqrt(5)*x[0]-Math.pow(x[1], 2)); //this equation is of the form f2(x) = 0 
        }
        var c1 = function callback1(x, evaluate_jacobians, new_evaluation_point){
                console.log(x);
        }
        var solver = metalog.solver;
        solver.add_function(fn1) //Add the first equation to the solver.
        solver.add_function(fn2) //Add the second equation to the solver.
        solver.add_callback(c1) //Add the callback to the solver.
        //solver.add_lowerbound(0,1.6) //Add a lower bound to the x[0] variable
        //solver.add_upperbound(1,1.7) //Add a upper bound to the x[1] variable
        var x_guess = [1,2] //Guess the initial values of the solution.
        var s = solver.solve(x_guess) //Solve the equation
        var x = s.x //assign the calculated solution array to the variable x
        console.log(s.report); //Print solver report
        
        solver.reset() //enables the solver to run agin without reloading
        solver.add_function(fn1) //Add the first equation to the solver.
        solver.add_function(fn2) //Add the second equation to the solver.
        solver.add_callback(c1) //Add the callback to the solver.
        var x_guess = [2,3] //Guess the initial values of the solution.
        var s = solver.solve(x_guess) //Solve the equation
        console.log(s.report); //Print solver report
        
        solver.remove() //required to free the memory in C++
        console.log("DONE");
        return undefined;
    }

    // TO BE MOVED TO src/utils/ceres.js:

    // TODO...
};
