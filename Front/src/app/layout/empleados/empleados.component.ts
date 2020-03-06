import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CatalogosService } from '../../shared/services/catalogos.service';
import { VentasService } from '../../shared/services/ventas.service';
import * as moment from 'moment';
import swal from 'sweetalert2';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';

@Component({
    selector: 'app-empleados',
    templateUrl: './empleados.component.html',
    styleUrls: ['./empleados.component.scss'],
    animations: [routerTransition()],
    providers: [CatalogosService,VentasService]
})
export class EmpleadosComponent implements OnInit {
    vistaCentro;empladosActivos;altaEmpleado;catalogoPuestos;mostrarNomina;
    catalogoUsuarios;catalogoTerrenos;
    catalogoEmpleados;nombresEmpleados;totalNomina;nominaCalculada;horasLaboradas;comision;datosEmpleado;sueldoEmpleado;
    bonos;descuentos;
    //Alta nuevo empleado
    nombre;fNacimiento;correo;sueldo;puesto;
    //Alta Nuevo Puesto
    constructor(private catalogosService : CatalogosService, private ventasService : VentasService) {
        this._catalogoEmpleados();
        this._catalogoPuestos();
        this._catalogoUsuarios();
        this._catalogoTerrenos();
        this.puesto = 0;
        this.totalNomina  = this.horasLaboradas = this.comision = this.bonos = this.descuentos = 0;
    }
    _catalogoTerrenos(){
        this.catalogosService.obtenerTerrenos().then(res=>{
            console.log('res',res);
            this.catalogoTerrenos =  res['Data'];
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
    filtrarEmpleado = (text$: Observable<string>) =>
    text$.pipe( debounceTime(200), distinctUntilChanged(),
      map(term => term === ''?[]:this.nombresEmpleados.filter(ob => ob.toUpperCase().indexOf(term.toUpperCase()) > -1))
  );
    ngOnInit() {}
    mostrarEmpleados(event){
        this._limpiarVariables();
        this.catalogosService.obtenerEmpleados().then(res =>{
            this.vistaCentro = true;
            this.empladosActivos =  { Datos : res['Data']};
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
    this.vistaCentro  =  this.altaEmpleado = this.empladosActivos = this.fNacimiento  = this.nominaCalculada = false;
    this.correo =  this.nombre = '';
    this.puesto = this.sueldo = 0;
    this.datosEmpleado = this.sueldoEmpleado = this.descuentos = this.bonos = this.horasLaboradas = 0 ;
    }
    _delay(ms){
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
}
