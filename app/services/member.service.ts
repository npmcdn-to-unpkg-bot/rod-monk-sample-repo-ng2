/// <reference path="../../typings/globals/es6-shim/index.d.ts" />

import { bind, Injectable }         from '@angular/core';
import { Http, Response }           from '@angular/http';
import { Headers, RequestOptions }  from '@angular/http';
import { Observable }               from 'rxjs/Observable';

import { ObservableService }        from './observable.service';
import { UserService }              from './user.service';
import { Member }                   from '../models/member';
import { Renewal }                  from '../models/renewal';
import { PlatformService }          from '../services/platform.service';

@Injectable()
export class MemberService extends ObservableService {

  constructor() { super(); }

  getMember = (): Observable<Member> =>
    this.http.get('/api/members/' + this.userService.getToken(), this.headerOptions()).map(this.extractData)

  getMembers = (): Observable<Member[]> =>
    this.http.get('/api/members', this.headerOptions())
      .map(this.extractData)
      .map(members => _.orderBy(members, (member: any) => member.familyname.toLowerCase(), 'asc'))
      // Do some cleaning for prsentation
      .map(members => members.map(member => {
        member.firstname = _.capitalize(member.firstname);
        member.familyname = _.capitalize(member.familyname);
        member.dob = _.isUndefined(member.dob) || member.dob.length < 10 ? null : member.dob.slice(0, 10);
        return member;
      }));

  getMembersAndRenewals = () =>
    // Wait for both sets of data to arrive
    Observable.forkJoin(this.getMembers(), this.getRenewals());

  getRenewals = (): Observable<Renewal[]> =>
    this.http.get('/api/renewals', this.headerOptions()).map(this.extractData);

  updateRenewal = (renewal: any) =>
    this.http.put('/api/renewals', renewal, this.headerOptions());

  deleteMember = (id: string) =>
    this.http.delete('/api/members/' + id, this.headerOptions());

  getMemberCount = (): Observable<number> =>
    this.http.get('/api/members/count').map(this.extractData);

  saveMember = (member: Member) =>
    this.http.put('/api/members/' + this.userService.getToken(), member, this.headerOptions());

  renewMembership = (member: Member) =>
    this.http.put('/api/members/' + this.userService.getToken() + '/renew', member, this.headerOptions());

  saveNewMember = (member: Member) =>
    this.http.post('/api/members', member, this.headerOptions());

  changePassword = (newPassword: string) =>
    this.http.post('/api/members/' + this.userService.getToken() + '/change-password', { password: newPassword }, this.headerOptions())

  login = (existingPassword: boolean, member: Member) =>
    this.http.post(
      existingPassword ? '/api/members/login' : '/api/members/signup', member, this.headerOptions()).map(this.extractData);

  logout = () =>
    this.http.post('/api/members/logout', null);
}

export var memberServiceInjectables: Array<any> = [
  bind(MemberService).toClass(MemberService)
];


