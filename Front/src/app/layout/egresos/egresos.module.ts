import { NgModule } from '@angular/core';
import { EgresosRoutingModule } from './egresos-routing.module';
import { EgresosComponent } from './egresos.component';
import { SharedModule} from '../../shared';
@NgModule({
    imports: [EgresosRoutingModule, SharedModule],
    declarations: [EgresosComponent],
}) 
export class EgresosModule {}
