import { NgModule } from '@angular/core';
import { InicioRoutingModule } from './inicio-routing.module';
import { InicioComponent } from './inicio.component';
import { SharedModule } from '../../shared';

@NgModule({
    imports: [ InicioRoutingModule, SharedModule],
    declarations: [ InicioComponent]
})
export class InicioModule {}
