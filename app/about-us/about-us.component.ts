/// <reference path="../../typings/globals/require/index.d.ts" />

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'about-us',
  template: require('./about-us.component.html'),
  //styleUrls:  ['app/about-us/about-us.component.css']
})
export class AboutUsComponent implements OnInit {

  constructor() {}
  ngOnInit () {}

}
