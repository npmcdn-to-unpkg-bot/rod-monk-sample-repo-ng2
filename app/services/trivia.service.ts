import { bind, Injectable }         from '@angular/core';
import { Observable }               from 'rxjs/Observable';
import { ObservableService }        from './observable.service';

@Injectable()
export class TriviaService extends ObservableService {

    constructor() { super(); }

    getTrivia = (): Observable<any> =>
        this.http.get('/api/trivia').map(this.extractData);
}

export var triviaServiceInjectables: Array<any> = [
    bind(TriviaService).toClass(TriviaService)
];
