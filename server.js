'use strict';
const express = require('express');
const fs = require('fs');
const bestMatch = require('./src/bestmatch');
const parser = require('./src/parser');
const port = 7591;
const matchers = parser(fs.readFileSync('./tvs.demi', 'utf8'));

function normaliseDemiValue(v) {
  return v.toLowerCase().replace(/[^a-z0-9]/g, "_");
}

let app = express();

app.get('/', (req, res) => {
  const uagent = req.query.ua || req.headers['user-agent'] || '';
  const result = bestMatch(uagent)(matchers) || [{ brand:'generic', model:'smarttv' }];
  res.json(result[0]);
});

app.listen(port, () => console.log(`running on port: ${port}`));
