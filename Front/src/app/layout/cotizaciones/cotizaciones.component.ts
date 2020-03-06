import { Component, OnInit , ViewChild} from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CatalogosService } from '../../shared/services/catalogos.service';
import { VentasService } from '../../shared/services/ventas.service'
import swal from 'sweetalert2';
import * as moment from 'moment';
@Component({
    selector: 'app-clientes',
    templateUrl: './cotizaciones.component.html',
    styleUrls: ['./cotizaciones.component.scss'],
    animations: [routerTransition()],
    providers: [CatalogosService, VentasService]
})
export class CotizacionesComponent implements OnInit {
    //Reportes
    vistaCentro;
    cotizaciones;cotizacionesActivas;cotizacionesNoActivas;
    //Terrenos;
    terrenos;parcelas;datosCotizacion;acumuladoMen
    @ViewChild('datatableMensualidades')datatableMensualidades;
    @ViewChild('datatableAnualidades')datatableAnualidades;
    constructor(private catalogosService : CatalogosService, private ventasService: VentasService) {
        this._obtenerTodasCotizaciones();
        this.datosCotizacion = false;
    }
    _obtenerTodasCotizaciones(){
        this.catalogosService.obtenerCotizaciones().then(res=>{
            this.cotizaciones = this._ordernarDatosCotizaciones(res['Data']);
            console.log('cotiza',this.cotizaciones);
        });
    }
    _ordernarDatosCotizaciones(datos){
        let datosOrdenados = [];
        if(datos[0]){
            datos.forEach(d=>{
                datosOrdenados.push({Nombre:d.Nombre,Enganche:d.Enganche,Credito:d.Credito,Tasa:d.Tasa,Pagos:d.Num_pagos,Fecha_inicio:d.Fecha_inicio,Superficie:d.Superficie,Activa:d.Activa, ObjCompleto:d});
            })
        }
        return datosOrdenados;
    }
    obtenerCotizacionesActivas(evento){
        this._limpiarVistaYVariables();
        this._delay(100).then(res=>{
            this.cotizacionesActivas = {Opciones:{Eliminar:true, Seleccionar:true},Datos: this.cotizaciones.filter(ob=>ob.Activa == 1)};
            this.vistaCentro = true;
        });
    }
    obtenerCotizacionesAntiguas(evento){
        this._limpiarVistaYVariables();
        this._delay(100).then(res=>{
            this.cotizacionesNoActivas = {Opciones:{Eliminar:true},Datos: this.cotizaciones.filter(ob=>ob.Activa == 0)};
            this.vistaCentro = true;
        });
    }
    ngOnInit() {}
    modificarCotizacion(Obj){
        console.log('obj',Obj);
        if(Obj[0]){
            this.datosCotizacion = Obj[0];
            this.calcularAmortizacion(true);
        }

    }
    desasignarCotizacion(obj){
        this.catalogosService.desasignarCotizacion(obj).then(res=>{
            this._limpiarVistaYVariables();
            this._obtenerTodasCotizaciones();
            this.obtenerCotizacionesActivas({});
        }).catch(err=>{console.log('err',err);});
    }
    activarCotizacion(obj){
        this.catalogosService.activarCotizacion(obj).then(res=>{
            this._limpiarVistaYVariables();
            this._obtenerTodasCotizaciones();
            this.obtenerCotizacionesAntiguas({});
        }).catch(err=>{console.log('err',err);});
    }
    _limpiarVistaYVariables(){ 
        this.vistaCentro = this.cotizacionesActivas = this.cotizacionesNoActivas = this.datosCotizacion = false;
    }
    _delay(ms){
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    
calcularAmortizacion(forzado){
    //Se calcula el costo total  y el monto del crédito
    let totalActual =  this.datosCotizacion.Mensualidad;
    console.log('total mensual', this.datosCotizacion.Mensualidad);
    if(forzado){ this.datosCotizacion.Mensualidad = 0; totalActual = 0; }
    this.datosCotizacion.MontoCredito = 0;
    if(this.datosCotizacion.Superficie && this.datosCotizacion.Precio_metro){
        this.datosCotizacion.CostoTotal =  this.datosCotizacion.Precio_metro*this.datosCotizacion.Superficie;
        this.datosCotizacion.MontoCredito =  this.datosCotizacion.CostoTotal - this.datosCotizacion.Enganche;
        this.datosCotizacion.Mensualidad = 0;
    }
    let interes_calculado = this.datosCotizacion.Tasa;
    interes_calculado = (interes_calculado > 0)?interes_calculado:0.000000001;

    if(this.datosCotizacion.MontoCredito  && interes_calculado  && this.datosCotizacion.Num_pagos){
        let montoMensual = (interes_calculado/100)/12;
        let montoElevado =  Math.pow(1+ montoMensual,-1*this.datosCotizacion.Num_pagos);
        let monto = ((this.datosCotizacion.MontoCredito * montoMensual)/(1-montoElevado)).toFixed(2);
        let datosMensualidades = this._cotizacionMensualidades(monto);
        if(this.datatableMensualidades != null){
            this.datatableMensualidades._reiniciarRegistros({ Datos: datosMensualidades});
        }
        this.datosCotizacion.datatableMensualidades = { Datos: datosMensualidades};
//        this.cotizacionMensualidades =  { Datos: datosMensualidades}
        console.log('monto', monto);
        if(!totalActual){
            this.datosCotizacion.Mensualidad = monto;
            this.datosCotizacion.CotizacionAnualidades = false;
        }else{
            this.datosCotizacion.Mensualidad =  totalActual;
            if(this.datosCotizacion.Mensualidad!= 0 && (monto > totalActual) && this.datosCotizacion.Num_pagos > 12){
                let anualidad = this._cotizarAnualidad();
                if(this.datatableAnualidades != null){
                    this.datatableAnualidades._reiniciarRegistros({ Datos: anualidad});
                }
                this.datosCotizacion.datatableAnualidades = {Datos: anualidad};
            }
        }
        this.datosCotizacion.TotalFinal =  this.datosCotizacion.AcumuladoMen + this.datosCotizacion.Enganche;
    }else{
        if(forzado){
            swal('Advertencia','Debes introducir todos los datos para poder calcular la cotización','warning');
        }
    }

}
_cotizacionMensualidades(montoMen){
    let datos = [];
    let fecha_pivote = this.datosCotizacion.Fecha_inicio;
    let interes_calculado = this.datosCotizacion.Tasa;
    interes_calculado = (interes_calculado > 0)?interes_calculado:0.000000001;
    let montoMensual = (interes_calculado/100) /12;
    let total_restante = this.datosCotizacion.MontoCredito ;
    let capital = 0;
    this.acumuladoMen = montoMen * this.datosCotizacion.Num_pagos;
    for(let i = 1; i <= this.datosCotizacion.Num_pagos; i++){
        let interes = total_restante * montoMensual;
        capital =  montoMen - interes;
        total_restante = total_restante - capital;
        fecha_pivote = moment(fecha_pivote).add('1','month').format('YYYY-MM-DD');
        datos.push({ Fecha:fecha_pivote ,Pago: i,Interes :(interes).toFixed(2),Capital :(capital).toFixed(2), Total: montoMen, Saldo: (total_restante).toFixed(2) });
    }
    return datos;
}

_cotizarAnualidad(){
    let totalAnual = 0;
    let interes_calculado = this.datosCotizacion.Tasa;
    interes_calculado = (interes_calculado > 0)?interes_calculado:0.000000001;
    let montoMensual = (interes_calculado/100)/12;
    let montoElevado =  Math.pow(1+ montoMensual,-1*this.datosCotizacion.Num_pagos);
    let monto = (this.datosCotizacion.datatableAnualidades.MontoCredito * montoMensual)/(1-montoElevado);
    let restanteMensual =  monto - this.datosCotizacion.Mensualidad;
    let fecha_pivote = this.datosCotizacion.Fecha_inicio_anualidad;
    let datos = [];
    this.datosCotizacion.TotalAnualidad = restanteMensual;
    this.datosCotizacion.Anualidad = (restanteMensual*12).toFixed(2);
    this.datosCotizacion.Num_anualidades = 0;
    for(let i = 1; i <= this.datosCotizacion.Num_pagos ; i++){
        totalAnual += restanteMensual;
        fecha_pivote = moment(fecha_pivote).add('1','month').format('YYYY-MM-DD');
        datos.push({ Fecha:fecha_pivote ,Pago: i,Mensualidad: this.datosCotizacion.Mensualidad.toFixed(2), Abono: restanteMensual.toFixed(2) });
        if(i%12 == 0){
            this.datosCotizacion.Num_anualidades ++;

            datos.push({ Fecha:fecha_pivote ,Pago: (i/12),Mensualidad: 'Total = ', Abono: totalAnual.toFixed(2) });
            totalAnual = 0;
        }
        if(this.datosCotizacion.Num_pagos == i && i%12 > 0){
            datos.push({ Fecha:fecha_pivote ,Pago: '-',Mensualidad: '-', Abono: totalAnual.toFixed(2) });
            totalAnual = 0;
        }
    }
    console.log('datos',datos);
    return datos;
}
guardarCotizacion(){
    let DatosAlert = {Titulo: 'Guardar cotización como', Confirmar: 'Guardar'};
    this._confirmarGuardar(DatosAlert).then( Name=> {
    let datosCotizacion = this.datosCotizacion;
        console.log('datos_cotizacion',datosCotizacion);
        this.ventasService.guardarCotizacion(datosCotizacion).then(res =>{
            console.log('res',res);
            let tipo = res['Tipo'];
            swal('Exito', `${res['Operacion']}`, tipo);
        }).catch(err=>{console.log('err',err); });
    });
}

_confirmarGuardar(DatosAlert){
    return new Promise ((resolve,reject)=>{
        swal({title: DatosAlert.Titulo, input: 'text', inputAttributes: { autocapitalize: 'off' },
            showCancelButton: true, confirmButtonText: DatosAlert.Confirmar, showLoaderOnConfirm: true,
            preConfirm: () => { },
            allowOutsideClick: () => !swal.isLoading()
        }).then((result) => {
            let nombre;
            if (result.value) {
                nombre = result.value;
            }else{
                nombre = `COT-${Math.floor((Math.random() * 100) + 1)}`;
            }
            return resolve(nombre);
        })
    })
}
}
