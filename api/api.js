// ----- Loading modules -----
const express = require('express');
const apiRouter = express.Router();
const employeesRouter = require('./employees.js');
const menusRouter = require('./menus.js');



// ----- Start routing -----

apiRouter.use('/employees', employeesRouter);
apiRouter.use('/menus', menusRouter);


// ----- Exporting modules -----

module.exports = apiRouter;
