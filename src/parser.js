'use strict';
module.exports = (input) => {
    return input
        .split(/[\r\n]+/)
        .filter(isNotEmptyLine)
        .filter(isNotCommentLine)
        .map(parseMatcher);
};

//TODO:
//Can the line be split up into sections beforeprocessing it?
//If it can, then this really should be a reduce.
//If not, does this version of node have tail-call ellimination? ...apparently no
//might be best to swap back to loop if it doesn't
function parseLine(matcher, resultHolder, lineNum) {
    // Look for start of marked up section
    const iBegin = matcher.indexOf("[");

    if (iBegin === -1) {
        // No marked up sections remaining
        resultHolder.result.push({ fuzzy: matcher });
        return resultHolder;
    } else if (iBegin > 0) {
        // Add the fuzzy before the marked up section
        resultHolder.result.push({ fuzzy: matcher.substr(0, iBegin) });
    }

    // Look for end of marked up section
    const type = matcher[iBegin+1];
    matcher = matcher.substr(iBegin);
    const iEnd = matcher.indexOf("]");

    if (iEnd === -1) { throw Error(`Syntax Error: Unterminated '[' on line ${lineNum}`); }

    const markedUpSection = matcher.substr(2, iEnd-2);

    if (type === "+") {
        resultHolder.result.push({ invariant: markedUpSection});
        resultHolder.hasInvariant = true;
    } else if (type === "-") {
        resultHolder.result.push({ disallowed: markedUpSection });
    } else if (type === "v") {
        resultHolder.result.push({ version: trimFromEnd(markedUpSection, /[0-9\-_\.]/) });
    } else {
        throw Error(`Syntax Error: Invalid markup '[${type}...]' on line ${lineNum}`);
    }

    const nextMatcher = matcher.substr(iEnd+1);

    if(nextMatcher === "") {
        return resultHolder;
    } else {
        return parseLine(nextMatcher, resultHolder, lineNum);
    }
}

function parseMatcher(line, lineNum) {

    const topRegex = /\s*([^\s]+)\s+([^:\s]+)\s*:\s*(.*)/;

    const sections = line.match(topRegex);
    if (!sections) { throw Error(`Syntax Error at top level (brand model:matcher) on line ${lineNum}`); }
    const brand = sections[1];
    const model = sections[2];
    const matcher = sections[3];
    const result = [ { brand, model } ];
    const hasInvariant = false;

    const resultHolder = parseLine(matcher, {result, hasInvariant}, lineNum);

    if (!resultHolder.hasInvariant) {throw Error(`Error: Matcher has no invariants on line ${lineNum}`); }
    return resultHolder.result;
};

//TODO:
//Another possible split then reduce?
function trimFromEnd(value, toTrim) {
    if(!value[value.length-1].match(toTrim)) {return value; }
    else {return trimFromEnd(value.substr(0, value.length-1), toTrim);}
};

function isNotEmptyLine(line) {
    const emptyLineRegex = /^\s*$/;
    return line.match(emptyLineRegex) == null;
};

function isNotCommentLine(line) {
    const commentLineRegex = /^\s*#.*$/;
    return line.match(commentLineRegex) == null;
};
