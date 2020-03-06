const express = require('express');
const router = express.Router();
const usuarios = require('./rutas/usuarios');
router.use('/', usuarios);

module.exports = router; 