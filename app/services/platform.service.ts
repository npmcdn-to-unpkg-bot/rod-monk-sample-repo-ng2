/// <reference path="../platform.d.ts" />

import { bind, Injectable }   from '@angular/core';

let platform = require('platform');

@Injectable()
export class PlatformService {

    public static os: string;
    public static device: string;
    public static browser: string;
    public static descriptor: string;

    static init = () => {

        PlatformService.browser = platform.name;

        if (PlatformService.browser.includes('Chrome')) {
            PlatformService.browser = 'Chrome';
        }

        if (platform.os.family === 'OS X') {
            PlatformService.device = 'Mac';
            PlatformService.os = 'OSX';
        } else {
            PlatformService.device = platform.product;
            PlatformService.os = platform.os.family;
        }

        PlatformService.descriptor =
            PlatformService.device + '-' + PlatformService.os + '-' + PlatformService.browser;

        return PlatformService.descriptor;
    }
}

export var platformServiceInjectables: Array<any> = [
    bind(PlatformService).toClass(PlatformService)
];

