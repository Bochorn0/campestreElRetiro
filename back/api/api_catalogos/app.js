const express = require('express');
const router = express.Router();
const catalogos = require('./rutas/catalogos');
router.use('/', catalogos);

module.exports = router; 