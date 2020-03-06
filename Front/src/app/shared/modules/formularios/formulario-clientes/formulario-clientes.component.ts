import { Component, OnInit ,Input ,Output , EventEmitter , ViewChild} from '@angular/core';
import { routerTransition } from '../../../../router.animations';
import { CatalogosService } from '../../../../shared/services/catalogos.service';
import { VentasService } from '../../../../shared/services/ventas.service';
import {Observable} from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import swal from 'sweetalert2';
import * as moment from 'moment';
import * as _ from 'lodash';
@Component({
    selector: 'app-formulario-clientes',
    templateUrl: './formulario-clientes.component.html',
    styleUrls: ['./formulario-clientes.component.scss'],
    animations: [routerTransition()],
    providers: [CatalogosService, VentasService]
})
export class FormularioClientesComponent implements OnInit {
    //Datos Basicos
    IdCotizacion;cotizaciones;nombre;numIfe;comprobante;fotoIfe;origen;telefono;correo;fComprobante;fIfe;direccion;fNacimiento;
    terrenos;IdTerreno; datosTerreno;celReferencia1;celReferencia2;celReferencia3;pdfPagare;
    parcelas;lotes;etapas;clienteDatosTodos;
    //Datos Referencias
    referencia1;referencia2;referencia3;
    //Datos Terreno
    terrenosCliente;
    frmCliente: FormGroup; // Formulario de solicitud
    numParcela;numLote;numEtapa;supercifie;costoMetro;
    @Input('datosCliente') datosCliente: any
    @Output() public vista = new EventEmitter();
    //Mantenimiento
    fechaPrimerMantenimiento;contratoAgua;importeMantenimiento;fechaParaCobro;
    constructor(private fb: FormBuilder,private catalogosService : CatalogosService, private ventasService: VentasService) {
        this.IdCotizacion = 0;
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
        this.importeMantenimiento = 1500;
        this.contratoAgua = 500;
        this.fechaPrimerMantenimiento =  `${moment().add('6','month').format('YYYY-MM')}-15`;
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
            'Saldo_mantenimiento':  null,
            'Saldo_adeudo': null,
            'Saldo_anualidad': null,
            'Credito_original': null,
            'Saldo_certificado': null,
            'Saldo_credito':  null,
            'Periodo_cobro': null,
            'Observaciones':null,
            'FotoIfe': null,
            'Comprobante':null,
            'Terrenos': []
        });        
        this.clienteDatosTodos = false;
        //console.log('datosCliente',this.datosCliente);
    }
    formatter = (result: string) => result.toUpperCase();
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
                this.terrenos = terr;
                this.parcelas = this.terrenos.map((key)=>{
                    return key.parcela;
                })
                this.lotes = this.terrenos.map((key)=>{
                    return key.lote;
                })
                this.etapas = this.terrenos.map((key)=>{
                    return key.etapa;
                })
                return resolve(this.terrenos);
            }).catch(err=>{console.log('err',err); return reject(err); })
        });
    }
    ngOnInit() {
//        this._obtenerTerrenos();
        if(this.datosCliente){
            this._asignarFormulario();
            this.clienteDatosTodos = true;
        }
        console.log('datosCliente',this.datosCliente);
    }
    _asignarFormulario(){
        this.terrenosCliente = [];
        this._obtenerTerrenos().then(res=>{
            this.datosCliente.Terrenos.forEach(t=>{
                console.log('t',t);
                let existeTerreno = this.terrenos.find(tt=>tt.parcela == t['PARCELA']);
                if(existeTerreno){
                    console.log('existe',existeTerreno);
                    existeTerreno.IdCotizacion = 0;
                    existeTerreno.Cotizacion = [t.Cotizacion];
                    this.terrenosCliente.push(existeTerreno);
                }else{
                    console.log('no existe',t);
                    this.terrenosCliente.push({ IdTerreno : 0,
                        Pertenece : t['NOMBRE DE PARCELA'] ,
                        parcela : t['PARCELA'],
                        lote : t['LOTE'],
                        etapa: t['ETAPA'],
                        Superficie: t['SUPERFICIE'],
                        folio : null ,
                        Cotizacion: [t.Cotizacion],
                        IdCotizacion : 0
                    });
                }
            });
            console.log('this.datosCliente',this.terrenosCliente);
//            console.log('this.datosCliente',this.datosCliente);
            this.frmCliente =  this.fb.group({
                'Nombre': this.datosCliente.Nombre,
                'Correo': this.datosCliente.Correo,
                'NumIfe': (this.datosCliente.NumIfe != '-')?parseFloat(this.datosCliente.NumIfe):'-',
                'Origen':this.datosCliente.Origen,
                'Direccion': this.datosCliente.Direccion,
                'Telefono': (this.datosCliente.Telefono != '-')?parseFloat(this.datosCliente.Telefono):'-',
                'Fecha_nacimiento': this.datosCliente.Fecha_nacimiento,
                'Ref1':this.datosCliente.Ref1,
                'Ref2':this.datosCliente.Ref2,
                'Ref3':this.datosCliente.Ref3,
                'TelRef_1': this.datosCliente.TelRef_1,
                'TelRef_2': this.datosCliente.TelRef_2,
                'TelRef_3': this.datosCliente.TelRef_3,
                'Saldo_agua':this.datosCliente.Saldo_agua,
                'Importe_mantenimiento':this.datosCliente.Importe_mantenimiento,
                'Fecha_mantenimiento': this.datosCliente.Fecha_mantenimiento,
                'Saldo_mantenimiento': this.datosCliente.Saldo_mantenimiento,
                'Saldo_adeudo': this.datosCliente.Saldo_adeudo,
                'Saldo_anualidad':this.datosCliente.Saldo_anualidad,
                'Credito_original':this.datosCliente.Credito_original,
                'Saldo_certificado':this.datosCliente.Saldo_certificado,
                'Saldo_credito': this.datosCliente.Saldo_credito,
                'Periodo_cobro':this.datosCliente.Periodo_cobro,
                'Observaciones':this.datosCliente.Observaciones,
                'FotoIfe': null,
                'Comprobante':null,
                'Terrenos': this.terrenosCliente,
                'ObjCompletos': this.datosCliente.Terrenos
            });
            console.log('datos',{
                'Nombre': this.datosCliente.Nombre,
                'Correo': this.datosCliente.Correo,
                'NumIfe': (this.datosCliente.NumIfe != '-')?parseFloat(this.datosCliente.NumIfe):'-',
                'Origen':this.datosCliente.Origen,
                'Direccion': this.datosCliente.Direccion,
                'Telefono': (this.datosCliente.Telefono != '-')?parseFloat(this.datosCliente.Telefono):'-',
                'Fecha_nacimiento': this.datosCliente.Fecha_nacimiento,
                'Ref1':this.datosCliente.Ref1,
                'Ref2':this.datosCliente.Ref2,
                'Ref3':this.datosCliente.Ref3,
                'TelRef_1': this.datosCliente.TelRef_1,
                'TelRef_2': this.datosCliente.TelRef_2,
                'TelRef_3': this.datosCliente.TelRef_3,
                'Saldo_agua':this.datosCliente.Saldo_agua,
                'Importe_mantenimiento':this.datosCliente.Importe_mantenimiento,
                'Fecha_mantenimiento': this.datosCliente.Fecha_mantenimiento,
                'Saldo_mantenimiento': this.datosCliente.Saldo_mantenimiento,
                'Saldo_adeudo': this.datosCliente.Saldo_adeudo,
                'Saldo_anualidad':this.datosCliente.Saldo_anualidad,
                'Credito_original':this.datosCliente.Credito_original,
                'Saldo_certificado':this.datosCliente.Saldo_certificado,
                'Saldo_credito': this.datosCliente.Saldo_credito,
                'Periodo_cobro':this.datosCliente.Periodo_cobro,
                'FotoIfe': null,
                'Comprobante':null,
                'Terrenos': this.terrenosCliente,
                'ObjCompletos': this.datosCliente.Terrenos
            });
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
    procesarClienteActivo(){
        let formObj = this.frmCliente.getRawValue();
        let error = this._validarDatosCliente(formObj);
        if(!error){
            formObj.FuenteDatos = true;
            formObj.Terrenos =  this.terrenosCliente;
            formObj.ObjCompletos = this.datosCliente.Terrenos;
            formObj.Usuario = JSON.parse(localStorage.getItem('Datos'));
            console.log('formObj',formObj);
            this.ventasService.guardarNuevoCliente(formObj).then(res=>{
                if(res['Data']['Operacion'] && res['Data']['Tipo']){
                    let tipo = res['Data']['Tipo'];
                    swal('Exito', `${res['Data']['Operacion']}`, tipo);
                    console.log('procesarContratos',JSON.stringify({Activa : 'Contrato', Cliente: res['Data']['Cliente'], Terrenos: this.terrenosCliente }));
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
        if(!obj.Nombre || obj.Nombre == '-'){
            error = `Debes introducir un nombre valido para continuar`;
        }else if(obj.Fecha_nacimiento == '-' && !moment(obj.Fecha_nacimiento).isValid()){
            error = `Debes introducir una Fecha de nacimiento valida para continuar`;
        }else if(!obj.Importe_mantenimiento || obj.Importe_mantenimiento == '-'){
            error = `Debes introducir una cuota de mantenimiento para continuar`;
        }else if(!obj.Periodo_cobro || obj.Periodo_cobro == '-'){
            error = `Debes introducir un periodo de cobro  valido para continuar`;
        }else if(obj.Fecha_mantenimiento == '-' && !moment(obj.Fecha_mantenimiento).isValid()){
            error = `Debes introducir una fecha de primer mantenimiento valida para continuar`;
        }else if(!obj.Terrenos){
            error = `Debes introducir al menos un terreno para continuar`;
        }
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
        this.datosTerreno =  this.terrenos.filter(ob=>ob.parcela == selected.item.toString())[0];
        let  existe = this.terrenosCliente.filter(ob => ob.IdTerreno == this.datosTerreno.IdTerreno);
        console.log('dat',this.datosTerreno);
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
        console.log('ter',this.terrenosCliente);
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

            this.ventasService.obtenerPdfPagare({Datos:datosClienteNuevo}).then(re=>{
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
    _delay(ms){
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
}
