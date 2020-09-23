import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbTypeaheadModule , NgbTabsetModule} from '@ng-bootstrap/ng-bootstrap';
import { DatatableModule} from '../../datatables-general/datatables-general.module';
import { StatModule} from '../../stat/stat.module';
import {  } from '../../stat/stat.module';
import { PageHeaderModule } from '../../page-header/page-header.module';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { CliDetalleComponent } from './cli-detalle.component';
import { FormularioClientesSeparadoModule } from '../../formularios/formulario-clientes-separado/formulario-clientes-separado.module';
import { NgxSelectModule } from 'ngx-select-ex';
import { AgmCoreModule } from '@agm/core';
@NgModule({
    imports: [CommonModule, RouterModule, FormsModule,DatatableModule,StatModule,PageHeaderModule,ReactiveFormsModule, NgxPaginationModule,    NgbTypeaheadModule, FroalaEditorModule, FroalaViewModule, NgbTabsetModule,FormularioClientesSeparadoModule,NgxSelectModule,
    AgmCoreModule.forRoot({
        apiKey: 'AIzaSyAoFHWCLKIAuLExC4zRgOMrB-r0XtwxnO8'
        })
    ],
    declarations: [CliDetalleComponent],
    exports: [CliDetalleComponent] 
})

export class CliDetalleModule {}
