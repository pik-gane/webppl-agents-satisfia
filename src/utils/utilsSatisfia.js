const emptySet= () => new Set();
const setFrom= (arg) => new Set(arg);
const min= (arr) => Math.min.apply(null, arr);
const max= (arr) => Math.max.apply(null, arr);
const time= () => new Date().getTime();

const stateActionData2locActionData= (stateActionData, stateActionPairs) => {
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
};

const trajDist2LocActionData= (trajDist, trajData) => {
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
}

module.exports = {
    emptySet,
    setFrom,
    min,
    max,
    time,
    stateActionData2locActionData, trajDist2LocActionData
};
