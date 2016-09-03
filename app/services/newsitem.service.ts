/// <reference path="../../typings/globals/es6-shim/index.d.ts" />

import { bind, Injectable }         from '@angular/core';
import { Http, Response }           from '@angular/http';
import { Observable }               from 'rxjs/Observable';

import { ObservableService }        from './observable.service';
import { UserService }              from './user.service';
import { PlatformService }          from './platform.service';
import { NewsItem }                 from '../models/newsitem';

import 'rxjs/Rx';

@Injectable()
export class NewsItemService extends ObservableService {

    constructor() { super(); }

    getNewObjectId = () =>
        // Get a new ObjectId to identify the new News Item
        this.http.get('/api/newobject', this.headerOptions()).map(this.extractData);

    getAll = () =>
        this.http.get('/api/newsitems').map(this.extractData);

    removeNewsItem = (newsItemId: string) =>
        this.http.delete('/api/newsitems/' + newsItemId, this.headerOptions());

    publishNewsItem = (newsItem: NewsItem) =>
        this.http.post('/api/newsitems', JSON.stringify(newsItem), this.headerOptions());

    retrieveFiles = (newsItemId: string) =>
        this.http.get('/api/newsitems/' + newsItemId + '/files').map(this.extractData);

    uploadImages = (files: File[], newsItemId: string) =>
        new Promise((resolve, reject) => {
            let formData: any = new FormData();
            let xhr = new XMLHttpRequest();

            files.forEach((file: any) =>
                formData.append('uploads[]', file, file.name));

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(null);
                    } else {
                        reject(xhr.response);
                    }
                }
            };
            xhr.open('POST', '/api/newsitems/' + newsItemId + '/upload', true);
            xhr.setRequestHeader('x-auth', this.userService.getToken());
            xhr.send(formData);
        });
}

export var newsItemServiceInjectables: Array<any> = [
    bind(NewsItemService).toClass(NewsItemService)
];

