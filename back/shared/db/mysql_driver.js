var mysql = require('mysql');
module.exports = {
    ejecutar (query){
        return new Promise((resolve,reject)=>{
            var conexion = mysql.createConnection({
                host     : 'localhost',
                user     : 'root',
                password : 'Sakaunperikin24*',
                database : 'ElRetiro',
                acquireTimeout: 100000000000000000
              });
            conexion.connect();
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
            conexion.end();
        })
    }
}
