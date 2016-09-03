import { bind, Injectable }         from '@angular/core';
import { Observable }               from 'rxjs/Observable';

import { ObservableService }        from './observable.service';

@Injectable()
export class LogService extends ObservableService {

    constructor() { super(); }

    logMessage = (message: string) =>
        this.http.post('/api/log', { message: message });
}

export var logServiceInjectables: Array<any> = [
    bind(LogService).toClass(LogService)
];
