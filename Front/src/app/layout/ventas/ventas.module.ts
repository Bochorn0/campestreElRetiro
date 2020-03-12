import { NgModule } from '@angular/core';
import { VentasRoutingModule } from './ventas-routing.module';
import { VentasComponent } from './ventas.component';
import { SharedModule } from '../../shared';
import { ClientesComponent ,ContratoComponent,ProspectosComponent} from './';

@NgModule({
    imports: [ VentasRoutingModule, SharedModule ],
    declarations: [ VentasComponent,ClientesComponent,ProspectosComponent,ContratoComponent]
})

export class VentasModule {}
