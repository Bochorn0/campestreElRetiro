import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { DatatableModule} from '../../datatables-general/datatables-general.module';
import { StatModule} from '../../stat/stat.module';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { MantenimientoComponent } from './mantenimiento.component';
@NgModule({
    imports: [CommonModule, RouterModule, FormsModule,DatatableModule,StatModule,ReactiveFormsModule, NgxPaginationModule,    NgbTypeaheadModule, FroalaEditorModule, FroalaViewModule],
    declarations: [MantenimientoComponent],
    exports: [MantenimientoComponent]
})

export class MantenimientoVentasModule {}