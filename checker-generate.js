'use strict';

const http = require('http');
const lbl = require('linebyline');
const fs = require('fs');

const inPath = 'testdata/checker_uas.txt';
const outPath = 'testdata/livecomparisondata.json';

function regenerateComparisonDataFile(success) {
    let outstandingResults = 0;

    const output = fs.openSync(outPath, 'w');
    const results = [];

    function onResponse() {
        outstandingResults--;

        if (outstandingResults === 0) {
            fs.writeSync(output, JSON.stringify(results, null, 4));
            fs.close(output, success);
        }
    }

    function onResult(result) {
        if (result.brand && result.model) {
            console.log(`Brand: ${result.brand}, Model: ${result.model}, UA: ${result.ua}`);
            results.push(result);
        }
        onResponse();
    }

    function onError(e, ua) {
        if (ua) {
            console.log(`DeMI query error '${e}' for: ${ua}`);
        } else {
            console.log(`DeMI query error: ${e}`);
        }
        onResponse();
    }

    const lineReader = lbl(inPath);
    lineReader.on('line', function(line) {
        if (line) {
            outstandingResults++;
            getDemiResponseForUA(line, onResult, onError);
        }
    })
    .on('error', function(e) {
        console.log(`Error reading input file: ${e}`);
        process.exit(1);
    });
}

function downloadFile(options, success, error) {
    http.get(options).on('response', function(response) {
        let body = '';
        response.on('data', function(data) {
            body += data;
        })
        .on('end', function() {
            success(body)
        })
        .on('error', function(e) {
            error(e);
        });
    });
}

function getDemiResponseForUA(ua, success, error) {
    const encodedUA = encodeURI(ua);
    const options = {
        host: 'www-cache.reith.bbc.co.uk',
        path: `http://open.test.bbc.co.uk/wurfldemi/useragent.json?ua=${encodedUA}`
    };

    downloadFile(options, function(data) {
        try {
            const result = JSON.parse(data);
            success({
                ua: ua,
                brand: result.brand,
                model: result.model
            });
        }
        catch(e) {
            error(e, ua);
        }
    }, error);
}

console.log(`Generating fresh comparison data in ${outPath}`);
regenerateComparisonDataFile(function() {
    console.log(`Successfully written ${outPath}`);
});