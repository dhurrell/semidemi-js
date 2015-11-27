'use strict';

const inFile = 'testdata/livecomparisondata.json';

const fs = require('fs');
const bestmatcher = require('./src/bestmatch');
const parser = require('./src/parser');

const matchers = parser(fs.readFileSync('./tvs.demi', 'utf8'));

function normaliseDemiValue(v) {
    return v.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

function semiDemi(ua) {
    const result = bestmatcher(ua)(matchers);
    if (!result) {
        return;
    }

    return result[0].brand + '-' + result[0].model;
}

function testUserAgent(device, ua, failures) {
    const expected = normaliseDemiValue(device.brand) + '-' + normaliseDemiValue(device.model);
    const got = semiDemi(ua)

    if (expected === got) {
        process.stdout.write('.');
    } else {
        process.stdout.write('x');
        failures.push({
            ua: ua,
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

    for (let comparisonUA in data) {
        const device = data[comparisonUA];

        if (device.brand && device.model) {
            count++;
            testUserAgent(device, comparisonUA, dodgyUAs);
        }
    }

    console.log();

    printSummary(count, dodgyUAs.length);

    if (dodgyUAs.length) {
        printFailures(dodgyUAs);
        process.exit(1);
    }
}

if (!fs.existsSync(inFile)) {
    console.log('No input file. Run checker-generate.js first.');
    process.exit(55);
}

runTests(fs.readFileSync(inFile, 'utf8'));