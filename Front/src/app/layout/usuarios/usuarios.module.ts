import { NgModule } from '@angular/core';
import { UsuariosRoutingModule } from './usuarios-routing.module';
import { UsuariosComponent } from './usuarios.component';
import { SharedModule} from '../../shared';
@NgModule({
    imports: [UsuariosRoutingModule, SharedModule],
    declarations: [UsuariosComponent],
}) 
export class UsuariosModule {}
