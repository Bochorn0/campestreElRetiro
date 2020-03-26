import { Component, Injectable } from '@angular/core';
import { ApiService } from './API_service';

@Injectable({
  providedIn: "root",
})
export class WebsiteService {
  constructor(private api : ApiService) {} 
  resumenIngresos(){
    // return this.api.get(`/reportes/reporteIngresos`).then(response => {
    //     return Promise.resolve(response);
    //   }).catch(err => { return Promise.reject(err); });
  }
  obtenerSeccionesPagina(){
    return this.api.post(`/website/obtenerContenidoSitioWeb`,{}).then(response => { 
        return Promise.resolve(response);
      }).catch(err => { return Promise.reject(err); });
  }
  obtenerCondenidoOriginal(){
    return this.api.post(`/website/obtenerCondenidoOriginal`,{}).then(response => { 
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  guardarModificacionesWebsite(datos){
    return this.api.post(`/website/guardarModificacionesWeb`,datos).then(response => { 
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
}
