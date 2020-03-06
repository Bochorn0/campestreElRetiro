const express = require("express");
const router = express.Router();
const Ventas = require("../modulos/ventas");

router.get('/?', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Base(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});

router.get('/obtenerFolioVenta', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Obtener_folio_venta(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/obtenerFolioMantenimiento', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Obtener_folio_mantenimiento(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});

router.post('/guardarNuevoIngreso', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Guardar_nuevo_ingreso(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/guardarNuevoMantenimiento', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Guardar_nuevo_mantenimiento(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/borrarIngreso?', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Borrar_ingreso(req.query.Id).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/guardarNuevoCliente', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Guardar_nuevo_cliente(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/guardarCotizacion', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Guardar_cotizacion(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.put('/editarCliente', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Editar_cliente(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/obtenerMensualidades?', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Obtener_mensualidades(req.query.Id).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/obtenerAnualidades?', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Obtener_anualidades(req.query.Id).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/pruebaPDF', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Generar_pdf_prueba(req.query).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/pruebaPagare', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Generar_pdf_pagare(req.query).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/pagarePDF', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Generar_pdf_pagare(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/contratosPdf', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Generar_pdf_contrato(req.query).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/reciboPDF', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Generar_pdf_recibo(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/obtenerMantenimientos', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Obtener_mantenimientos(req.body.IdCliente).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/borrarCliente', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Borrar_cliente(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/guardarNuevoContrato', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Guardar_archivo_contrato(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/guardarDatosArchivo', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Guardar_datos_archivo(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/guardarDatosBaseDatos', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Guardar_datos_base_datos(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/afectarSaldosDatos', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Afectar_saldos_datos(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/enviarCorreo', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Enviar_correo(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/obtenerVentasEmpleado', (req, res) => {
    let objVentas = new Ventas();
    objVentas.Obtener_ventas_empleado(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});

router.post('/obtenerDatosCarga', (req, res) => {
    let objVentas = new Ventas();
    objVentas.obtener_datos_carga(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/mensualidadesMorosas', (req, res) => {
    let objVentas = new Ventas();
    objVentas.verificar_mensualidades_morosas(req.query).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/mantenimientosAutomaticos', (req, res) => {
    let objVentas = new Ventas();
    objVentas.generar_mantenimientos_automticos(req.query).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/obtenerMantenimientoCalculado', (req, res) => {
    let objVentas = new Ventas();
    objVentas.obtener_mantenimiento_calculado(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});




module.exports = router;