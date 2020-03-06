import { Component, OnInit , ViewChild } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CatalogosService } from '../../shared/services/catalogos.service';
import { UsuariosService } from '../../shared/services/usuarios.service';
import swal from 'sweetalert2';
import * as moment from 'moment';
@Component({
    selector: 'app-documentos',
    templateUrl: './documentos.component.html',
    styleUrls: ['./documentos.component.scss'],
    animations: [routerTransition()],
    providers: [CatalogosService, UsuariosService]
})
export class DocumentosComponent implements OnInit {
    @ViewChild('datatableDocumentos')datatableDocumentos;
    contenidoReportes;documentosActivos;formularioApartado;vistaCentro;clienteDocumento;idCliente;fApartado;
    tipoDocumento;fFin;idUsuario;nombreUsuario;visualizarSugerencias;sugerenciasCliente;clientesTodos;
    visualizarUsuarios;sugerenciasUsuario;usuariosTodos;documentosTodos;tituloDatatable;nuevoDocumentoFormulario;
    nombreNuevoDocumento;tiposDocumentos;
    constructor(private catalogosService : CatalogosService, private usuariosService: UsuariosService) {
        this.tipoDocumento = 0;
        this.fApartado =  moment(new Date()).format('YYYY-MM-DD');
        this.fFin =  moment(new Date()).add('30','d').format('YYYY-MM-DD');
        let usuario = JSON.parse(localStorage.getItem('Datos'));
        this.idUsuario =  usuario.Datos.IdUsuario;
        this.nombreUsuario =  usuario.Datos.Nombre;
        this._obtenerCatalogoClientes();
        this._obtenerTodosUsuarios();
        this._obtenerTodosDocumentos();
        this._obtenerTiposDocumentos();
    }
    _obtenerTodosDocumentos(){
        this.catalogosService.obtenerDocumentos().then(res =>{
            this.documentosTodos = res['Data'];
        });
    }
    _obtenerCatalogoClientes(){
        this.catalogosService.clientesActivos().then(res=>{
            this.clientesTodos = res['Data'];
        });
    }
    _obtenerTodosUsuarios(){
        this.catalogosService.obtenerUsuarios().then(res=>{
            this.usuariosTodos = res['Data'];
        });
    }
    _obtenerTiposDocumentos(){
        this.catalogosService.obtenerTiposDocumentos().then(res=>{
            this.tiposDocumentos = res['Data'];
        });
    }
    ngOnInit() {}
    mostrarDocumentos(event){
        this.tituloDatatable= 'Documentos Activos';
        this._limpiarVariables();
        let today =  moment(new Date()).format('YYYY-MM-DD');
        if(this.documentosTodos){
            let coincidencias = this.documentosTodos.filter((ob)=>{ if(this._diferenciaFechas(ob.Fecha_entrega,today) <= 30){return ob;} } )
            if(coincidencias.length > 0){
                this.contenidoReportes = true;
                if(this.datatableDocumentos != null){
                    this.datatableDocumentos._reiniciarRegistros({Opciones:{Eliminar:true}, Datos : coincidencias});
                }
                this.documentosActivos =  {Opciones:{Eliminar:true}, Datos : coincidencias};
            }
        }
    }
    mostrarExedidos(event){
        this.tituloDatatable= 'Documentos Exedidos';
        this._limpiarVariables();
        let today =  moment(new Date()).format('YYYY-MM-DD');
        if(this.documentosTodos){
            let coincidencias = this.documentosTodos.filter((ob)=>{ if(this._diferenciaFechas(ob.Fecha_entrega,today) >= 30){return ob;} } )
            if(coincidencias.length > 0){
                this.contenidoReportes = true;
                if(this.datatableDocumentos != null){
                    this.datatableDocumentos._reiniciarRegistros({Opciones:{Eliminar:true}, Datos : coincidencias});
                }
                this.documentosActivos =  {Opciones:{Eliminar:true}, Datos : coincidencias};
            }
        }
    }
    _diferenciaFechas(fech1, fech2){
        let fecha1 = moment(fech1);
        let fecha2 = moment(fech2);
        return fecha2.diff(fecha1, 'days');
    }
    nuevoDocumento(){
        this._limpiarVariables();
        this._delay(100).then(res=>{
            this.vistaCentro = true;
            this.nuevoDocumentoFormulario = true;
        });
    }
    guardarNuevoDocumento(){
        let datos =  { Nombre: this.nombreNuevoDocumento }
        this.catalogosService.guardarNuevoDocumento(datos).then(res=>{
            let tipo = res['Tipo'];
            swal('Exito', `${res['Operacion']}`, tipo);
            this._obtenerTiposDocumentos();
            this._limpiarVariables();
        });
    }
    nuevoApartado(){
        this._limpiarVariables();
        this._delay(100).then(res=>{
            this.vistaCentro =true;
            this.formularioApartado = true;
        });
    }
    borrarDocumento(obj){
        this.usuariosService.borrarApartadoDocumento(obj).then(res=>{
        });
    }
    filtrarCliente(){
        this.visualizarSugerencias =  false;
        if(this.clienteDocumento.length > 0){
            this.sugerenciasCliente = this.clientesTodos.filter(ob => ob.Nombre.toUpperCase().indexOf(this.clienteDocumento.toUpperCase()) > -1);
            this.visualizarSugerencias =  true;
        }else{
            this.visualizarSugerencias =  false;
        }
    }
    filtrarUsuario(){
        this.visualizarUsuarios =  false;
        if(this.nombreUsuario.length > 0){
            this.sugerenciasUsuario = this.usuariosTodos.filter(ob => ob.Nombre.toUpperCase().indexOf(this.nombreUsuario.toUpperCase()) > -1);
            this.visualizarUsuarios =  true;
        }else{
            this.visualizarUsuarios =  false;
        }
    }
    seleccionarCliente(obj){
        this.idCliente =  obj.IdCliente;
        this.clienteDocumento =  obj.Nombre;
        this.visualizarSugerencias =  false;
        this.sugerenciasCliente = false;
    }
    seleccionarUsuario(obj){
        this.idUsuario =  obj.IdUsuario;
        this.nombreUsuario =  obj.Nombre;
        this.visualizarUsuarios =  false;
        this.sugerenciasUsuario = false;
    }
    guardarApartadoDocumento(){
        let datos = {IdCliente:this.idCliente, IdUsuario:this.idUsuario, Nombre:this.tipoDocumento,
        Usuario:this.nombreUsuario, Fecha_apartado: this.fApartado, Fecha_entrega:this.fFin};
        this.usuariosService.guardarApartadoDocumento(datos).then(res=>{
            let tipo = res['Tipo'];
            swal('Exito', `${res['Operacion']}`, tipo);
            this._obtenerTodosDocumentos();
            this._limpiarVariables()
        });
    }
    _limpiarVariables(){
        this.formularioApartado = this.nuevoDocumentoFormulario = this.contenidoReportes = this.documentosActivos = this.idCliente  = this.vistaCentro  = false;
        this.tipoDocumento = 0;
        this.clienteDocumento = '';
    }
    _delay(ms){
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
}
