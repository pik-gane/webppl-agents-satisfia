// functions for estimating a metalog distribution from a number of moments and for the metalog CDF:

module.exports = { 
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
};
