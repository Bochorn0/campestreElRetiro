const express = require("express");
const router = express.Router();
const Reportes = require("../modulos/reportes");
//const { permisos } = require('../../../shared/middleware/permisos');


router.get('/?', (req, res) => {
    let objReportes = new Reportes();
    objReportes.Base(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    }) 
});
router.get('/reporteIngresos', (req, res) => {
    let objReportes = new Reportes();
    objReportes.obtener_reporte_ingresos(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    }) 
});
router.get('/reporteGastos', (req, res) => {
    let objReportes = new Reportes();
    objReportes.obtener_reporte_gastos(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    }) 
});
router.get('/reporteCartera', (req, res) => {
    let objReportes = new Reportes();
    objReportes.obtener_reporte_cartera(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    }) 
});

router.get('/reporteClientes', (req, res) => {
    let objReportes = new Reportes();
    objReportes.obtener_reporte_clientes(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    }) 
});

router.post('/obtenerReporteVentas', (req, res) => {
    let objReportes = new Reportes();
    objReportes.reporte_ventas(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});

router.post('/obtenerDetallesFinanzas', (req, res) => {
    let objReportes = new Reportes();
    objReportes.reporte_finanzas(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});




module.exports = router;