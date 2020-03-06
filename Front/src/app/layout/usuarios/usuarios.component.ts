import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CatalogosService } from '../../shared/services/catalogos.service';
import { UsuariosService } from '../../shared/services/usuarios.service'
import swal from 'sweetalert2';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';

//const moment =  require('moment');
@Component({
    selector: 'app-usuarios',
    templateUrl: './usuarios.component.html',
    styleUrls: ['./usuarios.component.scss'],
    animations: [routerTransition()],
    providers: [CatalogosService, UsuariosService]
})
export class UsuariosComponent implements OnInit {
    vistaCentro;catalogoPuestos;catalogoEmpleados;altaNuevoUsuario;datosUsuarios;datosPuestos;altaNuevoPuesto;Todos;
    //Formulario Usuarios
    uNombre;uCorreo;uPassword;uIdPerfil;sugerenciasEmpleados;visualizarSugerencias;
    //Formulario Puestos
    pNombre;
    Clientes;Abonos;Mantenimientos;Cotizaciones;Altas;Egresos;Empleados;Nomina;Usuarios;Reportes;Carga;
    datosEmpleado;nombresEmpleados;
    constructor(private catalogosService:CatalogosService, private usuariosService:UsuariosService) {
        this._catalogoPuestos();
        this._catalogoEmpleados();
        this.uIdPerfil = 0;
        this.Clientes=this.Abonos=this.Mantenimientos=this.Cotizaciones=this.Altas=this.Egresos=this.Empleados=this.Nomina=this.Usuarios=this.Reportes=this.Carga=false;
    }
    _catalogoPuestos(){
        this.catalogosService.obtenerPuestos().then(res=>{
            this.catalogoPuestos =  res['Data'];
        });
    }
    _catalogoEmpleados(){
        this.catalogosService.obtenerEmpleados().then(res=>{
            console.log('res',res);
            this.catalogoEmpleados =  res['Data'];
            this.nombresEmpleados = res['Data'].map((key)=>{
                return key.Nombre;
            });
        });
    }
    filtrarEmpleado = (text$: Observable<string>) =>
      text$.pipe( debounceTime(200), distinctUntilChanged(),
        map(term => term === ''?[]:this.nombresEmpleados.filter(ob => ob.toUpperCase().indexOf(term.toUpperCase()) > -1))
    );
    seleccionarEmpleado(selected,t){
        this.datosEmpleado =  this.catalogoEmpleados.filter(ob=>ob.Nombre == selected.item.toString())[0];
        this.visualizarSugerencias =  false;
        this.sugerenciasEmpleados = false;
        this.uNombre = this.datosEmpleado.Nombre;
        this.uCorreo = this.datosEmpleado.Correo;
        this.uPassword = this._randomPassword(12);
    }
    ngOnInit() {}

    //Usuario nuevo
    nuevoUsuario(){
        this._limpiarVariables();
        this._delay(100).then(res=>{
            this.altaNuevoUsuario =  (this.altaNuevoUsuario)?false:true;
            this.vistaCentro= true;
        });
    }
    //Catalogo de usuarios
    obtenerUsuarios(){
        this._limpiarVariables();
        this.catalogosService.obtenerUsuarios().then(res =>{
            let datosUsuarios = this._ordenarUsuarios(res['Data']);
            this.datosUsuarios = { Opciones:{Eliminar:true,Editar:true}, Datos:datosUsuarios};
//            this.datosUsuarios = { Opciones:{Eliminar:true,Editar:true}, Columnas : ["Nombre", "Correo", "Fecha_creacion", "Password"] ,Datos:res['Data']};
            this.vistaCentro=true;
        }).catch(err=>{
            console.log('error usuarios', err);
            this._limpiarVariables();
        })
    }
    _ordenarUsuarios(datos){
        let datosOrdenados = [];
        datos.forEach(d=>{
            datosOrdenados.push({
                "Nombre": d.Nombre,
                Correo: d.Correo,
                Perfil: d.Nombre_perfil,
                Password: d.Password,
                "Fecha de Creación": d.Fecha_creacion,
                ObjCompleto: d
            });
        });
        return datosOrdenados;
    }
    editarUsuario(obj){
        console.log('obj',obj);
        let datosActualizar = {IdUsuario: obj['Obj'].IdUsuario, Nombre: obj['Nombre'], Correo: obj['Correo'], Password: obj['Password']};
        console.log('datos_actualizar',datosActualizar);
        this.usuariosService.actualizarDatosUsuario(datosActualizar).then(res=>{
                this.obtenerUsuarios();
                this._limpiarVariables();
            }).catch(err=>{console.log('err',err);});
    }
    editarPuestos(obj){
        console.log('obj',obj);
        let datosActualizar = {
            IdPerfil: obj['Obj'].IdPerfil,
            Nombre_perfil : obj['Nombre del Perfil'],
            Ventas : (obj['Ventas'] == '1')?1:0,
            Cobranza : (obj['Cobranza'] == '1')?1:0,
            Finanzas : (obj['Finanzas'] == '1')?1:0,
            Cotizaciones : (obj['Cotizaciones'] == '1')?1:0,
            Gastos : (obj['Gastos'] == '1')?1:0,
            Usuarios : (obj['Usuarios'] == '1')?1:0,
            Empleados : (obj['Empleados'] == '1')?1:0,
            Catalogos : (`${obj['Catalogos']}` == '1')?1:0,
            Reportes : (obj['Reportes'] == '1')?1:0,
            Carga : (obj['Carga'] == '1')?1:0
        };
        console.log('datos_actualizar',datosActualizar);
        this.usuariosService.actualizarDatosPerfil(datosActualizar).then(res=>{
            let tipo = res['Tipo'];
            swal('Exito', `${res['Operacion']}`, tipo);
            this._limpiarVariables();
            this.obtenerPuestos();
            }).catch(err=>{console.log('err',err);});
    }
    //Guardar Usuario
    guardarNuevoUsuario(){
        let Datos = {Nombre:this.uNombre, Correo: this.uCorreo,
            Password: this.uPassword, IdPerfil:this.uIdPerfil, IdEmpleado: this.datosEmpleado.IdEmpleado };
            this.usuariosService.guardarNuevoUsuario(Datos).then(res =>{
                let tipo = res['Tipo'];
                swal('Exito', `${res['Operacion']}`, tipo);
                this.obtenerUsuarios();
        }).catch(err=>{console.log('err',err);});
    }
    //Guardar Perfil
    guardarNuevoPerfil(){
        let Datos = { Nombre: this.pNombre,
            Clientes:this.Clientes,Abonos:this.Abonos,Mantenimientos:this.Mantenimientos,
            Cotizaciones:this.Cotizaciones,Altas:this.Altas,Egresos:this.Egresos,Empleados:this.Empleados,
            Nomina:this.Nomina,Usuarios:this.Usuarios,Reportes:this.Reportes,Carga:this.Carga
         };
            this.usuariosService.guardarNuevoPerfil(Datos).then(res =>{
                let tipo = res['Tipo'];
                swal('Exito', `${res['Operacion']}`, tipo);
                this.obtenerPuestos();
        }).catch(err=>{console.log('err',err);});
    }
    //Borrar Usuario
    borrarUsuario(obj){
        this.usuariosService.borrarUsuario(obj).then( res=>{
            let movsRes = this.datosUsuarios.filter(ob => ob != obj.ObjCompleto);
            this.datosUsuarios = movsRes;
        }).catch(err=>{
            console.log('error usuarios', err);
        })
    }
    //Puesto nuevo
    nuevoPuesto(){
        this._limpiarVariables();
        this._delay(100).then(res=>{
            this.altaNuevoPuesto =  (this.altaNuevoPuesto)?false:true;
            this.vistaCentro= true;
        })
    }
    //Catalogo puestos
    obtenerPuestos(){
        this.datosPuestos = false;
        this._limpiarVariables();
        this.catalogosService.obtenerPuestos().then(res=>{
            let datosPerfiles =  this._ordenarPerfiles(res['Data']);
            this.datosPuestos = { Opciones:{Eliminar:true, Editar: true},Datos:datosPerfiles};
            this.vistaCentro=true;
        });
    }
    _ordenarPerfiles(datos){
        let datosOrdenados = [];
        datos.forEach(d=>{
            console.log('d',d);
            datosOrdenados.push({
                "Nombre del Perfil": d.Nombre_perfil,
                "Fecha de Creación": d.Fecha_insert,
                "Ventas": d.Ventas,
                "Cobranza": d.Cobranza, 
                "Finanzas": d.Finanzas,
                "Catalogos": d.Catalogos,
                "Cotizaciones": d.Cotizaciones,
                "Gastos": d.Gastos,
                "Empleados": d.Empleados,
                "Usuarios": d.Usuarios,
                "Carga": d.Carga,
                "Reportes": d.Reportes,
                "ObjCompleto": d
            });
        })
        return datosOrdenados;
    }
    //Borrar Puesto
    borrarPuesto(obj){
        console.log('obj',obj);
        this.usuariosService.borrarPuesto(obj).then( res=>{
            let movsRes = this.catalogoPuestos.filter(ob => ob != obj.ObjCompleto);
            this.catalogoPuestos = this.datosPuestos = movsRes;
        }).catch(err=>{
            console.log('error puestos', err);
        })
    }
    _randomPassword(length) {
        var chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+<>ABCDEFGHIJKLMNOP1234567890";
        var pass = "";
        for (var x = 0; x < length; x++) {
            var i = Math.floor(Math.random() * chars.length);
            pass += chars.charAt(i);
        }
        return pass;
    }
    seleccionarTodos(){
        this.Clientes=this.Abonos=this.Mantenimientos=this.Cotizaciones=this.Altas=this.Egresos=this.Empleados=this.Nomina=this.Usuarios=this.Reportes=this.Carga=true;
    }
    _limpiarVariables(){
        this.vistaCentro = false;
        this.vistaCentro = this.datosPuestos = this.datosUsuarios  = this.altaNuevoPuesto = this.altaNuevoUsuario = false;
    }
    _delay(ms){
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
}
