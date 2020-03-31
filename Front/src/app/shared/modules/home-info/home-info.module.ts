import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeInfoComponent } from './home-info.component';

@NgModule({
    imports: [CommonModule],
    declarations: [HomeInfoComponent],
    exports: [HomeInfoComponent]
})
export class HomeInfoModule {}
