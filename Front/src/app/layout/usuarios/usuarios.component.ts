import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CatalogosService } from '../../shared/services/catalogos.service';
import { UsuariosService } from '../../shared/services/usuarios.service';
import { VentasService } from '../../shared/services/ventas.service';
import {NgbActiveModal,NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
var moment = require('moment');

@Component({
    selector: 'app-usuarios',
    templateUrl: './usuarios.component.html',
    styleUrls: ['./usuarios.component.scss'],
    animations: [routerTransition()],
    providers: [CatalogosService, UsuariosService,VentasService]
})
export class UsuariosComponent implements OnInit {
    vistaCentro;catalogoPuestos;catalogoEmpleados;altaNuevoUsuario;datosUsuarios;datosPuestos;altaNuevoPuesto;Todos;
    //Formulario Usuarios
    uNombre;uCorreo;uPassword;uIdPerfil;sugerenciasEmpleados;visualizarSugerencias;
    panelVisualizar;usuarioActivo;objCorreoEnviar;
    //Formulario Puestos
    pNombre;activeModal;
    Pagina;Ventas;Cobranza;Finanzas;Catalogos;Gastos;Empleados;Usuarios;AppVentas;
    datosEmpleado;nombresEmpleados;usuarioEditar;

    //EMPLEADOS
    empladosActivos;altaEmpleado;mostrarNomina;
    catalogoUsuarios;catalogoTerrenos;
    totalNomina;nominaCalculada;horasLaboradas;comision;sueldoEmpleado;
    bonos;descuentos;
    //Alta nuevo empleado
    nombre;fNacimiento;correo;sueldo;puesto;
    empleadoEditar;
    //Alta Nuevo Puesto

    constructor(private catalogosService:CatalogosService, private usuariosService:UsuariosService, private ventasService:VentasService, private modalService: NgbModal) {
        this.panelVisualizar = '';
        this._catalogoPuestos();
        this._catalogoEmpleados();
        this.uIdPerfil = 0;
        this.usuarioEditar = false;
        this.Pagina=this.Ventas=this.Cobranza=this.Finanzas=this.Catalogos=this.Gastos=this.Empleados=this.Usuarios=this.AppVentas=false;

        this._catalogoUsuarios();
        this._catalogoTerrenos();
        this.puesto = 0;
        this.totalNomina  = this.horasLaboradas = this.comision = this.bonos = this.descuentos = 0;       
        this.panelVisualizar = 'Ayuda';
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

    //Usuario nuevo
    nuevoUsuario(){
        this._limpiarVariables();
        this._delay(100).then(res=>{
            this.altaNuevoUsuario =  (this.altaNuevoUsuario)?false:true;
            this.vistaCentro= true;
        });
    }
    enviarAccesosModal(content){   
        this.objCorreoEnviar = {
            Para: `${this.usuarioActivo.Correo}`,
            Mensaje:`Hola, Este correo es de parte de Campestre el Retiro para hacerte llegar tus accesos para el portal \n Entra en www.admin.campestreelretiro.com/login \n  E introduce los siguientes datos :   Usuario: "${this.usuarioActivo.Correo}" \n Password: "${this.usuarioActivo.Password}" `,
            Asunto: `Accesos usuario`,
            Adjunto: ''
        };
        this.activeModal = this.modalService.open(content, {windowClass: 'modal-holder', size: 'lg'});
    }
    enviarCorreoAccesos(){
        console.log('info',this.objCorreoEnviar);
        if(this.objCorreoEnviar){
            this.catalogosService.enviarCorreoCotizacion(this.objCorreoEnviar).then(res=>{
                console.log('termino');
                this.activeModal.dismiss();
                this.obtenerUsuarios();
            }).catch(err=>{console.log('err',err);})
        }
    }
    //Catalogo de usuarios
    obtenerUsuarios(){
        this._limpiarVariables();
        this.catalogosService.obtenerUsuarios().then(res =>{
            // let datosUsuarios = this._ordenarUsuarios(res['Data']);
            // this.datosUsuarios = datosUsuarios;
            this.datosUsuarios = res['Data'];
            console.log('datosUsuarios',this.datosUsuarios);
//            this.datosUsuarios = { Opciones:{Eliminar:true,Editar:true}, Datos:datosUsuarios};
//            this.datosUsuarios = { Opciones:{Eliminar:true,Editar:true}, Columnas : ["Nombre", "Correo", "Fecha_creacion", "Password"] ,Datos:res['Data']};
            this.vistaCentro=true;
            this.panelVisualizar = 'Usuarios';
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
                Fecha_creacion: moment(d.Fecha_creacion).format('YYYY-MM-DD HH:mm:ss'),
                ObjCompleto: d
            });
        });
        return datosOrdenados;
    }
    guardarCambiosPerfiles(){
        this.catalogosService.guardarCambiosPuestos(this.datosPuestos).then(res=>{
            this.obtenerPuestos();
        }).catch(err=>{console.log('err',err);});
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
    actualizarUsuario(){
        let perf = this.catalogoPuestos.find(cp=>cp.IdPerfil == this.usuarioEditar.IdPerfil);
        if(perf){
            this.usuarioEditar.Nombre_perfil = perf.Nombre_perfil;
        }
        this.usuariosService.actualizarDatosUsuario(this.usuarioEditar).then(res=>{
                this.obtenerUsuarios();
                this._limpiarVariables();
            }).catch(err=>{console.log('err',err);});
    }
    actualizarEmpleado(){
        this.usuariosService.actualizarDatosEmpleado(this.empleadoEditar).then(res=>{
                this.mostrarEmpleados({});
                this._limpiarVariables();
            }).catch(err=>{console.log('err',err);});
    }
    //Guardar Perfil
    guardarNuevoPerfil(){
        let Datos = { Nombre: this.pNombre,
            Peso: 10,
            Pagina:this.Pagina,
            Ventas:this.Ventas,
            Cobranza:this.Cobranza,
            Finanzas:this.Finanzas,
            Catalogos:this.Catalogos,
            Gastos:this.Gastos,
            Empleados:this.Empleados,
            Usuarios:this.Usuarios,
            AppVentas:this.AppVentas
         };
            this.usuariosService.guardarNuevoPerfil(Datos).then(res =>{
                let tipo = res['Tipo'];
                swal('Exito', `${res['Operacion']}`, tipo);
                this._limpiarVariables();
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
            this.datosPuestos = datosPerfiles;
            // this.datosPuestos = { Opciones:{Eliminar:true, Editar: true},Datos:datosPerfiles};
            this.vistaCentro=true;
            this.panelVisualizar = 'Perfiles';
        });
    }
    _ordenarPerfiles(datos){
        datos.forEach(d=>{
            d.PermisosTitulos = ['Pagina','Ventas','Cobranza','Finanzas','Catalogos','Gastos','Empleados','Usuarios','AppVentas'];
            d.PermisosDetalles = [d.Pagina,d.Ventas,d.Cobranza,d.Finanzas,d.Catalogos,d.Gastos,d.Empleados,d.Usuarios,d.AppVentas];
        });
        console.log('datos ordenados',datos);
        return datos;
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
        //this.Clientes=this.Abonos=this.Mantenimientos=this.Cotizaciones=this.Altas=this.Egresos=this.Empleados=this.Nomina=this.Usuarios=this.Reportes=this.Carga=true;
        this.Pagina=this.Ventas=this.Cobranza=this.Finanzas=this.Catalogos=this.Gastos=this.Empleados=this.Usuarios=this.AppVentas=true;
    }

    _catalogoTerrenos(){
        this.catalogosService.obtenerTerrenos().then(res=>{
            console.log('res',res);
            this.catalogoTerrenos =  res['Data'];
        });        
    }
    _catalogoUsuarios(){
        this.catalogosService.obtenerUsuarios().then(res=>{
            console.log('res',res);
            this.catalogoUsuarios =  res['Data'];
        });
    }
    _catalogoPuestos(){ 
        this.catalogosService.obtenerPuestos().then(res=>{
            this.catalogoPuestos =  res['Data'];
        });
    }
    ngOnInit() {}
    mostrarEmpleados(event){
        this._limpiarVariables();
        this.catalogosService.obtenerEmpleados().then(res =>{
            this.vistaCentro = true;
            this.empladosActivos = res['Data'];
            this.catalogoEmpleados =  res['Data'];
            this.nombresEmpleados = res['Data'].map((key)=>{
                return key.Nombre;
            });
            this.panelVisualizar = 'Empleados';
            //this.empladosActivos =  { Datos : res['Data']};
        }).catch(err=>{this._limpiarVariables();});
    }
    nuevoEmpleado(){
        this._limpiarVariables();
        this._delay(100).then(res=>{
            this.altaEmpleado =  (this.altaEmpleado)?false:true;
            this.vistaCentro= true;
        })
    }
    guardarEmpleadoNuevo(){
        let Datos = {Nombre:this.nombre, Fecha_nacimiento:this.fNacimiento, Correo: this.correo,
        Sueldo: this.sueldo, Puesto:this.puesto };
        this.catalogosService.guardarNuevoEmpleado(Datos).then(res =>{
            let tipo = res['Tipo'];
            swal('Exito', `${res['Operacion']}`, tipo);
            this.mostrarEmpleados(true);
        }).catch(err=>{console.log('err',err);});
    }
    mostrarCalcularNomina(evento){
        this._limpiarVariables();
        this._delay(100).then(res=>{
            this.mostrarNomina = true;
            this.vistaCentro= true;
        })
    }
    seleccionarEmpleado(selected,t){
        this.datosEmpleado =  this.catalogoEmpleados.filter(ob=>ob.Nombre == selected.item.toString())[0];
        this.datosEmpleado.DatosUsuario = this.catalogoUsuarios.filter(ob=>ob.IdEmpleado == this.datosEmpleado.IdEmpleado);
        this.sueldoEmpleado = this.datosEmpleado.Sueldo;
        console.log('datos empleado',this.datosEmpleado);
        this.visualizarSugerencias =  false;
        this.sugerenciasEmpleados = false;
        this.uNombre = this.datosEmpleado.Nombre;
        this.uCorreo = this.datosEmpleado.Correo;
        this.uPassword = this._randomPassword(12);
        if(this.datosEmpleado.DatosUsuario[0]){
            this.ventasService.obtenerVentasPorEmpleado(this.datosEmpleado.DatosUsuario[0]).then(res=>{

                res['Datos'].forEach(re=>{
                    re.DatosTerreno = this.catalogoTerrenos.find(ct=>ct.IdTerreno ==  re.IdTerreno);
                    console.log('re',re);
                });
                this.datosEmpleado.Ventas = res['Datos'];
                this.datosEmpleado.Cobros = res['Datos'];
            }).catch(err=>{console.log('err',err);});
        }else{
            this.datosEmpleado.Ventas = [];
        }
        this.horasLaboradas = 40;
    }
    calcularNominaEmpleado(){
        let comisionesMonto = 0;
        if(this.datosEmpleado.Ventas[0]){
            let comisiones = this.datosEmpleado.Ventas.map((key)=>{
                return {Importe: key.Importe, Comision: key.Comision, Monto: (key.Importe* (key.Comision/100))};
            });
            comisiones.forEach(c=>{
                comisionesMonto += c.Monto
            });
        }
        this.datosEmpleado.Sueldo = this.sueldoEmpleado;
        this.datosEmpleado.Horas =  this.horasLaboradas;
        this.datosEmpleado.Comisiones = comisionesMonto;
        this.datosEmpleado.Bonos = this.bonos;
        this.datosEmpleado.Descuentos = this.descuentos;
        this.datosEmpleado.Descuentos_totales = this.descuentos;
        if(this.horasLaboradas < 40){
            let descontado_sueldo = (((40-this.horasLaboradas)*this.sueldoEmpleado)/40);
            console.log('des',descontado_sueldo);
            this.datosEmpleado.Descuentos_totales += descontado_sueldo;
        }
        this.totalNomina = ((this.horasLaboradas*this.sueldoEmpleado)/40)+comisionesMonto+this.bonos-this.descuentos;
        this.datosEmpleado.Total = this.totalNomina;
        this.nominaCalculada = true;
    }
    guardarNomina(){
        let usuario = JSON.parse(localStorage.getItem('Datos'));
        let datosNomina = {Usuario: usuario, Nomina: this.datosEmpleado};
        this.catalogosService.guardarNominaEmpleado(datosNomina).then(res=>{
            let tipo = res['Tipo'];
            swal('Exito', `${res['Operacion']}`, tipo);
            this._limpiarVariables();
        }).catch(err=>{console.log('err',err);});
    }
    _limpiarVariables(){
    this.mostrarNomina = this.vistaCentro  =  this.altaEmpleado = this.empladosActivos = this.fNacimiento  = this.nominaCalculada = false;
    this.correo =  this.nombre = '';
    this.panelVisualizar = '';
    this.puesto = this.sueldo = 0;
    this.datosEmpleado = this.sueldoEmpleado = this.descuentos = this.bonos = this.horasLaboradas = 0 ;
    this.empleadoEditar = this.usuarioEditar = this.vistaCentro = false;
    this.vistaCentro = this.datosPuestos = this.datosUsuarios  = this.altaNuevoPuesto = this.altaNuevoUsuario = false;
    this.panelVisualizar='';
    }    
    _delay(ms){
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
}
