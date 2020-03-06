const mysql =  require("../../../shared/db/mysql_driver");
const moment =  require('moment');
const  ObjCatalogos = require('../../api_catalogos/modulos/catalogos');
const fs =  require('fs-extra');
var Excel = require('exceljs');
//const xlsx =  require('node-xlsx');
const utf8 = require('utf8');
module.exports = class Gastos {
    Base(solicitud){
        return new Promise((resolve, reject)=>{
            return resolve({status: `ok`});
        })
    }
    Obtener_gastos(solicitud){
        return new Promise((resolve, reject)=>{
            return mysql.ejecutar('SELECT * FROM Gastos;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err => { return reject({Data: false, err })});
        });
    }
    Guardar_nuevo_gasto(datos){
        console.log('datos',datos);
        return new Promise((resolve, reject)=>{
/*            this.Obtener_folio_gasto().then(fol=>{
                datos.folioGasto = `GAS-${(fol['Data'])?(fol['Data'][0].IdGasto)+1:1}`;*/
            return Promise.resolve({}).then(reS=>{
                if(datos.Adjunto){
                    console.log('entro',datos.Adjunto)
                    let compExt = `${datos.Adjunto.split(',')[0].split(';')[0].split('/')[1]}`;
                    let cont = new Buffer(datos.Adjunto.split(',')[1], "base64");
                    let path = `./shared/uploads/Gastos/`;
                    let nomb =  `Gasto_${moment().format('YYYY-MM-DD')}.${compExt}`; 
                    return this._subirArchivo(path,nomb,cont,2097152);
                }else{
                    return Promise.resolve(0);
                }
            }).then(arch=>{
                console.log('arch',arch);
                datos.Archivo = arch;
                console.log('datos',datos);
                let campos =  `Folio_gasto,Forma_pago,IdCuenta ,IdUsuario, Responsable,Concepto,Nota,Tipo,Total,Categoria,Subcategoria,Adjunto,Fecha_gasto,Fecha_insert`;
                let valores = `'${(datos.folioGasto)?datos.folioGasto:'GAS'}','${datos.FormaPago}',${datos.IdCuenta}, ${datos.Usuario.Datos.IdUsuario},'${datos.Responsable}','${(datos.Concepto)?datos.Concepto:'-'}','${(datos.Nota)?datos.Nota:'-'}','${(datos.Tipo)?datos.Tipo:'01'}',${datos.Total},'${datos.Categoria}','${datos.Subcategoria}',${datos.Archivo},'${(datos.Fecha_gasto)?`${datos.Fecha_gasto}`:`${moment().format('YYYY-MM-DD')}`}','${moment().format('YYYY-MM-DD HH:mm:ss')}'`;
                return mysql.ejecutar(`INSERT INTO Gastos (${campos}) VALUES (${valores});`);
            }).then(result=>{
                return resolve({Insertado: true});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    _subirArchivo(path,nombre,datos,maxSize=false, encode=false){
        if(!path && !nombre){return Promise.resolve(0)};
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
    Borrar_gasto(Id){
        return new Promise((resolve, reject)=>{
            return mysql.ejecutar(`DELETE FROM Gastos WHERE IdGasto=${Id};`).then((res)=>{
                return resolve({Eliminado: true});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Borrar_gastos_multiples(datos){
        console.log('datos',datos);
        return new Promise((resolve, reject)=>{
            return mysql.ejecutar(`DELETE FROM Gastos WHERE IdGasto IN (${datos.Ids});`).then((res)=>{
                return resolve({Eliminado: true});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Obtener_folio_gasto(){
        return new Promise((resolve, reject)=>{
            return mysql.ejecutar(`SELECT IdGasto, Folio_gasto FROM Gastos ORDER BY IdGasto desc LIMIT 1`).then((res)=>{
                return resolve({Data:res,Error:false});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });   
    }
    Guardar_varios_gastos(datos){
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
                let campos =  `Folio_gasto,Forma_pago,IdCuenta ,IdUsuario, Responsable,Concepto,Nota,Tipo,Total,Categoria,Subcategoria,Adjunto,Fecha_gasto,Fecha_insert`;
                let valores = `'${(d.folioGasto)?d.folioGasto:'GAS'}','${d.FormaPago}',${d.IdCuenta}, ${d.Usuario.Datos.IdUsuario},'${d.Responsable}','${(d.Concepto)?d.Concepto:'-'}','${(d.Nota)?d.Nota:'-'}','${(d.Tipo)?d.Tipo:'01'}',${d.Total},'${d.Categoria}','${d.Subcategoria}',${d.Adjunto},'${d.Fecha_gasto}','${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`;
                Promesas.push(this._ordenarQuery(conexion,`INSERT INTO Gastos (${campos}) VALUES (${valores});`));
            })
           Promesas.reduce((PP, current) => {
            return PP.then(results => {
                return current.then(currentResult => {
                    return Promise.resolve({Procesado:true,Res:currentResult});
                }).catch(e => {
                    return Promise.reject({Procesado:false,Res:e});
                })
            })
            }, Promise.resolve([])).then(r => {
                console.log('r',r);
                return resolve(r);
            }).catch(err=>{console.log('err',err); return reject(err); });
        });
    }
    Subir_excel_partidas(datos_archivo){
        //console.log('datos',datos_archivo);
        return new Promise((resolve, reject)=>{
            let datos = new Buffer(datos_archivo.file, "base64");
            let path = `./shared/uploads/Gastos/`;
            let fileName = `Carga_gastos_${moment().format('YYYY-MM-DD_HH:mm:ss')}.${datos_archivo.Ext}`;
            return this._guardarArchivoDirectorio(path,fileName,datos,2097152,'base64').then(fullPath=>{
                //LEE EL ARCHIVO DE EXCEL Y LO TRANSFORMA EN UN OBJETO
                let workbook = new Excel.Workbook();
                return workbook.xlsx.readFile(fullPath);
            }).then((datosExcel) => {
                //ORGANIZA LOS DATOS DEL EXCEL PARA TENER DATOS ORDENADOS POR CABECERA
                let datosHoja1 = datosExcel.getWorksheet(1);
                return this._organizarDatosNuevaPlantilla(datosHoja1,datos_archivo.Tipo);
            }).then(datosFinal=>{
                //return resolve(res);
                this.Guardar_varios_gastos(datosFinal);
            }).then(res=>{
                console.log('terminado',res);
                //return resolve(res);
                return resolve({Procesado: true, Operacion: 'Gastos guardados corretamente', Tipo: 'success'});
            }).catch(err=>{
                console.log('err',err);
                return reject(err);
            })
        });
    }
/*    _leerExcel(fullPath){
        return new Promise((resolve, reject) => {
            try {
                let datos = xlsx.parse(fullPath);
                let datosOrdenados = [];
                datos[0].data.forEach((item, index) => {
                    console.log('item',item[0]);
                    datosOrdenados.push(item[0]);
                });
                return resolve(datosOrdenados);
            }catch(error){
                return reject(`Error al leer el archivo ${error}`);
            }
        })
    }*/
    //Ordena los datos para guardarlos como gastos
    _ordernarGastosParaGuardar(datos){
/*        let datosOrdenados = [];
        datos.forEach(d=>{
            let idCuenta = 0;
            let usuario = {Datos:{IdUsuario:0,Nombre:`Sistema_carga_automatica`}};
            datosOrdenados.push({FormaPago:(d.CUENTA =='Efectivo')?'Efectivo':'Tarjeta',IdCuenta:idCuenta,usuario,
            Responsable:`Duarte Medrano Francisco Manuel`,Concepto:`${d.DESCRIPCION}`,Nota:`${d.NOTA}`,Tipo:`${d.CATEGORIA}`,
            Total: (d.USD)?d.USD:0,IdCategoria:0,IdSubcategoria:0,Adjunto:0});
        });*/
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
            (!fs.existsSync(path))?fs.mkdirpSync(path):'';
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
    _organizarDatosNuevaPlantilla(datos,Tipo){
        let objCatalogo = new ObjCatalogos();
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
            //console.log('datosOrdenados',datosOrdenados);
            let llaves = [];
            let str_llaves = ``;
            datosOrdenados[0].forEach(d=>{
                if(d != null){
                    let limpiar = " ,.,:,(,),/,".split(',');
                    let llave_limpia = `${d}`.split('í').join('i').split('ó').join('o').split('á').join('a').split('ú').join('u').split('é').join('e').split(' ').join('_').replace('%','PORCENTAJE').replace('$','MONEDA');
                    llave_limpia = this._enMayusculas(llave_limpia,true);
                    limpiar.forEach(l=>{
                        llave_limpia = llave_limpia.split(`${l}`).join('');
                    });
                    llave_limpia +=  (llaves.indexOf(`${llave_limpia}`) > -1)?`_`:``;
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
                    if(`${llaves[i]}`.indexOf('FECHA') > -1 && valor){
                        let fch = new Date(valor.toString().trim());
                        valor = moment(new Date(fch.setHours(fch.getHours() + 7))).format('YYYY-MM-DD');
                        valor = (valor.split('-')[0].length > 4)?this._excelDate(valor.split('-')[0]):valor;
                    }
                    valor = valor.toString().split('\r\n'); valor=String(valor).replace('\t','');
                    valor = `${valor}`.split('í').join('i').split('ó').join('o').split('á').join('a').split('ú').join('u').split('é').join('e').split('ñ').join('ñ');
                    str += `"${llaves[i]}":"${valor.toString().trim()}",`;
                    if(llaves[i]== 'SUBCATEGORIAS'){
                        //console.log('valor',valor);
                    }
                }
                str = (str.indexOf(',') > -1 )?str.slice(0,-1):str;
                str += `}`;
                if(!filaVacia){
                    datosProcesados.push(JSON.parse(str));
                    //console.log('datosProcesados',datosProcesados);
                }
            });
            //DATOS CON FORMARO DE SISTEMA Y FILTRADOS POR TIPO
            let datosFiltrados =  datosProcesados.filter(ob=>ob.INGRESOGASTO.toUpperCase() == Tipo.toUpperCase());
            objCatalogo.Catalogo_cuentas().then(cuentas=>{
                let datosFormato = [];
                datosFiltrados.forEach(d=>{
                    let cuen;
                    cuentas.Data.forEach(c=>{
                        //console.log('cuenta',d.CUENTA);
                        if(c.Nombre.indexOf(`${d.CUENTA}`) > -1){
                            cuen =  c;
                        }
                    });
                    let idCuenta = (cuen)?cuen.IdCuenta:1;
                    let Usuario = {Datos:{IdUsuario:0,Nombre:`Sistema_carga_automatica`}};
                    datosFormato.push({FormaPago:(d.CUENTA.toUpperCase().trim() =='EFECTIVO')?'Efectivo':'Tarjeta',IdCuenta:idCuenta,Usuario:Usuario,
                    Responsable:`Duarte Medrano Francisco Manuel`,Concepto:`${d.DESCRIPCION}`,Nota:`${d.NOTA}`,Tipo:`${d.CATEGORIA}`,
                    Total: (d.USD)?d.USD:0,Categoria:`${d.CATEGORIA}`,Subcategoria:`${d.SUBCATEGORIAS}`,Adjunto:0, Fecha_gasto: `${d.FECHA}`});
                });
                return resolve(datosFormato);
            }).catch(err=>{
                console.log(err);
                return reject(err);
            })
        });
    }
    _excelDate(serial, val) {
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
     
        let date =  new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
        return moment(date).format('YYYY-MM-DD');
     }
    _enMayusculas(dato, forzar){
        if(forzar && dato != null){
            return dato.toString().toUpperCase();
        }
    return dato;
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
}