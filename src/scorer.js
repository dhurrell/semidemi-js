// Score a useragent string against a SemiDemi matcher.
// The higher the score, the worse the match, so a score of zero represents an exact match.
'use strict';
//scorer:: Num i => String -> String -> i
module.exports = (ua) => (matcher)=> {

    const filtered = matcher.reduce((last, match) => {
        //a bit of a mutant. :/
        let constructed = last.constructed;
        let normalised = last.normalised;

        constructed += match.fuzzy || "";
        constructed += match.invariant || "";
        constructed += match.version || "";

        if (match.version) {
            const normRegEx = buildNormalisationRegEx(match.version);
            normalised = normalised.replace(normRegEx, match.version);
        }

        return {
            constructed: constructed,
            normalised: normalised
        };

    }, {constructed: "", normalised: ua});

    return editDistance(filtered.normalised, filtered.constructed);
};

//buildNormalisationRegEx :: String -> RegExp
function buildNormalisationRegEx(prefix) {
    //TODO: Can this be improved/is it necessary?
    const normalised = prefix.replace(/\\/g, "\\\\")
                            .replace(/\*/g, "\\*")
                            .replace(/\./g, "\\.")
                            .replace(/\[/g, "\\[")
                            .replace(/\]/g, "\\]")
                            .replace(/\+/g, "\\+")
                            .replace(/\-/g, "\\-")
                            .replace(/\?/g, "\\?")
                            .replace(/\(/g, "\\(")
                            .replace(/\)/g, "\\)")
                            .replace(/\^/g, "\\^")
                            .replace(/\$/g, "\\$")
                            .replace(/\!/g, "\\!")
                            .replace(/\&/g, "\\&");
    return new RegExp (normalised + "[0-9._]+");
};

//editDistance :: Num i => i -> i -> i
function editDistance(a, b) {
    //;_; wat

    // This algorithm sourced from: https://gist.github.com/andrei-m/982927
    if(a.length === 0) return b.length;
    if(b.length === 0) return a.length;

    var matrix = [];

    // increment along the first column of each row
    var i;
    for(i = 0; i <= b.length; i++){
        matrix[i] = [i];
    }

    // increment each column in the first row
    var j;
    for(j = 0; j <= a.length; j++){
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for(i = 1; i <= b.length; i++){
        for(j = 1; j <= a.length; j++){
            if(b.charAt(i-1) == a.charAt(j-1)){
                matrix[i][j] = matrix[i-1][j-1];
            } else {
                matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                               Math.min(matrix[i][j-1] + 1, // insertion
                               matrix[i-1][j] + 1)); // deletion
            }
        }
    }

    return matrix[b.length][a.length];
};
