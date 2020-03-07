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
        let Website = []; let url = `./shared/RespaldoSitio/`;
        return new Promise((resolve, reject)=>{
            this._leerArchivo(`${url}Inicio.html`).then(str=>{
                Website.push({Seccion:'Inicio',Contenido: str});
                return this._leerArchivo(`${url}about.html`);
            }).then(str=>{
                Website.push({Seccion:'Sobre',Contenido: str});
                return this._leerArchivo(`${url}blog.html`);
            }).then(str=>{
                Website.push({Seccion:'Noticias',Contenido: str});
                return this._leerArchivo(`${url}contact.html`);
            }).then(str=>{
                Website.push({Seccion:'Contacto',Contenido: str});
                return resolve(Website);
            }).catch(err=>{
                console.log('err',err);
                return reject(err);
            });
        })
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