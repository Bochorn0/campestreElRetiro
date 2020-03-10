import { Component, OnInit, ViewChild,Output,EventEmitter} from '@angular/core';
import { routerTransition } from '../../router.animations';
import { EstadisticasService } from '../../shared/services/estadisticas.service';
import { CatalogosService } from '../../shared/services/catalogos.service';
import { WebsiteService } from '../../shared/services/website.service';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import {NgbActiveModal,NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
import * as moment  from 'moment';
import swal  from 'sweetalert2';
import * as _ from 'lodash';
@Component({
    selector: 'app-modulo-ventas',
    templateUrl: './Pagina.component.html',
    animations: [ routerTransition()],
    styleUrls: ['./Pagina.component.scss'],
    providers: [EstadisticasService]
})

export class PaginaComponent implements OnInit {
    websiteContent;
    constructor(public router: Router,private catalogosService : CatalogosService, private websiteService: WebsiteService, private modalService: NgbModal) {
        this.websiteContent = {Inicio:'',Sobre:'',Noticias:'',Contacto:''};
        this.obtenerContenidosSecciones();
    }
    ngOnInit() {}
    obtenerContenidosSecciones(){
        this.websiteService.obtenerSeccionesPagina().then(res=>{
            let result = JSON.parse(JSON.stringify(res));
            if(result[0]){
                console.log('result',result);
                this.websiteContent.Inicio = result.find(r=>r.Seccion == 'Inicio').Contenido;
                this.websiteContent.Sobre = result.find(r=>r.Seccion == 'Sobre').Contenido;
                this.websiteContent.Noticias = result.find(r=>r.Seccion == 'Noticias').Contenido;
                this.websiteContent.Contacto = result.find(r=>r.Seccion == 'Contacto').Contenido;
            }
        }).catch(err=>{
            console.log('err',err);
        });
    }
    guardarCambiosInicio(){ 
      let guardar = `CONTENIDO NUEVO`;
      let datosModificar = {Tipo: 'Inicio',Contenido:guardar};
      this.websiteService.guardarModificacionesWebsite(datosModificar).then(res=>{
        let result = JSON.parse(JSON.stringify(res));
        if(result[0]){
            console.log('result',result);
        }
      }).catch(err=>{
          console.log('err',err);
      });
    }
    _confirmarModal(datosAlert){
        return new Promise ((resolve,reject)=>{
          swal({ title: datosAlert.Titulo,
            html: `<p class="">${datosAlert.Contenido}</p>`,
            type: datosAlert.Tipo,
            showCancelButton: true,
            cancelButtonColor:'#D33',
            confirmButtonText: `<b style="font-size: 18px;">${datosAlert.Confirm}</b>`,
            cancelButtonText: `<b style="font-size: 18px;">Cancelar</b>`
          }).then((result)=>{
            if(result.value){
              return resolve(true);
            }
          }).catch((err)=>{
            return reject(false);
          });
        });
      }
    _delay(ms){
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

}
