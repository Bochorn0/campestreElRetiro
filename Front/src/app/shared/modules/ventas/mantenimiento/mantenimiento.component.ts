import { Component, OnInit, Input , ViewChild} from '@angular/core';
import { routerTransition } from '../../../../router.animations';
import { CatalogosService } from '../../../../shared/services/catalogos.service';
import { VentasService } from '../../../../shared/services/ventas.service'
import {Observable} from 'rxjs';
import swal from 'sweetalert2';
import * as moment from 'moment';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';

@Component({
    selector: 'app-mantenimiento',
    templateUrl: './mantenimiento.component.html',
    styleUrls: ['./mantenimiento.component.scss'],
    animations: [routerTransition()],
    providers: [CatalogosService, VentasService]
})
export class MantenimientoComponent implements OnInit {
    today;clientesTodos;nombresClientes;datosCliente;folIngreso;folRecibo;
    datosTerreno;etapaIngreso;numParcela;idCliente;clienteIngreso;codigoCliente;mensualidadesPendientes;
cliente;catalogoVentas;tipoIngreso;conceptoVenta;pdfRecibo;
terrenos;
mantenimientoSelected;total_abono;conceptoIngreso;conceptosAPagar;
VentaCompleta;formaPago;totalVenta;mantenimientosClientesTerreno;
idTerreno;cuentasDeposito;mostrarCuentas;cuentaDestino;formasDePago;
    @Input('datosMantenimiento')datosClienteMantenimiento: any;
    constructor(private catalogosService : CatalogosService, private ventasService: VentasService) {
        this.obtenerClientesActivos();
        this._foliosCliente();
        this.conceptosAPagar = [];
        this.idTerreno = this.formaPago = 0;
        this.today =  moment().format('LL');
        this.datosCliente = {};
        this.mostrarCuentas = false;
        this._tipoOperacion();
        this._formasDePago();
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
    /*
    _obtenerFuentesGastos(){
        this.catalogosService.obtenerCuentasEspeciales().then(res =>{
            let datos = res['Data'];
            let nombresCuentas = [];
            datos.forEach(da=>{
                nombresCuentas.push(`${da.Nombre}-${da.Numero}`);
            });
            this.cuentasDeposito =  nombresCuentas;
        }).catch(err=>{console.log('err',err);});
    }*/
    _ordenarDatosMensualidad(datos){
        let datosOrdenados =  [];
        datos.forEach(da=>{
            let pagado =  (da.Pagado ==1)?'Si':'No';
            pagado =  (da.Pendiente == 0)?pagado:'Abonado';
            datosOrdenados.push({Fecha: da.Fecha, Fecha_ultimo_abono: da.Fecha_modificacion, Importe:da.Importe,Pagado : pagado, Restante: da.Pendiente, ObjCompleto: da});
        });
        return datosOrdenados;
    }
    _tipoOperacion(){
        this.catalogosService.obtenerCatalogoVentas().then(res=>{
            console.log('res',res);
            if(res['Data']){
                this.catalogoVentas =  res['Data'].filter(ob=>ob.Tipo == 'Mantenimiento');
            }
        }).catch(err=>{console.log('err',err);});
    }
    obtenerClientesActivos(){
        this.catalogosService.clientesTerrenos().then(res=>{
            this.terrenos =  res['Data'];
        return this.catalogosService.clientesActivos();
        }).then(resCli=>{
            this.clientesTodos =  this._ordenarDatosCliente(resCli['Data']);
            this.nombresClientes = resCli['Data'].map((key)=>{
                return key.Nombre;
            });
        }).catch(err=>{console.log('err',err);});
    }
    _ordenarDatosCliente(datos){
        let datosOrdenados =  [];
        let Parcela;let Lote;let Etapa;
        Parcela = Lote = Etapa = '-';
        datos.forEach(dat=>{
            let ter =  this.terrenos.filter(ob => ob.IdCliente ==  dat.IdCliente);
            if(!ter[0]){
                ter =  {IdTerreno:0,Parcela,Etapa,Lote}
            }else{
                Parcela = Lote = Etapa = '';
                let aux = (ter.length > 1)?` y `:``;
                let c = 1;
                ter.forEach(t=>{
                    Parcela += `${t.parcela} ${(c<ter.length)?aux:``}`;
                    Lote += `${t.lote} ${(c<ter.length)?aux:``}`;
                    Etapa += `${t.etapa} ${(c<ter.length)?aux:``}`;
                    c++;
                });
            }
            dat.Parcela = Parcela;
            dat.Lote = Lote;
            dat.Etapa = Etapa;
            dat.Terrenos = ter;
            dat.Fecha_nacimiento =  dat.Fecha_nacimiento.split('T')[0];
            datosOrdenados.push(dat);
        })
        return datosOrdenados;
    }
    _foliosCliente(){
        this.ventasService.obtenerFolioVenta().then(res=>{
            let idVenta = 0;
            if(res['Data'][0]){
                idVenta = res['Data'][0].IdVenta;
            }
            this.folIngreso = `MAN-${idVenta+1}`;
            this.folRecibo = `${idVenta+1}`;
        }).catch(err=>{
            swal('Error','Ocurrio un problema al obtener el folio automatico, solicita apoyo en soporte','error');
        })
    }
    ngOnInit() {
        if(this.datosClienteMantenimiento){
            this.datosCliente =  this.datosClienteMantenimiento;
        }
        /*if(this.datosClienteMantenimiento){
            this.datosCliente =  this.datosClienteMantenimiento;
            this.ventasService.obtenerMantenimientosCliente(this.datosCliente).then(man=>{
                if(man['Data']){
                this.datosCliente.Terrenos.forEach(te=>{
                    let manteimientosTerrenos = man['Data'].filter(ob=> ob.IdTerreno ==  te.IdTerreno);
                    te.Mantenimientos = {Datos: this._ordenarDatosMensualidad(manteimientosTerrenos)};
                })
                    this.datosCliente.Mantenimientos = man['Data'];
                }
                console.log('man',this.datosCliente);
            })
        }*/
    }
    cambiarFormaPago(){
        if(this.formaPago == 'Tarjeta' || this.formaPago == 'Transferencia' ){
            this.mostrarCuentas = true;
        }else{
            this.mostrarCuentas = false;
        }
    }
    agregarMantenimiento(){
        let existeTipo = this.conceptosAPagar.filter(ob=>ob.TipoMovimiento == this.tipoIngreso);
        if(this.total_abono && !existeTipo[0]){
            this.conceptoVenta += ` con un total de ${this.total_abono} al lote : ${this.datosTerreno.lote}, etapa : ${this.datosTerreno.etapa}, de campestre familiar ElRetiro.`;
            this.conceptosAPagar.push({Concepto: `${this.conceptoVenta}`, Importe: this.total_abono ,TipoMovimiento: this.tipoIngreso });
            this.totalVenta = 0;
            this.conceptosAPagar.forEach(co=>{
                this.totalVenta += co.Importe;
            });
        }else{
            swal('Error','Verifica que no hayas agregado ya este concepto o que tengas los campos requeridos','warning');
        }

        console.log('total',this.totalVenta);
    }

    /*agregarMantenimiento(){
        if(this.total_abono){
            if(this.mantenimientoSelected){
                let mantenimiento_ = this.datosCliente.Mantenimientos.filter(ob => ob.IdAdeudoMantenimiento == this.mantenimientoSelected)[0];
                this.datosCliente.Mantenimientos.filter(ob => ob.IdAdeudoMantenimiento == this.mantenimientoSelected)[0].Pagado = 1;
                this.conceptosAPagar.push({Concepto: this.conceptoMantenimiento, Importe: this.total_abono, Mantenimiento: mantenimiento_ });
            }else{
                this.conceptosAPagar.push({Concepto: this.conceptoMantenimiento, Importe: this.total_abono, TipoMovimiento: '02' });
            }
            this.mantenimientoSelected = this.total_abono= 0;
            this.totalMantenimiento = 0;
            this.conceptoMantenimiento = ``;
            this.conceptosAPagar.forEach(co=>{
                this.totalMantenimiento += co.Importe;
            });
        }else{
            swal('Error','No hay ningun Concepto seleccionado ','warning');
        }
    }*/
    borrarConcepto(obj){
        console.log('concepto',obj);
        let conceptosRestantes =  this.conceptosAPagar.filter(ob=> ob != obj);
        this.conceptosAPagar = conceptosRestantes;
    }
    actualizarFolioMov(){
        let tipo = this.catalogoVentas.filter(ob=> ob.Codigo == this.tipoIngreso);
        if(this.tipoIngreso == '05' ){
            this.total_abono = this.datosCliente.Saldo_agua;
            this.conceptoVenta =  `${tipo[0].Descripcion}`;
        }else if(this.tipoIngreso == '06' ){

            this.total_abono = this.datosCliente.Saldo_mantenimiento;
            this.conceptoVenta =  `${tipo[0].Descripcion}`;
        }
    }
    cambiarTotalesYConceptos(){
        let movimiento = this.conceptoVenta;
        let importe = this.total_abono;
        this.conceptoVenta = `${movimiento} con un total de ${importe} al lote ${this.datosTerreno.lote}, etapa ${this.datosTerreno.etapa}, de campestre familiar ElRetiro.`;
    }

/*    actualizarConceptos(){
        let seleccionado = this.datosCliente.Mantenimientos.filter(ob=>ob.IdAdeudoMantenimiento == this.mantenimientoSelected);
        if(seleccionado){
            this.total_abono = seleccionado[0].Importe;
            this.conceptoMantenimiento = `Mantenimiento correspondiente al ${seleccionado[0].Fecha.split('T')[0]}`;
        }else{
            this.conceptoMantenimiento  =  '';
            this.total_abono = 0;
        }
    }*/
    filtrarCliente = (text$: Observable<string>) =>
      text$.pipe( debounceTime(200), distinctUntilChanged(),
        map(term => term === ''?[]:this.nombresClientes.filter(ob => ob.toUpperCase().indexOf(term.toUpperCase()) > -1))
    );
    seleccionarCliente(selected){
        this.datosCliente =  this.clientesTodos.filter(ob=>ob.Nombre == selected.item.toString())[0];
        this.ventasService.obtenerMantenimientosCliente(this.datosCliente).then(man=>{
            if(man['Data']){
            this.datosCliente.Terrenos.forEach(te=>{
                let manteimientosTerrenos = man['Data'].filter(ob=> ob.IdTerreno ==  te.IdTerreno);
                te.Mantenimientos = {Datos: this._ordenarDatosMensualidad(manteimientosTerrenos)};
            })
                this.datosCliente.Mantenimientos = man['Data'];
            }
            console.log('man',this.datosCliente);
        })
    }
    seleccionarTerreno(){
        if(this.idTerreno){
        let terreno = this.datosCliente.Terrenos.filter(ob=>ob.IdTerreno == this.idTerreno);
        console.log('terrenos',terreno);
        this.datosTerreno = terreno[0];
        this.mensualidadesPendientes = [];
        this.idTerreno = this.datosTerreno.IdTerreno;
        this.mantenimientosClientesTerreno =  this.datosCliente.Mantenimientos.filter(ob => ob.IdTerreno == this.idTerreno);
        }
        console.log('datosterreno',this.datosTerreno);
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
        let datosNuevoIngreso = { DatosUsuario: usuario, DatosCliente: this.datosCliente, DatosTerreno: this.datosTerreno,
            DatosVenta: {Folio:this.folIngreso, Recibo:this.folRecibo,TipoVenta:tipo,FormaPago:formaDePago,Cuenta:cuenta.IdCuenta,Concepto: this.conceptoIngreso,ConceptosPagados: this.conceptosAPagar , Total:this.totalVenta} };

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
    _nuevaVentaDatos(venta){
        let idVenta = 0;
        if(venta['Data'][0]){
            idVenta = venta['Data'][0].IdVenta;
        }
        this.folIngreso = `MAN-${idVenta+1}`;
        this.folRecibo =  idVenta+1;
        this.datosTerreno = false;
        this.conceptosAPagar = [];
        this.datosCliente = {};
        this.idTerreno = 0;
        this.totalVenta = this.formaPago  = this.tipoIngreso  = 0;
        this.conceptoIngreso =  this.etapaIngreso =  '';
        this.obtenerClientesActivos();
        this.VentaCompleta = false;
        
    }


    /*guardarNuevoMantenimiento(){
        let usuario = JSON.parse(localStorage.getItem('Datos'));
        let tipo = '';
        if(this.conceptosAPagar.length > 1){
            tipo = `Multiples Conceptos`;
        }else{
            tipo = `Abono Mantenimiento`;
        }
        let datosNuevoMantenimiento = { DatosUsuario: usuario, DatosCliente: this.datosCliente, DatosTerreno: this.datosTerreno,
            DatosMantenimiento: {Folio:this.folMantenimiento, Recibo:this.IdMantenimiento,TipoVenta:tipo,FormaPago:this.formaPago,
            Concepto: this.conceptoMantenimiento,ConceptosPagados: this.conceptosAPagar , Total:this.totalMantenimiento} };
                console.log('datos',datosNuevoMantenimiento);
        this.ventasService.guardarNuevoMantenimiento(datosNuevoMantenimiento).then(res=>{
            this.mantenimientoCompleto =  true;
            console.log('res',res);
            //swal('Exito', `${res['Operacion']}`, tipo);
            return this.ventasService.obtenerFolioMantenimiento();
        }).then(venta=>{
            //console.log('venta',venta);
            var printContents = document.getElementById('Recibo_impreso').innerHTML;
            let contenido = `<!DOCTYPE html><html><head><title>Recibo</title><link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" /></head><body onload="window.print(); window.close();"><div>${printContents}</div></html>'`;
            let datosModal =  {Titulo: 'Exito',Contenido:`El mantenimiento se completo correctamente. Deseas imprimir un recibo ? <a href='mailto:${this.datosCliente.Correo}?Subject=RECIBO_COMPROBANTE&body=${contenido}' class="btn btn-warning">Enviar por correo</a>`,
            Tipo:'success', Confirm: 'Si Imprimir'} 
            this._confirmarModal({},datosModal).then(res=>{
                this.imprimirRecibo(venta);
            }).catch(er=>{
                this._nuevoMantenimientoDatos(venta);
            })
        }).catch(err=>{console.log('err',err);})
    }
    _nuevoMantenimientoDatos(venta){
        let idMant = 0;
        if(venta['Data'][0]){
            idMant = venta['Data'][0].IdMantenimiento;
        }
        this.folMantenimiento = `MAN-${idMant+1}`;
        this.IdMantenimiento =  idMant+1;
        this.conceptosAPagar = [];
        this.datosCliente = {};
        this.idTerreno = 0;
        this.totalMantenimiento = this.formaPago = this.mantenimientoSelected  = 0;
        this.conceptoIngreso  =  '';
        this.obtenerClientesActivos();
    }
    imprimirRecibo(venta){
        var printContents = document.getElementById('Recibo_impreso').innerHTML;
        var popupWin = window.open('', '_blank', 'width=800,height=800,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no,top=50');
        popupWin.window.focus();
        popupWin.document.open();
        popupWin.document.write(
            '<!DOCTYPE html><html><head><title>Recibo</title>'
            +'<link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" />'
            +'</head><body onload="window.print(); window.close();"><div>'
            + printContents + '</div></html>');
        popupWin.document.close();
        this._nuevoMantenimientoDatos(venta);
    }
    */
    imprimirRecibo(venta){
        return new Promise ((resolve,reject)=>{
            var printContents = document.getElementById('Recibo_impreso').innerHTML;
            var popupWin = window.open('', '_blank', 'width=800,height=800,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no,top=50');
            popupWin.window.focus();
            popupWin.document.open();
            popupWin.document.write(
                '<!DOCTYPE html><html><head><title>Recibo</title>'
                +'<link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" />'
                +'</head><body onload="window.print(); window.close();"><div>'
                + printContents + '</div></html>');
            popupWin.document.close();
            this._nuevaVentaDatos(venta);
            return resolve({});
        });
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
