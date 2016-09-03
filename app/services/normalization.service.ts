/// <reference path="../../typings/globals/moment/index.d.ts" />

import { bind, Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable()
export class NormalizationService {

    static phoneNumber = (phonenumber: string) => {
        if (phonenumber) {

            // Normalize to the form 999-999-9999
            let digitsOnly = phonenumber.replace(/[^a-zA-Z 0-9]+/g, '');

            if (digitsOnly.length !== 10) {
                return phonenumber;	// Leave things untouched
            }
            return digitsOnly.slice(0, 3) + '-' + digitsOnly.slice(3, 6) + '-' + digitsOnly.slice(6);
        }
    }

    static date = (dob: string) => {
        if (dob) {
            // Normalize to the form YYYY-MM-DD
            let digitsOnly = dob.replace(/[^a-zA-Z 0-9]+/g, '');

            if (digitsOnly.length !== 8) {
                return dob;	// Leave things untouched
            }
            return digitsOnly.slice(0, 4) + '-' + digitsOnly.slice(4, 6) + '-' + digitsOnly.slice(6);
        }
    }

    static postcode = (postcode: string) =>
        postcode.replace(' ', '').toUpperCase();

}

export var normalizationServiceInjectables: Array<any> = [
    bind(NormalizationService).toClass(NormalizationService)
];
