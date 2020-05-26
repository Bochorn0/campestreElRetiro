import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { IngresosComponent } from './ingresos.component';
import { NgxSelectModule } from 'ngx-select-ex';
@NgModule({
    imports: [CommonModule, RouterModule, FormsModule,ReactiveFormsModule, NgxPaginationModule,NgbTypeaheadModule, FroalaEditorModule, FroalaViewModule,NgxSelectModule],
    declarations: [IngresosComponent],
    exports: [IngresosComponent]
})

export class IngresosModule {}