import { ReflectiveInjector }                   from '@angular/core';
import { BaseRequestOptions, Http,
    HTTP_PROVIDERS, Response }                  from '@angular/http';
import { Headers, RequestOptions }              from '@angular/http';
import { Observable }                           from 'rxjs';

import { UserService }                          from './user.service';
import { PlatformService }                      from './platform.service';

// ObservableService provides some common utilities required by all http services
export class ObservableService {

    protected http: Http;
    protected userService: UserService = new UserService();
    protected platformService: PlatformService = new PlatformService();

    constructor() {
        const injector = ReflectiveInjector.resolveAndCreate([HTTP_PROVIDERS]);
        this.http = injector.get(Http);
    }

    protected headerOptions = () => {
        let headers = new Headers();
        // Determine if we should provide an 'x-auth' header
        let token: string;
        this.userService && (token = this.userService.getToken()) ? headers.append('x-auth', token) : _.noop;
        this.platformService ? headers.append('device', PlatformService.descriptor) : _.noop;
        //headers.append('Content-Type', 'application/json');
        return new RequestOptions({ headers: headers });
    }

    protected jsonHeader = () => {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return new RequestOptions({ headers: headers });
    }

    protected extractData(res: any) {
        let body = res.json();
        return body || {};
    }
}