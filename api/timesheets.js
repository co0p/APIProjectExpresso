// ----- Loading modules -----
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});




// ----- Routing utilities -----





// ----- Start Routing -----





// ----- Exporting modules -----

module.exports = timesheetsRouter;
