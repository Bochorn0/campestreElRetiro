import { NgModule } from '@angular/core';
import { VentasRoutingModule } from './ventas-routing.module';
import { VentasComponent } from './ventas.component';
import { SharedModule } from '../../shared';
import { ClientesComponent ,ContratoComponent} from './';

@NgModule({
    imports: [ VentasRoutingModule, SharedModule ],
    declarations: [ VentasComponent,ClientesComponent,ContratoComponent]
})

export class VentasModule {}
