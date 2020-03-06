import { Component, OnInit , ViewChild, Output, Input, EventEmitter} from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { CatalogosService } from '../../../shared/services/catalogos.service';
import { VentasService } from '../../../shared/services/ventas.service';
import swal from 'sweetalert2';
import * as moment from 'moment';
@Component({
    selector: 'app-contrato',
    templateUrl: './contrato.component.html',
    styleUrls: ['./contrato.component.scss'],
    animations: [routerTransition()],
    providers: [CatalogosService, VentasService]
})
export class ContratoComponent implements OnInit {
    datosContrato;
    datosCliente;
    contenidoContrato;
    @Input('datosContrato') datosOrigen: any
    @Output() public vista = new EventEmitter();
    @Output() public mensualidades = new EventEmitter();
    constructor(private catalogosService : CatalogosService, private ventasService: VentasService) {
    }
    _reiniciarRegistros(datos){
        this.datosContrato = false;
        this.datosOrigen =  datos;
    }
    ngOnInit() {
        console.log('datos',this.datosOrigen);
        this.datosContrato =  this.datosOrigen;
        this._contratoBase();
        console.log('contrato');

    }
    guardarContrato(){
        let datosGuardar = {Contenido:this.contenidoContrato, datosCliente :this.datosContrato.Cliente.ClienteCompleto,datosTerreno:this.datosContrato.Terrenos[0] ,Ext: 'html'};
        this.ventasService.guardarContrato(datosGuardar).then(res=>{
            console.log('terrenos',this.datosContrato.Terrenos);
            let borrado = this.datosContrato.Terrenos.shift();
            if(this.datosContrato.Terrenos[0]){
                this._contratoBase();
            }
            console.log('borrado',borrado);
            console.log('terrenos',this.datosContrato.Terrenos);
            if(!this.datosContrato.Terrenos[0]){
                this.datosContrato = false;
                let datosModal =  {Titulo: 'Exito',Contenido:"Los Contratos Han Sido Revisados con exito. Deseas Imprimir las Mensualidades en una boleta?",
                Tipo:'success', Confirm: 'Si Imprimir'}
                this._confirmarModal({},datosModal).then(res=>{
                    this.mensualidades.emit({Datos:this.datosContrato});
                })
                this.vista.emit({Activa : 'Venta' });
            }else{
                swal('Exito',`Contrato de parcela ${borrado.parcela} Guardado correctamente`,'success');
            }
        }).catch(err=>{console.log('err',err);})
    }
    omitirContrato(){
        let borrado = this.datosContrato.Terrenos.shift();
        if(!this.datosContrato.Terrenos[0]){
            this.datosContrato = false;
            let datosModal =  {Titulo: 'Exito',Contenido:"Los Contratos Han Sido Revisados con exito. Deseas Imprimir las Mensualidades en una boleta?",
            Tipo:'success', Confirm: 'Si Imprimir'}
            this._confirmarModal({},datosModal).then(res=>{
                this.mensualidades.emit({Datos:this.datosContrato});
            })
            this.vista.emit({Activa : 'Venta' });
        }else{
            swal('Exito',`El Contrato de la parcela ${borrado.parcela} fue omitido, para revisarlo, ve a la seccion de Clientes `,'success');
        }
    }
    _delay(ms){
        return new Promise( resolve => setTimeout(resolve, ms) );
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
    _contratoBase(){
        if(this.datosContrato){
            this.contenidoContrato =  `<div class="row" style="padding:20px;">
            <div class="col-lg-12">
                <h3>CONTRATO DE PROMESA DE COMPRA VENTA</h3>
                <p>
                    EN LA CIUDAD DE HERMOSILLO SONORA SIENDO LAS 10:00 HORAS DEL DIA 02 DE  AGOSTO  DE 2017   CELEBRAN: POR UNA PARTE LA C. LIDIA ALEJANDRA DUARTE MEDRANO   QUIEN BAJO PROTESTA DE DECIR VERDAD CELEBRA ESTE CONTRATO COMO POSESIONARIA  DEL POBLADO EL CARMEN MUNICIPIO DE HERMOSILLO COMO PROMITENTE VENDEDOR.
                    POR UNA SEGUNDA PARTE COMPARECE EL C. &nbsp;&nbsp;<b><u>${this.datosContrato.Cliente.Nombre}</u></b> &nbsp;&nbsp;  QUIEN EN LO SUCESIVO SE LE DENOMINARA PROMITENTE COMPRADOR.
                    MANIFESTARON QUE TIENEN CONCERTADO UN CONTRATO DE PROMESA DE COMPRAVENTA MISMO QUE DEJAN FORMALIZADO AL TENOR DE LOS ANTECEDENTES, DECLARACIONES Y CLAUSULAS SIGUIENTES:
                </p>
                <h3>ANTECEDENTES </h3>
                <p>
                    <b>PRIMERO.-</b>
                    EL EJIDO EL CARMEN MUNICIPIO DE HERMOSILLO ESTADO DE SONORA CUENTA CON RESOLUCION PRESIDENCIAL DE FECHA 29 DE JULIO DE 1936, EJECUTÁNDOSE  TOTALMENTE  EL DIA   29 / 07 /  36 POR LA VIA DOTACIÓN  CON UNA  SUPERFICIE DE  718-00-00  HAS , PARA   22   EJIDATARIOS.- 
                </p>
                <p>
                    <b>SEGUNDO:</b>
                    POSTERIORMENTE CON EL PROGRAMA DE CERTIFICACION DE DERECHOS EJIDALES Y TITULACION DE SOLARES URBANOS SE LLEVO A CABO LA REGULARIZACION DE LA TENENCIA DE LA TIERRA CULMINANDO LA ASAMBLEA DE DELIMITACION. DESTINO, ASIGNACION CON FECHA 29 DE NOVIEMBRE DE 1997, RATIFICÁNDOSE A 22   EJIDATARIOS.-
                </p>
                <p>
                    <b>TERCERO:</b>
                    ACTO SEGUIDO SE CELEBRA AUTORIZACION PARA ADOPCION DE DOMINIO PLENO SOBRE TIERRAS PARCELADAS  ASAMBLEA  CELEBRADA CON FECHA  01 DE AGOSTO DE 1999, INSCRITO EL ACTO EN EL REGISTRO AGRARIO NACIONAL CON FECHA  21 DE SEPTIEMBRE DEL AÑO 2000.- 
                </p>
                <p>
                    <b>CUARTA:</b>
                    QUE CON FECHA 25  DE OCTUBRE  DE 2014 EN ASAMBLEA DE DELIMITACION, DESTINO Y ASIGNACION DE TIERRAS ( CERTIFICACION DE LA TIERRA INCORPORADA AL REGIMEN EJIDAL COMO AREA PARCELADA)  SE FORMALIZO LA CERTIFICACION DE LA MISMA CORRESPONDIENDOLE A LA LIDIA ALEJANDRA DUARTE MEDRANO  UNA PARCELA CON EL NUMERO ${this.datosContrato.Terrenos[0].parcela} .-
                </p>
                <br>

                <h3>DECLARACIONES</h3>                    
                <p>
                    <b>PRIMERA:</b>
                    LA C. LIDIA ALEJANDRA DUARTE MEDRANO  DECLARA QUE ES TITULAR DE LA PARCELA  N°  ${this.datosContrato.Terrenos[0].parcela} CON SUPERFICIE DE ${this.datosContrato.Terrenos[0].Superficie} MTS. 2  UBICADO EN EL EJIDO EL CARMEN MUNICIPIO DE HERMOSILLO Y QUE SE LOCALIZA EN EL CONJUNTO “CAMPESTRE FAMILIAR EL RETIRO”, EN EL KILOMETRO 15.0 DE LA CARRETERA A SAN MIGUEL DE HORCASITAS. 
                </p>                    
                
                <h3 class="text-right">HOJA NO.02 </h3>
                <p>
                    <b>SEGUNDA:</b>
                    LA C. LIDIA ALEJANDRA DUARTE MEDRANO, ACREDITA LA TITULARIDAD DE LA PARCELA NUMERO  ${this.datosContrato.Terrenos[0].parcela}  CON SUPERFICIE ${this.datosContrato.Terrenos[0].Superficie} MTS. CON CERTIFICADO PARCELARIO NÚMERO&nbsp;&nbsp;<b><u>${this.datosContrato.Terrenos[0].parcela}</u></b> &nbsp;&nbsp; Y FOLIO: &nbsp;&nbsp;<b><u>${this.datosContrato.Cliente.NumIfe}</u></b> &nbsp;&nbsp; EXPEDIDO  POR EL REGISTRO AGRARIO NACIONAL .
                    <br>
                    LAS PARTES DE COMUN ACUERDO SE SUJETAN A LAS CLAUSULAS SIGUIENTES:
                </p>
                <h3 class="text-center">CLÁUSULAS </h3>
                <p>
                    <b>PRIMERA:</b>
                    LA C. LIDIA ALEJANDRA DUARTE MEDRANO  ESTA FORMALIZANDO CONTRATO DE PROMESA DE COMPRAVENTA CON EL (LA) C.&nbsp;&nbsp;<b><u>${this.datosContrato.Cliente.Nombre}</u></b> &nbsp;&nbsp;  RESPECTO DE LA PARCELA NUMERO &nbsp;&nbsp;<b><u>${this.datosContrato.Terrenos[0].parcela}</u></b> &nbsp;&nbsp; QUE SE UBICA EN EL EJIDO EL CARMEN MUNICIPIO DE HERMOSILLO Y SE LOCALIZA DENTRO DEL CONJUNTO “CAMPESTRE FAMILIAR EL RETIRO”, EN EL KILOMETRO 15.0 DE LA CARRETERA A SAN MIGUEL DE HORCASITAS. 
                </p>
                <p>
                    <b>SEGUNDA:</b>
                    DESDE ESTE MOMENTO SEÑALAN LAS PARTES CONTRATANTES LA OBLIGACION DE LA PARTE PROMITENTE COMPRADORA DE PAGAR LA CANTIDAD DE $ 125,000.00  ( CIENTO VEINTICINCO MIL  PESOS  )   POR UNA SUPERFICIE DE  ${this.datosContrato.Terrenos[0].Superficie} MTS. 2  
                    <br>
                    DICHA CANTIDAD SE CUBRIRA DE LA SIGUIENTE FORMA: PAGO INMEDIATO A LA FIRMA DE ESTE CONTRATO .
                </p>
                <p>
                    <b>TERCERA:</b>
                    SI POR ALGUNA RAZON EL(LA) C.&nbsp;&nbsp;<b><u>${this.datosContrato.Cliente.Nombre}</u></b> &nbsp;&nbsp; QUISIERE TRASPASAR O CEDER LA PARCELA NUMERO ${this.datosContrato.Terrenos[0].parcela} , SE TENDRA QUE DAR PREVIO AVISO POR ESCRITO A LA C.LIDIA ALEJANDRA DUARTE MEDRANO , PARA QUE UNA VEZ CONCLUIDO EL PAGO TOTAL  SE TENGAN LOS DATOS ACUALIZADOS Y REALIZAR LA CESION DE DERECHOS A FAVOR DE LA PARTE PROMITENTE COMPRADORA Y O BIEN A QUIEN ESTA PERSONA ELIJA POR ASI CONVENIR A SUS INTERESES.-                        
                </p>
                <p>
                    <b>CUARTA:</b>
                    LA C. LIDIA ALEJANDRA DUARTE MEDRANO  MANIFIESTA ESTAR REALIZANDO Y FORMALIZANDO ESTE CONTRATO DE PROMESA DE COMPRA-VENTA CON EL (LA)C. &nbsp;&nbsp;<b><u>${this.datosContrato.Cliente.Nombre}</u></b> &nbsp;&nbsp; EL CUAL CULMINA EN CONVENIO DE CESION DE DERECHOS  A FAVOR DEL( DE LA )  C. &nbsp;&nbsp;<b><u>${this.datosContrato.Cliente.Nombre}</u></b> &nbsp;&nbsp; NO TENIENDO NINGÚN INCONVENIENTE  LA C. LIDIA ALEJANDRA DUARTE MEDRANO  QUE EL CERTIFICADO PARCELARIO CORRESPONDIENTE SEA A NOMBRE DE LA PERSONA ANTES MENCIONADA,O A QUIEN ESTA SEÑALE  QUIEN SE HARÁ RESPONSABLE DE LOS PAGOS Y COSTOS DEL TRASLADO  ANTE LA DEPENDENCIA QUE CORRESPONDE .                        
                </p>
                <h3 class="text-right">HOJA NO.03 </h3>
                <p>
                    <b>QUINTA:</b>
                    CONVIENEN AMBAS PARTES QUE EL(LA) C. &nbsp;&nbsp;<b><u>${this.datosContrato.Cliente.Nombre}</u></b> &nbsp;&nbsp; PAGARÁ EL CONTRATO DE AGUA A LA C. LIDIA ALEJANDRA DUARTE MEDRANO   UNA VEZ INSTALADA LA TOMA DE AGUA EN SU TERRENO, EL(LA)  C.&nbsp;&nbsp;<b><u>${this.datosContrato.Cliente.Nombre}</u></b> &nbsp;&nbsp; SOLO UTILIZARA ESTE SERVICIO DE SUMINISTRO DE AGUA EN LA PARCELA  YA ESPECIFICADA, HACIENDO UN USO ADECUADO DEL AGUA PARA EL CONSUMO MODERADO DE LAS NECESIDADES QUE REQUIERE UN TERRENO CAMPESTRE DENTRO DE LAS INSTALACIONES DE CAMPESTRE FAMILIAR “ EL RETIRO ” , POR NINGUN MOTIVO SE PERMITIRA DESPLAZAR EL SUMINISTRO DE AGUA A OTRO LUGAR QUE NO SEA EL MENCIONADO EN ESTE CONTRATO, EN CASO CONTRARIO SE RACIONARA O SUSPENDERA DICHO SUMINISTRO , COBRANDOSE UNA CUOTA POR RECONECCION. EL PAGO DE CONTRATO DE AGUA SE REALIZARÁ EN LAS OFICINAS GENERALES A MÁS TARDAR 30 DÍAS DESPUÉS DE SU INSTALACIÓN, ASI COMO UN PAGO SEMESTRAL POR MANTENIMIENTO.
                </p>
                <p>
                    <b>SEXTA:</b>
                    LA PARTE PROMITENTE VENDEDORA SE OBLIGA AL SANEAMIENTO PARA EL CASO DE EVICCION EN FORMA Y CONFORME A DERECHO.
                </p>
                <p>
                    <b>SEPTIMA:</b>
                    LA C.LIDIA ALEJANDRA DUARTE MEDRANO  ENTREGA A LA CELEBRACION DEL PRESENTE INSTRUMENTO LA POSESIÓN FORMAL, MATERIAL Y JURIDICA DEL INMUEBLE DESCRITO EN LA DECLARACIÓNES DE ESTE CONTRATO DE PROMESA DE COMPRA-VENTA AL(A LA ) C. &nbsp;&nbsp;<b><u>${this.datosContrato.Cliente.Nombre}</u></b> &nbsp;&nbsp; QUIEN EN ESTE MISMO ACTO LA RECIBE DE CONFORMIDAD.
                </p>
                <p>
                    <b>OCTAVA:</b>
                    PARA LA INTERPRETACIÓN Y CUMPLIMIENTO DE LO ESTIPULADO Y LO NO ESTIPULADO EN ESTE CONTRATO, LAS PARTES SE SOMETERÁN EXPRESAMENTE A LA JURISDICCIÓN DE LOS TRIBUNALES DEL DISTRITO JUDICIAL DE HERMOSILLO, SONORA; RENUNCIANDO PARA TAL FIN EL FUERO QUE LES CORRESPONDA ASÍ COMO EL DE SU DOMICILIO ACTUAL O FUTURO.
                </p>
                <p>
                    <b>NOVENA:</b>
                    MANIFIESTAN LAS PARTES PROMITENTE  VENDEDOR Y PROMITENTE COMPRADOR ESTAR DE ACUERDO EN OBLIGARSE A CELEBRAR UN CONTRATO DE CESION DE DERECHOS PARCELARIOS  UNA VEZ QUE SE HAYA CUBIERTO LA TOTALIDAD DE PAGO POR ENAJENACION  DEL  TOTAL DEL AREA  QUE SE ENAJENA, ACTUALMENTE PROPIEDAD DE LA C. LIDIA ALEJANDRA DUARTE MEDRANO  POSESIONARIA   DEL POBLADO   EL CARMEN    MUNICIPIO DE HERMOSILLO ESTADO DE SONORA,  OBLIGANDOSE LAS PARTES A RESPETAR LO ESTABLECIDO EN LA LEY AGRARIA EN VIGOR Y LA FACULTAD DE LA ASAMBLEA DEL RECONOCIMIENTO DEL PROMITENTE COMPRADOR CON CALIDAD DE POSESIONARIO .
                </p>
                <p>
                    <b>DECIMA:</b>
                    LO NO PREVISTO EN ESTE CONTRATO SE REGIRA POR LOS ARTICULOS 2474, 2475, 2476, 2477, 2478, 2479, 2481, 2482 Y DEMAS RELATIVOS Y APLICABLES AL CODIGO CIVIL PARA EL ESTADO DE SONORA.
                </p>
                <p>
                    <b>DECIMA PRIMERA:</b>
                    LA C. LIDIA ALEJANDRA DUARTE MEDRANO   PROMITENTE VENDEDOR MANIFIESTA QUE EN ESTA OCACION ESTA REALIZANDO Y FORMALIZANDO ESTE CONTRATO DE PROMESA DE COMPRAVENTA CON EL (LA)C. &nbsp;&nbsp;<b><u>${this.datosContrato.Cliente.Nombre}</u></b> &nbsp;&nbsp; COMO PROMITENTE COMPRADOR QUE CULMINARA EN CONVENIO DE CESION DE DERECHOS PARCELARIOS A FAVOR DE EL(DE LA ) C.&nbsp;&nbsp;<b><u>${this.datosContrato.Cliente.Nombre}</u></b> &nbsp;&nbsp; No TENIENDO NINGUN INCONVENIENTE LA C.LIDIA ALEJANDRA DUARTE MEDRANO QUE LA ENAJENACION CORRESPONDIENTE SEA A NOMBRE DEL ANTES SEÑALADO SIENDO LA PARTE PROMITENTE COMPRADORA QUIEN SE HARA RESPONSABLE DE LOS PAGOS Y COSTOS DEL TRASLADO ANTE LA DEPENDENCIA QUE CORRESPONDA, SIENDO IMPORTANTE SEÑALAR QUE SE DA EL CASO DE INEXISTENCIA DE LAS PARTES  POR EL CASO DE FALLECIMIENTO , LAS PARTES  QUE PARTICIPAN    SOLICITAN QUE  ESTE CONTRATO SEA RESPETADO EN TODOS SUS TERMINOS Y CONDICIONES DEBIENDO CULMINAR  A FAVOR DE QUIENES EN SU MOMENTO DEMUESTREN TENER DEREHO A ELLO CON ARREGLO A LA LEY .-
                </p>
                <h3 class="text-right">HOJA NO.04 </h3>
                <h3 class="text-center">PERSONALIDAD </h3>
                <p>
                    LA C. LIDIA ALEJANDRA DUARTE MEDRANO  ACREDITO SU CARACTER DE  POSEISONARIA   DEL POBLADO EL CARMEN MUNICIPIO DE HERMOSILLO ESTADO DE SONORA CON RESOLUCION Y ACTA DE ASAMBLEA DE DELIMITACION, DESTINO Y   ASIGNACION DE TIERRAS CELEBRADA CON FECHA  25 DE  OCTUBRE  DE 2014   Y SU CORRESPONDIENTE   CERTIFICADPO PARCELARIO   , DOCUMENTOS QUE PASAN A FORMAR PARTE DE ESTE CONTRATO.
                </p>
                <h3 class="text-center">GENERALES DE LOS DECLARANTES</h3>
                <p class="text-center">
                        LA C.LIDIA ALEJANDRA DUARTE MEDRANO   MANIFESTO POR SUS GENERALES SER MEXICANO POR NACIMIENTO  E HIJA DE PADRES MEXICANOS , SOLTERA   POSESIONARIA   ORIGINARIO  DE    HERMOSILLO  ,  SONORA   , NACIDO  EL DÍA  06 DE AGOSTO DE 1990, QUIEN SE IDENTIFICO CON  CREDENCIAL DE ELECTOR FOLIO   &nbsp;&nbsp;<b><u>${this.datosContrato.Cliente.NumIfe}</u></b> &nbsp;&nbsp; CON DOMICILIO CONOCIDO EJIDO EL ZACATON , MUNICIPIO DE HERMOSILLO .
                        <br>
                        EL (LA)C.&nbsp;&nbsp;<b><u>${this.datosContrato.Cliente.Nombre}</u></b> &nbsp;&nbsp;  MANIFESTO POR SUS GENERALES SER MEXICANO POR NACIMIENTO E HIJO DE PADRES MEXICANOS ORIGINARIO DE: &nbsp;&nbsp;<b><u>${this.datosContrato.Cliente.Origen}</u></b> &nbsp;&nbsp; NACIDO EL DIA &nbsp;&nbsp;<b><u>${this.datosContrato.Cliente.Fecha_nacimiento}</u></b> &nbsp;&nbsp; IDENTIFICANDOSE CON CREDENCIAL DE ELECTOR FOLIO NUMERO &nbsp;&nbsp;<b><u>${this.datosContrato.Cliente.NumIfe}</u></b> &nbsp;&nbsp;, CON DOMICILIO EN: &nbsp;&nbsp;<b><u>${this.datosContrato.Cliente.Direccion}</u></b> &nbsp;&nbsp;.-
                        <br>
                        LEIDO QUE FUE EL PRESENTE CONTRATO POR LOS PARTICIPANTES LO RATIFICAN Y LO FIRMAN, MANIFESTANDO QUE EN LA CELEBRACION DEL MISMO NO EXISTE DOLO O VICIOS OCULTOS, ASI MISMO SEÑALA NO HABER SIDO COACCIONADOS DE MANERA ALGUNA PARA SU CELEBRACION, ARGUMENTANDO QUE EL PRESENTE DOCUMENTO ES LA REPRESENTACION ESCRITA DE SU VOLUNTAD, POR LO QUE LO FIRMAN DE CONFORMIDAD ABAJO.
                        <br><br>
                        A T E N T A M E N T E
                        POR LAS PARTES
                        <br>
                        _____________________________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _____________________________________________
                        <br>
                        C. LIDIA ALEJANDRA DUARTE MEDRANO          C.<br>
                        PROMITENTE VENDEDOR		                       PROMITENTE COMPRADOR
                        <br>
                        TESTIGOS
                        <br><br>
                        _____________________________________________  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _____________________________________________
                </p>
            </div>
        </div>`;
        }
    }
}
