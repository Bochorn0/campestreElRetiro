import { Component, OnInit ,Output , EventEmitter , ViewChild} from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { CatalogosService } from '../../../shared/services/catalogos.service';
import { VentasService } from '../../../shared/services/ventas.service';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import {NgbActiveModal,NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import * as moment from 'moment';
import * as _ from 'lodash';
@Component({
    selector: 'app-prospectos',
    templateUrl: './prospectos.component.html',
    styleUrls: ['./prospectos.component.scss'],
    animations: [routerTransition()],
    providers: [CatalogosService, VentasService]
})
export class ProspectosComponent implements OnInit {
    @ViewChild('modalCotizacion')modalCotizacion;
    //Datos Basicos
    IdCotizacion;cotizaciones;nombre;numIfe;comprobante;fotoIfe;origen;telefono;correo;fComprobante;fIfe;direccion;fNacimiento;
    terrenos;IdTerreno; datosTerreno;celReferencia1;celReferencia2;celReferencia3;pdfPagare;mensualidad;anualidad;numPagos;
    parcelas;lotes;etapas;
    detalleProspecto;datosNuevoCliente;
    panelVisualizar;
    objInformacion={};modalDatos;activeModal;prospectoActivo;objCotizacion={};
    //Datos Referencias
    referencia1;referencia2;referencia3;
    //Datos Terreno
    terrenosCliente;
    numParcela;numLote;numEtapa;supercifie;costoMetro;
    
    @Output() public vista = new EventEmitter();  
    //Mantenimiento
    fechaPrimerMantenimiento;contratoAgua;importeMantenimiento;fechaParaCobro;
    Prospectos;ProspectosAprobados;mostrarPrincipal;
    constructor(private catalogosService : CatalogosService, private ventasService: VentasService, private modalService: NgbModal) {
        this.datosNuevoCliente = {Terrenos:[{Id:0,Cotizacion:[{IdCotizacion:0}]}]};
        this.obtenerProspectos();
        this.fechaParaCobro = 0;
        this.importeMantenimiento = 1500;
        this.contratoAgua = 500;
        this.fechaPrimerMantenimiento =  `${moment().add('6','month').format('YYYY-MM')}-15`;
        this.panelVisualizar = 'Prospectos';
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
    obtenerProspectos(){
        console.log('1');
        this.catalogosService.obtenerProspectosVendedor({}).then(res=>{
            //console.log('res',res);
            if(res['Data']){
                let prospectos = res['Data'];
                this.Prospectos =  prospectos.filter(p=> p.Apartado == 0);
                console.log('prospectos',prospectos);
                this.ProspectosAprobados =  prospectos.filter(p=> p.Apartado == 1);
                console.log('pros',this.ProspectosAprobados);
                if(this.Prospectos[0]){
                    // this.Prospectos.forEach(p=>{
                    //     // this.calendarEvents.push({
                    //     //     id: p.IdProspecto,
                    //     //     title: `${p.Nombre_prospecto}`,
                    //     //     start: moment(p.Cita).format('YYYY-MM-DD HH:mm:ss'),
                    //     //     end: moment(p.Cita).add('3','hour').format('YYYY-MM-DD HH:mm:ss'),
                    //     //     backgroundColor: '#0073b7', 
                    //     //     borderColor: '#0073b7',
                    //     //     textColor: '#fff',
                    //     //     className: 'text-center text-bold'
                    //     // });
                    //     if(moment(p.Cita).isValid()){
                    //         p.CitaNueva = `${moment(p.Cita).format('YYYY-MM-DDTHH:mm')}`;
                    //     }
                    //     // p.Lapso = this._diferenciaDiasFechas(moment(p.Fecha_modificacion),moment());
                    // })
                }
            }
            //console.log('this.calendarEve',this.calendarEvents);
            // this.totales.Prospectos = this.Prospectos.length
            // this.totales.Pros_activos = this.Prospectos.filter(p=>p.Lapso < 24).length;
            // this.totales.Pros_alerta = this.Prospectos.filter(p=>p.Lapso >= 24).length;
        }).catch(err=>{console.log('err',err);})
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
    mandarInformacionModal(content){
        let datosUsr = JSON.parse(localStorage.getItem('Datos')); 
        this.objInformacion = {
            Para: `${this.prospectoActivo.Correo}`,
            Mensaje:`Hola, Saludos desde Campestre el retiro.\n Nuestra prioridad es brindar un buen servicio, este correo es para enviarle información referente a nuestros campestres disponibles,\n\n\n Sin más por el momento me despido,\n\n Soy ${datosUsr.Datos.Nombre} De Campestre el Retiro, Estoy a sus ordenes para cualquier duda. `,
            Asunto: `Información Solicitada`,
        };        
        this.activeModal = this.modalService.open(content, {windowClass: 'modal-holder', size: 'lg'});
    }
    vistaEnviarCotizacion(event){
        //console.log('enviarcot',event);
        this.panelVisualizar = 'Prospectos';
        this.modalDatos = {Tipo: 'EnviarCotizacion', Clase: 'bg-warning', Titulo: 'Enviar Cotización a Cliente'};
        let Adj; let Buf;
        if(event.Cotizacion_string){
            Adj = event.Cotizacion_string;
            Buf = event.Cotizacion_buffer;
        }
        //console.log('adj',Adj);
        let datosUsr = JSON.parse(localStorage.getItem('Datos'));
        this.objCotizacion = {
            Para: `${this.prospectoActivo.Correo}`,
            Mensaje:`Hola, Saludos desde Campestre el retiro.\n Nuestra prioridad es brindar un buen servicio, este correo es para enviarle la cotización solicitada,\n Sin más por el momento me despido,\n\n Soy ${datosUsr.Datos.Nombre} De Campestre el Retiro, Estoy a sus ordenes para cualquier duda.\n\nEsta Cotización tiene una vida util de 72 Horas. `,
            Asunto: `Cotización Solicitada`,
            Adjunto: Adj,
            AdjuntoBuffer:Buf 
        };
        this.activeModal = this.modalService.open(this.modalCotizacion, {windowClass: 'modal-holder', size: 'lg'});
    }
    agendarCita(content){
        this.activeModal = this.modalService.open(content, {windowClass: 'modal-holder', size: 'lg'});
    }
    apartarTerreno(p){
        this.panelVisualizar = 'NuevoCliente'
        this.datosNuevoCliente = { Nombre:p.Nombre_prospecto, Correo:p.Correo,Telefono:p.Telefono,Terrenos:[{Id:0,Cotizacion:[{IdCotizacion:0}]}]}
    }
    enviarCotizacionModal(content){
        let datosUsr = JSON.parse(localStorage.getItem('Datos'));
        this.objCotizacion = {
            Para: `${this.prospectoActivo.Correo}`,
            Mensaje:`Hola, Saludos desde Campestre el retiro.\n Nuestra prioridad es brindar un buen servicio, este correo es para enviarle la cotización solicitada,\n Sin más por el momento me despido,\n\n Soy ${datosUsr.Datos.Nombre} De Campestre el Retiro, Estoy a sus ordenes para cualquier duda.\n\nEsta Cotización tiene una vida util de 72 Horas. `,
            Asunto: `Cotización Solicitada`,
            Adjunto: ''
        };
        this.activeModal = this.modalService.open(content, {windowClass: 'modal-holder', size: 'lg'});
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
