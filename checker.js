'use strict';

const inFile = 'testdata/comparisondata.json';

const fs = require('fs');
const bestmatcher = require('./src/bestmatch');
const parser = require('./src/parser');

const matchers = parser(fs.readFileSync('./tvs.demi', 'utf8'));

function normaliseBrandModel(brand, model) {
    function normalise(s) {
        return s.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    if (brand && model) {
        return normalise(brand) + '-' + normalise(model);
    }

    return undefined;
}

function semiDemi(ua) {
    const result = bestmatcher(ua)(matchers);
    if (!result) {
        return;
    }

    return result[0].brand + '-' + result[0].model;
}

function testUserAgent(device, failures) {
    const expected = normaliseBrandModel(device.brand, device.model);
    const got = semiDemi(device.ua)

    if (expected === got) {
        process.stdout.write('.');
    } else {
        process.stdout.write('x');
        failures.push({
            ua: device.ua,
            expected: expected,
            got: got
        });
    }
}

function printSummary(successCount, failureCount) {
    console.log(`Checked ${successCount} UAs with ${failureCount} failures.`);
}

function printFailures(failures) {
    console.log('Failures: ');

    failures.forEach(function(dodgyUA) {
        console.log();
        console.log(`UA: ${dodgyUA.ua}`);
        console.log(`\tExpected: ${dodgyUA.expected}`);
        console.log(`\tGot: ${dodgyUA.got}`);
    });
}

function runTests (json) {
    const data = JSON.parse(json);
    const dodgyUAs = [];
    let count = 0;

    data.forEach(function(device) {
        count++;
        testUserAgent(device, dodgyUAs);
    });

    console.log();
    printSummary(count, dodgyUAs.length);

    if (dodgyUAs.length) {
        printFailures(dodgyUAs);
        printSummary(count, dodgyUAs.length);

        process.exit(1);
    }
}

if (!fs.existsSync(inFile)) {
    console.log('No input file. Run checker-generate.js first.');
    process.exit(55);
}

runTests(fs.readFileSync(inFile, 'utf8'));