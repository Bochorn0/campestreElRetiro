import { NgModule } from '@angular/core';
import { CobranzaRoutingModule } from './cobranza-routing.module';
import { CobranzaComponent } from './cobranza.component';
import { SharedModule } from '../../shared';


@NgModule({
    imports: [ CobranzaRoutingModule, SharedModule ],
    declarations: [ CobranzaComponent]
})
export class CobranzaModule {}
