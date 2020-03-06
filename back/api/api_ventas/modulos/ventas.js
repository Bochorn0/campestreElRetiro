const mysql =  require("../../../shared/db/mysql_driver");
const moment =  require('moment');
const fs =  require('fs-extra');
const Excel = require('exceljs');
const xlsx =  require('node-xlsx');
const unstream =  require('unstream');
const pfd = require('pdfkit');
const numerosALetras = require('../../../shared/modules/numerosLetras');
//var mysql = require('mysql');
module.exports = class Catalogos {
    Base(solicitud){
        return new Promise((resolve, reject)=>{
            return resolve({status: `ok`});
        })
    }
    Obtener_folio_venta(){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar(`SELECT IdVenta, Folio_venta FROM Ventas ORDER BY IdVenta desc LIMIT 1`).then((res)=>{
                return resolve({Data:res,Error:false});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Guardar_nuevo_ingreso(datos){
        return new Promise((resolve, reject)=>{
        //this.Obtener_folio_venta().then(fol=>{
            //console.log('fol',fol);
            //let idVen = (fol['Data'][0])?fol['Data'][0].IdVenta:0;
            //let folioVenta = `${datos.DatosVenta.Folio.split('-')[0]}-${idVen+1}`;
            let folioVenta = `${datos.DatosVenta.Folio.split('-')[0]}`;
            let auxiliar =  (datos.DatosVenta.Auxiliar)?datos.DatosVenta.Auxiliar:'-';
            let concepto =  (datos.DatosVenta.Auxiliar)?datos.DatosVenta.Auxiliar:'-';
            let today = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            let campos = `Folio_venta,IdCuenta,IdUsuario, IdCliente, IdTerreno, Concepto, Tipo_venta, Forma_pago, Cliente, Auxiliar, Importe, Fecha_venta`;
            let valores = `'${folioVenta}',${(datos.DatosVenta.IdCuenta)?datos.DatosVenta.IdCuenta:1} ,${datos.DatosUsuario.Datos.IdUsuario},${datos.DatosCliente.IdCliente},${datos.DatosTerreno.IdTerreno }, '${datos.DatosVenta.Concepto}', '${datos.DatosVenta.TipoVenta}','${datos.DatosVenta.FormaPago}','${datos.DatosCliente.Nombre}','${auxiliar}',${datos.DatosVenta.Total},'${today}'`;
            return mysql.ejecutar(`INSERT INTO Ventas (${campos}) VALUES (${valores});`).then((insertado)=>{
            return new Promise((resO, rejE)=>{
                let cambiosConceptos = [];
                datos.DatosVenta.ConceptosPagados.forEach(con=>{
                    cambiosConceptos.push(this._actualizacionesPortipoDeMovimiento(datos,con));
                });
                cambiosConceptos.reduce((Cam, current) => {
                    return Cam.then(results => {
                      return current.then(currentResult => {
                        return Promise.resolve({Procesado:true,Res:currentResult});
                      }).catch(e => {
                        return Promise.resolve({Procesado:false,Res:e});
                      })
                    })
                }, Promise.resolve([])).then(r => {
                    return resO(r);
                }).catch(err=>{console.log('err',err); return rejE(err);});
            });
        }).then((actualizadoCliente)=>{
            console.log('termino TODO');
            return resolve({Procesado: true, Operacion: 'La Venta se Guardo correctamente', Tipo: 'success', Cliente:datos});
        }).catch(err => { 
            console.log('err',err); return reject({Data: false, err })});
        });
    }
    _actualizacionesPortipoDeMovimiento(datos,concepto){
        return new Promise((resolve, reject)=>{
            switch(concepto.TipoMovimiento){
                case '01': return resolve(this._ventaAbono(datos,concepto)); break;
                case '02': return resolve(this._ventaEnganche(datos,concepto)); break;
                case '03': return resolve(this._ventaAnualidad(datos,concepto)); break;
                case '04': return resolve(this._ventaACapital(datos,concepto)); break;
                case '05': return resolve(this._ventaContratoAgua(datos,concepto)); break;
                case '06': return resolve(this._abonoLibreMantenimiento(datos,concepto)); break;
                case '07': return resolve(this._abonoCertificado(datos,concepto)); break;
                case '08': return resolve({Concepto:concepto, Procesado: true}); break;
                default: return reject({Error: `Problema con este concepto`});break;
            }
        });
    }
    _ventaAbono(datos,concepto){
        console.log('datos',datos);
        console.log('concepto',concepto);
        return new Promise((resolve, reject)=>{
            let restante = concepto.Mensualidad.Importe - concepto.Importe;
            let updateAdeudos = '';
            updateAdeudos += `Pendiente = ${restante}`; 
            if( restante == 0 || (restante >= 0 && restante < .9 ) ){ updateAdeudos += `, Pagado = 1 `; }
            //console.log('query', `Update Adeudos_clientes SET ${updateAdeudos} WHERE IdAdeudo = ${concepto.Mensualidad.IdAdeudo};`);
            console.log('query',`Update Adeudos_clientes SET ${updateAdeudos} WHERE IdAdeudo = ${concepto.Mensualidad.IdAdeudo};`);
            return mysql.ejecutar(`Update Adeudos_clientes SET ${updateAdeudos} WHERE IdAdeudo = ${concepto.Mensualidad.IdAdeudo};`).then((actualizadoAdeudos)=>{
                let restanteCredito =  datos.DatosCliente.Saldo_credito - concepto.Importe;
                let updateClientes = '';
                let saldo_a_favor = 0;
                if(restanteCredito > 0 ){
                    updateClientes += `Saldo_credito = ${restanteCredito}`;
                }else if(restanteCredito <= 0){
                    saldo_a_favor = Math.abs(restanteCredito);
                    updateClientes += `Saldo_credito = 0`;
                }
                saldo_a_favor += datos.DatosCliente.Saldo_a_favor;
                updateClientes += `, Saldo_a_favor = ${saldo_a_favor}`;
                datos.DatosCliente.Saldo_credito = restanteCredito;
                datos.DatosCliente.Saldo_adeudo = saldo_a_favor;
                //console.log('query', `Update Clientes SET ${updateClientes} WHERE IdCliente = ${datos.DatosCliente.IdCliente};`);
                return mysql.ejecutar(`Update Clientes SET ${updateClientes} WHERE IdCliente = ${datos.DatosCliente.IdCliente};`);

            }).then((actualizadoCliente)=>{
                return resolve({Concepto:concepto, Procesado: true});
            }).catch(err=>{ return reject({Concepto:concepto, Procesado: false}) });
        });
    }
    _ventaEnganche(datos,concepto){
        return new Promise((resolve, reject)=>{
            let restanteEnganche =  datos.DatosCliente.Saldo_adeudo - concepto.Importe;
            let updateClientes = '';
            let saldo_a_favor = 0;
            if(restanteEnganche > 0 ){
                updateClientes += `Saldo_adeudo = ${restanteEnganche}`;
            }else if(restanteEnganche <= 0){
                saldo_a_favor = Math.abs(restanteEnganche);
                updateClientes += `Saldo_adeudo = 0`;
            }
            saldo_a_favor += datos.DatosCliente.Saldo_a_favor;
            updateClientes += `, Saldo_a_favor = ${saldo_a_favor}`;
            //console.log('query', `Update Clientes SET ${updateClientes} WHERE IdCliente = ${datos.DatosCliente.IdCliente};`);
            return mysql.ejecutar(`Update Clientes SET ${updateClientes} WHERE IdCliente = ${datos.DatosCliente.IdCliente};`).then(res=>{
                return resolve({Concepto:concepto, Procesado: true});
            }).catch(err=>{ return reject({Concepto:concepto, Procesado: false}) });
        });
    }
    _ventaAnualidad(datos,concepto){
        return new Promise((resolve, reject)=>{
//            console.log('concepto',concepto);
            let restante = concepto.Anualidad.Importe - concepto.Importe;
            let updateAdeudos = '';
            updateAdeudos += `Pendiente = ${restante}`;
            if( restante == 0 || (restante >= 0 && restante < .9 ) ){ updateAdeudos += `, Pagado = 1 `; }
            return mysql.ejecutar(`Update Adeudos_anualidades SET ${updateAdeudos} WHERE IdAnualidad = ${concepto.Anualidad.IdAnualidad};`).then((actualizadoAnualidad)=>{
                let restanteAnualidad =  datos.DatosCliente.Saldo_anualidad - concepto.Importe;
                let updateClientes = '';
                let saldo_a_favor = 0;
                if(restanteAnualidad > 0 ){
                    updateClientes += `Saldo_anualidad = ${restanteAnualidad}`;
                }else if(restanteAnualidad <= 0){
                    saldo_a_favor = Math.abs(restanteAnualidad);
                    updateClientes += `Saldo_anualidad = 0`;
                }
                saldo_a_favor += datos.DatosCliente.Saldo_a_favor;
                updateClientes += `, Saldo_a_favor = ${saldo_a_favor}`;
                datos.DatosCliente.Saldo_anualidad = restanteAnualidad;
                //console.log('query', `Update Clientes SET ${updateClientes} WHERE IdCliente = ${datos.DatosCliente.IdCliente};`);
                return mysql.ejecutar(`Update Clientes SET ${updateClientes} WHERE IdCliente = ${datos.DatosCliente.IdCliente};`);
            }).then((actualizadoCliente)=>{
                return resolve({Concepto:concepto, Procesado: true});
            }).catch(err=>{ return reject({Concepto:concepto, Procesado: false}) });
        });
    }
    _abonoMantenimiento(){
        return new Promise((resolve, reject)=>{
            let restanteEnganche =  datos.DatosCliente.Saldo_adeudo - concepto.Importe;
            let updateClientes = '';
            let saldo_a_favor = 0;
            if(restanteEnganche > 0 ){
                updateClientes += `Saldo_adeudo = ${restanteEnganche}`;
            }else if(restanteEnganche <= 0){
                saldo_a_favor = Math.abs(restanteEnganche);
                updateClientes += `Saldo_adeudo = 0`;
            }
            saldo_a_favor += datos.DatosCliente.Saldo_a_favor;
            updateClientes += `, Saldo_a_favor = ${saldo_a_favor}`;
            //console.log('query', `Update Clientes SET ${updateClientes} WHERE IdCliente = ${datos.DatosCliente.IdCliente};`);
            return mysql.ejecutar(`Update Clientes SET ${updateClientes} WHERE IdCliente = ${datos.DatosCliente.IdCliente};`).then(res=>{
                return resolve({Concepto:concepto, Procesado: true});
            }).catch(err=>{ return reject({Concepto:concepto, Procesado: false}) });
        });        
    }
    _ventaACapital(datos,concepto){
        return new Promise((resolve, reject)=>{
            console.log('datos',datos);
            let restanteCredito =  datos.DatosCliente.Saldo_credito - concepto.Importe;
            let updateClientes = '';
            let saldo_a_favor = 0;
            if(restanteCredito > 0 ){
                updateClientes += `Saldo_credito = ${restanteCredito}`;
            }else if(restanteCredito <= 0){
                saldo_a_favor = Math.abs(restanteCredito);
                updateClientes += `Saldo_credito = 0`;
            }
            saldo_a_favor += datos.DatosCliente.Saldo_a_favor;
            updateClientes += `, Saldo_a_favor = ${saldo_a_favor}`;
            //console.log('query', `Update Clientes SET ${updateClientes} WHERE IdCliente = ${datos.DatosCliente.IdCliente};`);
            return mysql.ejecutar(`Update Clientes SET ${updateClientes} WHERE IdCliente = ${datos.DatosCliente.IdCliente};`).then(res=>{
                return mysql.ejecutar(`Update Cotizaciones SET Bloqueada = 1 WHERE IdCotizacion = ${datos.DatosTerreno.IdCotizacion};`);
            }).then(res=>{
                return mysql.ejecutar(`Update Clientes_terrenos SET Bloqueada = 1 WHERE IdCotizacion = ${datos.DatosTerreno.IdCotizacion} AND IdTerreno = ${datos.DatosTerreno.IdTerreno} AND IdCliente = ${datos.DatosTerreno.IdCliente};`);
            }).then(res=>{
                return resolve({Concepto:concepto, Procesado: true});
            }).catch(err=>{ return reject({Concepto:concepto, Procesado: false}) });
        });
    }
    _ventaContratoAgua(datos,concepto){
        return new Promise((resolve, reject)=>{
            let restanteAgua =  datos.DatosCliente.Saldo_agua - concepto.Importe;
            let updateClientes = '';
            let saldo_a_favor = 0;
            if(restanteAgua > 0 ){
                updateClientes += `Saldo_agua = ${restanteAgua}`;
            }else if(restanteAgua <= 0){
                saldo_a_favor = Math.abs(restanteAgua);
                updateClientes += `Saldo_agua = 0`;
            }
            saldo_a_favor += datos.DatosCliente.Saldo_a_favor;
            updateClientes += `, Saldo_a_favor = ${saldo_a_favor}`;
            //console.log('query', `Update Clientes SET ${updateClientes} WHERE IdCliente = ${datos.DatosCliente.IdCliente};`);
            return mysql.ejecutar(`Update Clientes SET ${updateClientes} WHERE IdCliente = ${datos.DatosCliente.IdCliente};`).then(res=>{
                return resolve({Concepto:concepto, Procesado: true});
            }).catch(err=>{ return reject({Concepto:concepto, Procesado: false}) });
        });
    }
    _abonoCertificado(datos,concepto){
        return new Promise((resolve, reject)=>{
            let restanteCertificado =  datos.DatosCliente.Saldo_certificado - concepto.Importe;
            let updateClientes = '';
            let saldo_a_favor = 0;
            if(restanteCertificado > 0 ){
                updateClientes += `Saldo_certificado = ${restanteCertificado}`;
            }else if(restanteCertificado <= 0){
                saldo_a_favor = Math.abs(restanteCertificado);
                updateClientes += `Saldo_certificado = 0`;
            }
            saldo_a_favor += datos.DatosCliente.Saldo_a_favor;
            updateClientes += `, Saldo_a_favor = ${saldo_a_favor}`;
            return mysql.ejecutar(`UPDATE Clientes SET ${updateClientes} WHERE IdCliente = ${datos.DatosCliente.IdCliente};`).then(res=>{
                return resolve({Concepto:concepto, Procesado: true});
            }).catch(err=>{ return reject({Concepto:concepto, Procesado: false}) });
        });
    }
    _abonoLibre(datos, concepto){
        //console.log(datos.DatosVenta.ConceptosPagados);
        return new Promise((resolve, reject)=>{
            let saldo_a_favor =  datos.DatosCliente.Saldo_a_favor + concepto.Importe;
            let updateClientes = '';
            this.Obtener_mensualidades(datos.DatosCliente.IdCliente).then(mm=>{
                return new Promise((resO, rejE)=>{
                    let datosMens =  mm['Data'].filter(ob => ob.IdTerreno == datos.DatosTerreno.IdTerreno);
                    let mens =  datosMens.filter(ob=> ob.Pagado != 1);
                    let conceptosPagados = [];
                    for(let i= 0; i<= mens.length;i++){
                        if(saldo_a_favor){
                            let saldo_restante = saldo_a_favor - mens[i].Importe;
                            if(saldo_restante >= 0){
                                conceptosPagados.push({Concepto: `Mensualidad correspondiente al ${mens[i].Fecha}`, Importe: mens[i].Importe ,TipoMovimiento: '01', Mensualidad:mens[i]});
                                saldo_a_favor = saldo_restante;
                            }else if(saldo_restante < 0){
                                conceptosPagados.push({Concepto: `Mensualidad correspondiente al ${mens[i].Fecha}`, Importe: saldo_a_favor ,TipoMovimiento: '01', Mensualidad:mens[i]});
                                saldo_a_favor = 0;
                                break;
                            }else{
                                break;
                            }
                        }
                    }
                        let variosPagos =  [];
                        conceptosPagados.forEach(con=>{
                            variosPagos.push(this._actualizacionesPortipoDeMovimiento(datos,con));
                        });
                        variosPagos.reduce((VP, current) => {
                            return VP.then(results => {
                              return current.then(currentResult => {
                                return Promise.resolve({Procesado:true,Res:currentResult});
                              }).catch(e => {
                                return Promise.resolve({Procesado:false,Res:e});
                              })
                            })
                        }, Promise.resolve([])).then(r => {
                            return resO(r);
                        }).catch(err=>{ console.log('error',err); rejE(err);})
                });
            }).then((actualizadoCliente)=>{
                return resolve({Concepto:concepto, Procesado: true});
            }).catch(err=>{ return reject({Concepto:concepto, Procesado: false}) });
        });
    }
    Obtener_folio_mantenimiento(){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar(`SELECT IdMantenimiento, Folio_mantenimiento FROM Mantenimientos ORDER BY IdMantenimiento desc LIMIT 1`).then((res)=>{
                return resolve({Data:res,Error:false});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Guardar_nuevo_mantenimiento(datos){
        return new Promise((resolve, reject)=>{
        //this.Obtener_folio_mantenimiento().then(fol=>{
            //let idMan = (fol['Data'][0])?fol['Data'][0].IdMantenimiento:0;
            //let Folio_mantenimiento = `${datos.DatosMantenimiento.Folio.split('-')[0]}-${idMan+1}`;
            let Folio_mantenimiento = `${datos.DatosMantenimiento.Folio.split('-')[0]}`;
            let auxiliar =  (datos.DatosMantenimiento.Auxiliar)?datos.DatosMantenimiento.Auxiliar:'-';
            let concepto =  (datos.DatosMantenimiento.Contepto)?datos.DatosMantenimiento.Auxiliar:'-';
            let today = moment(new Date()).format('YYYY-MM-DD HH:mm:ss'); 
            let campos = `Folio_mantenimiento,IdCuenta , IdUsuario, IdCliente, IdTerreno, Concepto, Tipo_mantenimiento, Forma_pago, Cliente, Auxiliar, Importe, Fecha_mantenimiento`;
            let valores = `'${Folio_mantenimiento}',${(datos.DatosMantenimiento.IdCuenta)?datos.DatosMantenimiento.IdCuenta:1} ,${datos.DatosUsuario.Datos.IdUsuario},${datos.DatosCliente.IdCliente}, ${datos.DatosTerreno.IdTerreno}, '${datos.DatosMantenimiento.Concepto}', '${datos.DatosMantenimiento.TipoMantenimiento}','${datos.DatosMantenimiento.FormaPago}', '${datos.DatosCliente.Nombre}','${auxiliar}',${datos.DatosMantenimiento.Total},'${today}'`;
            return mysql.ejecutar(`INSERT INTO Mantenimientos (${campos}) VALUES (${valores});`).then((insertado)=>{
            return new Promise((resO, rejE)=>{
                let cambiosConceptos = [];
                datos.DatosMantenimiento.ConceptosPagados.forEach(con=>{
                    cambiosConceptos.push(this._actualizacionesPorTipoMantenimiento(datos,con).then(result=>{
                        //console.log('result',result);
                        return {Concepto: con, Resuelto: true};
                    }).catch(err=>{
                        return {Concepto: con, Resuelto: false};
                    }));
                });
                Promise.all(cambiosConceptos).then(resultados=>{
                    return resO(resultados);
                }).catch(err=>{
                    return rejE(err);
                })
            });
        }).then((actualizadoCliente)=>{
            return resolve({Procesado: true, Operacion: 'El Mantenimiento se Guardo correctamente', Tipo: 'success', Cliente:datos});
        }).catch(err => { 
            console.log('err',err); return reject({Data: false, err })});
        });
    }
    _actualizacionesPorTipoMantenimiento(datos,concepto){
        return new Promise((resolve, reject)=>{
            switch(concepto.TipoMovimiento){
                case '01': return resolve(this._abonoMantenimiento(datos,concepto)); break;
                case '02': return resolve(this._abonoLibreMantenimiento(datos,concepto)); break;
                default: return reject({Error: `Problema con este concepto`});break;
            }
        });
    }
    _abonoMantenimiento(datos,concepto){
        return new Promise((resolve, reject)=>{
            let restante = concepto.Mantenimiento.Importe - concepto.Importe;
            let updateAdeudos = '';
            updateAdeudos += `Pendiente = ${restante}`;
            if( restante == 0 || (restante >= 0 && restante < .9 ) ){ updateAdeudos += `, Pagado = 1 `; }
            return mysql.ejecutar(`Update Adeudos_mantenimientos SET ${updateAdeudos} WHERE IdAdeudoMantenimiento = ${concepto.Mantenimiento.IdAdeudoMantenimiento};`).then((actualizadoMantenimientos)=>{
                let restanteMantenimiento =  datos.DatosCliente.Saldo_mantenimiento - concepto.Importe;
                let updateClientes = '';
                let saldo_a_favor = 0;
                if(restanteMantenimiento > 0 ){
                    updateClientes += `Saldo_mantenimiento = ${restanteMantenimiento}`;
                }else if(restanteMantenimiento <= 0){
                    saldo_a_favor =  Math.abs(restanteMantenimiento);
                    updateClientes += `Saldo_mantenimiento = 0`;
                }
                saldo_a_favor += datos.DatosCliente.Saldo_a_favor;
                updateClientes += `, Saldo_a_favor = ${saldo_a_favor}`;
                datos.DatosCliente.Saldo_mantenimiento = restanteMantenimiento;
                //console.log('query', `Update Clientes SET ${updateClientes} WHERE IdCliente = ${datos.DatosCliente.IdCliente};`);
                return mysql.ejecutar(`Update Clientes SET ${updateClientes} WHERE IdCliente = ${datos.DatosCliente.IdCliente};`);
            }).then((actualizadoCliente)=>{
                return resolve({Concepto:concepto, Procesado: true});
            }).catch(err=>{ return reject({Concepto:concepto, Procesado: false}) });
        });
    }
    _abonoLibreMantenimiento(datos,concepto){
        return new Promise((resolve, reject)=>{
            let saldo_a_favor =  datos.DatosCliente.Saldo_a_favor + concepto.Importe;
            let updateClientes = '';
            this.Obtener_mantenimientos(datos.DatosCliente.IdCliente).then(mm=>{
                return new Promise((resO, rejE)=>{
                    let datosMens =  mm['Data'];
                    let mens =  datosMens.filter(ob=> ob.Pagado != 1);
                    let conceptosPagados = [];
                    if(mens[0]){
                        for(let i= 0; i<= mens.length;i++){
                            //console.log('saldo',saldo_a_favor);
                            if(saldo_a_favor){
                                let saldo_restante = saldo_a_favor - mens[i].Importe;
                                //console.log('saldo a favor antes',saldo_a_favor);
                                if(saldo_restante >= 0){
                                    conceptosPagados.push({Concepto: `${concepto.Concepto}`, Importe: mens[i].Importe ,TipoMovimiento: '01', Mantenimiento:mens[i]});
                                    saldo_a_favor = saldo_restante;
                                    //console.log('saldo a favor despues',saldo_a_favor);
                                }else if(saldo_restante < 0){
                                    conceptosPagados.push({Concepto: `Mantenimiento correspondiente al ${mens[i].Fecha}`, Importe: saldo_a_favor ,TipoMovimiento: '01', Mantenimiento:mens[i]});
                                    saldo_a_favor = 0;
                                    //console.log('saldo a favor despues',saldo_a_favor);
                                    break;
                                }else{
                                    break;
                                }
                                if(saldo_a_favor > 0){
                                    saldo_a_favor += datos.DatosCliente.Saldo_a_favor;
                                }
                            }
                        }
                    }
                    if(conceptosPagados[0]){
                        let variosPagos =  [];
                        conceptosPagados.forEach(con=>{
                            variosPagos.push(this._actualizacionesPorTipoMantenimiento(datos,con).then(result=>{
                                console.log('result',result);
                                return {Concepto: con, Resuelto: true};
                            }).catch(err=>{
                                return {Concepto: con, Resuelto: false};
                            }));
                        });
                        Promise.all(variosPagos).then(resultados=>{
                            console.log('resultados procesados ',resultados);
                            return resO(resultados);
                        }).catch(err=>{
                            return rejE(err);
                        })
                    }else{
                        let updateClientes = `Saldo_a_favor = ${saldo_a_favor}`;
                        console.log('update',`Update Clientes SET ${updateClientes} WHERE IdCliente = ${datos.DatosCliente.IdCliente};`);
                        return mysql.ejecutar(`Update Clientes SET ${updateClientes} WHERE IdCliente = ${datos.DatosCliente.IdCliente};`).then(res=>{
                            return resolve(res);
                        }).catch(err=>{return reject({Error:err});})
                    }

                });
            }).then((actualizadoCliente)=>{
                return resolve({Concepto:concepto, Procesado: true});
            }).catch(err=>{ console.log('er',err); return reject({Concepto:concepto, Procesado: false}) });
        });
    }
    Borrar_ingreso(Id){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar(`DELETE FROM Ventas WHERE IdVenta= ${Id};`).then((res)=>{
                return resolve({Eliminado: true});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Guardar_nuevo_cliente(datos){
        var mysql = require('mysql');
        var conexion = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : 'Sakaunperikin24*',
            database : 'ElRetiro',
            acquireTimeout: 100000000000000000
          });
        conexion.connect();
        return new Promise((resolve, reject)=>{
            this._verificarUsuario(conexion,datos).then(cliente =>{
                if(cliente){
                    return this.Editar_cliente(conexion, datos, cliente);
                }else{
//                    console.log('cliente',cliente);
                    return this.Insertar_cliente(conexion,datos);
                }
            }).then(res =>{
                conexion.end();
              return resolve({Data:res, Error:0});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }

    Insertar_cliente(conexion, datos){
        console.log('datos cliente insert',datos);
        return new Promise((resolve, reject)=>{
            let today = moment().format('YYYY-MM-DD HH:mm:ss');
                let numCliente = ``;
                datos.Codigo = `CLI${numCliente}`;
                return  this._archivosCliente(datos,{}).then(archivos=>{
                let idIfe = (archivos.IdIfe)?archivos.IdIfe:0;
                let idComprobante = (archivos.IdComprobante)?archivos.IdComprobante:0;
                datos.Importe_mantenimiento = (datos.Importe_mantenimiento)?datos.Importe_mantenimiento:0
                datos.Periodo_cobro = (datos.Periodo_cobro)?datos.Periodo_cobro:0
                datos.Fecha_nacimiento = (datos.Fecha_nacimiento && datos.Fecha_nacimiento != '-')?datos.Fecha_nacimiento:`${moment().format('YYYY-MM-DD')}`;
                let campos =  `IdArchivo_ife, IdArchivo_comprobante, Codigo, Nombre, Correo, Telefono, Direccion, Saldo_agua, Saldo_anualidad, Saldo_adeudo, Saldo_credito,Saldo_certificado ,Saldo_mantenimiento, Credito_original, Num_ife, Origen, Referencia_1, Referencia_2, Referencia_3, Fecha_nacimiento, Fecha_insercion, Ultimo_movimiento, Activo,TelRef_1,TelRef_2,TelRef_3,Fecha_primer_mantenimiento,Periodo_mantenimiento,Monto_mantenimiento, Observaciones`;
                let valores = `${idIfe},${idComprobante},'${datos.Codigo}','${datos.Nombre}','${datos.Correo}','${datos.Telefono}','${datos.Direccion}',${(datos.Saldo_agua)?datos.Saldo_agua:0},${(datos.Saldo_anualidad)?datos.Saldo_anualidad:0},${(datos.Saldo_adeudo)?datos.Saldo_adeudo:0},${(datos.Saldo_credito)?datos.Saldo_credito:0},${(datos.Saldo_certificado)?datos.Saldo_certificado:0} ,${(datos.Saldo_mantenimiento)?datos.Saldo_mantenimiento:0},${(datos.Credito_original)?datos.Credito_original:0},'${datos.NumIfe}', '${datos.Origen}','${datos.Ref1}','${datos.Ref2}','${datos.Ref3}','${datos.Fecha_nacimiento}', '${today}','${today}',1, '${(datos.TelRef_1)?datos.TelRef_1:0}','${(datos.TelRef_2)?datos.TelRef_2:0}','${(datos.TelRef_3)?datos.TelRef_3:0}','${moment( (datos.Fecha_mantenimiento)?datos.Fecha_mantenimiento:new Date()).format('YYYY-MM-DD')}',${datos.Periodo_cobro},${datos.Importe_mantenimiento}, '${(datos.Observaciones)?datos.Observaciones:''}'`;
                return this._ordenarQuery(conexion,`INSERT INTO Clientes (${campos}) VALUES (${valores});`);
                //GUARDA REGISTRO DEL CLIENTE
            }).then((res)=>{
                let condiciones =  `Nombre = '${datos.Nombre}' AND Codigo = '${datos.Codigo}' `;
                //console.log('query',`SELECT * FROM Clientes WHERE ${condiciones} LIMIT 1;`);
                return this._ordenarQuery(conexion,`SELECT * FROM Clientes WHERE ${condiciones} LIMIT 1;`);
                //OBTIENE LOS DATOS COMPLETOS DEL CLIENTE
            }).then(cliente=>{
                datos.ClienteCompleto = cliente[0];
                datos.ClienteCompleto.Codigo += `${datos.ClienteCompleto.IdCliente}`;
                //console.log('datos',datos);
                return this._guardarRelacionesTerrenos(conexion,datos);
                //GUARDA LA RELACION CON LOS TERRENOS
            }).then(relacionesGuardadas =>{
                return new Promise((resO, rejE)=>{
                    let cotizacionesGuardadas = [];
                    datos.Terrenos.forEach(dat=>{
                        if(!dat.ContieneMensualidad && dat.Estado != 'CEDIDO' && dat.Estado != 'POR CEDER'){
                            dat.Cotizacion = (datos.FuenteDatos)?this._modificarMensualidades(dat.Cotizacion):dat.Cotizacion;
                            cotizacionesGuardadas.push(Promise.resolve({}));
                        }else{
                            cotizacionesGuardadas.push(this._guardarAdeudosCliente(conexion,datos,dat));
                        }
                    });
                    Promise.all(cotizacionesGuardadas).then(resultados=>{
                        return resO(resultados);
                    }).catch(err=>{
                        return rejE(err);
                    })
                });
                //GUARDA LAS COTIZACIONES EN MENUSUALIDADES
            }).then(terminaCotizacion =>{
                return new Promise((resO, rejE)=>{
                    let anualidadesGuardadas = [];
                    datos.Terrenos.forEach(dat=>{
                        if(!dat.ContieneAnualidad &&  dat.Estado != 'CEDIDO' && dat.Estado != 'POR CEDER'){
                            anualidadesGuardadas.push(Promise.resolve({}));
                        }else{
                            anualidadesGuardadas.push(this._guardarAnualidadesCliente(conexion,datos,dat));
                        }
                    });
                    Promise.all(anualidadesGuardadas).then(resultados=>{
                        return resO(resultados);
                    }).catch(err=>{
                        return rejE(err);
                    })
                });
                //console.log('cotizaciones',terminaCotizacion);

                //return this._guardarMantenimientoBasico(conexion,datos);
                //GUARDA EL PRIMER MANTENIMIENTO BASICOS
            }).then(terminaCotizacion =>{
                if(datos.Mantenimientos_calculados){
                    return this._guardarMantenimientosCalculados(conexion,datos);
                }else{
                    return Promise.resolve({});
                    //return this._guardarMantenimientoBasico(conexion,datos);
                }
            }).then(terminaAnualidad =>{
                if(datos.FuenteDatos){
                    return this._actualizarDatosTodosOrigen(conexion,datos);
                }else{
                    return Promise.resolve({});
                }
            }).then(terminaTodo=>{
                //conexion.end();
                //console.log('mantenimientos',terminaMantenimiento);
                return resolve({Procesado: true, Operacion: 'El cliente fue guardado correctamente', Tipo: 'success', Cliente:datos});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    _modificarCotizacon(dat){
        dat[0].Enganche = dat[0].Enganche_Actual;
        dat[0].Num_pagos = dat[0].Num_pagos_Actual;
        dat[0].Num_anualidades = dat[0].Num_pagos_anualidad_Actual;
        return dat;
    }
    _modificarMensualidades(dat){
        dat[0].Enganche = (dat[0].Enganche - dat[0].EnganchePagado);
        dat[0].Num_pagos = (dat[0].Num_pagos - dat[0].Num_pagos_pagados);
        dat[0].Num_anualidades = (dat[0].Num_anualidades - dat[0].Num_anualidades_pagadas);
        dat[0].Fecha_inicio = moment().add('30','days').format('YYYY-MM-DD');
        dat[0].Fecha_inicio_anualidad = `${moment().format('YYYY')}-12-01`;

        return dat;
    }
    _actualizarDatosTodosOrigen(conexion,datos){
        return new Promise((resolve, reject)=>{
            let today = moment().format('YYYY-MM-DD HH:mm:ss');
            let str = ``;
            datos.ObjCompletos.forEach(d=>{
                str += `${d.Id},`;
            });
            str = (str.indexOf(',') > -1 )?str.slice(0,-1):str;
            console.log('QUERY SUPER INSERT 3',`UPDATE Datos_todos SET ACTIVO = 0 WHERE Id = (${str});`);
            this._ordenarQuery(conexion,`UPDATE Datos_todos SET ACTIVO = 0 WHERE Id IN (${str});`).then((res)=>{
                return resolve({});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    _crearDirectorioCliente(datos){
        let path = `./shared/uploads/${datos.Nombre}`;
        (!fs.existsSync(path))?fs.mkdirpSync(path):'';
    }
    _guardarAnualidadesCliente(conexion,datos,datosTerreno){
        return new Promise((resolve, reject)=>{
            let Terreno =  datosTerreno;
            let Cotizacion =  datosTerreno.Cotizacion;
            let insert_anualidades = [];
            // console.log('anualidades',Cotizacion[0].Anualidades);
            if(Cotizacion[0].Anualidades){
                Cotizacion[0].Anualidades.Datos.forEach(m=>{
                    let campos = `IdCliente,IdTerreno,Num_pago,Importe,Fecha,Fecha_modificacion,Pagado`;
                    let valores =  `${datos.ClienteCompleto.IdCliente},${Terreno.IdTerreno},${m.Pago},${m.Total},'${m.Fecha}','${moment().format('YYYY-MM-DD HH:mm:ss')}',${(m.Pagado)?1:0} `;
                    // console.log('query',`INSERT INTO Adeudos_anualidades (${campos}) VALUES (${valores});`);
                    insert_anualidades.push(this._ordenarQuery(conexion,`INSERT INTO Adeudos_anualidades (${campos}) VALUES (${valores});`));
                });
            }else if(!Cotizacion[0].Anualidades && Cotizacion[0].Num_pagos > 1){            
                for(let i = 1; i <= Cotizacion[0].Num_anualidades; i++){
                    let campos = `IdCliente,IdTerreno,Num_pago,Importe,Fecha,Fecha_modificacion`;
                    let fecha_anualidad = (i==1)?moment(Cotizacion[0].Fecha_inicio_anualidad).format('YYYY-MM-DD'):moment(Cotizacion[0].Fecha_inicio_anualidad).add(i ,'Y').format('YYYY-MM-DD');
                    let modificacion =  moment().format('YYYY-MM-DD HH:mm:ss');
                    let valores =  `${datos.ClienteCompleto.IdCliente},${Terreno.IdTerreno},${i},${Cotizacion[0].Anualidad},'${fecha_anualidad}','${modificacion}' `;
                    insert_anualidades.push(this._ordenarQuery(conexion,`INSERT INTO Adeudos_anualidades (${campos}) VALUES (${valores});`));
                }
            }else{
                insert_anualidades.push(Promise.resolve({}));
            }
            insert_anualidades.reduce((IA, current) => {
                return IA.then(results => {
                  return current.then(currentResult => {
                    return Promise.resolve({Procesado:true,Res:currentResult});
                  }).catch(e => {
                    return Promise.resolve({Procesado:false,Res:e});
                  })
                })
              }, Promise.resolve([])).then(r => {
                  console.log('resolve',r);
                  return resolve(r);
                }).catch(err=>{ console.log('error',err); reject(err);})
        });
    }
    _guardarMantenimientosCalculados(conexion,datos){
        return new Promise((resolve, reject)=>{
            console.log('datos man nuevos ',datos);
            let today = moment().format('YYYY-MM-DD HH:mm:ss');
            let mantenimientosGuardados = [];
            this._ordenarQuery(conexion,`DELETE FROM Adeudos_mantenimientos WHERE IdCliente = ${datos.ClienteCompleto.IdCliente};`).then(res=>{
                datos.Mantenimientos_calculados.forEach(man=>{
                    let campos_mantenimiento = `IdCliente, Concepto, Importe, Fecha, Fecha_modificacion`;//datos.Fecha_mantenimiento
                    let valores_mantenimiento = `${datos.ClienteCompleto.IdCliente},'Mantenimiento - ${man['Fecha Mantenimiento']}',${man['Monto Mantenimiento']},'${man['Fecha Mantenimiento']}','${today}'`;
                    mantenimientosGuardados.push( this._ordenarQuery(conexion,`INSERT INTO Adeudos_mantenimientos (${campos_mantenimiento}) VALUES (${valores_mantenimiento});`));
                })
                mantenimientosGuardados.reduce((Mans, current) => {
                    return Mans.then(results => {
                      return current.then(currentResult => {
                        return Promise.resolve({Procesado:true,Res:currentResult});
                      }).catch(e => {
                        return Promise.resolve({Procesado:false,Res:e});
                      })
                    })
                  }, Promise.resolve([])).then(r => {
                      console.log('Resultado', r);
                      return resolve(r);
                    }).catch(err=>{ console.log('error',err); reject(err);})  
            });
        });
    }
    _guardarMantenimientoBasico(conexion,datos){
        return new Promise((resolve, reject)=>{
            let today = moment().format('YYYY-MM-DD HH:mm:ss');
            let diferencia_meses =  moment().diff(moment(datos.Fecha_mantenimiento), 'months');
            console.log('diferencias',diferencia_meses);
            let fechas_mantenimientos = [];
            if(diferencia_meses >= datos.Periodo_cobro){
                let fechas_pendientes = Math.floor(diferencia_meses/datos.Periodo_cobro);
                for( let s=0;s<=fechas_pendientes;s++){
                    fechas_mantenimientos.push({Fecha:(s==0)?datos.Fecha_mantenimiento:moment(datos.Fecha_mantenimiento).add(s,'month').format('YYYY-MM-DD')});
                }
            }else{
                fechas_mantenimientos.push({Fecha:moment(datos.Fecha_mantenimiento).format('YYYY-MM-DD')});
            }
            let mantenimientosGuardados = [];
            let saldo_man = datos.ClienteCompleto.Saldo_mantenimiento;
            fechas_mantenimientos.forEach(ff=>{
                saldo_man += datos.Importe_mantenimiento;
                let campos_mantenimiento = `IdCliente, Concepto, Importe, Fecha, Fecha_modificacion`;//datos.Fecha_mantenimiento
                let valores_mantenimiento = `${datos.ClienteCompleto.IdCliente},'Mantenimiento - ${ff.Fecha}',${datos.Importe_mantenimiento},'${ff.Fecha}','${today}'`;
                mantenimientosGuardados.push( this._ordenarQuery(conexion,`INSERT INTO Adeudos_mantenimientos (${campos_mantenimiento}) VALUES (${valores_mantenimiento});`));
            })
            mantenimientosGuardados.push(this._ordenarQuery(conexion,`UPDATE Clientes SET Saldo_mantenimiento = ${saldo_man} WHERE IdCliente = ${datos.ClienteCompleto.IdCliente};`));
            mantenimientosGuardados.reduce((Mans, current) => {
                return Mans.then(results => {
                  return current.then(currentResult => {
                    return Promise.resolve({Procesado:true,Res:currentResult});
                  }).catch(e => {
                    return Promise.resolve({Procesado:false,Res:e});
                  })
                })
              }, Promise.resolve([])).then(r => {
                  console.log('Resultado', r);
                  return resolve(r);
                }).catch(err=>{ console.log('error',err); reject(err);})
        });
    }
    _guardarRelacionesTerrenos(conexion,datos){
        let today = moment().format('YYYY-MM-DD HH:mm:ss');
        return new Promise((resolve, reject)=>{
            let terrenosGuardados = [];
            console.log('datos',datos);
            datos.Terrenos.forEach(ter=>{
                let campos_terreno = `IdCliente, IdUsuario, IdTerreno, IdCotizacion,Fecha_insercion,Folio,Quien_guardo`;
                let valores_terreno = `${datos.ClienteCompleto.IdCliente},${datos.Usuario.Datos.IdUsuario},${ter.IdTerreno},${(ter.IdCotizacion)?ter.IdCotizacion:0}, '${today}',${(ter.Folio)?ter.Folio:0},'${datos.Usuario.Datos.Nombre}'`;
                let auxUp = (ter.Estado)?` ,Estado='${ter.Estado}' `:'  ';
                auxUp += (ter.Pertenece)?` ,Pertenece='${ter.Pertenece}' `:``;
                let updateTerrenos = `Update Terrenos Set Asignado = 1 ${auxUp} WHERE IdTerreno = ${ter.IdTerreno}`;
                //console.log('rela',`INSERT INTO Clientes_terrenos (${campos_terreno}) VALUES (${valores_terreno});`);
                terrenosGuardados.push(this._ordenarQuery(conexion,`INSERT INTO Clientes_terrenos (${campos_terreno}) VALUES (${valores_terreno});`));
                terrenosGuardados.push(this._ordenarQuery(conexion,updateTerrenos));
                terrenosGuardados.push(this._ordenarQuery(conexion,` UPDATE Datos_todos SET ACTIVO = 0 WHERE PARCELA = '${ter.parcela}'; `));
            })
            terrenosGuardados.reduce((Terr, current) => {
                return Terr.then(results => {
                  return current.then(currentResult => {
                    return Promise.resolve({Procesado:true,Res:currentResult});
                    }).catch(e => {
                    return Promise.resolve({Procesado:false,Res:e});
                  })
                })
              }, Promise.resolve([])).then(r => {
                  return resolve(r);
                }).catch(err=>{ console.log('error',err); reject(err);});
        });
    }
    _guardarAdeudosCliente(conexion,datos,datosTerreno){
        return new Promise((resolve, reject)=>{
            let Terreno =  datosTerreno;
            let Cotizacion =  datosTerreno.Cotizacion;
            let insert_cotizaciones = [];
            // console.log('datosTerreno.Cotizacion',datosTerreno.Cotizacion);
            if(Cotizacion[0].Mensualidades){
                Cotizacion[0].Mensualidades.Datos.forEach(m=>{
                    let campos = `IdCliente,IdTerreno,Num_pago,Importe,Fecha,Fecha_modificacion,Pagado`;
                    let valores =  `${datos.ClienteCompleto.IdCliente},${Terreno.IdTerreno},${m.Pago},${m.Total},'${m.Fecha}','${moment().format('YYYY-MM-DD HH:mm:ss')}',${(m.Pagado)?1:0} `;
                    // console.log('query',`INSERT INTO Adeudos_clientes (${campos}) VALUES (${valores});`);
                    insert_cotizaciones.push(this._ordenarQuery(conexion,`INSERT INTO Adeudos_clientes (${campos}) VALUES (${valores});`));
                });

            }else if(!Cotizacion[0].Mensualidades && Cotizacion[0].Num_pagos > 1){
                for(let i = 1; i <= Cotizacion[0].Num_pagos; i++){
                    let campos = `IdCliente,IdTerreno,Num_pago,Importe,Fecha,Fecha_modificacion`;
                    let fecha_mensualidad =  (i==1)?moment(Cotizacion[0].Fecha_inicio).format('YYYY-MM-DD'):moment(Cotizacion[0].Fecha_inicio).add(i ,'M').format('YYYY-MM-DD');
                    let modificacion =  moment().format('YYYY-MM-DD HH:mm:ss');
                    let valores =  `${datos.ClienteCompleto.IdCliente},${Terreno.IdTerreno},${i},${Cotizacion[0].Mensualidad},'${fecha_mensualidad}','${modificacion}' `;
                    console.log('valors',`INSERT INTO Adeudos_clientes (${campos}) VALUES (${valores});`);
                    insert_cotizaciones.push(this._ordenarQuery(conexion,`INSERT INTO Adeudos_clientes (${campos}) VALUES (${valores});`));
                }
            }else{
                insert_cotizaciones.push(Promise.resolve({}));
            }
            insert_cotizaciones.reduce((IC, current) => {
                return IC.then(results => {
                  return current.then(currentResult => {
                    return Promise.resolve({Procesado:true,Res:currentResult});
                  }).catch(e => {
                    return Promise.resolve({Procesado:false,Res:e});
                  })
                })
              }, Promise.resolve([])).then(r => {
                  return resolve(r);
                }).catch(err=>{ console.log('error',err); reject(err);})
        });
    }
    _archivosCliente(datos, archivos){
        return new Promise((resolve, reject)=>{
            if(datos.Comprobante && datos.FotoIfe){
                let compExt = `${datos.Comprobante.split(',')[0].split(';')[0].split('/')[1]}`;
                let compCont = new Buffer(datos.Comprobante.split(',')[1], "base64");
                let compPath = `./shared/uploads/${datos.Nombre}/`;
                let compNombre =  `Domicilio_${datos.Nombre}.${compExt}`;
                this._subirArchivo(compPath,compNombre,compCont,2097152).then(res=>{
                    archivos.IdComprobante = (res && !res.err)?res:0;
                    let ifeExt = `${datos.FotoIfe.split(',')[0].split(';')[0].split('/')[1]}`;
                    let ifeCont = new Buffer(datos.FotoIfe.split(',')[1], "base64");
                    let ifePath = `./shared/uploads/${datos.Nombre}/`;
                    let ifeNombre =  `Ife_${datos.Nombre}.${ifeExt}`;
                    return this._subirArchivo(ifePath,ifeNombre,ifeCont,2097152);
                }).then(result=>{
                    //console.log('res',result);
                    archivos.IdIfe = (result && !result.err)?result:0;
                    return resolve(archivos);
                }).catch(err=>{console.log('err',err); return resolve({Error:err}) });
            }else{
                let pa = `./shared/uploads/${datos.Nombre}/`;
                (!fs.existsSync(pa))?fs.mkdirpSync(pa):'';
                return resolve({Error:'Sin Comprobantes'});
            }

        });
    }
    Editar_cliente(conexion,datos,Cliente){
        console.log('datos',datos);
        return new Promise((resolve, reject)=>{
//            console.log('datos ACTUALI',datos);
//            console.log('datos ACTUALI',Cliente);
            let today = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            datos.Fecha_nacimiento = (datos.Fecha_nacimiento && datos.Fecha_nacimiento != '-')?datos.Fecha_nacimiento:`${moment().format('YYYY-MM-DD')}`;
            let valores = `Nombre = '${datos.Nombre}'`;
            valores += `,Correo = '${datos.Correo}'`;
            valores += (datos.Direccion)?`,Direccion = '${datos.Direccion}'`:'';
            valores += (datos.Telefono)?`,Telefono = '${datos.Telefono}'`:'';
            valores += (datos.NumIfe)?`,Num_ife = '${datos.NumIfe}'`:'';
            valores += (datos.Origen)?`,Origen = '${datos.Origen}'`:'';
            valores += (datos.Ref1)?`,Referencia_1 = '${datos.Ref1}'`:'';
            valores += (datos.Ref2)?`,Referencia_2 = '${datos.Ref2}'`:'';
            valores += (datos.Ref3)?`,Referencia_3 = '${datos.Ref3}'`:'';
            valores += (datos.TelRef_1)?`,TelRef_1 = '${datos.TelRef_1}'`:'';
            valores += (datos.TelRef_2)?`,TelRef_2 = '${datos.TelRef_2}'`:'';
            valores += (datos.TelRef_3)?`,TelRef_3 = '${datos.TelRef_3}'`:'';
            valores += (datos.Fecha_nacimiento)?`,Fecha_nacimiento = '${datos.Fecha_nacimiento}'`:'';
            valores += (datos.Importe_mantenimiento || datos.Importe_mantenimiento == 0)?`,Monto_mantenimiento = ${datos.Importe_mantenimiento}`:'';
            valores += (datos.Saldo_mantenimiento || datos.Saldo_mantenimiento == 0)?`,Saldo_mantenimiento = ${datos.Saldo_mantenimiento}`:'';
            valores += (datos.Saldo_adeudo)?`,Saldo_adeudo = ${datos.Saldo_adeudo}`:'';
            valores += (datos.Saldo_anualidad)?`,Saldo_anualidad = ${datos.Saldo_anualidad}`:'';
            valores += (datos.Credito_original)?`,Credito_original = ${datos.Credito_original}`:'';
            valores += (datos.Saldo_agua)?`,Saldo_agua = ${datos.Saldo_agua}`:'';
            valores += (datos.Saldo_certificado)?`,Saldo_certificado = ${datos.Saldo_certificado}`:'';
            valores += (datos.Periodo_cobro || datos.Periodo_cobro == 0)?`,Periodo_mantenimiento = ${datos.Periodo_cobro} `:'';
            valores += (datos.Fecha_mantenimiento)?`,Fecha_primer_mantenimiento = '${datos.Fecha_mantenimiento}'`:'';
//            valores += (datos.)`,Correo = '${datos.Correo}'`;
            this._ordenarQuery(conexion,`UPDATE Clientes SET ${valores} WHERE IdCliente = ${Cliente[0].IdCliente};`).then((res)=>{
            //mysql.ejecutar(`UPDATE Clientes SET ${valores} WHERE IdCliente = ${Cliente[0].IdCliente};`).then((res)=>{
//                return resolve({Procesado: true, Operacion: 'El cliente fue Editado correctamente', Tipo: 'success', Cliente:datos});
//            }).catch(err => { console.log('err',err); return reject({Data: false, err })});

                //GUARDA REGISTRO DEL CLIENTE
//            }).then((res)=>{
                return this._ordenarQuery(conexion,`SELECT * FROM Clientes WHERE Nombre = '${datos.Nombre}'  LIMIT 1;`);
                //OBTIENE LOS DATOS COMPLETOS DEL CLIENTE
            }).then(cliente=>{
                //console.log('cliente',cliente);
                datos.ClienteCompleto = cliente[0];
                datos.ClienteCompleto.Codigo += `${datos.ClienteCompleto.IdCliente}`;
                return this._eliminarAdeudosPendientes(conexion,datos);
            }).then(datosEliminados =>{
                return this._guardarRelacionesTerrenos(conexion,datos);
                //GUARDA LA RELACION CON LOS TERRENOS
            }).then(relacionesGuardadas =>{
                return new Promise((resO, rejE)=>{
                    let cotizacionesGuardadas = [];
                    datos.Terrenos.forEach(dat=>{
                        if(!dat.ContieneMensualidad && dat.Estado != 'CEDIDO' && dat.Estado != 'POR CEDER'){
                            dat.Cotizacion = this._modificarCotizacon(dat.Cotizacion);
                            cotizacionesGuardadas.push(Promise.resolve({}));
                        }else{
    //                        dat.Cotizacion = (datos.FuenteDatos)?this._modificarMensualidades(dat.Cotizacion):dat.Cotizacion;
                            cotizacionesGuardadas.push(this._guardarAdeudosCliente(conexion,datos,dat));
                        }

                    });
                    Promise.all(cotizacionesGuardadas).then(resultados=>{
                        return resO(resultados);
                    }).catch(err=>{
                        return rejE(err);
                    })
                });
                //GUARDA LAS COTIZACIONES EN MENUSUALIDADES
            }).then(terminaCotizacion =>{
                return new Promise((resO, rejE)=>{
                    let anualidadesGuardadas = [];
                    datos.Terrenos.forEach(dat=>{
                        if(!dat.ContieneAnualidad  && dat.Estado != 'CEDIDO' && dat.Estado != 'POR CEDER'){
                            anualidadesGuardadas.push(Promise.resolve({}));
                        }else{
                            anualidadesGuardadas.push(this._guardarAnualidadesCliente(conexion,datos,dat));
                        }
                    });
                    Promise.all(anualidadesGuardadas).then(resultados=>{
                        return resO(resultados);
                    }).catch(err=>{
                        return rejE(err);
                    })
                });
                //console.log('cotizaciones',terminaCotizacion);

                //return this._guardarMantenimientoBasico(conexion,datos);
                //GUARDA EL PRIMER MANTENIMIENTO BASICOS
/*            }).then(terminaCotizacion =>{
                return this._guardarMantenimientoBasico(conexion,datos);*/
/*            }).then(terminaAnualidad =>{
                if(datos.FuenteDatos){
                    return this._actualizarDatosTodosOrigen(conexion,datos);
                }else{
                    return Promise.resolve({});
                }*/
            }).then(terminaTodo=>{
                if(datos.Mantenimientos_calculados){
                    return this._guardarMantenimientosCalculados(conexion,datos);
                }else{
                    return Promise.resolve({});
                }
            }).then(res=>{
                return resolve({Procesado: true, Operacion: 'El cliente fue Editado correctamente', Tipo: 'success', Cliente:datos});
                //conexion.end();
                //console.log('mantenimientos',terminaMantenimiento);
//                return resolve({Procesado: true, Operacion: 'El cliente fue guardado correctamente', Tipo: 'success', Cliente:datos});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});



        });
    }
    _eliminarAdeudosPendientes(conexion,datos){
        return new Promise((resolve, reject)=>{
            let condiciones =  ` IdCliente =  ${datos.ClienteCompleto.IdCliente} AND Pagado = 0 AND Pendiente = 0`;
            return this._ordenarQuery(conexion,`SELECT * FROM Adeudos_clientes WHERE ${condiciones} ;`).then(re=>{
                console.log('entra');
                if(re[0]){
                    let str = ``;
                    re.forEach(d=>{
                        str += `${d.IdAdeudo},`;
                    });
                    str = (str.indexOf(',') > -1 )?str.slice(0,-1):str;
                    return this._ordenarQuery(conexion,`DELETE FROM Adeudos_clientes WHERE IdAdeudo IN (${str});`);
                }else{
                    console.log('entro aqui')
                    return Promise.resolve({});
                }
            }).then(res=>{
                //console.log('res');
                let condiciones =  ` IdCliente =  ${datos.ClienteCompleto.IdCliente} AND Pagado = 0 AND Pendiente = 0`;
                return this._ordenarQuery(conexion,`SELECT * FROM Adeudos_anualidades WHERE ${condiciones} ;`);
            }).then(anu=>{
                if(anu[0]){
                    let str2 = ``;
                    anu.forEach(d=>{
                        str2 += `${d.IdAnualidad},`;
                    });
                    str2 = (str2.indexOf(',') > -1 )?str2.slice(0,-1):str2;
                    return this._ordenarQuery(conexion,`DELETE FROM Adeudos_anualidades WHERE IdAnualidad IN (${str2});`);                    
                }else{
                    return Promise.resolve({});
                }
            }).then(terrenos=>{
                return this._ordenarQuery(conexion,`DELETE FROM Clientes_terrenos WHERE  IdCliente =  ${datos.ClienteCompleto.IdCliente} ;`);
            }).then(resol=>{
                return resolve({});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Borrar_cliente(datos){
        return new Promise((resolve, reject)=>{
            let querys_borrar = [];
            var mysql = require('mysql');
            var conexion = mysql.createConnection({
                host     : 'localhost',
                user     : 'root',
                password : 'Sakaunperikin24*',
                database : 'ElRetiro',
                acquireTimeout: 100000000000000000
              });
            conexion.connect();
            querys_borrar.push(this._ordenarQuery(conexion,`UPDATE Clientes SET Activo = 0 WHERE IdCliente= ${datos.IdCliente};`));
            //querys_borrar.push(this._ordenarQuery(conexion,`DELETE FROM Adeudos_mantenimientos WHERE IdCliente= ${datos.IdCliente};`));
            //querys_borrar.push(this._ordenarQuery(conexion,`DELETE FROM Adeudos_clientes WHERE IdCliente= ${datos.IdCliente};`));
            //querys_borrar.push(this._ordenarQuery(conexion,`DELETE FROM Adeudos_anualidades WHERE IdCliente= ${datos.IdCliente};`));
            querys_borrar.push(this._ordenarQuery(conexion,`UPDATE Clientes_terrenos SET Activo = 0 WHERE IdCliente= ${datos.IdCliente};`));
            //querys_borrar.push(this._ordenarQuery(conexion,`DELETE FROM Ventas WHERE IdCliente= ${datos.IdCliente};`));
            datos.Terrenos.forEach(t=>{
                querys_borrar.push(this._ordenarQuery(conexion,`UPDATE Terrenos SET Asignado = 0  WHERE IdTerreno = ${t.IdTerreno};`));
            });
            querys_borrar.reduce((BC, current) => {
                return BC.then(results => {
                return current.then(currentResult => {
                    return Promise.resolve({Procesado:true,Res:currentResult});
                }).catch(e => {
                    return Promise.resolve({Procesado:false,Res:e});
                })
                })
            }, Promise.resolve([])).then(r => {
                return resolve(r);
                }).catch(err=>{ console.log('error',err); reject(err);})
        });
    }
    _verificarUsuario(conexion,datos){
        return new Promise((resolve, reject)=>{
//            let condiciones =  `Nombre ='${datos.Nombre}' AND  Correo = '${datos.Correo}' AND Num_ife = '${datos.NumIfe}'`;
//            let condiciones =  `Nombre ='${datos.Nombre}' AND  Correo = '${datos.Correo}' `;
            let condiciones =  ` Nombre ='${datos.Nombre2}' `;
            this._ordenarQuery(conexion,`SELECT IdCliente FROM Clientes WHERE ${condiciones} LIMIT 1;`).then((res)=>{
            //mysql.ejecutar(`SELECT IdCliente FROM Clientes WHERE ${condiciones} LIMIT 1;`).then((res)=>{
                return resolve(res);
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    _subirArchivo(path,nombre,datos,maxSize=false, encode=false){
        return new Promise((resolve, reject) => {
            //Si supera el max size regresa un reject
            if(maxSize){
                let encoding = (encode)?encode:false;
                let size = Buffer.byteLength(datos,encoding);
                if (size > maxSize) { return reject(`Archivo adjunto no debe pesar mas de ${maxSize/1048576} MB`);}
            }
            //Si no existe el directorio se crea
            (!fs.existsSync(path))?fs.mkdirpSync(path):'';
            //Fullpath
            let fullPath = `${path}${nombre}`;
            //Se escribe el archivo
            fs.writeFile(fullPath, datos,(err= true)=>{
                if(err){return reject(err)}else{resolve(fullPath);}
            });
        }).then((pathFinal) =>{
            return new Promise((resolve, reject) => {
                let campos =  'Nombre, Extension, Ruta, Fecha_insercion';
                let valores = `'${nombre.split('.')[0]}', '${nombre.split('.')[1]}', '${path}', '${ moment().format('YYYY-MM-DD HH:mm:ss') }'`;
                mysql.ejecutar(`INSERT INTO Archivos (${campos}) VALUES (${valores});`).then((res)=>{
                    return resolve({Procesado: true, Nombre: `${nombre.split('.')[0]}`, Path: pathFinal });
                }).catch(err => {return reject({Data: false, err }) });
            });
        }).then(result =>{
            return new Promise((resolve, reject) => {
                mysql.ejecutar(`SELECT IdArchivo FROM Archivos WHERE Nombre = '${result.Nombre}'`).then(rest=>{
                    return resolve(rest);
                }).catch(err => {return reject({Data: false, err })});
            });
        }).then(IdArchivo =>{
            if(IdArchivo[0]){
                return IdArchivo[0].IdArchivo;
            }else{
                return 0;
            }
        }).catch((error)=>{
            return error;
        });
    }
    Obtener_mensualidades(Id){
        return new Promise((resolve, reject)=>{
            console.log(`SELECT * FROM Adeudos_clientes WHERE IdCliente =  ${Id} ORDER BY Fecha asc ;`);
            mysql.ejecutar(`SELECT * FROM Adeudos_clientes WHERE IdCliente =  ${Id} ORDER BY Fecha asc ;`).then((res)=>{
                if(res[0]){
                    res.forEach(r=>{
                        if(r.Pendiente > 0){
                            r.Importe =  r.Pendiente;
                        }
                    });
                }
                return resolve({Data:res,Error:false});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });        
    }
    Obtener_anualidades(Id){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar(`SELECT * FROM Adeudos_anualidades WHERE IdCliente =  ${Id} ORDER BY Fecha asc ;`).then((res)=>{
                if(res[0]){
                    res.forEach(r=>{
                        if(r.Pendiente > 0){
                            r.Importe =  r.Pendiente;
                        }
                    });
                }
                return resolve({Data:res,Error:false});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });        
    }
/*    Obtener_mantenimientos_cliente(datos){
        return new Promise((resolve, reject)=>{
            let terrenos = ``;
            datos.Terrenos.forEach(ter=>{
                terrenos += `${ter.IdTerreno},`;
            });
            let condiciones =  `IdCliente =  ${datos.IdCliente} AND IdTerreno IN (${terrenos.substring(0,terrenos.length-1)})`;
            console.log('query',`SELECT * FROM Adeudos_mantenimientos  WHERE ${condiciones};`);
            mysql.ejecutar(`SELECT * FROM Adeudos_mantenimientos  WHERE ${condiciones};`).then((res)=>{
                console.log('res',res);
                return resolve({Data:res,Error:false});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }*/
    Obtener_mantenimientos(Id){
        return new Promise((resolve, reject)=>{
            
            mysql.ejecutar(`SELECT * FROM Adeudos_mantenimientos WHERE IdCliente =  ${Id} ORDER BY Fecha asc ;`).then((res)=>{
                if(res[0]){
                    res.forEach(r=>{
                        if(r.Pendiente > 0){
                            r.ImportePagado =  r.Importe-r.Pendiente;
                            r.Importe =  r.Pendiente;

                        }
                    });
                }
                return resolve({Data:res,Error:false});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });        
    }
    Guardar_cotizacion(datos){
        return new Promise((resolve, reject)=>{
            let today =  moment(new Date()).format('YYYY-MM-DD');
            // Contrato_agua, Periodo_cobro_mantenimiento, Importe_mantenimiento,Fecha_mantenimiento,
            let campos =  `Nombre, Enganche, Credito, Tasa, Num_pagos, Fecha_inicio, Superficie, Precio_metro, Costo_total, Mensualidad,Fecha_inicio_anualidad ,Num_anualidades,Anualidad, Fecha_cotizacion`;
            let valores = `'${datos.Nombre}',${datos.Enganche},${datos.Credito},${datos.Tasa},${datos.Num_pagos},'${datos.Fecha_inicio}',${datos.Superficie},${datos.Precio_metro},${datos.Costo_total},${datos.Mensualidad},'${datos.Fecha_inicio_anualidad}',${datos.Num_anualidades},${datos.Anualidad},'${today}'`;
            mysql.ejecutar(`INSERT INTO Cotizaciones (${campos}) VALUES (${valores});`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'La cotizacion fue guardada correctamente', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Guardar_archivo_contrato(datos){
        return new Promise((resolve, reject)=>{
            let today =  moment(new Date()).format('YYYY-MM-DD');
            let compExt = datos.Ext;
            let compCont = datos.Contenido;
            let compPath = `./shared/uploads/${datos.datosCliente.Nombre}/`;
            let compNombre =  `Contrato-parcela_${datos.datosTerreno.parcela}-lote_${datos.datosTerreno.lote}-etapa_${datos.datosTerreno.etapa}.${compExt}`;
            this._subirArchivo(compPath,compNombre,compCont,2097152).then(res=>{
                return resolve({res});
            }).catch(err=>{ console.log('err',err);return reject({Error:err});});
        });
    }
    Borrar_carga(Id){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar(`DELETE FROM Datos_carga WHERE IdDatosCarga = ${Id};`).then((res)=>{
                return resolve({Eliminado: true});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Guardar_datos_base_datos(request){
        let terrenos = [];
        var mysql = require('mysql');
        var conexion = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : 'Sakaunperikin24*',
            database : 'ElRetiro',
            acquireTimeout: 100000000000000000
          });
        conexion.connect();
        return new Promise((resolve, reject)=>{
            return this._ordenarQuery(conexion,`TRUNCATE Table Clientes`).then(clientesBorrados =>{
//             return mysql.ejecutar(`TRUNCATE Table Clientes`).then(clientesBorrados =>{
//                console.log('cli',clientesBorrados);
                return this._ordenarQuery(conexion,`TRUNCATE Table Terrenos;`);
                //return mysql.ejecutar(`TRUNCATE Table Terrenos;`);
            }).then(terrenosBorrados =>{
//                console.log('ter',terrenosBorrados);
                return this._ordenarQuery(conexion,`TRUNCATE Table Clientes_terrenos;`);
                //return mysql.ejecutar(`TRUNCATE Table Clientes_terrenos`);
            }).then(relacionesBorradas =>{
//                console.log('ter',relacionesBorradas);
                return this._ordenarQuery(conexion,`TRUNCATE Table Adeudos_mantenimientos;`);
                //return mysql.ejecutar(`TRUNCATE Table Adeudos_mantenimientos`);
            }).then(adeudosMantenimientosBorrados =>{
//                console.log('adeMan',adeudosMantenimientosBorrados);
                return this._ordenarQuery(conexion,`TRUNCATE Table Mantenimientos;`);
                //return mysql.ejecutar(`TRUNCATE Table Mantenimientos`);
            }).then(mantenimientosBorrados =>{
//                console.log('manten',mantenimientosBorrados);
                return this._ordenarQuery(conexion,`TRUNCATE Table Adeudos_clientes;`);
                //return mysql.ejecutar(`TRUNCATE Table Adeudos_clientes`);
            }).then(adeudosBorrados =>{
//                console.log('adeuborr',adeudosBorrados);
                return this._ordenarQuery(conexion,`TRUNCATE Table Ventas;`);
                //return mysql.ejecutar(`TRUNCATE Table Ventas`);
            }).then(ventasBorradas =>{
//                console.log('adeuborr',adeudosBorrados);
                return this._ordenarQuery(conexion,`TRUNCATE Table Cotizaciones;`);
                //return mysql.ejecutar(`TRUNCATE Table Cotizaciones`);
                }).then(cotizacionesBorradas =>{
//                console.log('ventas',ventasBorradas);
                return this._ordenarQuery(conexion,`SELECT * FROM Datos_carga`);
                //return mysql.ejecutar(`SELECT * FROM Datos_carga`);
            }).then(datosCarga =>{
                request = {DatosCarga: datosCarga }
                return new Promise((resO, rejE)=>{
                    let terrenosInsertados = [];
                    datosCarga.forEach(d=>{
                        terrenosInsertados.push(this._catalogoDeTerrenos(conexion,d));
                    });
                    terrenosInsertados.reduce((TI, current) => {
                        return TI.then(results => {
                          return current.then(currentResult => {
                            return Promise.resolve(currentResult);
                          }).catch(e => {
                            return Promise.resolve(e)
                          })
                        })
                      }, Promise.resolve([])).then(r => {
                        return this._ordenarQuery(conexion,`SELECT IdTerreno,parcela FROM Terrenos`);
                      }).then(terr=>{ 
                        request.DatosCarga.forEach(d=>{
                            d.IdTerreno =  terr.find(ob=>ob.parcela == d.Parcela).IdTerreno;
                        })
                        return resO(request);
                      }).catch(err=>{ console.log('error',err); rejE(err);})
                    /*Promise.all(terrenosInsertados).then(resultados=>{
                        return this._ordenarQuery(conexion,`SELECT IdTerreno,parcela FROM Terrenos`);
                        //return mysql.ejecutar(`SELECT IdTerreno,parcela FROM Terrenos`);
                    }).then(terr=>{ 
                        request.DatosCarga.forEach(d=>{
                            d.IdTerreno =  terr.find(ob=>ob.parcela == d.Parcela).IdTerreno;
                        })
                        return resO(request);
                    }).catch(err=>{ console.log('error',err); rejE(err);})*/
                });
            }).then(R =>{
                return new Promise((resO, rejE)=>{
                    let cotizacionesInsertadas = [];
                    request.DatosCarga.forEach(d=>{
                        cotizacionesInsertadas.push(this._catalogoCotizaciones(conexion,d));
                    });
                    cotizacionesInsertadas.reduce((CT, current) => {
                        return CT.then(results => {
                          return current.then(currentResult => {
                            return Promise.resolve(currentResult);
                          }).catch(e => {
                            return Promise.resolve(e)
                          })
                        })
                      }, Promise.resolve([])).then(r => {
                        return this._ordenarQuery(conexion,`SELECT IdCotizacion,Nombre FROM Cotizaciones`);
                        //return mysql.ejecutar(`SELECT IdCotizacion,Nombre FROM Cotizaciones`);
                    }).then(cot=>{
                        request.DatosCarga.forEach(d=>{
                            d.IdCotizacion =  cot.find(ob=>ob.Nombre.split('_P_')[1] == d.Parcela).IdCotizacion;
                        })
                        return resO(request);
                      }).catch(err=>{ console.log('error',err); rejE(err);})
                      /*
                    Promise.all(cotizacionesInsertadas).then(resultados=>{
                        return this._ordenarQuery(conexion,`SELECT IdCotizacion,Nombre FROM Cotizaciones`);
                        //return mysql.ejecutar(`SELECT IdCotizacion,Nombre FROM Cotizaciones`);
                    }).then(cot=>{
                        request.DatosCarga.forEach(d=>{
                            d.IdCotizacion =  cot.find(ob=>ob.Nombre.split('_P_')[1] == d.Parcela).IdCotizacion;
                        })
                        return resO(request);
                    }).catch(err=>{ console.log('error',err); rejE(err);})*/
                });
            }).then(C =>{
                request.DatosCarga2 = request.DatosCarga;
                request.DatosCarga = this._ordenarDatosCargaFinal(request.DatosCarga);
                return new Promise((resO, rejE)=>{
                    let clientesInsertados = [];
                    //console.log('requestdatos',request.DatosCarga);
                    request.DatosCarga.forEach(d=>{
                        clientesInsertados.push(this.Guardar_nuevo_cliente(d));
                    });
                    Promise.all(clientesInsertados).then(resultados=>{
                        return resO(request);
                    }).catch(err=>{ console.log('error',err); rejE(err);})
                });
            }).then(ajustado =>{//PROCESAR MANTENIMIENTOS PENDIENTES
                return new Promise((resO, rejE)=>{
                    let mantPendientes = [];
                    request.DatosCarga2.forEach(d=>{
                        let adeu_pend = this._mantenimientosPendientes(d,request.DatosCarga);
                        adeu_pend.forEach(a=>{
                            let campos = `IdCliente, IdTerreno, Concepto, Importe, Fecha, Fecha_modificacion`;
                            let valores = `${a.IdCliente},${a.IdTerreno},'${a.Concepto}',${a.Importe},'${a.Fecha}','${a.Fecha_modificacion}'`;
                            mantPendientes.push(this._ordenarQuery(conexion,`INSERT INTO Adeudos_mantenimientos (${campos}) VALUES (${valores});`));
                        })
                    });
                    mantPendientes.reduce((mP, current) => {
                        return mP.then(results => {
                        return current.then(currentResult => {
                            return Promise.resolve({Procesado:true,Res:currentResult});
                        }).catch(e => {
                            return Promise.resolve({Procesado:false,Res:e});
                        })
                        })
                    }, Promise.resolve([])).then(r => {
                        return resO(r);
                    }).catch(err=>{ console.log('error',err); rejE(err);})
                });
            }).then(ajustado =>{
                conexion.end();
                return resolve({Procesado: true, Operacion: 'Datos Cargados Correctamente', Tipo: 'success', Datos:request.DatosCarga});
            }).catch(err=>{ console.log('err',err);return reject({Error:err});});
        });
    }
    _mantenimientosPendientes(Datos, Clientes){ 
        let datosMantenimientosPendientes = [];
        //console.log('Datos',Clientes);
        if(Datos.Deuda_mantenimiento > 0){
            let idCliente = Clientes.find(ob=> ob.ClienteCompleto.Nombre == Datos.Nombre_cliente).ClienteCompleto.IdCliente
            let numPend = Datos.Deuda_mantenimiento/Datos.Cuota_mantenimiento;
            //Ceil parriba   
            //Floor PABAJO
            for(let i = 1; i< Math.ceil(numPend); i++){
                let Fch_mens = moment(Datos.Fecha_primer_mantenimiento).subtract(i,'month').format('YYYY-MM-DD');
                datosMantenimientosPendientes.push({IdCliente: idCliente ,IdTerreno:Datos.IdTerreno, Concepto: `Mantenimiento Pendiente Num ${i}`,Importe: Datos.Cuota_mantenimiento, Fecha: Fch_mens , Fecha_modificacion: moment().format('YYYY-MM-DD HH:mm:ss')});
            }
        }
        return datosMantenimientosPendientes;
    }
    Generar_pdf_prueba(datos){
        return new Promise((resolve, reject) => {
            let file = `./shared/uploads/Recibos/RECIBO.pdf`;
            let wf = fs.createWriteStream(file);
            return this.obtenerDatosRecibo({}).then((datosCompletos) => {
//                console.log('datos',datosCompletos);
                let doc = new pfd();
                wf.on('error', (error) => { console.error(error); });
                doc.pipe(wf);
                return this._renderPDF(doc, datosCompletos);
            }).then((doc) => {
                return new Promise((re,rj) =>{
                    wf.on('close',(a) =>{
                        fs.readFile(file,(e, data) => {
                            if(e){ 
                                rj(e);
                            }else{
                                //fs.remove(file); 
                                re({String:data.toString('base64')})
                            }
                        })
                    })
                })
            })
            .then(resultado =>{
                resolve(resultado)
            }).catch(e => {console.log(e); return reject(e)})
        })
    }
    Generar_pdf_pagare(datos){
        return new Promise((resolve, reject) => {
            console.log('datos',datos.Datos);
            let file = `./shared/uploads/Pagares/Pagare.pdf`;
            let wf = fs.createWriteStream(file);
            let doc = new pfd();
            wf.on('error', (error) => { console.error(error); });
            doc.pipe(wf);
            return this._renderPagarePDF(doc, datos.Datos).then((doc) => {
                return new Promise((re,rj) =>{
                    wf.on('close',(a) =>{
                        fs.readFile(file,(e, data) => {
                            if(e){ 
                                rj(e);
                            }else{
                                //fs.remove(file); 
                                re({String:data.toString('base64')})
                            }
                        })
                    })
                })
            })
            .then(resultado =>{
                resolve(resultado)
            }).catch(e => {console.log(e); return reject(e)})
        })
    }
    _renderPagarePDF(doc,datos){
        return new Promise((resolve, reject) => {
            try{
                let cifrasEnLetras = new numerosALetras();
                let numero = datos.Saldo_credito + datos.Saldo_adeudo;
                let centavos = Math.round(numero * 100) - Math.floor(numero) * 100;
                numero = (String(numero).split('.')) ? Number(String(numero).split('.')[0]) : numero;
                let totalletras = cifrasEnLetras.convertirCifrasEnLetras(numero);
                let decimalesLetras = `Pesos con ${((centavos) ? centavos/100 : '0')} centavos`;
                datos.TotalLetra = `${totalletras} ${decimalesLetras}`;
                let Parcela;let Lote;let Etapa;let Duenio;
                Parcela = Lote = Etapa =  Duenio = '';
                let aux = (datos.Terrenos.length > 1)?` y `:``;
                let c = 1;
//                Duenio += `${t.Pertenece} ${(c<datos.Terrenos.length)?aux:``}`;
                datos.Terrenos.forEach(t=>{
                    Parcela += `${t.parcela} ${(c<datos.Terrenos.length)?aux:``}`;
                    Lote += `${t.lote} ${(c<datos.Terrenos.length)?aux:``}`;
                    Etapa += `${t.etapa} ${(c<datos.Terrenos.length)?aux:``}`;
                    Duenio = t.Pertenece;
                    c++;
                });
                //Contenedor
                let inicio = 20;
                doc.rect(12,10+inicio,590,270).stroke("#090");
                //Texto Centrico
                this._textoPdf(doc,'Pagare',20,20+inicio,14,false,false,400);
                this._textoPdf(doc,'No 1/1',270,20+inicio,12,false,false,200);
                this._textoPdf(doc,'Bueno por ',500,20+inicio,12,false,false,100);
                this._textoPdf(doc,`$ ${datos.Saldo_credito + datos.Saldo_adeudo}`,510,35+inicio,12,false,false,100);
                this._textoPdf(doc,'      En la Ciudad Hermosillo, Sonora ____ De ___________ De ______.  Debo y pagaré incondicionalmente',20,50+inicio,10,false,false,600);
                this._textoPdf(doc,`Por este Pagaré la orden de ${Duenio}, el _____  DE ____________ DE ______`,20,65+inicio,10,false,false,600);
                this._textoPdf(doc,`la cantidad de: $   ${datos.Saldo_credito + datos.Saldo_adeudo} (son:  ${datos.TotalLetra})`,20,80+inicio,10,false,false,600);
                this._textoPdf(doc,`valor recibido a mi entera satisfacción. Este pagaré forma parte de una serie numerada del _1_ al _1_ y todos estan`,20,95+inicio,10,false,false,600);
                this._textoPdf(doc,`sujetos a la condición de que al no pagarse cualquiera de ellos a su vencimiento, seran exigibles todos los que sigan`,20,110+inicio,10,false,false,600);
                this._textoPdf(doc,`en número, además de los ya vencidos, desde la fecha de vencimiento a éste documento hasta el dia de su liquidación,`,20,125+inicio,10,false,false,600);
                this._textoPdf(doc,`causará intereses moratorios al tipo de _____ % diario pagadero en esta ciudad juntamente como el principal,`,20,140+inicio,10,false,false,600);
                this._textoPdf(doc,`Nombre y datos del deudor`,20,155+inicio,10,false,false,600);
                this._textoPdf(doc,`Nombre:  ${datos.Nombre}     No DE LOTES _${Lote}_ Y ETAPAS _${Etapa}_`,20,170+inicio,10,false,false,600);
                this._textoPdf(doc,`DIRECCIÓN:  ${datos.Direccion}`,20,185+inicio,10,false,false,600);
                this._textoPdf(doc,`POBLACIÓN:   Hermosillo, Son               TELÉFONO   ${datos.Telefono}  `,20,200+inicio,10,false,false,600);
                this._textoPdf(doc,`              ACEPTO`,20,220+inicio,10,false,false,600);
                this._textoPdf(doc,`______________________________`,20,235+inicio,10,false,false,600);
                this._textoPdf(doc,`           Firma de Aceptación`,20,247+inicio,10,false,false,600);
                doc.end();
                return resolve(doc);
            }
            catch(e){
                //console.log(e)
                reject(e);
            }
        })
    }
    Generar_pdf_recibo(datos){
        return new Promise((resolve, reject) => {
            //console.log('datos',datos);
            let file = `./shared/uploads/Recibos/RECIBO.pdf`;
            let wf = fs.createWriteStream(file);
                let doc = new pfd();
                wf.on('error', (error) => { console.error(error); });
                doc.pipe(wf);
                return this._renderPDF(doc, datos).then((doc) => {
                return new Promise((re,rj) =>{
                    wf.on('close',(a) =>{
                        fs.readFile(file,(e, data) => {
                            if(e){ 
                                rj(e);
                            }else{
                                //fs.remove(file); 
                                re({String:data.toString('base64')})
                            }
                        })
                    })
                })
            })
            .then(resultado =>{
                resolve(resultado)
            }).catch(e => {console.log(e); return reject(e)})
        })
    }
    _renderPDF(doc, datos) {
        return new Promise((resolve, reject) => {
            try{
                datos.DatosVenta.Fecha = `Hermosillo Sonora a ,${moment().format('dddd [del] YYYY')}`;
                let cifrasEnLetras = new numerosALetras();
                let numero = datos.DatosVenta.Total;
                let centavos = Math.round(numero * 100) - Math.floor(numero) * 100;
                numero = (String(numero).split('.')) ? Number(String(numero).split('.')[0]) : numero;
                let totalletras = cifrasEnLetras.convertirCifrasEnLetras(numero);
                let decimalesLetras = `Pesos con ${((centavos) ? centavos/100 : '0')} centavos`;
                datos.DatosVenta.TotalLetra = `${totalletras} ${decimalesLetras}`;
                //let extra =  (datos.DatosVenta.ConceptosPagados.length > 2)? 
                //Contenedor
                let inicio = 20;
                doc.rect(12,10+inicio,590,160).stroke("#090");
                //Logo
                doc.image('./shared/imagenes/logo_recibo.png', 10, 10+inicio);
                //Texto Centrico
                this._textoPdf(doc,'Campestre Familiar',225,60+inicio);
                this._textoPdf(doc,'El Retiro',225,80+inicio,15);
                this._textoPdf(doc,'OFICINA',225,100+inicio);
                this._textoPdf(doc,'Guadalupe Victoria No. 105 entre Tlaxcala',225,115+inicio,10);
                this._textoPdf(doc,'y Quintana Roo  Telefono 210-61-77',225,130+inicio,10);
                this._textoPdf(doc,'Col. San Benito  Hermosillo Sonora.',225,145+inicio,10);
                //Detalles total
                doc.rect(450,70+inicio,140,72).stroke("#115f11");
                doc.rect(450,70+inicio,140,15).fillAndStroke("#115f11");
                doc.rect(450,105+inicio,140,15).fillAndStroke("#115f11");
                this._textoPdf(doc,'RECIBO',455,72+inicio,false,'#fff');
                this._textoPdf(doc,`No. ${datos.DatosVenta.Folio}`,455,90+inicio,false,'#c00');
                this._textoPdf(doc,'Bueno por $',455,107+inicio,false,'#fff');
                this._textoPdf(doc,`$ ${datos.DatosVenta.Total.toFixed(2)}`,455,125+inicio);
                //Contenedor
                doc.rect(12,170+inicio,590,250).stroke("#090");
                //Contenedor conceptos
                let aumentoConceptos = datos.DatosVenta.ConceptosPagados.length * 65;
//                let aumentoConceptos = 130;
                doc.rect(25,180+inicio,565,aumentoConceptos).stroke("#090");
                //Conceptos
                this._textoPdf(doc,`RECIBIMOS DE: ${datos.DatosCliente.Nombre}`,35,190+inicio,12);
                this._textoPdf(doc,`La Cantidad de: ${datos.DatosVenta.TotalLetra}`,35,205+inicio,12);
                this._textoPdf(doc,`Por Concepto de : `,35,230+inicio,12);
                this._textoPdf(doc,`${datos.DatosVenta.Fecha}`, 370, 320+inicio);
                let inicial =230+inicio ;
                datos.DatosVenta.ConceptosPagados.forEach(con=>{
                    inicial += 15;
                    this._textoPdf(doc,`${con.Concepto}`,45,inicial,12,false,false,500);
                });
                doc.image('./shared/imagenes/Firma_recibo.png', 390, 340+inicio,{width: 200, height: 74});
                doc.end();
                return resolve(doc);
            }
            catch(e){
                //console.log(e)
                reject(e);
            }
        })
    }
    _textoPdf(doc,texto,ini,fi,si,col,fo,wi,al){
        let size = (si)?si:12;
        let font = (fo)?fo:'Helvetica';
        let color = (col)?col:'#000';
        let inicio = (ini)?ini:0;
        let fin = (fi)?fi:100;
        let widt = (wi)?wi:300;
        let aling = (al)?al:12;
        return doc.fontSize(size).font(font).fillColor(color).text(texto, inicio, fin, {width: widt, align:aling})
    }
    obtenerDatosRecibo(data){
        return new Promise((resolve, reject)=>{
        let conceptos = [];
        conceptos.push({Anualidad: false,Mensualidad:false,
            Concepto: "Mensualidad #1  con un total de 2000 al lote : 68, etapa : PIII, de campestre familiar ElRetiro.",
            Importe: 2000,
            TipoMovimiento: "01"});
            conceptos.push({Anualidad: false,Mensualidad:false,
                Concepto: "Enganche con un total de 5000 al lote : 68, etapa : PIII, de campestre familiar ElRetiro.",
                Importe: 5000,
                TipoMovimiento: "02"});
        let datos = {
            DatosCliente: {Nombre: 'Luis Fernando Cordova',Codigo: 'CLI0001'},
            DatosVenta:{ Concepto: "pruebas", ConceptosPagados: conceptos, Folio: "VEN-62",
            FormaPago: "Efectivo", Recibo: "62", TipoVenta: "Mensualidad",Total: 2000 }};
        return resolve(datos);
        });
    }
    Afectar_saldos_datos(Datos){
        return new Promise((resolve, reject)=>{
            return mysql.ejecutar(`SELECT * FROM Datos_carga`).then(datosCarga =>{
                Datos.DatosCarga = datosCarga;
                return mysql.ejecutar(`SELECT * FROM Clientes`);
            }).then(Clientes=>{
                Datos.Clientes = Clientes;
                return mysql.ejecutar(`SELECT * from Clientes_terrenos as cter JOIN Terrenos as ter on ter.IdTerreno = cter.IdTerreno`);
            }).then(ClientesTerrenos=>{
                if(ClientesTerrenos[0]){
                    return new Promise((resOL, rejEC)=>{
                        let clientesProcesados = [];
                        Datos.Clientes.forEach(c=>{
                            clientesProcesados.push(this._ajustarPorCliente(Datos,ClientesTerrenos,c));
                            /*.then(res=>{
                                return {Procesado:true,Dato:c};
                            }).catch(err=>{
                                console.log('er',err);
                                return {Procesado:false,Dato:c};
                            })); */
                        });
                        clientesProcesados.reduce((CliP, current) => {
                            return CliP.then(results => {
                                return current.then(currentResult => {
                                    //console.log('currentResult',currentResult);
                                    return Promise.resolve({Procesado:true,Res:currentResult});
                                }).catch(e => {
                                    return Promise.resolve({Procesado:false,Res:e});
                                })
                            })
                        }, Promise.resolve([])).then(r => {
                            return resOL(r);
                        }).catch(err=>{ console.log('error',err); rejEC(err);})
                        /*
                        Promise.all(clientesProcesados).then(resultados=>{
                            console.log('resultados_por_cliente',resultados);
                            return resOL(resultados);
                        }).catch(err=>{
                            return rejEC(err);
                        })*/
                    });
                }else{
                    return Promise.resolve({Procesado:false,Dat:0})
                }
            }).then(res=>{
                //console.log('res termina todo',res);
                return resolve({Procesado: true, Operacion: 'Datos afectados Correctamente', Tipo: 'success'});
            }).catch(err=>{ console.log('err',err);return reject({Error:err});});
        });
    }
    _ajustarPorCliente(Datos,ClientesTerrenos,c){
        return new Promise((resO, rejE)=>{
            let clientesAplicados = [];
            let terrenos  = ClientesTerrenos.filter(ob=>ob.IdCliente == c.IdCliente);
            if(terrenos[0]){
                terrenos.forEach(t=>{
                    clientesAplicados.push(
                    this._ajustarPorTerreno(Datos,c,t));
                    /*.then(si=>{
                        return {Procesado:true, Partida: si.Partida };
                    }).catch(no=>{
                        return {Procesado:false, Partida: no.Partida};
                    }));*/
                });
                clientesAplicados.reduce((CliA, current) => {
                    return CliA.then(results => {
                      return current.then(currentResult => {
                        return Promise.resolve({Procesado:true,Res:currentResult});
                      }).catch(e => {
                        return Promise.resolve({Procesado:false,Res:e});
                      })
                    })
                }, Promise.resolve([])).then(r => {
                    return resO(r);
                }).catch(err=>{console.log('err',err); return rejE(err);});
                /*            Promise.all(clientesAplicados).then(resultados=>{
                console.log('TERMINO TODO BIEN',resultados);
                return resO(resultados);
            }).catch(err=>{
                return rejE(err);
            })*/
            }else{
                return resO({Procesado:false,Res:{}});
            }
        });
    }
    _ajustarPorTerreno(Datos,c,t){
        console.log('terres',t);
        return new Promise((resolve, reject)=>{
            return new Promise((resO, rejE)=>{
            let datosPartida;
            let datos_ven = Datos.DatosCarga.find(ob=>ob.Parcela == t.parcela);
            let ConceptosAutomaticos = [];
            //Enganche
            if(datos_ven.Enganche_pagado > 0){
                ConceptosAutomaticos.push({Concepto: 'Enganche', Importe: parseFloat(datos_ven.Enganche_pagado), TipoMovimiento: '02' });
            }
            //CERTIFICADO
            let Importe_certificado = 8000 - parseFloat(datos_ven.Deuda_certificado);
            //console.log('certificado',Importe_certificado);
            if(Importe_certificado < 8000){
                ConceptosAutomaticos.push({Concepto: 'Abono/Pago de Certificado', Importe: Importe_certificado, TipoMovimiento: '07' });
            }
            //AGUA
            let Importe_agua = 5000-parseFloat(datos_ven.Contrato_agua);
            //console.log('agua',Importe_agua);
            if(Importe_agua < 5000){
                ConceptosAutomaticos.push({Concepto: 'Abono/Pago de Contrato de agua', Importe: Importe_agua, TipoMovimiento: '05' });
            }
            if(datos_ven.Cantidad_ultima_anualidad != '0'){
                let montoAnualidad = parseFloat(datos_ven.Cantidad_ultima_anualidad)* parseFloat(datos_ven.Cantidad_anualidades);
                ConceptosAutomaticos.push({Concepto: 'Abono anualidades', Importe: montoAnualidad, TipoMovimiento: '03' });
            }
            let total_ = 0;
            let importe_ = parseFloat(`${datos_ven.Cantidad_mensualidad}`);
            let numMensualidades = parseInt(datos_ven.Cantidad_mensualidades_pagadas);
            if(numMensualidades > 0 ){
                for(let i = 1; i<= numMensualidades; i++){
                    total_ += importe_;
                }
                ConceptosAutomaticos.push({Concepto: `Abono Libre Automatico`, Importe: total_, TipoMovimiento:'06'});
            }
            //console.log('conceptos',ConceptosAutomaticos);
            if(ConceptosAutomaticos[0]){
                let total_partida = 0;
                ConceptosAutomaticos.forEach(co=>{
                    total_partida += parseFloat(co.Importe);
                })
                datosPartida = { DatosUsuario:{Datos:{IdUsuario:0,Nombre:'Sistema'}}, DatosCliente: c, DatosTerreno: t, DatosVenta: { Folio: 'VEN-0', Recibo: '1', TipoVenta: 'Automatica', FormaPago: 'Efectivo', Concepto: 'Ajuste_automatico_sistema', Total: total_partida,ConceptosPagados : ConceptosAutomaticos } };
                //console.log('datos_partida',datosPartida);
                this.Guardar_nuevo_ingreso(datosPartida).then(re=>{
                    return resO({Procesado : true, Partida: datosPartida});
                }).catch(er=>{
                    console.log('err',er);
                    return rejE({Procesado : false, Partida: err});
                });
            }else{
                return resO({Procesado : false, Partida: { DatosUsuario:{Datos:{IdUsuario:0,Nombre:'Sistema'}}, DatosCliente: c, DatosTerreno: t, DatosVenta: { Folio: 'VEN-0', Recibo: '1', TipoVenta: 'Automatica', FormaPago: 'Efectivo', Concepto: 'Ajuste_automatico_sistema', Total: 0,ConceptosPagados : [] } } });
            }
            }).then(mante=>{
                return new Promise((resO, rejE)=>{
                    let datosPartida;
                    let datos_man = Datos.DatosCarga.find(ob=>ob.Parcela == t.parcela);
                    let ConceptosAutomaticos = [];
                    console.log('datos_man',datos_man);
                    if(datos_man.Deuda_mantenimiento == '0' && datos_man.Cuota_mantenimiento != '0' ){
                        ConceptosAutomaticos.push({Concepto: 'Abono Libre Automatico', Importe: parseFloat(datos_man.Cuota_mantenimiento), TipoMovimiento: '02' });
                    }
                    if(ConceptosAutomaticos[0]){
                        let total_partida = 0;
                        ConceptosAutomaticos.forEach(co=>{
                            total_partida += parseFloat(co.Importe);
                        })
                        datosPartida = { DatosUsuario:{Datos:{IdUsuario:0,Nombre:'Sistema'}}, DatosCliente: c, DatosTerreno: t, DatosMantenimiento: { Folio: 'MAN-0', Recibo: '1', TipoMantenimiento: '02', FormaPago: 'Efectivo', Concepto: 'Ajuste_automatico_sistema', Total: total_partida,ConceptosPagados : ConceptosAutomaticos } };
                        console.log('datos_partida',datosPartida.DatosMantenimiento.ConceptosPagados);
                        this.Guardar_nuevo_mantenimiento(datosPartida).then(re=>{
                            return resO({Procesado : true, Partida: datosPartida});
                        }).catch(er=>{
                            console.log('err',er);
                            return rejE({Procesado : false, Partida: err});
                        });
                    }else{
                        return resO({Procesado : false, Partida: { DatosUsuario:{Datos:{IdUsuario:0,Nombre:'Sistema'}}, DatosCliente: c, DatosTerreno: t, DatosMantenimiento: { Folio: 'Man-0', Recibo: '1', TipoVenta: 'Automatica', FormaPago: 'Efectivo', Concepto: 'Ajuste_automatico_sistema', Total: 0,ConceptosPagados : [] } } });
                    }
                });
            }).then(re=>{
                return resolve(re);
            }).catch(err=>{
                console.log('err',err);
                return reject(err);
            });

        });
    }
    _ordenarDatosCargaFinal(Datos){
        //console.log('Datos',Datos);
        let DatosClientes = [];
        Datos.forEach(d=>{
            let registrosCliente = Datos.filter(ob=> ob.Nombre_cliente == d.Nombre_cliente);
            let Terrenos = [];
            registrosCliente.forEach(r=>{
                let Cotizacion = {IdCotizacion:r.IdCotizacion,Enganche:r.Enganche,Credito:r.Saldo_credito,
                    Tasa:r.Interes,Num_pagos:r.Numero_mensualidades,Fecha_inicio:r.Fecha_primera_mensualidad,
                    Superficie:r.Superficie,Precio_metro:r.Costo_m2_venta,Costo_total:r.Costo_terreno_total,
                    Mensualidad:r.Cantidad_mensualidad,Anualidad:r.Cantidad_anualidades,Fecha_mantenimiento:r.Fecha_primer_mantenimiento,
                    Importe_mantenimiento:r.Cuota_mantenimiento,Contrato_agua:r.Contrato_agua,Periodo_cobro_mantenimiento:r.Modo_cobro_mantenimiento};
                Terrenos.push({IdTerreno:r.IdTerreno,parcela:r.Parcela,etapa:r.Etapa,lote:r.Lote,
                    Pertenece:r.Nombre_parcela,Superficie:r.Superficie,Asignado:1,Activo:1,IdCotizacion:r.IdCotizacion,Cotizacion:[Cotizacion]});
            });
            //console.log('terrenos',Terrenos);
            let existe = DatosClientes.find(ob=>ob.Nombre == d.Nombre_cliente);
            if(!existe){
                let saldo_anualidad;
                if(d.Cantidad_anualidades != '0'){
                    let cant = parseInt(d.Numero_anualidades);
                    let monto = parseFloat(d.Cantidad_anualidades);
                    let ultima = parseFloat(d.Cantidad_ultima_anualidad);
                    //console.log('aaaa',`${cant}-${monto}-${ultima}`);
                    saldo_anualidad = (((cant-1)*monto)+ultima);
                }else{
                    saldo_anualidad = 0;
                }
                //console.log('saldo_an',saldo_anualidad);
                DatosClientes.push({IdIfe:0,IdComprobante:0,Nombre:d.Nombre_cliente,Correo:d.Correo,
                Telefono:d.Telefono,Direccion:d.Direccion,Saldo_agua:d.Contrato_agua,Saldo_adeudo:d.Enganche,
                Saldo_credito:d.Saldo_credito,Saldo_mantenimiento:d.Deuda_mantenimiento,Saldo_certificado:d.Deuda_certificado,Credito_original:d.Saldo_credito,
                Saldo_anualidad:saldo_anualidad,
                NumIfe:d.Numero_ine,Origen:d.Lugar_origen,Ref1:d.Nombre_ref_1,Ref2:d.Nombre_ref_2,
                TelRef_1:d.Tel_Ref_1,TelRef_2:d.Tel_Ref_2,TelRef_3:d.Tel_Ref_3,
                Ref3:d.Nombre_ref_3,Fecha_nacimiento:d.Fecha_nacimiento,
                Terrenos:Terrenos,Usuario:{Datos:{IdUsuario:0, Nombre: 'Sistema_automatico'}}});
            }
        });
        return DatosClientes;
    }
    _catalogoDeTerrenos(conexion,d){
        return new Promise((resolve, reject)=>{
            let campos = `parcela, etapa, lote, Pertenece, Superficie, Asignado, Activo`;
            let valores = `'${d.Parcela}','${d.Etapa}','${d.Lote}','${d.Nombre_parcela}',${d.Superficie},0,0`;
            let ins = `INSERT INTO Terrenos(${campos}) VALUES(${valores})`;
            let aux_updates = `parcela = '${d.Parcela}', etapa = '${d.Etapa}',lote = '${d.Lote}',pertenece = '${d.Nombre_parcela}', superficie= ${d.Superficie}, Asignado = 1`;
            let updates = ` UPDATE Terrenos SET ${aux_updates} WHERE parcela =  ${d.Parcela} ; `;
            return this._ordenarQuery(conexion,`SELECT IdTerreno FROM Terrenos Where parcela = '${d.Parcela}'`)
            //return mysql.ejecutar(`SELECT IdTerreno FROM Terrenos Where parcela = '${d.Parcela}'`)
            .then(existe =>{
                if(existe[0]){
                    return this._ordenarQuery(conexion,updates);
                    //return mysql.ejecutar(updates);
                }else{
                    return this._ordenarQuery(conexion,ins);
                    //return mysql.ejecutar(ins);
                }
            }).then(ej=>{
                return resolve({Procesado: true, Dat: d});
            }).catch(err=>{
                return reject({Procesado: false, Dat: d});
            });
        });
    }
    _catalogoCotizaciones(conexion,d){
        return new Promise((resolve, reject)=>{
            let today =  moment(new Date()).format('YYYY-MM-DD');
            let campos = `Nombre, Enganche, Credito, Tasa, Num_pagos, Fecha_inicio, Superficie, Precio_metro, Costo_total, Mensualidad, Anualidad, Fecha_mantenimiento, Importe_mantenimiento, Contrato_agua, Periodo_cobro_mantenimiento, Fecha_cotizacion, Activa`;
            let valores = `'COT_AUTO_P_${d.Parcela}',${d.Enganche},${d.Saldo_credito},${(d.Interes != '-')?d.Interes:0},${d.Numero_mensualidades},'${d.Fecha_primera_mensualidad}',${d.Superficie},${d.Costo_m2_venta},${d.Costo_terreno_total},${d.Cantidad_mensualidad},${d.Cantidad_anualidades},'${d.Fecha_primer_mantenimiento}',${(d.Cuota_mantenimiento != undefined)?d.Cuota_mantenimiento:0},${d.Contrato_agua},${d.Modo_cobro_mantenimiento},'${today}',1`;
            let ins = `INSERT INTO Cotizaciones(${campos}) VALUES(${valores})`;
            return this._ordenarQuery(conexion,ins).then(ej=>{
            //return mysql.ejecutar(ins).then(ej=>{
                return resolve({Procesado: true, Dat: d});
            }).catch(err=>{
                console.log('error',err);
                return reject({Procesado: false, Dat: d});
            });
        });
    }
    _catalogoClientes(){
        let clientesAgregados = [];
        datosCarga.forEach(d=>{
            let datos_cliente = {IdIfe:0,IdComprobante:0,Nombre:d.Nombre_cliente,Correo:d.Correo,
                Telefono:d.Telefono,Direccion:d.Direccion,Saldo_agua:d.Contrato_agua,Saldo_adeudo:d.Enganche,
                Saldo_credito:d.Saldo_credito,Saldo_mantenimiento:d.Mantenimiento,Credito_original:d.Saldo_credito,
                NumIfe:d.Numero_ine,Origen:d.Lugar_origen,Ref1:d.Nombre_ref_1,Ref2:d.Nombre_ref_2,
                Ref3:d.Nombre_ref_3,Fecha_nacimiento:d.Fecha_nacimiento};
                //console.log('d',datos_cliente);
        });
    }
    Guardar_datos_archivo(datos){
        return new Promise((resolve, reject)=>{
            var mysql = require('mysql');
            var conexion = mysql.createConnection({
                host     : 'localhost',
                user     : 'root',
                password : 'Sakaunperikin24*',
                database : 'ElRetiro',
                acquireTimeout: 100000000000000000
              });
            conexion.connect();
            let today =  moment(new Date()).format('YYYY-MM-DD');
            let compExt = `xlsx`;
            let compCont = new Buffer(datos.file, "base64"); ;
            let compPath = `./shared/uploads/CargaDatos/`;
            let compNombre =  `Archivo_carga.xlsx`;
            this._subirArchivo(compPath,compNombre,compCont,2097152).then(res=>{
                if(datos.Borrar_anteriores){
                    return this._ordenarQuery(conexion,`TRUNCATE Table Datos_carga`);
                }else{
                    return this._ordenarQuery(conexion,`SELECT * FROM Datos_carga LIMIT 1`);
                }
//                return mysql.ejecutar(`TRUNCATE Table Datos_carga`);
            }).then(eliminados=>{
                return this._leerExcel(`./shared/uploads/CargaDatos/Archivo_carga.xlsx`);
            }).then(datos=>{
                if(datos){
                    return new Promise((resO, rejE)=>{
                        let camposProcesados = [];
                        let campos_insert = `Nombre_parcela, Parcela, Superficie, Lote, Etapa, Nombre_cliente, Estatus, Tiempo_deuda_mantenimiento, Deuda_mantenimiento, Cuota_mantenimiento, Fecha_primer_mantenimiento, Modo_cobro_mantenimiento, Estado_cerfiticado, Deuda_certificado, Contrato_agua, Comentario, Correo, Telefono, Direccion, Costo_terreno_total, Saldo_credito, Interes, Costo_m2_venta, Enganche, Fecha_enganche, Enganche_pagado, Numero_anualidades, Cantidad_anualidades, Fecha_primera_anualidad, Cantidad_ultima_anualidad, Cantidad_aunalidades_pagadas, Numero_mensualidades, Cantidad_mensualidad, Fecha_primera_mensualidad, Cantidad_mensualidades_pagadas, Fecha_nacimiento, Numero_ine, Lugar_origen, Nombre_ref_1, Tel_Ref_1, Nombre_ref_2, Tel_Ref_2, Nombre_ref_3, Tel_Ref_3, Fecha_insercion`;
                        datos.shift();
                        datos.forEach(d=>{
                            d.shift();
                            let valores_insert = ``;
                            let cont = 2;
                            d.forEach(dd=>{
                                //cont == 9 || 
                                if(cont == 12 || cont == 26|| cont == 30 || cont == 35 || cont == 37 ){
                                    //console.log('cont',dd);
                                    valores_insert += (dd != '-')?`'${moment(this.ExcelDateToJSDate(dd)).format("YYYY-MM-DD")}',`:`'-',`;
                                }else{
                                    valores_insert += (dd != '-')?`'${dd}',`:`'-',`;
                                }
                                cont++;
                            });
                            valores_insert += `'${moment().format('YYYY-MM-DD HH:mm:ss')}'`;
                            camposProcesados.push(
                                this._ordenarQuery(conexion,`INSERT INTO Datos_carga(${campos_insert}) VALUES(${valores_insert})`).then((res)=>{
//                                mysql.ejecutar(`INSERT INTO Datos_carga(${campos_insert}) VALUES(${valores_insert})`).then((res)=>{
                                    return {Procesado: true, Dat: d};
                                }).catch(err => { console.log('err',err); return {Procesado: false, Dat: d}})
                            );
//                            console.log('valores_insert',valores_insert);
                        });
                        Promise.all(camposProcesados).then(resultados=>{
//                            console.log('resultados',resultados);
                            return resO(resultados);
                        }).catch(err=>{
                            return rejE(err);
                        })
                    });
                }
            }).then(guardados=>{
                return this._ordenarQuery(conexion,`SELECT * FROM Datos_carga`);
                //return mysql.ejecutar(`SELECT * FROM Datos_carga`);
            }).then(reso=>{
                conexion.end();
                return resolve({Datos:reso});
            }).catch(err=>{ console.log('err',err);return reject({Error:err});});
        });
    }
    _leerExcel(fullPath){
        return new Promise((resolve, reject) => {
            try {
                let datos = xlsx.parse(fullPath);
                let datosOrdenados = [];
                datos[0].data.forEach((item, index) => {
                    datosOrdenados.push(item);
                });
                return resolve(datosOrdenados);
            }catch(error){
                return reject(`Error al leer el archivo ${error}`);
            }
        })
    }
    ExcelDateToJSDate(serial, val) {
        let valorConstante =  (val)?val:25568;
        var utc_days  = Math.floor(serial - (valorConstante));
        var utc_value = utc_days * 86400;                              
        var date_info = new Date(utc_value * 1000);
     
        var fractional_day = serial - Math.floor(serial) + 0.0000001;
     
        var total_seconds = Math.floor(86400 * fractional_day);
     
        var seconds = total_seconds % 60;
     
        total_seconds -= seconds;
     
        var hours = Math.floor(total_seconds / (60 * 60));
        var minutes = Math.floor(total_seconds / 60) % 60;
     
        return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
     }
     Enviar_correo(datos){
        return new Promise((resolve, reject) => {
            const nodemailer = require('nodemailer');
            let usr = 'luisfernandocordova.24@gmail.com';
            let pas = `Sakaunperikin24*`;
            nodemailer.createTestAccount((err, account) => {
                var transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: usr, pass: pas} });
                //`campestreretiro@gmail.com, bocho_sup@hotmail.com`
                let mailOptions = { from: usr ,to: `bocho_sup@hotmail.com`, subject: `${datos.Asunto}`, html: `${datos.Contenido}` };
                if(datos.Adjunto){
                    let ext = `${datos.Adjunto.split(',')[0].split(';')[0].split('/')[1]}`;
                    let cont = new Buffer(datos.Adjunto.split(',')[1], "base64");
                    mailOptions.attachments= [{'filename': `Adjunto.${ext}`, 'content': cont}] 
                }
                transporter.sendMail(mailOptions, (error, info) => {
                    let respuesta = {Procesado: false, Operacion: 'Fallo el envio de correo', Tipo: 'error',Error: error};
                    if (error) { return reject(respuesta); }
                    return resolve({Procesado: true, Operacion: 'Correo Enviado Correctamente', Tipo: 'success'});
                    //console.log('Message sent: %s', info.messageId); console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                });
            });
        });
     }
     Obtener_ventas_empleado(datosEmpleado){
         console.log('dat',datosEmpleado);
        return new Promise((resolve, reject)=>{
            let dia = moment().day();
            //let dias_numero = {Domingo: 1,Lunes: 2, Martes:3, Miercoles: 4, Jueves: 5, Viernes:6, Sabado:0};
            console.log('dia',dia);
            let condiciones = `IdUsuario = ${datosEmpleado.IdUsuario} LIMIT 5`;
            mysql.ejecutar(`SELECT * From Ventas WHERE ${condiciones}`).then((res)=>{
                return resolve({Datos:res});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
     }
     obtener_datos_carga(){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar(`SELECT * From Datos_carga`).then((res)=>{
                return resolve({Datos:res});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
     }
     generar_mantenimientos_automticos(cuerpo){
         let clientes;
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * from Clientes Where Activo = 1').then((res)=>{
                res.forEach(r=>{ let numCliente = ``; for(let i = 1;i<=(4 - `${r.IdCliente}`.length);i++ ){ numCliente += `0`; }r.Codigo += `${numCliente}${r.IdCliente}`; });
                clientes = res;
                return  mysql.ejecutar(`SELECT * From Adeudos_mantenimientos ORDER BY Fecha Desc ;`);
            }).then((mantenimientos)=>{
                    let clientesAfectados = [];
                    mantenimientos.forEach(m=>{
                        //console.log('r',r.IdCliente);
                        let existe = clientesAfectados.find(ob=>ob.IdCliente == m.IdCliente);
                        //console.log('existe',existe);
                        if(!existe){
                            let cli_ = clientes.find(c=>c.IdCliente ==  m.IdCliente);
                            if(cli_){
                                clientesAfectados.push(cli_);
                            }
                        }
                    });
                    return this._procesarMantenimientosAutomaticos(mantenimientos,clientesAfectados);

            }).then(final=>{
                console.log('termino',final);
                return resolve({Procesado:true});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        }); 
     }
     _procesarMantenimientosAutomaticos(mantenimientos,clientesAfectados){
        var mysql = require('mysql');
        var conexion = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : 'Sakaunperikin24*',
            database : 'ElRetiro',
            acquireTimeout: 100000000000000000
          });
        conexion.connect();
        return new Promise((resO, rejE)=>{
            if(!mantenimientos[0]){ return resO({Procesado:true, Mantenimiento:mantenimientos, Motivo: 'Todas al dia'})}
            let promesasPendientes = [];
            clientesAfectados.forEach(c=>{
                let man =  mantenimientos.filter(ma=>ma.IdCliente ==  c.IdCliente);
                let u_mant = man[0];
                man.forEach(m=>{
                    if(moment(m.Fecha.split('T')[0]) >  moment(u_mant.Fecha.split('T')[0]) ){
                        u_mant = m;
                    }
                });
                let diferencia = this._diferenciaMesesFechas(u_mant.Fecha, moment());
                if(diferencia >= c.Periodo_mantenimiento){
                    let partidas_man = (diferencia/c.Periodo_mantenimiento);
                    let saldo_man = c.Saldo_mantenimiento; 
                    for(let s=1;s<= partidas_man;s++){
                        let fch = moment(u_mant.Fecha).add(s*c.Periodo_mantenimiento,'month').format('YYYY-MM-DD');
                        let campos = `IdCliente, Concepto, Importe, Fecha, Fecha_modificacion`;
                        let valores = `${c.IdCliente},'Mantenimiento - ${fch}',${c.Monto_mantenimiento},'${fch}','${moment().format('YYYY-MM-DD HH:mm:ss')}'`;
                        promesasPendientes.push( this._ordenarQuery(conexion,`INSERT INTO Adeudos_mantenimientos (${campos}) VALUES (${valores});`));
                        saldo_man += c.Monto_mantenimiento;
                    }
                    promesasPendientes.push(this._ordenarQuery(conexion,`UPDATE Clientes SET Saldo_mantenimiento = ${saldo_man} WHERE IdCliente = ${c.IdCliente};`));
                }
            });
            if(!promesasPendientes[0]){ return resO({Procesado:true, Mantenimiento:mantenimientos, Motivo: 'Todas al dia'})}
            promesasPendientes.reduce((PP, current) => {
                return PP.then(results => {
                return current.then(currentResult => {
                    return Promise.resolve({Procesado:true,Res:currentResult});
                }).catch(e => {
                    return Promise.resolve({Procesado:false,Res:e});
                })
                })
            }, Promise.resolve([])).then(r => {
                conexion.end();
                return resO(r);
            }).catch(err=>{console.log('err',err); return rejE(err); });
        });
     }
     verificar_mensualidades_morosas(cuerpo){
         let clientes;
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * from Clientes Where Activo = 1').then((res)=>{
                res.forEach(r=>{ let numCliente = ``; for(let i = 1;i<=(4 - `${r.IdCliente}`.length);i++ ){ numCliente += `0`; }r.Codigo += `${numCliente}${r.IdCliente}`; });
                clientes = res;
                return  mysql.ejecutar(`SELECT * From Adeudos_clientes  WHERE Pagado = 0 AND Fecha <= '${moment().format('YYYY-MM-DD')}';`);
            }).then((res)=>{
                let vencidas = [];
                res.forEach(r=>{
                    let diferenciaMeses =  this._diferenciaMesesFechas(r.Fecha, moment());
                    let diferenciaDias
                    if(r.Fecha_calculo_moroso != null){
                        diferenciaDias = this._diferenciaDiasFechas(r.Fecha_calculo_moroso, moment());                        
                    }else{
                        diferenciaDias = this._diferenciaDiasFechas(r.Fecha, moment())-30;
                    }
                    if((diferenciaMeses > 0 && diferenciaDias > 0) || (r.Fecha_calculo_moroso != null && diferenciaDias > 0) ){
                        vencidas.push({Mensualidad:r,DiasVencidos:diferenciaDias ,  Monto: (r.Importe*.016)*diferenciaDias});
                    }
                });
                return this._procesarMensualidadesVencidas(vencidas,clientes);
            }).then(final=>{
                console.log('termino',final);
                return resolve({Procesado:true});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });        
     }
     _procesarMensualidadesVencidas(mensualidades, clientes){
        var mysql = require('mysql');
        var conexion = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : 'Sakaunperikin24*',
            database : 'ElRetiro',
            acquireTimeout: 100000000000000000
          });
        conexion.connect();
        return new Promise((resO, rejE)=>{
            console.log('mensualidades',mensualidades);
            if(!mensualidades[0]){ return resO({Procesado:true, Mensualidades:mensualidades, Motivo: 'Todas al dia'})}
            let  promesasVencidas= [];
//            let saldoInicialMoroso = clientes.Saldo_moroso;
            let clientesAfectados = [];
            mensualidades.forEach(m=>{
                let existe = clientesAfectados.find(ob=>ob.IdCliente == m.Mensualidad.IdCliente);
                if(!existe){
                    let cli_ = clientes.find(c=>c.IdCliente ==  m.Mensualidad.IdCliente);
                    clientesAfectados.push(cli_);
                }
                //insert_anualidades.push(this._ordenarQuery(conexion,`INSERT INTO Adeudos_anualidades (${campos}) VALUES (${valores});`));
            });
            clientesAfectados.forEach(ob=>{
                let saldoInicialMoroso = ob.Saldo_moroso;
                let mens = mensualidades.filter(me=>me.Mensualidad.IdCliente == ob.IdCliente);
                mens.forEach(m=>{
                    saldoInicialMoroso += m.Monto;
                    promesasVencidas.push(this._ordenarQuery(conexion,`UPDATE Adeudos_clientes SET Fecha_calculo_moroso = '${moment().format('YYYY-MM-DD')}' WHERE IdAdeudo = ${m.Mensualidad.IdAdeudo};`));
                });
                promesasVencidas.push(this._ordenarQuery(conexion,`UPDATE Clientes SET Saldo_moroso = ${saldoInicialMoroso} WHERE IdCliente = ${ob.IdCliente};`));
            });
            promesasVencidas.reduce((PV, current) => {
                return PV.then(results => {
                  return current.then(currentResult => {
                    return Promise.resolve({Procesado:true,Res:currentResult});
                  }).catch(e => {
                    return Promise.resolve({Procesado:false,Res:e});
                  })
                })
            }, Promise.resolve([])).then(r => {
                conexion.end();
                return resO(r);
            }).catch(err=>{console.log('err',err); return rejE(err);});
        });
     }
     obtener_mantenimiento_calculado(data){
        return new Promise((resolve, reject)=>{
            let mantenimiento = [];
            if(data.Saldo_mantenimiento > 0){
                mantenimiento = this._calcularEnBaseAMonto(data);
            }else if(data.Fecha_mantenimiento){
                mantenimiento = this._calcularEnBaseAFecha(data);
            }else{
                mantenimiento = [];
            }
            console.log('mant',mantenimiento);
            return resolve(mantenimiento);
        });
     }
     _calcularEnBaseAMonto(datos){
        console.log('datos fecha',datos);
        let MantenimientoTemporadas = {
            "2002":[450,450],"2003":[450,450],"2004":[450,450],"2005":[450,450],
            "2006":[450,450],"2007":[900,900],"2008":[900,900],"2009":[900,1200],
            "2010":[1200,1200],"2011":[1200,1200],"2012":[1500,1500],"2013":[1500,1500],
            "2014":[1500,1500],"2015":[1500,1500],"2016":[1500,1500],"2017":[1500,1500],
            "2018":[datos.Importe_mantenimiento,datos.Importe_mantenimiento],
            "2019":[datos.Importe_mantenimiento,datos.Importe_mantenimiento]
        };
        // let MantenimientoTemporadas = {
        //     "2002":[1500,1500],"2003":[1500,1500],"2004":[1500,1500],"2005":[1500,1500],
        //     "2006":[1500,1500],"2007":[1500,1500],"2008":[1500,1500],"2009":[1500,1500],
        //     "2010":[1500,1500],"2011":[1500,1500],"2012":[1500,1500],"2013":[1500,1500],
        //     "2014":[1500,1500],"2015":[1500,1500],"2016":[1500,1500],"2017":[1800,1800],
        //     "2018":[datos.Importe_mantenimiento,datos.Importe_mantenimiento],
        //     "2019":[datos.Importe_mantenimiento,datos.Importe_mantenimiento]
        // };
        let sigue = true;
        let montoInicial = datos.Saldo_mantenimiento;
        let mantenimientos = [];
        let quitar = 0;
        let saldo_p ;
        while(sigue){
            let fecha =  moment(datos.Fecha_mantenimiento).subtract(quitar,'month').format('YYYY-MM-DD');
            // console.log('fecha',fecha);
            // console.log('lugar',this._mesesLugar(fecha));
            let monto = (MantenimientoTemporadas[`${moment(fecha).format('YYYY')}`])?MantenimientoTemporadas[`${moment(fecha).format('YYYY')}`][this._mesesLugar(fecha)]:450;
            // console.log('monto',monto);
//            mantenimientos.push({Fecha:fecha, Monto: monto });
            saldo_p = montoInicial;
            montoInicial -=monto;
            if(montoInicial >= 0 ){
                mantenimientos.push({"Fecha Mantenimiento":fecha, "Monto Mantenimiento": monto , "Restante": montoInicial });
            }
            if(montoInicial <= 0 ){
                quitar += datos.Periodo_cobro;
                sigue = false;
            }            
        }
        return {mantenimientos, Saldo: saldo_p};
     }
     _calcularEnBaseAFecha(datos){
        console.log('datos fecha',datos);
        let MantenimientoTemporadas = {
            "2002":[450,450],"2003":[450,450],"2004":[450,450],"2005":[450,450],
            "2006":[450,450],"2007":[900,900],"2008":[900,900],"2009":[900,1200],
            "2010":[1200,1200],"2011":[1200,1200],"2012":[1500,1500],"2013":[1500,1500],
            "2014":[1500,1500],"2015":[1500,1500],"2016":[1500,1500],"2017":[1500,1500],
            "2018":[datos.Importe_mantenimiento,datos.Importe_mantenimiento],
            "2019":[datos.Importe_mantenimiento,datos.Importe_mantenimiento]
        };
        // let MantenimientoTemporadas = {
        //     "2002":[1500,1500],"2003":[1500,1500],"2004":[1500,1500],"2005":[1500,1500],
        //     "2006":[1500,1500],"2007":[1500,1500],"2008":[1500,1500],"2009":[1500,1500],
        //     "2010":[1500,1500],"2011":[1500,1500],"2012":[1500,1500],"2013":[1500,1500],
        //     "2014":[1500,1500],"2015":[1500,1500],"2016":[1500,1500],"2017":[1800,1800],
        //     "2018":[datos.Importe_mantenimiento,datos.Importe_mantenimiento],
        //     "2019":[datos.Importe_mantenimiento,datos.Importe_mantenimiento]
        // };
        let diferencia_meses =  moment().diff(moment(datos.Fecha_adeudo_mantenimiento), 'months');
        let mantenimientos = [];
        let saldoMan = 0;
//        console.log('diferencia',diferencia_meses);
        if(diferencia_meses >= datos.Periodo_cobro){
            for( let s=0;s<=diferencia_meses;){
                let fecha = moment(datos.Fecha_adeudo_mantenimiento).add(s,'month').format('YYYY-MM-DD');
//                console.log('fecha',fecha);
                let monto = (MantenimientoTemporadas[`${moment(fecha).format('YYYY')}`])?MantenimientoTemporadas[`${moment(fecha).format('YYYY')}`][this._mesesLugar(fecha)]:datos.Importe_mantenimiento;
//                console.log('monto',monto);
                saldoMan += monto;
                mantenimientos.push({"Fecha Mantenimiento":fecha, "Monto Mantenimiento": monto , "Acumulado": saldoMan });
                s +=datos.Periodo_cobro;
            }
            
        }else{
            mantenimientos.push({"Fecha Mantenimiento":datos.Fecha_adeudo_mantenimiento, "Monto Mantenimiento": datos.Importe_mantenimiento , "Acumulado":  datos.Importe_mantenimiento  });
        }
        console.log('mantenimientos',mantenimientos);
        return {mantenimientos, Saldo: saldoMan};
     }
     _mesesLugar(fecha){
         switch(moment(fecha).format('MM')){
            case '01':{ return 0; }case '02':{ return 0; } case '03':{ return 0; } case '04':{ return 0; } case '05':{ return 0; }case '06':{ return 0; }
            case '07':{ return 1; }case '08':{ return 1; } case '09':{ return 1; } case '10':{ return 1; } case '11':{ return 1; }case '12':{ return 1; }
            default: {return 0;}
         }
     }
     _diferenciaMesesFechas(fecha1, fecha2){
         let fch1 = moment(fecha1); 
         let fch2 = moment(fecha2);
        return fch2.diff(fch1, 'months');
     }
     _diferenciaDiasFechas(fecha1, fecha2){
        let fch1 = moment(fecha1); 
        let fch2 = moment(fecha2);
       return fch2.diff(fch1, 'days');
    }
     _ordenarQuery(conexion, query){
        return new Promise((resolve, reject) => {
            console.log('query',query);
            conexion.query(query, (error, results)=>{
                if(results){
                    let datosOrdenados = [];
                    if(results.length > 0){
                        let datosOrenados =  [];
                        results.forEach(r=>{
                            datosOrenados.push(r);
                        })
                        return resolve(JSON.parse(JSON.stringify(datosOrenados)));
                    }else{
                        return resolve(false);
                    }
                }else if(error){
                    return reject(error);
                }else{
                    return reject({errorMessage: 'Error en la consulta'});
                }
            });
        });
     }
}