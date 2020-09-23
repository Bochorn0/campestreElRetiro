import { Component, OnInit ,Output, Input , EventEmitter , ViewChild} from '@angular/core';
import { routerTransition } from '../../../../router.animations';
import { CatalogosService } from '../../../services/catalogos.service';
import { VentasService } from '../../../services/ventas.service';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import swal from 'sweetalert2';
import * as moment from 'moment';
import {NgbActiveModal,NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-cli-detalle',
    templateUrl: './cli-detalle.component.html',
    styleUrls: ['./cli-detalle.component.scss'],
    animations: [routerTransition()],
    providers: [CatalogosService, VentasService]
})
export class CliDetalleComponent implements OnInit {
    contenidoContrato;terrenoActual;activeModal;modalDatos;
    @Input('datosDetalles') datosDetalles: any
    @Output() public vistaEmision = new EventEmitter();
    constructor(private catalogosService : CatalogosService, private ventasService: VentasService,private modalService: NgbModal) {
        console.log('datosDetalles',this.datosDetalles);
    }
    ngOnInit(){
        console.log('detalle',this.datosDetalles);
    }
    volverTodosClientes(){
        this.vistaEmision.emit({Todos:true});
    }
    abrirModal(content){ 
      console.log('terreno actual',this.terrenoActual);
      // this.terrenoActual.Latitud = `${this.terrenoActual.Latitud}`
      // this.terrenoActual.Longitud = `${this.terrenoActual.Longitud}`
      this.activeModal = this.modalService.open(content, {windowClass: 'modal-holder', size: 'lg'});
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
    guardarContrato(){
      let datosTerreno = this.terrenoActual;
//      console.log('contenidoContrato',this.contenidoContrato);
      let datosGuardar = {Contenido:this.contenidoContrato, datosCliente :this.datosDetalles,datosTerreno:datosTerreno,Ext: 'html'};
      this.ventasService.guardarContrato(datosGuardar).then(res=>{
          swal('Exito',`el contrato fue guardado con exito`,'success');
      }).catch(err=>{console.log('err',err);
          swal('Error',`ocurrio un error al guardar el contrato favor de verificar los datos`,'error');
      })
    }
    obtenerPlantillaClientes(){
      console.log('entro clientes');
      this.catalogosService.obtenerPlantillaClientes().then( res=>{
          console.log('res',res);
          this.descargarPlantilla(res['String'], 'Formato_general_clientes');
      }).catch(err=>{
          console.log('error al obtener plantilla', err);
      })
  }
  descargarPlantilla(data, nombre = "Formato_general_clientes_") {
      let dwldLink = document.createElement("a");
      let url = 'data:application/vnd.ms-excel;base64,' + data;
      let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
      if (isSafariBrowser) {
          dwldLink.setAttribute("target", "_blank");
      }
      dwldLink.setAttribute("href", url);
      dwldLink.setAttribute("download", `${nombre}${new Date().toLocaleDateString()}.xlsx`);
      dwldLink.style.visibility = "hidden";
      document.body.appendChild(dwldLink);
      dwldLink.click();
      document.body.removeChild(dwldLink);
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