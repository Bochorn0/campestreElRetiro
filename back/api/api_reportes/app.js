const express = require('express');
const router = express.Router();
const reportes = require('./rutas/reportes');
router.use('/', reportes);

module.exports = router; 