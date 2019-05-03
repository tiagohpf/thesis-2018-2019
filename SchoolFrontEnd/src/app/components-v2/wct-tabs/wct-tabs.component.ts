import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { JsonParams, newEvent } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';

@Component({
  selector: 'app-wct-tabs',
  templateUrl: './wct-tabs.component.html',
  styleUrls: ['./wct-tabs.component.css']
})
export class WctTabsComponent {

  @Output() public tabChanged = new EventEmitter();

  public tabs: JsonParams[];

  private _newEvent: EventEmitter<newEvent[]>[] = new Array();

  constructor(private _utils: Utils) {
    this.tabs = [];
  }

  public ngOnDestroy() {
    if (this._newEvent.length > 0)
      for (let subscription of this._newEvent)
        subscription.unsubscribe();
  }

  public selectTab(showTab: JsonParams) {

    this.tabs.forEach(obj => obj.data.hideContent = true);
    showTab.data.hideContent = false;
    showTab.lazyLoading = false;
    setTimeout(() => {
      this.tabChanged.emit(true);
    }, 0.5);
  }

  public addTab(addTab: JsonParams) {

    addTab.data = { hideContent: true };
    addTab.data.hideContent = addTab.hidden || addTab.lazyLoading || !!this.tabs.find(obj => obj.data.hideContent === false);

    this._evaluateTabComponents(addTab);
    this.tabs.push(addTab);

    this._newEvent.push(addTab.newEvent().subscribe(data => this._handleEvent(data)));

  }

  private _evaluateTabComponents(tab: JsonParams) {

    if (!tab.groups.components)
      return;

    let parameters: JsonParams[] = tab.groups.components.parameters;
    let visibleComponent: JsonParams = this._utils.findObjectInArray(parameters, false, 'lazyLoading');
    if (parameters && parameters.length > 0 && !visibleComponent.internalId) {
      parameters[0].lazyLoading = false;
      parameters[0].data.hideContent = false;
    }

  }

  private _handleEvent(data: newEvent[]) {

    data.forEach(event => {
      if (event.key == 'selectTab')
        this.selectTab(event.param);
    });

  }

}
