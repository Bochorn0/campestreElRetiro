import { Component, OnInit, ViewChild } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { EstadisticasService } from '../../shared/services/estadisticas.service'
import { CatalogosService } from '../../shared/services/catalogos.service'
import * as moment  from 'moment';
import * as _ from 'lodash';
@Component({
    selector: 'app-finanzas',
    templateUrl: './finanzas.component.html',
    styleUrls: ['./finanzas.component.scss'],
    animations: [routerTransition()],
    providers: [EstadisticasService, CatalogosService]
})

export class FinanzasComponent implements OnInit {
verCatalogoCuentas; verEstadoFinanciero;vistaCentro;panelVisualizar;fInicio;fFin;
constructor(private estadisticasService: EstadisticasService, private catalogosService : CatalogosService) {
//    this.verCatalogoCuentas = this.verEstadoFinanciero = false;
    //this.estadosFinancieros({});
    this.panelVisualizar = 'Ayuda';
}
catalogoCuentas(){
    this._limpiarVista();
    this._delay(100).then(res=>{
        this.verCatalogoCuentas = true;
        this.vistaCentro = true;
    });
}
estadosFinancieros(event){
    this._limpiarVista();
    this._delay(100).then(res=>{
        this.verEstadoFinanciero = true;
        this.vistaCentro = true;
    });
}
obtenerVentas(){
    let Filtros = {Fecha_inicio: this.fInicio, Fecha_fin: this.fFin};
    // this.estadisticasService.obtenerVentas(Filtros).then(res=>{
    //     console.log('res',res);
    // }).catch(err=>{
    //     console.log('err',err);
    // });
}
_limpiarVista(){
    this.panelVisualizar = '';
    this.verCatalogoCuentas = this.verEstadoFinanciero = this.vistaCentro = false;
}
_delay(ms){
    return new Promise( resolve => setTimeout(resolve, ms) );
}
ngOnInit() {}
}


