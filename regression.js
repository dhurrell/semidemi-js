var fs = require('fs');
const bestmatcher = require('./src/bestmatch');
const parser = require('./src/parser');

console.log('SemiDemi Regression Tests');

// Have a script to build tvs.demi.js from tvs.demi
// Run checker script and update matchers if required (may need ability to run it 'in sections'...)


var matchers = parser(fs.readFileSync('./tvs.demi', 'utf8'));
var normaliseDemiValue = function (v) {
    return v.toLowerCase().replace(/[^a-z0-9]/g, '_');
};

var runTest = function (testdata) {
    var msg;
    var expected = normaliseDemiValue(testdata.brand) + '-' + normaliseDemiValue(testdata.model);
    var result = bestmatcher(testdata.uagent)(matchers);

    if (!result) {
        if (expected === 'generic-smarttv') {
            process.stdout.write('. ');
        } else {
            process.stdout.write('x ');
            msg = '\n\n**No match found*/* for: '+testdata.uagent;
            msg += '\n> Expected: '+expected+'';
            console.log(msg);
            process.exit();
        }
        return;
    }
    var actual = result[0].brand+'-'+result[0].model;
    if (expected === actual) {
        process.stdout.write('. ');
    } else {
        process.stdout.write('x ');
        msg = '\n\n**FAIL*/*: '+testdata.uagent;
        if (result) {
            msg += '\n> Expected: '+expected;
            msg += '\n> Actual  : '+actual;
        }
        console.log(msg);
        process.exit();

    }
};

function runTests (tests) {
    var start = process.argv[2] || 0;
    var end = process.argv[3] || tests.length;
    console.log('Num UAs: ' + (tests.length+1));
    for (var i = start; i < end; i++) {
        runTest(tests[i]);
    }
    console.log('Finished');
}

var testData = require('./testdata/testdata.json');
runTests(testData);
