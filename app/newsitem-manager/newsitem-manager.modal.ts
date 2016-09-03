/// <reference path="../../typings/globals/require/index.d.ts" />

import { Component, ViewChild } from '@angular/core';
import { Response }             from '@angular/http';
import { CORE_DIRECTIVES }      from '@angular/common';
import { Router }               from '@angular/router-deprecated';
import { NewsItem }             from '../models/newsitem';
import { NewsItemService }      from '../services/newsitem.service';
import { UserService }          from '../services/user.service';
import { LogService }           from '../services/log.service';
import { MessageComponent }     from '../message/message.component';

@Component({
    selector: 'newsitem-manager-modal',
    directives: [CORE_DIRECTIVES, MessageComponent],
    template: require('./newsitem-manager.modal.html')
})

export class NewsItemManagerComponent {

    @ViewChild(MessageComponent) messageModal: MessageComponent;
    imagesToUpload: Array<File>;
    public IsVisible: boolean = false;
    public readyToUpload: boolean = false;
    public newsItem: NewsItem;

    constructor(
        private newsItemService: NewsItemService,
        private userService: UserService,
        private logService: LogService,
        public router: Router
    ) { }

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

    publishNewsItem = () => {
        this.IsVisible = false;
        this.newsItemService.publishNewsItem(this.newsItem)
            .subscribe(
            () => this.messageModal.showMessage('News item: `' + this.newsItem.headline + '` is published'),
            error => this.handleError(error));
    }

    upload = () => {
        this.readyToUpload = false;
        this.newsItemService.uploadImages(this.imagesToUpload, this.newsItem._id)
            .then(() => console.log('Upload Complete'))
            .catch((err: Response) => this.handleError(err));
    }

    fileChangeEvent = (fileInput: any) => {
        this.imagesToUpload = <Array<File>>fileInput.target.files;
        if (this.imagesToUpload.length > 0) {
            this.readyToUpload = true;
        }
    }

    showNewsItemManagement = () => {
        this.newsItem = new NewsItem;
        this.newsItemService.getNewObjectId()
            .subscribe(
            objectId => {
                this.newsItem._id = objectId;
                this.IsVisible = true;
            },
            error => this.handleError(error));
    }

    closeNewsItemManagement = () => {
        this.IsVisible = false;
        // Do some cleaning up of all things about the NewsItem
        this.newsItemService.removeNewsItem(this.newsItem._id)
            .subscribe(
            () => _.noop,
            error => this.handleError(error));
    }

    messageModalClosed = (unusedBoolean: boolean) =>
        this.router.navigate(['NewsItems']);
}
