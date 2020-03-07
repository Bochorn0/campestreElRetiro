import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaginaComponent } from './Pagina.component';

const routes: Routes = [
    {
        path: '',
        component: PaginaComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PaginaRoutingModule {}
