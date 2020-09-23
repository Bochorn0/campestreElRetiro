import { Component, OnInit,ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { routerTransition } from '../../../../router.animations';
import { CatalogosService } from '../../../services/catalogos.service';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import swal from 'sweetalert2';
import * as moment from 'moment';
import {NgbActiveModal,NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';



@Component({
    selector: 'app-catalogos-terrenos',
    templateUrl: './catalogos.component.html',
    styleUrls: ['./catalogos.component.scss'],
    animations: [routerTransition()],
    providers: [CatalogosService]
})
export class CatalogosTerrenosComponent implements OnInit {
    contenidoReportes;contratosActivos;
    terrenosTodos;datosTerrenos;vistaCentro;
    chksTerrenos = [];parcelas = []; etapas=[]; lotes = []; estatusTodos = [];
    parcelaFiltro;loteFiltro;etapaFiltro;estatusFiltro;
    detalleTerrenos;textoTerreno;activeModal;modalDatos;terrenoActual;
    @ViewChild('datatableTerrenos')datatableTerrenos;
    frmSolicitud: FormGroup; // Formulario de solicitud
    constructor(private catalogosService : CatalogosService,private fb: FormBuilder,private modalService: NgbModal) {
        this.frmSolicitud = fb.group({
            'File': [null]
        });
//        this.parcelaFiltro = this.loteFiltro = this.etapaFiltro =  this.estatusFiltro = 'TODOS';
        this.verCatalogoTerrenos({});
    }            
    ngOnInit() { }
    obtenerContratosActivos(event){
        this._limpiarVariables();
        this.catalogosService.obtenerContratos().then(res =>{
            //console.log('res',res['Data']);
            this.contenidoReportes = true;
            this.contratosActivos =  { Datos : res['Data']};
        }).catch(err=>{this._limpiarVariables();});
    }
    abrirModal(content){ 
        console.log('terreno actual',this.terrenoActual);
        // this.terrenoActual.Latitud = `${this.terrenoActual.Latitud}`
        // this.terrenoActual.Longitud = `${this.terrenoActual.Longitud}`
        this.activeModal = this.modalService.open(content, {windowClass: 'modal-holder', size: 'lg'});
    }
    filtrarTerrenos(){
        let filtrados = this.terrenosTodos;
        if((this.textoTerreno && this.textoTerreno != '') && filtrados){
            let coincidencias = [];
            filtrados.forEach((dat)=>{
                let validado = false;
                if(`${dat.etapa}`.toUpperCase().indexOf(this.textoTerreno.toUpperCase()) > -1){
                    validado = true;
                }
                if(`${dat.parcela}`.toUpperCase().indexOf(this.textoTerreno.toUpperCase()) > -1){
                    validado = true;
                }
                if(`${dat.Actual}`.toUpperCase().indexOf(this.textoTerreno.toUpperCase()) > -1){
                    validado = true;
                }
                if(`${dat.Asignado}`.toUpperCase().indexOf(this.textoTerreno.toUpperCase()) > -1){
                    validado = true;
                }
                if(`${dat.Original}`.toUpperCase().indexOf(this.textoTerreno.toUpperCase()) > -1){
                    validado = true;
                }
                if(`${dat.Estado}`.toUpperCase().indexOf(this.textoTerreno.toUpperCase()) > -1){
                    validado = true;
                }
                if(`${dat.Superficie}`.toUpperCase().indexOf(this.textoTerreno.toUpperCase()) > -1){
                    validado = true;
                }
                if(`${dat.Latitud}`.toUpperCase().indexOf(this.textoTerreno.toUpperCase()) > -1){
                    validado = true;
                }
                if(`${dat.Longitud}`.toUpperCase().indexOf(this.textoTerreno.toUpperCase()) > -1){
                    validado = true;
                }
                if(`TER-${dat.IdTerreno}`.toUpperCase().indexOf(this.textoTerreno.toUpperCase()) > -1){
                    validado = true;
                }
                if(`${dat.lote}`.toUpperCase().indexOf(this.textoTerreno.toUpperCase()) > -1){
                    validado = true;
                }
                if(validado){ coincidencias.push(dat);}
            });
            filtrados = (coincidencias[0])?coincidencias:filtrados;
        }
        if(this.parcelaFiltro){
            filtrados = (this.parcelaFiltro != 'TODOS' && this.parcelas.find(o=>o.parcela == `${this.parcelaFiltro}`))?filtrados.filter(f=>f.parcela == `${this.parcelaFiltro}`):filtrados;
        }
        if(this.loteFiltro){
            filtrados = (this.loteFiltro && this.loteFiltro != 'TODOS' && this.lotes.find(o=>o.lote == `${this.loteFiltro}`))?filtrados.filter(f=>f.lote == `${this.loteFiltro}`):filtrados;
        }
        if(this.etapaFiltro){
            filtrados = (this.etapaFiltro && this.etapaFiltro != 'TODOS' && this.etapas.find(o=>o.etapa == `${this.etapaFiltro}`))?filtrados.filter(f=>f.etapa == `${this.etapaFiltro}`):filtrados;
        }
        if(this.estatusFiltro){
            filtrados = (this.estatusFiltro && this.estatusFiltro != 'TODOS' && this.estatusTodos.find(o=>o.Estatus == `${this.estatusFiltro}`))?filtrados.filter(f=>f.Estado == `${this.estatusFiltro}`):filtrados;
//            filtrados = (this.estatusFiltro && this.estatusFiltro != 'TODOS')?filtrados.filter(f=>f.Estado == this.estatusFiltro):filtrados;
        }
        this.datosTerrenos = filtrados;
        if(this.datosTerrenos[0]){
            this._recorrerFiltros(filtrados);
        }

    }
    cambiarCoordenadas(event){
        console.log('event',event);
        this.detalleTerrenos.Latitud = event.coords.lat;
        this.detalleTerrenos.Longitud = event.coords.lng;
    }

    guardarCambiosTerreno(){
        console.log('guardar datos',this.detalleTerrenos);
        if(!this.detalleTerrenos.Asignado){
            this.detalleTerrenos.Asignado = 0
        }
        if(!this.detalleTerrenos.Activo){
            this.detalleTerrenos.Activo = 0
        }
        console.log('guardar datos',this.detalleTerrenos);
        this.catalogosService.actualizarDatosTerreno(this.detalleTerrenos).then(res=>{
            let tipo = res['Tipo'];
            swal('Exito', `${res['Operacion']}`, tipo);
            this.verCatalogoTerrenos({});
            this.detalleTerrenos = false;
        }).catch(err=>{
            this.detalleTerrenos = false;
            console.log('error obteniendo catalogo', err);
        })
    }
    verCatalogoTerrenos(event){
        this.catalogosService.obtenerTerrenos().then(res=>{
            //let datos = this._ordenarDatosTerrenos(res['Data']);
            let datos = res['Data'];
            datos.map(d=>d.Color = 'purple');
            console.log('datos',datos);
            this._recorrerFiltros(datos);
            // console.log('par',this.parcelas);
            // console.log('lot',this.lotes);
            // console.log('eta',this.etapas);
            this.vistaCentro = true;
            this.terrenosTodos =  datos;
            this.datosTerrenos = datos;
            /*
            let datosOrdenados = {Opciones:{Eliminar:true,Seleccionar: true,Editar:true,Detalles:true},Datos:datos};
            console.log('res',this.terrenosTodos);
            this.datosTerrenos = datosOrdenados;
            if(this.datatableTerrenos != null){
                this.datatableTerrenos._reiniciarRegistros(datosOrdenados);
            }
            this.datosTerrenos = datosOrdenados;*/
            console.log('res',this.datosTerrenos);
        }).catch(err=>{
            console.log('err',err);
        });
    }
    importar_excel($event): void {
        let fileObject;
        this.importarArchivo($event).then((resultado: any) => {
            if (resultado) {
                fileObject = { file: resultado.substring(78), Tipo: `Gasto` }
            }
            this.frmSolicitud.controls["File"].setValue(null);
            return this.catalogosService.subirExcelTerrenos(fileObject);
        }).then(res=>{
            console.log('res',res);
            let tipo = res['Tipo'];
            swal('Exito', `${res['Operacion']}`, tipo);
            this.chksTerrenos = [];
            return this._delay(1000);
        }).then(re=>{
            this.verCatalogoTerrenos({});
        }).catch(error => {
            console.log('error',error);
        });
    }
    editarTerreno(obj){
        let datosActualizar =  {IdTerreno: obj['Obj'].IdTerreno,Lote: `${obj['Lote']}`,Parcela: `${obj['Parcela']}`,Estapa: `${obj['Lote']}`,Propietario: obj['Lote'],Superficie: `${obj['Superficie']}`, Estado: `${obj['Estado']}`, Asignado : `${obj['Asignado']}`, Activo: `${obj['Activo']}`};
        console.log('datosActualizar',datosActualizar); 
        this.catalogosService.actualizarDatosTerreno(datosActualizar).then(res=>{
            let tipo = res['Tipo'];
            swal('Exito', `${res['Operacion']}`, tipo);
            this.verCatalogoTerrenos({});
        }).catch(err=>{
            console.log('error obteniendo catalogo', err);
        })
    }
    borrarTerreno(obj){
        console.log('obj',obj);
        let datos = {IdTerreno: obj.IdTerreno };
        this.catalogosService.borrarTerreno(datos).then( res=>{
            let tipo = res['Tipo'];
            swal('Exito', `${res['Operacion']}`, tipo);
            this.verCatalogoTerrenos({});
        }).catch(err=>{
            console.log('error obtener gastos', err);
        })
    }
    obtenerPlantillaTerrenos(){
        this.catalogosService.obtenerPlantillaTerenos().then( res=>{
            console.log('res',res);
            this.descargarPlantilla(res['String'], 'Plantilla_terrenos_');
        }).catch(err=>{
            console.log('error al obtener plantilla', err);
        })
    }
    descargarPlantilla(data, nombre = "Plantilla_terrenos_") {
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
    borrarMultiplesTerrenos(){
        if(this.chksTerrenos.length > 0){
            console.log('chks',this.chksTerrenos);
            let ter_ids = ``;
            this.chksTerrenos.forEach(c=>{
                ter_ids += `${c.IdTerreno},`;
            });
            ter_ids = (ter_ids.indexOf(',') > -1)?ter_ids.slice(0,-1):ter_ids;
            let datosEliminar =  {Ids: ter_ids};
            let datosModal = {Titulo:'Cuidado',Contenido: `Estas a punto de eliminar todos estos terrenos, esta operación no se puede deshacer, deseas continuar ? `, Tipo:'warning',Confirm:'Si Continuar'};
            this._confirmarModal(datosModal).then(re=>{
                return  this.catalogosService.borrarMultiplesTerrenos(datosEliminar);
            }).then(res=>{
                this.verCatalogoTerrenos({});
            }).catch(err=>{
                console.log('error obtener gastos', err);
                this._limpiarVariables();
            });
        }else{
            swal('Error','Debes seleccionar al menos un gasto para usar este boton', 'error');
        }
    }
    confirmarBorrarTerreno(ter){
        return new Promise ((resolve,reject)=>{
            swal({ title: 'Introduce el codigo del Terreno para confirmar',
              html: ``,
              input:'text',
              type: 'warning',
              showCancelButton: true,
              cancelButtonColor:'#D33',
              confirmButtonText: 'Confirmar'
            }).then((result)=>{
              if(result.value == `TER-${ter.IdTerreno}`){
                let datosEliminar =  {Ids: [ter.IdTerreno]};
                console.log('datos eli',datosEliminar);
                // return  this.catalogosService.borrarMultiplesTerrenos(datosEliminar);
              }else{
                return Promise.reject({error:false});
              }
            }).then((termino)=>{
                swal('Exito', `Haz Eliminado la parcela ${ter.Parcela} correctamente`,'success');
                this.verCatalogoTerrenos({});
            }).catch((err)=>{
                console.log('cancelar');
            });
        });
    }
    importarArchivo($event){
        return new Promise((resolve, reject) => {
            try {
                let uploadFiles = $event.target.files;
                let file: File = uploadFiles[0];
                let myReader: FileReader = new FileReader();

                myReader.readAsDataURL(file);

                myReader.onloadend = (e) => {
                    return resolve(myReader.result);
                };
            } catch (error) {
                return reject({ errorMessage: "No se pudo cargar el archivo", error });
            }
        });
    }
    _recorrerFiltros(datos){
        this.parcelas = []; this.lotes = []; this.etapas = []; this.estatusTodos = [];
        this.parcelas.push({Parcela:'TODOS'});
        this.lotes.push({Lote:'TODOS'});
        this.etapas.push({Etapa:'TODOS'});
        this.estatusTodos.push({Estatus:'TODOS'});
        
        console.log('dat para fil',datos);
        if(datos){
            datos.forEach(d=>{        
                let existePar = this.parcelas.find(pa=>pa.Parcela == d.Parcela);
                if(!existePar){
                    this.parcelas.push({Parcela:d.Parcela});
                }
                let existeEta = this.etapas.find(pa=>pa.Etapa == d.Etapa);
                if(!existeEta){ 
                    this.etapas.push({Etapa:d.Etapa});
                }
                let existeLot = this.lotes.find(pa=>pa.Lote == d.Lote);
                if(!existeLot){
                    this.lotes.push({Lote:d.Lote});
                }
                let existeEst = this.estatusTodos.find(pa=>pa.Estatus == d.Estatus);
                if(!existeEst){
                    this.estatusTodos.push({Estatus:d.Estatus});
                }                
            });
        }
    }
    _ordenarDatosTerrenos(datos){
        let datosOrdenados = [];
        // if(datos){
        //     datos.forEach(d=>{
        //         datosOrdenados.push({ IdTerreno: d.IdTerreno, Etapa :d.etapa, Lote: d.lote, Parcela: d.parcela, Superficie:d.Superficie,
        //         Pertenece:d.Pertenece, Original: d.Original, Estado: d.Estado, Asignado: d.Asignado, Activo: d.Activo, ObjCompleto:d});
        //     });
        // }
        return datosOrdenados;
    }
    _limpiarVariables(){
    this.contenidoReportes = this.contratosActivos = this.vistaCentro =  false;
    }
    _confirmarModal(datosAlert){
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
    _delay(ms){
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
}
