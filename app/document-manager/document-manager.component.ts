/// <reference path="../../typings/globals/require/index.d.ts" />

import { Component, OnInit }    from '@angular/core';
import { Response }             from '@angular/http';
import { MD_PROGRESS_BAR_DIRECTIVES } from '@angular2-material/progress-bar';

import { DocumentService }      from '../services/document.service';
import { UserService }          from '../services/user.service';
import { LogService }           from '../services/log.service';
import { Router }               from '@angular/router-deprecated';

@Component({
    selector: 'document-manager',
    template: require('./document-manager.component.html'),
    directives: [MD_PROGRESS_BAR_DIRECTIVES]
})

export class DocumentManagerComponent implements OnInit {

    documentsToUpload: Array<File>;

    documents: any[];
    IsVisible = false;
    isLoading: boolean = false;

    constructor(
        private documentService: DocumentService,
        private userService: UserService,
        private logService: LogService,
        private router: Router
    ) {
        this.documentsToUpload = [];
    }

    handleError = (err: Response) => {
        console.log('status: ', err.status);
        if (err.status === 440) {
            this.router.navigate(['Home']);
            this.userService.loggedOut();
            alert('Your Session Has Timed-Out.  You will need to Login again.');
        } else {
            this.logService.logMessage('Server Failure: ' + JSON.stringify(err, null, 4));
            alert('Server Failure');
        }
    }

    upload = () => {
        this.isLoading = true;
        this.documentService.uploadDocuments(this.documentsToUpload)
            .then((documents: any[]) => this.documents = documents)
            .catch((err: Response) => this.handleError(err))
            .then(() => this.isLoading = false);
    }

    fileChangeEvent = (fileInput: any) =>
        this.documentsToUpload = <Array<File>>fileInput.target.files;

    refreshDocumentList = () => {
        this.isLoading = true;
        this.documentService.refreshDocumentList().subscribe(
            documents => { this.documents = documents; this.isLoading = false; },
            error => { this.isLoading = false; this.handleError(error); });
    }

    removeDocument = (document: any) => {
        this.documentService.removeDocument(document._id).subscribe(
            documents => { this.documents = documents; this.isLoading = false; },
            error => { this.isLoading = false; this.handleError(error); });
    }

    ngOnInit() {
        this.refreshDocumentList();
    }
}
