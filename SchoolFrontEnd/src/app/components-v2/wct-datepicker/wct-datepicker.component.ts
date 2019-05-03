import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl } from '@angular/forms';

import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';

import { DateService } from 'foundations-webct-robot/robot/services/date.service';

import * as moment from 'moment/moment';
import * as tz from 'moment-timezone';
import { ComponentsService } from 'foundations-webct-robot/robot/services/components.service';
import { ToggleElementsService } from 'foundations-webct-robot/robot/services/toggle-elements.service';
import { BsLocaleService } from 'ngx-bootstrap';
import { defineLocale, listLocales } from 'ngx-bootstrap/chronos';
import { ptBrLocale, enGbLocale, esLocale, esDoLocale } from "ngx-bootstrap/locale";
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';

@Component({
    selector: 'app-wct-datepicker',
    templateUrl: 'wct-datepicker.component.html'
})

export class WctDatepickerComponent implements OnInit, OnDestroy {

    @Input() public inputParameters: JsonParams;
    @Input() public control: FormControl;
    @Input() public value: string = null;
    @Input() public valuePosition: string = null;
    @Input() public bsValue: Date = null;

    @ViewChild('datePickerInputGroup') datePickerInputGroup: ElementRef;
    @ViewChild('timePopupPositionSimulator') timePopupPositionSimulator: ElementRef;
    @ViewChild('wctDatepicker') wctDatepicker: ElementRef;

    public invalidDateFormat: boolean = false;

    public timePicker: boolean = false;
    public bsConfig: BsDatePickerConfig = null;
    public myPlaceholder: string;
    public popupPosition: string = 'bottom';

    public componentElementsId: string = '';
    public componentElementsIdTime: string = '';
    public componentElementsIdOptions: string = '';
    public componentElementsIdDate: string = '';

    public upperDateTimeBound: Date = null; // from ->
    public lowerDateTimeBound: Date = null; // -> to

    private _timeout: any;
    private _dateValuesValidator: string = 'invalidDate';

    private _dateValidationRegExp: RegExp;
    private _dateFormat: string;
    private _selectingDate: boolean = false;

    constructor(
        private _utils: Utils,
        private _components: ComponentsService,
        private _toggle: ToggleElementsService,
        private _dateService: DateService,
        private _pageService: PageService,
        private _globalVars: GlobalVarsService,
        private _locale: BsLocaleService) {
    }

    public toggleSelectDate = () => this._selectingDate = !this._selectingDate;
    public today = () => this._setTodayOrClear(new Date());
    public clear = () => this._setTodayOrClear();

    public ngOnInit() {

        defineLocale('pt-pt', ptBrLocale);
        defineLocale('en-gb', enGbLocale);
        defineLocale('es-es', esLocale);
        defineLocale('es-do', esDoLocale);

        let currLang = this._globalVars.getLocalStorage('language').toLowerCase().replace('_', '-');
        this._locale.use(listLocales().indexOf(currLang) >= 0 ? currLang : 'en-gb');

        this._configDateType();

        if (this.inputParameters.readonly) {
            // this.inputParameters.type = 'label';
        } else {

            this.componentElementsId = this._components.getHtmlId(this.inputParameters, this.valuePosition ? 'date-interval-' + this.valuePosition : null);
            this.componentElementsIdTime = this.componentElementsId + '-timer';
            this.componentElementsIdOptions = this.componentElementsId + '-options';

            if (this.inputParameters.placeholder !== undefined)
                this.myPlaceholder = this.inputParameters.placeholder;

            this.timePicker = this.inputParameters.subType == 'dateTime';
            this.bsConfig = {
                containerClass: 'theme-default',
                dateInputFormat: this._dateFormat
            };

            if (!this.control)
                this.control = new FormControl();

            this._setMinMaxValuesValidation();

            if (this.valuePosition) {
                this._preventEmptyValue();
                this.setValue(/* this.inputParameters.originalValue[this.valuePosition] ||  */this.inputParameters.value[this.valuePosition]);
            } else if (this.inputParameters.value)
                this.setValue(/* this.inputParameters.originalValue ||  */this.inputParameters.value);

            // date boundaries:
            if (this.inputParameters.min) {
                this._setDTBound(this.inputParameters.min.toString(), 'upper');
            }

            if (this.inputParameters.max) {
                this._setDTBound(this.inputParameters.max.toString(), 'lower');
            }
        }

    }

    public ngOnDestroy() {
        if (this._toggle.getTooltipStatus(this.componentElementsIdTime))
            this._toggle.toggleTooltipStatus(this.componentElementsIdTime);
    }

    public setValueManual(date: string) {

        this.control.markAsDirty();
        this.control.markAsTouched();

        this._toggle.hideTooltips();

        if (!date) {
            this.setValue();
            return;
        }

        if (!date.match(this._dateValidationRegExp)) {
            this.control.setValue(date);
            this.control.setErrors(
                Object.assign(this.control.errors || {}, { [this._dateValuesValidator]: true })
            );
            return;
        } else if (this.control.errors)
            delete this.control.errors[this._dateValuesValidator];

        let formatedDate: string = tz((date), this._dateFormat).toISOString();
        this.setValue(formatedDate);

    }

    public setValue(date: any = null, openTime: boolean = false) {

        this.control.markAsDirty();
        this.control.markAsTouched();

        this._toggle.hideTooltips();

        if (!date) {
            date = null;
        } else if (!(date instanceof Date))
            date = new Date(date);

        if (date && !this.timePicker)
            date = new Date(this.valuePosition == '$gte' ? date.setHours(0, 0, 0) : this.valuePosition == '$lt' ? date.setHours(23, 59, 59) : date);

        this._preventEmptyValue();

        if (this.valuePosition) {
            if (date) {

                // this.inputParameters.originalValue[this.valuePosition] = date;
                this.inputParameters.value[this.valuePosition] = date;
                if (this.inputParameters.value.$gte && this.inputParameters.value.$lt && this.inputParameters.value.$lt < this.inputParameters.value.$gte) {
                    let changePos = this.valuePosition === '$gte' ? '$lt' : '$gte';
                    // this.inputParameters.originalValue[changePos] = this.inputParameters.originalValue[this.valuePosition];
                    this.inputParameters.value[changePos] = this.inputParameters.value[this.valuePosition];
                }
            } else {
                // delete this.inputParameters.originalValue[this.valuePosition];
                delete this.inputParameters.value[this.valuePosition];
            }
        } else {
            // this.inputParameters.originalValue = date;
            this.inputParameters.value = date;
        }

        if (this._selectingDate && openTime && this.timePicker) {
            this._selectingDate = false;
            this._toggle.toggleTooltipStatus(this.componentElementsIdTime, false);
            this._toggle.toggleElementPotition(this.componentElementsIdTime, this.timePopupPositionSimulator.nativeElement, this.datePickerInputGroup.nativeElement);
        }

        this.control.setValue(this.inputParameters.value);
    }

    public showCurrentValue = () => this.valuePosition ? (this.inputParameters.value ? this.inputParameters.value[this.valuePosition] : '') : this.inputParameters.value;

    public evaluatePopupPosition = (event) => {
        this.popupPosition = (event.y * 1) / document.body.clientHeight > 0.5 ? 'top' : 'bottom'
    };

    public formatDate = (date: Date) => {
        if (!date)
            return date;

        try {
            date = new Date(date);
        } catch (e) { }

        return date instanceof Date ? moment(date.toISOString()).format(this._dateFormat) : date
    }

    public getPopupStatus = (id: string) => this._toggle.getTooltipStatus(id);
    public togglePopupPicker = (id: string) => this._toggle.toggleTooltipStatus(id);
    public hideTooltips = () => this._toggle.hideTooltips();

    private _preventEmptyValue() {
        // this.inputParameters.originalValue = this.inputParameters.originalValue || {};
        this.inputParameters.value = this.inputParameters.value || {};
    }

    private _setMinMaxValuesValidation() {
        if (!this._pageService.errorDefs[this.inputParameters.id])
            this._pageService.errorDefs[this.inputParameters.id] = {};

        this._pageService.errorDefs[this.inputParameters.id][this._dateValuesValidator] = this._utils
            .i18n('warnings___dateValuesValidation');
    }

    private _setDTBound(period: string, bound: string): void {
        switch (period) {
            case 'day':
                if (bound === 'upper') this.upperDateTimeBound = moment().subtract(1, 'days').toDate();
                else this.lowerDateTimeBound = moment().add(1, 'days').toDate();
                break;
            case 'week':
                if (bound === 'upper') this.upperDateTimeBound = moment().subtract(7, 'days').toDate();
                else this.lowerDateTimeBound = moment().add(7, 'days').toDate();
                break;
            case 'month':
                if (bound === 'upper') this.upperDateTimeBound = moment().subtract(1, 'months').toDate();
                else this.lowerDateTimeBound = moment().add(1, 'months').toDate();
                break;
            case 'quarter':
                if (bound === 'upper') this.upperDateTimeBound = moment().subtract(3, 'months').toDate();
                else this.lowerDateTimeBound = moment().add(3, 'months').toDate();
                break;
            case 'semester':
                if (bound === 'upper') this.upperDateTimeBound = moment().subtract(6, 'months').toDate();
                else this.lowerDateTimeBound = moment().add(6, 'months').toDate();
                break;
            case 'year':
                if (bound === 'upper') this.upperDateTimeBound = moment().subtract(1, 'years').toDate();
                else this.lowerDateTimeBound = moment().add(1, 'years').toDate();
                break;
            default:
                // custom date
                this._processCustomDateRange(period, bound);
        }

        this._compareDTBounds();
    }

    private _processCustomDateRange(period: string, bound: string): void {
        const minMax: string = bound === 'upper' ? 'min' : 'max';
        const warnMsg: string = 'WEBCT DATEPICKER INTERVAL -> Invalid date format used for date range ' + bound + ' boundary (' + minMax + ')!\nFormat must be \"MM-DD-YYYY\".\nThis boundary will be set to infinite.';

        // adicionar formato data webct
        if (!moment(period, this._dateFormat).isValid()) {
            console.warn(warnMsg);
            return;
        }

        if (bound === 'upper') this.upperDateTimeBound = moment(period, this._dateFormat).toDate();
        else this.lowerDateTimeBound = moment(period, this._dateFormat).toDate();
    }

    private _compareDTBounds() {

        if (!(this.upperDateTimeBound) && this.lowerDateTimeBound) {
            this.inputParameters.value = this.setValue(this.lowerDateTimeBound);
        } else if (this.upperDateTimeBound && !(this.lowerDateTimeBound)) {
            this.inputParameters.value = this.setValue(this.upperDateTimeBound);
        } else if (this.upperDateTimeBound && this.lowerDateTimeBound) {
            this.inputParameters.value = this.inputParameters.value === undefined ? {} : this.inputParameters.value;
            this.inputParameters.value[this.valuePosition] = this.valuePosition === '$gte' ? this.setValue(this.upperDateTimeBound) : this.setValue(this.lowerDateTimeBound);
            if (moment(this.upperDateTimeBound).isSameOrAfter(this.lowerDateTimeBound, 'day')) {
                // min >= max:
                this.lowerDateTimeBound = null;
                console.warn('WEBCT DATEPICKER INTERVAL -> Invalid date range defined!\nUpper boundary (min) must not succeed or be the same as lower boundary (max).\nLower boundary will be set to infinite.');
            }
        }
    }

    private _configDateType() {
        this.timePicker = this.inputParameters.subType == 'dateTime';
        this._dateValidationRegExp = this.timePicker ? this._dateService.dateTimeFormatFriendlyRegex : this._dateService.dateFormatFriendlyRegex;
        this._dateFormat = this._getDateFormat();
        this.myPlaceholder = this._getDateFormat(false);
    }

    private _getDateFormat(resetSeconds: boolean = true): string {
        let format = this.timePicker ? this._dateService.dateTimeFormatFriendly : this._dateService.dateFormatFriendly;
        return format; // Alteração no âmbito do FIX WEBCT-702
        // return resetSeconds ? format.replace('ss', '00') : format;
    }

    private _setTodayOrClear(date?: Date) {
        this.wctDatepicker.nativeElement.value = date ? this.formatDate(date) : '';
        this.wctDatepicker.nativeElement.dispatchEvent(new Event('change'));
    }

}

interface BsDatePickerConfig {
    containerClass: string;
    dateInputFormat: string;
    locale?: string;
    maxDate?: Date;
    minDate?: Date;
    showWeekNumbers?: boolean;
}
