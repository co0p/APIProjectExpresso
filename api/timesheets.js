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

// ----- Start Routing -----

timesheetsRouter.get('/', (req, res, next) =>{

  db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`, (err, timesheets) =>{
    if (err) {
      next(err);
    }

    res.status(200).json({timesheets: timesheets})
  });
});

timesheetsRouter.post('/', (req, res, next) =>{

  const name = req.body.timesheet.name,
        pos = req.body.timesheet.position,
        wage = req.body.timesheet.wage,
        employed = req.body.timesheet.isCurrentlyEmployed === 0 ? 0 : 1;

        if (!name || !pos || !wage || !employed) {
          return res.sendStatus(400);
        }

  const sql = `INSERT INTO Timesheet (name, position, wage, is_current_timesheet) VALUES ($name, $pos, $wage, $empl)`;

  const values = {
                  $name: name,
                  $pos: pos,
                  $wage: wage,
                  $empl: employed
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

timesheetsRouter.put('/:timesheetId', (req, res, next) =>{

  const name = req.body.timesheet.name,
        pos = req.body.timesheet.position,
        wage = req.body.timesheet.wage;

  if (!name || !pos || !wage) {
    return res.sendStatus(400);
  }

  const sql = `UPDATE Timesheet SET
                        name = $name,
                        position = $pos,
                        wage = $wage
                        WHERE id = $id`;

  const values = {$name: name,
                  $pos: pos,
                  $wage: wage,
                  $id: req.params.timesheetId
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
  db.run(`UPDATE Timesheet SET is_current_timesheet = 0 WHERE id = ${req.params.timesheetId}`, function(err){
    db.get(`SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`, (err, timesheet) =>{
      res.status(200).json({timesheet: timesheet});
    });
  });
});






// ----- Exporting modules -----

module.exports = timesheetsRouter;
