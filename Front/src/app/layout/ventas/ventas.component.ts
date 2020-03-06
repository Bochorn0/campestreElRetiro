import { Component, OnInit, ViewChild,Output,EventEmitter} from '@angular/core';
import { routerTransition } from '../../router.animations';
import { EstadisticasService } from '../../shared/services/estadisticas.service'
import * as moment  from 'moment';
import * as _ from 'lodash';
@Component({
    selector: 'app-ventas',
    templateUrl: './ventas.component.html',
    styleUrls: ['./ventas.component.scss'],
    animations: [routerTransition()],
    providers: [EstadisticasService]
})

export class VentasComponent implements OnInit {
    //componentes
    @ViewChild('contratoGenerado')contratoGenerado;
    clienteNuevo;datosContrato;cotizacionNueva;
    vistaCentro;clientesCatalogos;
    @Output() public contratos = new EventEmitter();
    constructor() {

        //this.nuevoMantenimiento();
        this.datosContrato = false;
    }
    ngOnInit() {}
    catalogoClientes(){
        this._limpiarVistaYVariables();
        this._delay(100).then(res=>{
            this.clientesCatalogos = true;
            this.vistaCentro = true;
        });
    }
    nuevoCliente(){
        this._limpiarVistaYVariables();
        this._delay(100).then(res=>{
            this.clienteNuevo = true;
            this.vistaCentro = true;
        });
    }
    imprimirPagare(obj){
        console.log('obj',obj);
    }
    nuevaCotizacion(){
        this._limpiarVistaYVariables();
        this._delay(100).then(res=>{
            this.cotizacionNueva = true;
            this.vistaCentro = true;
        });
    }
    procesarContratos(event){
/*        let datosEvent = this._datosPrueba();
        console.log('datos_prueba',datosEvent);*/
        this._limpiarVistaYVariables();
        this._delay(100).then(res=>{
            this.vistaCentro = true;
            this.datosContrato = event;
        });
    }
    _limpiarVistaYVariables(){
        this.vistaCentro = this.clientesCatalogos = this.datosContrato = this.clienteNuevo = this.cotizacionNueva  = false;
    }
    _delay(ms){
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

}
