const express = require("express");
const router = express.Router();
const Website = require("../modulos/website");
//const { permisos } = require('../../../shared/middleware/permisos');


router.get('/?', (req, res) => {
    let objWebsite = new Website();
    objWebsite.Base(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/obtenerContenidoSitioWeb', (req, res) => {
    let objWebsite = new Website();
    objWebsite.obtener_contenido_website(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});


module.exports = router;