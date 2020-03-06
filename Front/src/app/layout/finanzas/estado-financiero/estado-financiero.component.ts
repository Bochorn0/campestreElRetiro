import { Component, OnInit, ViewChild } from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { EstadisticasService } from '../../../shared/services/estadisticas.service'
import { CatalogosService } from '../../../shared/services/catalogos.service'
import * as moment  from 'moment';
import * as _ from 'lodash';
import swal from 'sweetalert2';
@Component({
    selector: 'app-estado-financiero',
    templateUrl: './estado-financiero.component.html',
    styleUrls: ['./estado-financiero.component.scss'],
    animations: [routerTransition()],
    providers: [EstadisticasService, CatalogosService]
})

export class EstadoFinancieroComponent implements OnInit {
    idReporte;fInicio;fFin;resultadoReporte;cuentas;catalogoUsuarios;cuenta;usuario;
    @ViewChild('datatableIngresos')datatableIngresos;
    @ViewChild('datatableGastos')datatableGastos;
    @ViewChild('datatableGastosDetalle')datatableGastosDetalle;
    @ViewChild('datatableGastosDetalle2')datatableGastosDetalle2;
    @ViewChild('datatableIngresosDetalle')datatableIngresosDetalle;
    @ViewChild('datatableIngresosDetalle2')datatableIngresosDetalle2;    

    datosFiltrar;resultadosIngresos;resultadosGastos;
    totalIngresos;totalGastos;
    pagosIngresos;pagosGastos;tiposIngresos;tiposGastos;
    gastosChart;gastosTodos;ingresosTodos;resultadosGastosDetalle;
    totalGastosDetalle;labelGastos;resultadosIngresosDetalle;totalIngresosDetalle;labelIngresos;
    ingresosChart;
    filtroFormas;filtroConceptos;filtroEstadoResultado;filtroCuentas;filtroDatosTabla;
    ingresosChart2;totalIngresosDetalle2;labelIngresos2;resultadosIngresosDetalle2;
    gastosChart2;totalGastosDetalle2;labelGastos2;resultadosGastosDetalle2;
    saldoTotalCuentas;
    verDetalleIngresos;verDetalleGastos;
constructor(private estadisticasService: EstadisticasService, private catalogosService : CatalogosService) {
    this.idReporte =  this.cuenta = this.usuario = 0;
    this.filtroFormas = this.filtroConceptos  = this.filtroEstadoResultado = false;
    this.fFin =  moment(new Date()).format('YYYY-MM-DD');
//    this.fInicio =  moment(`${moment(new Date()).format('YYYY-')}01-01`).format('YYYY-MM-DD');
    this.fInicio =  moment(`2018-01-01`).format('YYYY-MM-DD');
    this._obtenerFuentesGastos();
    this._obtenerFuentesGastos();
    this._catalogoUsuarios();
    this.saldoTotalCuentas = this.verDetalleIngresos = this.verDetalleGastos = 0;
}
_catalogoUsuarios(){
    this.catalogosService.obtenerUsuarios().then(res=>{
        console.log('res',res);
        this.catalogoUsuarios =  res['Data'];
    });
}
_obtenerFuentesGastos(){
    this.catalogosService.obtenerCuentasEspeciales().then(res =>{
        console.log('res',res);
        this.cuentas = res['Data'].filter(r=>r.Activa == true);
        this.cuentas.forEach(c=>{
            c.Active = true
        });
    }).catch(err=>{console.log('err',err);});
}

filtrarVentas(){
    console.log('usuarios',this.usuario);
    console.log('cuenta',this.cuenta);
    let restantes =  this.datosFiltrar;
    console.log('cuenta',restantes);
    if(this.usuario != 0){
        restantes =  restantes.filter(ob=>ob.ObjCompleto.IdUsuario == this.usuario);
    }
    if(this.cuenta != 0){
        restantes =  restantes.filter(ob=>ob.ObjCompleto.IdCuenta == this.cuenta);
    }
    if(!restantes[0]){
        restantes = [{Resultados: 'No se encontraron resultados'}]
    }
    if(this.datatableIngresos != null){
        this.datatableIngresos._reiniciarRegistros({Datos:restantes});
    }

    this.resultadoReporte =  {Datos:restantes};

}
recalcularResultados(){
    let cuentas = this.cuentas.filter(ob=>ob.Active == true);
    this.saldoTotalCuentas = 0;
    let str_cuentas = ``;
    cuentas.forEach(c=>{
        this.saldoTotalCuentas += c.Saldo;
        str_cuentas += ` ${c.IdCuenta} , `;
    });
    this.totalIngresos = 0;    
    let ingresos = [];
    this.ingresosTodos.forEach(i=>{
        if(str_cuentas.indexOf(i.ObjCompleto.IdCuenta) > -1){
            this.totalIngresos += i.Total;
            ingresos.push(i);
        }
    })
    this.totalGastos = 0;
    let gastos = [];
    this.gastosTodos.forEach(g=>{
        if(str_cuentas.indexOf(g.ObjCompleto.IdCuenta) > -1){
            this.totalGastos += g.Total;
            gastos.push(g);
        }
    })
    if(this.datatableIngresos != null){
        this.datatableIngresos._reiniciarRegistros({Datos:(ingresos[0])?ingresos:[{"-":`Sin resultados`}]});
    }
    this.resultadosIngresos =  {Datos:(ingresos[0])?ingresos:[{"-":`Sin resultados`}]};

    if(this.datatableGastos != null){
        this.datatableGastos._reiniciarRegistros({Datos:(gastos[0])?gastos:[{"-":`Sin resultados`}]});   
    }
    this.resultadosGastos =  {Datos:(gastos[0])?gastos:[{"-":`Sin resultados`}]};
}
confirmarGuardarEstadoResultados(){

}
generarReporte(){
    this.resultadosIngresos =  this.resultadosGastos = false;
    let Filtros = {Fecha_inicio: this.fInicio, Fecha_fin: this.fFin};
    this.estadisticasService.obtenerReporteFinanzas(Filtros).then(res=>{
        console.log('res',res);
        if(res['Data']){
            let ingresosOrdenados = this._ordenarDatosFinanzas(res['Data'].DatosVenta);
            this.ingresosTodos = ingresosOrdenados;
            let ingresosProcesados = this._procesarIngresos(ingresosOrdenados);
            let ingresosProcesados2 = this._procesarIngresos2(ingresosOrdenados);
            console.log('ingresos 2 ',ingresosProcesados2);
            this.ingresosChart = this._pieChartOrder("Resumen de Ingresos Por Conceptos",ingresosProcesados);
            this.ingresosChart2 = this._pieChartOrder("Resumen de Ingresos Por FormaPago",ingresosProcesados2);


            let gastosOrdenados = this._ordenarDatosGastos(res['Data'].DatosGastos);
            this.gastosTodos = gastosOrdenados;
            let gastosProcesados = this._procesarGastos(gastosOrdenados);
            let gastosProcesados2 = this._procesarGastos2(gastosOrdenados);
            this.gastosChart = this._pieChartOrder("Resumen de Gastos Por Conceptos",gastosProcesados);
            this.gastosChart2 = this._pieChartOrder("Resumen de Gastos Por FormaPago",gastosProcesados2);
    //        let datosOrdenados = res['Data'];
    //        this.datosFiltrar =  ingresosOrdenados;
            if(this.datatableIngresos != null){
                this.datatableIngresos._reiniciarRegistros({Datos:ingresosOrdenados});
            }
            this.resultadosIngresos =  {Datos:ingresosOrdenados};

            //this.datosFiltrar =  gastosOrdenados;
            if(this.datatableGastos != null){
                this.datatableGastos._reiniciarRegistros({Datos:gastosOrdenados});   
            }
            this.resultadosGastos =  {Datos:gastosOrdenados};
        }else{
            swal('Advertencia','No existen datos para esta consulta','warning');
        }
    }).catch(err=>{console.log('err',err);});
}
_ordenarDatosGastos(datos){
    let datosOrdenados = [];
    this.tiposGastos = [];
     this.pagosGastos = [];
    this.totalGastos = 0;
    if(datos[0]){
        datos.forEach(da=>{
            let cuenta = this.cuentas.find(c=>c.IdCuenta == da.IdCuenta);
            datosOrdenados.push({Folio: `${da.Folio_gasto}${da.IdGasto}`, Concepto: da.Concepto, Tipo: da.Tipo, Pago: da.Forma_pago,Cuenta: cuenta.Nombre , Usuario:da.Nombre, Fecha: da.Fecha_gasto, Total:da.Total ,ObjCompleto: da});
            this.totalGastos += da.Total;
            let existePago = this.pagosGastos.find(ob=>ob.Pago == da.Forma_pago);
            if(!existePago){
                this.pagosGastos.push({Pago: da.Forma_pago});
            }
            let existeTipo = this.tiposGastos.find(ob=>ob.Tipo == da.Tipo);
            if(!existeTipo){
                this.tiposGastos.push({Tipo: da.Tipo});
            }
        });
    }

    return datosOrdenados;
}
_ordenarDatosFinanzas(datos){
    let datosOrdenados = [];
    this.tiposIngresos = [];
     this.pagosIngresos = [];
    this.totalIngresos = 0;
    datos.forEach(da=>{
        let cuenta = this.cuentas.find(c=>c.IdCuenta == da.IdCuenta);
        datosOrdenados.push({Folio: `${da.Folio_venta}-${da.IdVenta}`, Concepto: da.Concepto, Tipo: da.Tipo_venta, Pago: da.Forma_pago, Cuenta: cuenta.Nombre, Usuario:da.Nombre, Total:da.Importe, Fecha: da.Fecha_venta ,ObjCompleto: da});
        this.totalIngresos += da.Importe;
        let existePago = this.pagosIngresos.find(ob=>ob.Pago == da.Forma_pago);
        if(!existePago){
            this.pagosIngresos.push({Pago: da.Forma_pago});
        }
        let existeTipo = this.tiposIngresos.find(ob=>ob.Tipo == da.Tipo_venta);
        if(!existeTipo){
            this.tiposIngresos.push({Tipo: da.Tipo_venta});            
        }
    });
    return datosOrdenados;
}
//Click en grafica de gastos
chartGastosClicked(e){
    this.labelGastos = this._interpreteEventoClicked(e);
    let datosSelected = {Datos: (this.labelGastos)?this.gastosTodos.filter(ob=>ob.Tipo ==  this.labelGastos):this.gastosTodos};
    this.totalGastosDetalle = 0;
    datosSelected.Datos.forEach(da=>{
        this.totalGastosDetalle += da.Total;
    })
    if(this.datatableGastosDetalle != null){
        this.datatableGastosDetalle._reiniciarRegistros(datosSelected);
    }    
    this.resultadosGastosDetalle = datosSelected;            
    //this.gastosChart.Tabla = datosSelected;
}
//Click en grafica de gastos
chartGastosClicked2(e){
    this.labelGastos2 = this._interpreteEventoClicked(e);
    let datosSelected = {Datos: (this.labelGastos2)?this.gastosTodos.filter(ob=>ob.Pago ==  this.labelGastos2):this.gastosTodos};
    this.totalGastosDetalle2 = 0;
    datosSelected.Datos.forEach(da=>{
        this.totalGastosDetalle2 += da.Total;
    })
    if(this.datatableGastosDetalle2 != null){
        this.datatableGastosDetalle2._reiniciarRegistros(datosSelected);
    }    
    this.resultadosGastosDetalle2 = datosSelected;            
    //this.gastosChart.Tabla = datosSelected;
}
//Click en grafica de ingresos
chartIngresosClicked(e){
    this.labelIngresos = this._interpreteEventoClicked(e);
    let datosSelected = {Datos: (this.labelIngresos)?this.ingresosTodos.filter(ob=>ob.Tipo ==  this.labelIngresos):this.ingresosTodos};
    this.totalIngresosDetalle = 0;
    datosSelected.Datos.forEach(da=>{
        this.totalIngresosDetalle += da.Total;
    })
    if(this.datatableIngresosDetalle != null){
        this.datatableIngresosDetalle._reiniciarRegistros(datosSelected);
    }    
    this.resultadosIngresosDetalle = datosSelected;            
}
//Click en grafica de ingresos
chartIngresosClicked2(e){
    this.labelIngresos2 = this._interpreteEventoClicked(e);
    console.log('label',this.labelIngresos2);
    let datosSelected = {Datos: (this.labelIngresos2)?this.ingresosTodos.filter(ob=>ob.Pago ==  this.labelIngresos2):this.ingresosTodos};
    this.totalIngresosDetalle2 = 0;
    console.log('label',datosSelected);
    datosSelected.Datos.forEach(da=>{
        this.totalIngresosDetalle2 += da.Total;
    })
    if(this.datatableIngresosDetalle2 != null){
        this.datatableIngresosDetalle2._reiniciarRegistros(datosSelected);
    }    
    this.resultadosIngresosDetalle2 = datosSelected;            
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
//Procesa y ordena los datos de ingresos 
_procesarIngresos(Datos){
    let tiposIngresos = [];
    let contenidoTipoIngresos = [];
    Datos.forEach(dat =>{
        tiposIngresos[dat.Tipo] = dat.Tipo;
    });
    Object.keys(tiposIngresos).forEach(t => {
        let coincidencias = Datos.filter(ob=>ob.Tipo == t);
        contenidoTipoIngresos[t] = coincidencias;
    })
    return contenidoTipoIngresos;
}
//Procesa y ordena los datos de ingresos 
_procesarIngresos2(Datos){
    let tiposIngresos = [];
    let contenidoTipoIngresos = [];
    console.log('Datos',Datos);
    Datos.forEach(dat =>{
        tiposIngresos[dat.Pago] = dat.Pago;
    });
    console.log('tipos',tiposIngresos);
    Object.keys(tiposIngresos).forEach(t => {
        let coincidencias = Datos.filter(ob=>ob.Pago == t);
        contenidoTipoIngresos[t] = coincidencias;
    })
    return contenidoTipoIngresos;
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
//Procesa y ordena  datos de gastos por pago
_procesarGastos2(Datos){
    let tiposGastos = [];
    let contenidoTiposGastos = [];
    Datos.forEach(dat =>{
        tiposGastos[dat.Pago] = dat.Pago;
    });
    Object.keys(tiposGastos).forEach(t => {
        let coincidencias = Datos.filter(ob=>ob.Pago == t);
        contenidoTiposGastos[t] = coincidencias;
    })
    return contenidoTiposGastos;
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
ngOnInit() {}
}


