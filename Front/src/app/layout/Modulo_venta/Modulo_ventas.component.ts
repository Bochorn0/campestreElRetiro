import { Component, OnInit, ViewChild,Output,EventEmitter} from '@angular/core';
import { routerTransition } from '../../router.animations';
import { EstadisticasService } from '../../shared/services/estadisticas.service';
import { CatalogosService } from '../../shared/services/catalogos.service';
import { VentasService } from '../../shared/services/ventas.service';
import {NgbActiveModal,NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
import * as moment  from 'moment';
import swal  from 'sweetalert2';
import * as _ from 'lodash';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { FullCalendarComponent } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
@Component({
    selector: 'app-modulo-ventas',
    templateUrl: './Modulo_ventas.component.html',
    styleUrls: ['./Modulo_ventas.component.scss'],
    animations: [
        routerTransition(),
        trigger('flyInOut', [
          state('in', style({ transform: 'translateX(0)' })),
          transition('void => *', [
            style({ transform: 'translateX(-100%)' }),
            animate(100)
          ]),
          transition('* => void', [
            animate(100, style({ transform: 'translateX(100%)' }))
          ])
        ])
      ],
    providers: [EstadisticasService]
})

export class ModuloVentasComponent implements OnInit {
    //componentes
    clienteNuevo;datosContrato;cotizacionNueva; totales;
    vistaCentro;clientesCatalogos;terrenos;parcelas;lotes;etapas;clientesTodosTodos;clientesTodos;nombresClientes;
    mostrarPrincipal;panelVisualizar;textoBuscar;terrenosTodos;terrenosBuscar;terrenosClientes = [];
    clienteDetalles;mantenimientosTodos;datosDetalle;contenidoContrato;
    clientesTodosVista;detallesClienteVista;mensualidadesVista;anualidadesVista;mantenimientoVista;
    IdTerrenoContrato;terrenoDatos;Prospectos = [];nombreProspecto;descripcionProspecto;nuevoProspecto;telefonoProspecto;
    correoProspecto;xStart;xEnd; datosNuevoCliente;
    $calendar: any;
    calendarPlugins = [dayGridPlugin,timeGridPlugin,interactionPlugin];
    selectedEvent = null;
    calendarEvents = [];terrenoActual;activeModal;
    // reference to the calendar element
    @ViewChild('calendar')calendar: FullCalendarComponent;
    constructor(public router: Router,private catalogosService : CatalogosService, private ventasService: VentasService, private modalService: NgbModal) {
        this.mostrarPrincipal = true;
        this.clienteDetalles = {};
        this.totales = {Clientes:0, Terrenos:0, Lotes:0, Prospectos:0,Pros_activos:0,Pros_alerta:0};
        //this.nuevoMantenimiento();
        this.datosContrato = false;
       this._obtenerTerrenos();
        this.obtenerClientesActivos();
        this._obtenerProspectos();
        this.datosNuevoCliente = {Terrenos:[{Id:0,Cotizacion:[{IdCotizacion:0}]}]};
    }
    ngOnInit() {}
    _obtenerProspectos(){
        let dat_usr = JSON.parse(localStorage.getItem('Datos'));
        this.catalogosService.obtenerProspectosVendedor({IdUsuario: dat_usr.Datos.IdUsuario }).then(res=>{
            console.log('res',res);
            if(res['Data']){
                this.Prospectos = res['Data'];
                if(this.Prospectos[0]){
                    this.Prospectos.forEach(p=>{
                        p.Lapso = this._diferenciaDiasFechas(moment(p.Fecha_modificacion),moment());
                    })
                }
            }
            this.totales.Prospectos = this.Prospectos.length
            this.totales.Pros_activos = this.Prospectos.filter(p=>p.Lapso < 24).length;
            this.totales.Pros_alerta = this.Prospectos.filter(p=>p.Lapso >= 24).length;
        }).catch(err=>{console.log('err',err);})

        // this.Prospectos.push({Nombre_prospecto: 'Luis Aguilar',Descripcion: 'Marco para agendar cita de pago ',Fecha: moment() , Lapso:dif});
        // this.Prospectos.push({Nombre_prospecto: 'Lisa conor',Descripcion: 'Marco para agendar cita de pago ',Fecha: moment() , Lapso:dif});
        // this.Prospectos.push({Nombre_prospecto: 'Luis Aguilar',Descripcion: 'Marco para agendar cita de pago ',Fecha: moment() , Lapso:dif});
        // this.Prospectos.push({Nombre_prospecto: 'Luis Aguilar',Descripcion: 'Marco para agendar cita de pago ',Fecha: moment() , Lapso:dif});
    }
    mostarAlerta(){
        swal('Información','Este apartado aun esta en desarrollo','info');
    }
    guardarNuevoProspecto(){
        let dat_usr = JSON.parse(localStorage.getItem('Datos'));
        console.log('dat_usr',dat_usr);
        let datosProspecto = {
            Nombre_prospecto: (this.nombreProspecto)?this.nombreProspecto:'',
            Correo:(this.correoProspecto)?this.correoProspecto:'',
            Descripcion: (this.descripcionProspecto)?this.descripcionProspecto:'',
            Telefono:(this.telefonoProspecto)?this.telefonoProspecto:'',
            IdUsuario: dat_usr.Datos.IdUsuario
        };
        console.log('datos',datosProspecto);
        this.catalogosService.guardarProspectoVendedor(datosProspecto).then(res=>{
            this.correoProspecto = this.telefonoProspecto = this.nombreProspecto = this.descripcionProspecto = '';
            this.nuevoProspecto = false;
            this._obtenerProspectos();
        }).catch(err=>{console.log('err',err);})
    }

    dayClick(date, jsEvent, view) {
        this.selectedEvent = {
            date: date.format()
        };
    }

    addEvent(event) {
        // store event
        this.calendarEvents.push(event);
        // display event in calendar
        this.$calendar.fullCalendar('renderEvent', event, true);
    }
    mostrarDrop(event){
        let prospecto =  this.Prospectos.find(c=>c.IdProspecto == event.event.id);
        console.log('event',event);
        console.log('prospecto',prospecto);
        if(event.view){
            prospecto.CitaNueva = moment(event.view.currentEnd).format('YYYY-MM-DD');
        }
    }
    modalDatosCita(event){
        console.log('evento',event);
    }
    obtenerCitas(){
        this.calendarEvents = [];
        if(this.Prospectos[0]){
            this.Prospectos.forEach(c=>{
                this.calendarEvents.push({
                    id: c.IdProspecto,
                    title: `${c.Nombre_prospecto}`,
                    start: moment(c.Cita).format('YYYY-MM-DD HH:mm:ss'),
                    end: moment(c.Cita).add('3','hour').format('YYYY-MM-DD HH:mm:ss'),
                    backgroundColor: '#0073b7', 
                    borderColor: '#0073b7',
                    textColor: '#fff',
                    className: 'text-center text-bold'
                });
            });
        }
    }
    createDemoEvents() {
        // Date for the calendar events (dummy data)
        var date = new Date();
        var d = date.getDate(),
            m = date.getMonth(),
            y = date.getFullYear();

        return [{
            title: 'Cita 1',
            start: moment('2020-03-02').format('YYYY-MM-DD'),
            backgroundColor: '#f56954', //red
            borderColor: '#f56954' //red
        }, {
            title: 'Cita 2',
            start: moment('2020-03-20').format('YYYY-MM-DD'),
            end: moment('2020-03-20').format('YYYY-MM-DD'),
            backgroundColor: '#f39c12', //yellow
            borderColor: '#f39c12' //yellow
        }, {
            title: 'Cita 3',
            start: moment('2020-03-10').format('YYYY-MM-DD'),
            allDay: false,
            backgroundColor: '#0073b7', //Blue
            borderColor: '#0073b7' //Blue
        }, {
            title: 'Cita 4',
            start: moment('2020-03-08').format('YYYY-MM-DD'),
            end: new Date(y, m, d, 14, 0),
            allDay: false,
            backgroundColor: '#00c0ef', //Info (aqua)
            borderColor: '#00c0ef' //Info (aqua)
        }, {
            title: 'Cita 5',
            start: moment('2020-04-01').format('YYYY-MM-DD'),
            end: new Date(y, m, d + 1, 22, 30),
            allDay: false,
            backgroundColor: '#00a65a', //Success (green)
            borderColor: '#00a65a' //Success (green)
        }, {
            title: 'Cita 6',
            start: moment('2020-03-07').format('YYYY-MM-DD'),
            backgroundColor: '#3c8dbc', //Primary (light-blue)
            borderColor: '#3c8dbc' //Primary (light-blue)
        }];
    }

    agendarCita(){
        swal('Información','Este apartado aun esta en desarrollo','info');
//        swal('Agendar Cita','Detalles de la cita','info' );
//        this.modalService.open('modalCita', {windowClass: 'modal-holder', size: 'lg'});
    }
    abrirModal(content){
        this.activeModal = this.modalService.open(content, {windowClass: 'modal-holder', size: 'lg'});
    }
    VerMapa(nombre,ter){ 
        this.terrenoActual =  ter;
        console.log('terrenoActual',this.terrenoActual);
        this.modalService.open(nombre, {windowClass: 'modal-holder', size: 'lg'});
    }
    
    marcarLateral(event){
        this.xStart = event.touches[0].clientX;
    }
    menuLateral(event,p){    
        this.xEnd = event.touches[0].clientX;
        if((this.xEnd - this.xStart) > 100){
            p.Lateral = true;
        }
        if((this.xEnd - this.xStart) < -100){
            p.Lateral = false;
        }        

    }
    _diferenciaDiasFechas(fecha1, fecha2){
        let fch1 = moment(fecha1); 
        let fch2 = moment(fecha2);
       return fch2.diff(fch1, 'hours');
    }
    _obtenerTerrenos(){
        this.catalogosService.obtenerTerrenos().then(res=>{
            let datos = res['Data'].filter(ob=>ob.Asignado == 0);
            datos.forEach(d=>{
                d.Color = 'secondary';
            })
            this.terrenosTodos = this.terrenos =  datos;

            this.totales.Terrenos = this.terrenos.length;
            console.log('terr',this.terrenos);
            this.parcelas = this.terrenos.map((key)=>{
                return key.parcela;
            })
            this.lotes = this.terrenos.map((key)=>{
                return key.lote;
            })
            this.totales.Lotes = this.lotes.length;
            this.etapas = this.terrenos.map((key)=>{
                return key.etapa;
            })
        }).catch(err=>{console.log('err',err);})
    }
    obtenerTerrenosDisponibles(){
        this.terrenos =  this.terrenos.filter(t=>t.Asignado == 0 && t.Activo == 1 && t.Apartado == 0);
        console.log('this terrenos',this.terrenos);
    }
    obtenerContratoTerreno(){
        let datosTerreno = this.clienteDetalles.Terrenos.filter(ob=>ob.IdTerreno == this.IdTerrenoContrato)[0];
        let datos_contrato = {datosTerreno, datosCliente: this.clienteDetalles};
        this.terrenoDatos = datosTerreno;
        this.catalogosService.obtenerDatosContrato(datos_contrato).then(res=>{
            if(res['Data']){
                this.contenidoContrato =  res['Data'];
            }else{
                this.contenidoContrato = 'Sin contrato ';
            }
        }).catch(err=>{this.contenidoContrato = 'Sin contrato ';})
    }
    filtrarClientes(){
        let filtrados = this.clientesTodosTodos;
        //console.log('filtrados',filtrados);
        if((this.textoBuscar && this.textoBuscar != '' )){
            let coincidencias = [];
            if(filtrados[0]){
                filtrados.forEach((f)=>{
                    let validado = false;
                    //NOMBRE
                    if(f.Nombre.toString().toUpperCase().indexOf(this.textoBuscar.toUpperCase()) > -1){
                        validado = true;
                    }
                    //CODIGO
                    if(f.Codigo.toString().toUpperCase().indexOf(this.textoBuscar.toUpperCase()) > -1){
                        validado = true;
                    }
                    //ETAPA
                    if(f.Etapa.toString().toUpperCase().indexOf(this.textoBuscar.toUpperCase()) > -1){
                        validado = true;
                    }
                    //LOTE
                    if(f.Lote.toString().toUpperCase().indexOf(this.textoBuscar.toUpperCase()) > -1){
                        validado = true;
                    }
                    //PARCELA
                    if(f.Parcela.toString().toUpperCase().indexOf(this.textoBuscar.toUpperCase()) > -1){
                        validado = true;
                    }
                    if(validado){ coincidencias.push(f);}
                });
                filtrados =coincidencias;
            }
        }
        this.clientesTodos = filtrados;
    }
    filtrarTerrenos(){
        let filtrados = this.terrenosTodos;
        //console.log('filtrados',filtrados);
        if((this.terrenosBuscar && this.terrenosBuscar != '' )){
            let coincidencias = [];
            if(filtrados[0]){
                filtrados.forEach((f)=>{
                    let validado = false;
                    //NOMBRE
                    if(f.Pertenece.toString().toUpperCase().indexOf(this.terrenosBuscar.toUpperCase()) > -1){
                        validado = true;
                    }
                    //CODIGO
                    if(`TER-${f.IdTerreno}`.toString().toUpperCase().indexOf(this.terrenosBuscar.toUpperCase()) > -1){
                        validado = true;
                    }
                    //ETAPA
                    if(`${f.etapa}`.toString().toUpperCase().indexOf(this.terrenosBuscar.toUpperCase()) > -1){
                        validado = true;
                    }
                    //LOTE
                    if(`${f.lote}`.toString().toUpperCase().indexOf(this.terrenosBuscar.toUpperCase()) > -1){
                        validado = true;
                    }
                    //PARCELA
                    if(`${f.parcela}`.toString().toUpperCase().indexOf(this.terrenosBuscar.toUpperCase()) > -1){
                        validado = true;
                    }
                    //SUPERFICIE
                    if(`${f.Superficie}`.toString().toUpperCase().indexOf(this.terrenosBuscar.toUpperCase()) > -1){
                        validado = true;
                    }
                    //ESTADO
                    if(`${f.Estado}`.toString().toUpperCase().indexOf(this.terrenosBuscar.toUpperCase()) > -1){
                        validado = true;
                    }
                    if(validado){ coincidencias.push(f);}
                });
                filtrados =coincidencias;
            }
        }
        this.terrenos = filtrados;
    }
    obtenerClientesActivos(){
        this.catalogosService.clientesTerrenos().then(res=>{
            this.terrenosClientes =  res['Data'];
            return this.catalogosService.clientesActivos();
        }).then(resCli=>{
            this.clientesTodosTodos = this.clientesTodos =  this._ordenarDatosCliente(resCli['Data']);
            this.totales.Clientes = this.clientesTodosTodos.length;
            console.log('clientes',this.clientesTodos);
            this.nombresClientes = resCli['Data'].map((key)=>{
                return key.Nombre;
            })
        }).catch(err=>{console.log('err',err);});
    }
    verCatalogoClientes(){
        this.panelVisualizar = 'Clientes';
    }
    detalleCliente(cliente){
        this._limpiarPantallas();
        this.clienteDetalles = cliente;
        if(this.clienteDetalles){
            if(this.clienteDetalles.Terrenos[0]){
                this.mensualidades();
                this.anualidades();
            }else{
                this.clienteDetalles.Terrenos = [];
            }
            this.mantenimientos();
        }
        console.log('clientes',this.clienteDetalles);
    }
    _limpiarPantallas(){
        this.clienteDetalles = this.clientesTodosVista = this.detallesClienteVista = this.mensualidadesVista = this.anualidadesVista = this.mantenimientoVista = false;
    }
    mantenimientos(){
        let cliente = this.clienteDetalles;
        //this._limpiarPantallas();
        if(cliente.IdCliente){
            this.ventasService.obtenerMantenimientosCliente(cliente).then(man=>{
                if(man['Data']){
                    this.mantenimientosTodos = {Datos: this._ordenarDatosMensualidad(man['Data'])};
                    this.clienteDetalles.Mantenimientos = man['Data'];
                    this.mantenimientoVista = true;
                }
            })
        }
    }
    mensualidades(){
        let cliente = this.clienteDetalles;
        this._limpiarPantallas();
        this.clienteDetalles = cliente;
        if(this.clienteDetalles.IdCliente){
            //console.log('det',this.clienteDetalles);
            this.ventasService.obtenerMensualidadesCliente(this.clienteDetalles).then(men=>{
                if(men['Data']){
                this.clienteDetalles.Terrenos.forEach(te=>{
                    let mensualidadTerreno = men['Data'].filter(ob=> ob.IdTerreno ==  te.IdTerreno);
                    if(mensualidadTerreno[0]){
                        te.Mensualidades = {Datos: this._ordenarDatosMensualidad(mensualidadTerreno)};
                    }else{
                        te.Mensualidades = {Datos: [{Fecha: '0000-00-00', Fecha_ultimo_abono: '0000-00-00', Importe:'-',Pagado : '-', Restante: '-', ObjCompleto: {}}]}
                    }
                    console.log('mensu',te.Mensualidades);
                })
                    this.clienteDetalles.Mensualidades = men['Data'];
                    //console.log('clientes',this.clienteDetalles);
                    this.mensualidadesVista = true;
                }
            })
        }
    }
    anualidades(){
        let cliente = this.clienteDetalles;
        this._limpiarPantallas();
        this.clienteDetalles = cliente;
        if(this.clienteDetalles.IdCliente){
            //console.log('det',this.clienteDetalles);
            this.ventasService.obtenerAnualidadesCliente(this.clienteDetalles).then(men=>{
                if(men['Data']){
                this.clienteDetalles.Terrenos.forEach(te=>{
                    let anualidadTerreno = men['Data'].filter(ob=> ob.IdTerreno ==  te.IdTerreno);
                    if(anualidadTerreno[0]){
                        te.Anualidades = {Datos: this._ordenarDatosMensualidad(anualidadTerreno)};
                    }else{
                        te.Anualidades = {Datos: [{Fecha: '0000-00-00', Fecha_ultimo_abono: '0000-00-00', Importe:'-',Pagado : '-', Restante: '-', ObjCompleto: {}}]}
                    }
                    //console.log('mensu',te.Mensualidades);
                })
                    this.clienteDetalles.Anualidades = men['Data'];
                    //console.log('clientes',this.clienteDetalles);
                    this.anualidadesVista = true;
                }
            })
        }
    }
    _ordenarDatosMensualidad(datos){
        let datosOrdenados =  [];
        datos.forEach(da=>{
            let pagado =  (da.Pagado ==1)?'Si':'No';
            pagado =  (da.Pendiente == 0)?pagado:'Abonado';
            datosOrdenados.push({Fecha: da.Fecha, Fecha_ultimo_abono: da.Fecha_modificacion, Importe:da.Importe,Pagado : pagado, Restante: da.Pendiente, ObjCompleto: da});
        });
        return datosOrdenados;
    }
    _ordenarDatosCliente(datos){
        let datosOrdenados =  [];
        let Parcela;let Lote;let Etapa;let Estado
        Parcela = Lote = Etapa = Estado = '-';
        datos.forEach(dat=>{
            dat.Color = 'secondary';
            let ter =  this.terrenosClientes.filter(ob => ob.IdCliente ==  dat.IdCliente);
//            console.log('dat',dat);
            if(!ter[0]){
                ter =  []
                Parcela = Lote = Etapa = Estado = '';
            }else{
                Parcela = Lote = Etapa = Estado = '';
                let aux = (ter.length > 1)?` y `:``;
                let c = 1;
                ter.forEach(t=>{
                    Parcela += `${t.parcela} ${(c<ter.length)?aux:``}`;
                    Lote += `${t.lote} ${(c<ter.length)?aux:``}`;
                    Etapa += `${t.etapa} ${(c<ter.length)?aux:``}`;
                    Estado += `${t.Estado} ${(c<ter.length)?aux:``}`;
                    c++;
                });
            } 
            dat.Parcela = Parcela;
            dat.Lote = Lote;
            dat.Etapa = Etapa;
            dat.Estado = Estado;
//            console.log('ter',ter);
            dat.Terrenos = ter;
            dat.Fecha_nacimiento =  dat.Fecha_nacimiento.split('T')[0];
            datosOrdenados.push(dat);
        })
        return datosOrdenados;
    }
    catalogoClientes(){
        this._limpiarVistaYVariables();
        this._delay(100).then(res=>{
            this.clientesCatalogos = true;
            this.vistaCentro = true;
        });
    }
    nuevoCliente(){
        this._limpiarVistaYVariables();
        this._delay(100).then(res=>{
            this.clienteNuevo = true;
            this.vistaCentro = true;
        });
    }
    imprimirPagare(obj){
        console.log('obj',obj);
    }
    nuevaCotizacion(){
        this._limpiarVistaYVariables();
        this._delay(100).then(res=>{
            this.cotizacionNueva = true;
            this.vistaCentro = true;
        });
    }
    procesarContratos(event){
/*        let datosEvent = this._datosPrueba();
        console.log('datos_prueba',datosEvent);*/
        this._limpiarVistaYVariables();
        this._delay(100).then(res=>{
            this.vistaCentro = true;
            this.datosContrato = event;
        });
    }
    confirmarEliminarUsuario(p){
        let datosModal = {Titulo:'Advertencia',Contenido: 'Estas a punto de poner borrar este prospecto, deseas continuar ? ',Tipo:'warning',Confirm:'Si Eliminar'}
        
        this._confirmarModal(datosModal).then(res=>{
            console.log('datos',p);
            p.Activo = 0;
            this.catalogosService.actualizarProspectoVendedor(p).then(res=>{
                this.nuevoProspecto = false;
                this._obtenerProspectos();
            }).catch(err=>{console.log('err',err);})
        }).catch(err=>{
            console.log('err',err);
        })
        this.Prospectos =  this.Prospectos.filter(pr=>pr != p)
    }
    apartarTerreno(p){
        this.panelVisualizar = 'NuevoCliente'
        this.datosNuevoCliente = { Nombre:p.Nombre_prospecto, Correo:p.Correo,Telefono:p.Telefono,Terrenos:[{Id:0,Cotizacion:[{IdCotizacion:0}]}]}
    }
    _limpiarVistaYVariables(){
        this.vistaCentro = this.clientesCatalogos = this.datosContrato = this.clienteNuevo = this.cotizacionNueva  = false;
    }
    _confirmarModal(datosAlert){
        return new Promise ((resolve,reject)=>{
          swal({ title: datosAlert.Titulo,
            html: `<p class="">${datosAlert.Contenido}</p>`,
            type: datosAlert.Tipo,
            showCancelButton: true,
            cancelButtonColor:'#D33',
            confirmButtonText: `<b style="font-size: 18px;">${datosAlert.Confirm}</b>`,
            cancelButtonText: `<b style="font-size: 18px;">Cancelar</b>`
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
