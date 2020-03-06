import { NgModule } from '@angular/core';
import { DocumentosRoutingModule } from './documentos-routing.module';
import { DocumentosComponent } from './documentos.component';
import { SharedModule } from '../../shared';

@NgModule({
    imports: [DocumentosRoutingModule, SharedModule],
    declarations: [DocumentosComponent]
})
export class DocumentosModule {}
