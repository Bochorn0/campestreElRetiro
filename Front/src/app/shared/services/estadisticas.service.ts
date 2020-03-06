import { Component, Injectable } from '@angular/core';
import { ApiService } from './API_service';

@Injectable({
  providedIn: "root",
})
export class EstadisticasService {
  constructor(private api : ApiService) {} 
  resumenIngresos(){
    return this.api.get(`/reportes/reporteIngresos`).then(response => {
        return Promise.resolve(response);
      }).catch(err => { return Promise.reject(err); });
    }
  resumenGastos(){
    return this.api.get(`/reportes/reporteGastos`).then(response => {
        return Promise.resolve(response);
      }).catch(err => { return Promise.reject(err); });
    }
  resumenCartera(){
    return this.api.get(`/reportes/reporteClientes`).then(response => {
        return Promise.resolve(response);
      }).catch(err => { return Promise.reject(err); });
    }
  resumenClientes(){
    return this.api.get(`/reportes/reporteClientes`).then(response => {
        return Promise.resolve(response);
      }).catch(err => { return Promise.reject(err); });
    }
  obtenerReporteVentas(Filtros){
    return this.api.post(`/reportes/obtenerReporteVentas`,Filtros).then(response => { 
        return Promise.resolve(response);
      }).catch(err => { return Promise.reject(err); });
    }
  obtenerReporteGastos(Filtros){
    return this.api.post(`/reportes/obtenerReporteGastos`,Filtros).then(response => {
        return Promise.resolve(response);
      }).catch(err => { return Promise.reject(err); });
    }
  obtenerReporteNomina(Filtros){
    return this.api.post(`/reportes/obtenerReporteNomina`,Filtros).then(response => {
        return Promise.resolve(response);
      }).catch(err => { return Promise.reject(err); });
    }
  obtenerReporteDocumentos(Filtros){
    return this.api.post(`/reportes/obtenerReporteDocumentos`,Filtros).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerReporteFinanzas(Filtros){
    return this.api.post(`/reportes/obtenerDetallesFinanzas`,Filtros).then(response => {
        return Promise.resolve(response);
      }).catch(err => { return Promise.reject(err); });
    }
}
