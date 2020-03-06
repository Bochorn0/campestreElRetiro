import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { EstadisticasService } from '../../shared/services/estadisticas.service'
import * as moment  from 'moment';
import * as _ from 'lodash';
@Component({
    selector: 'app-cobranza',
    templateUrl: './cobranza.component.html',
    styleUrls: ['./cobranza.component.scss'],
    animations: [routerTransition()],
    providers: [EstadisticasService]
})

export class CobranzaComponent implements OnInit {
datosMantenimiento;ingresoNuevo;
vistaCentro;clientesCatalogos;mantenimientoNuevo;cotizacionNueva;
datosVenta;datosCotizador;ingresosExtraNuevo;
@Output() public contratos = new EventEmitter();
constructor() {
    this.ventaRegular();
//    this.nuevoIngresoExtra();
}
ngOnInit() {}
ventaRegular(){
    this._limpiarVistaYVariables();
    this._delay(100).then(res=>{
        this.ingresoNuevo = true;
        this.vistaCentro = true;
    })
}

nuevoIngresoExtra(){
    this._limpiarVistaYVariables();
    this._delay(100).then(res=>{
        this.ingresosExtraNuevo = true;
        this.vistaCentro = true;
    })
}
catalogoClientes(){
    this._limpiarVistaYVariables();
    this._delay(100).then(res=>{
        this.clientesCatalogos = true;
        this.vistaCentro = true;
    });
}
nuevoMantenimiento(){
    this._limpiarVistaYVariables();
    this._delay(100).then(res=>{
        this.mantenimientoNuevo = true;
        this.vistaCentro = true;
    })
}
nueva_operacion(evento){
    this._limpiarVistaYVariables();
    this._delay(100).then(res=>{
        this.vistaCentro = true;
        if(evento.Operacion == 1){
            this.ingresoNuevo = true;
            this.datosVenta = evento.cliente;
        }else if(evento.Operacion == 2){
            this.mantenimientoNuevo = true;
            this.datosMantenimiento = evento.cliente;
        }
    });
}
_limpiarVistaYVariables(){
    this.vistaCentro = this.clientesCatalogos = this.ingresoNuevo = this.mantenimientoNuevo = this.datosMantenimiento = this.cotizacionNueva =  this.ingresosExtraNuevo = false;
}
_delay(ms){
    return new Promise( resolve => setTimeout(resolve, ms) );
}

}
