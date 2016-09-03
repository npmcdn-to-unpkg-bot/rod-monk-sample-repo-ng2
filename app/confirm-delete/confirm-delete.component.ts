/// <reference path="../../typings/globals/require/index.d.ts" />

import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'confirm-delete-modal',
    template: require('./confirm-delete.component.html')
})

export class ConfirmDeleteComponent {
    @Output() onClosed = new EventEmitter<boolean>();
    public IsVisible: boolean = false;
    public message: string;

    showMessage = (message: string) => {
        this.message = message;
        this.IsVisible = true;
    }

    confirmDelete = () => {
        this.IsVisible = false;
        this.onClosed.emit(true);
    }

    cancelDelete = () => {
        this.IsVisible = false;
        this.onClosed.emit(false);
    }
}
