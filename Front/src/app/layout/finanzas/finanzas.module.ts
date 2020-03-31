import { NgModule } from '@angular/core';
import { FinanzasRoutingModule } from './finanzas-routing.module';
import { FinanzasComponent } from './finanzas.component';
import { SharedModule } from '../../shared';
import { EstadoFinancieroComponent} from './'


@NgModule({
    imports: [ FinanzasRoutingModule, SharedModule ],
    declarations: [ FinanzasComponent,EstadoFinancieroComponent]
})
export class FinanzasModule {}
