/// <reference path="../../typings/globals/require/index.d.ts" />

import { Component, ViewChild } from '@angular/core';
import { Response }             from '@angular/http';
import { Router }               from '@angular/router-deprecated';
import { Member }               from '../models/member';
import { MemberService }        from '../services/member.service';
import { UserService }          from '../services/user.service';
import { LogService }           from '../services/log.service';
import { ValidationService }    from '../services/validation.service';
import { MessageComponent }     from '../message/message.component';
import {
    FORM_DIRECTIVES,
    REACTIVE_FORM_DIRECTIVES,
    FormBuilder,
    FormGroup,
    FormControl,
    Validators
} from '@angular/forms';
import { LiabilityAgreementComponent }       from '../liability-agreement/liability-agreement.modal';
import { CommunicationsConsentComponent }    from '../communications-consent/communications-consent.modal';

@Component({
    selector: 'renew-membership-modal',
    template: require('./renew-membership.modal.html'),
    styles: ['.panel-heading {background-image: url("/assets/images/panel_header.png"); color: white; }'],
    directives: [
        FORM_DIRECTIVES,
        REACTIVE_FORM_DIRECTIVES,
        MessageComponent,
        LiabilityAgreementComponent,
        CommunicationsConsentComponent]
})

export class RenewMembershipComponent {

    @ViewChild(MessageComponent) messageModal: MessageComponent;
    @ViewChild(LiabilityAgreementComponent) liabilityAgreement: LiabilityAgreementComponent;
    @ViewChild(CommunicationsConsentComponent) communicationsConsent: CommunicationsConsentComponent;

    public IsVisible: boolean = false;
    RenewMembershipForm: FormGroup;
    private member = new Member();

    constructor(
        private memberService: MemberService,
        private userService: UserService,
        private router: Router,
        private logService: LogService,
        fb: FormBuilder) {
        this.RenewMembershipForm = fb.group({
            'liabilityagreed': [''],
            'communicationsagreed': [''],
            'photoagreed': [''],
            'student': [''],
            'familyemailaddress': [''],
            'joiningyear': ['', Validators.compose([Validators.required, ValidationService.joiningYear])],
        });
    }

    ngOnInit() {
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

    showForm = () =>
        this.memberService.getMember()
            .subscribe(member => {
                this.member = member;
                // Member must reaffirm liability and comms agreements every year
                this.member.liabilityagreed = false;
                this.member.communicationsagreed = false;
                this.IsVisible = true;
            },
            error => this.handleError(error));

    hideForm = () =>
        this.IsVisible = false;

    Renew = () => {
        this.hideForm();
        this.memberService.renewMembership(this.member)
            .subscribe(
            () => {
                this.messageModal.showMessage('Your application to renew your membership has been saved.');
                this.hideForm();
            },
            error => this.handleError(error));
    }

    messageModalClosed = (unusedBoolean: boolean) =>
        _.noop;

    showLiabilityAgreement = () => {
        this.liabilityAgreement.showModal();
        this.hideForm();
    }

    liabilityAgreementClosed = (unusedBoolean: boolean) =>
        this.showForm();

    showCommunicationsConsent=() => {
        this.communicationsConsent.showModal();
        this.hideForm();
    }

    communicationsConsentClosed=() => 
        this.showForm();
}
