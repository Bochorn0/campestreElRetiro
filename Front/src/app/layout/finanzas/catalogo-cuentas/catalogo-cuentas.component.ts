import { Component, OnInit ,Output , EventEmitter , ViewChild} from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { CatalogosService } from '../../../shared/services/catalogos.service';
import { VentasService } from '../../../shared/services/ventas.service';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import swal from 'sweetalert2';
import * as moment from 'moment';
@Component({
    selector: 'app-catalogo-cuentas',
    templateUrl: './catalogo-cuentas.component.html',
    styleUrls: ['./catalogo-cuentas.component.scss'],
    animations: [routerTransition()],
    providers: [CatalogosService, VentasService]
})

export class CatalogoCuentasComponent implements OnInit {
    @ViewChild('datatableCuentas')datatableCuentas;
    cuentasEspeciales;datosCuentasEspeciales;vistaNuevaCuenta;datosOriginalesCuentas;vistaCentro;
    nombreCuenta;numeroCuenta;saldoCuenta;
    @Output() public nuevaOperacion = new EventEmitter();
    constructor(private catalogosService : CatalogosService, private ventasService: VentasService) {
        this._obtenerCuentasEspeciales();
        this.vistaNuevaCuenta = false;
        this.saldoCuenta = 0;
        this.obtenerCuentasActivas();
    }
    _obtenerCuentasEspeciales(){
        this.catalogosService.obtenerCuentasEspeciales().then(res =>{
            this.datosOriginalesCuentas =  res['Data'];
            let nombresCuentas = [];
            this.datosOriginalesCuentas.forEach(da=>{
                nombresCuentas.push(`${da.Nombre}-${da.Numero}`);
            });
            this.cuentasEspeciales =  nombresCuentas;
            this.datosOriginalesCuentas =  this.datosOriginalesCuentas;
            this.datosCuentasEspeciales = {Opciones: {Eliminar: true} ,Datos:this.datosOriginalesCuentas};
            if(this.datatableCuentas != null){
                this.datatableCuentas._reiniciarRegistros(this.datosCuentasEspeciales);
            }
            
        }).catch(err=>{console.log('err',err);});
    }
    ngOnInit() {}
    filtrarFuentes = (text$: Observable<string>) =>
    text$.pipe( debounceTime(200), distinctUntilChanged(),
      map(term => term === ''?[]:this.cuentasEspeciales.filter(ob => ob.toUpperCase().indexOf(term.toUpperCase()) > -1))
    );
    obtenerCuentasActivas(){
        this._limpiarPantallas();
        this.catalogosService.obtenerCuentasEspeciales().then(res =>{
            this.vistaCentro = true;
            let datosRestantes = res['Data'].filter(da=> da.Activa == 1);
            console.log('dats',datosRestantes);
            this.datosCuentasEspeciales = {Opciones: {Desactivar: true, Editar:true} ,Datos:datosRestantes};
            if(this.datatableCuentas != null){
                this.datatableCuentas._reiniciarRegistros(this.datosCuentasEspeciales);
            }                        
        }).catch(err=>{console.log('err',err);});
    }
    obtenerCuentasInactivas(){
        this._limpiarPantallas();
        this._delay(100).then(res=>{
            this.vistaCentro = true;
            console.log('dats',this.datosOriginalesCuentas);
            let datosRestantes = this.datosOriginalesCuentas.filter(da=> da.Activa == 0);
            console.log('dats',datosRestantes);
            if(!datosRestantes[0]){datosRestantes.push({Resultados: 'No Hay resultados disponibles'});}
            this.datosCuentasEspeciales = {Opciones: {Activar:true,Eliminar: true} ,Datos:datosRestantes};
            if(this.datatableCuentas != null){
                this.datatableCuentas._reiniciarRegistros(this.datosCuentasEspeciales);
            }
        });
    }
    nuevaCuenta(){
        this._limpiarPantallas();
        this._delay(100).then(res=>{
            this.vistaCentro = true;
            this.vistaNuevaCuenta = true;
        });
    }
    agregarNuevaCuenta(){
        let datosNuevaCuenta = {Nombre: this.nombreCuenta, Numero:this.numeroCuenta, Saldo:this.saldoCuenta};
        console.log('datos cuenta',datosNuevaCuenta);
        //return true;
        this.catalogosService.guardarNuevaCuenta(datosNuevaCuenta).then(res=>{
            console.log('res',res);
            swal('Exito','La cuenta fue guardada correctamente', 'success');
            this._obtenerCuentasEspeciales();
            this.obtenerCuentasActivas();
        }).catch(err=>{console.log('err',err);});
    }
    desactivarCuentaEspecial(obj){
        let datos_update = {Activa: '0', IdCuenta: obj.IdCuenta};
        this.catalogosService.actualizarCuentaEspecial(datos_update).then(res=>{
            this._obtenerCuentasEspeciales();
            this.obtenerCuentasActivas();
        }).catch(err=>{console.log('err',err);});
    }
    editarElemento(mov){
        console.log('obj',mov);
        let datos_update = {IdCuenta: mov['Obj'].IdCuenta, Nombre: mov['Nombre'], Numero: mov['Numero'], Saldo: mov['Saldo']};
        this.catalogosService.actualizarCuentaEspecial(datos_update).then(res=>{
            this._obtenerCuentasEspeciales();
            this.obtenerCuentasActivas();
        }).catch(err=>{console.log('err',err);});
    }
    activarCuentaEspecial(obj){
        let datos_update = {Activa: '1', IdCuenta: obj.IdCuenta};
        console.log('datos',datos_update);
        this.catalogosService.actualizarCuentaEspecial(datos_update).then(res=>{
            this._obtenerCuentasEspeciales();
            this.obtenerCuentasInactivas();
        }).catch(err=>{console.log('err',err);});
    }
    borrarCuentaEspecial(obj){
        this.catalogosService.borrarCuentaEspecial(obj).then(res=>{
            this._obtenerCuentasEspeciales();
        }).catch(err=>{console.log('err',err);});
    }
    _limpiarPantallas(){
        this.vistaCentro = this.cuentasEspeciales = this.datosCuentasEspeciales = this.vistaNuevaCuenta = false;
    }
    _delay(ms){
        return new Promise( resolve => setTimeout(resolve, ms) );
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
