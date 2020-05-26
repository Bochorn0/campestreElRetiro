import { Component, OnInit ,Output, Input , EventEmitter , ViewChild} from '@angular/core';
import { routerTransition } from '../../../../router.animations';
import { CatalogosService } from '../../../services/catalogos.service';
import { VentasService } from '../../../services/ventas.service';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import swal from 'sweetalert2';
import * as moment from 'moment';
@Component({
    selector: 'app-detalles-cliente',
    templateUrl: './detalles-cliente.component.html',
    styleUrls: ['./detalles-cliente.component.scss'],
    animations: [routerTransition()],
    providers: [CatalogosService, VentasService]
})
export class DetalleClienteComponent implements OnInit {
    contenidoContrato;
    @Input('datosDetalles') datosDetalles: any
    @Output() public vistaEmision = new EventEmitter();
    constructor(private catalogosService : CatalogosService, private ventasService: VentasService) {
        console.log('datosDetalles',this.datosDetalles);
    }
    ngOnInit(){
        console.log('datosDetalles',this.datosDetalles);
    }
    volverTodosClientes(){
        this.vistaEmision.emit({Todos:true});
    }
    obtenerContratoTerreno(t){
        console.log(this.datosDetalles);
        let datos_contrato = {datosTerreno:t, datosCliente: this.datosDetalles};
        this.catalogosService.obtenerDatosContrato(datos_contrato).then(res=>{
            if(res['Data']){
                this.contenidoContrato =  res['Data'];
            }else{
                this.contenidoContrato = 'Sin contrato ';
            }
        }).catch(err=>{this.contenidoContrato = 'Sin contrato ';})
    }    
    enviarContratoCorreo(){
        return new Promise ((resolve,reject)=>{
        let datosModal =  {Titulo: 'Advertencia',Contenido:`Vas a Enviar el contrato por correo, estas seguro?`, Tipo:'warning', Confirm: 'Si Enviar'}  
        return this._confirmarModal({},datosModal).then(da=>{
            let contenido = `<!DOCTYPE html><html><head><title>Recibo</title></head><body>${this.contenidoContrato}</body></html>`;
            let datosCorreo =  {Para: `bocho_sup@hotmail.com`, Contenido: contenido, Asunto: `Contrato`}
            return this.ventasService.enviarReciboCorreo(datosCorreo);
        }).then(res=>{
            return resolve({});
        }).catch(err=>{console.log('err',err); return resolve({});});
        });
    }
    _confirmarModal(datos, datosAlert){
        return new Promise ((resolve,reject)=>{
          swal({ title: datosAlert.Titulo,
            html: `<p class="">${datosAlert.Contenido}</p>`,
            type: datosAlert.Tipo,
            showCancelButton: true,
            cancelButtonColor:'#D33',
            confirmButtonText: datosAlert.Confirm
          }).then((result)=>{
            if(result.value){
              return resolve(true);
            }
          }).catch((err)=>{
            return reject(false);
          });
        });
      }
}