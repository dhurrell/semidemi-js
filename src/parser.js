'use strict';
module.exports = (input) => {
    return input
        .split(/[\r\n]+/)
        .filter(isNotEmptyLine)
        .filter(isNotCommentLine)
        .map(parseMatcher);
};

const topRegex = /\s*([^\s]+)\s+([^:\s]+)\s*:\s*(.*)/;
function parseMatcher(line, lineNum) {
    var sections = line.match(topRegex);
    if (!sections) { throw "Syntax Error at top level (brand model:matcher) on line "+lineNum; }
    var brand = sections[1];
    var model = sections[2];
    var result = [ { brand: brand, model: model } ];
    var matcher = sections[3];
    var hasInvariant = false;
    var type;
    while (matcher !== "") {
        // Look for start of marked up section
        var i = matcher.indexOf("[");
        if (i === -1) {
            // No marked up sections remaining
            result.push({ fuzzy: matcher });
            break;
        } else if (i > 0) {
            // Add the fuzzy before the marked up section
            result.push({ fuzzy: matcher.substr(0, i) });
        }
        type = matcher.substr(i+1, 1);
        matcher = matcher.substr(i);
        // Look for end of marked up section
        i = matcher.indexOf("]");
        if (i === -1) {
            throw "Syntax Error: Unterminated '[' on line "+lineNum;
        } else if (type === "+") {
            result.push({ invariant: matcher.substr(2, i-2) });
            hasInvariant = true;
        } else if (type === "-") {
            result.push({ disallowed: matcher.substr(2, i-2) });
        } else if (type === "v") {
            result.push({ version: trimFromEnd(matcher.substr(2, i-2), /[0-9\-_\.]/) });
        } else {
            throw "Syntax Error: Invalid markup '["+type+"...]' on line "+lineNum;
        }
        matcher = matcher.substr(i+1);
    }

    if (!hasInvariant) { console.log(line);throw "Error: Matcher has no invariants on line "+lineNum; }
    return result;
};

function trimFromEnd(value, toTrim) {
    while (value[value.length-1].match(toTrim)) { value = value.substr(0, value.length-1); }
    return value;
};

function isNotEmptyLine(line) {
    const emptyLineRegex = /^\s*$/;
    return line.match(emptyLineRegex) == null;
};

function isNotCommentLine(line) {
    const commentLineRegex = /^\s*#.*$/;
    return line.match(commentLineRegex) == null;
};
