import { Component, NgModule, Input, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { FilterService } from 'foundations-webct-robot/robot/services/filter.service';

import * as moment from 'moment/moment';
import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { ComponentsService } from 'foundations-webct-robot/robot/services/components.service';

@Component({
  selector: 'app-wct-filter',
  templateUrl: './wct-filter.component.html',
  styleUrls: ['./wct-filter.component.css']
})
export class WctFilterComponent implements OnInit {

  @Input() public viewStructure: JsonParams;
  @Input() public sidebar: JsonParams = new JsonParams();
  @Input() public inputParameters: JsonParams[];
  @Input() public initDateSearch: boolean = false;
  @Input() public filterDateField = 'creationDate';
  @Input() public filterDateInterval = 'last week';
  @Input() public horizontalFilter: boolean = false;

  @Input() public inputFilters: JsonParams[];

  @Output() public filter: EventEmitter<any> = new EventEmitter();

  public form: FormGroup;
  public currentFilterDateInterval = {};
  public toDefault = moment({ hour: 23, minute: 59, seconds: 59 });
  public fromDefault = moment({ hour: 0, minute: 0, seconds: 0 }).subtract(1, 'week')['_d'];

  public filterFields: JsonParams[] = [];
  public filterFieldsOriginalValue: Object = {};

  private _searchDatesInterval: JsonParams[] = [];

  private _fieldsToClean: JsonParams[] = [];
  private _componentID: string;

  constructor(
    private _pageService: PageService,
    private _robot: RobotEngineModel,
    private _filterService: FilterService,
    private _globalVars: GlobalVarsService,
    private _components: ComponentsService,
    private _utils: Utils) {
    this._componentID = 'FILTER-' + this._utils.guid(4, '');
  }

  public getHtmlId = (parameter: JsonParams, type: string) => this._components.getHtmlId(parameter, type);

  public ngOnInit() {

    this.filterFields = this.inputFilters ? this.inputFilters : this._filterService.getFilterFields(this._utils.orderParametersByPosition(this.inputParameters));
    this.filterFields.forEach(mainObj => {
      if (mainObj.type == 'initParameters' && mainObj.groups.details && mainObj.groups.details.parameters) {
        mainObj.groups.details.parameters.forEach(initParamsObj => this._saveFilterParameter(initParamsObj));
        return;
      }
      this._saveFilterParameter(mainObj);
    });
    this.form = this._pageService.configValidators(this.filterFields, false);
    this._setGlobalFilter();
  }

  public onSubmit() {
    this._filterService.hideFilter();
    let filterFieldsEmpty = this._filterService.getFilterObject(this.filterFields);
    if (this.sidebar.mappingId)
      this._filterParameterById(this._utils.cloneJsonParse(filterFieldsEmpty));
    else
      this.filter.emit(JSON.stringify(filterFieldsEmpty));
  }

  public setDefaultFilters(submit: boolean = true) {

    this._fieldsToClean.forEach(obj => {
      if (obj.type == 'dates-interval') {
        let intervalsParam = this._globalVars.getPageParameter('intervals::' + obj.id);
        if (intervalsParam)
          intervalsParam.value = this._utils.cloneObject(intervalsParam.data.initFilterValue);
      }
      obj.value = this._utils.cloneObject(obj.data.initFilterValue);
    });

    this._robot.updateDynamicPropsOnPageParameters(this._utils.arrToObj(this._fieldsToClean));

  }

  private _saveFilterParameter(obj: JsonParams) {
    obj.data = { 'initFilterValue': this._utils.cloneObject(obj.value) };
    this._fieldsToClean.push(obj);
    if (this.inputFilters)
      this._globalVars.setPageParameters(obj, this._componentID);
  }

  private _setGlobalFilter() {
    let hasGlobalSearch: boolean = false;
    let queryFilter: any = this._pageService.getParameterByName('filter');

    if (queryFilter) {

      try {
        let hasFilterParameter: JsonParams;
        queryFilter = JSON.parse(queryFilter);
        for (let i in queryFilter) {
          hasFilterParameter = this._utils.findObjectInArray(this.filterFields, i, 'apiFieldName');
          hasFilterParameter = hasFilterParameter.id ? hasFilterParameter : this._utils.findObjectInArray(this.filterFields, i, 'id');
          if (hasFilterParameter.id) {
            hasGlobalSearch = true;
            hasFilterParameter.value = queryFilter[i];
          }
        }

        this.onSubmit();

      } catch (e) {

      }
    }
  }

  private _filterParameterById(filterFieldsEmpty: Object) {
    if (typeof this.sidebar.mappingId == 'string')
      this.sidebar.mappingId = [this.sidebar.mappingId];
    for (let mapId of this.sidebar.mappingId)
      this._globalVars.setFilterById(mapId, filterFieldsEmpty);
    this._globalVars.emitFilters();
  }

}
