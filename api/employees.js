// ----- Loading modules -----
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const express = require('express');
const employeesRouter = express.Router();
const timesheetsRouter = require('./timesheets.js')




// ----- Routing utilities -----

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);



// ----- Start Routing -----





// ----- Exporting modules -----

module.exports = employeesRouter;
