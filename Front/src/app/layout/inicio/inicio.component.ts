import { Component, OnInit, ViewChild } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { Router } from '@angular/router';
import { EstadisticasService } from '../../shared/services/estadisticas.service';
@Component({
    selector: 'app-inicio',
    templateUrl: './inicio.component.html',
    styleUrls: ['./inicio.component.scss'],
    animations: [routerTransition()]
    ,providers:[EstadisticasService]
})

export class InicioComponent implements OnInit {
    public alerts: Array<any> = [];
    reporteActivo;reportesIngresos;reportesGastos;reportesCartera;reportesClientes;
    ingresosChart;gastosChart;carteraChart;clientesChart;datosUsuario;
    @ViewChild('datatableClientes')datatableClientes;
    @ViewChild('datatableCartera')datatableCartera;
    @ViewChild('datatableGastos')datatableGastos;
    @ViewChild('datatableIngresos')datatableIngresos;
    
    constructor(public router: Router,private estadisticasService:EstadisticasService) {
        this.ingresosChart =this.gastosChart = this.carteraChart =  this.clientesChart =  false;
        this.datosUsuario = JSON.parse(localStorage.getItem('Datos'));
        if(this.datosUsuario.Perfil == 'Vendedor'){
            this.router.navigate(['/ModuloVentas/']);            
        }
    }
    ngOnInit() {}
    
    //Reporte de Ingresos 
    ingresosResumen(event){
        this._desactivarOtrosReportes();
        this.estadisticasService.resumenIngresos().then(response=>{
            this.reporteActivo =true;
            console.log('ingresos', response);
            let ingresosProcesados =  this._procesarIngresos(response["Data"]);
            this.reportesIngresos = ingresosProcesados;
            this.ingresosChart = this._pieChartOrder("Resumen de Ingresos",ingresosProcesados);
        }).catch(err=>{
            this.reporteActivo = false;
        })
    }
    //Procesa y ordena los datos de ingresos 
    _procesarIngresos(Datos){
        let tiposIngresos = [];
        let contenidoTipoIngresos = [];
        Datos.forEach(dat =>{
            tiposIngresos[dat.Tipo_venta] = dat.Tipo_venta;
        });
        Object.keys(tiposIngresos).forEach(t => {
            let coincidencias = Datos.filter(ob=>ob.Tipo_venta == t);
            contenidoTipoIngresos[t] = coincidencias;
        })
        return contenidoTipoIngresos;
    }
    //Reporte de gastos
    gastosResumen(event){
        this._desactivarOtrosReportes();
        this.estadisticasService.resumenGastos().then(response=>{
            this.reporteActivo =true;
            let gastosProcesados = this._procesarGastos(response["Data"]);
            this.reportesGastos = gastosProcesados;
            this.gastosChart = this._pieChartOrder("Resumen de Gastos",gastosProcesados);
        }).catch(err=>{
            this.reporteActivo = false;
        })
    }
    //Procesa y ordena  datos de gastos
    _procesarGastos(Datos){
        let tiposGastos = [];
        let contenidoTiposGastos = [];
        Datos.forEach(dat =>{
            tiposGastos[dat.Tipo] = dat.Tipo;
        });
        Object.keys(tiposGastos).forEach(t => {
            let coincidencias = Datos.filter(ob=>ob.Tipo == t);
            contenidoTiposGastos[t] = coincidencias;
        })
        return contenidoTiposGastos;
    }
    //Reporte de la cartera vencida 
    carteraResumen(event){
        this._desactivarOtrosReportes();
        this.estadisticasService.resumenCartera().then(response=>{
            this.reporteActivo =true;
            this.reportesCartera = response;
            let Datos =  [];
            Datos["Saldo Regular"] =  response['Data'][0].SaldoRegular;
            Datos["Saldo Vencido"] =  response['Data'][0].SaldoVencido;
            this.carteraChart = this._pieChartOrder("Resumen de Cartera",Datos);
        }).catch(err=>{
            this.reporteActivo = false;
        })
    }
    //Reporte de clientes
    clientesResumen(event){
        this._desactivarOtrosReportes();
        this.estadisticasService.resumenClientes().then(response=>{
            this.reporteActivo =true;
            this.reportesClientes = response;
            let Datos =  [];
            Datos["Con Contacto"] =  response['Data'][0].ConContacto;
            Datos["Sin Contacto"] =  response['Data'][0].SinContacto;
            this.clientesChart = this._pieChartOrder("Resumen de Clientes",Datos);
            //this._pieChartOrder(response['Data'][0]);
        }).catch(err=>{
            this.reporteActivo = false;
        })
    }
    //Desactiva los datos visibles de otros reportes
    _desactivarOtrosReportes(){
        this.reporteActivo = this.reportesIngresos = this.reportesGastos = this.reportesCartera = this.reportesClientes =
        this.ingresosChart =this.gastosChart = this.carteraChart =  this.clientesChart =  false;
    }
    //Ordena los datos de un grafico linear 
    _linearChart(Titulo, Datos){
        let DatosEtiqueta = [] ;
        let DatosContenido = [] ;
        let DatosAcumulado = [];
        Object.keys(Datos).forEach(key=>{
            DatosEtiqueta.push(key.toString());
            DatosContenido.push(Datos[key].length);
        });

        return [
            { data: DatosContenido, label: 'Series A' },
            { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' },
            { data: [18, 48, 77, 9, 100, 27, 40], label: 'Series C' }
        ]
    }
    //Ordena los datos de una grafica de pastel 
    _pieChartOrder(Titulo, Datos){
        let DatosEtiqueta = [] ; let DatosContenido = [] ;
        Object.keys(Datos).forEach(key=>{
            DatosEtiqueta.push(key.toString());
            DatosContenido.push(Datos[key].length);
        });
        return { Nombre: Titulo, DatosEtiqueta, DatosContenido, Datos, Tipo: "pie", Tabla:false };
    }
    //Click en grafica de clientes
    chartClientesClicked(e){
        this.clientesChart.Tabla =false;
        let label = this._interpreteEventoClicked(e);
        let datosClicked =  this.clientesChart.Datos[label];
        let datosSelected = {Columnas:["Nombre", "Direccion", "Contacto", "Fecha_ingreso"] ,Datos:datosClicked};
        this.clientesChart.Tabla = (this.clientesChart.Tabla)?false:datosSelected;
        if(this.datatableClientes != null){
            this.datatableClientes._reiniciarRegistros(datosSelected);
        }                
    }
    //Click en grafica de cartera
    chartCarteraClicked(e){
        this.carteraChart.Tabla =false;
        let label = this._interpreteEventoClicked(e);
        let datosClicked =  this.carteraChart.Datos[label];
        let datosSelected = {Columnas:["Nombre", "Direccion", "Contacto", "Fecha_ingreso"] ,Datos:datosClicked};
        this.carteraChart.Tabla = (this.carteraChart.Tabla)?false:datosSelected;
        if(this.datatableCartera != null){
            this.datatableCartera._reiniciarRegistros(datosSelected);
        }
    }
    //Click en grafica de gastos
    chartGastosClicked(e){
        this.gastosChart.Tabla =false;
        let label = this._interpreteEventoClicked(e);
        let datosClicked =  this.gastosChart.Datos[label];
        let datosSelected = {Columnas:["Folio_gasto", "Concepto", "Responsable", "Total", "Fecha_gasto"] ,Datos:datosClicked};
        this.gastosChart.Tabla = (this.gastosChart.Tabla)?false:datosSelected;
        if(this.datatableGastos != null){
            this.datatableGastos._reiniciarRegistros(datosSelected);
        }                
    }
    //Click en grafica de ingresos
    chartIngresosClicked(e){
        this.ingresosChart.Tabla =false;
        let label = this._interpreteEventoClicked(e);
        let datosClicked =  this.ingresosChart.Datos[label];
        let datosSelected = {Columnas:["Folio_venta", "IdRecibo", "Pagares", "Total", "Fecha_venta"] ,Datos:datosClicked};
        this.ingresosChart.Tabla = (this.ingresosChart.Tabla)?false:datosSelected;
        if(this.datatableIngresos != null){
            this.datatableIngresos._reiniciarRegistros(datosSelected);
        }                
    }
    //Regresa la etiqueta de la grafica que fue seleccionada 
    _interpreteEventoClicked(e){
        if (e.active.length > 0) {
            const chart = e.active[0]._chart;
            const activePoints = chart.getElementAtEvent(e.event);
            if ( activePoints.length > 0) {
                return chart.data.labels[activePoints[0]._index];
            }
          }
    }
    //Hover en grafica 
    chartHovered(e){
        console.log('hover');
    }
}
