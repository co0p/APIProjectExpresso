// ----- Loading modules -----
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});




// ----- Routing utilities -----

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) =>{

  const sql = `SELECT * FROM Timesheet WHERE id = ${timesheetId}`;

  db.get(sql, (err, timesheet) =>{
    if (err) {
      next(err);
    } else if (timesheet) {
      req.timesheet = timesheet;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

//This function checks if the input for post and put are valid.
const validateInput = (req, res, next) =>{

  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date

        if (!hours || !rate || !date) {
          return res.sendStatus(400);
        }

        req.hours = hours;
        req.rate = rate;
        req.date = date;
        next();

};

// ----- Start Routing -----

timesheetsRouter.get('/', (req, res, next) =>{

  db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`, (err, timesheets) =>{
    if (err) {
      next(err);
    }

    res.status(200).json({timesheets: timesheets})
  });
});

timesheetsRouter.post('/', validateInput, (req, res, next) =>{

  const sql = `INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, ${req.params.employeeId})`;

  const values = {
                  $hours: req.hours,
                  $rate: req.rate,
                  $date: req.date,
                };

  db.run(sql, values, function(err){
    if (err) {
      return next(err);
    }

    db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err, timesheet) =>{
      res.status(201).json({timesheet: timesheet});
    });
  });
});

timesheetsRouter.put('/:timesheetId', validateInput, (req, res, next) =>{

  const sql = `UPDATE Timesheet SET
                        hours = $hours,
                        rate = $rate,
                        date = $date
                        WHERE id = ${req.params.timesheetId}`;

  const values = {$hours: req.hours,
                  $rate: req.rate,
                  $date: req.date,
                  };

  db.run(sql, values, err =>{
    if (err) {
      return next(err);
    }

    db.get(`SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`, (err, timesheet) =>{
      res.status(200).json({timesheet: timesheet});
    });
  });
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) =>{
  db.run(`DELETE FROM Timesheet WHERE id = ${req.params.timesheetId}`, function(err){
    if (err) {
      next(err);
    }
    res.sendStatus(204);
  });
});






// ----- Exporting modules -----

module.exports = timesheetsRouter;
