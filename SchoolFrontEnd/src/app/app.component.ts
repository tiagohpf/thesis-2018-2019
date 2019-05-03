import { PrintService } from './customComponents/print/print.service';
import {
  Component,
  ViewEncapsulation,
  ViewContainerRef,
  ViewChild,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  HostListener
} from "@angular/core";
import { Router } from "@angular/router";

import { ConfigurationService } from "foundations-webct-robot/robot/utils/configuration.service";
import { PageService } from "foundations-webct-robot/robot/pageComponent/page.service";
import { AuthzService } from "foundations-webct-robot/robot/utils/authz.service";
import { GlobalVarsService } from "foundations-webct-robot/robot/utils/global-vars.service";

import { ToggleElementsService } from "foundations-webct-robot/robot/services/toggle-elements.service";

import { AppState } from "./app.service";
import { WctNotificationService } from "./components-v2/wct-notification/wct-notification.service";
import { WctNotificationComponent } from "./components-v2/wct-notification/wct-notification.component";

import { NotificationComponent, NotificationService } from 'foundations-webct-palette/components/notificationComponent/notification.component';

import { DECLARATIONS } from "./webct.components";
import { WctAppComponent } from "./components-v2/wct-app/wct-app.component";
import { NavigationService } from "foundations-webct-robot/robot/services/navigation.service";
import { FilterService } from "foundations-webct-robot/robot/services/filter.service";
import { ModalService } from "foundations-webct-palette/components/modalComponent/modal.service";
import { JsonParams } from "foundations-webct-robot/robot/classes/jsonParams.class";

import {} from 'jasmine';

@Component({
  selector: "app-root",
  encapsulation: ViewEncapsulation.None,
  templateUrl: "app.component.html",
  styleUrls: ["app.component.css"]
})
export class AppComponent extends WctAppComponent
  implements OnInit, AfterViewInit {
  
    @ViewChild(WctNotificationComponent) public notification;
    @ViewChild(NotificationComponent) public notificationWct;
  
    constructor(
    appState: AppState,
    notificationService: WctNotificationService,
    public notificationServiceWct: NotificationService,
    kc: AuthzService,
    config: ConfigurationService,
    pageService: PageService,
    globalVars: GlobalVarsService,
    toggle: ToggleElementsService,
    navigation: NavigationService,
    filter: FilterService,
    viewContainerRef: ViewContainerRef,
    public modalService: ModalService,
    private _appService: AppState,
    public printService: PrintService
  ) {
    super(
      appState,
      notificationService,
      kc,
      config,
      pageService,
      globalVars,
      toggle,
      navigation,
      filter,
      viewContainerRef
    );
  }

  private _slideNavBar = true;

  public ngAfterViewInit() {
    this.notificationService.initialize(this.notification);
    this.notificationServiceWct.initialize(this.notificationWct);
  }

  public ngOnInit() {
    this._globalVars.setGlobalVars("current-page", "app-home");
    this._globalVars.setGlobalComponents(DECLARATIONS);

    this.config
      .loadConfigurations()
      .then(response => {
        this.kc.AuthzService();

        this._pageService.kc = this.kc;
        this.detectBrowserSize(document.documentElement.clientWidth);

        setTimeout(() => {
          this.finishPageLoading = true;
        }, 1000);
      })
      .catch(error => {
        console.error("loadConfigurations --> ", error);
      });
    this.firstPage();
  }

  public firstPage() {
    let cookie: string = document.cookie;
    if (
      !cookie.includes("startDontShowModalAgain") &&
      !sessionStorage.getItem("modalStart")
    ) {
      let operations = new JsonParams();
      operations.size = "start";
      operations.id = "startModal";
      this.modalService.openModal("modalStart", null, null, operations);
      this._appService.isStartModal = true;
    }
  }

  public isStartModal = () => this._appService.isStartModal;
  public hasSlideNavBar = () => this._slideNavBar;

  @HostListener("window:scroll", ["$event"])
  scrollHandler(event) {
    if (window.pageYOffset >= 200) {
      this._slideNavBar = false;
    } else {
      this._slideNavBar = true;
    }
  }

  public isModalShow = () => this.modalService.isModalShown;
}
