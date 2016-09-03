/// <reference path="../../typings/globals/moment/index.d.ts" />

import { bind, Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';


@Injectable()
export class ValidationService {

    static password = (control: FormControl): { [s: string]: boolean } =>
        !control.value || control.value.length < 8 || control.value.length > 16 ? { invalidPassword: true } : null;

    private static POSTCODE_REGEXP = /^([abceghjklmnprstvxyABCEGHJKLMNPRSTVXY]\d[a-zA-Z]\s?\d[a-zA-Z]\d|[0-9]{5}(?:-[0-9]{4})?)$/;

    public static postcode = (control: FormControl): { [s: string]: boolean } =>
        !ValidationService.POSTCODE_REGEXP.test(control.value) ? { invalidPostCode: true } : null;

    private static EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    public static emailAddress = (control: FormControl): { [s: string]: boolean } =>
        !ValidationService.EMAIL_REGEXP.test(control.value) ? { invalidEmailAddress: true } : null;


    public static joiningYear = (control: FormControl): { [s: string]: boolean } =>
        control.value < 1970 || control.value > moment().year() ? { invalidJoiningYear: true } : null;

    private static DATE_REGEXP = /^\d{4}-\d{2}-\d{2}$/i;
    public static date = (control: FormControl): { [s: string]: boolean } =>
        !ValidationService.DATE_REGEXP.test(control.value) ? { invalidDate: true } : null;
}

export var validationServiceInjectables: Array<any> = [
    bind(ValidationService).toClass(ValidationService)
];

