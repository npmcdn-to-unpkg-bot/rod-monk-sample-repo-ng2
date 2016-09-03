/// <reference path="../../typings/globals/require/index.d.ts" />
/// <reference path="../../typings/globals/lodash/index.d.ts" />

import { Component, OnInit, OnDestroy }    from '@angular/core';
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
import { MD_PROGRESS_BAR_DIRECTIVES } from '@angular2-material/progress-bar';
import { Observable }               from 'rxjs/Observable';
import { Subscription }             from 'rxjs/Subscription';

import { Member }               from '../models/member';
import { MemberService }        from '../services/member.service';
import { UserService }          from '../services/user.service';
import { LogService }           from '../services/log.service';

let template = require('./search-membership.component.html');

@Component({
  selector: 'sg-search-membership',
  template: template,
  directives: [MD_PROGRESS_BAR_DIRECTIVES]
})

export class SearchMembershipComponent implements OnInit /*, ToDo: OnDestroy */ {
  filteredMembers: Member[] = [];
  isLoading: boolean = false;

  constructor(
    private memberService: MemberService,
    private userService: UserService,
    private logService: LogService,
    // ToDo: private searchSubscription: Subscription,
    private router: Router) { }

  private handleError = err => {

    if (err.status === 440) {
      this.router.navigate(['Home']);
      this.userService.loggedOut();
      alert('Your Session Has Timed-Out.  You will need to Login again.');
    } else {
      let errorMessage = 'Server Failure: ' + JSON.stringify(err, null, 4);
      this.logService.logMessage(errorMessage);
      console.log('errorMessage: ', errorMessage);
      alert('Server Failure');
    }
  }

  startLoading = () =>
    this.isLoading = true;

  stopLoading = () =>
    this.isLoading = false;

  private memberFilter = (searchKey, members) => {

    this.filteredMembers = members.filter(member =>
      member.firstname.toLowerCase().includes(searchKey) ||
      member.familyname.toLowerCase().includes(searchKey) ||
      member.primaryphone.includes(searchKey) ||
      (member.alternativephone && member.alternativephone.includes(searchKey)) ||
      member.emailaddress.includes(searchKey));

      this.stopLoading();
  }

  ngOnInit() {
    const searchKey$ = Observable.fromEvent($('#searchKeyId'), 'keyup')
      .startWith(null)
      .debounceTime(400) // Wait for user to stop typing
      .map(() => $('#searchKeyId').val().toLowerCase());

    const master$ = Observable.combineLatest(searchKey$, this.memberService.getMembers(), this.memberFilter);

    // Get the membership right away
    this.startLoading();
    master$.subscribe(_.noop, this.handleError);
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    // ToDo: this.searchSubscription.unsubscribe();
  }
}
