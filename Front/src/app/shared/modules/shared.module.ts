import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpModule,Http, XHRBackend, RequestOptions } from '@angular/http';
import { DatatableModule} from './datatables-general/datatables-general.module';
import { CatalogoClientesModule} from './catalogos/catalogo-clientes/catalogo-clientes.module';
import { CatalogoTerrenosModule} from './catalogos/catalogos-terrenos/catalogos.module';
import { VentasCotizadorModule} from './ventas/cotizador/cotizador.module';
import { CotizadorMensualidadModule} from './ventas/cotizador-mensualidad/cotizador-mensualidad.module';
import { CotizadorAnualidadModule} from './ventas/cotizador-anualidad/cotizador-anualidad.module';
import { MantenimientoVentasModule} from './ventas/mantenimiento/mantenimiento.module';
import { IngresosExtraModule} from './ventas/ingresos-extra/ingresos-extra.module';
import { FinanciamientoVentasModule} from './ventas/venta/venta.module';
import { FormularioClientesModule } from './formularios/formulario-clientes/formulario-clientes.module';
import { FormularioClientesSeparadoModule } from './formularios/formulario-clientes-separado/formulario-clientes-separado.module';
import { StatModule} from './stat/stat.module';
import { PageHeaderModule } from './page-header/page-header.module';
import { ChartsModule as Ng2Charts } from 'ng2-charts';
import { NgbCarouselModule, NgbAlertModule, NgbTypeaheadModule,NgbTabsetModule ,NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { AuthGuard } from '../guard/auth.guard';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
//import { AngularPrint} from 'angular-print';
/*import {
    AlertComponent,
    ButtonsComponent,
    ModalComponent,
    CollapseComponent,
    DatePickerComponent,
    DropdownComponent,
    PaginationComponent,
    PopOverComponent,
    ProgressbarComponent,
    TabsComponent,
    RatingComponent,
    TooltipComponent,
    TimepickerComponent
} from './components';*/
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CatalogoClientesModule,
    CatalogoTerrenosModule,
    VentasCotizadorModule,
    CotizadorMensualidadModule,
    CotizadorAnualidadModule,
    MantenimientoVentasModule,
    FinanciamientoVentasModule,
    IngresosExtraModule,
    FormularioClientesModule,
    FormularioClientesSeparadoModule,
    DatatableModule,
    HttpModule,
    StatModule,
    RouterModule,
    PageHeaderModule,
    Ng2Charts,
    NgbCarouselModule.forRoot(),
    NgbAlertModule.forRoot(),
    NgbTypeaheadModule.forRoot(),
    FroalaEditorModule.forRoot(), 
    FroalaViewModule.forRoot(),
    NgbTabsetModule.forRoot(),
    NgbModalModule.forRoot(),
    NgxPaginationModule
   // AngularPrint
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CatalogoClientesModule,
    CatalogoTerrenosModule,
    VentasCotizadorModule,
    CotizadorMensualidadModule,
    CotizadorAnualidadModule,
    MantenimientoVentasModule,
    FinanciamientoVentasModule,
    IngresosExtraModule,
    FormularioClientesModule, 
    FormularioClientesSeparadoModule,
    DatatableModule,
    HttpModule,
    StatModule,
    RouterModule,
    PageHeaderModule,
    Ng2Charts,
    NgbCarouselModule, 
    NgbAlertModule, 
    NgbTypeaheadModule,
    FroalaEditorModule,
    FroalaViewModule,
    NgbTabsetModule,
    NgbModalModule,
    NgxPaginationModule
   // AngularPrint
  ],
  providers:[AuthGuard]
})
export class SharedModule { }
  