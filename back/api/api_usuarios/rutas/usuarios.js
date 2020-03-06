const express = require("express");
const router = express.Router();
const Usuarios = require("../modulos/usuarios");
//const { permisos } = require('../../../shared/middleware/permisos');


router.get('/?', (req, res) => {
    let objUsuarios = new Usuarios();
    objUsuarios.Base(req).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    }) 
});
router.post('/login', (req, res) => {
    let objUsuarios = new Usuarios();
    objUsuarios.Validar_login(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/apartarDocumento', (req, res) => {
    let objUsuarios = new Usuarios();
    objUsuarios.Apartar_documento(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/guardarNuevoUsuario', (req, res) => {
    let objUsuarios = new Usuarios();
    objUsuarios.Guardar_nuevo_usuario(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/guardarNuevoPerfil', (req, res) => {
    let objUsuarios = new Usuarios();
    objUsuarios.Guardar_nuevo_perfil(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/borrarApartadoDocumento', (req, res) => {
    let objUsuarios = new Usuarios();
    objUsuarios.Borrar_apartado_documento(req.query.ID).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/borrarUsuario', (req, res) => {
    let objUsuarios = new Usuarios();
    objUsuarios.Borrar_usuario(req.query.ID).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.get('/borrarPerfil', (req, res) => {
    let objUsuarios = new Usuarios();
    objUsuarios.Borrar_perfil(req.query.ID).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/actualizarDatosUsuario', (req, res) => {
    let objUsuarios = new Usuarios();
    objUsuarios.Actualizar_datos_usuario(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
router.post('/actualizarDatosPerfil', (req, res) => {
    let objUsuarios = new Usuarios();
    objUsuarios.Actualizar_datos_perfil(req.body).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
});



module.exports = router;