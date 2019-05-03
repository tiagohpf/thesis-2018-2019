import { Component, OnInit, Input, OnDestroy } from "@angular/core";

import { PageService } from "foundations-webct-robot/robot/pageComponent/page.service";
import { GlobalVarsService } from "foundations-webct-robot/robot/utils/global-vars.service";
import { Utils } from "foundations-webct-robot/robot/utils/utils.service";
import { ConfigurationService } from "foundations-webct-robot/robot/utils/configuration.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Http, Response, Headers } from "@angular/http";
import { JsonParams } from "foundations-webct-robot/robot/classes/jsonParams.class";
import { RobotEngineModel } from "foundations-webct-robot/robot/robotEngineModel";
import { JsonGroups } from "foundations-webct-robot/robot/classes/jsonGroups.class";
import { AppHeaderService } from "foundations-webct-palette/components/appHeaderComponent/app-header.service";
import { ApiService } from "foundations-webct-robot/robot/services/api.service";
import { NavigationService } from "foundations-webct-robot/robot/services/navigation.service";

@Component({
  selector: "sliding-nav-bar",
  templateUrl: "./sliding-nav-bar.component.html",
  styleUrls: ["./sliding-nav-bar.component.scss"]
})
export class SlidingNavBarComponent implements OnInit {
  @Input() hasNav;

  public viewStructure: JsonParams;

  public myIpConfig: JsonParams = null;
  public logoParameter: JsonParams;

  private _robot: RobotEngineModel;
  private _componentId: string;

  private _loadMenuFile: string;
  private _currentMenuFile: string;

  public mockToLoad = "";
  public hasMockSibling = false;

  constructor(
    private _utils: Utils,
    private _header: AppHeaderService,
    private _config: ConfigurationService,
    private _globalVars: GlobalVarsService,
    private _apiService: ApiService,
    private _navigation: NavigationService,
    private _routeParams: ActivatedRoute
  ) {
    this._robot = new RobotEngineModel(
      this._utils,
      this._globalVars,
      this._apiService
    );
    this._componentId = "APPHEADER-" + this._utils.guid(4, "");
  }

  ngOnInit() {
    this._loadMenuFile =
      this._config.getConfig("default___mainMenu") || "app-menu";

    this._startComponent(this._utils.replaceTagVars(this._loadMenuFile));
    this._globalVars.observeUrlParams().subscribe(data => {
      let tempMenuFile: string = this._utils.replaceTagVars(this._loadMenuFile);
      if (tempMenuFile != this._currentMenuFile)
        this._startComponent(tempMenuFile);
    });
    this.routeMockToLoad();
  }

  ngOnDestroy() {
    if (this._globalVars.observeUrlDataParams()) {
      this._globalVars.observeUrlDataParams().unsubscribe();
    }
  }

  private _startComponent(mockToLoad: string): void {
    this.viewStructure = undefined;
    this.logoParameter = undefined;

    this._currentMenuFile = mockToLoad;
    this._header
      .loadMenuMock(this._currentMenuFile, this._componentId)
      .then(res => {
        this._robot.updatePageWithData(res);

        this.viewStructure = this._robot.view;
        this.myIpConfig = this._utils.findObjectInArray(
          this.viewStructure.parameters,
          "myIp",
          "key"
        );

        if (this.viewStructure.icon || this.viewStructure.text) {
          this.logoParameter = new JsonParams();
          this.logoParameter.type = "navigate";
          this.logoParameter.groups = new JsonGroups();
          this.logoParameter.navigateTo = this.viewStructure.navigateTo;
          this.logoParameter.icon = this.viewStructure.icon;
          this.logoParameter.text = this.viewStructure.text;
        }

        this._header.setRouterParameters(this.viewStructure);

        if (
          !this.viewStructure.groups.menus ||
          !this.viewStructure.groups.menus.parameters ||
          this.viewStructure.groups.menus.parameters.length <= 0
        )
          console.error("Menu params not found.");
      });
  }
  public hasSideMenu = (): boolean => this._navigation.hasSideMenu;

  public routeMockToLoad = () => {
    this._globalVars.observeUrlDataParams().subscribe(data => {
      this.mockToLoad = "";
      setTimeout(() => {
        this.mockToLoad = data["navBarMock"];
        if (this.mockToLoad) {
          this.hasMockSibling = true;
        } else {
          this.hasMockSibling = false;
        }

      }, 100);
    });
  };
}
