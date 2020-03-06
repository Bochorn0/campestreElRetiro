import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ModuloVentasComponent } from './Modulo_ventas.component';

const routes: Routes = [
    {
        path: '',
        component: ModuloVentasComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ModuloVentasRoutingModule {}
