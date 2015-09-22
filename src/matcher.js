// Match a useragent string against a SemiDemi Matcher structure
// Returns true if the useragent matches.
// The Matcher structure is an array of objects, each of which has a single property
// The properties can be one of:
// invariant: a string that must be exactly present in the ua for it to match
// disallowed: a string that must _not_ be present in the ua for it to match
'use strict';
module.exports = (ua) => (matcher) => {
    if (!matcher || matcher.constructor !== Array) { return false; }

    const matched = matcher.reduce((last, match) => {
        if (match.invariant && !contains(ua, match.invariant)) { return false; }
        else if (match.disallowed && contains(ua, match.disallowed)) { return false; }
        else { return last; }
    }, true);

    return matched;
};

var contains = function (haystack, needle) {
    return haystack.indexOf(needle) >= 0;
};
