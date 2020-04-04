import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { DatatableModule} from '../../datatables-general/datatables-general.module';
import { StatModule} from '../../stat/stat.module';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { CatalogosTerrenosComponent } from './catalogos.component';
import { NgxSelectModule } from 'ngx-select-ex';
import { AgmCoreModule } from '@agm/core';
@NgModule({
    imports: [CommonModule, RouterModule, FormsModule,DatatableModule,StatModule,ReactiveFormsModule, NgxPaginationModule,NgbTypeaheadModule, FroalaEditorModule, FroalaViewModule,NgxSelectModule,
    AgmCoreModule.forRoot({
        apiKey: 'AIzaSyAoFHWCLKIAuLExC4zRgOMrB-r0XtwxnO8'
        })
    ],
    declarations: [CatalogosTerrenosComponent],
    exports: [CatalogosTerrenosComponent]
})

export class CatalogoTerrenosModule {}
