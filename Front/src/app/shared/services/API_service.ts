import { environment } from '../../../environments/environment';
import { Component, Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import swal from 'sweetalert2';
//import { JwtService } from './jwt.service';
//import { ErrorObservable } from 'rxjs/Operator/er';

@Injectable({  providedIn: "root", })  
export class ApiService {
  constructor( private http: HttpClient) {}
  _headers(){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('x-auth', localStorage.getItem('x-auth'));
    return headers;
  }
  get(path: string,params = {},noLoad =false) {
    if(!noLoad){
      swal({ title: 'Por favor espere...', allowOutsideClick: false, allowEscapeKey: false, allowEnterKey: false, showCancelButton: false, showConfirmButton: false});
      swal.showLoading();
    }
    return this.http.get(`${environment.apiUrl}${path}`,params).toPromise().then(response => {
      swal.close();
      return Promise.resolve(response);
    }).catch(err => { swal.close(); return Promise.reject(err); });
  }

  put(path: string, body = {}) {
    swal({ title: 'Por favor espere...', allowOutsideClick: false, allowEscapeKey: false, allowEnterKey: false, showCancelButton: false, showConfirmButton: false});
    swal.showLoading();    
    return this.http.put(`${environment.apiUrl}${path}`,body).toPromise().then(response => {
      swal.close();
      return Promise.resolve(response);
    }).catch(err => { swal.close(); return Promise.reject(err); });
  }

  post(path: string, body = {},noLoad = false){
      if(!noLoad){
        swal({ title: 'Por favor espere...', allowOutsideClick: false, allowEscapeKey: false, allowEnterKey: false, showCancelButton: false, showConfirmButton: false});
        swal.showLoading();
      }
      return this.http.post(`${environment.apiUrl}${path}`,body ).toPromise().then(response => {
      swal.close();
      return Promise.resolve(response);
    }).catch(err => { swal.close(); return Promise.reject(err); });
  }

  delete(path){
    swal({ title: 'Por favor espere...', allowOutsideClick: false, allowEscapeKey: false, allowEnterKey: false, showCancelButton: false, showConfirmButton: false});
    swal.showLoading();
    return this.http.delete(`${environment.apiUrl}${path}` ).toPromise().then(response => {
      swal.close();
      return Promise.resolve(response);
    }).catch(err => { swal.close(); return Promise.reject(err); });
  }
}