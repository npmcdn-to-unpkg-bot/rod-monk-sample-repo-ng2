import { bind, Injectable }         from '@angular/core';
import { Http, Response }           from '@angular/http';
import { Headers, RequestOptions }  from '@angular/http';
import { Observable }               from 'rxjs/Observable';

import { ObservableService }        from './observable.service';
import { UserService }              from './user.service';
import { PlatformService }          from './platform.service';

@Injectable()
export class DocumentService extends ObservableService {

    constructor() { super(); }

    refreshDocumentList = () =>
        this.http.get('/api/documents', this.headerOptions()).map(this.extractData);


    removeDocument = (id: string) =>
        // The selected document is removed and the updated list is sent back
        this.http.delete('/api/documents/' + id, this.headerOptions()).map(this.extractData);

    uploadDocuments = (files: File[]) =>
        new Promise((resolve, reject) => {
            let formData: any = new FormData();
            let xhr = new XMLHttpRequest();
            files.forEach(file => 
                formData.append('uploads[]', file, file.name));
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(JSON.parse(xhr.response));
                    } else {
                        reject(xhr.response);
                    }
                }
            };
            xhr.open('POST', '/api/documents/upload', true);
            xhr.setRequestHeader('x-auth', this.userService.getToken());
            xhr.send(formData);
        });
}

export var documentServiceInjectables: Array<any> = [
    bind(DocumentService).toClass(DocumentService)
];
