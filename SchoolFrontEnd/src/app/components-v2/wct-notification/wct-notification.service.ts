import { Injectable } from '@angular/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';

import { WctNotificationComponent, INotificationOptions } from './wct-notification.component';

@Injectable()
export class WctNotificationService {

    private _apiRecycle: Object = new Object();
    private _apiHistory: Object = new Object();
    private _apiByComponent: Object = new Object();

    constructor() {

    }

    private _defaultToasterConfigObject = {
        showCloseButton: true,
        timeout: 5000,
        limit: 1,
        positionClass: 'toast-top-right',
        mouseoverTimerStop: true
    };

    private _defaultToasterconfig: ToasterConfig = new ToasterConfig(this._defaultToasterConfigObject);
    private _notification: WctNotificationComponent;
    private _defaultConfig: ToasterConfig;

    public initialize(notification: WctNotificationComponent) {
        this._notification = notification;

        this._defaultConfig = this._notification.toasterconfig || new ToasterConfig();  // defaults config
        this._defaultConfig.tapToDismiss = false;
        this._defaultConfig.timeout = 5000;
        this._defaultConfig.limit = 1;
        this._defaultConfig.showCloseButton = true;
        this._defaultConfig.preventDuplicates = true;
        this._defaultConfig.positionClass = 'toast-top-right';
        this._defaultConfig.iconClasses = {
            error: 'fa fa-exclamation fx-status-error',
            success: 'fa fa-check fx-status-success',
            info: 'fa fa-info fx-status-info',
            wait: 'fa fa-clock-o fx-status-warning',
            warning: 'fa fa-exclamation-triangle fx-status-warning'
        };
    }

    public notify(type: string, title: string, msg: string, options?: INotificationOptions) {

        let customOptions = Object.assign({}, this._defaultToasterConfigObject);
        if (options)
            for (let i in options)
                customOptions[i] = options[i] === undefined ? this._defaultConfig[i] : options[i];

        this._notification.showNotification(this._prepareToast(type, this._notification.pageService.i18n(title), this._notification.pageService.i18n(msg), null), new ToasterConfig(customOptions));
    }

    public showError(title: string, msg: string, options?: any) {
        const toast: Toast = this._prepareToast('error', this._notification.pageService.i18n(title), this._notification.pageService.i18n(msg), options);

        this._defaultConfig = this._defaultConfig || this._notification.toasterconfig;
        this._defaultConfig.timeout = options.timeout.error || options.timeout.error === 0 ? options.timeout.error : this._defaultToasterconfig.timeout;
        this._defaultConfig.positionClass = options.positionClass.error ? 'toast-' + options.positionClass.error : this._defaultToasterconfig.positionClass;
        this._defaultConfig.limit = options.limit.error ? options.limit.error : this._defaultToasterconfig.limit;
        this._notification.showNotification(toast, this._defaultConfig);
    };
    public showSuccess(title: string, msg: string, options?: any) {
        const toast: Toast = this._prepareToast('success', this._notification.pageService.i18n(title), this._notification.pageService.i18n(msg), options);
        if (this._notification.toasterconfig) {
            this._notification.toasterconfig.timeout = options.timeout.success || options.timeout.success === 0 ? options.timeout.success : this._defaultToasterconfig.timeout;
            this._notification.toasterconfig.positionClass = options.positionClass.success ? 'toast-' + options.positionClass.success : this._defaultToasterconfig.positionClass;
            this._notification.toasterconfig.limit = options.limit.success ? options.limit.success : this._defaultToasterconfig.limit;
        }
        this._notification.showNotification(toast, this._defaultConfig);
    };
    public showInfo(title: string, msg: string, options?: any) {
        const toast: Toast = this._prepareToast('info', this._notification.pageService.i18n(title), this._notification.pageService.i18n(msg), options);
        this._defaultConfig = this._defaultConfig || this._notification.toasterconfig;
        this._defaultConfig.timeout = options.timeout.info || options.timeout.info === 0 ? options.timeout.info : this._defaultToasterconfig.timeout;
        this._defaultConfig.positionClass = options.positionClass.info ? 'toast-' + options.positionClass.info : this._defaultToasterconfig.positionClass;
        this._defaultConfig.limit = options.limit.info ? options.limit.info : this._defaultToasterconfig.limit;
        this._notification.showNotification(toast, this._defaultConfig);
    };
    public showWait(title: string, msg: string, options?: any) {
        const toast: Toast = this._prepareToast('wait', this._notification.pageService.i18n(title), this._notification.pageService.i18n(msg), options);
        this._defaultConfig = this._defaultConfig || this._notification.toasterconfig;
        this._defaultConfig.timeout = options.timeout.wait || options.timeout.wait === 0 ? options.timeout.wait : this._defaultToasterconfig.timeout;
        this._defaultConfig.positionClass = options.positionClass.wait ? 'toast-' + options.positionClass.wait : this._defaultToasterconfig.positionClass;
        this._defaultConfig.limit = options.limit.wait ? options.limit.wait : this._defaultToasterconfig.limit;
        this._notification.showNotification(toast, this._defaultConfig);
    };
    public showWarning(title: string, msg: string, options?: any) {
        const toast: Toast = this._prepareToast('warning', this._notification.pageService.i18n(title), this._notification.pageService.i18n(msg), options);
        this._defaultConfig = this._defaultConfig || this._notification.toasterconfig;
        this._defaultConfig.timeout = options.timeout.warning || options.timeout.warning === 0 ? options.timeout.warning : this._defaultToasterconfig.timeout;
        this._defaultConfig.positionClass = options.positionClass.warning ? 'toast-' + options.positionClass.warning : this._defaultToasterconfig.positionClass;
        this._defaultConfig.limit = options.limit.warning ? options.limit.warning : this._defaultToasterconfig.limit;
        this._notification.showNotification(toast, this._defaultConfig);
    };

    public clearNotifications() {
        this._notification.clear();
    }

    private _prepareToast(myType: string, myTitle: string, msg: string, options?: INotificationOptions): Toast {
        options = options || {};

        const toast: Toast = {
            type: myType,
            title: myTitle,
            body: msg,
            onHideCallback: options.onHideCallback,
            bodyOutputType: BodyOutputType.TrustedHtml
        };
        return toast;
    }
    
}