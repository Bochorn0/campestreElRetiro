const express = require("express");
const router = express.Router();
const Gastos = require("../modulos/gastos");

router.get('/?', (req, res) => {
    let objGastos = new Gastos();
    objCatalogos.Base(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/obtenerGastos', (req, res) => {
    let objGastos = new Gastos();
    objGastos.Obtener_gastos(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/guardarNuevoGasto', (req, res) => {
    let objGastos = new Gastos();
    objGastos.Guardar_nuevo_gasto(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/subirExcelPartidas', (req, res) => {
    let objGastos = new Gastos();
    objGastos.Subir_excel_partidas(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/borrarGastosMultiples', (req, res) => {
    let objGastos = new Gastos();
    objGastos.Borrar_gastos_multiples(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/borrarGasto?', (req, res) => {
    let objGastos = new Gastos();
    objGastos.Borrar_gasto(req.query.Id).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/obtenerFolioGasto?', (req, res) => {
    let objGastos = new Gastos();
    objGastos.Obtener_folio_gasto(req.query.Id).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});



module.exports = router;