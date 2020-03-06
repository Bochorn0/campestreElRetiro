import { Component, OnInit ,ViewChild } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { VentasService } from '../../shared/services/ventas.service';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
    selector: 'app-carga',
    templateUrl: './carga.component.html',
    styleUrls: ['./carga.component.scss'],
    animations: [routerTransition()],
    providers: [VentasService]
})
export class CargaComponent implements OnInit {
  @ViewChild('datatableSubidos')datatableSubidos;
    nombreArchivo;archivoDatos;datosMovimientos;archivoNombre;file_;
    datosDataTable;borrarAnteriores;
    constructor(private ventasService : VentasService) {
      this.borrarAnteriores = true;
    }

    ngOnInit() {}
    fileDatos(event){
        let file: File = event.target.files[0];
        console.log('even',file);
        if(!this.archivoDatos){
          console.log('nombre',file.name);
          this.archivoNombre = (file.name)?file.name:'';
          this.datosMovimientos = file;
        }
      }
      //Prepara las variables para subir el archivo de los bancos al servidor 
      subirArchivoServidor(){
        if(this.datosMovimientos){
          let renderFile: FileReader = new FileReader();
          renderFile.readAsDataURL(this.datosMovimientos);
          renderFile.onloadend = (e) => {
              if (renderFile.result) {
                let datosMovimiento = {
                    file: renderFile.result.toString().substring(78),
                    Borrar_anteriores:this.borrarAnteriores
                }
                this.ventasService.guardarDatosArchivo(datosMovimiento).then((res)=>{
                  if(this.datatableSubidos != null){
                    this.datatableSubidos._reiniciarRegistros({ Datos: res['Datos']});
                  }
                  this.datosDataTable = { Datos: res['Datos']};

                  //this.borrarTodo();
                }).catch(err=>{console.log('catch',err);});
              }
          }
        }  
      }
      verDatosCargados(){
        this.ventasService.obtenerDatosCarga().then((res)=>{
          console.log('res',res);
          if(this.datatableSubidos != null){
            this.datatableSubidos._reiniciarRegistros({ Datos: res['Datos']});
          }
          this.datosDataTable = { Datos: res['Datos']};

          //this.borrarTodo();
        }).catch(err=>{console.log('catch',err);});
      }
      procesarBaseDatos(){
        let datosAlert = {Titulo: 'Cuidado', 
        Contenido: 'Estas a punto de borrar los datos contenidos en la base de datos por estos nuevos , deseas continuar?', 
        Tipo: 'warning',Confirm: 'Si Guardar'};
        this._confirmarModal({},datosAlert).then(rest=>{
          this.ventasService.guardarDatosBaseDatos().then(res=>{
            let tipo = res['Tipo'];
            swal('Exito', `${res['Operacion']}`, tipo);
          });
        });
      }
      afectarSaldos(){
        let datosAlert = {Titulo: 'Cuidado',
        Contenido: 'Vas a afercar los movimientos, deseas continuar?',
        Tipo: 'warning',Confirm: 'Si Guardar'};
        this._confirmarModal({},datosAlert).then(rest=>{
          this.ventasService.afectarSaldosDatos().then(res=>{
            let tipo = res['Tipo'];
            swal('Exito', `${res['Operacion']}`, tipo);
          });
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
    _limpiarVariables(){
    //this.contenidoReportes = this.contratosActivos = false;
    }
}
