const express = require("express");
const router = express.Router();
const Catalogos = require("../modulos/catalogos");
//const { permisos } = require('../../../shared/middleware/permisos');


router.get('/?', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Base(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/clientes', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Catalogo_clientes(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/obtenerRelacionesTerrenos', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Catalogo_relaciones(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/empleados', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Catalogo_empleados(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/ventas', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Catalogo_ventas(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/catalogoTipoVentas', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Catalogo_tipo_ventas(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/catalogoTipoGastos', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Catalogo_tipo_gastos(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/empleados', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Catalogo_empleados(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/contratos', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Catalogo_contratos(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/documentos', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Catalogo_documentos(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/tiposDocumentos', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Catalogo_tipos_documentos(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/usuarios', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Catalogo_usuarios(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/puestos', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Catalogo_puestos(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/cotizaciones', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Catalogo_cotizaciones(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/cuentas_especiales', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Catalogo_cuentas(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});

router.get('/borrarCuentaEspecial?', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Borrar_cuenta_especial(req.query.Id).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/actualizarCuentaEspecial', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Actualizar_cuenta_especial(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});

router.get('/cuentas_especiales', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Catalogo_cuentas(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/desasignarCotizacion', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Desasignar_cotizacion(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/activarCotizacion', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Activar_cotizacion(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/obtenerTerrenoPorId?', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Obtener_terreno_por_id(req.query.Id).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/actualizarDatosCliente', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Actualizar_cliente(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/obtenerDatosContrato', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Obtener_datos_contrato(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/actualizarDatosCliente', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Actualizar_cliente(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/actualizarDatosMantenimiento', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Actualizar_mantenimiento(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});

router.post('/guardarNuevoTipoDocumento', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Guardar_tipo_documento(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/obtenerTerrenos', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Obtener_terrenos(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/catalogoGastos', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Catalogo_gastos(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/actaulizarDatosCategorias', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Actualizar_datos_categorias(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/guardarNuevoEmpleado', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Guardar_nuevo_empleado(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/guardarNuevaCuentaEspecial', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Guardar_nueva_cuenta_especial(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/guardarNuevaCategoria', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Guardar_nueva_categoria(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/borrarCategoria', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Borrar_categoria(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});


router.post('/guardarNominaEmpleado', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Guardar_nomina_empleado(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/subirExcelTerrenos', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.subir_excel_terrenos(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/borrarTerreno', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Borrar_terreno(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/borrarTerrenosMultiples', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Borrar_terrenos_multiples(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/plantillaTerrenos', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Obtener_plantilla_terrenos(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/plantillaGastos', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Obtener_plantilla_gastos(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/actualizarTerreno', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Actualizar_terreno(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/datosTodos', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.Catalogo_datos(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/modificarDatostodos', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.modificar_datos_todos(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/borrarRegistroDatosTodos', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.borrar_registro_datos_todos(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/obtenerProspectosVentas', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.obtener_prospectos_ventas(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/guardarProspectosVentas', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.guardar_prospectos_ventas(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/actualizarProspectosVentas', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.actualizar_prospectos_ventas(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/borrarProspectosVentas', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.borrar_prospectos_ventas(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/envio_correo', (req, res) => {
    let objCatalogos = new Catalogos();
    objCatalogos.envio_correo_contacto(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
module.exports = router;