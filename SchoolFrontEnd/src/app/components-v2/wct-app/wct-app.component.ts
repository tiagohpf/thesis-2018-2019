import { Component, ViewEncapsulation, ViewContainerRef, ViewChild, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { ConfigurationService } from 'foundations-webct-robot/robot/utils/configuration.service';
import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { AuthzService } from 'foundations-webct-robot/robot/utils/authz.service';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';

import { ToggleElementsService } from 'foundations-webct-robot/robot/services/toggle-elements.service';
import { NavigationService } from 'foundations-webct-robot/robot/services/navigation.service';

import { AppState } from '../../app.service';
import { WctNotificationService } from "../../components-v2/wct-notification/wct-notification.service";
import { WctNotificationComponent } from "../../components-v2/wct-notification/wct-notification.component";

import { DECLARATIONS } from '../../webct.components';
import { FilterService } from 'foundations-webct-robot/robot/services/filter.service';

@Component({
  selector: 'app-wct-app',
  templateUrl: './wct-app.component.html',
  styleUrls: ['./wct-app.component.css'],
  host: {
    '(document:click)': 'onDocumentClick($event)'
  }
})
export class WctAppComponent implements OnInit, AfterViewInit {

  @ViewChild(WctNotificationComponent) public notification;

  public finishPageLoading: boolean = false;
  public viewContainerRef: ViewContainerRef;
  public isSideMenu: boolean = false;

  constructor(
    public appState: AppState,
    public notificationService: WctNotificationService,
    public kc: AuthzService,
    public config: ConfigurationService,
    protected _pageService: PageService,
    protected _globalVars: GlobalVarsService,
    protected _toggle: ToggleElementsService,
    protected _navigation: NavigationService,
    protected _filter: FilterService,
    protected _viewContainerRef: ViewContainerRef) {
    // You need this small hack in order to catch application root view container ref
    this.viewContainerRef = _viewContainerRef;
  }

  public showSideMenu = () => !sessionStorage ? false : sessionStorage.getItem('wct-current-route') != '/' && localStorage.getItem('IXS_id');

  public ngAfterViewInit() {
    this.notificationService.initialize(this.notification);
  }

  public isSideMenuFixed = (): boolean => this._navigation.isSideMenuFixed;

  public ngOnInit() {
    console.log('Initial App State', this.appState.state);

    this._globalVars.setGlobalVars('current-page', 'app-home');
    this._globalVars.setGlobalComponents(DECLARATIONS);

    this.config.loadConfigurations()
      .then((response) => {

        this.kc.AuthzService();

        this._pageService.kc = this.kc;
        this.detectBrowserSize(document.documentElement.clientWidth);

        setTimeout(() => {
          this.finishPageLoading = true;
        }, 1000);
      })
      .catch((error) => {
        console.error('loadConfigurations --> ', error);
      });

  }

  public detectBrowserSize(width: number) {
    this._pageService.pageSize = width;
  }

  public onDocumentClick(e) {
    let eventPath: string = this._toggle.findEventPath(e).join(' > ');
    this._toggle.hideTooltips(eventPath);
    if (eventPath.indexOf('wct-toggle-submenu') < 0)
      this._toggle.hideSubMenu();
    if (!this._navigation.isSideMenuFixed && eventPath.indexOf('wct-side-menu') < 0)
      this._navigation.isSideMenuOpen = false;
    if (eventPath.indexOf('wct-btn-filter') < 0 && eventPath.indexOf('wct-side-filter') < 0)
      this._filter.hideFilter();
  }

}
