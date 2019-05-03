import { Input, Component, OnInit } from '@angular/core';

import { WctTabsComponent } from '../wct-tabs/wct-tabs.component';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';

@Component({
  selector: 'app-wct-tabs-content',
  templateUrl: './wct-tabs-content.component.html',
  styleUrls: ['./wct-tabs-content.component.css']
})
export class WctTabsContentComponent implements OnInit {

  @Input() public eachtab: JsonParams;
  @Input() public nTabs: number;

  constructor(
      private _tabs: WctTabsComponent) {
  }

  public ngOnInit() {
      this._tabs.addTab(this.eachtab);
  }

}