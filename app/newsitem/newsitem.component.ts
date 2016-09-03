/// <reference path="../../typings/globals/require/index.d.ts" />

import { Component, EventEmitter, Output, ViewChild, OnInit } from '@angular/core';
import { Response }             from '@angular/http';

import { MemberService }            from '../services/member.service';
import { UserService }              from '../services/user.service';
import { LogService }               from '../services/log.service';
import { NewsItemService }          from '../services/newsitem.service';
import { ConfirmDeleteComponent }   from '../confirm-delete/confirm-delete.component';

class NewsItem {
    _id: string;
    headline: string;
    body: string;
    uploadTimestamp: Date;

    constructor(_id: string, headline: string, body: string) {
        this._id = _id;
        this.headline = headline;
        this.body = body;
    }
}

class NewsItemFile {
    _id: string;
    filename: string;

    constructor(_id: string, filename: string) {
        this._id = _id;
        this.filename = filename;
    }
}

@Component({
    selector: 'newsitemfile',
    inputs: ['newsitemfile'],
    template: `
<div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
    <img src="{{newsitemfile._id}}.{{newsitemfile.filename.substr(newsitemfile.filename.lastIndexOf('.')+1)}}" width="400" border="0" style="display: block; margin-left: auto; margin-right: auto">
</div>`
})

class NewsItemFileComponent {
    newsitemFiles: NewsItemFile[];
    constructor() { }
}

@Component({
    selector: 'newsitem',
    inputs: ['newsitem'],
    directives: [NewsItemFileComponent],
    template: `
<accordion-group>
    <h4> <a (click)="GetFiles(newsitem._id)">{{newsitem.headline}}</a></h4>
    <div [hidden]="!userService.hasPermission('newsitems:delete')">
        <button type="button" class="btn btn-warning" (click)="removeNewsItem (newsitem)">
            <span>x</span>
        </button>
    </div>
    <p>{{newsitem.body}}</p>
		<div class="row">
            <newsitemfile
                *ngFor="let newsitemfile of NewsItemFiles"
                [newsitemfile]="newsitemfile">
            </newsitemfile>
        </div>
</accordion-group>
`
})

class NewsItemListComponent {
    NewsItemFiles: NewsItemFile[];
    @Output() onRemoveNewsItem = new EventEmitter<NewsItem>();

    constructor(
        private newsItemService: NewsItemService,
        private userService: UserService
    ) { }

    GetFiles = (NewsItem_id: string) =>
        this.newsItemService.retrieveFiles(NewsItem_id)
            .subscribe(
            newsItemFiles => this.NewsItemFiles = newsItemFiles,
            error => {
                alert('Server Failure');
                console.log('Server Failure: ' + JSON.stringify(error, null, 4));
            });

    removeNewsItem(newsItem: NewsItem) {
        this.onRemoveNewsItem.emit(newsItem);
    }
}

@Component({
    selector: 'newsitem-component',
    directives: [NewsItemListComponent, ConfirmDeleteComponent],
    template: `
    <confirm-delete-modal (onClosed)="confirmDeleteClosed($event)">
    </confirm-delete-modal>
    <div class="container">
       <accordion close-others="true">
                <newsitem
                    *ngFor="let newsitem of newsItems"
                    [newsitem]="newsitem"
                    (onRemoveNewsItem)="removeNewsItem($event)">
                </newsitem>
        </accordion>
    </div>`
})

export class NewsItemComponent implements OnInit {

    @ViewChild(ConfirmDeleteComponent) confirmDelete: ConfirmDeleteComponent;

    newsItems: NewsItem[] = [];
    removeNewsItemIdCandidate: string;

    constructor(
        private memberService: MemberService,
        private userService: UserService,
        private newsItemService: NewsItemService,
        private logService: LogService
    ) { }

    GetAllNewsItems = () =>
        this.newsItemService.getAll()
            .subscribe(
            newsItems => {
                this.newsItems = newsItems;
                this.newsItems.sort((a, b) =>
                    (a.uploadTimestamp < b.uploadTimestamp) ? 1 : (a.uploadTimestamp > b.uploadTimestamp) ? -1 : 0
                );
            },
            error => {
                this.logService.logMessage('Server Failure: ' + JSON.stringify(error, null, 4));
                alert('Server Failure');
            });

    removeNewsItem = (newsItem: NewsItem) => {
        // Take note of the _id so that we can delete after user confirms
        this.removeNewsItemIdCandidate = newsItem._id;
        this.confirmDelete.showMessage('Please confirm that you wish to delete News Item `' + newsItem.headline + '`');
    }

    ngOnInit() {
        this.GetAllNewsItems();
    }

    confirmDeleteClosed = (isConfirmed: boolean) => {
        if (isConfirmed) {
            this.newsItemService.removeNewsItem(this.removeNewsItemIdCandidate)
                .subscribe(
                () => this.GetAllNewsItems(),
                error => {
                    alert('Server Failure');
                    console.log('Server Failure: ' + JSON.stringify(error, null, 4));
                });
        }
    }
}

