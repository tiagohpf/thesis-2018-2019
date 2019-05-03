import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';

@Component({
  selector: 'custom-tab-validator',
  encapsulation: ViewEncapsulation.None,
  template: ''
})

export class CustomTabValidator implements OnInit {

  @Input() inputParameters: JsonParams;

  constructor (
    private _globalService: GlobalVarsService,
    private _utils: Utils
  ) {}

  public ngOnInit () {
    const keyName = this._utils.findObjectInArray(this.inputParameters.parameters, 'keyName').value;
    console.log("keyName ----> ", keyName);
    const activeTab = localStorage.getItem(keyName);
    console.log("activeTab ----> ", keyName);

    const parent = this._utils.findObjectInArray(this.inputParameters.parameters, 'parent').value;
    console.log("parent ----> ", parent);

    const sibilings = this._globalService.getPageParameter(parent).groups.tabs.parameters;

    console.log("sibilings ----> ", sibilings);

    if (activeTab) {
      sibilings.forEach ((sibiling) => {
        if (sibiling.id === activeTab) {
          sibiling.lazyLoading = false
        } else {
          sibiling.lazyLoading = true;
        }
      });
      localStorage.removeItem(keyName);
    }
  }
}
