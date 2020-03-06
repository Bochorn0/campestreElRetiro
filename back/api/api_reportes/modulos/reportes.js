
const mysql =  require("../../../shared/db/mysql_driver");
module.exports = class Reportes {
    Base(solicitud){
        return new Promise((resolve, reject)=>{
            return resolve({status: `ok`});
        })
    }
    obtener_reporte_ingresos(solicitud){
        return new Promise((resolve, reject)=>{
            let datos =  mysql.ejecutar('SELECT * FROM Ventas;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err => { return reject({Data: false, err })});
        });
    }
    obtener_reporte_gastos(solicitud){
        return new Promise((resolve, reject)=>{
            let datos =  mysql.ejecutar('SELECT * FROM Gastos;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err => { return reject({Data: false, err })});
        });
    }
    obtener_reporte_cartera(solicitud){
        return new Promise((resolve, reject)=>{
            let datos =  mysql.ejecutar('SELECT * FROM Clientes;').then((res)=>{
                return resolve({Data: this._procesarDatosQuery(res), error: false});
            }).catch(err => { return reject({Data: false, err })});
        });
    }
    obtener_reporte_clientes(solicitud){
        return new Promise((resolve, reject)=>{
            let datos =  mysql.ejecutar('SELECT * FROM Clientes;').then((res)=>{
                return resolve({Data: this._procesarDatosQuery(res), error: false});
            }).catch(err => { return reject({Data: false, err })});
        });
    }

    reporte_ventas(Filtros){
        console.log('cuerpo', Filtros);
        return new Promise((resolve, reject)=>{
            let condiciones = (Filtros.Fecha_inicio)?`Fecha_venta >= '${Filtros.Fecha_inicio}' AND `:``;
            condiciones += (Filtros.Fecha_fin)?`Fecha_venta <= '${Filtros.Fecha_fin}'`:'';
            console.log(`SELECT * FROM Ventas WHERE ${condiciones};`);
            let datos =  mysql.ejecutar(`SELECT * FROM Ventas  WHERE ${condiciones};`).then((res)=>{
                console.log('res',res);
                return resolve({Data: res, error: false});
            }).catch(err => { return reject({Data: false, err })});
        });
    }

    reporte_finanzas(Filtros){
        let datosReporte = {} ; 
        return new Promise((resolve, reject)=>{
            let condiciones = (Filtros.Fecha_inicio)?`Fecha_venta >= '${Filtros.Fecha_inicio}' AND `:``;
            condiciones += (Filtros.Fecha_fin)?`Fecha_venta <= '${Filtros.Fecha_fin} 23:59:59'`:'';
            mysql.ejecutar(`SELECT * FROM Ventas  JOIN Usuarios as u on u.IdUsuario = Ventas.IdUsuario WHERE ${condiciones};`).then((res)=>{
                datosReporte.DatosVenta = res;
                let condiciones2 = (Filtros.Fecha_inicio)?`Fecha_gasto >= '${Filtros.Fecha_inicio} ' AND `:``;
                condiciones2 += (Filtros.Fecha_fin)?`Fecha_gasto <= '${Filtros.Fecha_fin} 23:59:59'`:'';
                console.log('condiciones',`SELECT * FROM Gastos  JOIN Usuarios as u on u.IdUsuario = Gastos.IdUsuario WHERE ${condiciones2};`);
                return mysql.ejecutar(`SELECT * FROM Gastos  JOIN Usuarios as u on u.IdUsuario = Gastos.IdUsuario WHERE ${condiciones2};`);
            }).then(res2=>{
                datosReporte.DatosGastos = res2;
                //console.log('datos Reporte',datosReporte);
                return resolve({Data: datosReporte, error: false});

            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    _procesarDatosQuery(datos){
        return [{Todos:datos, 
            SaldoVencido: datos.filter(da => da.Saldo > 4000),
            SaldoRegular: datos.filter(da => da.Saldo < 4000), 
            SinContacto: datos.filter(da => da.Contacto.length  == 0),
            ConContacto: datos.filter(da => da.Contacto.length > 0)
        }];
    }
}