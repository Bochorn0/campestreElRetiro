import { NgModule } from '@angular/core';
import { ContratosRoutingModule } from './contratos-routing.module';
import { ContratosComponent } from './contratos.component';
import { SharedModule } from '../../shared';

@NgModule({
    imports: [ContratosRoutingModule, SharedModule],
    declarations: [ContratosComponent]
})
export class ContratosModule {}
