/// <reference path="../../typings/globals/require/index.d.ts" />

import { Component, ViewChild } from '@angular/core';
import { Response }             from '@angular/http';
import { Router }               from '@angular/router-deprecated';
import {
    FORM_DIRECTIVES,
    REACTIVE_FORM_DIRECTIVES,
    FormBuilder,
    FormGroup,
    FormControl,
    Validators
} from '@angular/forms';

import { MemberService }        from '../services/member.service';
import { UserService }          from '../services/user.service';
import { ValidationService }    from '../services/validation.service';
import { LogService } 			from '../services/log.service';
import { MessageComponent }     from '../message/message.component';

@Component({
    selector: 'change-password-modal',
    directives: [
        FORM_DIRECTIVES,
        REACTIVE_FORM_DIRECTIVES,
        MessageComponent],
    templateUrl: 'app/change-password/change-password.modal.html'
})

export class ChangePasswordComponent {

    @ViewChild(MessageComponent) messageModal: MessageComponent;
    private IsVisible: boolean;

    ChangePasswordForm: FormGroup;

    private changepassword = { first: '', second: '' };

    constructor(private memberService: MemberService,
        private userService: UserService,
        private logService: LogService,
        private router: Router,
        fb: FormBuilder) {
        this.ChangePasswordForm = fb.group({
            'newpassword': ['', Validators.compose([Validators.required, ValidationService.password])],
            'confirmpassword': ['', Validators.compose([Validators.required, ValidationService.password])],
        });
    }

    handleError = (err: Response) => {
        if (err.status === 440) {
            this.router.navigate(['Home']);
            this.userService.loggedOut();
            this.messageModal.showMessage('Your Session Has Timed-Out.  You will need to Login again.');
        } else {
            this.logService.logMessage('Server Failure: ' + JSON.stringify(err, null, 4));
            this.messageModal.showMessage('Server Failure');
        }
    }

    ChangePassword = () => {
        this.hideForm();
        this.memberService.changePassword(this.changepassword.first)
            .subscribe(
            () => this.messageModal.showMessage('Your TTC password has been changed.'),
            error => this.handleError(error));
    }

    showForm = () =>
        this.IsVisible = true;

    hideForm = () =>
        this.IsVisible = false;

    messageModalClosed = (unusedBoolean: boolean) =>
        _.noop;
}
