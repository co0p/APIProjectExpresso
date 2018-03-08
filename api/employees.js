// ----- Loading modules -----
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const express = require('express');
const employeesRouter = express.Router();
const timesheetsRouter = require('./timesheets.js');




// ----- Routing utilities -----



employeesRouter.param('employeeId', (req, res, next, employeeId) =>{

  const sql = `SELECT * FROM Employee WHERE id = ${employeeId}`;

  db.get(sql, (err, employee) =>{
    if (err) {
      next(err);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  });

});

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

// ----- Start Routing -----

employeesRouter.get('/', (req, res, next) =>{
  const sql = "SELECT * FROM Employee WHERE is_current_employee = 1";

  db.all(sql, (err, employees) =>{
    if (err) {
      next(err);
    }

    res.status(200).json({employees: employees})
  });
});

employeesRouter.post('/', (req, res, next) =>{

  const name = req.body.employee.name,
        pos = req.body.employee.position,
        wage = req.body.employee.wage,
        employed = req.body.employee.isCurrentlyEmployed === 0 ? 0 : 1;

        if (!name || !pos || !wage || !employed) {
          return res.sendStatus(400);
        }

  const sql = `INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $pos, $wage, $empl)`;

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

    db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, employee) =>{
      res.status(201).json({employee: employee});
    });
  });
});


employeesRouter.get('/:employeeId', (req, res, next) =>{
  res.status(200).json({employee: req.employee});
});

employeesRouter.put('/:employeeId', (req, res, next) =>{

  const name = req.body.employee.name,
        pos = req.body.employee.position,
        wage = req.body.employee.wage;

  if (!name || !pos || !wage) {
    return res.sendStatus(400);
  }

  const sql = `UPDATE Employee SET
                        name = $name,
                        position = $pos,
                        wage = $wage
                        WHERE id = $id`;

  const values = {$name: name,
                  $pos: pos,
                  $wage: wage,
                  $id: req.params.employeeId
                  };

  db.run(sql, values, err =>{
    if (err) {
      return next(err);
    }

    db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, employee) =>{
      res.status(200).json({employee: employee});
    });
  });
});

employeesRouter.delete('/:employeeId', (req, res, next) =>{
  
});




// ----- Exporting modules -----

module.exports = employeesRouter;
