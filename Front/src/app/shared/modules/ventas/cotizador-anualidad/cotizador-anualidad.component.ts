import { Component, OnInit , ViewChild, Input, Output, EventEmitter} from '@angular/core';
import { routerTransition } from '../../../../router.animations';
import { VentasService } from '../../../services/ventas.service'
import swal from 'sweetalert2';
import * as moment from 'moment';
@Component({
    selector: 'app-cotizador-anualidad',
    templateUrl: './cotizador-anualidad.component.html',
    styleUrls: ['./cotizador-anualidad.component.scss'],
    animations: [routerTransition()],
    providers: [VentasService]
})
export class CotizadorAnualidadComponent implements OnInit {
    @Input('datosCotizacionInput') datosCotizacionInput: any
    vistaCentro;
    //Nueva Cotizacion
    
    cotizacionAnualidades;totalAnualidad;anualidadForzada;
    fPrimeraAnualidad;numAnualidades;montoAnualidad;todosChkAnualidades;paginadoDatos;
    numAnualidadesPagadas;
    @Output() public vista = new EventEmitter();
    constructor(private ventasService: VentasService) {
        this.todosChkAnualidades = false;
        this.anualidadForzada = false;
        this.fPrimeraAnualidad =  `${moment().format('YYYY-')}12-01`;
        this.numAnualidades = this.montoAnualidad = this.numAnualidadesPagadas = 0;
        this.paginadoDatos = 10;
    }
    ngOnInit() {
        if(this.datosCotizacionInput){
            console.log('datosCot',this.datosCotizacionInput);
            if(this.datosCotizacionInput.Cotizacion){
                let cot = this.datosCotizacionInput.Cotizacion[0];
                this.fPrimeraAnualidad = (cot.Fecha_inicio_anualidad)?cot.Fecha_inicio_anualidad:this.fPrimeraAnualidad;
                this.montoAnualidad = (cot.Anualidad)?cot.Anualidad:0;
                this.numAnualidades = (cot.Num_anualidades)?cot.Num_anualidades:0;
                this.numAnualidadesPagadas = (cot.Num_anualidades_pagadas)?cot.Num_anualidades_pagadas:0;
                if(this.numAnualidades > 0  && this.montoAnualidad > 0 ){
                    this.anualidadForzada = true;
                }
                this.calcularAmortizacion();
            }
        }
    }

    calcularAmortizacion(){
        let fecha_pivote = this.fPrimeraAnualidad;
        let datos = [];
        for(let i = 1; i <= this.numAnualidades ; i++){
            datos.push({ Fecha:fecha_pivote ,Pagado:false,Pago: i, Total: this.montoAnualidad.toFixed(2) });
            fecha_pivote = moment(fecha_pivote).add('12','month').format('YYYY-MM-DD');
        }
        this.cotizacionAnualidades = {Datos: datos}

        if(this.numAnualidadesPagadas > 0){
            this.cotizacionAnualidades.Datos.map(cm=> { if(cm.Pago <= this.numAnualidadesPagadas){
                cm.Pagado = true
                } 
            })
        }
        let Num_anualidades_pagadas = this.cotizacionAnualidades.Datos.filter(cm=>cm.Pagado == true).length;
        let DatosCotizacion = (this.datosCotizacionInput.DatosCotizacion)?this.datosCotizacionInput:{};
        DatosCotizacion.Fecha_inicio_anualidad = this.fPrimeraAnualidad;
        DatosCotizacion.Num_anualidades =  this.numAnualidades;
        DatosCotizacion.Anualidad = this.montoAnualidad;
        DatosCotizacion.Num_anualidades_pagadas = Num_anualidades_pagadas;
        this.vista.emit({ Cotizacion: { Mensualidades: (this.datosCotizacionInput.Mensualidades)?this.datosCotizacionInput.Mensualidades:[], Anualidades: this.cotizacionAnualidades, DatosCotizacion}  });
        
    }
    cambioChk(){
        let Num_anualidades_pagadas = this.cotizacionAnualidades.Datos.filter(cm=>cm.Pagado == true).length;
        let DatosCotizacion = (this.datosCotizacionInput.DatosCotizacion)?this.datosCotizacionInput:{};
        DatosCotizacion.Fecha_inicio_anualidad = this.fPrimeraAnualidad;
        DatosCotizacion.Num_anualidades =  this.numAnualidades;
        DatosCotizacion.Anualidad = this.montoAnualidad;
        DatosCotizacion.Num_anualidades_pagadas = Num_anualidades_pagadas;
        this.vista.emit({ Cotizacion: { Mensualidades: (this.datosCotizacionInput.Mensualidades)?this.datosCotizacionInput.Mensualidades:[], Anualidades: this.cotizacionAnualidades, DatosCotizacion}  });
    }
    cambiarTodosChk(){
        this.cotizacionAnualidades.Datos.map(c=>c.Pagado = this.todosChkAnualidades);
    }
    _limpiarVistaYVariables(){
        this.vistaCentro = false;
    }
    _delay(ms){
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
}
