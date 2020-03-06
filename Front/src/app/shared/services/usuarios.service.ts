import { Component, Injectable } from '@angular/core';
import { ApiService } from './API_service';

@Injectable({
  providedIn: "root",
})
export class UsuariosService {
  constructor(private api : ApiService) {}
  
  login(datosLogin){
    return this.api.post(`/usuarios/login`,datosLogin).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  guardarApartadoDocumento(datos){
    return this.api.post(`/usuarios/apartarDocumento`,datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  guardarNuevoUsuario(datos){
    return this.api.post(`/usuarios/guardarNuevoUsuario`,datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  guardarNuevoPerfil(datos){
    return this.api.post(`/usuarios/guardarNuevoPerfil`,datos).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  borrarApartadoDocumento(obj){
    return this.api.get(`/usuarios/borrarApartadoDocumento?ID=${obj.IdApartado}`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  borrarUsuario(obj){
    return this.api.get(`/usuarios/borrarUsuario?ID=${obj.IdUsuario}`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  borrarPuesto(obj){
    return this.api.get(`/usuarios/borrarPerfil?ID=${obj.IdPerfil}`).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  actualizarDatosUsuario(datosActualizar){
    return this.api.post(`/usuarios/actualizarDatosUsuario`,datosActualizar).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
  actualizarDatosPerfil(datosActualizar){
    return this.api.post(`/usuarios/actualizarDatosPerfil`,datosActualizar).then(response => {
      return Promise.resolve(response);
    }).catch(err => { return Promise.reject(err); });
  }
}
