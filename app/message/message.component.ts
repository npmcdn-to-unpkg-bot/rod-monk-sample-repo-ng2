/// <reference path="../../typings/globals/require/index.d.ts" />

import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'message-modal',
    template: require('./message.component.html')
})

export class MessageComponent {
    @Output() onClosed = new EventEmitter<boolean>();
    public message: string;
    public IsVisible: boolean;

    showMessage = (msg: string) => {
        this.message = msg;
        this.IsVisible = true;
    }

    hideMessage = () => {
        this.IsVisible = false;
        this.onClosed.emit(true);
    }
}
