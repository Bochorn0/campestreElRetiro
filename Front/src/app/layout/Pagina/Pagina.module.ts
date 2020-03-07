import { NgModule } from '@angular/core';
import { PaginaRoutingModule } from './Pagina-routing.module';
import { PaginaComponent } from './Pagina.component';
import { SharedModule } from '../../shared';
import { NgbTabsetModule} from '@ng-bootstrap/ng-bootstrap';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';

@NgModule({
    imports: [ PaginaRoutingModule, SharedModule, NgbTabsetModule.forRoot(), FroalaEditorModule.forRoot(), FroalaViewModule.forRoot(), ],
    declarations: [ PaginaComponent]
})

export class PaginaModule {}
