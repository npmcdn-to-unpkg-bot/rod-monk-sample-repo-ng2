/// <reference path="../../typings/globals/require/index.d.ts" />
/// <reference path="../../typings/globals/moment/index.d.ts" />
/// <reference path="../../typings/globals/fullcalendar/index.d.ts" />

import { Component, OnInit } from '@angular/core';
import { Schedule } from 'primeng/primeng';

@Component({
    selector: 'scheduler',
    template: require('./scheduler.component.html'),
    styleUrls: [
  ],
    directives: [Schedule]
})
export class SchedulerComponent implements OnInit {

    events: any[];

    ngOnInit() {

        this.events = [
            {
                "title": "All Day Event",
                "start": "2016-01-01"
            },
            {
                "title": "Long Event",
                "start": "2016-01-07",
                "end": "2016-01-10"
            },
            {
                "title": "Repeating Event",
                "start": "2016-01-09T16:00:00"
            },
            {
                "title": "Repeating Event",
                "start": "2016-01-16T16:00:00"
            },
            {
                "title": "Conference",
                "start": "2016-01-11",
                "end": "2016-01-13"
            }
        ];

        $('#calendar').fullCalendar('render');
    }
    constructor() { }

}
