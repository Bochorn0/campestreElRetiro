import { Component, OnInit,ViewChild } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CatalogosService } from '../../shared/services/catalogos.service';
import * as moment  from 'moment';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
@Component({
    selector: 'app-catalogos',
    templateUrl: './catalogos.component.html',
    styleUrls: ['./catalogos.component.scss'],
    animations: [routerTransition()],
    providers: [CatalogosService]
})
export class CatalogosComponent implements OnInit {
    catalogoTerrenos;catalogoCliente;ingresoNuevo;datosVenta;mantenimientoNuevo;datosMantenimiento;
    frmSolicitud: FormGroup; // Formulario de solicitud
    frmCliente: FormGroup; // Formulario de solicitud
    datosTodos;datosTodosTotales;datosDetalle;detalleCliente;
    @ViewChild('datatableDatosTodos')datatableDatosTodos;
    @ViewChild('datatableClientes')datatableClientes;
    @ViewChild('datatableDetalles')datatableDetalles;
    checksTerrenos = [];textoBuscar;
    parcelas=[];lotes=[];etapas=[];estatusTodos=[]
    parcelaFiltro;loteFiltro;etapaFiltro;estatusFiltro;
    constructor(private fb: FormBuilder, private catalogosService: CatalogosService) { 
        //this.parcelaFiltro = this.loteFiltro = this.etapaFiltro = 
        this.estatusFiltro = '0';
        this.frmCliente = fb.group({
            'Nombre': null,
            'Correo':  null,
            'NumIfe':  null,
            'Origen': null,
            'Direccion':  null,
            'Telefono':  null,
            'Fecha_nacimiento': null,
            'Ref1': null,
            'Ref2': null,
            'Ref3': null,
            'TelRef_1': null,
            'TelRef_2': null,
            'TelRef_3': null,
            'Saldo_agua': null,
            'Importe_mantenimiento': null,
            'Fecha_mantenimiento':  null,
            'Fecha_adeudo_mantenimiento':null,
            'Saldo_mantenimiento':  null,
            'Saldo_adeudo': null,
            'Saldo_anualidad': null,
            'Credito_original': null,
            'Saldo_certificado': null,
            'Saldo_credito':  null,
            'Periodo_cobro': null,
            'Observaciones':null,
            'ObservacionesDatos':null,
            'ObservacionesMantenimiento':null,
            'FileIFE': null,
            'FileComprobante': null,
            'Terrenos': []
        });                
    }

    filtrarParcelas = (text$: Observable<string>) =>
    
    text$.pipe( debounceTime(200), distinctUntilChanged(),
        map(term => term === ''?[]:this.parcelas.map(o=>o.parcela).filter(ob => `${ob}`.toUpperCase().indexOf(term.toUpperCase()) > -1))
    );    
    filtrarLotes = (text$: Observable<string>) =>
    text$.pipe( debounceTime(200), distinctUntilChanged(),
        map(term => term === ''?[]:this.lotes.map(o=>o.lote).filter(ob => `${ob}`.toUpperCase().indexOf(term.toUpperCase()) > -1))
    );    
    filtrarEtapas = (text$: Observable<string>) =>
    text$.pipe( debounceTime(200), distinctUntilChanged(),
        map(term => term === ''?[]:this.etapas.map(o=>o.etapa).filter(ob => `${ob}`.toUpperCase().indexOf(term.toUpperCase()) > -1))
    );    
    ngOnInit() {}
    buscarEn(){
        let dataFiltrada;
        if((this.textoBuscar) && this.datosTodosTotales){
            let datosCoincidencia = [];
            this.datosTodosTotales.forEach((dat)=>{
                let validado = false;
                if(this.textoBuscar){
                if(dat.Nombre.toString().toUpperCase().indexOf(this.textoBuscar.toUpperCase()) > -1){
                    validado = true;
                }
                if(dat.Estado.toString().toUpperCase().indexOf(this.textoBuscar.toUpperCase()) > -1){
                    validado = true;
                }
/*                if(dat.Partidas[0]){
                    dat.Partidas.forEach(dp=>{
                    let producto = (dp.Producto)?dp.Producto:(dp.Articulo)?dp.Articulo:``;
                    if(producto.toString().toUpperCase().indexOf(this.textoBuscar.toUpperCase()) > -1){
                        validado = true;
                    }
                    });
                }*/
                }
                if(validado){
                    datosCoincidencia.push(dat);
                }
            });
            dataFiltrada = datosCoincidencia;
        }else{
            dataFiltrada = this.datosTodosTotales;
        }
//        console.log('datafiltrada',dataFiltrada);
        let datosF = [];
        dataFiltrada.forEach(d=>{
            d.Terrenos.forEach(t=>{
                datosF.push(t);
            });
        });
//        console.log('datosF',datosF);
        // datosF = (this.parcelaFiltro != '0')?datosF.filter(f=>f['PARCELA'] == this.parcelaFiltro):datosF;
        // datosF = (this.loteFiltro != '0')?datosF.filter(f=>f['LOTE'] == this.loteFiltro):datosF;
        // datosF = (this.etapaFiltro != '0')?datosF.filter(f=>f['ETAPA'] == this.etapaFiltro):datosF;
        datosF = (this.parcelas.find(o=>o.parcela == this.parcelaFiltro))?datosF.filter(f=>f['PARCELA'] == this.parcelaFiltro):datosF;
        datosF = (this.lotes.find(o=>o.lote == this.loteFiltro))?datosF.filter(f=>f['LOTE'] == this.loteFiltro):datosF;
        datosF = (this.etapas.find(o=>o.etapa == this.etapaFiltro))?datosF.filter(f=>f['ETAPA'] == this.etapaFiltro):datosF;        
        datosF = (this.estatusFiltro != '0')?datosF.filter(f=>f['ESTADO'] == this.estatusFiltro):datosF;
        let datosOrd = this._ordenarDatosTodos(datosF);
        console.log('datosF',datosF);
        this._recorrerFiltros(datosOrd);
        this.datosTodos.Datos = datosOrd;
    }

    verCatalogoTerrenos(event){
        this._limpiarVistas();
        this.catalogoTerrenos = true;
    }
    verCatalogoClientes(event){
        this._limpiarVistas();
        this.catalogosService.obtenerDatosTodos().then(res=>{
            this.catalogoCliente = true;
        }).catch(err=>{
            console.log('err',err);
        });
    }
    verDatosTodos(){
        this._limpiarVistas();
        this.catalogosService.obtenerDatosTodos().then(res=>{
            let datos = this._ordenarDatosTodos(res['Datos']);
//            console.log('datos',datos);
            this.datosTodosTotales  = datos;
            this._recorrerFiltros(datos);
            this.datosTodos  =  { Datos: datos, Ordenes : {Saldo_credito:'',Saldo_certificado: '', Saldo_mantenimiento: '', Saldo_agua: ''}};
            
            /*if(this.datatableDatosTodos != null){
                this.datatableDatosTodos._reiniciarRegistros(this.datosTodos);
            }*/
            //console.log('datosTodos',this.datosTodos);
        }).catch(err=>{
            console.log('err',err);
        });
    }
    _recorrerFiltros(datos){
//        console.log('dat para fil',datos);
        this.parcelas = []; this.lotes = []; this.etapas = []; this.estatusTodos = [];
        if(datos){
            datos.forEach(d=>{
                d.Terrenos.forEach(t=>{
                    let existePar = this.parcelas.find(pa=>pa.parcela == t['PARCELA']);
                    if(!existePar){
                        this.parcelas.push({parcela:t['PARCELA']});
                    }
                    let existeEta = this.etapas.find(pa=>pa.etapa == t['ETAPA']);
                    if(!existeEta){
                        this.etapas.push({etapa:t['ETAPA']});
                    }
                    let existeLot = this.lotes.find(pa=>pa.lote == t['LOTE']);
                    if(!existeLot){
                        this.lotes.push({lote:t['LOTE']});
                    }
                    let existeEst = this.estatusTodos.find(pa=>pa.Estatus == t['ESTADO']);
                    if(!existeEst){
                        this.estatusTodos.push({Estatus:t['ESTADO']});
                    }
                })
            });
        }
    }
    asignarChecks(event){
        //console.log('even',event);
        this.checksTerrenos =  event;
        //console.log('even',this.checksTerrenos);
    }
    verEditarCampos(){
        if(this.checksTerrenos.length > 0){
        
        } 
    }
    generarNuevoCliente(){
        this.detalleCliente = {Terrenos:[{Id:0,Cotizacion:[{IdCotizacion:0}]}]}
    }
    editarRegistro(obj){
        let datosArray = [];
        Object.keys(obj).forEach((key)=>{
            datosArray.push({llave: `${key}`, valor: `${obj[key]}` });
        });
        let datosModificar = {Id: obj.Obj.Id, Datos : datosArray};
        //console.log('obj',datosModificar);
        this.catalogosService.modificarDatosTodos(datosModificar).then(res=>{
            this.verDatosTodos();
        }).catch(err=>{
            console.log('err',err);
        });
    }
    eliminarRegistro(obj){
        let datosArray = [];
        Object.keys(obj).forEach((key)=>{
            datosArray.push({llave: `${key}`, valor: `${obj[key]}` });
        });
        let ids = [{Id:obj.Id}];
        let datosModificar = {Ids: ids};
        //console.log('obj',datosModificar);
        this.catalogosService.modificarDatosTodos(datosModificar).then(res=>{
            this.verDatosTodos();
        }).catch(err=>{
            console.log('err',err);
        });
    }    
    _ordenarDatosTodos(datos){
        let datosOrdenados =  [];
        datos.forEach(d=>{
            let existeOrdenados =  datosOrdenados.find(dd => dd.Nombre.trim() == d["NOMBRE DEL CLIENTE"].trim());
            if(!existeOrdenados){
                let terrenos = datos.filter(da => da["NOMBRE DEL CLIENTE"].trim() == d["NOMBRE DEL CLIENTE"].trim());
                let infoT = '';
                let FechaMantenimiento = '';
                let FechaAdeudoMantenimiento = '';
                let ImporteMantenimiento = 0;
                let SaldoMantenimiento = 0;
                let PeriodoCobro = 0;
                let SaldoAgua = 0;
                let SaldoAdeudo = 0;
                let CreditoOriginal = 0;
                let SaldoCertificado = 0;
                let SaldoCredito = 0;
                let SaldoAnualidad = 0;
                if(terrenos[0]){
                    let cont = 1;
                    terrenos.forEach(t=>{
                        //DATOS COTIZACION 
                        t.Cotizacion = {
                            IdCotizacion : 0, 
                            Nombre: `Sistema_auto_${t['PARCELA']}_${cont}`,
                            Enganche: this._datoNumerico(t['ENGANCHE']),
                            EnganchePagado: this._datoNumerico(t['CANTIDAD DEL ENGANCHE PAGADO']),
                            Credito: this._datoNumerico(t['SALDO DEL CREDITO']),
                            Tasa: this._datoNumerico(t['INTERES']),
                            Num_pagos: this._datoNumerico(t['NUMERO MENSUALIDADES']),
                            Num_pagos_pagados: this._datoNumerico(t['CANTIDAD DE MENSUALIDADES PAGADAS']),
                            Fecha_inicio: (t['FECHA PRIMERA MENSUALIDAD']!= 0 && moment(t['FECHA PRIMERA MENSUALIDAD']).isValid())?`${moment(t['FECHA PRIMERA MENSUALIDAD'])}`:'-',
                            Superficie: this._datoNumerico(t['SUPERFICIE']),
                            Precio_metro: this._datoNumerico(t['COSTO DEL M2 EN VENTA']),
                            Costo_total: this._datoNumerico(t['SALDO DEL CREDITO']),
                            Mensualidad: this._datoNumerico(t['CANTIDAD DE MENSUALID']), 
                            Fecha_inicio_anualidad: (t['FECHA PRIMERA ANUALIDAD']!= 0 && moment(t['FECHA PRIMERA ANUALIDAD']).isValid())?`${moment(t['FECHA PRIMERA ANUALIDAD']).format('YYYY-MM-DD')}`:``, 
                            Num_anualidades: this._datoNumerico(t['NUMERO DE ANUALIDADES']),
                            Num_anualidades_pagadas: this._datoNumerico(t['CANTIDAD DE ANUALIDADES PAGADAS']),
                            Anualidad: this._datoNumerico(t['CANTIDAD ANUALIDADES']),
                            Fecha_cotizacion: `${moment().format('YYYY-MM-DD')}`,
                            //Extras
                            Saldo_agua : (this._datoNumerico(t['CONTRATO DEL AGUA']) - this._datoNumerico(t['CANTIDAD ABONADA A CONTRATO AGUA'])),
                            ImporteMantenimiento : this._datoNumerico(t['CUOTA MANTENIMIENTO']),
                            PeriodoCobro: (t['MODO DE COBRO DE MANTEMIENTO (MENSUAL O SEMESTRAL)'].indexOf('6') > -1)?6:(t['MODO DE COBRO DE MANTEMIENTO (MENSUAL O SEMESTRAL)'].indexOf('1') > -1)?1:0,
                            FechaMantenimiento:(t['FECHA DE COBRO PRIMER MANTENIMIENTO'] && t['FECHA DE COBRO PRIMER MANTENIMIENTO'] != '-')?(moment(t['FECHA DE COBRO PRIMER MANTENIMIENTO']).isValid())?`${moment(t['FECHA DE COBRO PRIMER MANTENIMIENTO']).format('YYYY-MM-DD')}`:'':'',
//                            FechaAdeudoMantenimiento:(t['TIEMPO DE DEUDA MANTENIMIENTO'] && t['TIEMPO DE DEUDA MANTENIMIENTO'] != '-')?(moment(t['TIEMPO DE DEUDA MANTENIMIENTO']).isValid())?`${moment(t['TIEMPO DE DEUDA MANTENIMIENTO']).format('YYYY-MM-DD')}`:'':'',
//                            FechaAdeudoMantenimiento:(t['TIEMPO DE DEUDA MANTENIMIENTO'] && t['TIEMPO DE DEUDA MANTENIMIENTO'] != '-')?`${t['TIEMPO DE DEUDA MANTENIMIENTO']}`:'',
                            SaldoCertificado : (this._datoNumerico(t['DEUDA CERTIFICADO']) - this._datoNumerico(t['CANTIDAD ABONADA A CERTIFICADP'])),
                            Estado: `${t['ESTADO']}`,
                        }
                        t.Cotizacion.Enganche_Actual = (t.Cotizacion.Enganche - t.Cotizacion.EnganchePagado);
                        t.Cotizacion.Num_pagos_Actual = (t.Cotizacion.Num_pagos - t.Cotizacion.Num_pagos_pagados);
                        t.Cotizacion.Num_pagos_anualidad_Actual = (t.Cotizacion.Num_anualidades - t.Cotizacion.Num_anualidades_pagadas);
                        //DATOS DE SALDOS DE AGUA 
                        SaldoAgua += (this._datoNumerico(t['CONTRATO DEL AGUA']) - this._datoNumerico(t['CANTIDAD ABONADA A CONTRATO AGUA']));
                        //DATOS INFORMACION TERRENOS
                        infoT += ` (${cont}) Parcela:${t['PARCELA']}-Etapa:${t['ETAPA']}-Lote:${t['LOTE']};`;
                        //DATOS MANTENIMIENTO
                        SaldoMantenimiento += this._datoNumerico(t['DEUDA DE MANTENIMIENTO 2018']);
                        ImporteMantenimiento += this._datoNumerico(t['CUOTA MANTENIMIENTO']);
                        if(PeriodoCobro == 0){
                            PeriodoCobro = (t['MODO DE COBRO DE MANTEMIENTO (MENSUAL O SEMESTRAL)'].indexOf('6') > -1)?6:(t['MODO DE COBRO DE MANTEMIENTO (MENSUAL O SEMESTRAL)'].indexOf('1') > -1)?1:0;
                        }
                        if(FechaMantenimiento == ''){
                            FechaMantenimiento = (t['FECHA DE COBRO PRIMER MANTENIMIENTO'] && t['FECHA DE COBRO PRIMER MANTENIMIENTO'] != '-')?(moment(t['FECHA DE COBRO PRIMER MANTENIMIENTO']).isValid())?`${moment(t['FECHA DE COBRO PRIMER MANTENIMIENTO']).format('YYYY-MM-DD')}`:'':'';
                        }
                        if(FechaAdeudoMantenimiento == ''){
//                            console.log('FechaAdeudoMantenimiento',FechaAdeudoMantenimiento);
//                            FechaAdeudoMantenimiento = t['TIEMPO DE DEUDA MANTENIMIENTO'];
                            FechaAdeudoMantenimiento = (t['TIEMPO DE DEUDA MANTENIMIENTO'] && t['TIEMPO DE DEUDA MANTENIMIENTO'] != '-')?(moment(t['TIEMPO DE DEUDA MANTENIMIENTO']).isValid())?`${moment(t['TIEMPO DE DEUDA MANTENIMIENTO']).format('YYYY-MM-DD')}`:'':'';
                        }
                        //DATOS CREDITO Y ADEUDOS
                        SaldoAdeudo += (t.Cotizacion.Enganche - t.Cotizacion.EnganchePagado);
                        CreditoOriginal += (t.Cotizacion.Credito);
                        SaldoCertificado += (this._datoNumerico(t['DEUDA CERTIFICADO']) - this._datoNumerico(t['CANTIDAD ABONADA A CERTIFICADP']));
                        SaldoCredito += (t.Cotizacion.Num_pagos*t.Cotizacion.Mensualidad)-(t.Cotizacion.Num_pagos_pagados*t.Cotizacion.Mensualidad); 
                        SaldoAnualidad += (t.Cotizacion.Num_anualidades*t.Cotizacion.Anualidad)-(t.Cotizacion.Num_anualidades_pagadas*t.Cotizacion.Anualidad);
                        cont++;
                    });
                }
                datosOrdenados.push({
                    Nombre:d["NOMBRE DEL CLIENTE"].trim(),
                    Correo:d["CORREO"].trim(),
                    NumIfe:d["NUMERO DE INE"].trim(),
                    Origen:d["LUGAR DE ORIGEN"].trim(),
                    Direccion:d["DIRECCION"].trim(),
                    Telefono:d["TELEFONO"].trim(),
                    Fecha_nacimiento:(moment(d["FECHA DE NACIMIENTO CLIENTE ACTUAL"].trim()).isValid())?`${moment(d["FECHA DE NACIMIENTO CLIENTE ACTUAL"].trim()).format('YYYY-MM-DD')}`:'-',
                    Ref1:d["NOMBRE REFERENCIA 1"].trim(),
                    Ref2:d["NOMBRE REFERENCIA 2"].trim(),
                    Ref3:d["NOMBRE REFERENCIA 3"].trim(),
                    TelRef_1:d["TELEFONO REFERENCIA 1"].trim(),
                    TelRef_2:d["TELEFONO REFERENCIA 2"].trim(),
                    TelRef_3:d["TELEFONO REFERENCIA 3"].trim(),
                    Estado:(d["ESTADO"] != '-')?d["ESTADO"]:'SIN ESTADO',
                    Saldo_agua:SaldoAgua,
                    Importe_mantenimiento:ImporteMantenimiento,
                    Fecha_mantenimiento:FechaMantenimiento,
                    Fecha_adeudo_mantenimiento:FechaAdeudoMantenimiento,
                    Saldo_mantenimiento: SaldoMantenimiento,
                    Saldo_adeudo: SaldoAdeudo,
                    Saldo_anualidad: SaldoAnualidad,
                    Credito_original: CreditoOriginal,
                    Saldo_credito:SaldoCredito,
                    Saldo_certificado: SaldoCertificado,
                    Periodo_cobro:PeriodoCobro,
                    InfoTerrenos: infoT,
                    Terrenos:terrenos,
                    ObjCompleto: d
                });            
            }
        });
        return datosOrdenados;
    }
    _datoNumerico(dat){
        if(`${dat}`.trim().split('$').join('').split(',').join('') && `${dat}`.trim().split('$').join('').split(',').join('') != '-'){
            return parseFloat(`${dat}`.trim().split('$').join('').split(',').join(''));
        }
    return 0;
    }
    cambiarOrden(col){
        this.datosTodos.Ordenes[`${col}`];
        this.datosTodos.Ordenes[`${col}`] = (this.datosTodos.Ordenes[`${col}`] == 'down')?'up':`down`;
        let reorden;
        if(this.datosTodos.Ordenes[`${col}`] == 'down'){
          reorden =  this.datosTodos.Datos.sort((a,b)=>{
            if (a[`${col}`] === b[`${col}`]) { return 0;}
            else { return (a[`${col}`] < b[`${col}`]) ? -1 : 1; }
          });
        }else{
          reorden =  this.datosTodos.Datos.reverse((a,b)=>{
            if (a[`${col}`] === b[`${col}`]) { return 0;}
            else { return (a[`${col}`] < b[`${col}`]) ? -1 : 1; }
          });
        }
    }        
    datosDetalles(obj){
        let datosOrdenados = { Datos: obj.Terrenos};
        if(this.datatableDetalles != null){
            this.datatableDetalles._reiniciarRegistros(datosOrdenados);
        }
        this.detalleCliente = datosOrdenados;
    }
    datosEditar(obj){
        let datosOrdenados = { Datos: obj.Terrenos};
        if(this.datatableDetalles != null){
            this.datatableDetalles._reiniciarRegistros(datosOrdenados);
        }
        this.detalleCliente = datosOrdenados;
    }    
    nueva_operacion(evento){
        this._limpiarVistas();
        if(evento.Operacion == 1){
            this.ingresoNuevo = true;
            this.datosVenta = evento.cliente;
        }else if(evento.Operacion == 2){
            this.mantenimientoNuevo = true;
            this.datosMantenimiento = evento.cliente;
        }
    }
    _limpiarVistas(){
        // this.datosTodosTotales  = [];
        // this.datosTodos  =  { Datos: [], Ordenes : {Saldo_credito:'',Saldo_certificado: '', Saldo_mantenimiento: '', Saldo_agua: ''}};
        this.datosTodos = this.detalleCliente =  this.datosDetalle =  this.ingresoNuevo = this.mantenimientoNuevo = this.datosMantenimiento = this.catalogoTerrenos = this.catalogoCliente = false;
    }
}
