import { NgModule } from '@angular/core';
import { FinanzasRoutingModule } from './finanzas-routing.module';
import { FinanzasComponent } from './finanzas.component';
import { SharedModule } from '../../shared';
import { EstadoFinancieroComponent, CatalogoCuentasComponent} from './'


@NgModule({
    imports: [ FinanzasRoutingModule, SharedModule ],
    declarations: [ FinanzasComponent,EstadoFinancieroComponent, CatalogoCuentasComponent]
})
export class FinanzasModule {}
