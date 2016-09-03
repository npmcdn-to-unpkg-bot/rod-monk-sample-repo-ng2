/// <reference path="../../typings/globals/require/index.d.ts" />

import { Component, ViewChild } from '@angular/core';
import { Response } from '@angular/http';
import { Router }               from '@angular/router-deprecated';
import {
    FORM_DIRECTIVES,
    REACTIVE_FORM_DIRECTIVES,
    FormBuilder,
    FormGroup,
    FormControl,
    Validators
} from '@angular/forms';
import { ButtonRadioDirective, ButtonCheckboxDirective } from 'ng2-bootstrap/components/buttons';

import { Member }               from '../models/member';
import { MemberService }        from '../services/member.service';
import { UserService }          from '../services/user.service';
import { ValidationService }    from '../services/validation.service';
import { LogService }           from '../services/log.service';
import { NormalizationService } from '../services/normalization.service';
import { MessageComponent }     from '../message/message.component';

@Component({
    selector: 'login-modal',
    directives: [ButtonCheckboxDirective, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES, MessageComponent],
    template: require('./login.modal.html'),
})

export class LoginComponent {

    @ViewChild(MessageComponent) messageModal: MessageComponent;
    public IsVisible: boolean = false;

    already_have_a_password: boolean = true;
    LoginForm: FormGroup;

    private member = new Member();

    private loginSuccessful: boolean;

    constructor(
        private memberService: MemberService,
        private userService: UserService,
        private logService: LogService,
        private _router: Router,
        fb: FormBuilder) {
        this.LoginForm = fb.group({
            'firstname': ['', Validators.compose([Validators.required])],
            'familyname': ['', Validators.compose([Validators.required])],
            'dob': ['', Validators.compose([Validators.required, ValidationService.date])],
            'postcode': ['', Validators.compose([Validators.required, ValidationService.postcode])],
            'emailaddress': ['', Validators.compose([Validators.required, ValidationService.emailAddress])],
            'password': ['', Validators.compose([Validators.required, ValidationService.password])],
            'confirmpassword': ['', Validators.compose([Validators.required, ValidationService.password])],
        });
    }

    onLogin = () => {
        this.hideForm();
        this.memberService.login(this.already_have_a_password, this.member)
            .subscribe(
            privileges => {
                this.userService.loggedIn(privileges);
                this.loginSuccessful = true;
                this.messageModal.showMessage('Login Successful!');
            },
            error => {
                this.loginSuccessful = false;
                if (error.status === 402) {
                    this.messageModal.showMessage('Account is in arrears - Login aborted');
                    console.log('Account is in arrears - Login aborted');
                } else {
                    this.messageModal.showMessage('Login Unsuccessful');
                    this.logService.logMessage('Server Failure: ' + JSON.stringify(error, null, 4));
                }
            });
    }

    onBlurPostCode = () =>
        this.member.postcode = NormalizationService.postcode(this.member.postcode);

    onBlurDoB = () =>
        this.member.dob = NormalizationService.date(this.member.dob);

    showForm = () =>
        this.IsVisible = true;

    hideForm = () =>
        this.IsVisible = false;

    messageModalClosed = (someBoolean: boolean) =>
        !this.loginSuccessful ? this.showForm() : _.noop;
}
