import { Component, OnInit ,ViewChild } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ContabilidadService } from '../../shared/services/contabilidad.service';
import { CatalogosService } from '../../shared/services/catalogos.service';
import {Observable} from 'rxjs';
import * as XLSX from  'xlsx';
import * as FileSaver from 'file-saver';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import swal from 'sweetalert2';
import * as moment from 'moment';

//const moment =  require('moment');
@Component({
    selector: 'app-egresos',
    templateUrl: './egresos.component.html',
    styleUrls: ['./egresos.component.scss'],
    animations: [routerTransition()],
    providers: [ContabilidadService,CatalogosService]
})
export class EgresosComponent implements OnInit {
    frmSolicitud: FormGroup; // Formulario de solicitud
    vistaCentro;datosGastos;totalGasto;conceptoGasto;tipoGasto;altaNuevoGasto;folGasto;
    responsable;empladosActivos;nombresEmpleados;tipoGastoFiltro;catalogoGastos;gastosTodos;
    fInicio;fFin;tiposGastos;formaDePago;fuenteGasto;egresoAdjunto;egresoAdjuntoNombre;
    formularioCatalogoCategorias;catalogoCategorias;notaGasto;
    file_archivo;subcategoriasFiltro;subcategoria_;categoria_;categoriasFiltro;fechaGasto;
    nuevaCat;nuevaSub;nombreSubcategoria;gastosPorCategoria;
    panelVisualizar;filtrosGastos;
    categoriasSelect = [];subcategoriasSelect = [];
    @ViewChild('datatableGastos')datatableGastos;
    @ViewChild('datatableCategorias')datatableCategorias;
    @ViewChild('datatableSubcategorias')datatableSubcategorias;
    chksGastos = [];
    datosCategorias = [] ;datosSubcategorias = [];categoriaAlta;nombreCategoria;idCategoriaPadre;subcategoriaAlta;
    categoriaGasto;subcategoriaGasto;totalGastoAcumulado;verCategorias
    constructor(private contabilidadService: ContabilidadService, private catalogosService: CatalogosService,private fb: FormBuilder) {
        this.responsable = '0';
        this.altaNuevoGasto = false;
        this.nuevaCat = this.nuevaSub = false;
        this.categoriaAlta = this.subcategoriaAlta = false;
        this.formularioCatalogoCategorias = false;
        this.tipoGastoFiltro = this.categoriaGasto = this.subcategoriaGasto = this.fuenteGasto = "0";
        this.categoria_ = this.subcategoria_ = this.idCategoriaPadre = this.subcategoriaGasto = 0;
        // this.fInicio = `${moment().format('YYYY')}-01-01`;
        // this.fFin =  moment().format('YYYY-MM-DD');
        this._obtenerEmpleados();
        //this._obtenerCatalogoGastos();
        this._formasDePago();
        this._obtenerCatalogoCategorias();
        this.frmSolicitud = fb.group({
            'File': [null]
        });
        this.panelVisualizar = 'Ayuda';
    }
    subcategorias = [];
    _obtenerCatalogoCategorias(){
        this.catalogosService.obtenerCatalogoCategorias().then(res=>{
            let datosCats = res['Data'];
            this.catalogoCategorias = datosCats;
            this.datosCategorias = datosCats.Categorias;
            this.datosSubcategorias = this._ordenarRelacionadas(datosCats.Relacionadas);
        }).catch(err=>{console.log('err',err);});
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
            this.formaDePago = datos;
            console.log('formas',this.formaDePago);
        }).catch(err=>{console.log('err',err);});
    }
    _obtenerCatalogoGastos(){
        this.catalogosService.obtenerCatalogoGastos().then(res =>{
            this.catalogoGastos =  res['Data'];
            let catalogo_ = [];
            this.catalogoGastos.forEach(tips=>{
                catalogo_.push(tips.Tipo);
            });
            this.tiposGastos =  catalogo_;
        }).catch(err=>{console.log('err',err);});
    }
    _obtenerEmpleados(){
        this._limpiarVistaYVariables();
        this.catalogosService.obtenerEmpleados().then(res =>{
            this.vistaCentro = true;
            this.empladosActivos =  { Datos : res['Data']};
            this.nombresEmpleados = res['Data'].map((key)=>{
                return key.Nombre;
            });
        }).catch(err=>{this._limpiarVistaYVariables();});
    }
    // filtrarGastos = (text$: Observable<string>) =>
    // text$.pipe( debounceTime(200), distinctUntilChanged(),
    //   map(term => term === ''?[]:this.tiposGastos.filter(ob => ob.toUpperCase().indexOf(term.toUpperCase()) > -1))
    // );
    filtrarFuentes = (text$: Observable<string>) =>
    text$.pipe( debounceTime(200), distinctUntilChanged(),
      map(term => term === ''?[]:this.formaDePago.filter(ob => ob.toUpperCase().indexOf(term.toUpperCase()) > -1))
    );
/*    filtrarResponsables = (text$: Observable<string>) =>
      text$.pipe( debounceTime(200), distinctUntilChanged(),
        map(term => term === ''?[]:this.nombresEmpleados.filter(ob => ob.toUpperCase().indexOf(term.toUpperCase()) > -1))
      );*/
    ngOnInit() {}
    nombreArchivo(event){
        let file: File = event.target.files[0];
        let renderFile: FileReader = new FileReader();
            this.egresoAdjuntoNombre = file.name; this.egresoAdjunto = file;
            renderFile.readAsDataURL(file);
            renderFile.onloadend = () => {
                if (renderFile.result) { this.egresoAdjunto =  renderFile.result }
            }
    }
    nuevoGasto(){
        //Gasto nuevo 
        this._limpiarVistaYVariables();
        this._delay(100).then(res=>{
            this.altaNuevoGasto =  (this.altaNuevoGasto)?false:true;
            this.vistaCentro= true;
            this.contabilidadService.obtenerFolioGasto().then(res=>{
                let idGas =  0;
                if(res['Data'][0]){
                    idGas = res['Data'][0].IdGasto;
                }
                this.folGasto = `GAS-${idGas+1}`;
            }).catch(err=>{
                swal('Error','Ocurrio un problema al obtener el folio automatico, solicita apoyo en soporte','error');
            })
        })
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
    importar_excel($event): void {
        let fileObject;
        let file: File = $event.target.files[0];
        let nom = file.name.split('.');
        let compExt = `${nom[nom.length-1]}`;
            if(compExt.toUpperCase() != 'XLSX'){
                swal('error','El formato del archivo no es valido debe ser xlsx ','error');
            }else{
            this.importarArchivo($event).then((resultado: any) => {
                //console.log('resu',resultado);
                if (resultado) {
                    fileObject = { file: resultado.substring(78), Tipo: `Gasto`, Ext: compExt}
                }
                this.frmSolicitud.controls["File"].setValue(null);
                return this.contabilidadService.subirExcelPartidas(fileObject);
            }).then(res=>{
    //            console.log('res',res);    
                let tipo = res['Tipo'];
                swal('Exito', `${res['Operacion']}`, tipo);
                this.chksGastos = [];
                return this._delay(1000);
            }).then(re=>{
                this.obtenerGastos();
            }).catch(error => {
                console.log('error',error);
            });
        }
    }
    modificarGasto(){
        //Modificar Gasto
    }
    guardarNuevoGasto(){
        //this._limpiarVistaYVariables();
        let usuario = JSON.parse(localStorage.getItem('Datos'));
        let error = this._validarGastos();
        if(error){
            swal('Error', `${error}`, 'error');
        }else{
        let cuenta = this.formaDePago.find(ob=>ob.Nombre == this.fuenteGasto);
        let formaPago = (cuenta.Nombre == 'Efectivo')?'Efectivo':'Tarjeta';
//        let tipoGasto =  this.subcategorias.find(ob=>ob.IdSubcategoria == this.subcategoriaGasto).Subcategoria;
        let datosGuardar =  { Usuario:usuario, Concepto: this.conceptoGasto,Nota:this.notaGasto,Categoria :this.categoriaGasto,Subcategoria:this.subcategoriaGasto , Responsable:this.responsable, Total : this.totalGasto, Tipo :this.subcategoriaGasto,FormaPago:formaPago,IdCuenta:cuenta.IdCuenta , Adjunto:this.egresoAdjunto, Fecha_gasto: this.fechaGasto}
        console.log('datos guardar gasto',datosGuardar);
            this.contabilidadService.guardarNuevoGasto(datosGuardar).then(dat =>{
                swal('Exito', 'Gasto guardado correctamente', 'success');
                this._limpiarVistaYVariables();
                this.obtenerGastos();
            }).catch(err=>{
                console.log('error obtener gastos', err);
            })
        }
    }
    _validarGastos(){
        if(!this.categoriaGasto){
            return 'Debes de escoger al menos una Categoria para el gasto';
        }else if(!this.subcategoriaGasto){
            return 'Debes de escoger al menos una Subcategoria para el gasto';
        }else if(this.totalGasto == '' || this.totalGasto == null ||  this.totalGasto == 0){
            return 'Debes de especificar un total que sea mayor que cero';
        }else if(!this.fuenteGasto){
            return `Debes seleccionarl al menos una cuenta`;
        }else if(this.conceptoGasto == '' || this.conceptoGasto == null){
            return 'Debes de especifica un concepto para el gasto';
        }else if(this.responsable == '' || this.responsable == null){
            return 'Debes de especificar al menos un responsable';
        }
        return ``;
    }
    obtenerGastos(){
        this._limpiarVistaYVariables();
        this.contabilidadService.obtenerGastos().then(res =>{
//            this.gastosTodos = res['Data'];
            this.panelVisualizar = 'Gastos';
            //(let gastosOrdenados = (res['Data'])?this._ordenarDatosGastos(res['Data']):[{Resultados:'No existen Gastos registrados'}];
            let gastosOrdenados = (res['Data'])?this._ordenarDatosGastos(res['Data']):[];
            this.gastosTodos = this.datosGastos = gastosOrdenados;
            this.gastosPorCategoria  = this._gastosPorCategoria(gastosOrdenados);
            console.log('datos',this.datosGastos);
            // this.datosGastos = { Opciones:{Eliminar:true, Seleccionar: true}, Datos: gastosOrdenados};
            // if(this.datatableGastos != null){
            //     this.datatableGastos._reiniciarRegistros(this.datosGastos);
            // }
            this.vistaCentro=true;
        }).catch(err=>{
            console.log('error obtener gastos', err);
            this._limpiarVistaYVariables();
        })
    }
    _ordenarDatosGastos(datos){
        let datosOrdenados = [];
        if(datos.length > 1){
            let arrayFechas = datos.map( (d) => moment(d.Fecha_gasto));
            let str = ``;
            console.log('array fechas',arrayFechas);
            arrayFechas.forEach(a=>{
                str += `${a},`;
            })
            this.fInicio = moment.min(arrayFechas).format('YYYY-MM-DD');
            this.fFin = moment.max(arrayFechas).format('YYYY-MM-DD');
        }
        this.categoriasFiltro = [];
        this.subcategoriasFiltro = [];
        datos.forEach(d=>{
            let exis_c = this.categoriasFiltro.find(ob=>ob.Categoria == d.Categoria);
            if(!exis_c){ this.categoriasFiltro.push({Categoria:`${d.Categoria}`});}
            let exis_s = this.subcategoriasFiltro.find(ob=>ob.Subcategoria == d.Subcategoria);
            if(!exis_s){ this.subcategoriasFiltro.push({Subcategoria:`${d.Subcategoria}`});}
            datosOrdenados.push({"Folio": `${d.Folio_gasto}${d.IdGasto}`, 
            Responsable : d.Responsable,
            Concepto:d.Concepto,
            Categoria: d.Categoria,
            Subcategoria: d.Subcategoria,
            Fecha:d.Fecha_gasto, 
            "Forma de Pago":d.Forma_pago, 
            Total: d.Total,
            ObjCompleto : d
            });
        });
        console.log('tipos',this.tiposGastos);
        return datosOrdenados;
    }
    _gastosPorCategoria(datos){
        let datosOrdenados = [];
        this.subcategoriasFiltro = [];
        this.totalGastoAcumulado = 0;
        datos.forEach(d=>{
            this.totalGastoAcumulado += d.Total;
            let exis_s = this.subcategoriasFiltro.find(ob=>ob.Subcategoria == d.Subcategoria);
            if(!exis_s){ this.subcategoriasFiltro.push({Subcategoria:`${d.Subcategoria}`});}
            let existe =  datosOrdenados.find(dd=>dd.Categoria == d.Categoria);
            if(!existe){
                datosOrdenados.push({Categoria: d.Categoria, Pagina:d.Categoria, IdCategoria : d.IdCategoria, Gastos : datos.filter(dd=>dd.Categoria == d.Categoria)});
            }
        });
        return datosOrdenados;
    }
    borrarMultiplesGastos(){
        if(this.chksGastos.length > 0){
            console.log('chks',this.chksGastos);
            let gas_ids = ``;
            this.chksGastos.forEach(c=>{
                gas_ids += `${c.IdGasto},`;
            });
            gas_ids = (gas_ids.indexOf(',') > -1)?gas_ids.slice(0,-1):gas_ids;
            let datosEliminar =  {Ids: gas_ids};
            let datosModal = {Titulo:'Cuidado',Contenido: `Estas a punto de eliminar todos estos gastos, esta operación no se puede deshacer, deseas continuar ? `, Tipo:'warning',Confirm:'Si Continuar'};
            this._confirmarModal(datosModal).then(re=>{
                return  this.contabilidadService.borrarMultiplesGastos(datosEliminar);
            }).then(res=>{
                this.obtenerGastos();
            }).catch(err=>{
                console.log('error obtener gastos', err);
                this._limpiarVistaYVariables();
            });
        }else{
            swal('Error','Debes seleccionar al menos un gasto para usar este boton', 'error');
        }
    }
    filtrarGastos(){
        let restantes = this.gastosTodos;
        restantes = (this.fInicio)?restantes.filter(ob=> moment(ob.Fecha).format('YYYY-MM-DD') >=  this.fInicio):restantes;
        restantes = (this.fFin)?restantes.filter(ob=> moment(ob.Fecha).format('YYYY-MM-DD') <=  this.fFin):restantes;
        let subcategos_permitidas = [];
        if(this.categoriasSelect[0]){
            let filtradosCategorias = [];
            this.categoriasSelect.forEach(c=>{
                restantes.forEach(g=>{
                    if(g.Categoria == c){
                        filtradosCategorias.push(g);
                    }
                });
            });
            restantes = filtradosCategorias;
            subcategos_permitidas = restantes.map((sp)=>sp.Subcategoria);
            if(this.subcategoriasSelect[0]){
                this.subcategoriasSelect.forEach(ss=>{
                    if(!subcategos_permitidas.find(sp=>sp == ss)){
                        this.subcategoriasSelect = [];
                    }
                });
            }
        }
        if(this.subcategoriasSelect[0]){
            let filtradosCategorias = [];
            this.subcategoriasSelect.forEach(s=>{
                restantes.forEach(g=>{
                    if(g.Subcategoria == s){
                        filtradosCategorias.push(g);
                    }
                });
            });
            restantes = filtradosCategorias;
        }
        this.gastosPorCategoria = this._gastosPorCategoria(restantes);
        // this.datosGastos = { Opciones:{Eliminar:true}, Datos: this._ordenarDatosGastos(restantes)};
        // console.log('datosGastos',this.datosGastos);
        
        // if(this.datatableGastos != null){
        //     this.datatableGastos._reiniciarRegistros(this.datosGastos);
        // }
        // this.datosGastos = { Opciones:{Eliminar:true}, Datos: this._ordenarDatosGastos(restantes)};
    }
    _limpiarVistaYVariables(){ 
        this.verCategorias = this.categoriaAlta = this.subcategoriaAlta = this.vistaCentro = this.datosGastos = this.altaNuevoGasto =  this.formularioCatalogoCategorias = false ;
        this.panelVisualizar = this.notaGasto = this.conceptoGasto=  this.nombreCategoria = this.nombreSubcategoria = '';
          
        this.responsable = this.fuenteGasto = this.categoriaGasto = this.subcategoriaGasto = this.totalGasto = this.idCategoriaPadre = 0;

    }
    activarTodosChk(s){
//        console.log('s',s);
        s.Gastos.map(g=>g.Chk = s.ChkTodos);
        this.cambiarChkGastos();
    }
    cambiarChkGastos(){
//        console.log('gastosPorCategoria',this.gastosPorCategoria);
        this.chksGastos = [];
        this.gastosPorCategoria.forEach(g=>{
            g.Gastos.forEach(gg=>{
                if(gg.Chk){
                    this.chksGastos.push(gg);
                }
            });
        });
        console.log('gastos',this.chksGastos);
    }
    borrarGasto(obj){
        this.contabilidadService.borrarGasto(obj).then( res=>{
            let movsRes = this.datosGastos.filter(ob => ob != obj.ObjCompleto);
            this.datosGastos = movsRes;
            //this.obtenerGastos();
        }).catch(err=>{
            console.log('error obtener gastos', err);
        })
    }
    verCatalogoCategorias(event){
        console.log('entro');
        this._limpiarVistaYVariables();
        this.catalogosService.obtenerCatalogoCategorias().then(res=>{
            let datosCats = res['Data'];
            console.log('datosCats',datosCats);

            //this.catalogoCategorias = res['Data'];
            // let datosCat = this._ordenarCats(res['Dats']);
            // let datosSub = this._ordenarSubs(res['Dats']);
            // let datosCat = {Opciones:{Eliminar:true,Editar:true},Datos: this._ordenarCats(this.catalogoCategorias)};
            // let datosSub = {Opciones:{Eliminar:true,Editar:true},Datos: this._ordenarSubs(this.catalogoCategorias)};
            // if(this.datatableCategorias != null){
            //     this.datatableCategorias._reiniciarRegistros(datosCat);
            // }
            this.datosCategorias = datosCats.Categorias;
            console.log('datosCategorias',this.datosCategorias);
            // if(this.datatableSubcategorias != null){
            //     this.datatableSubcategorias._reiniciarRegistros(datosSub);
            // }
            this.datosSubcategorias = this._ordenarRelacionadas(datosCats.Relacionadas);
            console.log('datosSubcategorias',this.datosSubcategorias);
            this.vistaCentro = true;
            this.verCategorias = true;
            console.log('cat',this.datosCategorias);
        }).catch(err=>{
            console.log('error obteniendo catalogo', err);
        })
    }
    _ordenarRelacionadas(datos){
        console.log('datos',datos);
        let datosOrdenados = [];
        datos.forEach(d=>{
            let existe =  datosOrdenados.find(dd=>dd.Categoria == d.Categoria);
            if(!existe){
                datosOrdenados.push({Categoria: d.Categoria, IdCategoria:d.IdCategoria , Subcategorias : datos.filter(dd=>dd.IdCategoria == d.IdCategoria)});
            }
        });
        return datosOrdenados;
    }
    editarCategoria(ev){
        let datosActualizar =  {IdCategoria: ev['Obj'].IdCategoria, Categoria: ev['Categoria']};
        console.log('datosActualizar',datosActualizar); 
        this.catalogosService.actaulizarCategorias(datosActualizar).then(re=>{
            this.verCatalogoCategorias({});
        }).catch(err=>{
            console.log('error obteniendo catalogo', err);
        })
    }
    editarSubcategoria(ev){
        console.log('ev',ev); 
        let datosCat = this.catalogoCategorias.TodasPadres.find(c=>c.Categoria == ev['Categoria']);
        if(datosCat){
            let datosActualizar =  {IdCategoria: ev['Obj'].IdSubcategoria, Categoria: ev['Subcategoria'],IdPadre:datosCat.IdCategoria};
            console.log('datosActualizar',datosActualizar);
            this.catalogosService.actaulizarCategorias(datosActualizar).then(re=>{
                this.verCatalogoCategorias({});
            }).catch(err=>{
                console.log('error obteniendo catalogo', err);
            })
        }else{
            swal('Error', 'La categoria especificada no existe','error');            
        }
    }
    nuevaCategoria(){
        //this._limpiarVistaYVariables();
        this.subcategoriaAlta = false;
        this.idCategoriaPadre = 0;
        this.nombreCategoria = '';
        this.categoriaAlta = true;
    }
    nuevaSubcategoria(){
        //this._limpiarVistaYVariables();
        this.categoriaAlta = false;
        this.idCategoriaPadre = 0;
        this.nombreCategoria = '';
        this.subcategoriaAlta = true;
    }
    obtenerPlantillaGastos(){
        this.catalogosService.obtenerPlantillaGastos().then( res=>{
            console.log('res',res);
            this.descargarPlantilla(res['String'], 'Plantilla_gastos_');
        }).catch(err=>{
            console.log('error al obtener plantilla', err);
        })
    }
    
    generarFormatoEgresos(){
        let datosGenerales = [];
        datosGenerales.push(['Fecha','Cuenta','Categoría','Subcategorías','Descripción','USD','Ingreso/Gasto','Nota']);
        datosGenerales.push(['2019/11/01','Efectivo','publicidad','empresa','Carlos Ramos','6000','Gasto','NOTA PRUEBA']);
        let worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(datosGenerales);
        let workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        let excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        let datas: Blob = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});
        FileSaver.saveAs(datas, 'FORMATO_GASTOS.xlsx');

        // let nombre = "Plantilla_gastos_";
        // let dwldLink = document.createElement("a");
        // let url = 'data:application/vnd.ms-excel;base64,' + data;
        // let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
        // if (isSafariBrowser) {
        //     dwldLink.setAttribute("target", "_blank");
        // }
        // dwldLink.setAttribute("href", url);
        // dwldLink.setAttribute("download", `${nombre}${new Date().toLocaleDateString()}.xlsx`);
        // dwldLink.style.visibility = "hidden";
        // document.body.appendChild(dwldLink);
        // dwldLink.click();
        // document.body.removeChild(dwldLink);
        
    }
    descargarPlantilla(data, nombre = "Plantilla_gastos_") {
        let dwldLink = document.createElement("a");
        let url = 'data:application/vnd.ms-excel;base64,' + data;
        let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
        if (isSafariBrowser) {
            dwldLink.setAttribute("target", "_blank");
        }
        dwldLink.setAttribute("href", url);
        dwldLink.setAttribute("download", `${nombre}${new Date().toLocaleDateString()}.xlsx`);
        dwldLink.style.visibility = "hidden";
        document.body.appendChild(dwldLink);
        dwldLink.click();
        document.body.removeChild(dwldLink);
    }
    guardarCategoriaNueva(){
        let datos =  {Categoria: this.nombreCategoria, IdPadre: 0};
        this.catalogosService.guardarNuevaCategoria(datos).then(res=>{
            let tipo = res['Tipo'];
            swal('Exito', `${res['Operacion']}`, tipo);
            this._limpiarVistaYVariables();
            this.verCatalogoCategorias({});
        }).catch(err=>{
            console.log('error obteniendo catalogo', err);
        });
    }
    guardarSubcategoriaNueva(){
        let datos =  {Categoria: this.nombreSubcategoria, IdPadre: this.idCategoriaPadre};
        this.catalogosService.guardarNuevaCategoria(datos).then(res=>{
            let tipo = res['Tipo'];
            swal('Exito', `${res['Operacion']}`, tipo);
            this._limpiarVistaYVariables();
            this.verCatalogoCategorias({});
        }).catch(err=>{
            console.log('error obteniendo catalogo', err);
        });
    }
    seleccionarCategoria(){
        let subcategorias = this.datosSubcategorias.find(ob=>ob.Categoria == this.categoriaGasto);
        console.log('subca',subcategorias);
        this.subcategorias = subcategorias.Subcategorias;
    }
    borrarCategoria(obj){
        console.log('obj',obj);
        let datos = {IdCategoria : obj.IdCategoria };
        this.catalogosService.borrarCategoria(datos).then( res=>{
            this.verCatalogoCategorias({});
        }).catch(err=>{
            console.log('error obtener gastos', err);
        })
    }
    borrarSubcategoria(obj){
        let datos = {IdCategoria : obj.IdSubcategoria };
        this.catalogosService.borrarCategoria(datos).then( res=>{
            this.verCatalogoCategorias({});
        }).catch(err=>{
            console.log('error obtener gastos', err);
        })
    }
    _ordenarCats(datos){
        let datosOrdenados = [];
        datos.TodasPadres.forEach(d=>{
            let filtradas = datos.Juntos.filter(ob=>ob.IdCategoria ==  d.IdCategoria);
            datosOrdenados.push({Categoria: d.Categoria,"Total Subcategorias": filtradas.length,ObjCompleto: d});
        });
        return datosOrdenados;
    }
    _ordenarSubs(datos){
        let datosOrdenados = [];
        datos.Juntos.forEach(d=>{
            datosOrdenados.push({"Categoria": d.Categoria, Subcategoria: d.Subcategoria,ObjCompleto: d});
        });
        return datosOrdenados;
    }
    _confirmarModal(datosAlert){
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
