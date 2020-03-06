import { NgModule } from '@angular/core';
import { CotizacionesRoutingModule } from './cotizaciones-routing.module';
import { CotizacionesComponent } from './cotizaciones.component';
import { SharedModule} from '../../shared';

@NgModule({
    imports: [CotizacionesRoutingModule,SharedModule],
    declarations: [CotizacionesComponent]
})
export class CotizacionesModule {}
