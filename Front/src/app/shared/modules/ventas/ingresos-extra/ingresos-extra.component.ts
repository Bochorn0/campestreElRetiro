import { Component, OnInit ,Input, ViewChild} from '@angular/core';
import { routerTransition } from '../../../../router.animations';
import { CatalogosService } from '../../../../shared/services/catalogos.service';
import { VentasService } from '../../../../shared/services/ventas.service'
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
    selector: 'app-ingresos-extra',
    templateUrl: './ingresos-extra.component.html',
    styleUrls: ['./ingresos-extra.component.scss'],
    animations: [routerTransition()],
    providers: [CatalogosService, VentasService]
})
export class IngresosExtraComponent implements OnInit {

    //
    datosCliente;mensualidadesPendientes;mensualidad;nombresClientes;datosTerreno;datosMensualidad;
    VentaCompleta;conceptoIngresoExtra;totalIngresoExtra;pdfRecibo;
    //Formulario ingresos
    clientesTodos;today;terrenos;
    folIngreso;folRecibo;tipoIngresoExtra;conceptoIngreso;etapaIngreso;abonoVenta;totalVenta;
    conceptosAPagar;total_abono;catalogoVentas;
    idTerreno ;formaPago;mostrarCuentas;cuentasDeposito;cuentaDestino;formasDePago;
    @Input('datosIngresosExtras')datosClienteVenta: any;
    constructor(private catalogosService : CatalogosService, private ventasService: VentasService) {
        this.obtenerClientesActivos();
        this._foliosCliente();
        this.mensualidad = this.total_abono = this.tipoIngresoExtra = this.etapaIngreso = 0;
        this.today =  moment().format('LL');
        this.conceptosAPagar = [];
        this.datosCliente = {};
        this.idTerreno = 0;
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
    _tipoOperacion(){
        this.catalogosService.obtenerCatalogoVentas().then(res=>{
            console.log('res',res);
            if(res['Data']){
                this.catalogoVentas =  res['Data'].filter(ob=>ob.Tipo =='Extra');
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
            this.folIngreso = `EXT-${idVenta+1}`;
            this.folRecibo = `${idVenta+1}`;
        }).catch(err=>{
            swal('Error','Ocurrio un problema al obtener el folio automatico, solicita apoyo en soporte','error');
        })    
    }
    ngOnInit() {
        if(this.datosClienteVenta){
            this.datosCliente =  this.datosClienteVenta;
        }
    }
    agregarVenta(){
        let existeTipo = this.conceptosAPagar.filter(ob=>ob.TipoMovimiento == this.tipoIngresoExtra);
        if(this.totalIngresoExtra && !existeTipo[0]){
            this.conceptoIngresoExtra += ` con un total de ${this.totalIngresoExtra} al lote : ${this.datosTerreno.lote}, etapa : ${this.datosTerreno.etapa}, de campestre familiar ElRetiro.`;
            this.conceptosAPagar.push({Concepto: `${this.conceptoIngresoExtra}`, Importe: this.totalIngresoExtra ,TipoMovimiento: this.tipoIngresoExtra});
            this.totalVenta = 0;
            this.conceptosAPagar.forEach(co=>{
                this.totalVenta += co.Importe;
            });
        }else{
            swal('Error','Verifica que no hayas agregado ya este concepto o que tengas los campos requeridos','warning');
        }
        console.log('total',this.totalVenta);
    }
    borrarConcepto(obj){
        console.log('concepto',obj);
        let conceptosRestantes =  this.conceptosAPagar.filter(ob=> ob != obj);
        this.conceptosAPagar = conceptosRestantes;
        this.totalVenta = 0;
        this.conceptosAPagar.forEach(co=>{
            this.totalVenta += co.Importe;
        });
    }
    filtrarCliente = (text$: Observable<string>) =>
      text$.pipe( debounceTime(200), distinctUntilChanged(),
        map(term => term === ''?[]:this.nombresClientes.filter(ob => ob.toUpperCase().indexOf(term.toUpperCase()) > -1))
    );
    seleccionarCliente(selected){
        this.datosCliente =  this.clientesTodos.filter(ob=>ob.Nombre == selected.item.toString())[0];
        if(this.datosCliente.Terrenos.length == 1){
            this.datosTerreno = this.datosCliente.Terrenos[0];
        }
        if(this.datosCliente.Saldo_certificado == 0){
            let restantes2 = this.catalogoVentas.filter(ob=>ob.Codigo != '07');
            this.catalogoVentas = restantes2;
        }else{
            this._tipoOperacion();
        }
    }
    seleccionarTerreno(){
        if(this.idTerreno){
            let terreno = this.datosCliente.Terrenos.filter(ob=>ob.IdTerreno == this.idTerreno);
            console.log('terrenos',terreno);
            this.datosTerreno = terreno[0];
            this.mensualidadesPendientes = [];
            this.tipoIngresoExtra = 0;
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
            let tipoIngreso = this.catalogoVentas.filter(ob=> ob.Codigo == this.tipoIngresoExtra);
            tipo = `${tipoIngreso[0].Descripcion}`;
        }
        console.log('tipo');
        let cuenta = this.formasDePago.find(ob=>ob.IdCuenta == this.formaPago);
        let formaDePago = (cuenta.Nombre == 'Efectivo')?'Efectivo':'Tarjeta';
        let datosNuevoIngreso = { DatosUsuario: usuario, DatosCliente: this.datosCliente, DatosTerreno: this.datosTerreno, DatosMensualidad: this.datosMensualidad,
            DatosVenta: {Folio:this.folIngreso,IdCuenta:cuenta.IdCuenta , Recibo:this.folRecibo,TipoVenta:tipo,FormaPago:formaDePago,Concepto: this.conceptoIngreso,ConceptosPagados: this.conceptosAPagar , Total:this.totalVenta} };
            console.log('datos',datosNuevoIngreso);
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
    _nuevaVentaDatos(venta){
        let idVenta = 0;
        if(venta['Data'][0]){
            idVenta = venta['Data'][0].IdVenta;
        }
        this.folIngreso = `EXT-${idVenta+1}`;
        this.folRecibo =  idVenta+1;
        this.datosTerreno =  this.datosMensualidad = false;
        this.conceptosAPagar = [];
        this.datosCliente = {};
        this.idTerreno = 0;
        this.mensualidad = this.totalVenta = this.formaPago  = this.tipoIngresoExtra  = 0;
        this.conceptoIngreso =  this.etapaIngreso =  '';
        this.obtenerClientesActivos();
        this.VentaCompleta = false;
    }
    actualizarFolioMov(){
        let fol = this.folIngreso.split('-');
        //this.folIngreso = `${folAct}-${fol[1]}`;
        let tipoIngreso = this.catalogoVentas.filter(ob=> ob.Codigo == this.tipoIngresoExtra);
        this.conceptoIngresoExtra = tipoIngreso[0].Descripcion;
        this.totalIngresoExtra = this.datosCliente.Saldo_certificado;
    }
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
