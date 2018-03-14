// ----- Loading modules -----
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const errorhandler = require('errorhandler');
const apiRouter = require('./api/api');

const app = express();

// ----- Start routing -----

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));
app.use(errorhandler());

app.use('/api', apiRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('Listening on port: ' + PORT);
});


// ----- Exporting modules -----

module.exports = app;
