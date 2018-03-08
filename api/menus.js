// ----- Loading modules -----
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const express = require('express');
const menusRouter = express.Router();
const menuItemsRouter = require('./menu-items.js')




// ----- Routing utilities -----

menusRouter.use('/:menuId/menu-items', menuItemsRouter);



// ----- Start Routing -----





// ----- Exporting modules -----

module.exports = menusRouter;
