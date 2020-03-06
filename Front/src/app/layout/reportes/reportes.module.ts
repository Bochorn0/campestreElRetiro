import { NgModule } from '@angular/core';
import { ReportesRoutingModule } from './reportes-routing.module';
import { ReportesComponent } from './reportes.component';
import { SharedModule } from '../../shared';


@NgModule({
    imports: [ ReportesRoutingModule, SharedModule ],
    declarations: [ ReportesComponent]
})
export class ReportesModule {}
