/// <reference path="../../typings/globals/require/index.d.ts" />

import { Component }        from '@angular/core';
import { CORE_DIRECTIVES }  from '@angular/common';
import { Router }           from '@angular/router-deprecated';
import { UserService }      from '../services/user.service';
import { MemberService }    from '../services/member.service';

@Component({
    selector: 'logout-modal',
    directives: [CORE_DIRECTIVES],
    template: require('./logout.modal.html'),
})

export class LogoutComponent {

    public IsVisible: boolean = false;

    constructor(
        private userService: UserService,
        private memberService: MemberService,
        public router: Router
    ) { }

    onLogout = () => {
        this.hideForm();
        this.userService.loggedOut();
        this.memberService.logout();
        this.router.navigate(['Home']);
    }

    showForm = () =>
        this.IsVisible = true;

    hideForm = () =>
        this.IsVisible = false;
}
