import { Component, OnInit } from '@angular/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';

import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';

@Component({
  selector: 'app-wct-notification',
  templateUrl: './wct-notification.component.html',
  styleUrls: ['./wct-notification.component.scss']
})

export class WctNotificationComponent {

  public pageService: PageService;
  public toasterconfig: ToasterConfig = new ToasterConfig({
    showCloseButton: false,
    timeout: 1000,
    limit: 1,
    positionClass: 'toast-top-right',
    mouseoverTimerStop: true
  });
  private _toasterService: ToasterService;

  constructor(
    pageService: PageService,
    toasterService: ToasterService) {
    this._toasterService = toasterService;
    this.pageService = pageService;
  }

  public showNotification(toast: Toast, newToasterConfig?: ToasterConfig) {
    if (newToasterConfig) {
      for (let c in newToasterConfig) {
        if (newToasterConfig[c] && typeof newToasterConfig[c] == 'object') {
          Object.assign(this.toasterconfig[c], newToasterConfig[c]);
          continue;
        }
        this.toasterconfig[c] = newToasterConfig[c];
      }
    }
    this._toasterService.pop(toast);
  };

  public clear() {
    this._toasterService.clear();
  }
}

export interface INotificationType {
  showError: Function;
  showSuccess: Function;
  showInfo: Function;
  showWait: Function;
  showWarning: Function;
}

export interface INotificationOptions {
  positionClass?: string;
  timeout?: number;
  limit?: number;
  onShowCallback?: any;
  onHideCallback?: any;
  iconClasses?: {
    error?: string;
    success?: string;
    info?: string;
    wait?: string;
    warning?: string;
  };
}
