import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FinanzasComponent } from './finanzas.component';

const routes: Routes = [
    {
        path: '',
        component: FinanzasComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FinanzasRoutingModule {}
