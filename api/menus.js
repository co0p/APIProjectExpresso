// ----- Loading modules -----
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const express = require('express');
const menusRouter = express.Router();
const menuItemsRouter = require('./menu-items.js')




// ----- Routing utilities -----

menusRouter.param('menuId', (req, res, next, menuId) =>{

  const sql = `SELECT * FROM Menu WHERE id = ${menuId}`;

  db.get(sql, (err, menu) =>{
    if (err) {
      next(err);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });

});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

// ----- Start Routing -----

menusRouter.get('/', (req, res, next) =>{

  db.all("SELECT * FROM Menu", (err, menus) =>{
    if (err) {
      next(err);
    }

    res.status(200).json({menus: menus})
  });
});

menusRouter.post('/', (req, res, next) =>{

  console.log(req.body.menu);

  const name = req.body.menu.name,
        pos = req.body.menu.position,
        wage = req.body.menu.wage,
        employed = req.body.menu.isCurrentlyEmployed === 0 ? 0 : 1;

        if (!name || !pos || !wage || !employed) {
          return res.sendStatus(400);
        }

  const sql = `INSERT INTO Menu (name, position, wage, is_current_menu) VALUES ($name, $pos, $wage, $empl)`;

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

    db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, menu) =>{
      res.status(201).json({menu: menu});
    });
  });
});


menusRouter.get('/:menuId', (req, res, next) =>{
  res.status(200).json({menu: req.menu});
});

menusRouter.put('/:menuId', (req, res, next) =>{

  const name = req.body.menu.name,
        pos = req.body.menu.position,
        wage = req.body.menu.wage;

  if (!name || !pos || !wage) {
    return res.sendStatus(400);
  }

  const sql = `UPDATE Menu SET
                        name = $name,
                        position = $pos,
                        wage = $wage
                        WHERE id = $id`;

  const values = {$name: name,
                  $pos: pos,
                  $wage: wage,
                  $id: req.params.menuId
                  };

  db.run(sql, values, err =>{
    if (err) {
      return next(err);
    }

    db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (err, menu) =>{
      res.status(200).json({menu: menu});
    });
  });
});

menusRouter.delete('/:menuId', (req, res, next) =>{
  db.run(`UPDATE Menu SET is_current_menu = 0 WHERE id = ${req.params.menuId}`, function(err){
    db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (err, menu) =>{
      res.status(200).json({menu: menu});
    });
  });
});




// ----- Exporting modules -----

module.exports = menusRouter;
