import { Component, OnInit, Input, Output , EventEmitter} from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import swal from 'sweetalert2';
import * as _ from 'lodash';   
import * as moment from 'moment';
moment.locale('es');

@Component({
  selector: 'app-datatables-general',
  templateUrl: './datatables-general.component.html',
  styleUrls: ['./datatables-general.component.scss']
})
export class DatatablesGeneralComponent implements OnInit {
  datosDatatable;textoBuscar;columnasVisibles;orden;columnaOrden;permiteEliminar;permiteDesactivar;permiteEditar;permiteActivar;permiteSeleccionar;permiteVerDetalle;
  movimientos;paginadoDatos;columnasTodas;visualizarCampos;todosChk; rand_id;datosPage;
  @Input('datosDatatable') datosOrigen: any
  @Output() public delete = new EventEmitter();
  @Output() public deactivate = new EventEmitter();
  @Output() public activate = new EventEmitter();
  @Output() public edit = new EventEmitter();
  @Output() public checks = new EventEmitter();
  @Output() public clickDetalle = new EventEmitter();
  constructor() {
    this.orden = ''; 
    this.paginadoDatos = 20;
    this.datosPage = 1;
    this.rand_id =  `Table-${Math.floor((Math.random() * 100) + 1)}`;
    this.visualizarCampos =this.permiteVerDetalle = this.permiteEliminar = this.permiteDesactivar = this.permiteEditar = this.permiteActivar = this.permiteSeleccionar = this.todosChk = false;
  }

  ngOnInit() {
    this.orden = ''; 
    this.paginadoDatos = 20;
    this.visualizarCampos=false;
    this._correrMap();
    this._opcionesDatatable();

  }
  _opcionesDatatable(){
    if(this.datosDatatable.Opciones){
      this.permiteEliminar =  (this.datosDatatable.Opciones.Eliminar == true)?true:false;
      this.permiteSeleccionar =  (this.datosDatatable.Opciones.Seleccionar == true)?true:false;
      this.permiteVerDetalle =  (this.datosDatatable.Opciones.Detalle == true)?true:false;
      this.permiteDesactivar =  (this.datosDatatable.Opciones.Desactivar == true)?true:false;
      this.permiteActivar =  (this.datosDatatable.Opciones.Activar == true)?true:false;
      this.permiteEditar =  (this.datosDatatable.Opciones.Editar == true)?true:false;
      this.paginadoDatos = (this.datosDatatable.Opciones.Paginado > 0)?this.datosDatatable.Opciones.Pagonado:20;
    }
  }
  _reiniciarRegistros(datos){
    this._opcionesDatatable();
    this.datosDatatable.Datos.forEach(d=>{
      //d.ObjCompleto = (d.ObjCompleto)?d.ObjCompleto:d;
      if(d.ObjCompleto){
        d.ObjCompleto.Editar = false;
      }
    })
    this.columnasVisibles = this.columnasTodas =  this.datosDatatable = false;
    this.datosOrigen =  datos;
    this._correrMap();
  }
  _correrMap(){
    this.datosDatatable = false;
    this.datosDatatable =  this.datosOrigen;
    let movimientosOrdenados = [];
    let colsT = [];
    this.datosDatatable.Datos.forEach((d)=>{
      //d.ObjCompleto = (d.ObjCompleto)?d.ObjCompleto:d;
      if(d.ObjCompleto){
        d.ObjCompleto.Editar = false;
      }
    });
    if(!this.datosDatatable.Columnas){
      let columnas = [];
      Object.keys(this.datosDatatable.Datos[0]).forEach((key)=>{
        if(key != 'ObjCompleto' && key != 'Editar'){
          columnas.push(key);
        }
      });
      this.datosDatatable.Columnas = columnas;
    }
    //console.log('datos',this.datosDatatable.Datos);
    this.datosDatatable.Datos.forEach((dats)=>{
      let movimiento_individual = [];
      Object.keys(dats).forEach((key)=>{
          if(this.datosDatatable.Columnas.indexOf(key) > -1){
            movimiento_individual[key]= this._separarPorTipoDeDatos(dats,key);
          }
      });
      let objCom = (dats.ObjCompleto)?dats.ObjCompleto:dats;
      objCom.Editar = (objCom.Editar)?true:false;
/*      if(!this.permiteEditar){
        dats.Editar = false;
        if(dats.ObjCompleto){dats.ObjCompleto.Editar = false;};
        //dats.ObjCompleto = (dats.ObjCompleto)? dats.ObjCompleto.Editar = false :dats.Editar = false;
      }else{
      }*/
//      movimiento_individual['Obj'] = (dats.ObjCompleto)?dats.ObjCompleto:dats;
      movimiento_individual['Obj'] = objCom;
      movimientosOrdenados.push(movimiento_individual);
    })

    Object.keys(this.datosDatatable.Datos[0]).forEach((key)=>{
      let act= false;
      if(this.datosDatatable.Columnas.indexOf(key) > -1){
        act = true;
      }
      if(key != 'ObjCompleto' && key != 'Editar'){
        colsT.push({Nombre:key,Activa: act});
      }
    });
    this.columnasTodas = colsT;
    this.movimientos =  movimientosOrdenados;
    //console.log('movs',this.movimientos);
  }
  _separarPorTipoDeDatos(dats,key){
    let dato_columna;
    //moment(dats[key]).isValid() &&
    if((key.toUpperCase().indexOf('ECHA') > -1 || key.toUpperCase().indexOf('FCH') > -1  || key.toUpperCase().indexOf('ULTIMA') > -1) && dats[key]){
//    if((key.indexOf('echa') > -1 || key.indexOf('FCH') > -1 )){
//      return dats[key].split('T')[0];
//      console.log('fch',dats[key]);
      let fech_ = `${dats[key]}`.indexOf('T')?`${dats[key].split('T')[0]}`:dats[key];
      if(moment(`${fech_}`).isValid()){
        return moment(fech_).format('LL') ;
      }else{
        return (fech_)?fech_:``;
      }
    }else if((key.toUpperCase().indexOf('TOTAL') > -1 || key.toUpperCase().indexOf('IMPORTE') > -1)&& dats[key]){
      return `$ ${parseFloat(dats[key]).toFixed(2)}`;
    }else{
      return (dats[key])?dats[key]:``;
    }
  }
  cambiarOrden(Columna){
    this.orden = (this.orden == 'down')?'up':`down`;
    this.columnaOrden = (Columna)?`${Columna}`:``;
    let reorden;
    if(this.orden == 'down'){
      reorden =  this.movimientos.sort((a,b)=>{
        if (a[Columna] === b[Columna]) { return 0;}
        else { return (a[Columna] < b[Columna]) ? -1 : 1; }
      });
    }else{
      reorden =  this.movimientos.reverse((a,b)=>{
        if (a[Columna] === b[Columna]) { return 0;}
        else { return (a[Columna] < b[Columna]) ? -1 : 1; }
      });
    }
  }
  buscarEn(){
    this.datosPage = 1;
    let movsFiltrados = [];
    if(this.textoBuscar){
        this.datosDatatable.Datos.forEach((dat)=>{
          let validado = false;
          this.datosDatatable.Columnas.forEach((col)=>{
            if(dat[col] != 'Editar'){
              if(dat[col]){
                if(dat[col].toString().toUpperCase().indexOf(this.textoBuscar.toUpperCase()) > -1){
                  validado = true;
                }
              }
            }
          });
          if(validado){ movsFiltrados.push(dat); }
        });
        let movimientosOrdenados = [];
        movsFiltrados.forEach(dats=>{
          let movimiento_individual = [];
          Object.keys(dats).forEach((key)=>{
            movimiento_individual[key]= dats[key];
          });
          let objCom = (dats.ObjCompleto)?dats.ObjCompleto:dats;
          objCom.Editar = (objCom.Editar)?true:false;
          movimiento_individual['Obj'] = objCom;
          movimientosOrdenados.push(movimiento_individual);
        });
        this.movimientos = movimientosOrdenados;
    }else{
      this._correrMap();
    }
  }
  cambiarCampos(){
    this.visualizarCampos = (this.visualizarCampos)?false:true;
  }
  columnasVisualizables(){
    let nuevasCarpetas = [];
    let carpetasChks = this.columnasTodas.filter(obj => obj.Activa == true);
    console.log('activas', carpetasChks);
    carpetasChks.forEach((car)=>{
      nuevasCarpetas.push(car.Nombre);
    })
    this.datosDatatable.Columnas = nuevasCarpetas;
    this._correrMap();
  }
  eliminarObj(obj){
    let datosAlert =  {Titulo: 'Cuidado', 
    Contenido: 'Estas a punto de eliminar este registro, esta operación no se puede deshacer, deseas continuar ? ',
    Tipo: 'warning', 
    Confirm: 'Si' };
    this._confirmarModal(obj,datosAlert).then((res)=>{
      this.delete.emit(obj);
        this.movimientos =  this.movimientos.filter(ob => ob['Obj'] != obj);
    });
  }
  desactivarObj(obj){
    let datosAlert =  {Titulo: 'Cuidado', 
    Contenido: 'Estas seguro de desactivar este registro? ',
    Tipo: 'warning', 
    Confirm: 'Si' };
    this._confirmarModal(obj,datosAlert).then((res)=>{
      this.deactivate.emit(obj);
        this.movimientos =  this.movimientos.filter(ob => ob['Obj'] != obj);
    });
  }
  activarObj(obj){
    let datosAlert =  {Titulo: 'Cuidado', 
    Contenido: 'Estas seguro de Activar este registro? ',
    Tipo: 'warning', 
    Confirm: 'Si' };
    this._confirmarModal(obj,datosAlert).then((res)=>{
      this.activate.emit(obj);
        this.movimientos =  this.movimientos.filter(ob => ob['Obj'] != obj);
    });
  }
  editarObj(obj){
      //this.edit.emit(obj);
      this.movimientos.find(ob=> ob['Obj'] == obj)['Obj'].Editar = true;
  }
  guardarEditar(mov){
    let datosAlert =  {Titulo: 'Cuidado', 
    Contenido: 'Estas seguro de guardar estas modificaciones? ',
    Tipo: 'warning', 
    Confirm: 'Si' };
    this._confirmarModal(mov,datosAlert).then((res)=>{
      this.edit.emit(mov);
        //this.movimientos =  this.movimientos.filter(ob => ob['Obj'] != obj);
    });
  }
  emitirDetalle(obj){
    this.clickDetalle.emit(obj);
  }
  seleccionarTodos(){
    let selecteds =  [];
    this.movimientos.forEach((movs)=>{
      movs['chk'] = this.todosChk;
      selecteds.push(movs['Obj']);
    })
    this.checks.emit((this.todosChk)?selecteds:[]);
  }
  enviarChecks(){
    let selecteds =  [];
    let checks_datos =  this.movimientos.filter(ob => ob['chk']== true );
    checks_datos.forEach((chks)=>{
      selecteds.push(chks['Obj']);
    })
    console.log('chks', selecteds);
    this.checks.emit(selecteds);
  }
  estructurarDatos(data) {
    let datos: any = '';
    for (let key in data[0]) {
      datos += key + ',';
    }
    datos += '\n';
    data.forEach((linea) => {
      for (let key in linea.data) {
        if (!linea.data[key]) {
          linea.data[key] = '';
        }
        linea.data[key].replace(/,/g, '');
        datos += linea.data[key] + ',';
      }
      datos += '\n';
    });
    return encodeURI(datos);
  }

  generarExcel() {
    let nombre = 'reporte';
    let data = this.datosDatatable.Datos;
    if (data.length == 0) {
      return;
    }

    let datosAll = decodeURI(this.estructurarDatos(data));
    let blob = new Blob(['\ufeff' + datosAll], { type: 'text/csv;charset=utf-8;' });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {
      dwldLink.setAttribute("target", "_blank");
    }
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", nombre + "_" + new Date().toLocaleDateString() + ".csv");

    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }


  downloadFile(url, nombre, ext) {
    //Crea el link de descarga del documento
    let dLink = document.createElement("a");
    //Parametros especiales para navegadores
    let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) { dLink.setAttribute("target", "_blank"); }
    //Establece los atributos de los links de descarga y asignacion de parametros
    dLink.setAttribute("href", url);
    dLink.setAttribute("download", `${nombre}_${new Date().toLocaleDateString()}.${ext}`);
    dLink.style.visibility = "hidden";
    //Detonacion del evento de descargas creacion del link , click y eliminacion del link
    document.body.appendChild(dLink);dLink.click();document.body.removeChild(dLink);
}
  //Funcion para confirmar eliminar registros regresa una promesa
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

