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

//This function checks if the input for post and put are valid.
const validateInput = (req, res, next) =>{

  const name = req.body.employee.name,
        pos = req.body.employee.position,
        wage = req.body.employee.wage,
        employed = req.body.employee.isCurrentlyEmployed === 0 ? 0 : 1;

        if (!name || !pos || !wage || !employed) {
          return res.sendStatus(400);
        }

    req.name = name;
    req.pos = pos;
    req.wage = wage;
    req.employed = employed;
    next();
};

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

// ----- Start Routing -----

employeesRouter.get('/', (req, res, next) =>{

  db.all("SELECT * FROM Employee WHERE is_current_employee = 1", (err, employees) =>{
    if (err) {
      next(err);
    }

    res.status(200).json({employees: employees})
  });
});

employeesRouter.post('/', validateInput, (req, res, next) =>{

  const sql = `INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $pos, $wage, $employed)`;

  const values = {
                  $name: req.name,
                  $pos: req.pos,
                  $wage: req.wage,
                  $employed: req.employed
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

employeesRouter.put('/:employeeId', validateInput, (req, res, next) =>{

  const sql = `UPDATE Employee SET
                        name = $name,
                        position = $pos,
                        wage = $wage,
                        is_current_employee = $employed
                        WHERE id = $id`;

  const values = {$name: req.name,
                  $pos: req.pos,
                  $wage: req.wage,
                  $employed: req.employed,
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
  db.run(`UPDATE Employee SET is_current_employee = 0 WHERE id = ${req.params.employeeId}`, function(err){
    db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, employee) =>{
      res.status(200).json({employee: employee});
    });
  });
});




// ----- Exporting modules -----

module.exports = employeesRouter;
