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

//This function checks if the input for post and put are valid.
const validateInput = (req, res, next) =>{

  const title = req.body.menu.title;

    if (!title) {
      return res.sendStatus(400);
    }

    req.title = title;
    next();
};

menusRouter.use('/:menuId/menu-items', menuItemsRouter);



// ----- Start Routing -----

menusRouter.get('/', (req, res, next) =>{

  db.all("SELECT * FROM Menu", (err, menus) =>{
    if (err) {
      next(err);
    }

    res.status(200).json({menus})
  });
});

menusRouter.post('/', validateInput, (req, res, next) =>{

  db.run(`INSERT INTO Menu (title) VALUES ($title)`, {$title: req.title}, function(err){
    if (err) {
      return next(err);
    }

    db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, menu) =>{
      res.status(201).json({menu});
    });
  });
});


menusRouter.get('/:menuId', (req, res, next) =>{
  res.status(200).json({menu: req.menu});
});

menusRouter.put('/:menuId', validateInput, (req, res, next) =>{

  const values = {
                    $title: req.title,
                    $id: req.params.menuId
  };

  db.run(`UPDATE Menu SET title = $title WHERE id = $id`, values,  err =>{
    if (err) {
      return next(err);
    }

    db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (err, menu) =>{
      res.status(200).json({menu});
    });
  });
});

menusRouter.delete('/:menuId', (req, res, next) =>{
  db.get(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`, (err, menuItem) =>{
    if (err) {
      return next(err);
    }

    if (menuItem) {
      return res.sendStatus(400);
    }

    db.run(`DELETE FROM Menu WHERE id = ${req.params.menuId}`, err =>{
      if (err) {
        return next(err);
      }

      res.sendStatus(204);
    });
  });
});




// ----- Exporting modules -----

module.exports = menusRouter;
