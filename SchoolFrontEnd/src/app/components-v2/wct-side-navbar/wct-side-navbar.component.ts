import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { JsonGroups } from 'foundations-webct-robot/robot/classes/jsonGroups.class';

import { AppHeaderService } from 'foundations-webct-palette/components/appHeaderComponent/app-header.service';
import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { ConfigurationService } from 'foundations-webct-robot/robot/utils/configuration.service';
import { ApiService } from 'foundations-webct-robot/robot/services/api.service';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';
import { NavigationService } from 'foundations-webct-robot/robot/services/navigation.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
    selector: 'app-wct-side-navbar',
    templateUrl: './wct-side-navbar.component.html',
    styleUrls: ['./wct-side-navbar.component.css']
})
export class WctSideNavbarComponent implements OnInit {

    public viewStructure: JsonParams;
    public logoParameter: JsonParams;

    private _robot: RobotEngineModel;
    private _componentId: string;

    private _loadMenuFile: string;
    private _currentMenuFile: string;

    constructor(
        private _utils: Utils,
        private _header: AppHeaderService,
        private _config: ConfigurationService,
        private _apiService: ApiService,
        private _globalVars: GlobalVarsService,
        private _navigation: NavigationService) {

        this._robot = new RobotEngineModel(this._utils, this._globalVars, this._apiService);
        this._componentId = 'APPSIDEMENU-' + this._utils.guid(4, '');
    }

    public ngOnInit() {

        this._loadMenuFile = this._config.getConfig('default___sideMenu');
        if (!this._loadMenuFile)
            return;

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

    public isSideMenuOpen = (): boolean => this._navigation.isSideMenuOpen;
    public isSideMenuFixed = (): boolean => this._navigation.isSideMenuFixed;

    public toggleSideMenu = () => this._navigation.isSideMenuOpen = !this._navigation.isSideMenuOpen;
    public toggleFixMenu = () => {
        this._navigation.isSideMenuFixed = !this._navigation.isSideMenuFixed;
        if (!this._navigation.isSideMenuFixed)
            this.toggleSideMenu();
    };

    private _startComponent(mockToLoad: string): void {

        this._currentMenuFile = mockToLoad;
        this._header.loadMenuMock(this._currentMenuFile, this._componentId).then(res => {
            this._robot.updatePageWithData(res);
            this.viewStructure = this._robot.view;

            this._navigation.hasSideMenu = true;

            if (this.viewStructure.icon || this.viewStructure.text) {
                this.logoParameter = new JsonParams();
                this.logoParameter.type = 'navigate';
                this.logoParameter.groups = new JsonGroups();
                this.logoParameter.navigateTo = this.viewStructure.navigateTo;
                this.logoParameter.icon = this.viewStructure.icon;
                this.logoParameter.text = this.viewStructure.text;
            }

        }).catch(err => {
            this.viewStructure = undefined;
            this.logoParameter = undefined;
            this._navigation.hasSideMenu = false;
        });;

    }

}
