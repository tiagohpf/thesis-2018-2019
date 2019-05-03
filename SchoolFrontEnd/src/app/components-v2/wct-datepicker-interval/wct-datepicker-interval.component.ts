import { Component, Input, Output, EventEmitter, OnInit, DoCheck, OnDestroy, KeyValueDiffers } from '@angular/core';

import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';

import * as moment from 'moment/moment';

@Component({
  selector: 'app-wct-datepicker-interval',
  templateUrl: 'wct-datepicker-interval.component.html'
})

export class WctDatepickerIntervalComponent implements OnInit, DoCheck, OnDestroy {

  @Input() public props;
  @Input() public filterDateInterval: any;

  public preSetPeriod;

  public intervals: JsonParams;

  private _differ: any;
  private _componentId: string;

  constructor(
    private _utils: Utils,
    private _keyValueDiffers: KeyValueDiffers,
    private _globalVars: GlobalVarsService) {

    this._differ = _keyValueDiffers.find({}).create();
    this._componentId = 'DATESINTERVAL-' + this._utils.guid(4, '');

  }

  public ngOnInit() {

    const reformedValueList = [];
    if (this.props.valueList && this.props.valueList.length > 0) {
      this.props.valueList.forEach(val => {
        val.key = val.value;
        val.value = val.text;
        delete val.text;
      });

      this._createSelectObj();

      this.preSetPeriod = this.props.parameters ? this._utils.findObjectInArray(this.props.parameters, 'preSetPeriod') : null;
      if (this.preSetPeriod.key === 'preSetPeriod') {
        const range = this.props.apiFieldName || this.props.id;
        this.intervals.setPropertyValue('value', this.preSetPeriod.value);
        this.intervals.setPropertyValue('originalValue', this.preSetPeriod.value);
        this.props.value = this._utils.date_range(this.preSetPeriod.value, range)[range];
      }
      this.intervals.data = { 'initFilterValue': this._utils.cloneObject(this.intervals.value) };
    }
    this.props.data = { 'initFilterValue': this._utils.cloneObject(this.props.value) };
  }

  public ngOnDestroy() {
    this._globalVars.deletePageParametersByGroup(this._componentId);
  }

  public ngDoCheck() {
    if (this.intervals) {
      const changeValue = this._differ.diff(this.intervals);
      if (changeValue) {
        changeValue.forEachChangedItem((itm) => {
          if (typeof itm.currentValue === 'string') {
            const range = itm.currentValue ? this._utils.date_range((itm.currentValue != 'customInterval' ? itm.currentValue : this.filterDateInterval), this.props.id) : null;
            this.props.setPropertyValue('value', range ? range[this.props.id] : '');
          }
        });
      }
    }
  }

  private _createSelectObj() {

    this.intervals = new JsonParams();
    this.intervals.id = 'intervals::' + this.props.id;
    this.intervals.type = 'input-select';
    this.intervals.valueList = this.props.valueList;
    this.intervals.validator = this.props.validator;
    this.intervals.placeholder = this.props.placeholder === null ? null : this.props.placeholder || 'generic___chooseRangePeriod';

    this._updateMainObj();
    this._globalVars.setPageParameters(this.intervals, this._componentId);
  }

  private _updateMainObj() {
    delete this.props.placeholder, this.props.valueList, this.props.value;
    this.props.value = this.props.value ? this._utils.date_range(this.props.value, this.props.apiFieldName || this.props.id) : this.props.value;
  }

}

