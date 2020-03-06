import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CatalogosService } from '../../shared/services/catalogos.service';

@Component({
    selector: 'app-contratos',
    templateUrl: './contratos.component.html',
    styleUrls: ['./contratos.component.scss'],
    animations: [routerTransition()],
    providers: [CatalogosService]
})
export class ContratosComponent implements OnInit {
    contenidoReportes;contratosActivos;
    constructor(private catalogosService : CatalogosService) {}

    ngOnInit() {}
    obtenerContratosActivos(event){
        this._limpiarVariables();
        this.catalogosService.obtenerContratos().then(res =>{
            console.log('res',res['Data']);
            this.contenidoReportes = true;
            this.contratosActivos =  { Datos : res['Data']};
        }).catch(err=>{this._limpiarVariables();});
    }
    _limpiarVariables(){
    this.contenidoReportes = this.contratosActivos = false;
    }
}
