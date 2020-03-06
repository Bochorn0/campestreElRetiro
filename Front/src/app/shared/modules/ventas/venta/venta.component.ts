import { Component, OnInit ,Input, ViewChild} from '@angular/core';
import { routerTransition } from '../../../../router.animations';
import { CatalogosService } from '../../../../shared/services/catalogos.service';
import { VentasService } from '../../../../shared/services/ventas.service'
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
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

    //
    datosCliente;mensualidadesPendientes;mensualidad;nombresClientes;datosTerreno;datosMensualidad;
    VentaCompleta;anualidadesPendientes;anualidad;
    //Formulario ingresos
    clientesTodos;today;terrenos;
    folIngreso;folRecibo;tipoIngreso;conceptoIngreso;etapaIngreso;abonoVenta;totalVenta;
    conceptosAPagar;total_abono;catalogoVentas;conceptoVenta;
    idTerreno ;formaPago;mostrarCuentas;cuentasDeposito;cuentaDestino;
    pdfRecibo;formaDePago;formasDePago;
    @Input('datosVenta')datosClienteVenta: any;
    constructor(private catalogosService : CatalogosService, private ventasService: VentasService) {
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
        this.catalogosService.obtenerCatalogoVentas().then(res=>{
            console.log('res',res);
            if(res['Data']){
                this.catalogoVentas =  res['Data'].filter(ob=>ob.Tipo == 'Abono');
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
            this.folIngreso = `VEN-${idVenta+1}`;
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
        let Mensualidad = false;
        let Anualidad = false;
        let existeTipo = this.conceptosAPagar.filter(ob=>ob.TipoMovimiento == this.tipoIngreso);
        let esAcumulable = false;
        if(!esAcumulable && this.tipoIngreso == '01'){
            esAcumulable = (this.conceptosAPagar.find(ob=>ob.Mensualidad.IdAdeudo == this.mensualidad))?false:true;
        } 
        if(!esAcumulable && this.tipoIngreso == '03'){
            esAcumulable = (this.conceptosAPagar.find(ob=>ob.Anualidad.IdAnualidad == this.anualidad))?false:true;
        }
        if(this.total_abono && !existeTipo[0] || esAcumulable){
            if(this.tipoIngreso == '01'){
                Mensualidad = this.mensualidadesPendientes.filter(ob => ob.IdAdeudo == this.mensualidad)[0];
                this.mensualidadesPendientes.filter(ob => ob.IdAdeudo == this.mensualidad)[0].Pagado = 1;
            }else if(this.tipoIngreso == '03'){
                Anualidad = this.anualidadesPendientes.filter(ob => ob.IdAnualidad == this.anualidad)[0];
                this.anualidadesPendientes.filter(ob => ob.IdAnualidad == this.anualidad)[0].Pagado = 1;
            }
            
            this.conceptoVenta += ` con un total de ${this.total_abono} al lote : ${this.datosTerreno.lote}, etapa : ${this.datosTerreno.etapa}, de campestre familiar ElRetiro.`;
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
        this.datosCliente =  this.clientesTodos.filter(ob=>ob.Nombre == selected.item.toString())[0];
        if(this.datosCliente.Terrenos.length == 1){
            this.datosTerreno = this.datosCliente.Terrenos[0];
        }
        if(this.datosCliente.Saldo_anualidad == 0){
            let restantes = this.catalogoVentas.filter(ob=>ob.Codigo != '03');
            this.catalogoVentas = restantes;
            console.log('se quito anualidad',restantes);
        }
        if(this.datosCliente.Saldo_adeudo == 0){

            let restantes2 = this.catalogoVentas.filter(ob=>ob.Codigo != '02');
            this.catalogoVentas = restantes2;           
            console.log('se quito enganche',restantes2);
        }
        if(this.datosCliente.Saldo_credito == 0){
            let restantes3 = this.catalogoVentas.filter(ob=>ob.Codigo != '01');
            this.catalogoVentas = restantes3;
            console.log('se quito mensualidad',restantes3);
        }
    }
    seleccionarTerreno(){
        if(this.idTerreno){
        let terreno = this.datosCliente.Terrenos.filter(ob=>ob.IdTerreno == this.idTerreno);
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
        this.obtenerClientesActivos();
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
    cambiarTotalesYConceptos(){
        let movimiento = this.conceptoVenta;
        let importe = this.total_abono;
        if(this.tipoIngreso == '01' && this.mensualidad){
            let seleccionada = this.mensualidadesPendientes.find(ob => ob.IdAdeudo == this.mensualidad);
            let datosMens =  this.datosCliente.Mensualidades.filter(ob => ob.IdTerreno == this.datosTerreno.IdTerreno);
            //movimiento = `Mensualidad # ${seleccionada.Num_pago}`;
            movimiento = `Mensualidad #${seleccionada.Num_pago} de ${datosMens.length}`;
            importe = this.total_abono = seleccionada.Importe;
        }else if(this.tipoIngreso == '03' && this.anualidad){
            let seleccionada = this.anualidadesPendientes.find(ob => ob.IdAnualidad == this.anualidad);
            let datosAnu =  this.datosCliente.Anualidades.filter(ob => ob.IdTerreno == this.datosTerreno.IdTerreno);
            //movimiento = `Anualidad # ${seleccionada.Num_pago}`;
            movimiento = `Anualidad #${seleccionada.Num_pago} de ${datosAnu.length}`;
            importe = this.total_abono =  seleccionada.Importe;
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
