// ----- Loading modules -----
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});




// ----- Routing utilities -----
menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) =>{

  const sql = `SELECT * FROM MenuItem WHERE id = ${menuItemId}`;

  db.get(sql, (err, menuItem) =>{
    if (err) {
      next(err);
    } else if (menuItem) {
      req.menuItem = menuItem;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

//This function checks if the input for post and put are valid.
const valiinventoryInput = (req, res, next) =>{

  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory
        price = req.body.menuItem.price

        if (!name || !description || !inventory || !price) {
          return res.sendStatus(400);
        }

        req.name = name;
        req.description = description;
        req.inventory = inventory;
        req.price = price;
        next();

};

// ----- Start Routing -----

menuItemsRouter.get('/', (req, res, next) =>{

  db.all(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`, (err, menuItems) =>{
    if (err) {
      next(err);
    }

    res.status(200).json({menuItems: menuItems})
  });
});

menuItemsRouter.post('/', valiinventoryInput, (req, res, next) =>{

  const sql = `INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, ${req.params.menuId})`;

  const values = {
                  $name: req.name,
                  $description: req.description,
                  $inventory: req.inventory,
                  $price: req.price
                };

  db.run(sql, values, function(err){
    if (err) {
      return next(err);
    }

    db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, menuItem) =>{
      res.status(201).json({menuItem: menuItem});
    });
  });
});

menuItemsRouter.put('/:menuItemId', valiinventoryInput, (req, res, next) =>{

  const sql = `UPDATE MenuItem SET
                        name = $name,
                        description = $description,
                        inventory = $inventory,
                        price = $price
                        WHERE id = ${req.params.menuItemId}`;

  const values = {$name: req.name,
                  $description: req.description,
                  $inventory: req.inventory,
                  $price: req.price
                  };

  db.run(sql, values, err =>{
    if (err) {
      return next(err);
    }

    db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`, (err, menuItem) =>{
      res.status(200).json({menuItem: menuItem});
    });
  });
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) =>{
  db.run(`DELETE FROM MenuItem WHERE id = ${req.params.menuItemId}`, function(err){
    if (err) {
      next(err);
    }
    res.sendStatus(204);
  });
});




// ----- Exporting modules -----

module.exports = menuItemsRouter;
