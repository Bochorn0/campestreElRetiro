const express = require('express');
const router = express.Router();
const gastos = require('./rutas/gastos');
router.use('/', gastos);

module.exports = router; 