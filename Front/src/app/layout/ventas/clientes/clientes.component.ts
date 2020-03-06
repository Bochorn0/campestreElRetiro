import { Component, OnInit ,Output , EventEmitter , ViewChild} from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { CatalogosService } from '../../../shared/services/catalogos.service';
import { VentasService } from '../../../shared/services/ventas.service';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import swal from 'sweetalert2';
import * as moment from 'moment';
import * as _ from 'lodash';
@Component({
    selector: 'app-clientes',
    templateUrl: './clientes.component.html',
    styleUrls: ['./clientes.component.scss'],
    animations: [routerTransition()],
    providers: [CatalogosService, VentasService]
})
export class ClientesComponent implements OnInit {
    //Datos Basicos
    IdCotizacion;cotizaciones;nombre;numIfe;comprobante;fotoIfe;origen;telefono;correo;fComprobante;fIfe;direccion;fNacimiento;
    terrenos;IdTerreno; datosTerreno;celReferencia1;celReferencia2;celReferencia3;pdfPagare;
    parcelas;lotes;etapas;
    //Datos Referencias
    referencia1;referencia2;referencia3;
    //Datos Terreno
    terrenosCliente;
    numParcela;numLote;numEtapa;supercifie;costoMetro;
    
    @Output() public vista = new EventEmitter();
    //Mantenimiento
    fechaPrimerMantenimiento;contratoAgua;importeMantenimiento;fechaParaCobro;
    constructor(private catalogosService : CatalogosService, private ventasService: VentasService) {
        this.IdCotizacion = 0;
        this._obtenerCotizaciones();
        this._obtenerTerrenos();
        this.numParcela = '';
        this.costoMetro =  140;
        this.terrenosCliente = [];
        this.terrenosCliente.push({IdCotizacion : 0});
        this.nombre = 'Bocho';
        this.numIfe = this.origen = this.telefono = this.direccion = this.referencia1 = this.referencia2 = this.referencia3 = 'Prueba';
        this.correo = 'prueba@prueba.com';
        this.fNacimiento = '1991-08-24';
        this.fechaParaCobro = 0;
        this.importeMantenimiento = 1500;
        this.contratoAgua = 500;
        this.fechaPrimerMantenimiento =  `${moment().add('6','month').format('YYYY-MM')}-15`;
    }
    formatter = (result: string) => result.toUpperCase();
    _obtenerCotizaciones(){
        this.catalogosService.obtenerCotizaciones().then(res=>{
            this.cotizaciones = res['Data'];
            console.log('cot',this.cotizaciones);
        }).catch(err=>{console.log('err',err);})
    }
    _obtenerTerrenos(){
        this.catalogosService.obtenerTerrenos().then(res=>{
            this.terrenos =  res['Data'].filter(ob=>ob.Asignado == 0);
            this.parcelas = this.terrenos.map((key)=>{
                return key.parcela;
            })
            this.lotes = this.terrenos.map((key)=>{
                return key.lote;
            })
            this.etapas = this.terrenos.map((key)=>{
                return key.etapa;
            })
        }).catch(err=>{console.log('err',err);})
    }
    ngOnInit() {}
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
