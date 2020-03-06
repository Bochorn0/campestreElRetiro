import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { DatatableModule} from '../../datatables-general/datatables-general.module';
import { VentasCotizadorModule} from '../../ventas/cotizador/cotizador.module';
import { CotizadorMensualidadModule } from '../../ventas/cotizador-mensualidad/cotizador-mensualidad.module';
import { CotizadorAnualidadModule } from '../../ventas/cotizador-anualidad/cotizador-anualidad.module';
import { StatModule} from '../../stat/stat.module';
import { PageHeaderModule } from '../../page-header/page-header.module';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { FormularioClientesSeparadoComponent } from './formulario-clientes-separado.component';
@NgModule({
    imports: [CommonModule, RouterModule, FormsModule,DatatableModule,VentasCotizadorModule,CotizadorMensualidadModule,CotizadorAnualidadModule,StatModule,PageHeaderModule,ReactiveFormsModule, NgxPaginationModule,    NgbTypeaheadModule.forRoot(), FroalaEditorModule.forRoot(), FroalaViewModule.forRoot()],
    declarations: [FormularioClientesSeparadoComponent],
    exports: [FormularioClientesSeparadoComponent] 
})

export class FormularioClientesSeparadoModule {}
