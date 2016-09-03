/// <reference path="../../typings/globals/require/index.d.ts" />

import { Component, OnInit } 	from '@angular/core';
import { Http, Response }    	from '@angular/http';
import { Observable }           from 'rxjs/Observable';
import { ExecutiveService } 	from '../services/executive.service';
import { LogService } 			from '../services/log.service';

@Component({
	selector: 'contact-us',
	template: require('./contact-us.component.html'),
})

export class ContactUsComponent implements OnInit {

	executive: any[];

	constructor(
		private logService: LogService,
		private executiveService: ExecutiveService) { }

	handleError = (err: Response) =>
		this.logService.logMessage('Server Failure: ' + JSON.stringify(err, null, 4));

	ngOnInit() {
		// Need to display details of the exec on the Contact Us screen
		this.executiveService.getExecutive().subscribe(
			executive => this.executive = _.orderBy(executive, 'rank', 'asc'),
			error => this.handleError(error));

		this.logService.logMessage('This is a test log message').subscribe(
			() => _.noop,
			error => console.log('Test Log Message not saved: ', JSON.stringify(error, null, 4)));
	}
}
