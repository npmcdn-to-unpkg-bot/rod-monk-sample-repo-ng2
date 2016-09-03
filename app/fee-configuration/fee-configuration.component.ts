/// <reference path="../../typings/globals/lodash/index.d.ts" />
/// <reference path="../../typings/globals/es6-shim/index.d.ts" />
/// <reference path="../../typings/globals/require/index.d.ts" />

import { Component, ViewChild, OnInit }     from '@angular/core';
import { Response }                         from '@angular/http';
import { MD_PROGRESS_BAR_DIRECTIVES }       from '@angular2-material/progress-bar';
import { Observable }                       from 'rxjs/Observable';

import { Member }                           from '../models/member';
import { Renewal }                          from '../models/renewal';
import { MemberService }                    from '../services/member.service';
import { UserService }                      from '../services/user.service';
import { LogService }                       from '../services/log.service';
import { ConfirmDeleteComponent }           from '../confirm-delete/confirm-delete.component';
import { Router }                           from '@angular/router-deprecated';
import * as _                               from 'lodash';
import * as moment                          from 'moment';

@Component({
    selector: 'fee-configuration',
    template: require('./fee-configuration.component.html'),
    directives: [ConfirmDeleteComponent, MD_PROGRESS_BAR_DIRECTIVES]
})

export class FeeConfigurationComponent implements OnInit {

    @ViewChild(ConfirmDeleteComponent) confirmDelete: ConfirmDeleteComponent;

    accountingYear: number = moment().year();
    private isLoading: boolean = false;

    filteredMembers: Member[] = [];
    removeMemberIdCandidate: string;

    private searchKey: string = '';
    private unpaidonly = false;
    private notRenewedOnly = false;

    private master$: Observable<any>;

    constructor(
        private memberService: MemberService,
        private userService: UserService,
        private logService: LogService,
        private router: Router) {
    }

    private handleError = (err: Response) => {

        if (err.status === 440) {
            this.router.navigate(['Home']);
            this.userService.loggedOut();
            alert('Your Session Has Timed-Out.  You will need to Login again.');
        } else {
            this.logService.logMessage('Server Failure: ' + JSON.stringify(err, null, 4));
            alert('Server Failure');
        }
    }

    startLoading = () => {
        console.log('startLoading')
        this.isLoading = true;
    }

    stopLoading = () =>
        this.isLoading = false;

    toggleStudent = (member: Member) => {
        this.startLoading();
        member.student = !member.student;
        this.memberService.saveMember(member)
            .subscribe(_.noop, this.handleError, this.stopLoading);
    }

    selectExec = (member: Member) => {
        this.startLoading();
        this.memberService.saveMember(member)
            .subscribe(_.noop, this.handleError, this.stopLoading);
    }

    selectRole = (member: Member) => {
        this.startLoading();
        this.memberService.saveMember(member)
            .subscribe(_.noop, this.handleError, this.stopLoading);
    }

    updateFamilyEmailAddress = (member: Member) => {
        // Ensure that the specified family email address is actually known
        if (member.familyemailaddress === '' || _.map(this.members, 'emailaddress').indexOf(member.familyemailaddress) >= 0) {
            this.startLoading();
            this.memberService.saveMember(member)
                .subscribe(_.noop, this.handleError, this.stopLoading);
        } else {
            alert('Family Email Address is Unknown - Not Saved');
        }
    }

    private memberFilter = (
        unpaidOnly: boolean,
        notRenewedOnly: boolean,
        accountingYear: number,
        searchKey: string,
        members: Array<Member>,
        renewals: Array<Renewal>) => {

        // console.log(`${unpaidOnly}, ${notRenewedOnly}, ${accountingYear}, searchKey: ${searchKey}, members.length: ${members.length}, renewals.length: ${renewals.length}`);

        // Isolate only renewals for 'accountingYear' and then merge with member records
        members.forEach(member => {
            member.paid = renewals.some(renewal =>
                member._id === renewal.memberId && renewal.year === Number(accountingYear) && renewal.paid === true);
            member.renewed = renewals.some(renewal =>
                member._id === renewal.memberId && renewal.year === Number(accountingYear) && renewal.renewed === true);
        });

        this.filteredMembers = members.filter(member =>
            (!unpaidOnly || (unpaidOnly && !member.paid)) &&
            (!notRenewedOnly || (notRenewedOnly && !member.renewed)) &&
            (member.firstname.toLowerCase().includes(searchKey) ||
                member.familyname.toLowerCase().includes(searchKey) ||
                member.primaryphone.includes(searchKey) ||
                (member.alternativephone && member.alternativephone.includes(searchKey)) ||
                member.emailaddress.includes(searchKey)));

        this.stopLoading();
    }

    ngOnInit() {

        const unpaidOnly$ = Observable.fromEvent($('#unpaidOnlyId'), 'click')
            .startWith(false)
            .map(() => $('#unpaidOnlyId').is(":checked"));

        const notRenewedOnly$ = Observable.fromEvent($('#notRenewedOnlyId'), 'click')
            .startWith(false)
            .map(() => this.notRenewedOnly = $('#notRenewedOnlyId').is(":checked"));

        const accountingYear$ = Observable.fromEvent($('#accountingYearId'), 'input')
            .startWith(moment().year())
            .map(() => $('#accountingYearId').val());

        const searchKey$ = Observable.fromEvent($('#searchKeyId'), 'keyup')
            .startWith(null)
            .debounceTime(400)
            .map(() => $('#searchKeyId').val().toLowerCase());

        const members$ = this.memberService.getMembers();

        this.master$ = Observable
            .combineLatest(unpaidOnly$, notRenewedOnly$, accountingYear$, searchKey$, members$, this.memberService.getRenewals(), this.memberFilter);

        // Get the membership right away
        this.startLoading();
        this.master$.subscribe(_.noop, this.handleError);
    }

    removeMember = (member: any) => {
        // Take note of the _id so that we know which document to delete it after user confirmation
        this.removeMemberIdCandidate = member._id;
        this.confirmDelete.showMessage('Please confirm that you wish to delete member `' + member.firstname + ' ' + member.familyname + '`');
    }

    removeMemberIdCandidateLocally = () =>
        // Remove the member from both the master and the filtered list
        this.filteredMembers = this.filteredMembers.filter((x: any) => x._id !== this.removeMemberIdCandidate);

    confirmDeleteClosed = (isConfirmed: boolean) => {
        if (isConfirmed) {
            this.startLoading();
            this.memberService.deleteMember(this.removeMemberIdCandidate)
                .subscribe(this.removeMemberIdCandidateLocally, this.handleError, this.stopLoading);
        }
    }

    togglePaid = (member: Member) => {
        this.startLoading();
        this.memberService.updateRenewal({ memberId: member._id, year: Number(this.accountingYear), paid: !member.paid })
            .mergeMap(() => this.master$)
            .subscribe(_.noop, this.handleError, this.stopLoading);
    }
}
