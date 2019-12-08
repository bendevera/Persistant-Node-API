const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const errorHandler = require('errorhandler');
const api = require('./api/api');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());
app.use(errorHandler());
app.use(express.static('public'));

app.use('/api', api);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
})

module.exports = app;