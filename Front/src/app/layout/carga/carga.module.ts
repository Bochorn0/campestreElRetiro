import { NgModule } from '@angular/core';
import { CargaRoutingModule } from './carga-routing.module';
import { CargaComponent } from './carga.component';
import { SharedModule } from '../../shared';

@NgModule({
    imports: [CargaRoutingModule, SharedModule],
    declarations: [CargaComponent]
})
export class CargaModule {}
