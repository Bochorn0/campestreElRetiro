import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-home-info',
    templateUrl: './home-info.component.html',
    styleUrls: ['./home-info.component.scss']
})
export class HomeInfoComponent implements OnInit {
    // @Input() bgClass: string;
    // @Input() icon: string;
    // @Input() count: number;
    // @Input() data: number;
    @Input() label: string;
    @Output() event: EventEmitter<any> = new EventEmitter();

    constructor() {}

    ngOnInit() {}
    Ejecutar(){
        this.event.emit({Click: true});
    }
}
