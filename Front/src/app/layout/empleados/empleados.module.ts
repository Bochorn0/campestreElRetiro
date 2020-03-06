import { NgModule } from '@angular/core';
import { EmpleadosRoutingModule } from './empleados-routing.module';
import { EmpleadosComponent } from './empleados.component';
import { SharedModule } from './../../shared';


@NgModule({
    imports: [EmpleadosRoutingModule,SharedModule],
    declarations: [EmpleadosComponent]
})
export class EmpleadosModule {}
