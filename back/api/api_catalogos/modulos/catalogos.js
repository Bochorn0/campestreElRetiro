/*const mssql = require("mssql");
const Excel = require('exceljs');
const xlsx =  require('node-xlsx');
const unstream =  require('unstream');
let moment = require('moment');
var fs = require("fs-extra");
const _ =  require("lodash");
let funcionesSQLServer = require("../../../shared/modules/funcionesSQLServer");
let sqlserver_odbc = require('../../../shared/db/sqlserver_odbc');
let sqlserver_datos001 = require('../../../shared/db/sqlserver_datos001');
let sqlserver_ct_integral = require('../../../shared/db/sqlserver_ct_integral');
let empleadoModel =  require('../../api_capital_humano/models/empleadoModel');
*/

const mysql =  require("../../../shared/db/mysql_driver");
const moment =  require("moment");
var fs = require("fs-extra");
var Excel = require('exceljs');
var _ = require('lodash');
module.exports = class Catalogos {
    Base(solicitud){
        return new Promise((resolve, reject)=>{
            return resolve({status: `ok`});
        })
    }
    Catalogo_clientes(solicitud){
        return new Promise((resolve, reject)=>{
            // as cli JOIN Clientes_terrenos as cter on cli.IdCliente = cter.IdCliente JOIN Terrenos as ter on ter.IdTerreno = cter.IdTerreno;
            mysql.ejecutar('SELECT * from Clientes Where Activo = 1').then((res)=>{
                //let datosOrdenados =  this._ordenarClientesTerrenos(res);
                if(res[0]){
                    res.forEach(r=>{
                        let numCliente = ``;
                        for(let i = 1;i<= (4 - `${r.IdCliente}`.length);i++ ){
                            numCliente += `0`; 
                        }
                        r.Codigo += `${numCliente}${r.IdCliente}`; 
                        r.Saldo_total = r.Saldo_credito + r.Saldo_adeudo + r.Saldo_mantenimiento + r.Saldo_agua + r.Saldo_certificado +r.Saldo_anualidad;
                    })
                    return resolve({Data: res, error: false});
                }else{
                    return resolve({Data: [], error: false});
                }
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_relaciones(solicitud){
        return new Promise((resolve, reject)=>{
            // as cli JOIN Clientes_terrenos as cter on cli.IdCliente = cter.IdCliente JOIN Terrenos as ter on ter.IdTerreno = cter.IdTerreno;
            mysql.ejecutar('SELECT * from Clientes_terrenos as cter JOIN Terrenos as ter on ter.IdTerreno = cter.IdTerreno').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_gastos(solicitud){
        let categoriasTodas = {};
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Catalogo_gastos WHERE IdPadre = 0').then((padres)=>{
                categoriasTodas.Categorias = (padres)?padres:[];
                return mysql.ejecutar('SELECT cg1.IdCategoria,cg1.Categoria as Categoria,cg2.IdCategoria as IdSubcategoria,cg2.Categoria as Subcategoria from Catalogo_gastos as cg1 JOIN Catalogo_gastos as cg2  on cg2.IdPadre = cg1.IdCategoria order by cg1.Categoria');
            }).then(hijas=>{
                categoriasTodas.Relacionadas = (hijas)?hijas:[];
                return resolve({Data:categoriasTodas,error:false});
//                return resolve({Data: this._ordenarDatosCategoriasGastos(categoriasTodas), error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    _ordenarDatosCategoriasGastos(datos){
        let datosOrdenados = {categorias:[],subcategorias:[],TodasPadres :datos.TodasPadres,TodasHijas:datos.Relacionadas};
        if(datos.Relacionadas[0]){
            datos.Relacionadas.forEach(d=>{
                let existeCat =  datosOrdenados.categorias.find(ob=>ob.IdCategoria == d.IdCategoria);
                if(!existeCat){
                    datosOrdenados.categorias.push({IdCategoria: d.IdCategoria, Categoria: d.Categoria});
                }
                let existeSub =  datosOrdenados.subcategorias.find(ob=>ob.IdSubcategoria == d.IdSubcategoria);
                if(!existeSub){
                    datosOrdenados.subcategorias.push({IdSubcategoria: d.IdSubcategoria, Subcategoria: d.Subcategoria});
                }
            });
        }
        return datosOrdenados;
    }
    _ordenarRelacionesTerrenos(datos){
        if(datos){
            let datosOrdenados;
            datos.forEach(dat=>{
                datosOrdenados.push({IdCliente:dat.IdCliente,IdTerreno:dat.IdTerreno,Parcela:dat.parcela,
                Etapa:dat.etapa,Lote:dat.Lote,Pertenece:dat.Pertenece,Superficie:dat.Superficie});
            });
            return datosOrdenados;
        }
        return false;
    }
    _ordenarClientesTerrenos(datos){
        if(datos){
            let datosTerreno = [];
            let datosCliente = [];
            datos.forEach(dat=>{
                let cliente = dat.IdCliente;
                let existe =  datosCliente.filter(ob=>ob.IdCliente =  dat.IdCliente);
                let terrenos =  datos.filter(ob=>ob.IdCliente =  dat.IdCliente);
                if(!existe){
                    //Push datos cliente
                    datosCliente.push({IdCliente:dat.IdCliente,IdArchivo_ife:dat.IdArchivo_ife,IdArchivo_comprobante:dat.IdArchivo_comprobante,
                        Nombre:dat.Nombre,Codigo:dat.Codigo,Correo:dat.Correo,Telefono:dat.Telefono,Direccion:dat.Direccion,Enganche:dat.Enganche,
                        Saldo_adeudo:dat.Saldo_adeudo,Saldo_credito:dat.Saldo_credito,Credito_original:dat.Credito_original,Num_ife:dat.Num_ife,
                        Referencia_1:dat.Referencia_1,Referencia_2:dat.Referencia_2,Referencia_3:dat.Referencia_3,Fecha_nacimiento:dat.Fecha_nacimiento,
                        Ultimo_movimiento:dat.Ultimo_movimiento,Activo:dat.Activo,Terrenos: terrenos});
                }
/*                datosTerreno.push({IdRelacion:dat.IdRelacion,IdUsuario:dat.IdUsuario,IdTerreno:dat.IdTerreno,IdCotizacion:dat.IdCotizacion,
                Parcela:dat.parcela,Etapa:dat.etapa,Lote:dat.Lote,Pertenece:dat.Pertenece,Superficie:dat.Superficie});*/
                //Datos Cliente
            });
        return datosCliente;
        }
    }
    actualizar_datos_puestos(datos){
        return new Promise((resolve, reject)=>{
            let Promesas = [];
            datos.forEach(d=>{
                let update = ` SET `;
                update += (d.Nombre_perfil)?` Nombre_perfil = '${d.Nombre_perfil}',`:``;
                update += (d.Pagina || d.Pagina == 0)?` Pagina = ${d.Pagina},`:``;
                update += (d.Ventas || d.Ventas == 0)?` Ventas = ${d.Ventas},`:``;
                update += (d.Cobranza) || d.Cobranza == 0?` Cobranza = ${d.Cobranza},`:``;
                update += (d.Finanzas || d.Finanzas == 0)?` Finanzas = ${d.Finanzas},`:``;
                update += (d.Catalogos || d.Catalogos == 0)?` Catalogos = ${d.Catalogos},`:``;
                update += (d.Gastos || d.Gastos == 0)?` Gastos = ${d.Gastos},`:``;
                update += (d.Empleados || d.Empleados == 0)?` Empleados = ${d.Empleados},`:``;
                update += (d.Usuarios || d.Usuarios == 0)?` Usuarios = ${d.Usuarios},`:``;
                update += (d.AppVentas || d.AppVentas == 0)?` AppVentas = ${d.AppVentas},`:``;
                update = update.slice(0,-1);
                Promesas.push(mysql.ejecutar(`UPDATE Perfiles ${update} WHERE IdPerfil = ${d.IdPerfil};`));
            });
            return Promise.all(Promesas).then((res)=>{
                return resolve({Procesado: true, Operacion: 'Los Perfiles fueron actualizados exitosamente ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Catalogo_empleados(solicitud){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Empleados;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_ventas(solicitud){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Ventas;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_tipo_ventas(solicitud){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Catalogo_tipo_movimientos;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_tipo_gastos(solicitud){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Catalogo_tipo_gastos;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_empleados(solicitud){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Empleados;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_contratos(solicitud){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Contratos;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_tipos_documentos(){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Documentos_tipos;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_documentos(solicitud){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Documentos_apartados;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_usuarios(solicitud){
        return new Promise((resolve, reject)=>{
            let JOIN = `JOIN Perfiles as p  on p.IdPerfil = u.IdPerfil`;
            mysql.ejecutar(`SELECT * FROM Usuarios as u ${JOIN} ;`).then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_puestos(solicitud){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Perfiles;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    
    Catalogo_cotizaciones(solicitud){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Cotizaciones;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_cuentas(solicitud){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Cuentas_especiales;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    obtener_prospectos_ventas(datos){
        return new Promise((resolve, reject)=>{
            let condiciones = ' 1=1 ';
            condiciones += (datos.IdUsuario)? ` AND IdUsuario = ${datos.IdUsuario} `:' ';
            mysql.ejecutar(`SELECT * FROM Prospectos_ventas WHERE ${condiciones}; `).then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    actualizar_prospectos_ventas(datos){
        return new Promise((resolve, reject)=>{
            let update = ` Fecha_modificacion = '${moment().format('YYYY-MM-DD HH:mm:ss')}' `;
            update += (datos.Comentarios)?`, Comentarios = '${datos.Comentarios}'`:``;
            update += (datos.Resolucion)?`, Resolucion = '${datos.Resolucion}'`:``;
            update += (datos.Informacion)?`, Informacion = true `:``;
            update += (datos.Cotizacion)?`, Cotizacion = true `:``;
            update += (datos.Apartado)?`, Apartado = true `:``;
            update += (datos.CitaNueva)?`, Cita = '${moment(`${datos.CitaNueva}`).format('YYYY-MM-DD HH:mm:ss')}',`:``;
            update += (datos.Activo || datos.Activo == 0)?` Activo = ${datos.Activo},`:``;
            update = update.slice(0,-1);
            mysql.ejecutar(`UPDATE Prospectos_ventas SET ${update} WHERE IdProspecto = ${datos.IdProspecto} ; `).then((res)=>{
                return resolve({Procesado: true, Operacion: 'La solicitud del prospecto fue actualizada exitosamente ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });        
    }
    guardar_prospectos_ventas(datos){
        return new Promise((resolve, reject)=>{
            let today = moment().format('YYYY-MM-DD HH:mm:ss');
            let campos = `IdUsuario, Nombre_prospecto, Descripcion, Telefono,Correo, Fecha, Fecha_modificacion`;
            let valores = `${datos.IdUsuario},'${datos.Nombre_prospecto}','${datos.Descripcion}','${datos.Telefono}','${datos.Correo}','${today}','${today}'`;
            mysql.ejecutar(`INSERT INTO Prospectos_ventas (${campos}) VALUES (${valores})`).then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    borrar_prospectos_ventas(datos){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar(`DELETE FROM Prospectos_ventas WHERE IdProspecto = ${datos.IdProspecto}`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'El prospecto fue eliminada correctamente', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Guardar_nueva_cuenta_especial(datosCuenta){
        return new Promise((resolve, reject)=>{
            let campos = `Nombre, Numero, Saldo, Activa`;
            let valores = `'${datosCuenta.Nombre}','${datosCuenta.Numero}',${datosCuenta.Saldo},1`;
            mysql.ejecutar(`INSERT INTO Cuentas_especiales (${campos}) VALUES (${valores})`).then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Actualizar_cuenta_especial(datos){
        return new Promise((resolve, reject)=>{           
            console.log('datos',datos); 
            let update = ` `;
            update += (datos.Activa || datos.Activa == '0')?` Activa = ${datos.Activa},`:``;
            update += (datos.Nombre)?` Nombre = '${datos.Nombre}',`:``;
            update += (datos.Saldo)?` Saldo = ${datos.Saldo},`:``;
            update += (datos.Numero)?` Numero = '${datos.Numero}',`:``;
            update = update.slice(0,-1);
            console.log('query',`UPDATE Cuentas_especiales ${update} WHERE IdCuenta = ${datos.IdCuenta};`);
            mysql.ejecutar(`UPDATE Cuentas_especiales SET ${update} WHERE IdCuenta  = ${datos.IdCuenta};`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'Los Datos de la cuenta fueron cambiados exitosamente ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Actualizar_datos_categorias(datos){
        return new Promise((resolve, reject)=>{
            let update = (datos.Categoria)?`SET`:``;
            update += (datos.Categoria)?` Categoria = '${datos.Categoria}',`:``;
            update += (datos.IdPadre)?` IdPadre = ${datos.IdPadre},`:``;
            update = update.slice(0,-1);
            mysql.ejecutar(`UPDATE Catalogo_gastos ${update} WHERE IdCategoria= ${datos.IdCategoria};`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'Los Datos de la categoria fueron cambiados exitosamente ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Guardar_nueva_categoria(datos){
        return new Promise((resolve, reject)=>{
            let campos = `Categoria,IdPadre`;
            let valores = `'${datos.Categoria}',${(datos.IdPadre)?datos.IdPadre:0}`;
            mysql.ejecutar(`INSERT INTO Catalogo_gastos(${campos}) VALUES (${valores});`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'Los datos han sido agregados exitosamente ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Borrar_categoria(datos){
        return new Promise((resolve, reject)=>{
            let idCategoria = datos.IdCategoria;
            mysql.ejecutar(`DELETE FROM Catalogo_gastos WHERE IdCategoria = ${idCategoria}`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'La categoria fue eliminada correctamente', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Borrar_cuenta_especial(Id){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar(`DELETE FROM Cuentas_especiales WHERE IdCuenta= ${Id};`).then((res)=>{
                return resolve({Eliminado: true});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Obtener_terreno_por_id(Id){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar(`SELECT * FROM Terrenos WHERE IdTerreno = ${Id} LIMIt 1;`).then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Obtener_terrenos(datos){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar(`SELECT * FROM Terrenos;`).then((res)=>{
                if(res[0]){
                    res.forEach(r=>{
                        r.Latitud = (r.Latitud)?parseFloat(r.Latitud):0
                        r.Longitud = (r.Longitud)?parseFloat(r.Longitud):0
                    });
                }
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Obtener_datos_contrato(datos){
        return new Promise((resolve, reject)=>{
            if(datos.datosTerreno.IdTerreno){
                let compPath = `${datos.datosCliente.Carpeta}`;
                let compNombre =  `Contrato-Lote_${datos.datosTerreno.Lote}-Etapa_${datos.datosTerreno.Etapa}.html`;

                // let compPath = `${process.env.Shared}uploads/${datos.datosCliente.Nombre}/`;
                // let compNombre =  `Contrato-parcela_${datos.datosTerreno.parcela}-lote_${datos.datosTerreno.lote}-etapa_${datos.datosTerreno.etapa}.html`;
                let file = `${compPath}${compNombre}`;
                if(fs.existsSync(file)){
                    fs.readFile(file,'utf8' ,(err, data) => {
                        if(err) {
                          return resolve({Data: false, err });
                        } else {
                          return resolve({Data: data, err });
                        }
                      });
                }else{
                    return resolve({Data: this._contenidoContratoGenerico(datos) });
                }
            }else{
                return reject({Data: false, err });                    
            }
        })
    }
    Actualizar_cliente(datos){
        return new Promise((resolve, reject)=>{
            let datos_update = `Nombre = '${datos.Nombre}', Correo = '${datos.Correo}', Num_ife = '${datos.Num_ife}', Origen= '${datos.Origen}', Telefono = '${datos.Telefono}', Fecha_nacimiento = '${datos.Fecha_nacimiento}', Direccion =  '${datos.Direccion}' `;
            let condiciones = `IdCliente = ${datos.IdCliente}`;
            mysql.ejecutar(`UPDATE Clientes SET ${datos_update} WHERE ${condiciones};`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'Los Datos del Cliente fueron cambiados exitosamente ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err }); });
        })
    }
    Actualizar_mantenimiento(datos){
        return new Promise((resolve, reject)=>{
            let datos_update = `SET Dia_mantenimiento = ${datos.Dia} , Importe_mantenimiento = ${datos.Importe}`;
            let condiciones = `IdTerreno = ${datos.IdTerreno} AND IdCliente = ${datos.IdCliente}`;
            mysql.ejecutar(`UPDATE Clientes_terrenos ${datos_update} WHERE ${condiciones};`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'Los Datos del mantenimiento fueron cambiados exitosamente ', Tipo: 'success'});
            }).catch(err => {Data: false, err });
        })
    }
    Guardar_tipo_documento(datos){
        return new Promise((resolve, reject)=>{
            let today =  moment(new Date()).format('YYYY-MM-DD');
            let campos =  `Nombre,Fecha_insercion`;
            let valores = `'${datos.Nombre}','${today}'`;
            mysql.ejecutar(`INSERT INTO Documentos_tipos (${campos}) VALUES (${valores});`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'El nuevo documento fue guardado  correctamente', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Guardar_nuevo_empleado(datos){
        return new Promise((resolve, reject)=>{
            let today =  moment(new Date()).format('YYYY-MM-DD');
            let campos =  `Nombre,Correo,Sueldo,Fecha_nacimiento,Fecha_registro,Puesto`;
            let valores = `'${datos.Nombre}','${datos.Correo}','${datos.Sueldo}','${datos.Fecha_nacimiento}','${today}','${datos.Puesto}'`;
            mysql.ejecutar(`INSERT INTO Empleados (${campos}) VALUES (${valores});`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'El nuevo empleado fue guardado correctamente', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Guardar_nomina_empleado(datos){
        return new Promise((resolve, reject)=>{
            let today =  moment().format('YYYY-MM-DD HH:mm:ss');
            let campos =  `IdEmpleado, IdUsuario, Nombre_empleado, Fecha_nomina, Horas_laboradas, Comisiones, Sueldo, Bonos, Descuentos, Descuentos_totales, Total, Fecha_insercion`;
            let valores = `${datos.Nomina.IdEmpleado},${datos.Usuario.Datos.IdUsuario},'${datos.Nomina.Nombre}','${moment().format('YYYY-MM-DD')}',${datos.Nomina.Horas},${datos.Nomina.Comisiones}, ${datos.Nomina.Sueldo},${datos.Nomina.Bonos},${datos.Nomina.Descuentos},${datos.Nomina.Descuentos_totales},${datos.Nomina.Total},'${today}'`;
            mysql.ejecutar(`INSERT INTO Nominas (${campos}) VALUES (${valores});`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'La Nomina fue guardada correctamente ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Desasignar_cotizacion(obj){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar(`UPDATE Cotizaciones Set Activa = 0 WHERE IdCotizacion = ${obj.IdCotizacion};`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'La cotizacion fue desasignada correctamente', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Activar_cotizacion(obj){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar(`UPDATE Cotizaciones Set Activa = 1 WHERE IdCotizacion = ${obj.IdCotizacion};`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'La cotizacion fue activada correctamente', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    subir_excel_terrenos(datos_archivo){
        return new Promise((resolve, reject)=>{
            let datos = new Buffer(datos_archivo.file, "base64");
            let path = `${process.env.Shared}uploads/Catalogos/`;
            let fileName = `Catalogo_terrenos${moment().format('YYYY-MM-DD_HH:mm:ss')}.xlsx`;
            return this._guardarArchivoDirectorio(path,fileName,datos,2097152,'base64').then(fullPath=>{
                //LEE EL ARCHIVO DE EXCEL Y LO TRANSFORMA EN UN OBJETO
                let workbook = new Excel.Workbook();
                return workbook.xlsx.readFile(fullPath);
            }).then((datosExcel) => {
                //ORGANIZA LOS DATOS DEL EXCEL PARA TENER DATOS ORDENADOS POR CABECERA
                let datosHoja1 = datosExcel.getWorksheet(1);
                return this._organizarDatosTerrenos(datosHoja1);
            }).then(datosFinal=>{
                //return resolve(res);
                this.Guardar_varios_terrenos(datosFinal);
            }).then(res=>{
                //return resolve(res);
                return resolve({Procesado: true, Operacion: 'Terrenos guardados correctamente', Tipo: 'success'});
            }).catch(err=>{
                console.log('err',err);
                return reject(err);
            })
        });
    }
    _organizarDatosTerrenos(datos){
        return new Promise((resolve, reject) => {
            let datosOrdenados = [];
            //CONVERTIMOS LA HOJA EN UN ARRAY BIDIMENCIONAL
            datos.eachRow({ includeEmpty: true },(row, rowNumber) => {
                let columnas = [];
                row.eachCell({ includeEmpty: true }, function(cell, colNumber) {
                    columnas.push(cell.value);
                });
                datosOrdenados.push(columnas);
            });
            let llaves = [];
            datosOrdenados[0].forEach(d=>{
                if(d != null){
                    let limpiar = " ,.,:,(,),/,".split(',');
                    let llave_limpia = `${d}`.split('í').join('i').split('ó').join('o').split('á').join('a').split('ú').join('u').split('é').join('e').split(' ').join('_').replace('%','PORCENTAJE').replace('$','MONEDA');
                    llave_limpia = this._enMayusculas(llave_limpia,true);
                    limpiar.forEach(l=>{
                        llave_limpia = llave_limpia.split(`${l}`).join('');
                    });
                    llaves.push(llave_limpia);
                }
            });
            datosOrdenados.shift();
            //ASIGNAMOS EL OBJETO ORDENADO POR LAS CABECERAS A LOS DATOS ORDENADOS
            let datosProcesados = [];
            datosOrdenados.forEach(d=>{
                let filaVacia = true;
                let str = `{`;
                for(let i=0;i < llaves.length;i++){
                    if(d[i]){filaVacia = false ;}
                    let valor = `${(!d[i])?'-':`${d[i]}`}`;
/*                    if(`${llaves[i]}`.indexOf('FECHA') > -1 && valor){
                        let fch = new Date(valor.toString().trim()); 
                        valor = moment(new Date(fch.setHours(fch.getHours() + 7))).format('YYYY-MM-DD');
                    }*/
                    valor = valor.toString().split('\r\n'); valor=String(valor).replace('\t','');
                    str += `"${llaves[i]}":"${valor.toString().trim()}",`;
                }
                str += `"ACTIVO":"1","ASIGNADO":"0",`;
                str = (str.indexOf(',') > -1 )?str.slice(0,-1):str;
                str += `}`;
                if(!filaVacia){
                    datosProcesados.push(JSON.parse(str));
                }
            });
            return resolve(datosProcesados);
        });
    }
    _enMayusculas(dato, forzar){
        if(forzar && dato != null){
            return dato.toString().toUpperCase();
        }
    return dato;
    }
    Actualizar_terreno(datos){
        return new Promise((resolve, reject)=>{            
            let update = ` SET `;
//            let update = (datos.Lote || datos.Parcela || datos.Etapa || datos.Superficie)?`SET`:``;
            update += (datos.Lote )?` lote = '${datos.Lote}',`:``;
            update += (datos.Etapa )?` etapa = '${datos.Etapa}',`:``;
            update += (datos.Parcela )?` parcela = '${datos.Parcela}',`:``;
            update += (datos.Superficie )?` superficie = '${datos.Superficie}',`:``;
            update += (datos.Pertenece )?` Pertenece = '${datos.Pertenece}',`:``;
            update += (datos.Latitud )?` Latitud = '${datos.Latitud}',`:``;
            update += (datos.Longitud )?` Longitud = '${datos.Longitud}',`:``;
            update += (datos.Estado )?` Estado = '${datos.Estado}',`:``;
            update += (!datos.Asignado || datos.Asignado == 0 )?` Asignado = 0,`:(datos.Asignado)?` Asignado = 1,`:'';
            update += (!datos.Activo || datos.Activo == 0 )?` Activo = 0,`:(datos.Activo)?` Activo = 1,`:'';
            update = update.slice(0,-1);
            mysql.ejecutar(`UPDATE Terrenos ${update} WHERE IdTerreno= ${datos.IdTerreno};`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'Los Datos del terreno fueron cambiados exitosamente ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Borrar_terreno(datos){
        return new Promise((resolve, reject)=>{
            let IdTerreno = datos.IdTerreno;
            mysql.ejecutar(`DELETE FROM Terrenos WHERE IdTerreno = ${IdTerreno}`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'El terreno fue eliminado correctamente', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Borrar_terrenos_multiples(datos){
        return new Promise((resolve, reject)=>{
            return mysql.ejecutar(`DELETE FROM Terrenos WHERE IdTerreno IN (${datos.Ids});`).then((res)=>{
                return resolve({Eliminado: true});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Obtener_plantilla_terrenos(datos){
        return new Promise((resolve, reject) => {
            let path = `./shared/Plantillas/Plantilla_terrenos.xlsx`;
            let cont = fs.readFileSync(path);
            return resolve({String:cont.toString('base64')});
        });
    }
    Obtener_plantilla_clientes(datos){
        return new Promise((resolve, reject) => {
            let path = `./shared/Plantillas/FORMATO_GENERAL_CLIENTE.xlsx`;
            let cont = fs.readFileSync(path);
            return resolve({String:cont.toString('base64')});
        });
    }
    
    Obtener_plantilla_gastos(datos){
        return new Promise((resolve, reject) => {
            let path = `./shared/Plantillas/Plantilla_gastos.xlsx`;
            let cont = fs.readFileSync(path);
            return resolve({String:cont.toString('base64')});
        });
    }
    Guardar_varios_terrenos(datos){
        return new Promise((resolve, reject)=>{
            let Promesas = [];
            var mysql = require('mysql');
            var conexion = mysql.createConnection({
                host     : 'localhost',
                user     : 'root',
                password : 'Sakaunperikin24*',
                database : 'ElRetiro',
                acquireTimeout: 100000000000000000
              });
            conexion.connect();
            datos.forEach(d=>{
                let campos = `parcela, etapa, lote, Pertenece, Superficie, Asignado, Activo`;
                let valores = `'${d.PARCELA}','${d.ETAPA}','${d.LOTE}','${d.PERTENECE}',${d.SUPERFICIE},${d.ASIGNADO},${d.ACTIVO}`;
                Promesas.push(this._ordenarQuery(conexion,`INSERT INTO Terrenos(${campos}) VALUES(${valores})`));
            })
           Promesas.reduce((PP, current) => {
            return PP.then(results => {
                return current.then(currentResult => {
                    return Promise.resolve({Procesado:true,Res:currentResult});
                }).catch(e => {
                    return Promise.resolve({Procesado:false,Res:e});
                })
            })
            }, Promise.resolve([])).then(r => {
                return resolve(r);
            }).catch(err=>{console.log('err',err); return reject(err); });
        });        
    }
    modificar_datos_todos(datos){
        return new Promise((resolve, reject)=>{
            let str = ` SET `;
            datos.Datos.forEach(d=>{
                str += (d.llave != 'Id' && d.llave != 'Obj' && d.llave != 'Cotizacion' && d.llave != 'ObjCompleto' && d.llave != 'ACTIVO' )?'`'+`${d.llave}`+'`'+`='${d.valor}',`:``;
            })
            str = (str.indexOf(',') > -1 )?str.slice(0,-1):str;
            mysql.ejecutar(`UPDATE Datos_todos ${str} WHERE Id= ${datos.Id};`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'Los Datos de la cuenta fueron cambiados exitosamente ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }    
    borrar_registro_datos_todos(datos){
        return new Promise((resolve, reject)=>{
            let ids =  ``;
            datos.Ids.forEach(d=>{
                ids += `${d.Id},`;
            });
            ids = (ids.indexOf(',') > -1 )?ids.slice(0,-1):ids;            
            mysql.ejecutar(`UPDATE Datos_todos WHERE Id IN (${ids}); `).then((res)=>{
                return resolve({Procesado: true, Operacion: 'Los Datos de fueron eliminados correctamente; ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Catalogo_datos(data){
        return new Promise((resolve, reject)=>{
            let condiciones = ` ACTIVO = 1 AND `+"`"+`NOMBRE DEL CLIENTE`+"`"+` NOT LIKE '%DUARTE%MEDRANO%' AND  `+"`"+`NOMBRE DEL CLIENTE`+"`"+` NOT LIKE '%DUARTE%PRECIADO%' AND  `+"`"+`NOMBRE DEL CLIENTE`+"`"+` NOT LIKE '%MEDRANDO%' AND  `+"`"+`NOMBRE DEL CLIENTE`+"`"+` NOT LIKE '%MEDRANO%NEVAREZ%' `;
            return mysql.ejecutar(`SELECT * from Datos_todos WHERE ${condiciones}`).then((res)=>{
                return resolve({Datos:res});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });        
    }
    _ordenarQuery(conexion, query){
        return new Promise((resolve, reject) => {
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
    //Almacena un archivo en un directorio epecifico segun los parametros enviados
    _guardarArchivoDirectorio(path,nombre,datos,maxSize=false, encode=false){
        return new Promise((resolve, reject) => {
            //Si supera el max size regresa un reject
            if(maxSize){
                let encoding = (encode)?encode:false;
                let size = Buffer.byteLength(datos,encoding);
                if (size > maxSize) { return reject(`Archivo adjunto no debe pesar mas de ${maxSize/1048576} MB`);}
            }
            //Si no existe el directorio se crea
            (!fs.existsSync(path))?fs.mkdirSync(path):'';
            //Fullpath
            let fullPath = `${path}${nombre}`;
            //Se escribe el archivo
            fs.writeFile(fullPath, datos,(err= true)=>{
                if(err){return reject(err)}else{resolve(fullPath);}
            });
        }).then((pathFinal) =>{
            return pathFinal;
        }).catch((error)=>{
            return error;
        });
    }
    envio_correo_cotizacion(datos){
        return new Promise((resolve, reject) => {
            if(`${datos.Para}`.indexOf('@') > -1 && datos.Asunto != ''  && datos.Mensaje != ''){
                const nodemailer = require('nodemailer');
                let usr = 'contacto.campestreelretiro@gmail.com';
                let pas = `Retiro87`;
                let Contenido = `${datos.Mensaje}`;
                nodemailer.createTestAccount((err, account) => {
                    var transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: usr, pass: pas} });
                    //`campestreretiro@gmail.com, bocho_sup@hotmail.com`
                    //let Para = `${datos.Para}`;
                    let mailOptions = { from: usr ,to: `luisfernandocordova.24@gmail.com`, subject: `${datos.Asunto}`, html: `${Contenido}` };
                    if(datos.Adjunto){
                        mailOptions.attachments = [{'filename': `Cotizacion_${moment().format('YYYY-MM-DD')}.xlsx`, 'content': new Buffer(datos.Adjunto, "base64")}];
                    }
                    transporter.sendMail(mailOptions, (error, info) => {
                        let respuesta = {Procesado: false, Operacion: 'Fallo el envio de correo', Tipo: 'error',Error: error};
                        if (error) { return reject(respuesta); }
                        return resolve({Procesado: true, Operacion: 'Correo Enviado Correctamente', Tipo: 'success'});
                    });
                });
            }
        });
    }
    envio_correo_contacto(datos){
        return new Promise((resolve, reject) => {
            if(`${datos.Correo}`.indexOf('@') > -1 && datos.Nombre != ''  && datos.Mensaje != ''){
                const nodemailer = require('nodemailer');
                let usr = 'contacto.campestreelretiro@gmail.com';
                let pas = `Retiro87`;
                let Contenido = `Contacto desde el sitio web <br> <b>De:</b> ${datos.Nombre} <br><b>Correo:</b> ${datos.Correo} <br> <b>Mensaje:</b> <br>${datos.Mensaje}`;
                nodemailer.createTestAccount((err, account) => {
                    var transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: usr, pass: pas} });
                    //`campestreretiro@gmail.com, bocho_sup@hotmail.com`
                    let mailOptions = { from: usr ,to: `campestreretiro@gmail.com,luisfernandocordova.24@gmail.com`, subject: `Contacto Web`, html: `${Contenido}` };
                    transporter.sendMail(mailOptions, (error, info) => {
                        let respuesta = {Procesado: false, Operacion: 'Fallo el envio de correo', Tipo: 'error',Error: error};
                        if (error) { return reject(respuesta); }
                        return resolve({Procesado: true, Operacion: 'Correo Enviado Correctamente', Tipo: 'success'});
                    });
                });
            }
        });
     }
     Guardar_cliente_nuevo(conexion,d){
        return new Promise((resolve, reject)=>{
            return this._ordenarQuery(conexion,`SELECT * FROM Clientes WHERE Nombre = '${d.Nombre}' ; `).then(res=>{
//                console.log('res',res);
                if(res[0]){
                    return this._editarCliente(conexion,d);
                }else{
                    return this._insertarCliente(conexion,d);
                }
            }).then(res =>{
            // }).then(res=>{
                //conexion.end();
//                console.log('res',res);
                return resolve(res);
            }).catch(err => { 
//                console.log('err',err);
                return reject(err);
            });
        });
     }
     _editarCliente(conexion,d){
        return new Promise((resolve, reject)=>{
            return resolve({editado:true});
            // return this._ordenarQuery(conexion,`INSERT INTO Clientes (${campos}) VALUES (${valores});`);
        });
     }
     _insertarCliente(conexion,d){
        return new Promise((resolve, reject)=>{
            let fecha; let path = `${process.env.Shared}Clientes/${d.Carpeta}/`;
//            console.log('d',d.Fecha_contrato);
            if(moment(d.Fecha_contrato).isValid()){
                fecha = (d.Fecha_contrato)?moment(d.Fecha_contrato).utc().format('YYYY-MM-DD'):null;                
            }
            let campos = ` Folio, Nombre, Direccion, Vendedor, Telefono, Contrato_firmado, Adeudo_terreno, Adeudo_mantenimientos, Adeudo_anualidades, Adeudo_enganche, Carpeta, Activo ${(fecha)?',Fecha_contrato':''}`;
            ///${d.Nombre}.xlsx
            let valores = `'CLI','${d.Nombre}','${d.Direccion}','${d.Vendedor}',${(d.Telefono)?`'${d.Telefono}'`:null},${(d.Contrato_firmado)?d.Contrato_firmado:0},${d.Adeudo_terreno},0,${d.Total_anualidad},${d.Total_enganche},'${path}${d.Nombre}/',1 ${(fecha)?`,'${fecha}'`:''}`;
            return Promise.resolve({}).then(res=>{
                if(d.Nombre ){
                    console.log('////////////////////////////GUARDANDO DIRECTORIO Y DATOS DE CLIENTE: ',d.Nombre);
                        (!fs.existsSync(path))?fs.mkdirSync(path):'';
                        (!fs.existsSync(`${path}/${d.Nombre}`))?fs.mkdirSync(`${path}/${d.Nombre}`):'';
                        if(d.Dir ){
                            fs.copyFileSync(`${d.Dir}`, `${path}/${d.Nombre}/${d.Nombre}.xlsx`);
                        }
                    return this._ordenarQuery(conexion,`INSERT INTO Clientes (${campos}) VALUES (${valores});`)
                }else{
                    return Promise.resolve({});
                }
            }).then(data=>{
                if(d.Nombre ){
                    return this._ordenarQuery(conexion,`SELECT * FROM Clientes WHERE Nombre = '${d.Nombre}'  limit 1; `);
                }else{
                    return Promise.resolve({});
                }
            }).then(res=>{
                if(res[0]){
                    d.IdCliente = res[0].IdCliente;
                }
                let Promesas_terrenos = [];
                if(d.Terrenos[0]){
                    console.log('////////////////////////////GUARDANDO DATOS DE TERRENO ',d.Nombre);
                    d.Terrenos.forEach(t=>{
                        let campos = ` IdCliente, Folio, Lote, Etapa, Parcela, Superficie, Asignado, Estatus, Latitud, Longitud, Original, Actual, Apartado, Activo `;
                        let valores = `${d.IdCliente},'Ter_${t.Lote}_${t.Etapa}','${t.Lote}','${t.Etapa}',${(t.Parcela)?`'${t.Parcela}'`:null},${(t.Superficie)?`'${t.Superficie}'`:null}, '${d.Nombre}', 'ACTIVO','29.310437','-110.823333', '${d.Vendedor}','${d.Nombre}',0,0`;
//                        console.log('valores',valores);
                        Promesas_terrenos.push(this._ordenarQuery(conexion,`INSERT INTO Terrenos (${campos}) VALUES (${valores});`));
                    });
                }
                return Promise.all(Promesas_terrenos);
            }).then(Terrenos=>{
                let Promesas_financiamiento = [];
//                console.log('d',d.Adeudos_clientes);
                if(d.Adeudos_clientes[0]){
                    console.log('////////////////////////////GUARDANDO ADEUDOS ',d.Nombre);
                    d.Adeudos_clientes.forEach(a=>{
                        let fecha = (a.Fecha && a.Fecha!= 'x'  && moment(a.Fecha).isValid())?moment(a.Fecha).utc().format('YYYY-MM-DD'):null;
                        let obs = (d.Observaciones)?`'${d.Observaciones}'`:null;
                        let fecha_p = (a.Fecha_pago  && a.Fecha_pago!= 'x'  && moment(a.Fecha_pago).isValid())?moment(a.Fecha_pago).utc().format('YYYY-MM-DD'):null;
                        let campos = ` IdCliente, Num_pago, Cantidad, Saldo_restante, Pagado, Num_recibo, Firmado ${(obs)?`,Observaciones`:''} ${(fecha)?',Fecha':''} ${(fecha_p)?',Fecha_pago':''} `;
                        let valores = `${d.IdCliente},${a.Num_pago},${(a.Cantidad)?a.Cantidad:(!a.Pagado)?d.Mensualidad:a.Cantidad},${a.Saldo_restante},${(a.Pagado)?1:0},'${`${a.Num_recibo}`.split("'").join('')}',${(a.Firmado)?1:0} ${(obs)?`,'${obs}'`:''} ${(fecha)?`,'${fecha}'`:''} ${(fecha_p)?`,'${fecha_p}'`:''}`;
//                        if(a.Cantidad){
                        if(Number.isInteger(a.Num_pago)){
                            Promesas_financiamiento.push(this._ordenarQuery(conexion,`INSERT INTO Financiamiento_terrenos (${campos}) VALUES (${valores});`));
                        }
//                        }
                    });
                }
                return Promise.all(Promesas_financiamiento);
            }).then(res=>{
                let Promesas_anualidades = [];
                if(d.Anualidades[0]){
                    console.log('////////////////////////////GUARDANDO ANUALIDADES ',d.Nombre);
                    d.Anualidades.forEach(a=>{
                        let fecha = (a.Fecha && a.Fecha!= 'x' && moment(a.Fecha).isValid() )?moment(a.Fecha).utc().format('YYYY-MM-DD'):null;
                        let obs = (d.Observaciones)?`'${d.Observaciones}'`:null;
                        let fecha_p = (a.Fecha_pago  && a.Fecha_pago!= 'x' && moment(a.Fecha_pago).isValid() )?moment(`${a.Fecha_pago}`).utc().format('YYYY-MM-DD'):null;
                        let campos = ` IdCliente, Num_pago, Cantidad, Pagado, Num_recibo, Firmado ${(obs)?`,Observaciones`:''} ${(fecha)?',Fecha':''} ${(fecha_p)?',Fecha_pago':''} `;
                        let valores = `${d.IdCliente},${a.Num_pago},${(a.Cantidad)?a.Cantidad:(!a.Pagado)?d.Anualidad:a.Cantidad},${(a.Pagado)?1:0},'${`${a.Num_recibo}`.split("'").join('')}',${(a.Firmado)?1:0} ${(obs)?`,'${obs}'`:''} ${(fecha)?`,'${fecha}'`:''} ${(fecha_p)?`,'${fecha_p}'`:''}`;
                        if(Number.isInteger(a.Num_pago)){
                            Promesas_anualidades.push(this._ordenarQuery(conexion,`INSERT INTO Financiamiento_anualidades (${campos}) VALUES (${valores});`));
                        }
//                        if(a.Cantidad){

//                        }
                    });
                }
                return Promise.all(Promesas_anualidades);
            }).then(res=>{
                let Promesas_ventas = [];
                if(d.Ventas[0]){
//                    console.log('ventas',d.Ventas);
                    console.log('////////////////////////////GUARDANDO VENTAS ',d.Nombre);
                    d.Ventas.forEach(a=>{
                        let fecha = (a.Fecha && a.Fecha!= 'x' && moment(a.Fecha).isValid() )?moment(a.Fecha).utc().format('YYYY-MM-DD'):null;
                        let obs = (d.Observaciones)?`'${d.Observaciones}'`:null;
                        let campos = `Folio, Num_recibo, IdUsuario, IdCliente, IdTerreno, IdCuenta, Concepto, Tipo_venta, Forma_pago, Cliente, Auxiliar, Importe ${(obs)?`,Observaciones`:''} ${(fecha)?',Fecha':''} `;                       
                        let valores = `'${a.Folio}','${`${a.Num_recibo}`.split("'").join('')}',0,${d.IdCliente},0,0,'${a.Tipo_venta}','${a.Tipo_venta}','Efectivo','${d.Nombre}','VEN',${a.Cantidad} ${(obs)?`,'${obs}'`:''} ${(fecha)?`,'${fecha}'`:''}`;
                        if(a.Num_recibo){
                            Promesas_ventas.push(this._ordenarQuery(conexion,`INSERT INTO Ventas (${campos}) VALUES (${valores});`));
                        }
                    });
                }
                return Promise.all(Promesas_ventas);                
            }).then(res=>{
                
//                console.log('res',res);
//                return resolve(res[0]);
                return resolve({Cliente:d.Nombre,Error:0});
            }).catch(err=>{
//                console.log('d',d);
                console.log('error',err);
                return resolve({Cliente:d.Nombre, Error: err});
            });
        });
    }
    obtener_datos_clientes_nuevo(filtros){
        let Datos = [];let ids_Clientes = `0,`;
        var mysql = require('mysql');
        var conexion = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : 'Sakaunperikin24*',
            database : 'DBRetiro',
            acquireTimeout: 100000000000000000
          });
        conexion.connect();
        return new Promise((resolve, reject) => {
            console.log('filtros',filtros);
            let condiciones = ` WHERE 1=1 `; 
            condiciones += (filtros.Nombre && filtros.Nombre != '')?` AND Nombre = '${filtros.Nombre}' `:``;
            //WHERE Nombre = '${d.Nombre}' 
            return this._ordenarQuery(conexion,`SELECT * FROM Clientes ${condiciones}; `).then(res=>{
                Datos = res;
                let ids_ = _.uniq((Datos[0])?Datos.map((p)=>{ return p.IdCliente; }):[]);
                ids_.forEach(i=>{ ids_Clientes += `${i},`});
                return this._ordenarQuery(conexion,` SELECT * FROM Terrenos WHERE IdCliente IN (${ids_Clientes.slice(0,-1)}); `);
            }).then(terrenos=>{
                terrenos = (terrenos[0])?terrenos:[];
                if(Datos[0]){
                    Datos.forEach(d=>{
                        d.Terrenos = terrenos.filter(o=>o.IdCliente == d.IdCliente);
                    });
                }
                return this._ordenarQuery(conexion,` SELECT * FROM Financiamiento_terrenos WHERE IdCliente IN (${ids_Clientes.slice(0,-1)}); `);
            }).then(deuda_terrenos=>{        
                if(Datos[0]){
                    Datos.forEach(d=>{
                        d.Financiamiento = (deuda_terrenos[0])?deuda_terrenos.filter(o=>o.IdCliente == d.IdCliente):[];
                    });
                }
                return this._ordenarQuery(conexion,` SELECT * FROM Mantenimientos WHERE IdCliente IN (${ids_Clientes.slice(0,-1)}); `);
            }).then(deuda_mantenimientos=>{        
                if(Datos[0]){
                    Datos.forEach(d=>{
                        d.Mantenimientos = (deuda_mantenimientos[0])?deuda_mantenimientos.filter(o=>o.IdCliente == d.IdCliente):[];
                    });
                }
                return this._ordenarQuery(conexion,` SELECT * FROM Financiamiento_anualidades WHERE IdCliente IN (${ids_Clientes.slice(0,-1)}); `);                
            }).then(deuda_anualidades=>{
                if(Datos[0]){
                    Datos.forEach(d=>{
                        d.Anualidades = (deuda_anualidades[0])?deuda_anualidades.filter(o=>o.IdCliente == d.IdCliente):[];
                    });
                }
                conexion.end();
                return resolve({Data:Datos, Error:0});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }

     ordenarDatosClienteFormato(datos){
        let datosCliente = {Terrenos:[],Lotes:[],Etapas:[],Mensualidades:[],Adeudos_clientes:[],Mantenimientos:[],Anualidades:[],Agua:[],Certificados:[],Enganches:[]};
        let datosOrdenados = [];
         if(datos){
            datos.eachRow({ includeEmpty: true },(row, rowNumber) => {
                let columnas = [];
                row.eachCell({ includeEmpty: true }, function(cell, colNumber) {
                    columnas.push(cell.value);
                });
                datosOrdenados.push(columnas);
            });
//            console.log('datosOrdenados',datosOrdenados);
            this._datosBasicosCliente(datosOrdenados,datosCliente);
            let campo = 'Anualidades';
            datosCliente.Mensualidades.forEach(m=>{
                if(m[1]||m[2]||m[3]||m[4]||m[5]||m[6]||m[7]||m[8]){
                    if(m[1] != 'Mensualidades' && m[1] != 'TOTAL TERRENO'  && m[1] != 'N° de pago '){
                        datosCliente.Adeudos_clientes.push(this._dataMensualidad(m));
                    }
                }
                if(m[11]){
                    datosCliente.Mantenimientos.push(this._dataGenericoMantenimiento(m));
                }
                if(m[20]== 'Enganche ' && m[21]== 'Enganche ' && m[22]== 'Enganche '){ campo = 'Enganche'; }
                if(m[20]== 'Certificado Parcelario' && m[21]== 'Certificado Parcelario' && m[22]== 'Certificado Parcelario'){ campo = 'Certificado'; }
                if(m[20]== 'Contrato de Agua' && m[21]== 'Contrato de Agua' && m[22]== 'Contrato de Agua'){ campo = 'Agua'; }
                if(campo == 'Anualidades' && ( m[20]||m[21]||m[22]||m[23]||m[24]||m[25]||m[26]||m[27] )){
                    datosCliente.Anualidades.push(this._dataGenericaPago(m));
                }else if(campo == 'Enganche' && ( m[20]||m[21]||m[22]||m[23]||m[24]||m[25]||m[26]||m[27] ) ){
                    if(m[20]== 'TOTAL ENGANCHE'){
                        datosCliente.Total_enganche = (m[21])?(m[21].result)?m[21].result:m[21]:0; 
                        datosCliente.Num_pagos_enganche = m[25]; 
                        datosCliente.Fecha_enganche = m[27]; 
                    }else{
                        if(m[20] != 'Enganche '  && m[20]!='N° de pago '){
                            datosCliente.Enganches.push(this._dataGenericaPago(m,true));
                        }
                    }
                }else if(campo == 'Certificado' && ( m[20]||m[21]||m[22]||m[23]||m[24]||m[25]||m[26]||m[27] ) && m[20] != 'Certificado Parcelario'  && m[20]!='N° de pago '){
                    datosCliente.Certificados.push(this._dataGenericaPago(m));
                }else if(campo == 'Agua' && ( m[20]||m[21]||m[22]||m[23]||m[24]||m[25]||m[26]||m[27] ) && m[20] != 'Contrato de Agua' && m[20]!='N° de pago ' ){
                    datosCliente.Agua.push(this._dataGenericaPago(m));
                }
            });
         }
         datosCliente.Ventas = this._dataGenericaVentas(datosCliente);
//         console.log('datosCliente',datosCliente.Nombre);
        datosCliente.Total_enganche = (datosCliente.Total_enganche)?datosCliente.Total_enganche:0;
        datosCliente.Adeudo_terreno = (datosCliente.Adeudo_terreno)?datosCliente.Adeudo_terreno:0;
        datosCliente.Adeudo_terreno = (datosCliente.Adeudo_terreno.error)?0:datosCliente.Adeudo_terreno;
        return datosCliente;
     }
     _datosBasicosCliente(datosOrdenados,datosCliente){
        //                console.log('d',d);
        let activo_mensualidad = false;
        datosOrdenados.forEach(d=>{
//            if(d[0]){
                if(d[1] == 'VENDEDOR'){ datosCliente.Vendedor = `${d[2]}`.trim().toUpperCase(); }
                if(d[1] == 'COMPRADOR'){ datosCliente.Nombre = `${d[2]}`.trim().toUpperCase(); }
                if(d[1] == 'DIRECCIÓN'){ datosCliente.Direccion = d[2]; }
                if(d[1] == 'TELÉFONO'){ datosCliente.Telefono = d[2]; }
                if(d[1] == 'FECHA DE CONTRATO'){ datosCliente.Fecha_contrato = d[2]; }
                if(d[1] == 'LOTE '){ datosCliente.Lotes = (`${d[2]}`.indexOf('Y') > -1)?`${d[2]}`.split('Y'):[`${d[2]}`]; }
                if(d[1] == 'ETAPA'){ datosCliente.Etapas = (`${d[2]}`.indexOf('Y') > -1)?`${d[2]}`.split('Y'):[`${d[2]}`]; }
                if(d[1] == 'TOTAL TERRENO'){ datosCliente.Adeudo_terreno = (d[2])?d[2].result:0; }
                if(d[1] == 'FINANCIAMIENTO'){ datosCliente.Num_mensualidades = d[2]; }
                if(d[1] == 'CONTRATO FIRMADO'){ datosCliente.Firmado = (d[2]=='P')?1:0; }
                if(d[1] == 'ANUALIDAD'){ datosCliente.Contiene_anualidades = (d[2]=='P')?1:0; }
                if(d[1] == 'ENGANCHE'){ datosCliente.Contiene_enganche = (d[2]=='P')?1:0; }
                if(d[1] == 'MANTENIMIENTO'){ datosCliente.Contiene_mantenimiento = (d[2]=='P')?1:0; }
//                console.log('d',d);
                if(d[1] == 'TOTAL TERRENO' && d[4]== 'MENSUALIDAD' && d[7]== '# PAGOS' && d[21]== 'TOTAL ANUALIDAD'){
                    datosCliente.Total_terreno_original = d[2].result;
                    datosCliente.Mensualidad = d[5];
                    datosCliente.Num_pagos = d[8]; 
                    datosCliente.Total_anualidad = (d[22])?d[22].result:0; 
                    datosCliente.Anualidad = (`${d[24]}`.indexOf('Y') > -1)?`${d[24]}`.split('Y')[0]:d[24]; 
                    datosCliente.Num_pagos_anualidad = d[26]; 
                    datosCliente.Fecha_anualidad = d[27]; 
                    activo_mensualidad = true;
                }else{
                    datosCliente.Total_anualidad = 0; 
                }
                if(activo_mensualidad){
                    datosCliente.Mensualidades.push(d);
                }
//            }
        });
        if(datosCliente.Lotes[0] && datosCliente.Etapas[0]){
            for(let i = 0; i < datosCliente.Lotes.length; i++){
                datosCliente.Terrenos.push({Lote: datosCliente.Lotes[i], Etapa: (datosCliente.Etapas[i])?datosCliente.Etapas[i]:''});
            };
        }
        datosCliente.Mensualidades.shift();datosCliente.Mensualidades.shift();
        return datosCliente;
     }
     _dataGenericaVentas(datos){
//        console.log('datos',datos);
        let Ventas = []; let F;
        //FINANCIAMIENTOS
        F = datos.Adeudos_clientes.filter(a=>a.Pagado == 1);
        if(F[0]){
            F.forEach(f=>{
                f.Folio = 'VEN';
                f.Tipo_venta = 'Financiamiento';
                Ventas.push(f);
            });
        }
        //ANUALIDADES
        F = datos.Anualidades.filter(a=>a.Pagado == 1);
        if(F[0]){
            F.forEach(f=>{
                f.Folio = 'ANU';
                f.Tipo_venta = 'Anualidad';
                Ventas.push(f);
            });
        }
        //MANTENIMIENTOS
        F = datos.Mantenimientos.filter(a=>a.Pagado == 1);
        if(F[0]){
            F.forEach(f=>{
                f.Folio = 'MAN';
                f.Tipo_venta = 'Mantenimiento';
                Ventas.push(f);
            });
        }
        //ENGANCHES
        F = datos.Enganches.filter(a=>a.Pagado == 1);
        if(F[0]){
            F.forEach(f=>{
                f.Folio = 'ENG';
                f.Tipo_venta = 'Enganche';
                Ventas.push(f);
            });
        }
        //CERTIFICADOS
        F = datos.Certificados.filter(a=>a.Pagado == 1);
        if(F[0]){
            F.forEach(f=>{
                f.Folio = 'CER';
                f.Tipo_venta = 'Certificado';
                Ventas.push(f);
            });
        }
        //AGUA
        F = datos.Agua.filter(a=>a.Pagado == 1);
        if(F[0]){
            F.forEach(f=>{
                f.Folio = 'AGU';
                f.Tipo_venta = 'Agua';
                Ventas.push(f);
            });
        }        
        return Ventas;
     }
     _dataMensualidad(m){
        return {
            Num_pago: m[1],
            Fecha: m[2],
            Cantidad: (m[3])?(m[3].result)?m[3].result:m[3]:null,
            Saldo_restante: (m[4])?m[4].result:0,
            Pagado: (m[5]=='P' || m[5]=='P ')?1:0,
            Fecha_pago: m[6],
            Num_recibo: (m[7])?m[7]:null,
            Firmado: (m[8]=='P' || m[8]=='P ')?1:0,
            Observaciones: m[9],
        }
     }
     _dataGenericoMantenimiento(m){
        return {
            Num_pago: m[11],
            Fecha: m[12],
            Cantidad: (m[13])?(m[13].result)?m[13].result:m[13]:null,
            Pagado: (m[14]=='P' || m[14]=='P ')?1:0,
            Fecha_pago: m[15],
            Num_recibo: (m[16])?m[16]:null,
            Firmado: (m[17]=='P' || m[17]=='P ')?1:0,
            Observaciones: m[18],
        };
     }
     _dataGenericaPago(m,extra = false){
//         console.log('m',m);
         if(extra){
            return {
                Num_pago: m[20], Fecha: m[21], Cantidad: (m[22])?(m[22].result)?m[22].result:m[22]:null, 
                Saldo_restante: (m[23])?(m[23].result || m[23].result == '0')?m[23].result:m[23]:null, Pagado :(m[24]=='P' || m[24]=='P ')?1:0, 
                Fecha_pago: m[25], Num_recibo: (m[26])?m[26]:null, Firmado: (m[27]=='P' || m[27]=='P ')?1:0, Observaciones: m[28],             
            };
         }else{
            return {
                Num_pago: m[20], Fecha: m[21], Cantidad: (m[22])?(m[22].result)?m[22].result:m[22]:null, 
                Pagado: (m[23]=='P' || m[23]=='P ')?1:0, 
                Fecha_pago: m[24], Num_recibo: (m[26])?m[25]:null, Firmado: (m[26]=='P' || m[26]=='P ')?1:0, Observaciones: m[27],             
            };
         }

     }
     generar_carpetas_clientes(){
        let Promesas = [];let DatosWork = []; let Datos;
        var mysql = require('mysql');
        var conexion = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : 'Sakaunperikin24*',
            database : 'DBRetiro',
            acquireTimeout: 100000000000000000
        });
        conexion.connect();
        return new Promise((resolve, reject) => {
            let carpetasCliente = `${process.env.Clientes}`;
            console.log('carpetas',carpetasCliente);
            console.log('////// ELIMINANDO DATOS CLIENTES');
            let Prom_truncates = [this._ordenarQuery(conexion,`TRUNCATE Clientes;`),
            this._ordenarQuery(conexion,`TRUNCATE Financiamiento_anualidades;`),
            this._ordenarQuery(conexion,`TRUNCATE Financiamiento_terrenos;`),
            this._ordenarQuery(conexion,`TRUNCATE Ventas;`),
            this._ordenarQuery(conexion,`DELETE FROM Empleados WHERE Puesto = 'Vendedor';`),
            this._ordenarQuery(conexion,`TRUNCATE Terrenos;`)];
            return Promise.all(Prom_truncates).then(res=>{
                return this._datosOrdenados(carpetasCliente);
            }).then(dat=>{
                //console.log('data',dat);
                Datos = dat;
                let Vend = [];
                if(Datos[0]){
                    Datos.forEach(d=>{
                        let existe =  Vend.find(v=>v.Vendedor == d.Data.Vendedor);
                        if(!existe){
                            Vend.push({Vendedor:d.Data.Vendedor});
                        }
                    });
                }
                let Prom_vend = []; 
                let campos = `Nombre, Puesto, Fecha_registro`;
                console.log('////// INICIA GUARDADO DE VENDEDORES');
                if(Vend[0]){
                    Vend.forEach(v=>{
                        let valores = `'${v.Vendedor}','Vendedor', '${moment().format('YYYY-MM-DD HH:mm:ss')}' `;
                        Prom_vend.push(this._ordenarQuery(conexion,`INSERT INTO Empleados (${campos}) VALUES (${valores});`));
                    })
                }
                return Promise.all(Prom_vend);
            }).then(vend=>{
//                console.log('dat',dat);
                let PromCli = [];
                if(Datos[0]){
                    Datos.forEach(d=>{
                        d.Data.Dir = d.Dir;
                        d.Data.Carpeta = d.Carpeta;
                        if(d.Data.Nombre){
                            d.Data.Nombre = d.Data.Nombre.split('/').join(' Y ');
                        }
                        PromCli.push(this.Guardar_cliente_nuevo(conexion,d.Data));
                    });
                }
                return Promise.all(PromCli);
            }).then(res=>{
//                console.log('res',JSON.stringify(res));
                conexion.end();
                console.log('////// TERMINA GUARDADO DE CLIENTES');
                return resolve(res);
            }).catch(err=>{
                console.log('err',err);
                return reject(err);
            });
        });
     }
     _datosOrdenados(carpetasCliente){
         let PromData = [];
        return new Promise((resolve, reject)=>{
            if(fs.existsSync(carpetasCliente)){
                fs.readdirSync(carpetasCliente).forEach(file => {
                    if(fs.existsSync(`${carpetasCliente}${file}/`) && file != '.DS_Store'){
                        fs.readdirSync(`${carpetasCliente}${file}/`).forEach(f => {
                            if(f != 'LIQUIDADOS' && `${f}`.indexOf('~$') == -1 && fs.existsSync(`${carpetasCliente}${file}/${f}`)  && f != '.DS_Store'){
                                PromData.push({Data: new Excel.Workbook().xlsx.readFile(`${carpetasCliente}${file}/${f}`), Dir: `${carpetasCliente}${file}/${f}`, Carpeta: `${file}`.trim() });
                            }
                        });
                    }
                });
            }
            return Promise.all(PromData.map(a=>a.Data.then(r=>{
                return a.Data = this.ordenarDatosClienteFormato(r.getWorksheet(1))
            }))).then(rr=>{
                return resolve(PromData);
            }).catch(err=>{
                console.log('err',err);
                return reject(err);
            });
        });
     }
    _contenidoContratoGenerico(datosContrato){
        return  `<div class="row" style="padding:20px;">
        <div class="col-lg-12">
            <h3>CONTRATO DE PROMESA DE COMPRA VENTA</h3>
            <p>
                EN LA CIUDAD DE HERMOSILLO SONORA SIENDO LAS 10:00 HORAS DEL DIA 02 DE  AGOSTO  DE 2017   CELEBRAN: POR UNA PARTE LA C. LIDIA ALEJANDRA DUARTE MEDRANO   QUIEN BAJO PROTESTA DE DECIR VERDAD CELEBRA ESTE CONTRATO COMO POSESIONARIA  DEL POBLADO EL CARMEN MUNICIPIO DE HERMOSILLO COMO PROMITENTE VENDEDOR.
                POR UNA SEGUNDA PARTE COMPARECE EL C. &nbsp;&nbsp;<b><u>${(datosContrato.datosCliente.Nombre)?`${datosContrato.datosCliente.Nombre}`:`-`}</u></b> &nbsp;&nbsp;  QUIEN EN LO SUCESIVO SE LE DENOMINARA PROMITENTE COMPRADOR.
                MANIFESTARON QUE TIENEN CONCERTADO UN CONTRATO DE PROMESA DE COMPRAVENTA MISMO QUE DEJAN FORMALIZADO AL TENOR DE LOS ANTECEDENTES, DECLARACIONES Y CLAUSULAS SIGUIENTES:
            </p>
            <h3>ANTECEDENTES </h3>
            <p>
                <b>PRIMERO.-</b>
                EL EJIDO EL CARMEN MUNICIPIO DE HERMOSILLO ESTADO DE SONORA CUENTA CON RESOLUCION PRESIDENCIAL DE FECHA 29 DE JULIO DE 1936, EJECUTÁNDOSE  TOTALMENTE  EL DIA   29 / 07 /  36 POR LA VIA DOTACIÓN  CON UNA  SUPERFICIE DE  718-00-00  HAS , PARA   22   EJIDATARIOS.- 
            </p>
            <p>
                <b>SEGUNDO:</b>
                POSTERIORMENTE CON EL PROGRAMA DE CERTIFICACION DE DERECHOS EJIDALES Y TITULACION DE SOLARES URBANOS SE LLEVO A CABO LA REGULARIZACION DE LA TENENCIA DE LA TIERRA CULMINANDO LA ASAMBLEA DE DELIMITACION. DESTINO, ASIGNACION CON FECHA 29 DE NOVIEMBRE DE 1997, RATIFICÁNDOSE A 22   EJIDATARIOS.-
            </p>
            <p>
                <b>TERCERO:</b>
                ACTO SEGUIDO SE CELEBRA AUTORIZACION PARA ADOPCION DE DOMINIO PLENO SOBRE TIERRAS PARCELADAS  ASAMBLEA  CELEBRADA CON FECHA  01 DE AGOSTO DE 1999, INSCRITO EL ACTO EN EL REGISTRO AGRARIO NACIONAL CON FECHA  21 DE SEPTIEMBRE DEL AÑO 2000.- 
            </p>
            <p>
                <b>CUARTA:</b>
                QUE CON FECHA 25  DE OCTUBRE  DE 2014 EN ASAMBLEA DE DELIMITACION, DESTINO Y ASIGNACION DE TIERRAS ( CERTIFICACION DE LA TIERRA INCORPORADA AL REGIMEN EJIDAL COMO AREA PARCELADA)  SE FORMALIZO LA CERTIFICACION DE LA MISMA CORRESPONDIENDOLE A LA LIDIA ALEJANDRA DUARTE MEDRANO  UNA PARCELA CON EL NUMERO ${(datosContrato.datosTerreno.Parcela)?`${datosContrato.datosTerreno.Parcela}`:`-`} .-
            </p>
            <br>

            <h3>DECLARACIONES</h3>                    
            <p>
                <b>PRIMERA:</b>
                LA C. LIDIA ALEJANDRA DUARTE MEDRANO  DECLARA QUE ES TITULAR DE LA PARCELA  N°  ${(datosContrato.datosTerreno.Parcela)?`${datosContrato.datosTerreno.Parcela}`:`-`} CON SUPERFICIE DE ${(datosContrato.datosTerreno.Superficie)?`${datosContrato.datosTerreno.Superficie}`:`-`} MTS. 2  UBICADO EN EL EJIDO EL CARMEN MUNICIPIO DE HERMOSILLO Y QUE SE LOCALIZA EN EL CONJUNTO “CAMPESTRE FAMILIAR EL RETIRO”, EN EL KILOMETRO 15.0 DE LA CARRETERA A SAN MIGUEL DE HORCASITAS. 
            </p>                    
            
            <h3 class="text-right">HOJA NO.02 </h3>
            <p>
                <b>SEGUNDA:</b>
                LA C. LIDIA ALEJANDRA DUARTE MEDRANO, ACREDITA LA TITULARIDAD DE LA PARCELA NUMERO  ${(datosContrato.datosTerreno.Parcela)?`${datosContrato.datosTerreno.Parcela}`:`-`}  CON SUPERFICIE ${(datosContrato.datosTerreno.Superficie)?`${datosContrato.datosTerreno.Superficie}`:`-`} MTS. CON CERTIFICADO PARCELARIO NÚMERO&nbsp;&nbsp;<b><u>${(datosContrato.datosTerreno.Parcela)?`${datosContrato.datosTerreno.Parcela}`:`-`}</u></b> &nbsp;&nbsp; Y FOLIO: &nbsp;&nbsp;<b><u>${(datosContrato.datosCliente.NumIfe)?`${datosContrato.datosCliente.NumIfe}`:`-`}</u></b> &nbsp;&nbsp; EXPEDIDO  POR EL REGISTRO AGRARIO NACIONAL .
                <br>
                LAS PARTES DE COMUN ACUERDO SE SUJETAN A LAS CLAUSULAS SIGUIENTES:
            </p>
            <h3 class="text-center">CLÁUSULAS </h3>
            <p>
                <b>PRIMERA:</b>
                LA C. LIDIA ALEJANDRA DUARTE MEDRANO  ESTA FORMALIZANDO CONTRATO DE PROMESA DE COMPRAVENTA CON EL (LA) C.&nbsp;&nbsp;<b><u>${(datosContrato.datosCliente.Nombre)?`${datosContrato.datosCliente.Nombre}`:`-`}</u></b> &nbsp;&nbsp;  RESPECTO DE LA PARCELA NUMERO &nbsp;&nbsp;<b><u>${(datosContrato.datosTerreno.Parcela)?`${datosContrato.datosTerreno.Parcela}`:`-`}</u></b> &nbsp;&nbsp; QUE SE UBICA EN EL EJIDO EL CARMEN MUNICIPIO DE HERMOSILLO Y SE LOCALIZA DENTRO DEL CONJUNTO “CAMPESTRE FAMILIAR EL RETIRO”, EN EL KILOMETRO 15.0 DE LA CARRETERA A SAN MIGUEL DE HORCASITAS. 
            </p>
            <p>
                <b>SEGUNDA:</b>
                DESDE ESTE MOMENTO SEÑALAN LAS PARTES CONTRATANTES LA OBLIGACION DE LA PARTE PROMITENTE COMPRADORA DE PAGAR LA CANTIDAD DE $ 125,000.00  ( CIENTO VEINTICINCO MIL  PESOS  )   POR UNA SUPERFICIE DE  ${(datosContrato.datosTerreno.Superficie)?`${datosContrato.datosTerreno.Superficie}`:`-`} MTS. 2  
                <br>
                DICHA CANTIDAD SE CUBRIRA DE LA SIGUIENTE FORMA: PAGO INMEDIATO A LA FIRMA DE ESTE CONTRATO .
            </p>
            <p>
                <b>TERCERA:</b>
                SI POR ALGUNA RAZON EL(LA) C.&nbsp;&nbsp;<b><u>${(datosContrato.datosCliente.Nombre)?`${datosContrato.datosCliente.Nombre}`:`-`}</u></b> &nbsp;&nbsp; QUISIERE TRASPASAR O CEDER LA PARCELA NUMERO ${(datosContrato.datosTerreno.Parcela)?`${datosContrato.datosTerreno.Parcela}`:`-`} , SE TENDRA QUE DAR PREVIO AVISO POR ESCRITO A LA C.LIDIA ALEJANDRA DUARTE MEDRANO , PARA QUE UNA VEZ CONCLUIDO EL PAGO TOTAL  SE TENGAN LOS DATOS ACUALIZADOS Y REALIZAR LA CESION DE DERECHOS A FAVOR DE LA PARTE PROMITENTE COMPRADORA Y O BIEN A QUIEN ESTA PERSONA ELIJA POR ASI CONVENIR A SUS INTERESES.-                        
            </p>
            <p>
                <b>CUARTA:</b>
                LA C. LIDIA ALEJANDRA DUARTE MEDRANO  MANIFIESTA ESTAR REALIZANDO Y FORMALIZANDO ESTE CONTRATO DE PROMESA DE COMPRA-VENTA CON EL (LA)C. &nbsp;&nbsp;<b><u>${(datosContrato.datosCliente.Nombre)?`${datosContrato.datosCliente.Nombre}`:`-`}</u></b> &nbsp;&nbsp; EL CUAL CULMINA EN CONVENIO DE CESION DE DERECHOS  A FAVOR DEL( DE LA )  C. &nbsp;&nbsp;<b><u>${(datosContrato.datosCliente.Nombre)?`${datosContrato.datosCliente.Nombre}`:`-`}</u></b> &nbsp;&nbsp; NO TENIENDO NINGÚN INCONVENIENTE  LA C. LIDIA ALEJANDRA DUARTE MEDRANO  QUE EL CERTIFICADO PARCELARIO CORRESPONDIENTE SEA A NOMBRE DE LA PERSONA ANTES MENCIONADA,O A QUIEN ESTA SEÑALE  QUIEN SE HARÁ RESPONSABLE DE LOS PAGOS Y COSTOS DEL TRASLADO  ANTE LA DEPENDENCIA QUE CORRESPONDE .                        
            </p>
            <h3 class="text-right">HOJA NO.03 </h3>
            <p>
                <b>QUINTA:</b>
                CONVIENEN AMBAS PARTES QUE EL(LA) C. &nbsp;&nbsp;<b><u>${(datosContrato.datosCliente.Nombre)?`${datosContrato.datosCliente.Nombre}`:`-`}</u></b> &nbsp;&nbsp; PAGARÁ EL CONTRATO DE AGUA A LA C. LIDIA ALEJANDRA DUARTE MEDRANO   UNA VEZ INSTALADA LA TOMA DE AGUA EN SU TERRENO, EL(LA)  C.&nbsp;&nbsp;<b><u>${(datosContrato.datosCliente.Nombre)?`${datosContrato.datosCliente.Nombre}`:`-`}</u></b> &nbsp;&nbsp; SOLO UTILIZARA ESTE SERVICIO DE SUMINISTRO DE AGUA EN LA PARCELA  YA ESPECIFICADA, HACIENDO UN USO ADECUADO DEL AGUA PARA EL CONSUMO MODERADO DE LAS NECESIDADES QUE REQUIERE UN TERRENO CAMPESTRE DENTRO DE LAS INSTALACIONES DE CAMPESTRE FAMILIAR “ EL RETIRO ” , POR NINGUN MOTIVO SE PERMITIRA DESPLAZAR EL SUMINISTRO DE AGUA A OTRO LUGAR QUE NO SEA EL MENCIONADO EN ESTE CONTRATO, EN CASO CONTRARIO SE RACIONARA O SUSPENDERA DICHO SUMINISTRO , COBRANDOSE UNA CUOTA POR RECONECCION. EL PAGO DE CONTRATO DE AGUA SE REALIZARÁ EN LAS OFICINAS GENERALES A MÁS TARDAR 30 DÍAS DESPUÉS DE SU INSTALACIÓN, ASI COMO UN PAGO SEMESTRAL POR MANTENIMIENTO.
            </p>
            <p>
                <b>SEXTA:</b>
                LA PARTE PROMITENTE VENDEDORA SE OBLIGA AL SANEAMIENTO PARA EL CASO DE EVICCION EN FORMA Y CONFORME A DERECHO.
            </p>
            <p>
                <b>SEPTIMA:</b>
                LA C.LIDIA ALEJANDRA DUARTE MEDRANO  ENTREGA A LA CELEBRACION DEL PRESENTE INSTRUMENTO LA POSESIÓN FORMAL, MATERIAL Y JURIDICA DEL INMUEBLE DESCRITO EN LA DECLARACIÓNES DE ESTE CONTRATO DE PROMESA DE COMPRA-VENTA AL(A LA ) C. &nbsp;&nbsp;<b><u>${(datosContrato.datosCliente.Nombre)?`${datosContrato.datosCliente.Nombre}`:`-`}</u></b> &nbsp;&nbsp; QUIEN EN ESTE MISMO ACTO LA RECIBE DE CONFORMIDAD.
            </p>
            <p>
                <b>OCTAVA:</b>
                PARA LA INTERPRETACIÓN Y CUMPLIMIENTO DE LO ESTIPULADO Y LO NO ESTIPULADO EN ESTE CONTRATO, LAS PARTES SE SOMETERÁN EXPRESAMENTE A LA JURISDICCIÓN DE LOS TRIBUNALES DEL DISTRITO JUDICIAL DE HERMOSILLO, SONORA; RENUNCIANDO PARA TAL FIN EL FUERO QUE LES CORRESPONDA ASÍ COMO EL DE SU DOMICILIO ACTUAL O FUTURO.
            </p>
            <p>
                <b>NOVENA:</b>
                MANIFIESTAN LAS PARTES PROMITENTE  VENDEDOR Y PROMITENTE COMPRADOR ESTAR DE ACUERDO EN OBLIGARSE A CELEBRAR UN CONTRATO DE CESION DE DERECHOS PARCELARIOS  UNA VEZ QUE SE HAYA CUBIERTO LA TOTALIDAD DE PAGO POR ENAJENACION  DEL  TOTAL DEL AREA  QUE SE ENAJENA, ACTUALMENTE PROPIEDAD DE LA C. LIDIA ALEJANDRA DUARTE MEDRANO  POSESIONARIA   DEL POBLADO   EL CARMEN    MUNICIPIO DE HERMOSILLO ESTADO DE SONORA,  OBLIGANDOSE LAS PARTES A RESPETAR LO ESTABLECIDO EN LA LEY AGRARIA EN VIGOR Y LA FACULTAD DE LA ASAMBLEA DEL RECONOCIMIENTO DEL PROMITENTE COMPRADOR CON CALIDAD DE POSESIONARIO .
            </p>
            <p>
                <b>DECIMA:</b>
                LO NO PREVISTO EN ESTE CONTRATO SE REGIRA POR LOS ARTICULOS 2474, 2475, 2476, 2477, 2478, 2479, 2481, 2482 Y DEMAS RELATIVOS Y APLICABLES AL CODIGO CIVIL PARA EL ESTADO DE SONORA.
            </p>
            <p>
                <b>DECIMA PRIMERA:</b>
                LA C. LIDIA ALEJANDRA DUARTE MEDRANO   PROMITENTE VENDEDOR MANIFIESTA QUE EN ESTA OCACION ESTA REALIZANDO Y FORMALIZANDO ESTE CONTRATO DE PROMESA DE COMPRAVENTA CON EL (LA)C. &nbsp;&nbsp;<b><u>${(datosContrato.datosCliente.Nombre)?`${datosContrato.datosCliente.Nombre}`:`-`}</u></b> &nbsp;&nbsp; COMO PROMITENTE COMPRADOR QUE CULMINARA EN CONVENIO DE CESION DE DERECHOS PARCELARIOS A FAVOR DE EL(DE LA ) C.&nbsp;&nbsp;<b><u>${(datosContrato.datosCliente.Nombre)?`${datosContrato.datosCliente.Nombre}`:`-`}</u></b> &nbsp;&nbsp; No TENIENDO NINGUN INCONVENIENTE LA C.LIDIA ALEJANDRA DUARTE MEDRANO QUE LA ENAJENACION CORRESPONDIENTE SEA A NOMBRE DEL ANTES SEÑALADO SIENDO LA PARTE PROMITENTE COMPRADORA QUIEN SE HARA RESPONSABLE DE LOS PAGOS Y COSTOS DEL TRASLADO ANTE LA DEPENDENCIA QUE CORRESPONDA, SIENDO IMPORTANTE SEÑALAR QUE SE DA EL CASO DE INEXISTENCIA DE LAS PARTES  POR EL CASO DE FALLECIMIENTO , LAS PARTES  QUE PARTICIPAN    SOLICITAN QUE  ESTE CONTRATO SEA RESPETADO EN TODOS SUS TERMINOS Y CONDICIONES DEBIENDO CULMINAR  A FAVOR DE QUIENES EN SU MOMENTO DEMUESTREN TENER DEREHO A ELLO CON ARREGLO A LA LEY .-
            </p>
            <h3 class="text-right">HOJA NO.04 </h3>
            <h3 class="text-center">PERSONALIDAD </h3>
            <p>
                LA C. LIDIA ALEJANDRA DUARTE MEDRANO  ACREDITO SU CARACTER DE  POSEISONARIA   DEL POBLADO EL CARMEN MUNICIPIO DE HERMOSILLO ESTADO DE SONORA CON RESOLUCION Y ACTA DE ASAMBLEA DE DELIMITACION, DESTINO Y   ASIGNACION DE TIERRAS CELEBRADA CON FECHA  25 DE  OCTUBRE  DE 2014   Y SU CORRESPONDIENTE   CERTIFICADPO PARCELARIO   , DOCUMENTOS QUE PASAN A FORMAR PARTE DE ESTE CONTRATO.
            </p>
            <h3 class="text-center">GENERALES DE LOS DECLARANTES</h3>
            <p class="text-center">
                    LA C.LIDIA ALEJANDRA DUARTE MEDRANO   MANIFESTO POR SUS GENERALES SER MEXICANO POR NACIMIENTO  E HIJA DE PADRES MEXICANOS , SOLTERA   POSESIONARIA   ORIGINARIO  DE    HERMOSILLO  ,  SONORA   , NACIDO  EL DÍA  06 DE AGOSTO DE 1990, QUIEN SE IDENTIFICO CON  CREDENCIAL DE ELECTOR FOLIO   &nbsp;&nbsp;<b><u>${(datosContrato.datosCliente.NumIfe)?`${datosContrato.datosCliente.NumIfe}`:`-`}</u></b> &nbsp;&nbsp; CON DOMICILIO CONOCIDO EJIDO EL ZACATON , MUNICIPIO DE HERMOSILLO .
                    <br>
                    EL (LA)C.&nbsp;&nbsp;<b><u>${(datosContrato.datosCliente.Nombre)?`${datosContrato.datosCliente.Nombre}`:`-`}</u></b> &nbsp;&nbsp;  MANIFESTO POR SUS GENERALES SER MEXICANO POR NACIMIENTO E HIJO DE PADRES MEXICANOS ORIGINARIO DE: &nbsp;&nbsp;<b><u>${(datosContrato.datosCliente.Origen)?`${datosContrato.datosCliente.Origen}`:`-`}</u></b> &nbsp;&nbsp; NACIDO EL DIA &nbsp;&nbsp;<b><u>${(datosContrato.datosCliente.Fecha_nacimiento)?`${datosContrato.datosCliente.Fecha_nacimiento}`:`-`}</u></b> &nbsp;&nbsp; IDENTIFICANDOSE CON CREDENCIAL DE ELECTOR FOLIO NUMERO &nbsp;&nbsp;<b><u>${(datosContrato.datosCliente.NumIfe)?`${datosContrato.datosCliente.NumIfe}`:`-`}</u></b> &nbsp;&nbsp;, CON DOMICILIO EN: &nbsp;&nbsp;<b><u>${(datosContrato.datosCliente.Direccion)?`${datosContrato.datosCliente.Direccion}`:`-`}</u></b> &nbsp;&nbsp;.-
                    <br>
                    LEIDO QUE FUE EL PRESENTE CONTRATO POR LOS PARTICIPANTES LO RATIFICAN Y LO FIRMAN, MANIFESTANDO QUE EN LA CELEBRACION DEL MISMO NO EXISTE DOLO O VICIOS OCULTOS, ASI MISMO SEÑALA NO HABER SIDO COACCIONADOS DE MANERA ALGUNA PARA SU CELEBRACION, ARGUMENTANDO QUE EL PRESENTE DOCUMENTO ES LA REPRESENTACION ESCRITA DE SU VOLUNTAD, POR LO QUE LO FIRMAN DE CONFORMIDAD ABAJO.
                    <br><br>
                    A T E N T A M E N T E
                    POR LAS PARTES
                    <br>
                    _____________________________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _____________________________________________
                    <br>
                    C. LIDIA ALEJANDRA DUARTE MEDRANO          C.<br>
                    PROMITENTE VENDEDOR		                       PROMITENTE COMPRADOR
                    <br>
                    TESTIGOS
                    <br><br>
                    _____________________________________________  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _____________________________________________
            </p>
        </div>
    </div>`;
    }
}