import { ExceptionHandler, provide } from '@angular/core';
import { ROUTER_PROVIDERS } from '@angular/router-deprecated';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { bootstrap } from '@angular/platform-browser-dynamic';
import { AppComponent } from './app.component';
import { BaseRequestOptions, Http, HTTP_PROVIDERS, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { enableProdMode } from '@angular/core';
import { disableDeprecatedForms, provideForms } from '@angular/forms';
import { servicesInjectables } from './services/services';

class AppExceptionHandler {

    call(error, stackTrace = null, reason = null) {
        console.log('App Detected Error');
        if (error.stack) {
            console.log('error: ', error.stack);
        }
        // ToDo: Send a log message to the server, probably a POST /api/log
    }
}

// ToDo: enableProdMode(); 

class AppHttpOptions extends BaseRequestOptions {

    public headers: Headers;
    constructor() {
        super();
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
    }
};

bootstrap(AppComponent, [
    HTTP_PROVIDERS,
    provide(RequestOptions, { useClass: AppHttpOptions }),
    servicesInjectables,
    disableDeprecatedForms(),
    provideForms(),
    ROUTER_PROVIDERS,
    provide(ExceptionHandler, { useClass: AppExceptionHandler }),
    provide(LocationStrategy, { useClass: HashLocationStrategy })
]);
