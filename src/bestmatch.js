  // Find the best match of a useragent string against an array of SemiDemi Matcher structures.
  // Returns the best matching matcher, or null if no match can be found.
  // The Matcher structure is an array of objects, each of which has a single property.
  // The properties can be one of:
  // invariant: a string that must be exactly present in the ua for it to match
  // fuzzy: a string that can be approximately matched. The closer the match, the more likely this matcher is to be chosen as best.
  // disallowed: a string that must _not_ be present in the ua for it to match
  // version: a string prefix that will be followed by a version number. The version number will be ignored in matching.
  // The first element in the matcher can be an object with 'brand' and 'model' properties to be used as metadata.
  'use strict';
const scorer = require('./scorer');
const matcher = require('./matcher');

module.exports = (ua) => (matches) => {
    const fmatches = matches.filter(matcher(ua));
    if (fmatches.length === 1) {
      return fmatches[0];
    }
    return findBestMatch(ua, fmatches);
};

function findBestMatch(ua, matches) {
    const scores = matches.map(scorer(ua));
    const bestScore = Math.min.apply({}, scores);
    const bestScoreIndex = scores.indexOf(bestScore);

    return matches[bestScoreIndex];
};
