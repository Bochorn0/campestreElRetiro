
const mysql =  require("../../../shared/db/mysql_driver");
const moment =  require ('moment');
const fs =  require('fs-extra');
module.exports = class Usuarios {
    Base(solicitud){
        return new Promise((resolve, reject)=>{
            return resolve({status: `ok`});
        })
    }
    Validar_login(datos){
        return new Promise((resolve, reject)=>{
            if(datos.Correo && datos.Password){
                let condiciones =  `WHERE u.Correo = '${datos.Correo}' AND u.Password = '${datos.Password}'`;
                let JOIN = `JOIN Perfiles as p  on p.IdPerfil = u.IdPerfil`;
                mysql.ejecutar(`SELECT *  FROM Usuarios as u ${JOIN} ${condiciones} LIMIT 1;`).then((res)=>{
                    let objToken = JSON.stringify({Correo: res[0].Correo, Password: res[0].Password});
                    let token = Buffer.from(objToken).toString("base64");
                    return this._generarToken(res[0],token);
                }).then(d=>{
                    return resolve({Data: d, error: false});
                }).catch(err => { return reject({Error:true,ErrorMessage: "Datos invalidos"})});
            }else{
                return reject({Error:true,ErrorMessage: "Datos invalidos"});
            }
        })
    }
    _generarToken(datos, token){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar(`UPDATE Usuarios SET Token = '${token}' WHERE IdUsuario = ${datos.IdUsuario}`).then((res)=>{
                return resolve([{Datos: { IdUsuario: datos.IdUsuario, IdEmpleado: datos.IdEmpleado, Nombre: datos.Nombre, Perfil:datos.Nombre_perfil },
                    Perfil: datos.Nombre_perfil,
                    Token : token,
                    Modulos: this._obtenerPermisosModulos(datos)
                    }]);
            }).catch(err => { return reject({Error:true, err})});
        });
    }
    _obtenerPermisosModulos(datos){
        let permisos = {Leer:true, Editar:true, Borrar:true};
/*        switch(datos.Peso){
            case 1: permisos = {Leer:true, Editar:true, Borrar:true};break; 
            case 2: permisos = {Leer:true, Editar:true};break;
            default:permisos = {Leer:true};break;
        }*/
        let modulos = {};
        modulos.Pagina = (datos.Pagina == 1)?{Permisos:permisos}:false;
        modulos.Ventas = (datos.Ventas == 1)?{Permisos:permisos}:false;
        modulos.Cobranza = (datos.Cobranza == 1)?{Permisos:permisos}:false;
        modulos.Finanzas = (datos.Finanzas == 1)?{Permisos:permisos}:false;
        modulos.Catalogos = (datos.Catalogos == 1)?{Permisos:permisos}:false;
        modulos.Gastos = (datos.Gastos == 1)?{Permisos:permisos}:false;
        modulos.Empleados = (datos.Empleados == 1)?{Permisos:permisos}:false;
        modulos.Usuarios = (datos.Usuarios == 1)?{Permisos:permisos}:false;
        modulos.AppVentas = (datos.AppVentas == 1)?{Permisos:permisos}:false;
        return modulos;
    }
    Apartar_documento(datos){
        return new Promise((resolve, reject)=>{
            this._verificarDocumento(datos).then(Documento =>{
                if(Documento){
                    return resolve({Procesado: true, Operacion: 'Este documento ya se encuentra apartado', Tipo: 'warning'});
                }else{
                    return this.Insertar_Documento(datos);
                }
            }).then(res =>{
              return resolve(res);
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    _verificarDocumento(datos){
        return new Promise((resolve, reject)=>{
            let condiciones = `IdCliente = ${datos.IdCliente} AND Nombre = '${datos.Nombre}' `;
            mysql.ejecutar(`SELECT IdApartado FROM Documentos_apartados WHERE ${condiciones};`).then((res)=>{
                return resolve(res);
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Insertar_Documento(datos){
        return new Promise((resolve, reject)=>{
            let today =  moment(new Date()).format('YYYY-MM-DD');
            let campos =  `IdCliente,IdUsuario,Nombre,Usuario,Fecha_apartado,Fecha_entrega,Fecha_insercion`;
            let valores = `${datos.IdCliente},${datos.IdUsuario},'${datos.Nombre}','${datos.Usuario}','${datos.Fecha_apartado}','${datos.Fecha_entrega}','${today}'`;
            mysql.ejecutar(`INSERT INTO Documentos_apartados (${campos}) VALUES (${valores});`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'El documento fue apartado correctamente', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Guardar_nuevo_usuario(datos){
        return new Promise((resolve, reject)=>{
            let today =  moment(new Date()).format('YYYY-MM-DD');
            let objToken = JSON.stringify({Correo: datos.Correo, Password: datos.Password});
            let token = Buffer.from(objToken).toString("base64");
            let campos =  `IdEmpleado, IdPerfil, Nombre, Correo, Password, Fecha_creacion, Token`;
            let valores = `${datos.IdEmpleado},${datos.IdPerfil},'${datos.Nombre}','${datos.Correo}','${datos.Password}','${today}','${token}'`;
            mysql.ejecutar(`INSERT INTO Usuarios (${campos}) VALUES (${valores});`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'El Usuario fue creado correctamente', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Guardar_nuevo_perfil(datos){
        return new Promise((resolve, reject)=>{
            let today =  moment(new Date()).format('YYYY-MM-DD');
            let campos =  `Nombre_perfil,Fecha_insert,Peso,Pagina,Ventas,Cobranza,Finanzas,Catalogos,Gastos,Empleados,Usuarios,AppVentas`;
            let valores = `'${datos.Nombre}','${today}',${datos.Peso},${datos.Pagina},${datos.Ventas},${datos.Cobranza},${datos.Finanzas},${datos.Catalogos},${datos.Gastos},${datos.Empleados},${datos.Usuarios}, ${datos.AppVentas}`;
            console.log('qieruy',`INSERT INTO Perfiles (${campos}) VALUES (${valores});`);
            mysql.ejecutar(`INSERT INTO Perfiles (${campos}) VALUES (${valores});`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'El Perfil fue creado correctamente', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Borrar_apartado_documento(Id){
        return new Promise((resolve, reject)=>{
            let condiciones = `IdApartado = ${Id}`;
            mysql.ejecutar(`DELETE FROM Documentos_apartados WHERE ${condiciones};`).then((res)=>{
                return resolve(res);
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Borrar_usuario(Id){
        return new Promise((resolve, reject)=>{
            let condiciones = `IdUsuario = ${Id}`;
            mysql.ejecutar(`DELETE FROM Usuarios WHERE ${condiciones};`).then((res)=>{
                return resolve(res);
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Borrar_perfil(Id){
        return new Promise((resolve, reject)=>{
            let condiciones = `IdPerfil = ${Id}`;
            mysql.ejecutar(`DELETE FROM Perfiles WHERE ${condiciones};`).then((res)=>{
                return resolve(res);
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Actualizar_datos_usuario(datos){
        return new Promise((resolve, reject)=>{            
            let update = ` SET `;
            update += (datos.Nombre)?` Nombre = '${datos.Nombre}',`:``;
            update += (datos.Perfil)?` Perfil = '${datos.Perfil}',`:``;
            update += (datos.IdPerfil)?` IdPerfil = '${datos.IdPerfil}',`:``;
            update += (datos.Correo)?` Correo = '${datos.Correo}',`:``;
            update += (datos.Password)?` Password = '${datos.Password}',`:``;
            update = update.slice(0,-1);
            mysql.ejecutar(`UPDATE Usuarios ${update} WHERE IdUsuario= ${datos.IdUsuario};`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'Los Datos del usuario fueron actualizados exitosamente ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Actualizar_datos_empleado(datos){
        return new Promise((resolve, reject)=>{            
            let update = ` SET `;
            update += (datos.Nombre)?` Nombre = '${datos.Nombre}',`:``;
            update += (datos.Puesto)?` Puesto = '${datos.Puesto}',`:``;
            update += (datos.Sueldo)?` Sueldo = ${datos.Sueldo},`:``;
            update += (datos.Correo)?` Correo = '${datos.Correo}',`:``;
            update = update.slice(0,-1);
            mysql.ejecutar(`UPDATE Empleados ${update} WHERE IdEmpleado = ${datos.IdEmpleado};`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'Los Datos del empleado fueron actualizados exitosamente ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Actualizar_datos_perfil(datos){
        return new Promise((resolve, reject)=>{
            let update = ` SET `;
            update += (datos.Nombre_perfil != null)?` Nombre_perfil = '${datos.Nombre_perfil}',`:``;
            update += (datos.Ventas != null)?` Ventas = ${datos.Ventas},`:``;
            update += (datos.Cobranza != null)?` Cobranza = ${datos.Cobranza},`:``;
            update += (datos.Finanzas != null)?` Finanzas = ${datos.Finanzas},`:``;
            update += (datos.Cotizaciones != null)?` Cotizaciones = ${datos.Cotizaciones},`:``;
            update += (datos.Gastos != null)?` Gastos = ${datos.Gastos},`:``;
            update += (datos.Usuarios != null)?` Usuarios = ${datos.Usuarios},`:``;
            update += (datos.Empleados != null)?` Empleados = ${datos.Empleados},`:``;
            update += (datos.Catalogos != null)?` Catalogos = ${datos.Catalogos},`:``;
            update += (datos.Reportes != null)?` Reportes = ${datos.Reportes},`:``;
            update += (datos.Carga != null)?` Carga = ${datos.Carga},`:``;
            update = update.slice(0,-1);
            mysql.ejecutar(`UPDATE Perfiles ${update} WHERE IdPerfil = ${datos.IdPerfil};`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'Los Datos del Perfil fueron actualizados exitosamente ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Obtener_archivo_manual(datos){
        console.log('datos',datos);
        return new Promise((resolve, reject) => {
            let path = `./shared/Manuales/${datos.Nombre}.docx`;
//            let path = `./shared/Manuales/Plantilla_gastos.xlsx`;
            console.log('path',path);
            let cont = fs.readFileSync(path);
            console.log('cont',cont);
            return resolve({String:cont.toString('base64')});
        });
    }
}