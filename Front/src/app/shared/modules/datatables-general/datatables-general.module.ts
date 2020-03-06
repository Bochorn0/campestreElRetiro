import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DatatablesGeneralComponent } from './datatables-general.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgxPaginationModule} from 'ngx-pagination';
@NgModule({
    imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, NgxPaginationModule],
    declarations: [DatatablesGeneralComponent],
    exports: [DatatablesGeneralComponent] 
})
export class DatatableModule {}
