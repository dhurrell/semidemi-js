const http = require('http');
const lbl = require('linebyline');
const fs = require('fs');

const outPath = 'testdata/livecomparisondata.json';

function regenerateComparisonDataFile(success) {
	var outstandingResults = 0;

	const output = fs.openSync(outPath, 'w');
	const results = {};

	function onResult(ua, result) {
		outstandingResults--;
		console.log(`Brand: ${result.brand}, Model: ${result.model}, UA: ${ua}`);

		results[ua] = result;

		if (outstandingResults == 0) {
			fs.writeSync(output, JSON.stringify(results));
			fs.close(output, success);
		}
	}

	function onError(e) {
		console.log(`epic fail: ${e}`);
		process.exit(1);
	}

	var lineReader = lbl('testdata/checker_uas.txt');
	lineReader.on('line', function(line) {
		outstandingResults++;
		getDemiResponseForUA(line, onResult, onError);
	})
	.on('error', onError);
}

function downloadFile(options, success, error) {
	http.get(options).on('response', function(response) {
		var body = '';
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
	ua = encodeURIComponent(ua);
	var options = {
		host: 'www-cache.reith.bbc.co.uk',
		path: `http://open.test.bbc.co.uk/wurfldemi/useragent.json?ua=${ua}`
	};

	downloadFile(options, function(data) {
		var result = JSON.parse(data);
		success(ua, {
			brand: result.brand,
			model: result.model
		});
	}, error);
}

console.log(`Generating fresh comparison data in ${outPath}`);
regenerateComparisonDataFile(function() {
	console.log(`Successfully written ${outPath}`);
});