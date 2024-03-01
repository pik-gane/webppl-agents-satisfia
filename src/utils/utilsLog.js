const locActionData2ASCIIdefaultFormat = function(x) {
    // up to two decimal places if > 0.005, otherwise whitespace
    var y = Math.round(x * 100) / 100;
    return x == "?" ? " ?? "
        : x === undefined ? "    "
            : 5e-3 <= x && x < 10 ? y.toFixed(2)
                : 10 <= x && x < 100 ? y.toFixed(1)
                    : 100 <= x && x < 10000 ? y
                        : 10000 <= x ? y.toExponential(0).replace('+', '')
                            : -5e-3 >= x && x > -10 ? y.toFixed(1)
                                : -10 >= x && x > -1000 ? y
                                    : -1000 >= x ? y.toExponential(0).replace('+', '')
                                        : " ~0 "
        ;
};

const onlyNonnegativeFormat = function(x) {
    // up to two decimal places if > 0.005, otherwise whitespace
    return x == "?" ? " ?? "
        : x === undefined ? "    "
            : x > 5e-3 ? (Math.round(x * 100) / 100).toFixed(2)
                : x < -5e-3 ? (Math.round(x * 100) / 100).toFixed(1)
                    : "    "
        ;
};

const prettyState = function(state) { return "(" + state.loc[0] + "," + state.loc[1] + ")-" + state.timeLeft; };

const locActionData2ASCII= function(
    locActionData,  // object keyed by JSON.stringify([x, y]), values are objects keyed by actions "u", "d", "l", "r"
    format = locActionData2ASCIIdefaultFormat  // optional value formatting function, should produce strings of length 4.
) {
    var locs = Object.keys(locActionData).map((l) => JSON.parse(l)),
        xs = locs.map((l) => l[0]), ys = locs.map((l) => l[1]),
        minX = Math.min(...xs) - 1, maxX = Math.max(...xs) + 1,
        minY = Math.min(...ys) - 1, maxY = Math.max(...ys) + 1;
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
        asciiArt += "|\n" + String(y).padStart(2, ' ') + " ";
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
        asciiArt += "       " + String(x).padStart(2, ' ') + "      ";
    }
    asciiArt += "\n";
    return asciiArt;
};

const printPolicy= function(padding, support, ps) {
    for (var i = 0; i < support.length; i++) {
        console.log(padding, "| |   action", support[i][0], "aspiration", support[i][1], "prob.", ps[i]);
    }
};


    const trajDist2simpleJSON= function(trajDist) {
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
    }

module.exports = {
locActionData2ASCIIdefaultFormat , 
onlyNonnegativeFormat , 
    prettyState, 
    locActionData2ASCII,
    printPolicy, trajDist2simpleJSON
}
