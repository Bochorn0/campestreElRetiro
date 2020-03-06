import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CobranzaComponent } from './cobranza.component';

const routes: Routes = [
    {
        path: '',
        component: CobranzaComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CobranzaRoutingModule {}
