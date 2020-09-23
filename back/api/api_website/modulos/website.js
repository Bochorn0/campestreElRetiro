const mysql =  require("../../../shared/db/mysql_driver");
const moment =  require("moment");
var fs = require("fs-extra");
module.exports = class Website {
    Base(solicitud){
        return new Promise((resolve, reject)=>{
            return resolve({status: `ok`});
        })
    }
    obtener_contenido_website(solicitud){
        let Website = []; 
        return new Promise((resolve, reject)=>{
            this._leerArchivo(`${process.env.Website}Inicio.html`).then(str=>{
                Website.push({Seccion:'Inicio',Contenido: str});
                return this._leerArchivo(`${process.env.Website}about.html`);
            }).then(str=>{
                Website.push({Seccion:'Sobre',Contenido: str});
                return this._leerArchivo(`${process.env.Website}blog.html`);
            }).then(str=>{
                Website.push({Seccion:'Noticias',Contenido: str});
                return this._leerArchivo(`${process.env.Website}contact.html`);
            }).then(str=>{
                Website.push({Seccion:'Contacto',Contenido: str});
                return resolve(Website);
            }).catch(err=>{
                console.log('err',err);
                return reject(err);
            });
        })
    }
    obtener_contenido_original_website(solicitud){
        let Website = [];
        return new Promise((resolve, reject)=>{
            this._leerArchivo(`${process.env.Respaldo_web}Inicio.html`).then(str=>{
                Website.push({Seccion:'Inicio',Contenido: str});
                return this._leerArchivo(`${process.env.Respaldo_web}about.html`);
            }).then(str=>{
                Website.push({Seccion:'Sobre',Contenido: str});
                return this._leerArchivo(`${process.env.Respaldo_web}blog.html`);
            }).then(str=>{
                Website.push({Seccion:'Noticias',Contenido: str});
                return this._leerArchivo(`${process.env.Respaldo_web}contact.html`);
            }).then(str=>{
                Website.push({Seccion:'Contacto',Contenido: str});
                return resolve(Website);
            }).catch(err=>{
                console.log('err',err);
                return reject(err);
            });
        })
    }
    modificar_archivos_website(datos){
        let url = `./shared/SitioOficial/`;
        return new Promise((resolve, reject)=>{
            return Promise.resolve({}).then(res=>{
                if(datos.Tipo == 'Inicio'){
                    return this._escribirarchivo(`${process.env.Website}Inicio.html`,datos.Contenido);
                }else if(datos.Tipo == 'Sobre'){
                    return this._escribirarchivo(`${process.env.Website}about.html`,datos.Contenido);
                }else if(datos.Tipo == 'Noticias'){
                    return this._escribirarchivo(`${process.env.Website}blog.html`,datos.Contenido);
                }else if(datos.Tipo == 'Contacto'){
                    return this._escribirarchivo(`${process.env.Website}contact.html`,datos.Contenido);
                }else{
                    return Promise.resolve({});
                }
            }).then(res=>{
                return resolve({Procesado:true});
            }).catch(err=>{
                console.log('err',err);
            });
        });
    }
    _escribirarchivo(file,content){
        return new Promise((resolve, reject)=>{
            fs.writeFile(file, content, (err)=> {
                if(err) {
                    console.log(err);
                    return reject(err);
                }
                console.log("File saved successfully!");
                return resolve({modificado:true});
            });
        });
    }
    _leerArchivo(file){
        return new Promise((resolve, reject)=>{
            fs.readFile(`${file}`,'utf-8', (err, data) => {
                if (err){
                    return reject(err);
                }
                return resolve(data);
            });            
        });
    }
}