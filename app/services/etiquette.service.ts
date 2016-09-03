import { bind, Injectable }         from '@angular/core';
import { Observable }               from 'rxjs/Observable';
import { ObservableService }        from './observable.service';

@Injectable()
export class EtiquetteService extends ObservableService {

    constructor() { super(); }

    getEtiquette = (): Observable<any> =>
        this.http.get('/api/etiquette').map(this.extractData);
}

export var etiquetteServiceInjectables: Array<any> = [
    bind(EtiquetteService).toClass(EtiquetteService)
];
