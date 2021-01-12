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
    public options: Object = {
//      toolbarButtons:['bold','italic','underline','strikeThrough','|','undo', 'redo'],
//      toolbarButtons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'color', 'emoticons', 'inlineStyle', 'paragraphStyle', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent'],
//     toolbarButtons: [ 'insertHR','alignLeft', 'alignCenter', 'alignRight', 'alignJustify','|', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'clearFormatting', 'html','|','undo', 'redo' ],
      toolBarButtons:{
        'moreText': {
          'buttons': ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'textColor', 'backgroundColor', 'inlineClass', 'inlineStyle', 'clearFormatting'],
          'buttonsVisible': 0
        },
        'moreParagraph': {
          'buttons': ['alignLeft', 'alignCenter', 'formatOLSimple', 'alignRight', 'alignJustify', 'formatOL', 'formatUL', 'paragraphFormat', 'paragraphStyle', 'lineHeight', 'outdent', 'indent', 'quote'],
          'buttonsVisible': 0
        },
        'moreRich': {
          'buttons': ['insertLink', 'insertImage', 'insertVideo', 'insertTable', 'emoticons', 'fontAwesome', 'specialCharacters', 'embedly', 'insertFile', 'insertHR'],
          'buttonsVisible': 0
        },
        'moreMisc': {
          'buttons': ['undo', 'redo', 'fullscreen', 'print', 'getPDF', 'spellChecker', 'selectAll', 'html', 'help'],
          'align': 'right',
          'buttonsVisible': 2
        }
      }
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
    obtenerContenidoOriginal(tipo){
      this.websiteService.obtenerCondenidoOriginal().then(res=>{
        let result = JSON.parse(JSON.stringify(res));
        if(result[0]){
            console.log('result',result);
            if(tipo == 'Inicio'){
              this.websiteContent.Inicio = result.find(r=>r.Seccion == 'Inicio').Contenido;
            }else if(tipo == 'Sobre'){
              this.websiteContent.Sobre = result.find(r=>r.Seccion == 'Sobre').Contenido;
            }else if(tipo == 'Noticias'){
              this.websiteContent.Noticias = result.find(r=>r.Seccion == 'Noticias').Contenido;
            }else if(tipo == 'Contacto'){
              this.websiteContent.Contacto = result.find(r=>r.Seccion == 'Contacto').Contenido;  
            }
        }
    }).catch(err=>{
        console.log('err',err);
    });
    }
    guardarCambiosPagina(pagina){ 
      let contenido = '';
      if(pagina == 'Inicio'){
        contenido = this.websiteContent.Inicio ;
      }else if(pagina == 'Sobre'){
        contenido = this.websiteContent.Sobre ;
      }else if(pagina == 'Noticias'){
        contenido = this.websiteContent.Noticias;
      }else if(pagina == 'Contacto'){
        contenido = this.websiteContent.Contacto;
      }
      let datosModificar = {Tipo:pagina,Contenido:contenido};
      this.websiteService.guardarModificacionesWebsite(datosModificar).then(res=>{
        let result = JSON.parse(JSON.stringify(res));
        if(result[0]){
            console.log('result',result);
        }
        this.obtenerContenidosSecciones();
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
