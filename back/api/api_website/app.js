const express = require('express');
const router = express.Router();
const website = require('./rutas/website');
router.use('/', website);

module.exports = router; 