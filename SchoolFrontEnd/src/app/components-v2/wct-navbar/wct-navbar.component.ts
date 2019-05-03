import { Component, OnInit, OnDestroy } from '@angular/core';

import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';

import { ApiService } from 'foundations-webct-robot/robot/services/api.service';
import { ConfigurationService } from 'foundations-webct-robot/robot/utils/configuration.service';
import { AppHeaderService } from 'foundations-webct-palette/components/appHeaderComponent/app-header.service';
import { JsonGroups } from 'foundations-webct-robot/robot/classes/jsonGroups.class';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from 'foundations-webct-robot/robot/services/navigation.service';

@Component({
  selector: 'app-wct-navbar',
  templateUrl: './wct-navbar.component.html',
  styleUrls: ['./wct-navbar.component.css']
})
export class WctNavbarComponent implements OnInit, OnDestroy {

  public viewStructure: JsonParams;
  public showResponsiveMenu: boolean = false;

  public myIpConfig: JsonParams = null;
  public logoParameter: JsonParams;

  private _robot: RobotEngineModel;
  private _componentId: string;

  private _loadMenuFile: string;
  private _currentMenuFile: string;

  constructor(
      private _utils: Utils,
      private _routeParams: ActivatedRoute,
      private _header: AppHeaderService,
      private _config: ConfigurationService,
      private _apiService: ApiService,
      private _globalVars: GlobalVarsService,
      private _navigation: NavigationService) {

      this._robot = new RobotEngineModel(this._utils, this._globalVars, this._apiService);
      this._componentId = 'APPHEADER-' + this._utils.guid(4, '');

  }

  public ngOnInit() {

      this._setInitUrlParams();
      this._loadMenuFile = this._config.getConfig('default___mainMenu') || 'app-menu';

      this._startComponent(this._utils.replaceTagVars(this._loadMenuFile));
      this._globalVars.observeUrlParams()
          .subscribe((data) => {
              let tempMenuFile: string = this._utils.replaceTagVars(this._loadMenuFile);
              if (tempMenuFile != this._currentMenuFile)
                  this._startComponent(tempMenuFile);
          });

  }

  public ngOnDestroy() {
      this._globalVars.deletePageParametersByGroup(this._componentId);
  }

  public navigateTo = (e, menu: JsonParams) => this._header.navigateTo(e, menu);
  public toggleSubMenuStatus = (menu: JsonParams) => this._header.toggleSubMenuStatus(menu);
  public getSubMenuStatus = (menu: JsonParams) => this._header.getSubMenuStatus(menu);
  public checkActivatedRoute = (menu: JsonParams) => this._header.checkActivatedRoute(menu, 'side');

  public hasSideMenu = (): boolean => this._navigation.hasSideMenu;

  private _startComponent(mockToLoad: string): void {

      this.viewStructure = undefined;
      this.logoParameter = undefined;

      this._currentMenuFile = mockToLoad;
      this._header.loadMenuMock(this._currentMenuFile, this._componentId).then(res => {

          this._robot.updatePageWithData(res);

          this.viewStructure = this._robot.view;
          this.myIpConfig = this._utils.findObjectInArray(this.viewStructure.parameters, 'myIp', 'key');

          if (this.viewStructure.icon || this.viewStructure.text) {
              this.logoParameter = new JsonParams();
              this.logoParameter.type = 'navigate';
              this.logoParameter.groups = new JsonGroups();
              this.logoParameter.navigateTo = this.viewStructure.navigateTo;
              this.logoParameter.icon = this.viewStructure.icon;
              this.logoParameter.text = this.viewStructure.text;
          }

          this._header.setRouterParameters(this.viewStructure);

          if (!this.viewStructure.groups.menus || !this.viewStructure.groups.menus.parameters || this.viewStructure.groups.menus.parameters.length <= 0)
              console.error('Menu params not found.');

      });

  }

  private _setInitUrlParams() {
      let params = {};
      Object.assign(params, this._routeParams.snapshot.params);
      Object.assign(params, this._routeParams.firstChild.snapshot.params);
      this._globalVars.urlParams = params;
  }

}
