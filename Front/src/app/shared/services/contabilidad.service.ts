import { Component, Injectable } from '@angular/core';
import { ApiService } from './API_service';

@Injectable({
  providedIn: "root",
})
export class ContabilidadService {
  constructor(private api : ApiService) {}
  //134.209.238.227
  obtenerGastos(){
    return this.api.get(`/gastos/obtenerGastos`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  guardarNuevoGasto(datos){
    return this.api.post(`/gastos/guardarNuevoGasto`, datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  borrarGasto(obj){
    return this.api.get(`/gastos/borrarGasto?Id=${obj.IdGasto}`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  borrarMultiplesGastos(datos){
    return this.api.post(`/gastos/borrarGastosMultiples`, datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  obtenerFolioGasto(){
    return this.api.get(`/gastos/obtenerFolioGasto`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  subirExcelPartidas(fileObject){
    return this.api.post(`/gastos/subirExcelPartidas`,fileObject).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
}
