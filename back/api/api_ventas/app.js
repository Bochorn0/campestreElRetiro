const express = require('express');
const router = express.Router();
const ventas = require('./rutas/ventas');
router.use('/', ventas);

module.exports = router; 