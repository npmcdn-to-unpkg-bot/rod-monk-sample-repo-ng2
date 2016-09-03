/// <reference path="../../typings/globals/require/index.d.ts" />

import { Component, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'liability-agreement-modal',
    template: require('./liability-agreement.modal.html')
})

export class LiabilityAgreementComponent {

    @Output() onClosed = new EventEmitter<boolean>();

    IsVisible: boolean = false;

    showModal = () =>
        this.IsVisible = true;

    hideModal = () => {
        this.IsVisible = false;
        this.onClosed.emit(true);
    }
}
