/// <reference path="../../typings/globals/require/index.d.ts" />
/// <reference path="../../typings/globals/jquery/index.d.ts" />
/// <reference path="../../typings/globals/es6-shim/index.d.ts" />

import {
  Component,
  HostListener,
  ViewChild,
  OnInit}                                     from '@angular/core';
import { Response }                           from '@angular/http';
import { Observable }                         from 'rxjs/Observable';

import { MemberService }                      from '../services/member.service';
import { LogService }                         from '../services/log.service';
import { NewsItemService }                    from '../services/newsitem.service';
import { TriviaService }                      from '../services/trivia.service';
import { EtiquetteService }                   from '../services/etiquette.service';
import { MissionAndValuesComponent }          from '../mission-and-values/mission-and-values.modal';

const LIST_ITEM_COUNT = 3;

@Component({
  selector: 'home',
  template: require('./home.component.html'),
  directives: [MissionAndValuesComponent]
})

export class HomeComponent implements OnInit {

  @ViewChild(MissionAndValuesComponent) mission_and_values_modal: MissionAndValuesComponent;

  private memberCount: number;
  private newsItems: any[];

  public triviaTextArea: string[];
  private currentTriviaId: string[]; // Keep track of which trivium we are using

  public etiquetteTextArea: string[];
  private currentEtiquetteId: string[]; // Keep track of which etiquette rules we are using

  // Create an array that defines the number of list Items
  //private listItemArray = Array.from(Array(LIST_ITEM_COUNT).keys());
  private buildArray = Array(LIST_ITEM_COUNT).fill(1);

  constructor(
    private memberService: MemberService,
    private newsItemService: NewsItemService,
    private triviaService: TriviaService,
    private etiquetteService: EtiquetteService
  ) {
    this.triviaTextArea = Array(LIST_ITEM_COUNT).fill(null);
    this.currentTriviaId = Array(LIST_ITEM_COUNT).fill(null);

    this.etiquetteTextArea = Array(LIST_ITEM_COUNT).fill(null);
    this.currentEtiquetteId = Array(LIST_ITEM_COUNT).fill(null);
  }

  showMissionAndValues = () => {
    this.mission_and_values_modal.showModal();
  }

  createPanelClickStream$ = (panelId: string, getList: any) => Observable.fromEvent(document.getElementById(panelId), 'click')
    .startWith(null)
    .mergeMap(() => getList());

  initTriviaManager = getList => {

    // Use the following set to ensure that item selection is unique
    let uniqueItems = new Set();

    let responseStream$ = this.createPanelClickStream$('panel-trivia', getList);

    let combineLatest = (notused, allItems) => {
      do {
        // Ensure the item selected is unique
        let randomIndex = Math.floor(Math.random() * allItems.length);
        let proposedId = allItems[randomIndex]._id;
        if (!_(uniqueItems).includes(proposedId)) {
          return allItems[randomIndex];
        }
      } while (true);
    }

    let createStream$ = listItemClickStream =>
      listItemClickStream
        .startWith(null)
        .combineLatest(responseStream$, combineLatest);

    // Listen for clicks from each trivia list item
    this.buildArray.forEach((notused, index: number) =>
      createStream$(Observable.fromEvent(document.getElementById('list-trivia' + index), 'click')).subscribe(nextItem => {

        console.log('index: ', index);

        // Remove the outgoing triviaId...
        uniqueItems.delete(this.currentTriviaId[index]);

        // ...and remember the new one
        uniqueItems.add(nextItem._id);
        this.currentTriviaId[index] = nextItem._id;

        // Update the webpage with the new trivia
        this.triviaTextArea[index] = _.isNull(nextItem) ? '' : nextItem.trivia;
      })
    );
  }

  initEtiquetteManager = getList => {

    let uniqueItems = new Set();

    let response$ = this.createPanelClickStream$('panel-etiquette', getList);

    let combineLatest = (notused, allItems) => {
      do {
        // Ensure the item selected is unique
        let randomIndex = Math.floor(Math.random() * allItems.length);
        let proposedId = allItems[randomIndex]._id;
        if (!_(uniqueItems).includes(proposedId)) {
          return allItems[randomIndex];
        }
      } while (true);
    }

    let createStream$ = listItemClick$ =>
      listItemClick$
        .startWith(null)
        .combineLatest(response$, combineLatest);

    // Listen for clicks from each etiquette list item
    this.buildArray.forEach((notused, index) =>
      createStream$(Observable.fromEvent(document.getElementById('list-etiquette' + index), 'click')).subscribe(nextItem => {

        // Remove the outgoing Id...
        uniqueItems.delete(this.currentEtiquetteId[index]);

        // ...and remember the new one
        uniqueItems.add(nextItem._id);
        this.currentEtiquetteId[index] = nextItem._id;

        // Update the webpage with the new trivia
        this.etiquetteTextArea[index] = _.isNull(nextItem) ? '' : nextItem.etiquette;
      })
    );
  }

  ngOnInit() {

    // Display the member count
    this.memberService.getMemberCount().subscribe(count => this.memberCount = count);

    // Display recent News Items
    this.newsItemService.getAll().subscribe(newsitems => this.newsItems = newsitems);

    this.initTriviaManager(this.triviaService.getTrivia);

    this.initEtiquetteManager(this.etiquetteService.getEtiquette);

    // ToDo: the following is experimental
    Observable.fromEvent(document.querySelectorAll('.list-trivia'), 'click')
      .map((event: any) => event.path[1])
      .subscribe(console.log);
  }
}
