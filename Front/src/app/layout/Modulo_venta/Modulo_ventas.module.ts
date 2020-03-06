import { NgModule } from '@angular/core';
import { ModuloVentasRoutingModule } from './Modulo_ventas-routing.module';
import { ModuloVentasComponent } from './Modulo_ventas.component';
import { SharedModule } from '../../shared';
import { FullCalendarModule } from '@fullcalendar/angular';
import { AgmCoreModule } from '@agm/core';

@NgModule({
    imports: [ ModuloVentasRoutingModule, SharedModule,FullCalendarModule ,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyAoFHWCLKIAuLExC4zRgOMrB-r0XtwxnO8'
            })
        ],
    declarations: [ ModuloVentasComponent]
})

export class ModuloVentasModule {}
