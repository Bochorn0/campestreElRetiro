import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UsuariosService } from '../../services/usuarios.service';
import * as moment from 'moment';
@Component({
    selector: 'app-home-info',
    templateUrl: './home-info.component.html',
    styleUrls: ['./home-info.component.scss'],
    providers:[UsuariosService]
})
export class HomeInfoComponent implements OnInit {
    // @Input() bgClass: string;
    // @Input() icon: string;
    // @Input() count: number;
    // @Input() data: number;
    @Input() label: string;
    @Output() event: EventEmitter<any> = new EventEmitter();

    constructor(private usuariosService : UsuariosService) {}

    ngOnInit() {}
    Ejecutar(){
        this.event.emit({Click: true});
    }
    downloadManual(tipo){
        this.usuariosService.obtenerManual({Nombre:tipo}).then(file=>{
            console.log('file',file);
            let string = file['String'];
            let url = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,`;
            this._downloadFile(`${url}${string}`,tipo,'docx');
        }).catch(err=>{
            console.log('err',err);
        })
    }
    _downloadFile(url, nombre,  ext) {
    //console.log('url',url);
        let dwldLink = document.createElement("a");
        let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
        if (isSafariBrowser) {
            dwldLink.setAttribute("target", "_blank");
        }
        dwldLink.setAttribute("href", url);
        dwldLink.setAttribute("download", `${nombre}.${ext}`);
        dwldLink.style.visibility = "hidden";
        document.body.appendChild(dwldLink);
        dwldLink.click();
        document.body.removeChild(dwldLink);
    }
}
