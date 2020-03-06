import { Component, OnInit ,Input ,Output , EventEmitter , ViewChild} from '@angular/core';
import { routerTransition } from '../../../../router.animations';
import { CatalogosService } from '../../../../shared/services/catalogos.service';
import { VentasService } from '../../../../shared/services/ventas.service';
import {Observable} from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import {NgbActiveModal,NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import * as moment from 'moment';
import * as _ from 'lodash';
@Component({
    selector: 'app-formulario-clientes-separado',
    templateUrl: './formulario-clientes-separado.component.html',
    styleUrls: ['./formulario-clientes-separado.component.scss'],
    animations: [routerTransition()],
    providers: [CatalogosService, VentasService]
})
export class FormularioClientesSeparadoComponent implements OnInit {
    //Datos Basicos
    IdCotizacion;cotizaciones;nombre;numIfe;comprobante;fotoIfe;origen;telefono;correo;fComprobante;fIfe;direccion;fNacimiento;
    terrenos;IdTerreno; datosTerreno;celReferencia1;celReferencia2;celReferencia3;pdfPagare;
    parcelas;lotes;etapas;clienteDatosTodos; pagina ;dataCli;activeModal;
    datosMantenimientos;MantenimientosPreCalculados;terrenoCotizacion;datosEspeciales; datosCotizacionGenerados;datosCotizacionAnualidad;
    //Datos Referencias
    referencia1;referencia2;referencia3;
    //Datos Terreno
    terrenosCliente = [];
    frmCliente: FormGroup; // Formulario de solicitud
    numParcela;numLote;numEtapa;supercifie;costoMetro;
    @ViewChild('datatableMantenimientos')datatableMantenimientos;
    @Input('datosCliente') datosCliente: any
    @Input() Nuevo: Boolean = false ;
    @Output() public vista = new EventEmitter();
    //Mantenimiento
    fechaPrimerMantenimiento;contratoAgua;importeMantenimiento;fechaParaCobro;
    datosTodosTotales;otroClienteTerreno;
    filasMantenimiento;
    constructor(private fb: FormBuilder,private catalogosService : CatalogosService, private ventasService: VentasService, private modalService: NgbModal) {
        this.IdCotizacion = 0;
        this.datosTodosClientes();
        this._obtenerCotizaciones();
        this._obtenerTerrenos();
        this.numParcela = '';
        this.costoMetro =  140;
        this.terrenosCliente = [];
        this.terrenosCliente.push({IdCotizacion : 0});
 //       this.nombre = 'Bocho';
 //       this.numIfe = this.origen = this.telefono = this.direccion = this.referencia1 = this.referencia2 = this.referencia3 = 'Prueba';
 //       this.correo = 'prueba@prueba.com';
 //       this.fNacimiento = '1991-08-24';
 //       this.fechaParaCobro = 0;
        //this.importeMantenimiento = 1500;
        //this.contratoAgua = 500;
        //this.fechaPrimerMantenimiento =  `${moment().add('6','month').format('YYYY-MM')}-15`;
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
            'Fecha_adeudo_mantenimiento':null,
            'Fecha_mantenimiento':  null,
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
            'FotoIfe': null,
            'Comprobante':null,
            'Terrenos': []
        });        
        this.clienteDatosTodos = false;
        //console.log('datosCliente',this.datosCliente);
    }
    abrirModal(content){
        this.activeModal = this.modalService.open(content, {windowClass: 'modal-holder', size: 'lg'});
//        this.modalService.open(content).result.then((result) => { }, (reason) => { });
    }
    cambiosArea(){
        let mantenimientosGenerados = [];
//        console.log('filas',this.filasMantenimiento);
        if(this.filasMantenimiento){
            let rows = this.filasMantenimiento.split("\n");
//            console.log('rows',rows);
            if(rows[0] && rows[1]){
                let fechs = rows[0].split("\t");
                let cols = rows[1].split("\t");
                // if(cols[0].trim()!= '' && cols[0].trim() != "\n"){
                    let acumulado = 0;
                    let monto_man = 0;
                    for(let i = 0; i < cols.length; i++){
                        let f = `${fechs[i]}`.trim();
                        let mont = parseFloat(`${cols[i]}`.split('$').join('').split(',').join('').split('.')[0]);
                        let mon = (f.toUpperCase().indexOf('JUL') > -1 || f.toUpperCase().indexOf('DIC') > -1)?'07':'01';
                        let ani = f.substring(f.length-4,f.length);
                        let fech = `${ani}-${mon}-01`;
                        acumulado += mont;                
                        mantenimientosGenerados.push({"Fecha Mantenimiento": fech, "Monto Mantenimiento":mont , "Acumulado": acumulado });
                        monto_man = mont;
                    }
                    let mes = parseFloat(moment().format('MM'));
                    this.frmCliente.controls['Fecha_mantenimiento'].setValue((mes > 6)?`${moment().format('YYYY')}-07-01`:`${moment().format('YYYY')}-01-01`);
                    this.frmCliente.controls['Importe_mantenimiento'].setValue(monto_man);
                    this.frmCliente.controls['Periodo_cobro'].setValue(6);
            //                console.log('mantenimientosGenerados',mantenimientosGenerados);
                    this.MantenimientosPreCalculados = {mantenimientos: mantenimientosGenerados,  Saldo: acumulado } ;
                    this.frmCliente.controls['Saldo_mantenimiento'].setValue(acumulado);
                    this.datosMantenimientos = { Datos : mantenimientosGenerados}
                    if(this.datatableMantenimientos != null){
                        this.datatableMantenimientos._reiniciarRegistros(this.datosMantenimientos);
                    }
            }else if(rows[0]){
                let cols = rows[0].split("\t");
                // console.log('cols',cols); 
//                let monto = 0;
                let acumulado = 0;
                let fech_final = (parseFloat(moment().format('MM')) > 6)?`${moment().format('YYYY')}-07-01`:`${moment().format('YYYY')}-01-01`;
                
                this.frmCliente.controls['Fecha_mantenimiento'].setValue(moment(fech_final).add('6','month').format('YYYY-MM-DD'));
                // console.log('cols[cols.length-1]',cols[cols.length-1]);
                this.frmCliente.controls['Importe_mantenimiento'].setValue(`${cols[cols.length-1]}`.trim().split('$').join('').split(',').join('').split('.')[0]);
                let fecha_ = fech_final;
                for(let i = cols.length-1; i >= 0; i--){
                    let mont = parseFloat(`${cols[i]}`.split('$').join('').split(',').join('').split('.')[0]);
                    acumulado += mont;
                    mantenimientosGenerados.push({"Fecha Mantenimiento": fecha_, "Monto Mantenimiento": mont , "Acumulado": acumulado });
                    fecha_ = moment(fecha_).subtract('6','month').format('YYYY-MM-DD');

                }
                this.MantenimientosPreCalculados = {mantenimientos: mantenimientosGenerados,  Saldo: acumulado } ;
                this.frmCliente.controls['Saldo_mantenimiento'].setValue(acumulado);
                this.frmCliente.controls['Periodo_cobro'].setValue(6);
                this.datosMantenimientos = { Datos : mantenimientosGenerados}
                if(this.datatableMantenimientos != null){
                    this.datatableMantenimientos._reiniciarRegistros(this.datosMantenimientos);
                }                
            }

            // }
        }
    }
    datosTodosClientes(){
        this.catalogosService.obtenerDatosTodos().then(res=>{
//            console.log('datos',datos);
            this.datosTodosTotales  = res['Datos'];
        }).catch(err=>{
            console.log('err',err);
        });
    }
    calcularMantenimientoPorFecha(){
        let datosForm = this.frmCliente.getRawValue();
//        let fecha = this.frmCliente.controls['Fecha_adeudo_mantenimiento'].value;
 //       let datosConsulta = {Fecha: `${fecha}`};
        let error = ``; 
        if(!datosForm.Periodo_cobro || datosForm.Periodo_cobro <= 0){
            error = `Debes introducir un periodo de cobro`;
        }
        if(!datosForm.Fecha_adeudo_mantenimiento || !moment(datosForm.Fecha_adeudo_mantenimiento).isValid()){
            error = `Debes introducir una fecha de adeudo valida`;
        }
        if(!datosForm.Importe_mantenimiento){
            error = `Debes introducir un monto de mantenimiento valido `;
        }
        if(error){
            swal('Error',error,'error');
        }else{
            datosForm.Saldo_mantenimiento = 0;
    ///        console.log('datosConsulta',datosForm);
            this.ventasService.obtenerMantenimientoCalculado(datosForm).then(res=>{
                let result =JSON.parse(JSON.stringify(res));
                console.log('res',result);
                this.MantenimientosPreCalculados = result;
                this.frmCliente.controls['Saldo_mantenimiento'].setValue(result.Saldo);
                this.datosMantenimientos = { Datos : result.mantenimientos}
                if(this.datatableMantenimientos != null){
                    this.datatableMantenimientos._reiniciarRegistros(this.datosMantenimientos);
                }
            }).catch(err=>{
                console.log('err',err);
            });
        }

    }
    calcularMantenimientoPorMonto(){
        let datosForm = this.frmCliente.getRawValue();
        let error = ``;
        if(!datosForm.Periodo_cobro || datosForm.Periodo_cobro <= 0){
            error = `Debes introducir un periodo de cobro`;
        }
        if(!datosForm.Fecha_mantenimiento || !moment(datosForm.Fecha_mantenimiento).isValid()){
            error = `Debes introducir una fecha de mantenimiento inicial  valida`;
        }
        if(!datosForm.Importe_mantenimiento){
            error = `Debes introducir un monto de mantenimiento valido `;
        }
        if(!datosForm.Saldo_mantenimiento || datosForm.Saldo_mantenimiento <= 0){
            error = `Debes introducir un monto de adeudo de mantenimiento valido `;
        }
        if(error){
            swal('Error',error,'error');
        }else{
            // let monto = this.frmCliente.controls['Saldo_mantenimiento'].value;
            // let datosConsulta = {Monto: monto};
//            console.log('datosConsulta',datosForm);
            this.ventasService.obtenerMantenimientoCalculado(datosForm).then(res=>{
                let result =JSON.parse(JSON.stringify(res));
                console.log('res',result);
                this.MantenimientosPreCalculados = result;
                this.datosMantenimientos = { Datos : result.mantenimientos}
                if(this.datatableMantenimientos != null){
                    this.datatableMantenimientos._reiniciarRegistros(this.datosMantenimientos);
                }
            }).catch(err=>{
                console.log('err',err);
            });
        }
    }
    formatter = (result: string) => result.toUpperCase();
    asignarCotizacion(event){
        if(event.Cotizacion){
            this.datosCotizacionGenerados = event.Cotizacion;
        }
    }
    asignarCotizacionAnualidad(event){
        if(event.Cotizacion){
            this.datosCotizacionAnualidad = event.Cotizacion;
        }
    }
    actualizarDatos(){
        if(this.datosCotizacionGenerados){
            console.log('datosCotizacionGenerados',this.datosCotizacionGenerados);
            this.terrenosCliente.find(t=>t.IdTerreno == this.terrenoCotizacion.IdTerreno).Cotizacion[0].Mensualidad = this.datosCotizacionGenerados.DatosCotizacion.Mensualidad ;
            this.terrenosCliente.find(t=>t.IdTerreno == this.terrenoCotizacion.IdTerreno).Cotizacion[0].Enganche_Actual = this.datosCotizacionGenerados.DatosCotizacion.Enganche ;
            this.terrenosCliente.find(t=>t.IdTerreno == this.terrenoCotizacion.IdTerreno).Cotizacion[0].Num_pagos_originales = this.datosCotizacionGenerados.DatosCotizacion.Num_pagos ;
            this.terrenosCliente.find(t=>t.IdTerreno == this.terrenoCotizacion.IdTerreno).Cotizacion[0].Fecha_inicio = this.datosCotizacionGenerados.DatosCotizacion.Fecha_inicio ;
            this.terrenosCliente.find(t=>t.IdTerreno == this.terrenoCotizacion.IdTerreno).Cotizacion[0].Num_pagos_pagados = this.datosCotizacionGenerados.DatosCotizacion.Num_pagos_pagados ;
            this.terrenosCliente.find(t=>t.IdTerreno == this.terrenoCotizacion.IdTerreno).Cotizacion[0].Num_pagos_Actual = (this.datosCotizacionGenerados.DatosCotizacion.Num_pagos-this.datosCotizacionGenerados.DatosCotizacion.Num_pagos_pagados) ;
            this.terrenosCliente.find(t=>t.IdTerreno == this.terrenoCotizacion.IdTerreno).Cotizacion[0].Mensualidades = this.datosCotizacionGenerados.Mensualidades ;
            this.datosCotizacionGenerados = false;
        }else if(this.datosCotizacionAnualidad){
            console.log('datosCotizacionAnualidad',this.datosCotizacionAnualidad);
            this.terrenosCliente.find(t=>t.IdTerreno == this.terrenoCotizacion.IdTerreno).Cotizacion[0].Anualidad = this.datosCotizacionAnualidad.DatosCotizacion.Anualidad ;
            this.terrenosCliente.find(t=>t.IdTerreno == this.terrenoCotizacion.IdTerreno).Cotizacion[0].Num_anualidades = this.datosCotizacionAnualidad.DatosCotizacion.Num_anualidades ;
            this.terrenosCliente.find(t=>t.IdTerreno == this.terrenoCotizacion.IdTerreno).Cotizacion[0].Fecha_inicio_anualidad = this.datosCotizacionAnualidad.DatosCotizacion.Fecha_inicio_anualidad ;
            this.terrenosCliente.find(t=>t.IdTerreno == this.terrenoCotizacion.IdTerreno).Cotizacion[0].Num_anualidades_pagadas = this.datosCotizacionAnualidad.DatosCotizacion.Num_anualidades_pagadas ;
            this.terrenosCliente.find(t=>t.IdTerreno == this.terrenoCotizacion.IdTerreno).Cotizacion[0].Num_pagos_anualidad_Actual = (this.datosCotizacionAnualidad.DatosCotizacion.Num_anualidades - this.datosCotizacionAnualidad.DatosCotizacion.Num_anualidades_pagadas) ;
            this.terrenosCliente.find(t=>t.IdTerreno == this.terrenoCotizacion.IdTerreno).Cotizacion[0].Anualidades = this.datosCotizacionAnualidad.Anualidades ;
            this.datosCotizacionAnualidad = false;
        }        
    }
    _obtenerCotizaciones(){
        this.catalogosService.obtenerCotizaciones().then(res=>{
            this.cotizaciones = res['Data'];
            //console.log('cot',this.cotizaciones);
        }).catch(err=>{console.log('err',err);})
    }
    _obtenerTerrenos(){
        return new Promise((resolve, reject)=>{
            this.catalogosService.obtenerTerrenos().then(res=>{
                let terr =  res['Data'].filter(ob=>ob.Asignado == 0);
                //console.log('ter',terr);
                this.terrenos = terr;
                this.terrenos.forEach(t=>{
                    t.DatoEspecial = `Parcela: ${t.parcela}, Lote : ${t.lote}, Etapa: ${t.etapa},`;
                });
                this.parcelas = this.terrenos.map((key)=>{
                    return key.parcela;
                })
                this.lotes = this.terrenos.map((key)=>{
                    return key.lote;
                })
                this.etapas = this.terrenos.map((key)=>{
                    return key.etapa;
                })
                this.datosEspeciales = this.terrenos.map((key)=>{
                    return key.DatoEspecial;
                })
                return resolve(this.terrenos);
            }).catch(err=>{console.log('err',err); return reject(err); })
        });
    }
    ngOnInit() {
        console.log('datosCliente',this.datosCliente);
        console.log('Nuevo',this.Nuevo);
//        this._obtenerTerrenos();
        if(this.datosCliente){
            this._asignarFormulario();
            this.clienteDatosTodos = true;
        }
    }
    _asignarFormulario(){
        this.terrenosCliente = [];
        this._obtenerTerrenos().then(res=>{
            this.datosCliente.Terrenos.forEach(t=>{
                t.Cotizacion.Fecha_inicio = (moment(t.Cotizacion.Fecha_inicio).isValid())?t.Cotizacion.Fecha_inicio:moment().add('1','month').format('YYYY-MM-DD');
                t.Cotizacion.Fecha_inicio_anualidad = (moment(t.Cotizacion.Fecha_inicio_anualidad).isValid())?t.Cotizacion.Fecha_inicio_anualidad:`${moment().format('YYYY')}-12-01`;
                let existeTerreno = this.terrenos.find(tt=>tt.parcela == t['PARCELA']);
                existeTerreno = ((t.Superficie && t.etapa && t.parcela))?t:existeTerreno;
                if(existeTerreno){
                    existeTerreno.IdCotizacion = 0;
                    existeTerreno.Cotizacion = [t.Cotizacion];
                    existeTerreno.Estado = (existeTerreno.Estado)?existeTerreno.Estado:t.Estado;
                    this.terrenosCliente.push(existeTerreno);
                }else{
                    this.terrenosCliente.push({
                        Activo: 0,
                        Asignado: 0,
                        Cotizacion: [t.Cotizacion],
                        IdCotizacion: 0,
                        IdTerreno: 0,
                        Estado:t['ESTADO'],
                        Pertenece: t['NOMBRE DE PARCELA'],
                        Superficie: t['SUPERFICIE'],
                        etapa: t['ETAPA'],
                        lote: t['LOTE'],
                        parcela: t['PARCELA'],
                    });
                }
            });
            this.frmCliente =  this.fb.group({
                'Nombre': this.datosCliente.Nombre,
                'Nombre2': this.datosCliente.Nombre,
                'Correo': this.datosCliente.Correo,
                'NumIfe': (this.datosCliente.NumIfe)?parseFloat(this.datosCliente.NumIfe):(this.datosCliente.Num_ife)?this.datosCliente.Num_ife:'-',
//                'NumIfe': (this.datosCliente.NumIfe != '-')?parseFloat(this.datosCliente.NumIfe):(this.datosCliente.Num_ife)?this.datosCliente.Num_ife:'-',
                'Origen':this.datosCliente.Origen,
                'Direccion': this.datosCliente.Direccion,
                'Telefono': (this.datosCliente.Telefono != '-')?parseFloat(this.datosCliente.Telefono):'-',
                'Fecha_nacimiento': this.datosCliente.Fecha_nacimiento,
                'Ref1':(this.datosCliente.Ref1)?this.datosCliente.Ref1:this.datosCliente.Referencia_1,
                'Ref2':(this.datosCliente.Ref2)?this.datosCliente.Ref2:this.datosCliente.Referencia_2,
                'Ref3':(this.datosCliente.Ref3)?this.datosCliente.Ref3:this.datosCliente.Referencia_3,
                'TelRef_1': this.datosCliente.TelRef_1,
                'TelRef_2': this.datosCliente.TelRef_2,
                'TelRef_3': this.datosCliente.TelRef_3,
                'Saldo_agua':this.datosCliente.Saldo_agua,
                'Importe_mantenimiento':(this.datosCliente.Importe_mantenimiento)?this.datosCliente.Importe_mantenimiento:this.datosCliente.Monto_mantenimiento,
                'Fecha_mantenimiento': (moment(this.datosCliente.Fecha_mantenimiento).isValid())?moment(this.datosCliente.Fecha_mantenimiento).format('YYYY-MM-DD'):(this.datosCliente.Fecha_mantenimiento)?this.datosCliente.Fecha_mantenimiento:`${moment().add('1','year').format('YYYY-')}01-01`,
                'Fecha_adeudo_mantenimiento': (this.datosCliente.Fecha_adeudo_mantenimiento && moment(this.datosCliente.Fecha_adeudo_mantenimiento).isValid())?moment(this.datosCliente.Fecha_adeudo_mantenimiento).format('YYYY-MM-DD'):this.datosCliente.Fecha_adeudo_mantenimiento,
                'Saldo_mantenimiento': this.datosCliente.Saldo_mantenimiento,
                'Saldo_adeudo': this.datosCliente.Saldo_adeudo,
                'Saldo_anualidad':this.datosCliente.Saldo_anualidad,
                'Credito_original':this.datosCliente.Credito_original,
                'Saldo_certificado':this.datosCliente.Saldo_certificado,
                'Saldo_credito': this.datosCliente.Saldo_credito,
                'Periodo_cobro':(this.datosCliente.Periodo_cobro)?this.datosCliente.Periodo_cobro:6,
                'Observaciones':this.datosCliente.Observaciones,
                'ObservacionesDatos':null,
                'ObservacionesMantenimiento':null,
                'FotoIfe': null,
                'Comprobante':null,
                'Terrenos': this.terrenosCliente,
                'ObjCompletos': this.datosCliente.Terrenos
            });
//            if(!this.Nuevo){                this.frmCliente.controls['Nombre'].disable();            }
            this.pagina = 1;
            console.log('datos',this.frmCliente);
            let noRegistrados = this.datosCliente.Terrenos.filter(t=>t.IdTerreno == 0);
            console.log('noRegistrados',noRegistrados);
    /*        this.catalogosService.guardaNuevoTerreno(noRegistrados).then(terr=>{
                this.datosCliente.Terrenos.forEach(t=>{
                    let existeTerreno = this.terrenos.find(tt=>tt.parcela == t['PARCELA']);
                    if(existeTerreno){
                        t.existeTerreno;
                    }
                });
            }).catch(err=>{ console.log('err',err); });*/

        }).catch(err=>{
            console.log('err',err); 
        })        
    }
    asignarTerrenosNombre(){
        if(this.terrenosCliente[0]){
            this.terrenosCliente.forEach(tc=>{
                if(!this.datosCliente.IdCliente){
                    tc.Pertenece =  this.frmCliente.controls['Nombre'].value;
                }
                tc.ContieneMensualidad = false;
                tc.ContieneAnualidad = false;
            });
        }
    }
    validarFomulario(){
        let error = ``;
        if(this.pagina == 1){
            error = this._validarFormularioParte1();
            if(this.terrenosCliente[0]){
                this.terrenosCliente.forEach(tc=>{
                    tc.Pertenece =  this.frmCliente.controls['Nombre'].value;
                })
            }
            console.log('terren',this.terrenosCliente);
            this.pagina = (!error)?2:1 ;
            this.asignarTerrenosNombre();
            //this.frmCliente.controls['Pagina'].setValue( (!error)?2:1 );
        }else if(this.pagina == 2){
            error = this._validarFormularioParte2();
            if(!error){
                console.log('terren',this.terrenosCliente);
                this.frmCliente.controls['Terrenos'].setValue( (!error)?this.terrenosCliente:this.frmCliente.controls['Terrenos'].value );
                this.dataCli = this.frmCliente.getRawValue();
                this._datosTerrenoGeneral();
                this.pagina = (!error)?3:2 ;
            }
        }else if(this.pagina == 3){
            error =this._validarFormularioParte3();
            if(!error){
                console.log('terren',this.terrenosCliente);
                this.frmCliente.controls['Terrenos'].setValue( (!error)?this.terrenosCliente:this.frmCliente.controls['Terrenos'].value );
                this.dataCli = this.frmCliente.getRawValue();
                this._datosTerrenoGeneral();
                this.pagina = (!error)?4:3 ;
            }
        }else if(this.pagina == 4){
            //console.log('data',this.dataCli);
            let error = this._validarDatosCliente(this.dataCli);
            if(!error){
                this.dataCli.FuenteDatos = true;
                this.dataCli.Terrenos =  this.terrenosCliente;
//                this.dataCli.Monto_mantenimiento =  this.dataCli.Importe_mantenimiento;
                //this.dataCli.Fecha_mantenimiento = this.terrenosCliente[0].Cotizacion[0].FechaMantenimiento;
                //this.dataCli.Periodo_cobro = this.terrenosCliente[0].Cotizacion[0].PeriodoCobro;
                this.dataCli.ObjCompletos = this.datosCliente.Terrenos;
                this.dataCli.Usuario = JSON.parse(localStorage.getItem('Datos'));
                if(this.MantenimientosPreCalculados){
                    this.dataCli.Mantenimientos_calculados = this.MantenimientosPreCalculados.mantenimientos;
//                    this.dataCli.Saldo_mantenimiento = (this.MantenimientosPreCalculados.Saldo > 0)?this.MantenimientosPreCalculados.Saldo:this.dataCli.Saldo_mantenimiento;
                }
                console.log('dataCli',this.dataCli);
                this.ventasService.guardarNuevoCliente(this.dataCli).then(res=>{
                    if(res['Data']['Operacion'] && res['Data']['Tipo']){
                        let tipo = res['Data']['Tipo'];
                        this.datosCliente = false;
                        swal('Exito', `${res['Data']['Operacion']}`, tipo);
//                        console.log('procesarContratos',JSON.stringify({Activa : 'Contrato', Cliente: res['Data']['Cliente'], Terrenos: this.terrenosCliente }));
                        this.vista.emit({Activa : 'Contrato', Cliente: res['Data']['Cliente'], Terrenos: this.terrenosCliente });
                    }
                }).catch(err=>{
                    console.log('err',err);
                    swal('Error',`${err}`,'error');
                })
            }else{
                swal('Error',`${error}`,'error');
            }
//            error = this._validarFormularioParte3();
        }
        if(error){
            swal(`Error`,`${error}`,'error')
        }
    }
    _validarFormularioParte1(){
        let error = ``;
        if(this.frmCliente.controls['Nombre'].value == '' || this.frmCliente.controls['Nombre'].value == '-'){
            error = `Debes de introducir al menos un nombre para el `;
        }
/*        if(this.frmCliente.controls['Correo'].value == '' || this.frmCliente.controls['Correo'].value == '-'){
            error = `Debes de Introducir un correo valido`;
        }*/
        return error;
    }
    _validarFormularioParte2(){
        let error = ``;
        this.terrenosCliente.forEach(t=>{
            console.log('t',t);
            if(t.parcela == ''){
                error = `No tienes asignada una parcela para alguno de los terreno `;
            }
            if(t.lote == ''){
                error = `lote no puede estar vacio `;
            }
            if(t.etapa == ''){
                error = `etapa no puede estar vacio `;
            }
            if(t.Estado != 'CEDIDO' && t.Estado != 'POR CEDER'){
                if(t.ContieneMensualidad){
                    if(t.Cotizacion[0].Mensualidad == 0){
                        error = `Debes espeficificar un monto de mensualidad para el terreno ${t.parcela}`;
                    }
                    if(t.Cotizacion[0].Num_pagos_Actual == 0){
                        error = `Debes espeficicar un total de pagos actuales para el terreno ${t.parcela}`;
                    }
                }
            }
/*            if(t.Cotizacion[0].Fecha_inicio){
                error = `Debes de especificar una fecha de inicio`;
            }*/
        })
        return error;
    }
    _validarFormularioParte3(){
        let error = ``;
        return error;
    }
    _datosTerrenoGeneral(){
//        let SaldoMantenimiento = 0;
//        let PeriodoCobro = 0;
//        let FechaMantenimiento = '';
        let SaldoAgua = 0;
        let SaldoAdeudo = 0;
        let CreditoOriginal = 0;
        let SaldoCertificado = 0;
        let SaldoCredito = 0;
        let SaldoAnualidad = 0;
        console.log('datos',this.dataCli);
        this.dataCli.Terrenos.forEach(t=>{
            //DATOS DE SALDOS DE AGUA
//            SaldoAgua += t.Cotizacion[0].Saldo_agua;
            //DATOS MANTENIMIENTO
            // SaldoMantenimiento += t.Cotizacion[0].ImporteMantenimiento;
            // if(PeriodoCobro == 0){
            //     PeriodoCobro = (`${t.Cotizacion[0].PeriodoCobro}`.indexOf('6') > -1)?6:(`${t.Cotizacion[0].PeriodoCobro}`.indexOf('1') > -1)?1:0;
            // }
            // if(FechaMantenimiento == ''){
            //     FechaMantenimiento = (t.Cotizacion[0].FechaMantenimiento && t.Cotizacion[0].FechaMantenimiento != '-')?(moment(t.Cotizacion[0].FechaMantenimiento).isValid())?`${moment(t.Cotizacion[0].FechaMantenimiento).format('YYYY-MM-DD')}`:'':'';
            // }
            //DATOS CREDITO Y ADEUDOS
            SaldoAdeudo += t.Cotizacion[0].Enganche_Actual;
            CreditoOriginal += (t.Cotizacion[0].Num_pagos_Actual * t.Cotizacion[0].Mensualidad);
            SaldoCertificado += t.Cotizacion[0].SaldoCertificado;
            SaldoCredito += (t.Cotizacion[0].Num_pagos_Actual * t.Cotizacion[0].Mensualidad);
            SaldoAnualidad += (t.Cotizacion[0].Num_anualidades*t.Cotizacion[0].Anualidad);
        })
//        this.dataCli.SaldoAgua;
//        this.dataCli.Saldo_agua = SaldoAgua;
        //this.dataCli.Importe_mantenimiento=(this.dataCli.Monto_mantenimiento)?this.dataCli.Monto_mantenimiento:SaldoMantenimiento;
        // this.dataCli.Fecha_mantenimiento = FechaMantenimiento;
        // this.dataCli.Saldo_mantenimiento= SaldoMantenimiento;
        // this.dataCli.Periodo_cobro = PeriodoCobro;
        this.dataCli.Saldo_adeudo =  SaldoAdeudo;
        this.dataCli.Saldo_anualidad =  SaldoAnualidad;
        this.dataCli.Credito_original =  CreditoOriginal;
        this.dataCli.Saldo_credito = SaldoCredito;
        this.dataCli.Saldo_certificado =  SaldoCertificado;

    }
    procesarClienteActivo(){
        let formObj = this.frmCliente.getRawValue();
        let error = this._validarDatosCliente(formObj);
        if(!error){
            formObj.FuenteDatos = true;
            formObj.Terrenos =  this.terrenosCliente;
            formObj.ObjCompletos = this.datosCliente.Terrenos;
            formObj.Usuario = JSON.parse(localStorage.getItem('Datos'));
//            console.log('formObj',formObj);
            this.ventasService.guardarNuevoCliente(formObj).then(res=>{
                if(res['Data']['Operacion'] && res['Data']['Tipo']){
                    let tipo = res['Data']['Tipo'];
                    swal('Exito', `${res['Data']['Operacion']}`, tipo);
 //                   console.log('procesarContratos',JSON.stringify({Activa : 'Contrato', Cliente: res['Data']['Cliente'], Terrenos: this.terrenosCliente }));
                    this.vista.emit({Activa : 'Contrato', Cliente: res['Data']['Cliente'], Terrenos: this.terrenosCliente });
                }
            }).catch(err=>{
                swal('Error',`${err}`,'error');
            })
        }else{
            swal('Error',`${error}`,'error');
        }
//        let serializedForm = JSON.stringify(formObj);
 //       console.log('datosCliente',formObj);
//        let datosClienteacitov = [];
    }
    _validarDatosCliente(obj){
        let error = ``;
        console.log('obj.Periodo_cobro',obj);
        if(!obj.Nombre || obj.Nombre == '-'){
            error = `Debes introducir un nombre valido para continuar`;
        // }else if(obj.Fecha_nacimiento == '-' && !moment(obj.Fecha_nacimiento).isValid()){
        //     error = `Debes introducir una Fecha de nacimiento valida para continuar`;
/*        }else if(!obj.Importe_mantenimiento || obj.Importe_mantenimiento == '-'){
            error = `Debes introducir una cuota de mantenimiento para continuar`;*/
        }else if(!obj.Terrenos){
            error = `Debes introducir al menos un terreno para continuar`;
        } else if(obj.Periodo_cobro == '-' || obj.Periodo_cobro < 0){
            error = `Debes introducir un periodo de cobro valido para continuar y que sea mayor a 1`;
        }
        // }else if(obj.Fecha_mantenimiento == '-' || !moment(obj.Fecha_mantenimiento).isValid()){
            // error = `Debes introducir una fecha de primer mantenimiento valida para continuar`;
        // }

        // obj.Terrenos.forEach(t=>{
        //     if((!t.Cotizacion[0].PeriodoCobro || t.Cotizacion[0].PeriodoCobro == '-') && error != ''){
        //         error = `Debes introducir un periodo de cobro valido para continuar`;
        //     }else if((t.Cotizacion[0].FechaMantenimiento == '-' || !moment(t.Cotizacion[0].FechaMantenimiento).isValid()) && error != ''){
        //         error = `Debes introducir una fecha de primer mantenimiento valida para continuar`;
        //     }
        // });
        console.log('error',error);
        return error;
    }
    borrarTerreno(indice){
        let parcelas = [];
        this.terrenosCliente.splice(indice,1);
        this.terrenos.forEach(ter=>{
            let existe = this.terrenosCliente.filter(t=> t.IdTerreno == ter.IdTerreno);
            if(!existe[0]){
                parcelas.push(ter.parcela);
            }
        })
        this.parcelas = parcelas;
    }
    nombreArchivo(event, nombre){
        let file: File = event.target.files[0];
        let renderFile: FileReader = new FileReader();
        switch(nombre){
            case 'Domicilio':
            this.comprobante = file.name;
            renderFile.readAsDataURL(file);
            renderFile.onloadend = () => {
                if (renderFile.result) { this.fComprobante =  renderFile.result }
            }
            break;
            case 'Ife':this.fotoIfe = file.name; this.fIfe = file;
            renderFile.readAsDataURL(file);
            renderFile.onloadend = () => {
                if (renderFile.result) { this.fIfe =  renderFile.result }
            }
            break;
            default: break;
        }
    }
    filtrarTerrenos = (text$: Observable<string>) =>
      text$.pipe( debounceTime(200), distinctUntilChanged(),
        map(term => term === ''?[]:this.parcelas.filter(ob => ob.toUpperCase().indexOf(term.toUpperCase()) > -1))
    );
    filtrarTerrenosDatoEspecial = (text$: Observable<string>) =>
    text$.pipe( debounceTime(200), distinctUntilChanged(),
      map(term => term === ''?[]:this.datosEspeciales.filter(ob => ob.toUpperCase().indexOf(term.toUpperCase()) > -1))
  );
    filtrarLotes = (text$: Observable<string>) =>
    text$.pipe( debounceTime(200), distinctUntilChanged(),
      map(term => term === ''?[]:this.lotes.filter(ob => ob.toUpperCase().indexOf(term.toUpperCase()) > -1))
    );
    filtrarEtapas = (text$: Observable<string>) =>
    text$.pipe( debounceTime(200), distinctUntilChanged(),
        map(term => term === ''?[]:this.etapas.filter(ob => ob.toUpperCase().indexOf(term.toUpperCase()) > -1))
    );
    seleccionarLote(sele){
        console.log('lote', sele);
    }
    seleccionarEtapa(sele){
        console.log('etapa', sele);
    }
    seleccionarParcela(selected, indice){
        console.log('terrr',this.terrenosCliente);
        let par =  selected.item.toString().split(',')[0].split(':')[1].trim();
        // console.log('par ',par);
        // console.log('datosTodosTotales ',this.datosTodosTotales);
        let terrenoOtroCliente = this.datosTodosTotales.find(dt => `${dt['PARCELA']}`.trim() == par);
        // console.log('terreno otro cliente',terrenoOtroCliente);
        // console.log('frm cliente',this.frmCliente.getRawValue());
//        let par =  selected.item.toString().split(',')[0].split(':')[1].trim();
        if(terrenoOtroCliente){
            let datosA = {Titulo: 'Advertencia',Contenido: `Estas seguro que deseas agregar este terreno, pertenece al siguiente cliente <b>${terrenoOtroCliente["NOMBRE DEL CLIENTE"].trim()} </b>`,Confirm: 'Si Adelante' , Tipo: 'warning'}
            this._confirmarModal({},datosA).then(res=>{
//                this.datosTerreno =  this.terrenos.filter(ob=>ob.parcela == selected.item.toString())[0];
                this.datosTerreno =  this.terrenos.filter(ob=>ob.parcela == par)[0];
                if(!this.datosTerreno.Cotizacion){
                    this.datosTerreno.Cotizacion = [{IdCotizacion:0,
                        Nombre: `Sistema_auto_${terrenoOtroCliente['PARCELA']}`,
                        Enganche: this._datoNumerico(terrenoOtroCliente['ENGANCHE']),
                        EnganchePagado: this._datoNumerico(terrenoOtroCliente['CANTIDAD DEL ENGANCHE PAGADO']),
                        Credito: this._datoNumerico(terrenoOtroCliente['SALDO DEL CREDITO']),
                        Tasa: this._datoNumerico(terrenoOtroCliente['INTERES']),
                        Num_pagos: this._datoNumerico(terrenoOtroCliente['NUMERO MENSUALIDADES']),
                        Num_pagos_pagados: this._datoNumerico(terrenoOtroCliente['CANTIDAD DE MENSUALIDADES PAGADAS']),
                        Fecha_inicio: (terrenoOtroCliente['FECHA PRIMERA MENSUALIDAD']!= 0 && moment(terrenoOtroCliente['FECHA PRIMERA MENSUALIDAD']).isValid())?`${moment(terrenoOtroCliente['FECHA PRIMERA MENSUALIDAD'])}`:`${moment().add('1','month').format('YYYY-MM-DD')}`,
                        Superficie: this._datoNumerico(terrenoOtroCliente['SUPERFICIE']),
                        Precio_metro: this._datoNumerico(terrenoOtroCliente['COSTO DEL M2 EN VENTA']),
                        Costo_total: this._datoNumerico(terrenoOtroCliente['SALDO DEL CREDITO']),
                        Mensualidad: this._datoNumerico(terrenoOtroCliente['CANTIDAD DE MENSUALID']), 
                        Fecha_inicio_anualidad: (terrenoOtroCliente['FECHA PRIMERA ANUALIDAD']!= 0 && moment(terrenoOtroCliente['FECHA PRIMERA ANUALIDAD']).isValid())?`${moment(terrenoOtroCliente['FECHA PRIMERA ANUALIDAD']).format('YYYY-MM-DD')}`:``, 
                        Num_anualidades: this._datoNumerico(terrenoOtroCliente['NUMERO DE ANUALIDADES']),
                        Num_anualidades_pagadas: this._datoNumerico(terrenoOtroCliente['CANTIDAD DE ANUALIDADES PAGADAS']),
                        Anualidad: this._datoNumerico(terrenoOtroCliente['CANTIDAD ANUALIDADES']),
                        Fecha_cotizacion: `${moment().format('YYYY-MM-DD')}`,
                        //Extras
                        Saldo_agua : (this._datoNumerico(terrenoOtroCliente['CONTRATO DEL AGUA']) - this._datoNumerico(terrenoOtroCliente['CANTIDAD ABONADA A CONTRATO AGUA'])),
                        ImporteMantenimiento : this._datoNumerico(terrenoOtroCliente['CUOTA MANTENIMIENTO']),
                        FechaMantenimiento:(terrenoOtroCliente['FECHA DE COBRO PRIMER MANTENIMIENTO'] && terrenoOtroCliente['FECHA DE COBRO PRIMER MANTENIMIENTO'] != '-')?(moment(terrenoOtroCliente['FECHA DE COBRO PRIMER MANTENIMIENTO']).isValid())?`${moment(terrenoOtroCliente['FECHA DE COBRO PRIMER MANTENIMIENTO']).format('YYYY-MM-DD')}`:'':'',
//                            FechaAdeudoMantenimiento:(t['TIEMPO DE DEUDA MANTENIMIENTO'] && t['TIEMPO DE DEUDA MANTENIMIENTO'] != '-')?(moment(t['TIEMPO DE DEUDA MANTENIMIENTO']).isValid())?`${moment(t['TIEMPO DE DEUDA MANTENIMIENTO']).format('YYYY-MM-DD')}`:'':'',
//                            FechaAdeudoMantenimiento:(t['TIEMPO DE DEUDA MANTENIMIENTO'] && t['TIEMPO DE DEUDA MANTENIMIENTO'] != '-')?`${t['TIEMPO DE DEUDA MANTENIMIENTO']}`:'',
                        SaldoCertificado : (this._datoNumerico(terrenoOtroCliente['DEUDA CERTIFICADO']) - this._datoNumerico(terrenoOtroCliente['CANTIDAD ABONADA A CERTIFICADP'])),
                        Estado: `${terrenoOtroCliente['ESTADO']}`,
                    }]
                }
                let  existe = this.terrenosCliente.filter(ob => ob.IdTerreno == this.datosTerreno.IdTerreno);
                if(this.datosTerreno && !existe[0]){
                    this.terrenosCliente[indice] =  this.datosTerreno;
                    let restantes = this.terrenos.filter(t=> t.IdTerreno != this.datosTerreno.IdTerreno);
                    this.parcelas = restantes.map((key)=>{
                        return key.parcela;
                    })
                }else{
                    swal('Error','El terreno no puede agregarse porque ya esta en la lista, por favor selecciona uno diferente','error');
                    this.terrenosCliente[indice] = {}; 
                }
            })
        }else{
//            this.datosTerreno =  this.terrenos.filter(ob=>ob.parcela == selected.item.toString())[0];
            this.datosTerreno =  this.terrenos.filter(ob=>ob.parcela == par)[0];
            if(!this.datosTerreno.Cotizacion){
                this.datosTerreno.Cotizacion = [{IdCotizacion:0,
                    Nombre: `Sistema_auto_${this.datosTerreno['PARCELA']}`,
                    Enganche: this._datoNumerico(this.datosTerreno['ENGANCHE']),
                    EnganchePagado: this._datoNumerico(this.datosTerreno['CANTIDAD DEL ENGANCHE PAGADO']),
                    Credito: this._datoNumerico(this.datosTerreno['SALDO DEL CREDITO']),
                    Tasa: this._datoNumerico(this.datosTerreno['INTERES']),
                    Num_pagos: this._datoNumerico(this.datosTerreno['NUMERO MENSUALIDADES']),
                    Num_pagos_pagados: this._datoNumerico(this.datosTerreno['CANTIDAD DE MENSUALIDADES PAGADAS']),
                    Fecha_inicio: (this.datosTerreno['FECHA PRIMERA MENSUALIDAD']!= 0 && moment(this.datosTerreno['FECHA PRIMERA MENSUALIDAD']).isValid())?`${moment(this.datosTerreno['FECHA PRIMERA MENSUALIDAD'])}`:`${moment().add('1','month').format('YYYY-MM-DD')}`,
                    Superficie: this._datoNumerico(this.datosTerreno['SUPERFICIE']),
                    Precio_metro: this._datoNumerico(this.datosTerreno['COSTO DEL M2 EN VENTA']),
                    Costo_total: this._datoNumerico(this.datosTerreno['SALDO DEL CREDITO']),
                    Mensualidad: this._datoNumerico(this.datosTerreno['CANTIDAD DE MENSUALID']), 
                    Fecha_inicio_anualidad: (this.datosTerreno['FECHA PRIMERA ANUALIDAD']!= 0 && moment(this.datosTerreno['FECHA PRIMERA ANUALIDAD']).isValid())?`${moment(this.datosTerreno['FECHA PRIMERA ANUALIDAD']).format('YYYY-MM-DD')}`:``, 
                    Num_anualidades: this._datoNumerico(this.datosTerreno['NUMERO DE ANUALIDADES']),
                    Num_anualidades_pagadas: this._datoNumerico(this.datosTerreno['CANTIDAD DE ANUALIDADES PAGADAS']),
                    Anualidad: this._datoNumerico(this.datosTerreno['CANTIDAD ANUALIDADES']),
                    Fecha_cotizacion: `${moment().format('YYYY-MM-DD')}`,
                    //Extras
                    Saldo_agua : (this._datoNumerico(this.datosTerreno['CONTRATO DEL AGUA']) - this._datoNumerico(this.datosTerreno['CANTIDAD ABONADA A CONTRATO AGUA'])),
                    ImporteMantenimiento : this._datoNumerico(this.datosTerreno['CUOTA MANTENIMIENTO']),
                    FechaMantenimiento:(this.datosTerreno['FECHA DE COBRO PRIMER MANTENIMIENTO'] && this.datosTerreno['FECHA DE COBRO PRIMER MANTENIMIENTO'] != '-')?(moment(this.datosTerreno['FECHA DE COBRO PRIMER MANTENIMIENTO']).isValid())?`${moment(this.datosTerreno['FECHA DE COBRO PRIMER MANTENIMIENTO']).format('YYYY-MM-DD')}`:'':'',
//                            FechaAdeudoMantenimiento:(t['TIEMPO DE DEUDA MANTENIMIENTO'] && t['TIEMPO DE DEUDA MANTENIMIENTO'] != '-')?(moment(t['TIEMPO DE DEUDA MANTENIMIENTO']).isValid())?`${moment(t['TIEMPO DE DEUDA MANTENIMIENTO']).format('YYYY-MM-DD')}`:'':'',
//                            FechaAdeudoMantenimiento:(t['TIEMPO DE DEUDA MANTENIMIENTO'] && t['TIEMPO DE DEUDA MANTENIMIENTO'] != '-')?`${t['TIEMPO DE DEUDA MANTENIMIENTO']}`:'',
                    SaldoCertificado : (this._datoNumerico(this.datosTerreno['DEUDA CERTIFICADO']) - this._datoNumerico(this.datosTerreno['CANTIDAD ABONADA A CERTIFICADP'])),
                    Estado: `${this.datosTerreno['ESTADO']}`,                
                }]
            }
            let  existe = this.terrenosCliente.filter(ob => ob.IdTerreno == this.datosTerreno.IdTerreno);
            if(this.datosTerreno && !existe[0]){
                this.terrenosCliente[indice] =  this.datosTerreno;
                let restantes = this.terrenos.filter(t=> t.IdTerreno != this.datosTerreno.IdTerreno);
                this.parcelas = restantes.map((key)=>{
                    return key.parcela;
                })
            }else{
                swal('Error','El terreno no puede agregarse porque ya esta en la lista, por favor selecciona uno diferente','error');
                this.terrenosCliente[indice] = {}; 
            }            
        }
        
        console.log('datosTerreno',this.datosTerreno);
        console.log('ter',this.terrenosCliente);
    }
    _datoNumerico(dat){
        if(`${dat}`.trim().split('$').join('').split(',').join('') && `${dat}`.trim().split('$').join('').split(',').join('') != '-'){
            return parseFloat(`${dat}`.trim().split('$').join('').split(',').join(''));
        }
    return 0;
    }
    guardarNuevoCliente(){
        if(!this.terrenosCliente[0].IdTerreno){
            swal('Error','Debes ingresar al menos un terreno','error');
        }else{
            let Saldo_adeudo;let Saldo_credito;let Credito_original;let Saldo_anualidad;
            //Quitar Terrenos Vacios
            let terrenosUnicos =  this.terrenosCliente.filter(ob => ob.IdTerreno != 0);
            //Datos Cotizaciones
            terrenosUnicos.forEach(dat=>{
                dat.Cotizacion = this.cotizaciones.filter(ob=>ob.IdCotizacion == dat.IdCotizacion);
            })
            //Asignacion global de terrenos unicos
            this.terrenosCliente = terrenosUnicos;
            //Definicion y asignacion de saldos de cliente
            Saldo_adeudo = Saldo_credito = Credito_original = Saldo_anualidad = 0;
            this.terrenosCliente.forEach(ter=>{
                Saldo_adeudo += ter.Cotizacion[0].Enganche;
                Saldo_credito += ter.Cotizacion[0].Credito;
                Credito_original += ter.Cotizacion[0].Credito;
                Saldo_anualidad += (ter.Cotizacion[0].Num_anualidades * ter.Cotizacion[0].Anualidad);
            });
            //Datos del cliente
            let datosClienteNuevo = {
            //Datos Contacto
            Nombre:this.nombre, NumIfe:this.numIfe, Comprobante: this.fComprobante, FotoIfe:this.fIfe, Direccion:this.direccion,Origen:this.origen,Telefono: this.telefono,Correo:this.correo,Fecha_nacimiento: this.fNacimiento, 
            //Datos Referencias
            Ref1:this.referencia1, Ref2:this.referencia2, Ref3:this.referencia3,TelRef_1:this.celReferencia1,TelRef_2:this.celReferencia2,TelRef_3:this.celReferencia3,
            //Datos Terreno y usuario
            Terrenos:this.terrenosCliente,Usuario:JSON.parse(localStorage.getItem('Datos')), 
            //Datos Saldos
            Saldo_agua:this.contratoAgua,Saldo_adeudo,Saldo_credito,Credito_original,Saldo_mantenimiento:this.importeMantenimiento, Saldo_certificado : 8000,Saldo_anualidad:Saldo_anualidad,
            //Datos Mantenimiento
            Periodo_cobro: this.fechaParaCobro,Fecha_mantenimiento: this.fechaPrimerMantenimiento, Importe_mantenimiento: this.importeMantenimiento
            }
            console.log('datos cliente',datosClienteNuevo);
            //Guardado cliente

            this.ventasService.obtenerPdfPagare({Datos:this.dataCli}).then(re=>{
                this.pdfPagare = re['String'];
                this._downloadFile('data:application/pdf;base64,'+this.pdfPagare,`PAGARE_1`,'pdf');
                return this.ventasService.guardarNuevoCliente(datosClienteNuevo);
            }).then(res=>{
                if(res['Data']['Operacion'] && res['Data']['Tipo']){
                    let tipo = res['Data']['Tipo'];
                    swal('Exito', `${res['Data']['Operacion']}`, tipo);
                    console.log('procesarContratos',JSON.stringify({Activa : 'Contrato', Cliente: res['Data']['Cliente'], Terrenos: this.terrenosCliente }));
                    
                    this.vista.emit({Activa : 'Contrato', Cliente: res['Data']['Cliente'], Terrenos: this.terrenosCliente });
                }
            }).catch(err=>{console.log('err',err);})
        }

    }
    guardarCambios(){
        console.log('datos',this.dataCli);
        this.ventasService.obtenerPdfPagare({Datos:this.dataCli}).then(re=>{
            this.pdfPagare = re['String'];
            this._downloadFile('data:application/pdf;base64,'+this.pdfPagare,`PAGARE_1`,'pdf');
            return this.ventasService.guardarNuevoCliente({Datos:this.dataCli});
        }).then(res=>{
            if(res['Data']['Operacion'] && res['Data']['Tipo']){
                let tipo = res['Data']['Tipo'];
                swal('Exito', `${res['Data']['Operacion']}`, tipo);
                console.log('procesarContratos',JSON.stringify({Activa : 'Contrato', Cliente: res['Data']['Cliente'], Terrenos: this.terrenosCliente }));
                this.vista.emit({Activa : 'Contrato', Cliente: res['Data']['Cliente'], Terrenos: this.terrenosCliente });
            }
        }).catch(err=>{console.log('err',err);})
    }        
//        swal('Exito', 'Cambios Guardados Correctamente','success');
    _downloadFile(url, nombre,  ext) {
        let dwldLink = document.createElement("a");
        let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
        if (isSafariBrowser) {
            dwldLink.setAttribute("target", "_blank");
        }
        dwldLink.setAttribute("href", url);
        dwldLink.setAttribute("download", `${nombre}_${moment().format('YYYY-MM-DD')}.${ext}`);
        dwldLink.style.visibility = "hidden";
        document.body.appendChild(dwldLink);
        dwldLink.click();
        document.body.removeChild(dwldLink);
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
    _delay(ms){
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
}
