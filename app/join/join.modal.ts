/// <reference path="../../typings/globals/require/index.d.ts" />

import { Component, ViewChild, OnInit } from '@angular/core';
import {
    FORM_DIRECTIVES,
    REACTIVE_FORM_DIRECTIVES,
    FormBuilder,
    FormGroup,
    FormControl,
    Validators
} from '@angular/forms';

import { Member }                           from '../models/member';
import { MemberService }                    from '../services/member.service';
import { ValidationService }                from '../services/validation.service';
import { LogService }                       from '../services/log.service';
import { BaseEditor }                       from '../base-editor/base-editor.component';
import { MessageComponent }                 from '../message/message.component';
import { LiabilityAgreementComponent }      from '../liability-agreement/liability-agreement.modal';
import { CommunicationsConsentComponent }   from '../communications-consent/communications-consent.modal';

@Component({
    selector: 'join-modal',
    directives: [
        FORM_DIRECTIVES,
        REACTIVE_FORM_DIRECTIVES,
        MessageComponent,
        LiabilityAgreementComponent,
        CommunicationsConsentComponent],
    template: require('./join.modal.html')
})

export class JoinComponent extends BaseEditor implements OnInit {

    @ViewChild(MessageComponent) messageModal: MessageComponent;
    @ViewChild(LiabilityAgreementComponent) liabilityAgreement: LiabilityAgreementComponent;
    @ViewChild(CommunicationsConsentComponent) communicationsConsent: CommunicationsConsentComponent;
    private successfulSave = true;
    private IsVisible = false;

    ttcFormGroup: FormGroup;

    constructor(
        public memberService: MemberService,
        private logService: LogService,
        fb: FormBuilder) {
        super();
        this.ttcFormGroup = fb.group({
            'firstname': ['', Validators.compose([Validators.required])],
            'familyname': ['', Validators.compose([Validators.required])],
            'dob': ['', Validators.compose([Validators.required, ValidationService.date])],
            'address': ['', Validators.compose([Validators.required])],
            'place': ['', Validators.compose([Validators.required])],
            'postcode': ['', Validators.compose([Validators.required, ValidationService.postcode])],
            'emailaddress': ['', Validators.compose([Validators.required, ValidationService.emailAddress])],
            'primaryphone': ['', Validators.compose([Validators.required])],
            'alternativephone': [''],
            'liabilityagreed': [''],
            'communicationsagreed': [''],
            'photoagreed': [''],
            'student': [''],
            'familyemailaddress': [''],
        });
    }

    showForm = () =>
        this.IsVisible = true;

    hideForm = () =>
        this.IsVisible = false;

    hideLiabilityAgreement = () =>
        this.showForm();

    Join = () =>
        this.memberService.saveNewMember(this.member)
            .subscribe(
            () => {
                this.hideForm();
                this.successfulSave = true;
                this.messageModal.showMessage(`
                Your application to Join the Tsawwassen Tennis Club has been saved.  
                Once payment is received you will be able to Login.`);
            },
            error => {
                this.hideForm();
                this.successfulSave = false;
                if (error.status === 412) {
                    this.messageModal.showMessage('Our records show that you have already applied or that you are already a member.  ' +
                        'If you are already a member, please Login and renew your membership.  ' +
                        'Please contact the TTC webmaster if you cannot resolve the problem.');
                } else {
                    this.logService.logMessage('Server Failure: ' + JSON.stringify(error, null, 4));
                    console.log('Server Failure: ' + JSON.stringify(error, null, 4));
                }
            });

    ngOnInit() {
    }

    messageModalClosed = (unusedBoolean: boolean) => {
        if (!this.successfulSave) {
            this.showForm();
        }
    }

    showLiabilityAgreement() {
        this.liabilityAgreement.showModal();
        this.hideForm();
    }

    liabilityAgreementClosed = (unusedBoolean: boolean) =>
        this.showForm();

    showCommunicationsConsent = () => {
        this.communicationsConsent.showModal();
        this.hideForm();
    }

    communicationsConsentClosed = () =>
        this.showForm();
}
