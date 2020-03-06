import { Component, OnInit, ViewChild } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { EstadisticasService } from '../../shared/services/estadisticas.service'
import * as moment  from 'moment';
import * as _ from 'lodash';
@Component({
    selector: 'app-reportes',
    templateUrl: './reportes.component.html',
    styleUrls: ['./reportes.component.scss'],
    animations: [routerTransition()],
    providers: [EstadisticasService]
})

export class ReportesComponent implements OnInit {
    idReporte;fInicio;fFin;resultadoReporte;
    @ViewChild('datatableReportes')datatableReportes;
constructor(private estadisticasService: EstadisticasService) {
    this.idReporte = 0;
    this.fFin =  moment(new Date()).format('YYYY-MM-DD');
    this.fInicio =  moment(`${moment(new Date()).format('YYYY-MM')}-01`).format('YYYY-MM-DD');
}

generarReporte(){
    this.resultadoReporte = false;
    let Filtros = {Fecha_inicio: this.fInicio, Fecha_fin: this.fFin};
    console.log('id',this.idReporte);
    switch(this.idReporte){
        case '1': //Reporte de Ventas
            this.estadisticasService.obtenerReporteVentas(Filtros).then(res=>{
                let datosOrdenados = this._ordenarDatosVentas(res['Data']);
                if(this.datatableReportes != null){
                    this.datatableReportes._reiniciarRegistros({Datos:res['Data']});
                }
                this.resultadoReporte =  {Datos:res['Data']};
            }).catch(err=>{console.log('err',err);});
            break;
        case '2': //Reporte de Gastos
            this.estadisticasService.obtenerReporteGastos(Filtros).then(res=>{
                if(this.datatableReportes != null){
                    this.datatableReportes._reiniciarRegistros({Datos:res['Data']});
                }
                this.resultadoReporte =  { Datos:res['Data']};
            }).catch(err=>{console.log('err',err);});
            break;
        case '3': //Reporte de Nomina
            this.estadisticasService.obtenerReporteNomina(Filtros).then(res=>{
                this.resultadoReporte =  res['Data'];
            }).catch(err=>{console.log('err',err);});
            break;
        case '4': //Reporte de Documentos
            this.estadisticasService.obtenerReporteDocumentos(Filtros).then(res=>{
                this.resultadoReporte =  res['Data'];
            }).catch(err=>{console.log('err',err);});
            break;
        default: //Nada
            this.resultadoReporte = false;
    }
}
_ordenarDatosVentas(datos){
    let dias =[];
    let Ordenados = [];
    datos.forEach(dat=>{
        let dia = dat.Fecha_venta.split('T')[0]; 
        dias.push(dia);
    });
    let pordia = _.uniq(dias);
    pordia.forEach(dia=>{
        Ordenados.push({ Dia:dia, Datos: datos.filter(ob => ob.Fecha_venta.split('T')[0]== dia) });
    });
    console.log('por',Ordenados);
}
ngOnInit() {}
}

/*
    // bar chart
    public barChartOptions: any = {
     scaleShowVerticalLines: false,
     responsive: true
 };
 public barChartLabels: string[] = [
     '2006',
     '2007',
     '2008',
     '2009',
     '2010',
     '2011',
     '2012'
 ];
 public barChartType: string = 'bar';
 public barChartLegend: boolean = true;
 
 public barChartData: any[] = [
     { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
     { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
 ];
 
 // Doughnut
 public doughnutChartLabels: string[] = [
     'Download Sales',
     'In-Store Sales',
     'Mail-Order Sales'
 ];
 public doughnutChartData: number[] = [350, 450, 100];
 public doughnutChartType: string = 'doughnut';
 
 // Radar
 public radarChartLabels: string[] = [
     'Eating',
     'Drinking',
     'Sleeping',
     'Designing',
     'Coding',
     'Cycling',
     'Running'
 ];
 public radarChartData: any = [
     { data: [65, 59, 90, 81, 56, 55, 40], label: 'Series A' },
     { data: [28, 48, 40, 19, 96, 27, 100], label: 'Series B' }
 ];
 public radarChartType: string = 'radar';
 
 // PolarArea
 public polarAreaChartLabels: string[] = [
     'Download Sales',
     'In-Store Sales',
     'Mail Sales',
     'Telesales',
     'Corporate Sales'
 ];
 public polarAreaChartData: number[] = [300, 500, 100, 40, 120];
 public polarAreaLegend: boolean = true;
 
 public polarAreaChartType: string = 'polarArea';
 
 // lineChart
 public lineChartData: Array<any> = [
     { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
     { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' },
     { data: [18, 48, 77, 9, 100, 27, 40], label: 'Series C' }
 ];
 public lineChartLabels: Array<any> = [
     'January',
     'February',
     'March',
     'April',
     'May',
     'June',
     'July'
 ];
 public lineChartOptions: any = {
     responsive: true
 };
 public lineChartColors: Array<any> = [
     {
         // grey
         backgroundColor: 'rgba(148,159,177,0.2)',
         borderColor: 'rgba(148,159,177,1)',
         pointBackgroundColor: 'rgba(148,159,177,1)',
         pointBorderColor: '#fff',
         pointHoverBackgroundColor: '#fff',
         pointHoverBorderColor: 'rgba(148,159,177,0.8)'
     },
     {
         // dark grey
         backgroundColor: 'rgba(77,83,96,0.2)',
         borderColor: 'rgba(77,83,96,1)',
         pointBackgroundColor: 'rgba(77,83,96,1)',
         pointBorderColor: '#fff',
         pointHoverBackgroundColor: '#fff',
         pointHoverBorderColor: 'rgba(77,83,96,1)'
     },
     {
         // grey
         backgroundColor: 'rgba(148,159,177,0.2)',
         borderColor: 'rgba(148,159,177,1)',
         pointBackgroundColor: 'rgba(148,159,177,1)',
         pointBorderColor: '#fff',
         pointHoverBackgroundColor: '#fff',
         pointHoverBorderColor: 'rgba(148,159,177,0.8)'
     }
 ];
 public lineChartLegend: boolean = true;
 public lineChartType: string = 'line';
 
 // events
 public chartClicked(e: any): void {
     // console.log(e);
 }
 
 public chartHovered(e: any): void {
     // console.log(e);
 }
 
 public randomize(): void {
     // Only Change 3 values
     const data = [
         Math.round(Math.random() * 100),
         59,
         80,
         Math.random() * 100,
         56,
         Math.random() * 100,
         40
     ];
     const clone = JSON.parse(JSON.stringify(this.barChartData));
     clone[0].data = data;
     this.barChartData = clone;
     
 }*/
