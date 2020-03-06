import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'Inicio' },
            { path: 'Inicio', loadChildren: './inicio/inicio.module#InicioModule' },
            //{ path: 'Ingresos', loadChildren: './ingresos/ingresos.module#IngresosModule' },
            { path: 'Cobranza', loadChildren: './cobranza/cobranza.module#CobranzaModule' },
            { path: 'Ventas', loadChildren: './ventas/ventas.module#VentasModule' },
            { path: 'ModuloVentas', loadChildren: './Modulo_venta/Modulo_ventas.module#ModuloVentasModule' },
            { path: 'Finanzas', loadChildren: './finanzas/finanzas.module#FinanzasModule' },
            { path: 'Cotizaciones', loadChildren: './cotizaciones/cotizaciones.module#CotizacionesModule' },
            { path: 'Egresos', loadChildren: './egresos/egresos.module#EgresosModule' },
            //{ path: 'Cuentas', loadChildren: './catalogo-cuentas/catalogo-cuentas.module#CatalogoCuentasModule' },            
            //{ path: 'Contratos', loadChildren: './contratos/contratos.module#ContratosModule' },
            { path: 'Empleados', loadChildren: './empleados/empleados.module#EmpleadosModule' },
            //{ path: 'ControlDocumentos', loadChildren: './documentos/documentos.module#DocumentosModule' },
            { path: 'Usuarios', loadChildren: './usuarios/usuarios.module#UsuariosModule' },
            { path: 'Catalogos', loadChildren: './catalogos/catalogos.module#CatalogosModule' },
            { path: 'Reportes', loadChildren: './reportes/reportes.module#ReportesModule' },
            { path: 'Carga', loadChildren: './carga/carga.module#CargaModule' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule {}
