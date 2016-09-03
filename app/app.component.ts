/// <reference path="../typings/globals/require/index.d.ts" />
/// <reference path="../typings/globals/jquery/index.d.ts" />
/// <reference path="../typings/globals/jquery.simplemodal/index.d.ts" />

import { Component, ViewChild } from '@angular/core';
import { RouteConfig, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { CORE_DIRECTIVES } from '@angular/common';

import { MemberService }                from './services/member.service';
import { UserService }                  from './services/user.service';
import { LogService }                   from './services/log.service';
import { NewsItemService }              from './services/newsitem.service';
import { PlatformService }              from './services/platform.service';
import { DocumentService }              from './services/document.service';
import { SearchMembershipComponent }    from './search-membership/search-membership.component';
import { HomeComponent }                from './home/home.component';
import { CalendarComponent }            from './calendar/calendar.component';
import { NewsItemComponent }            from './newsitem/newsitem.component';
import { AboutUsComponent }             from './about-us/about-us.component';
import { LoginComponent }               from './login/login.modal';
import { LogoutComponent }              from './logout/logout.modal';
import { FeeManagerComponent }          from './fee-manager/fee-manager.component';
import { FeeConfigurationComponent }    from './fee-configuration/fee-configuration.component';
import { ChangePasswordComponent }      from './change-password/change-password.modal';
import { JoinComponent }                from './join/join.modal';
import { PersonalProfileComponent }     from './personal-profile/personal-profile.modal';
import { RenewMembershipComponent }     from './renew-membership/renew-membership.modal';
import { MessageComponent }             from './message/message.component';
import { DocumentManagerComponent }     from './document-manager/document-manager.component';
import { NewsItemManagerComponent }     from './newsitem-manager/newsitem-manager.modal';
import { ContactUsComponent }           from './contact-us/contact-us.component';
import { OnlineHelpComponent }          from './online-help/online-help.component';
import { TableSectionComponent }        from './table-demo/table-section';
import { SchedulerComponent }           from './scheduler/scheduler.component';
import { TriviaService }                from './services/trivia.service';
import { EtiquetteService }             from './services/etiquette.service';

import './app.component.css';

@Component({
  selector: 'app',
  template: require('./app.component.html'),
  /*styleUrls: [
    '../app/app.component.css',
    // '../node_modules/primeui/themes/omega/theme.css',
    // '../node_modules/primeui/primeui-ng-all.min.css',
    // '../node_modules/fullcalendar/dist/fullcalendar.css',
    // '../node_modules/fullcalendar/dist/fullcalendar.print.css',
    // '../node_modules/fullcalendar-scheduler/dist/scheduler.css',
  ],*/
  directives: [
    CORE_DIRECTIVES,
    ROUTER_DIRECTIVES,
    JoinComponent,
    PersonalProfileComponent,
    RenewMembershipComponent,
    ChangePasswordComponent,
    LoginComponent,
    LogoutComponent,
    NewsItemManagerComponent,
  ],
  providers: [
    MemberService,
    UserService,
    NewsItemService,
    PlatformService,
    DocumentService,
    LogService,
    TriviaService,
    EtiquetteService
  ]
})

@RouteConfig([
  {
    path: '/home',
    name: 'Home',
    component: HomeComponent,
    useAsDefault: true
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: CalendarComponent,
  },
  {
    path: '/news-items',
    name: 'NewsItems',
    component: NewsItemComponent,
  },
  {
    path: '/search-membership',
    name: 'SearchMembership',
    component: SearchMembershipComponent
  },
  {
    path: '/about-us',
    name: 'AboutUs',
    component: AboutUsComponent
  },
  {
    path: '/fee-manager',
    name: 'FeeManager',
    component: FeeManagerComponent
  },
  {
    path: '/fee-configuration',
    name: 'FeeConfiguration',
    component: FeeConfigurationComponent
  },
  {
    path: '/contact-us',
    name: 'ContactUs',
    component: ContactUsComponent
  },
  {
    path: '/onlinehelp',
    name: 'OnlineHelp',
    component: OnlineHelpComponent
  },
  {
    path: '/document-manager',
    name: 'DocumentManager',
    component: DocumentManagerComponent
  },
  {
    path: '/scheduler',
    name: 'SchedulerComponent',
    component: SchedulerComponent
  },
  /*
  {
    path: '/table-section',
    name: 'TableSection',
    component: TableSectionComponent
  },
  */
])

export class AppComponent {

  @ViewChild(MessageComponent) errorMsg: MessageComponent;
  @ViewChild(JoinComponent) joinForm: JoinComponent;
  @ViewChild(PersonalProfileComponent) personalProfile: PersonalProfileComponent;
  @ViewChild(ChangePasswordComponent) changePassword: ChangePasswordComponent;
  @ViewChild(RenewMembershipComponent) renewMembership: RenewMembershipComponent;
  @ViewChild(LoginComponent) login: LoginComponent;
  @ViewChild(LogoutComponent) logout: LogoutComponent;
  @ViewChild(NewsItemManagerComponent) newsitemManagement: NewsItemManagerComponent;

  platformDesciptor: string;

  constructor(
    private userService: UserService
  ) {
    this.platformDesciptor = PlatformService.init();
  }

  DisplayJoin() {
    this.joinForm.showForm();
  }

  DisplayPersonalProfile() {
    this.personalProfile.showForm();
  }

  DisplayChangePassword() {
    this.changePassword.showForm();
  }

  DisplayRenewMembership() {
    this.renewMembership.showForm();
  }

  DisplayLogin() {
    this.login.showForm();
  }

  DisplayNewsItemManagement() {
    this.newsitemManagement.showNewsItemManagement();
  }

  DisplayLogout() {
    console.log('logout');
    this.logout.showForm();
  }
}
