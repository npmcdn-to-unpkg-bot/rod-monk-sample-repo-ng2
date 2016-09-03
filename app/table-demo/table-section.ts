import {Component} from '@angular/core';
import {CORE_DIRECTIVES} from '@angular/common';

import {TableDemoComponent} from './table-demo';

@Component({
  selector: 'table-section',
  template: `
  <section id="somename">
    <div class="row"><h1>"Name"<small>()</small></h1></div>

    <hr>

    <div class="row"><div class="col-md-12">"Doc Title"</div></div>

    <div class="row">
      <h2>Example</h2>
      <div class="card card-block panel panel-default panel-body">
        <table-demo></table-demo>
      </div>
    </div>

  </section>
  `,
  directives: [TableDemoComponent, CORE_DIRECTIVES]
})
export class TableSectionComponent {
}
