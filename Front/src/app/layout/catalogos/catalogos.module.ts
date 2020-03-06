import { NgModule } from '@angular/core';
import { CatalogosRoutingModule } from './catalogos-routing.module';
import { CatalogosComponent } from './catalogos.component';
import { SharedModule } from '../../shared';

@NgModule({
    imports: [CatalogosRoutingModule, SharedModule],
    declarations: [CatalogosComponent]
})
export class CatalogosModule {}
