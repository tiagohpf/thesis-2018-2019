import { Component, OnInit, OnDestroy, Injectable } from '@angular/core';

import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';

import { ApiService } from 'foundations-webct-robot/robot/services/api.service';

@Component({
  selector: 'app-wct-footer',
  templateUrl: './wct-footer.component.html',
  styleUrls: ['./wct-footer.component.css']
})
export class WctFooterComponent implements OnInit, OnDestroy {

  public viewStructure: JsonParams;

  private _robot: RobotEngineModel;
  private _componentId: string;

  constructor(
      private _utils: Utils,
      private _apiService: ApiService,
      private _globalVars: GlobalVarsService) {

      this._robot = new RobotEngineModel(this._utils, this._globalVars, this._apiService);
      this._componentId = 'APPFOOTER-' + this._utils.guid(4, '');

  }

  public ngOnInit() {

      this._utils
          .GetAll(this._utils.getJson('app-footer'))
          .subscribe((response) => {
              this._robot.loadPageParams(response, this._componentId).then(res => {
                  this._robot.updatePageWithData(res);
                  this.viewStructure = this._robot.view;
              });
          },
              // OnError
              (error) => console.error('app-footer.component -> ', error));
  }

  public ngOnDestroy() {
      this._globalVars.deletePageParametersByGroup(this._componentId);
  }

}
