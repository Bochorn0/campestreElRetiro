import { Component, OnInit ,Output , EventEmitter , ViewChild} from '@angular/core';
import { routerTransition } from '../../../../router.animations';
import { CatalogosService } from '../../../services/catalogos.service';
import { VentasService } from '../../../services/ventas.service';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import swal from 'sweetalert2';
import * as moment from 'moment';
@Component({
    selector: 'app-catalogo-clientes',
    templateUrl: './catalogo-clientes.component.html',
    styleUrls: ['./catalogo-clientes.component.scss'],
    animations: [routerTransition()],
    providers: [CatalogosService, VentasService]
})
export class CatalogoClientesComponent implements OnInit {
    parcelas;lotes;etapas;terrenos;clientesTodos;estatusTodos
    clienteDetalles;nombresClientes;detallesClienteVista;mantenimientoVista;clientesTodosTodos;
    clientesTodosVista;nombreCliente;mensualidadesVista;contenidoContrato;anualidadesVista;
    diaMantenimiento;importeMantenimiento;IdTerrenoMantenimiento;IdTerrenoContrato;mantenimientosTodos;
    idTerrenoMensualidad;datosDetalle;terrenoDatos;
    parcelaFiltro;loteFiltro;etapaFiltro;estatusFiltro;textoCliente;mantenimientosPagados;
    @Output() public nuevaOperacion = new EventEmitter();
    constructor(private catalogosService : CatalogosService, private ventasService: VentasService) {
        this.obtenerClientesActivos();
        this.clienteDetalles = {};
        this.idTerrenoMensualidad = this.IdTerrenoMantenimiento =  this.IdTerrenoContrato = 0;
        //this.parcelaFiltro = this.loteFiltro =this.etapaFiltro = 
        this.estatusFiltro = '0';
    }
    formatter = (result: string) => result.toUpperCase();
    filtrarCliente = (text$: Observable<string>) =>
    text$.pipe( debounceTime(200), distinctUntilChanged(),
      map(term => term === ''?[]:this.nombresClientes.filter(ob => ob.toUpperCase().indexOf(term.toUpperCase()) > -1))
    );
    filtrarParcelas = (text$: Observable<string>) =>
    
    text$.pipe( debounceTime(200), distinctUntilChanged(),
        map(term => term === ''?[]:this.parcelas.map(o=>o.parcela).filter(ob => ob.toUpperCase().indexOf(term.toUpperCase()) > -1))
    );    
    filtrarLotes = (text$: Observable<string>) =>
    text$.pipe( debounceTime(200), distinctUntilChanged(),
        map(term => term === ''?[]:this.lotes.map(o=>o.lote).filter(ob => ob.toUpperCase().indexOf(term.toUpperCase()) > -1))
    );    
    filtrarEtapas = (text$: Observable<string>) =>
    text$.pipe( debounceTime(200), distinctUntilChanged(),
        map(term => term === ''?[]:this.etapas.map(o=>o.etapa).filter(ob => ob.toUpperCase().indexOf(term.toUpperCase()) > -1))
    );    
    filtrarTerrenos(){
        let filtrados = this.clientesTodosTodos;
        //console.log('filtrados',filtrados);
        if((this.textoCliente) && filtrados){
            let coincidencias = [];
            filtrados.forEach((dat)=>{
                let validado = false;
                if(dat.Nombre.toString().toUpperCase().indexOf(this.textoCliente.toUpperCase()) > -1){
                    validado = true;
                }
/*                if(dat.Etapa.toString().toUpperCase().indexOf(this.textoCliente.toUpperCase()) > -1){
                    validado = true;
                }
                if(dat.Parcela.toString().toUpperCase().indexOf(this.textoCliente.toUpperCase()) > -1){
                    validado = true;
                }
                if(dat.Pertenece.toString().toUpperCase().indexOf(this.textoCliente.toUpperCase()) > -1){
                    validado = true;
                }
                if(dat.Lote.toString().toUpperCase().indexOf(this.textoCliente.toUpperCase()) > -1){
                    validado = true;
                }*/
                if(validado){ coincidencias.push(dat);}
            });
            filtrados = (coincidencias[0])?coincidencias:filtrados;
        }
        if(filtrados){
            let coincidencias = [];
            filtrados.forEach((dat)=>{
                let validado = false;
                if(dat.Terrenos[0]){
                    dat.Terrenos.forEach(ter=>{
                        if((this.etapas.find(o=>o.etapa == `${this.etapaFiltro}`))  && ter.etapa == this.etapaFiltro){
                            validado = true;
                        }
                        if((this.parcelas.find(o=>o.parcela == `${this.parcelaFiltro}`)) && ter.parcela == this.parcelaFiltro){
                            validado = true;
                        }
                        if(this.estatusFiltro != 0 && ter.Estado == this.estatusFiltro){
                            validado = true;
                        }
                        if((this.lotes.find(o=>o.lote == `${this.loteFiltro}`))  && ter.lote == this.loteFiltro){
                            validado = true;
                        }
                    });
                }
/*
                if(this.etapaFiltro != 0 && dat.Etapa.toString().toUpperCase().indexOf(this.etapaFiltro.toUpperCase()) > -1){
                    validado = true;
                }
                if(this.parcelaFiltro != 0 && dat.Parcela.toString().toUpperCase().indexOf(this.parcelaFiltro.toUpperCase()) > -1){
                    validado = true;
                }
                if(this.estatusFiltro != 0 && dat.Estado.toString().toUpperCase().indexOf(this.estatusFiltro.toUpperCase()) > -1){
                    validado = true;
                }
                if(this.loteFiltro != 0 && dat.Lote.toString().toUpperCase().indexOf(this.loteFiltro.toUpperCase()) > -1){
                    validado = true;
                }*/
                if(validado){ coincidencias.push(dat);}
            });
            filtrados = (coincidencias[0])?coincidencias:filtrados;
            let Terren = [];
            if(filtrados[0]){
                filtrados.forEach(f=>{
                    if(f.Terrenos[0]){
                        f.Terrenos.forEach(t=>{
//                            Terren.push({lote:t.Lote,etapa:t.Etapa,parcela:t.Parcela,Estado:t.Estado});
                            Terren.push(t);
                        });
                    }
                });
            }
            console.log('Terren',Terren);
            this._recorrerFiltros(Terren);
            this.clientesTodos =  filtrados;
        }
        

        // filtrados = (this.parcelaFiltro != '0')?filtrados.filter(f=>f.Parcela == this.parcelaFiltro):filtrados;
        // filtrados = (this.loteFiltro != '0')?filtrados.filter(f=>f.Lote == this.loteFiltro):filtrados;
        // filtrados = (this.etapaFiltro != '0')?filtrados.filter(f=>f.Etapa == this.etapaFiltro):filtrados;
        // filtrados = (this.estatusFiltro != '0')?filtrados.filter(f=>f.Estado == this.estatusFiltro):filtrados;        
    }


    campoNombre(){
        if(this.nombreCliente == ''){
            this.clienteDetalles = {};
            this.obtenerClientesActivos();
        }
    }
    filtrarMantenimientos(){
        if(this.clienteDetalles){
            console.log('mantenimientos',this.clienteDetalles.Mantenimientos);
            if(this.mantenimientosPagados){
                this.clienteDetalles.Mantenimientos = this.clienteDetalles.Mantenimientos_todos.filter(m=>m.Pagado == 'Si');
            }else{
                this.clienteDetalles.Mantenimientos = this.clienteDetalles.Mantenimientos_todos.filter(m=>m.Pagado != 'Si');
            }

        }
    }
    obtenerClientesActivos(){
        this._limpiarPantallas(); 
        this.catalogosService.clientesTerrenos().then(res=>{
            this.terrenos =  res['Data'];
            return this.catalogosService.clientesActivos();
        }).then(resCli=>{
            this.clientesTodosTodos = this.clientesTodos =  this._ordenarDatosCliente(resCli['Data']);
            console.log('clientes',this.clientesTodos);
            this.nombresClientes = resCli['Data'].map((key)=>{
                return key.Nombre;
            })
            this.clientesTodosVista = true;
        }).catch(err=>{console.log('err',err);});
    }
    _ordenarDatosCliente(datos){
        let datosOrdenados =  [];
        let Parcela;let Lote;let Etapa;let Estado
        Parcela = Lote = Etapa = Estado = '-';
        this._recorrerFiltros(this.terrenos);
        datos.forEach(dat=>{
            let ter =  this.terrenos.filter(ob => ob.IdCliente ==  dat.IdCliente);
//            console.log('dat',dat);
            if(!ter[0]){
                ter =  {IdTerreno:0,Parcela,Etapa,Lote,Estado}
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
    _recorrerFiltros(datos){
        this.parcelas = []; this.lotes = []; this.etapas = []; this.estatusTodos = [];
        console.log('para filt',this.terrenos);
        if(datos){
            datos.forEach(d=>{
                let existePar = this.parcelas.find(pa=>pa.parcela == d.parcela);
                if(!existePar){
                    this.parcelas.push({parcela:d.parcela});
                }
                let existeEta = this.etapas.find(pa=>pa.etapa == d.etapa);
                if(!existeEta){
                    this.etapas.push({etapa:d.etapa});
                }
                let existeLot = this.lotes.find(pa=>pa.lote == d.lote);
                if(!existeLot){
                    this.lotes.push({lote:d.lote});
                }
                let existeEst = this.estatusTodos.find(pa=>pa.Estatus == d.Estado);
                if(!existeEst){
                    this.estatusTodos.push({Estatus:d.Estado});
                }
            });
        }
    }
    ngOnInit() {}
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
        this.detallesClienteVista = true;
    }
    estadosCuenta(nombre){
        this._limpiarPantallas();
        let coincidencias = (nombre)?this.clientesTodos.filter(ob=> ob.Nombre == nombre)[0]:{};
        this.clienteDetalles = (this.clienteDetalles && !nombre)?this.clienteDetalles:coincidencias;
        this.mensualidades();
        console.log('clientes',this.clienteDetalles);
//        this.detallesClienteVista = true;
    }
    filtrarTerrenosMensualidad(){
        this.clienteDetalles.Terrenos.forEach(t=>{
            if(this.idTerrenoMensualidad != 0){
                t.TerrenoMostrar = (t.IdTerreno == this.idTerrenoMensualidad)?false:true;
            }else{
                t.TerrenoMostrar = false;
            }
        });
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
                    this.clienteDetalles.Mensualidades = men['Data'].filter(m=>m.Pagado != 'Si');
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
            datosOrdenados.push({Fecha: moment(da.Fecha).format('LL'), Fecha_ultimo_abono: da.Fecha_modificacion, Importe:da.Importe, Abonado: (da.ImportePagado)?da.ImportePagado:0 ,Pagado : pagado, Restante: da.Pendiente, ObjCompleto: da});
        });
        return datosOrdenados;
    }
    mantenimientos(){
        let cliente = this.clienteDetalles;
        //this._limpiarPantallas();
        if(cliente.IdCliente){
            this.ventasService.obtenerMantenimientosCliente(cliente).then(man=>{
                let mant = this._ordenarDatosMensualidad(man['Data']);
                if(mant[0]){
//                    this.mantenimientosTodos = {Datos: this._ordenarDatosMensualidad(ma)};
                    this.clienteDetalles.Mantenimientos = mant.filter(m=>m.Pagado != 'Si');
                    this.clienteDetalles.Mantenimientos_todos = mant;
                    this.mantenimientoVista = true;
                }
            })
        }
    }
    
    _limpiarPantallas(){
        this.clienteDetalles = this.clientesTodosVista = this.detallesClienteVista = this.mensualidadesVista = this.anualidadesVista = this.mantenimientoVista = false;
    }
    actualizarDatosCliente(){
        let datosAlert = {Titulo: 'Cuidado', 
        Contenido: 'Estas a punto de actualizar los datos de cliente, estas de acuerdo?', 
        Tipo: 'warning',Confirm: 'Si Guardar'};
        let datosClientes = this.clienteDetalles;
        this._confirmarModal(datosClientes,datosAlert).then(res=>{
            return this.catalogosService.actualizarDatosCliente(datosClientes);
        }).then(resu=>{
            this.obtenerClientesActivos();
            let tipo = resu['Tipo'];
            swal('Exito', `${resu['Operacion']}`, tipo);

        }).catch(err=>{console.log('err',err);})
    }
    cambiarTazasMantenimiento(){
        if(this.IdTerrenoMantenimiento){
            let datosMantenimiento = this.clienteDetalles.Terrenos.filter(ob=>ob.IdTerreno == this.IdTerrenoMantenimiento)[0];
            this.diaMantenimiento = datosMantenimiento.Dia_mantenimiento; 
            this.importeMantenimiento =  datosMantenimiento.Importe_mantenimiento;
        }
    }
    actualizarDatosMantenimiento(){
        let datosAlert = {Titulo: 'Cuidado', 
        Contenido: 'Al actualizar los datos de mantenimiento, se cambian los datos programados para el cobro de mantenimientom estas de acuerdo ? ', 
        Tipo: 'warning',Confirm: 'Si Guardar'};
        let datosMantenimiento = {IdCliente:this.clienteDetalles.IdCliente, IdTerreno:this.IdTerrenoMantenimiento,Importe: this.importeMantenimiento, Dia: this.diaMantenimiento };
        this._confirmarModal(datosMantenimiento,datosAlert).then(res=>{
            return this.catalogosService.actualizarDatosMantenimiento(datosMantenimiento);
        }).then(resu=>{
            let tipo = resu['Tipo'];
            swal('Exito', `${resu['Operacion']}`, tipo);
        }).catch(err=>{console.log('err',err);})
    }
    nuevaVenta(cliente){
        if(cliente){
            this.nuevaOperacion.emit({Operacion:1, cliente});
        }
    }
    nuevoMantenimiento(cliente){
        if(cliente){
            this.nuevaOperacion.emit({Operacion:2, cliente});
        }
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
    guardarContrato(){
        let datosTerreno = this.clienteDetalles.Terrenos.filter(ob=>ob.IdTerreno == this.IdTerrenoContrato)[0];
        let datosGuardar = {Contenido:this.contenidoContrato, datosCliente :this.clienteDetalles,datosTerreno:datosTerreno,Ext: 'html'};
        this.ventasService.guardarContrato(datosGuardar).then(res=>{
            swal('Exito',`el contrato fue guardado con exito`,'success');
        }).catch(err=>{console.log('err',err);
            swal('Error',`ocurrio un error al guardar el contrato favor de verificar los datos`,'error');
        })
        
    }
    confirmarBorrarCliente(cliente){
        return new Promise ((resolve,reject)=>{
            swal({ title: 'Introduce el codigo del cliente para confirmar',
              html: ``,
              input:'text',
              type: 'warning',
              showCancelButton: true,
              cancelButtonColor:'#D33',
              confirmButtonText: 'Confirmar'
            }).then((result)=>{
              if(result.value == cliente.Codigo){
                return this.ventasService.borrarCliente(cliente);
              }else{
                return Promise.reject({error:false});
              }
            }).then((termino)=>{
                swal('Exito', `Haz Eliminado el cliente ${cliente.Nombre} correctamente`,'success');
                this.obtenerClientesActivos();
            }).catch((err)=>{
                console.log('cancelar');
            });
        });
    }
    confirmarModificacionCotizacion(){
        let datosAlert = {Titulo :'Cuidado',
        Contenido:'Estas a punto de modificar la cotizacion inicial del cliente, por lo que se borrara la antigua y a partir de tu nueva cotizacion se generaran las nuevas fechas de pago y montos que especifiques, esta accion no se puede deshacer y afectara el saldo futuro y mensualidades del cliente.',
        Tipo: 'warning',
        Confirm: 'Acepto'
        };
        this._confirmarModal({},datosAlert).then(res=>{
            this.nuevaOperacion.emit({Operacion:3});
        });
    }
    EditarCliente(){
        console.log('detalle',this.clienteDetalles);
        let totalTerrenos =  this.clienteDetalles.Terrenos.length;
        console.log('totalTerrenos',totalTerrenos);
        
        this.clienteDetalles.Terrenos.forEach(t=>{
            t.Estado = (t.Estado)?t.Estado:'SIN ESTADO';
            console.log('tCOT',t);
//            t.Cotizacion = t;
            t.Cotizacion = {};
            let Mensualidad = (this.clienteDetalles.Mensualidades)?this.clienteDetalles.Mensualidades.filter(o=>o.Pagado != 1 && o.Pendiente == 0):[];
            let Anualidad = (this.clienteDetalles.Anualidades)?this.clienteDetalles.Anualidades.filter(o=>o.Pagado != 1):[];
            t.Cotizacion.Enganche_Actual = this.clienteDetalles.Saldo_adeudo/totalTerrenos;
            t.Cotizacion.ImporteMantenimiento = this.clienteDetalles.Monto_mantenimiento/totalTerrenos;
            t.Cotizacion.Num_pagos_Actual = (Mensualidad[0])?Mensualidad.length:0;
            t.Cotizacion.Mensualidad = (Mensualidad[0])?Mensualidad[0].Importe:0;
            t.Cotizacion.Anualidad = (Anualidad[0])?Anualidad[0].Importe:0;
            t.Cotizacion.Num_pagos_anualidad_Actual = (Anualidad[0])?Anualidad.length:0;
            t.Cotizacion.Fecha_inicio = (Mensualidad[0])?Mensualidad[0].Fecha.split('T')[0]:'-';
            t.Cotizacion.Fecha_inicio_anualidad = (Anualidad[0])?Anualidad[0].Fecha.split('T')[0]:'-';
            t.Cotizacion.Periodo_cobro = (t.Cotizacion.Periodo_cobro)?t.Cotizacion.Periodo_cobro:(this.clienteDetalles.Periodo_mantenimiento)?this.clienteDetalles.Periodo_mantenimiento:'-';
            t.Cotizacion.PeriodoCobro = (t.Cotizacion.Periodo_cobro)?t.Cotizacion.Periodo_cobro:(this.clienteDetalles.Periodo_mantenimiento)?this.clienteDetalles.Periodo_mantenimiento:'-';
            t.Cotizacion.Saldo_agua = this.clienteDetalles.Saldo_agua;
            t.Cotizacion.SaldoCertificado = this.clienteDetalles.Saldo_certificado/totalTerrenos;
            t.Cotizacion.FechaMantenimiento = this.clienteDetalles.Fecha_primer_mantenimiento.split('T')[0]
//            t.Cotizacion.ImporteMantenimiento = this.clienteDetalles.Saldo_agua;
        })
        this.clienteDetalles.ImporteMantenimiento = this.clienteDetalles.Monto_mantenimiento;
        this.clienteDetalles.Fecha_mantenimiento = this.clienteDetalles.Fecha_primer_mantenimiento;
        this.clienteDetalles.Periodo_cobro = this.clienteDetalles.Periodo_mantenimiento;
        if(this.clienteDetalles.IdCliente){
            this.ventasService.obtenerMantenimientosCliente(this.clienteDetalles).then(man=>{
                let mant = this._ordenarDatosMensualidad(man['Data']);
                if(mant[0]){
//                    this.mantenimientosTodos = {Datos: this._ordenarDatosMensualidad(ma)};
                    this.clienteDetalles.Mantenimientos = mant.filter(m=>m != 1);
                    this.clienteDetalles.Mantenimientos_todos = mant;
                }
            })
        }

        this.datosDetalle =  this.clienteDetalles;
        
    }
    enviarContratoCorreo(){
        return new Promise ((resolve,reject)=>{
        let datosModal =  {Titulo: 'Advertencia',Contenido:`Vas a Enviar el contrato por correo, estas seguro?`, Tipo:'warning', Confirm: 'Si Enviar'}  
        return this._confirmarModal({},datosModal).then(da=>{
            let contenido = `<!DOCTYPE html><html><head><title>Recibo</title></head><body>${this.contenidoContrato}</body></html>`;
            let datosCorreo =  {Para: `bocho_sup@hotmail.com`, Contenido: contenido, Asunto: `Contrato`}
            return this.ventasService.enviarReciboCorreo(datosCorreo);
        }).then(res=>{
            return resolve({});
        }).catch(err=>{console.log('err',err); return resolve({});});
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
}