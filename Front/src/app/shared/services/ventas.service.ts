import { Component, Injectable } from '@angular/core';
import { ApiService } from './API_service';

@Injectable({
  providedIn: "root",
})
export class VentasService {
  constructor(private api : ApiService) {}
  guardarNuevoIngreso(datos){
    return this.api.post(`/ingresos/guardarNuevoIngreso`, datos,true).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  guardarNuevoMantenimiento(datos){
    return this.api.post(`/ingresos/guardarNuevoMantenimiento`, datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  guardarNuevoCliente(DatosCliente){
    return this.api.post(`/ingresos/guardarNuevoCliente`,DatosCliente).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  editarCliente(datos){
    return this.api.post(`/ingresos/editarCliente`, datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  borrarGasto(obj){
    return this.api.get(`/ingresos/borrar?Id=${obj.IdCliente}`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerFolioVenta(){
    return this.api.get(`/ingresos/obtenerFolioVenta`,{},true).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerFolioMantenimiento(){
    return this.api.get(`/ingresos/obtenerFolioMantenimiento`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerMensualidadesCliente(obj){
    return this.api.get(`/ingresos/obtenerMensualidades?Id=${obj.IdCliente}`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerAnualidadesCliente(obj){
    return this.api.get(`/ingresos/obtenerAnualidades?Id=${obj.IdCliente}`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerMantenimientosCliente(obj){
    return this.api.post(`/ingresos/obtenerMantenimientos`, obj).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  borrarCliente(obj){
    return this.api.post(`/ingresos/borrarCliente`,obj).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  guardarCotizacion(Datos){
    return this.api.post(`/ingresos/guardarCotizacion`, Datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  guardarContrato(datos){    
    return this.api.post(`/ingresos/guardarNuevoContrato`,datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  guardarDatosArchivo(datos){
    return this.api.post(`/ingresos/guardarDatosArchivo`,datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerDatosCarga(){
    return this.api.post(`/ingresos/obtenerDatosCarga`,{}).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  guardarDatosBaseDatos(){
    return this.api.post(`/ingresos/guardarDatosBaseDatos`,{}).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  enviarReciboCorreo(datosCorreo){
    return this.api.post(`/ingresos/enviarCorreo`,datosCorreo).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerVentasPorEmpleado(datosUsuario){
    return this.api.post(`/ingresos/obtenerVentasEmpleado`,datosUsuario).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerPdfRecibo(datos){
    return this.api.post(`/ingresos/reciboPDF`,datos,true).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerPdfPagare(datos){
    return this.api.post(`/ingresos/pagarePDF`,datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  afectarSaldosDatos(){
    return this.api.post(`/ingresos/afectarSaldosDatos`,{}).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerMantenimientoCalculado(datosConsulta){
    return this.api.post(`/ingresos/obtenerMantenimientoCalculado`,datosConsulta).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
}