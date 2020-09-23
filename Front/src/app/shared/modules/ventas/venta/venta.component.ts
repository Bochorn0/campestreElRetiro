import { Component, OnInit ,Input, ViewChild} from '@angular/core';
import { routerTransition } from '../../../../router.animations';
import { CatalogosService } from '../../../../shared/services/catalogos.service';
import { VentasService } from '../../../../shared/services/ventas.service'
import {Observable} from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import {NgbActiveModal,NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
    selector: 'app-venta',
    templateUrl: './venta.component.html',
    styleUrls: ['./venta.component.scss'],
    animations: [routerTransition()],
    providers: [CatalogosService, VentasService]
})
export class VentaComponent implements OnInit {
    @ViewChild('ModificacionModal')ModificacionModal;
    @ViewChild('AltaModal')AltaModal;
    @ViewChild('NuevoMovimientoModal')NuevoMovimientoModal;
    frmSolicitud: FormGroup; // Formulario de solicitud
    //
    datosCliente;mensualidadesPendientes;mensualidad;nombresClientes;datosTerreno;datosMensualidad;
    VentaCompleta;anualidadesPendientes;anualidad;terrenoSelect;activeModal;modalDatos;movimientoNuevo =false;
    //Formulario ingresos
    clientesTodos = [];today;terrenos;
    folIngreso;folRecibo;tipoIngreso;conceptoIngreso;etapaIngreso;abonoVenta;totalVenta;
    conceptosAPagar;total_abono;catalogoVentas;conceptoVenta='';
    idTerreno ;formaPago;mostrarCuentas;cuentasDeposito;cuentaDestino;
    pdfRecibo;formaDePago;formasDePago;
    @Input('datosVenta')datosClienteVenta: any;Nombre_cliente;datosModificacion;

    tipoMovimiento;
    constructor(private catalogosService : CatalogosService, private ventasService: VentasService,private fb: FormBuilder, private modalService: NgbModal) {
        this.frmSolicitud = fb.group({
            'File': [null]
        });
        this.obtenerClientesActivos();
        this._foliosCliente();
        this.mensualidad =  this.anualidad = this.total_abono = this.tipoIngreso = this.etapaIngreso = 0;
        this.today =  moment().format('LL');
        this.conceptosAPagar = [];
        this.datosCliente = {};
        this.idTerreno = 0;
        this.mostrarCuentas = false;
        this._tipoOperacion();
        this._formasDePago();
        this.modalDatos = {Tipo: '', Clase: 'bg-secondary', Titulo: ''};
    }
    importar_excel($event): void {
        let fileObject;
        let file: File = $event.target.files[0];
        let nom = file.name.split('.');
        let compExt = `${nom[nom.length-1]}`;
            if(compExt.toUpperCase() != 'XLSX'){
                swal('error','El formato del archivo no es valido debe ser xlsx ','error');
            }else{
            this.importarArchivo($event).then((resultado: any) => {
                if (resultado) {
                    fileObject = { file: resultado.substring(78),Size: file.size , Tipo: `Cliente`, Ext: compExt}
                    return this.ventasService.nuevoIngresoArchivo(fileObject);
                }else{
                    return Promise.resolve({});
                }
            }).then(res=>{
                let data = JSON.parse(JSON.stringify(res));
                this.datosModificacion = data.Modificaciones;
                this.datosModificacion.Financiamiento.forEach(dm=>{
                    dm.Fecha = moment(`${dm.Fecha}`).utc().format('YYYY-MM-DD');
                });
                this.datosModificacion.Anualidad.forEach(dm=>{
                    dm.Fecha = moment(`${dm.Fecha}`).utc().format('YYYY-MM-DD');
                });
                console.log('data',data);
                this.frmSolicitud.controls["File"].setValue(null);
                this.movimientoCliente(data);
                let datosModal2;

//                return this._confirmarModal({},datosModal2); 
            }).then(res=>{
                console.log('res',res);
            }).catch(error => {
                console.log('error',error);
                this.frmSolicitud.controls["File"].setValue(null);
            });
        }
    }
    movimientoCliente(data){
        if(!data.Modificaciones && !data.DatosCliente.Nombre ){
//                    datosModal2 =  {Titulo: 'Advertencia',Contenido:`Este cliente no existe actualmente, deseas darlo de alta?`, Tipo:'warning', Confirm: 'Si guardar'}  ;
            this.modalDatos = {Tipo: ' Alta Cliente ', Clase: 'bg-info', Titulo: 'Alta de Cliente '} ;
            this.abrirModal(this.AltaModal);
        }else if(data.Modificaciones){
            this.modalDatos = {Tipo: 'Datos Modificaciones', Clase: 'bg-info', Titulo: 'Cambios detectados'} ;
            this.abrirModal(this.ModificacionModal);
//                    datosModal2 =  {Titulo: 'Advertencia',Contenido:`Hay actualizaciones en el nuevo archivo, deseas remplazarlo ? `, Tipo:'warning', Confirm: 'Si remplazar'}  ;
        }else{
            this.movimientoNuevo = true;
            this.datosCliente =  data.DatosCliente;
            // let datosModal2 =  {Titulo: 'Advertencia',Contenido:`Se cargo la configuración del`, Tipo:'warning', Confirm: 'Si guardar'}  ;
            // return this._confirmarModal({},datosModal2); 
            // this.modalDatos = {Tipo: 'Movimiento Nuevo', Clase: 'bg-info', Titulo: 'Nuevo Movimiento'} ;
            // this.abrirModal(this.NuevoMovimientoModal);
//                    datosModal2 =  {Titulo: 'Información',Contenido:` Se han Obtenido los detalles del cliente "${data.DatosCliente.Nombre}", Deseas Ingresar un Nuevo movimiento ?  `, Tipo:'success', Confirm: 'Si'}  ;
        }
    }
    abrirModal(content){
        this.activeModal = this.modalService.open(content, {windowClass: 'modal-holder', size: 'lg'});
    }
    importarArchivo($event){
        return new Promise((resolve, reject) => {
            try {
                let uploadFiles = $event.target.files;
                let file: File = uploadFiles[0];
                let myReader: FileReader = new FileReader();
                myReader.readAsDataURL(file);
                myReader.onloadend = (e) => {
                    return resolve(myReader.result);
                };
            } catch (error) {
                return reject({ errorMessage: "No se pudo cargar el archivo", error });
            }
        });
    }
    _formasDePago(){
        this.catalogosService.obtenerCuentasEspeciales().then(res =>{
            let datos = res['Data'].filter(ob=>ob.Activa == 1);
/*            let nombresCuentas = [];
            datos.forEach(da=>{
//                nombresCuentas.push(`${da.Nombre}-${da.Numero}`);
                nombresCuentas.push(`${da.Nombre}`);
            });
            this.formaDePago =  nombresCuentas;*/
            this.formasDePago = datos;
            console.log('formas de pago', this.formasDePago);
        }).catch(err=>{console.log('err',err);});
    }
/*    _obtenerFuentesGastos(){
        this.catalogosService.obtenerCuentasEspeciales().then(res =>{
            let datos = res['Data'];
            let nombresCuentas = [];
            datos.forEach(da=>{
                nombresCuentas.push(`${da.Nombre}-${da.Numero}`);
            });
            this.cuentasDeposito =  nombresCuentas;
        }).catch(err=>{console.log('err',err);});
    }*/
    _tipoOperacion(){
        this.catalogoVentas = [{Tipo:'Enganche'},
        {Tipo:'Terreno'},
        {Tipo:'Anualidad'},
        {Tipo:'Mantenimiento'}];
        // this.catalogosService.obtenerCatalogoVentas().then(res=>{
        //     console.log('res',res);
        //     if(res['Data']){
        //         this.catalogoVentas =  res['Data'].filter(ob=>ob.Tipo == 'Abono');
        //     }
        // }).catch(err=>{console.log('err',err);});
    }
    obtenerClientesActivos(){
        this.catalogosService.obtenerDatosClientes({}).then(res=>{
            this.clientesTodos = res['Data'];
            this.clientesTodos.forEach(t=>{
                if(t.Terrenos[0]){
                    t.Terrenos.map(mm=>{
                        mm.NombreEspecial = `Lote: ${mm.Lote} - Etapa: ${mm.Etapa}`;
                    })
                }
            });
            console.log('clientes',this.clientesTodos);
            this.nombresClientes = res['Data'].map((key)=>{
                return key.Nombre;
            })
//            this._recorrerFiltros(this.clientesTodosTodos);
        }).catch(err=>{console.log('err',err);});
    }
    _ordenarDatosCliente(datos){
        let datosOrdenados =  [];
        let Parcela;let Lote;let Etapa;
        Parcela = Lote = Etapa = '-';
        if(datos[0]){
            datos.forEach(dat=>{
                if(this.terrenos[0]){
                    let ter =  this.terrenos.filter(ob => ob.IdCliente ==  dat.IdCliente);
                    if(!ter[0]){
                        ter =  {IdTerreno:0,Parcela:0,Etapa:0,Lote:0}
                    }else{
                        Parcela = Lote = Etapa = '';
                        let aux = (ter.length > 1)?` y `:``;
                        let c = 1;
                        ter.forEach(t=>{
                            Parcela += `${t.parcela} ${(c<ter.length)?aux:``}`;
                            Lote += `${t.lote} ${(c<ter.length)?aux:``}`;
                            Etapa += `${t.etapa} ${(c<ter.length)?aux:``}`;
                            t.NombreEspecial = `Parcela: ${t.parcela}, Etapa: ${t.etapa}, Lote: ${t.lote}`;
                            c++;
                        });
                    }
                    dat.Parcela = Parcela;
                    dat.Lote = Lote;
                    dat.Etapa = Etapa;
                    dat.Terrenos = ter;
                    dat.Fecha_nacimiento =  dat.Fecha_nacimiento.split('T')[0];
                    datosOrdenados.push(dat);
                }

            })
        }
        return datosOrdenados;
    }
    _foliosCliente(){
        this.ventasService.obtenerFolioVenta().then(res=>{
            let idVenta = 0;
            if(res['Data'][0]){
                idVenta = res['Data'][0].IdVenta;
            }
            this.folIngreso = `VEN-${idVenta+1}`;
            this.folRecibo = `${idVenta+1}`;
        }).catch(err=>{
            swal('Error','Ocurrio un problema al obtener el folio automatico, solicita apoyo en soporte','error');
        })
    }
    aprobarCambios(){
        if(this.datosModificacion){
            return this.ventasService.aprobar_movimientos_nuevos(this.datosModificacion).then(res=>{
                let data = JSON.parse(JSON.stringify(res));
                console.log('data',data);
            }).catch(error => {
                console.log('error',error);
                this.frmSolicitud.controls["File"].setValue(null);
            });            
        }
    }
    ngOnInit() {
        if(this.datosClienteVenta){
            this.datosCliente =  this.datosClienteVenta;
        }
    }
    agregarVenta(){
        let Mensualidad = false;
        let Anualidad = false;
        let existeTipo = this.conceptosAPagar.filter(ob=>ob.TipoMovimiento == this.tipoIngreso);
        let esAcumulable = false;
        // if(!esAcumulable && this.tipoIngreso == 'Terreno'){
        //     esAcumulable = (this.conceptosAPagar.find(ob=>ob.Mensualidad.IdAdeudo == this.mensualidad))?false:true;
        // } 
        // if(!esAcumulable && this.tipoIngreso == 'Anualidad'){
        //     esAcumulable = (this.conceptosAPagar.find(ob=>ob.Anualidad.IdAnualidad == this.anualidad))?false:true;
        // }
        if(this.total_abono && !existeTipo[0] || esAcumulable){
            // if(this.tipoIngreso == 'Terreno'){
            //     Mensualidad = this.mensualidadesPendientes.filter(ob => ob.IdAdeudo == this.mensualidad)[0];
            //     this.mensualidadesPendientes.filter(ob => ob.IdAdeudo == this.mensualidad)[0].Pagado = 1;
            // }else if(this.tipoIngreso == 'anualidad'){
            //     Anualidad = this.anualidadesPendientes.filter(ob => ob.IdAnualidad == this.anualidad)[0];
            //     this.anualidadesPendientes.filter(ob => ob.IdAnualidad == this.anualidad)[0].Pagado = 1;
            // }
            
            this.conceptoVenta += ` con un total de ${this.total_abono} al lote : ${this.datosTerreno.Lote}, etapa : ${this.datosTerreno.Etapa}, de campestre familiar ElRetiro.`;
            this.conceptosAPagar.push({Concepto: `${this.conceptoVenta}`, Importe: this.total_abono ,TipoMovimiento: this.tipoIngreso,Mensualidad,Anualidad });
            this.totalVenta = 0;
            this.conceptosAPagar.forEach(co=>{
                this.totalVenta += co.Importe;
            });
        }else{
            swal('Error','Verifica que no hayas agregado ya este concepto o que tengas los campos requeridos','warning');
        }

        console.log('total',this.totalVenta);
        this.conceptoVenta = '';
    }
    borrarConcepto(obj){
        console.log('concepto',obj);
        let conceptosRestantes =  this.conceptosAPagar.filter(ob=> ob != obj);
        this.conceptosAPagar = conceptosRestantes;
    }
    filtrarCliente = (text$: Observable<string>) =>
      text$.pipe( debounceTime(200), distinctUntilChanged(),
        map(term => term === ''?[]:this.nombresClientes.filter(ob => ob.toUpperCase().indexOf(term.toUpperCase()) > -1))
    );
    seleccionarCliente(selected){
        if( this.Nombre_cliente && this.Nombre_cliente != ''){
            return this.ventasService.nuevoIngresoArchivo({Nombre_cliente:this.Nombre_cliente}).then(res=>{
                let data = JSON.parse(JSON.stringify(res));
                console.log('res',res);
                this.frmSolicitud.controls["File"].setValue(null);
                this.movimientoCliente(data);
            }).then(res=>{
                console.log('res',res);
            }).catch(error => {
                console.log('error',error);
                this.frmSolicitud.controls["File"].setValue(null);
            });            
        };
        // let dataFiltros = {Nombre_cliente: this.Nombre_cliente};
        // return this.ventasService.nuevoIngresoArchivo(dataFiltros);
        // this.datosCliente =  this.clientesTodos.filter(ob=>ob.Nombre == selected)[0];
        // console.log('datosCliente',this.datosCliente);
        // if(this.datosCliente.Terrenos.length == 1){
        //     this.datosTerreno = this.datosCliente.Terrenos[0];
        //     this.terrenoSelect = this.datosCliente.Terrenos[0].NombreEspecial;
        // }else{
        //     this.datosTerreno = false;
        // }
        // if(this.datosCliente.Saldo_anualidad == 0){
        //     let restantes = this.catalogoVentas.filter(ob=>ob.Codigo != '03');
        //     this.catalogoVentas = restantes;
        //     console.log('se quito anualidad',restantes);
        // }
        // if(this.datosCliente.Saldo_adeudo == 0){

        //     let restantes2 = this.catalogoVentas.filter(ob=>ob.Codigo != '02');
        //     this.catalogoVentas = restantes2;           
        //     console.log('se quito enganche',restantes2);
        // }
        // if(this.datosCliente.Saldo_credito == 0){
        //     let restantes3 = this.catalogoVentas.filter(ob=>ob.Codigo != '01');
        //     this.catalogoVentas = restantes3;
        //     console.log('se quito mensualidad',restantes3);
        // }
    }
    seleccionarTerreno(selected){
        if(this.idTerreno){
        let terreno = this.datosCliente.Terrenos.filter(ob=>ob.NombreEspecial == selected);
        console.log('terrenos',terreno);
        this.datosTerreno = terreno[0];
        this.mensualidadesPendientes = [];
        this.tipoIngreso = 0;
        this.idTerreno = this.datosTerreno.IdTerreno;
        }
        console.log('datosterreno',this.datosTerreno);
    }
    cambiarFormaPago(){
        if(this.formaPago == 'Tarjeta' || this.formaPago == 'Transferencia' ){
            this.mostrarCuentas = true;
        }else{
            this.mostrarCuentas = false;
        }
    }
    guardarNuevoIngreso(){
        this.VentaCompleta = 0;
        let usuario = JSON.parse(localStorage.getItem('Datos'));
        let tipo = '';
        if(this.conceptosAPagar.length > 1){
            tipo = `Multiples Conceptos`;
        }else{
            let tipoIng = this.catalogoVentas.filter(ob=> ob.Codigo == this.tipoIngreso);
            tipo = `${tipoIng[0].Descripcion}`;
        }
        let cuenta = this.formasDePago.find(ob=>ob.IdCuenta == this.formaPago);
        let formaDePago = (cuenta.Nombre == 'Efectivo')?'Efectivo':'Tarjeta';
        let datosNuevoIngreso = { DatosUsuario: usuario, DatosCliente: this.datosCliente, DatosTerreno: this.datosTerreno, DatosMensualidad: this.datosMensualidad,
            DatosVenta: {Folio:this.folIngreso, Recibo:this.folRecibo,TipoVenta:tipo,FormaPago:formaDePago,IdCuenta:cuenta.IdCuenta,Concepto: this.conceptoIngreso,ConceptosPagados: this.conceptosAPagar , Total:this.totalVenta} };
            //console.log('datos',datosNuevoIngreso);
        this.ventasService.guardarNuevoIngreso(datosNuevoIngreso).then(res=>{
            this.VentaCompleta =  true;
            return this.ventasService.obtenerFolioVenta();
        }).then(venta=>{
            this._nuevaVentaDatos(venta);
            return this.ventasService.obtenerPdfRecibo(datosNuevoIngreso);
        }).then(res=>{
            this.pdfRecibo = res['String'];
            this._downloadFile('data:application/pdf;base64,'+this.pdfRecibo,`${this.folIngreso}`,'pdf');
            return this._inputModal();
        }).then(adjuntoCorreo=>{
            return this.enviarReciboCorreo(adjuntoCorreo);
        }).then(ConfirmarCorreo=>{
            let datosModal2 =  {Titulo: '',Contenido:`Deseas imprimir el recibo?`, Tipo:'success', Confirm: 'Si imprimir'}  
            return this._confirmarModal({},datosModal2);
        }).then(imprimirRecibo=>{
            this._imprimirRecibo();
            this.obtenerClientesActivos();
        }).catch(err=>{console.log('err',err); this.obtenerClientesActivos();    })
    }
    _imprimirRecibo(){
        var popupWin = window.open('', '_blank', 'width=800,height=800,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no,top=50');
        popupWin.window.focus();
        popupWin.document.open();
        popupWin.document.write("<iframe width='100%' height='100%' src='data:application/pdf;base64, " + encodeURI(this.pdfRecibo)+"'></iframe>");
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
    enviarReciboCorreo(adjunto){
        return new Promise ((resolve,reject)=>{
        let contenido = `<!DOCTYPE html><html><head><title>Recibo</title></head><body>Recibo automatico generado por campestre el retiro, gracias por</body></html>`;
        let datosCorreo =  {Para: `bocho_sup@hotmail.com`, Contenido: contenido, Asunto: `Recibo`, Adjunto: adjunto}
        console.log('datosCorreo',datosCorreo);
        this.ventasService.enviarReciboCorreo(datosCorreo).then(res=>{
            console.log('res',res);
            return resolve({});
        }).catch(err=>{console.log('err',err); return resolve({});});
        });
    }
    _nuevaVentaDatos(venta){
        let idVenta = 0;
        if(venta['Data'][0]){
            idVenta = venta['Data'][0].IdVenta;
        }
        this.folIngreso = `VEN-${idVenta+1}`;
        this.folRecibo =  idVenta+1;
        this.datosTerreno =  this.datosMensualidad = false;
        this.conceptosAPagar = [];
        this.datosCliente = {};
        this.idTerreno = 0;
        this.mensualidad = this.totalVenta = this.formaPago  = this.tipoIngreso  = 0;
        this.conceptoIngreso =  this.etapaIngreso =  '';
        //this.obtenerClientesActivos();
        this.VentaCompleta = false;
        
    }
    actualizarFolioMov(){
        let fol = this.folIngreso.split('-');
        if(this.tipoIngreso == '01' && this.datosTerreno.IdTerreno){
            this.ventasService.obtenerMensualidadesCliente(this.datosCliente).then(datosMensualidades =>{
                this.datosCliente.Mensualidades = datosMensualidades['Data'];
                let datosMens =  datosMensualidades['Data'].filter(ob => ob.IdTerreno == this.datosTerreno.IdTerreno);
                this.mensualidadesPendientes =  datosMens.filter(ob=> ob.Pagado != 1);
                //let mens =  this.mensualidadesPendientes.filter(me => me.Fecha.split('T')[0].toString().substring(0,7) == moment().add('1','M').format('YYYY-MM'))[0];
                let mens = this.mensualidadesPendientes[0];
                if(mens.Pagado != 1){
                    this.mensualidad = mens.IdAdeudo;
                }
                this.total_abono = this.mensualidadesPendientes[0].Importe;
                this.conceptoVenta = `Mensualidad #${mens.Num_pago} de ${datosMens.length}`;
                console.log('datos cliente',this.datosCliente);
            }).catch(err=>{console.log('res');})
        }else if(this.tipoIngreso == '02' && this.datosTerreno.IdTerreno){
            let tipoIngreso = this.catalogoVentas.filter(ob=> ob.Codigo == this.tipoIngreso);
            this.total_abono = this.datosCliente.Saldo_adeudo;
            this.conceptoVenta = `${tipoIngreso[0].Descripcion}`;

        }else if(this.tipoIngreso == '03' && this.datosTerreno.IdTerreno){
            this.ventasService.obtenerAnualidadesCliente(this.datosCliente).then(datosAnualidades =>{
                this.datosCliente.Anualidades = datosAnualidades['Data'];
                let datosAnu =  datosAnualidades['Data'].filter(ob => ob.IdTerreno == this.datosTerreno.IdTerreno);
                this.anualidadesPendientes =  datosAnu.filter(ob=> ob.Pagado != 1);
                let anua =  this.anualidadesPendientes[0];
                if(anua.Pagado != 1){
                    this.anualidad = anua.IdAnualidad;
                }
                this.total_abono = this.anualidadesPendientes[0].Importe;
                this.conceptoVenta = `Anualidad #${anua.Num_pago} de ${datosAnu.length}`;
            }).catch(err=>{console.log('res');})
        }else if(this.tipoIngreso == '04' && this.datosTerreno.IdTerreno){
            let tipoIngreso = this.catalogoVentas.filter(ob=> ob.Codigo == this.tipoIngreso);
            this.total_abono = 0;
            this.conceptoVenta =  `${tipoIngreso[0].Descripcion}`;
        }
    }
    cambiarTotalesYConceptos(men){
        let movimiento = this.conceptoVenta;
        let importe = this.total_abono;
        if(this.tipoIngreso == 'Enganche'){
            movimiento = 'Enganche';
            importe = this.total_abono = this.datosCliente.Adeudo_enganche;
        }else if(this.tipoIngreso == 'Terreno' && this.mensualidad){
//            let seleccionada = this.mensualidadesPendientes.find(ob => ob.IdAdeudo == this.mensualidad);
            console.log('mensualidad',this.mensualidad);
            let datosMens =  this.datosCliente.Financiamiento.find(ob => ob.IdFinanciamientoMensualidades == this.mensualidad);
            movimiento = `Mensualidad #${datosMens.Num_pago} de ${this.datosCliente.Financiamiento.length}`;
            importe = this.total_abono = datosMens.Cantidad;
        }else if(this.tipoIngreso == 'Anualidad' && this.anualidad){
            let datosAnu =  this.datosCliente.Anualidades.find(ob => ob.IdFinanciamientoAnualidad == this.anualidad);
            movimiento = `Anualidad #${datosAnu.Num_pago} de ${this.datosCliente.Anualidades.length}`;
            importe = this.total_abono = datosAnu.Cantidad;
        }
        //this.conceptoVenta = `${movimiento} con un total de ${importe} al lote ${this.datosTerreno.lote}, etapa ${this.datosTerreno.etapa}, de campestre familiar ElRetiro.`;
        this.conceptoVenta = `${movimiento}`;
    }
    _inputModal(){
        return new Promise ((resolve,reject)=>{
            swal({ title: 'Adjunta el archivo',
              html: ``,
              input:'file',
              type: 'warning',
              showCancelButton: true,
              cancelButtonColor:'#D33',
              confirmButtonText: 'Confirmar'
            }).then((result)=>{
                if(result.value){
                    let file: File = result.value;
                    let renderFile: FileReader = new FileReader();
                    renderFile.readAsDataURL(file);
                    renderFile.onloadend = () => {
                        if (renderFile.result) { console.log('result',renderFile.result); return resolve(renderFile.result);}
                    }
                }else{
                    return resolve(false);
                }


            }).catch((err)=>{
                return reject({});
            });
        });
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
