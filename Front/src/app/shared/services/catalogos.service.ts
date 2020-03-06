import { Component, Injectable } from '@angular/core';
import { ApiService } from './API_service';

//@Component({  providers: [ApiService]})
@Injectable({  providedIn: "root", })  
export class CatalogosService {
  constructor(private api : ApiService) {}

  clientesActivos() {
    return this.api.get(`/catalogos/clientes`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  clientesTerrenos() {
    return this.api.get(`/catalogos/obtenerRelacionesTerrenos`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerCatalogoVentas() {
    return this.api.get(`/catalogos/catalogoTipoVentas`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerCatalogoGastos() {
    return this.api.get(`/catalogos/catalogoTipoGastos`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerCatalogoCategorias() {
    return this.api.get(`/catalogos/catalogoGastos`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  ventas() {
    return this.api.get(`/catalogos/ventas`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerEmpleados() {
    return this.api.get(`/catalogos/empleados`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerContratos() {
    return this.api.get(`/catalogos/contratos`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerDocumentos() {
    return this.api.get(`/catalogos/documentos`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerUsuarios() {
    return this.api.get(`/catalogos/usuarios`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerTiposDocumentos() {
    return this.api.get(`/catalogos/tiposDocumentos`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerPuestos() {
    return this.api.get(`/catalogos/puestos`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerCotizaciones() {
    return this.api.get(`/catalogos/cotizaciones`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerCuentasEspeciales() {
    return this.api.get(`/catalogos/cuentas_especiales`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  guardarNuevaCuenta(datosCuenta) {
    return this.api.post(`/catalogos/guardarNuevaCuentaEspecial`, datosCuenta).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  actualizarCuentaEspecial(datosUpdate) {
    return this.api.post(`/catalogos/actualizarCuentaEspecial`, datosUpdate).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  borrarCuentaEspecial(obj) {
    return this.api.get(`/catalogos/borrarCuentaEspecial?Id=${obj.IdCuenta}`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  desasignarCotizacion(obj) {
    return this.api.post(`/catalogos/desasignarCotizacion`, obj).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  activarCotizacion(obj) {
    return this.api.post(`/catalogos/activarCotizacion`, obj).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerDatosTerrenoPorCliente(obj) {
    return this.api.get(`/catalogos/obtenerTerrenoPorId?Id=1`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerTerrenos() {
    return this.api.get(`/catalogos/obtenerTerrenos`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerDatosContrato(datos_contrato) {
    return this.api.post(`/catalogos/obtenerDatosContrato`, datos_contrato).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  borrarCategoria(datos) {
    return this.api.post(`/catalogos/borrarCategoria`, datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  actualizarDatosCliente(datosCliente) {
    return this.api.post(`/catalogos/actualizarDatosCliente`, datosCliente).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  actualizarDatosMantenimiento(datosMantenimiento) {
    return this.api.post(`/catalogos/actualizarDatosMantenimiento`, datosMantenimiento).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  actaulizarCategorias(datos) {
    return this.api.post(`/catalogos/actaulizarDatosCategorias`, datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  guardarNuevaCategoria(datos) {
    return this.api.post(`/catalogos/guardarNuevaCategoria`, datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  guardarNuevoDocumento(datos) {
    return this.api.post(`/catalogos/guardarNuevoTipoDocumento`, datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  guardarNuevoEmpleado(datos) {
    return this.api.post(`/catalogos/guardarNuevoEmpleado`, datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  guardarNominaEmpleado(datos) {
    return this.api.post(`/catalogos/guardarNominaEmpleado`, datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  subirExcelTerrenos(fileObject) {
    return this.api.post(`/catalogos/subirExcelTerrenos`, fileObject).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  actualizarDatosTerreno(datos) {
    return this.api.post(`/catalogos/actualizarTerreno`, datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  borrarTerreno(datos) {
    return this.api.post(`/catalogos/borrarTerreno`, datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  borrarMultiplesTerrenos(datos) {
    return this.api.post(`/catalogos/borrarTerrenosMultiples`, datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerPlantillaTerenos() {
    return this.api.get(`/catalogos/plantillaTerrenos`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerPlantillaGastos() {
    return this.api.get(`/catalogos/plantillaGastos`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerDatosTodos(){
    return this.api.get(`/catalogos/datosTodos`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  modificarDatosTodos(datos){
    console.log('datos',datos);
    return this.api.post(`/catalogos/modificarDatostodos`, datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  borrarRegistroDatosTodos(datos){
    return this.api.post(`/catalogos/borrarRegistroDatosTodos`, datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerProspectosVendedor(datos){
    return this.api.post(`/catalogos/obtenerProspectosVentas`, datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  guardarProspectoVendedor(datos){
    return this.api.post(`/catalogos/guardarProspectosVentas`, datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  actualizarProspectoVendedor(datos){
    return this.api.post(`/catalogos/actualizarProspectosVentas`, datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
}
