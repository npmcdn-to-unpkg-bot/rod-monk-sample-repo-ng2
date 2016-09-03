/// <reference path="../../typings/globals/require/index.d.ts" />

import { Component } from '@angular/core';

@Component({
    selector: 'mission-and-values-modal',
    template: require('./mission-and-values.modal.html')
})

export class MissionAndValuesComponent {

    IsVisible: boolean = false;

    showModal = () =>
        this.IsVisible = true;

    hideModal = () =>
        this.IsVisible = false;
}
