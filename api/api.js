const express = require('express');
const artists = require('./artists');
const series = require('./series');

const api = express.Router();

api.use('/artists', artists);
api.use('/series', series);

module.exports = api;