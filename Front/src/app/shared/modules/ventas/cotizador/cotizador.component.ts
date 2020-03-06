import { Component, OnInit , ViewChild, Input, Output, EventEmitter} from '@angular/core';
import { routerTransition } from '../../../../router.animations';
import { VentasService } from '../../../../shared/services/ventas.service'
import swal from 'sweetalert2';
import * as moment from 'moment';
@Component({
    selector: 'app-cotizador',
    templateUrl: './cotizador.component.html',
    styleUrls: ['./cotizador.component.scss'],
    animations: [routerTransition()],
    providers: [VentasService]
})
export class CotizadorComponent implements OnInit {
    @ViewChild('datatableMensualidades')datatableMensualidades;
    @ViewChild('datatableAnualidades')datatableAnualidades;
    @Input('datosCotizacionInput') datosCotizacionInput: any
    vistaCentro;
    //Nueva Cotizacion
    cotizacionNueva;montoCredito;interesAnual;pagosMensuales;totalMensual;costoTotal;superficie;
    cotizacionMensualidades;cotizacionAnualidades;fPrimeraMensualidad;precioMetro;totalAnualidad;
    enganche;acumuladoMen;fPrimeraAnualidad;totalFinal;numAnualidades;montoAnualidad;
    @Output() public vista = new EventEmitter();
    constructor(private ventasService: VentasService) {
        this.fPrimeraMensualidad =  moment().add('15','d').format('YYYY-MM-DD');
        this.fPrimeraAnualidad =  `${moment().format('YYYY-')}12-01`;
        this.precioMetro = 140;
        this.cotizacionMensualidades = this.numAnualidades = 0;
        this.totalFinal = this.acumuladoMen = this.totalAnualidad = this.montoAnualidad = this.superficie = this.costoTotal = 0;
    }
    ngOnInit() {
        if(this.datosCotizacionInput){
            let cot = this.datosCotizacionInput.Cotizacion[0];
            console.log('datosCot',this.datosCotizacionInput);
            this.superficie = cot.Superficie;
            this.precioMetro = 150;
            this.fPrimeraMensualidad = (cot.Fecha_inicio)?cot.Fecha_inicio:this.fPrimeraMensualidad;
            this.interesAnual  = 18;
            this.enganche = cot.Enganche;
            this.pagosMensuales = 72;
            this.calcularAmortizacion(false);
        }
    }
    calcularAmortizacion(forzado){
        //Se calcula el costo total  y el monto del crédito
        let totalActual =  this.totalMensual;
        console.log('total mensual', this.totalMensual);
        if(forzado){ this.totalMensual = 0; totalActual = 0; }
        if(this.superficie && this.precioMetro){
            this.costoTotal =  this.precioMetro*this.superficie;
            this.montoCredito =  this.costoTotal - this.enganche;
            this.totalMensual = 0;
        }
        let interes_calculado = this.interesAnual;
        interes_calculado = (interes_calculado > 0)?interes_calculado:0.000000001;

        if(this.montoCredito  && interes_calculado  && this.pagosMensuales){
            let montoMensual = (interes_calculado/100)/12;
            let montoElevado =  Math.pow(1+ montoMensual,-1*this.pagosMensuales);
            let monto = ((this.montoCredito * montoMensual)/(1-montoElevado)).toFixed(2);
            let datosMensualidades = this._cotizacionMensualidades(monto);
            if(this.datatableMensualidades != null){
                this.datatableMensualidades._reiniciarRegistros({ Datos: datosMensualidades});
            }
            this.cotizacionMensualidades =  { Datos: datosMensualidades}
            console.log('monto', monto);
            if(!totalActual){
                this.totalMensual = monto;
                this.cotizacionAnualidades = false;
            }else{
                this.totalMensual =  totalActual;
                if(this.totalMensual!= 0 && (monto > totalActual) && this.pagosMensuales > 12){
                    let anualidad = this._cotizarAnualidad();
                    if(this.datatableAnualidades != null){
                        this.datatableAnualidades._reiniciarRegistros({ Datos: anualidad});
                    }
                    this.cotizacionAnualidades = {Datos: anualidad};
                }
            }
            this.totalFinal =  this.acumuladoMen + this.enganche;
        }else{
            if(forzado){
                swal('Advertencia','Debes introducir todos los datos para poder calcular la cotización','warning');
            }
        }

    }
    _cotizacionMensualidades(montoMen){
        let datos = [];
        let fecha_pivote = this.fPrimeraMensualidad;
        let interes_calculado = this.interesAnual;
        interes_calculado = (interes_calculado > 0)?interes_calculado:0.000000001;
        let montoMensual = (interes_calculado/100) /12;
        let total_restante = this.montoCredito ;
        let capital = 0;
        this.acumuladoMen = montoMen * this.pagosMensuales;
        for(let i = 1; i <= this.pagosMensuales; i++){
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
        let interes_calculado = this.interesAnual;
        interes_calculado = (interes_calculado > 0)?interes_calculado:0.000000001;
        let montoMensual = (interes_calculado/100)/12;
        let montoElevado =  Math.pow(1+ montoMensual,-1*this.pagosMensuales);
        let monto = (this.montoCredito * montoMensual)/(1-montoElevado);
        let restanteMensual =  monto - this.totalMensual;
        let fecha_pivote = this.fPrimeraAnualidad;
        let datos = [];
        this.totalAnualidad = restanteMensual;
        this.montoAnualidad = (restanteMensual*12).toFixed(2);
        this.numAnualidades = 0;
        for(let i = 1; i <= this.pagosMensuales ; i++){
            totalAnual += restanteMensual;
            fecha_pivote = moment(fecha_pivote).add('1','month').format('YYYY-MM-DD');
            datos.push({ Fecha:fecha_pivote ,Pago: i,Mensualidad: this.totalMensual.toFixed(2), Abono: restanteMensual.toFixed(2) });
            if(i%12 == 0){
                this.numAnualidades ++;
                datos.push({ Fecha:fecha_pivote ,Pago: (i/12),Mensualidad: 'Total = ', Abono: totalAnual.toFixed(2) });
                totalAnual = 0;
            }
            if(this.pagosMensuales == i && i%12 > 0){
                datos.push({ Fecha:fecha_pivote ,Pago: '-',Mensualidad: '-', Abono: totalAnual.toFixed(2) });
                totalAnual = 0;
            }
        }
        console.log('datos',datos);
        return datos;
    }
    nuevaCotizacion(){
        this._limpiarVistaYVariables();
        this._delay(100).then(res=>{
            this.cotizacionNueva = true;
            this.vistaCentro = true; 
        });
    }
    guardarCotizacion(){
        let DatosAlert = {Titulo: 'Guardar cotización como', Confirmar: 'Guardar'};
        this._confirmarGuardar(DatosAlert).then( Name=> { 
            console.log('datos_cotizacion',this.totalMensual);
        let datosCotizacion = {Nombre:Name, Enganche: this.enganche, Credito:this.montoCredito, Tasa:this.interesAnual, Num_pagos:this.pagosMensuales,
            Fecha_inicio:this.fPrimeraMensualidad, Superficie:this.superficie, Precio_metro:this.precioMetro, 
            Costo_total:this.costoTotal, Mensualidad:this.totalMensual, Fecha_inicio_anualidad:this.fPrimeraAnualidad, Num_anualidades: this.numAnualidades,Anualidad:this.montoAnualidad};
            console.log('datos_cotizacion',datosCotizacion);
            this.ventasService.guardarCotizacion(datosCotizacion).then(res =>{
                console.log('res',res);
                let tipo = res['Tipo'];
                swal('Exito', `${res['Operacion']}`, tipo);
                this.vista.emit({Activa : 'Contrato', Cotizacion: { Mensualidades: this.cotizacionMensualidades, Anualidades: this.cotizacionAnualidades, DatosCotizacion: datosCotizacion}  });
            }).catch(err=>{console.log('err',err); });
        }).catch(err=>{
            console.log(err);
        })
    }
    bajarCotizacion(){
        let datosCotizacion = { Enganche: this.enganche, Credito:this.montoCredito, Tasa:this.interesAnual, Num_pagos:this.pagosMensuales,
        Fecha_inicio:this.fPrimeraMensualidad, Superficie:this.superficie, Precio_metro:this.precioMetro, 
        Costo_total:this.costoTotal, Mensualidad:this.totalMensual, Fecha_inicio_anualidad:this.fPrimeraAnualidad, Num_anualidades: this.numAnualidades,Anualidad:this.montoAnualidad};
        this.vista.emit({Activa : 'Contrato', Cotizacion: { Mensualidades: this.cotizacionMensualidades, Anualidades: this.cotizacionAnualidades, DatosCotizacion: datosCotizacion}  });
    }
    _limpiarVistaYVariables(){
        this.vistaCentro = this.cotizacionNueva = false;
    }
    _confirmarGuardar(DatosAlert){
        return new Promise ((resolve,reject)=>{
            swal({title: DatosAlert.Titulo, input: 'text', inputAttributes: { autocapitalize: 'off' },
                showCancelButton: true, confirmButtonText: DatosAlert.Confirmar, showLoaderOnConfirm: true,
                preConfirm: () => { },
                allowOutsideClick: () => !swal.isLoading()
            }).then((result) => {
                if(result.dismiss){
                    return reject({error:result})
                }
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
    _delay(ms){
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
}
