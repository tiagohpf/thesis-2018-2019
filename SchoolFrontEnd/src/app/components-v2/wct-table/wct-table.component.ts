import { ChangeDetectionStrategy, Component, NgModule, Directive, EventEmitter, ElementRef, Renderer, Output, Input, SimpleChange, OnInit, OnDestroy, DoCheck, OnChanges } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { ExportService } from 'foundations-webct-palette/components/tableComponent/table-export.service';
import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';

import { ApiService } from 'foundations-webct-robot/robot/services/api.service';

import * as tz from 'moment-timezone';
import * as moment from 'moment/moment';
import { ComponentsService } from 'foundations-webct-robot/robot/services/components.service';
import { DateService } from 'foundations-webct-robot/robot/services/date.service';

@Component({
  selector: 'app-wct-table',
  templateUrl: './wct-table.component.html',
  styleUrls: ['./wct-table.component.css']
})
export class WctTableComponent implements OnInit, OnDestroy, OnChanges, DoCheck {

  @Input() public viewStructure: JsonParams;
  @Input() public filter;
  @Input() public filterDateField = 'creationDate';
  @Input() public dataRecsMainInfo;
  @Input() public inputDataRecs: Object;
  @Input() public dataRecsNoContent;
  // @Input() public o2csBalance: boolean;
  @Input() public listName;
  @Input() public allowReload = true;
  @Input() public pagingSettings;

  @Input() public rows: JsonParams;

  @Input() public columns;
  @Input() public config;
  @Input() public tblClass;
  @Input() public model;
  @Input() public tabs;

  @Input() public isHorizontalFilter: boolean;

  @Input() public viewStructureContext: JsonParams[];
  @Input() public baseInfoForm: FormGroup;

  public tableHasData: boolean = false;
  public tableIsLoading: boolean = true;

  public lastWeekSearch = {};

  public refreshMe = false;
  public customFilter = false;
  public absoluteFilter = true;
  public absoluteFilterOptions = {
    'last week': 'generic___last7Days',
    'last month': 'generic___lastMonth',
    'last quarter': 'generic___lastQuarter',
    'last year': 'generic___lastYear',
    'last day': 'generic___lastDay',
    'last 24h': 'generic___last24h',
    'current month': 'generic___currentMonth',
    'previous month': 'generic___previousMonth',
    'last semester': 'generic___lastSemester'
  };

  public expandedRows: number[] = [];
  public checkedRows: Object = {};
  // public buttonOptions: Object = {};

  public expandColumn: JsonParams = null;
  public checkBulkColumn: JsonParams = null;
  public tableSearchHidden: number[] = [];

  public filterIntervalFormat: string;

  public displayedColumns = [];

  // Outputs (Events)
  @Output() public tableChanged: EventEmitter<any> = new EventEmitter();
  @Output() public emitAction: EventEmitter<any> = new EventEmitter();
  @Output() public pageChanged: EventEmitter<any> = new EventEmitter();
  @Output() public openModal: EventEmitter<any> = new EventEmitter();
  @Output() public emitMakeFilter: EventEmitter<any> = new EventEmitter();

  private _showPaging: boolean = true;
  private _componentId: string;

  private _tableConfig: JsonParams;
  private _clonedRowsObject: Object = new Object();

  constructor(
    public pageService: PageService,
    private _robot: RobotEngineModel,
    private _http: HttpClient,
    private _utils: Utils,
    private _apiService: ApiService,
    private _globalVars: GlobalVarsService,
    private _component: ComponentsService,
    private _dateService: DateService,
    private _exportService: ExportService) {

    this._componentId = 'TABLE-' + this._utils.guid(4, '');

  }

  public getHtmlId = (param: JsonParams, type?: string, wct: boolean = true) => this._component.getHtmlId(param, type, wct);
  public formatDate = (date: string) => date ? moment(date).format(this.filterIntervalFormat) : date;

  public ngOnInit() {

    /**
     * MATERIAL v2.0
     */
    this.displayedColumns = this.columns.map(obj => obj.id);

    if (!this.viewStructure.valueList)
      this.viewStructure.valueList = this.rows.value;






    let tableManualActions = this._utils.findObjectInArray(this.viewStructure.parameters, 'tableActions').value || {};

    this._showPaging = tableManualActions['pagination'];

    for (let column of this.columns)
      this._globalVars.setPageParameters(column, this._componentId);

    // Identifica a coluna que contem a acção de expansão
    this.expandColumn = this._utils.findObjectInArray(this.columns, 'expand', 'type');
    // Identifica a coluna que contem a acção de "ckeck"
    this.checkBulkColumn = this._utils.findObjectInArray(this.columns, 'bulkOperations', 'key');

    this._evaluateTableData();
    if (this.tableHasData)
      this._evaluateColumnUrl();

    this._setConfigParameter();

    if (this.filterDateField)
      this._formatFilterInterval();

  }

  public ngOnDestroy() {
    this._globalVars.deletePageParametersByGroup(this._componentId);
  }

  public ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {

    this._evaluateTableData();

    if (changes['filter'] && changes['filter']['currentValue'] && Object.keys(changes['filter']['currentValue']).length > 0) {
      this._startTableLoading();
      this.customFilter = true;
      for (let i in this.absoluteFilterOptions) {
        this.lastWeekSearch = this._utils.date_range(i, this.filterDateField);
        if (JSON.stringify(changes['filter']['currentValue'][this.filterDateField]) == JSON.stringify(this.lastWeekSearch[this.filterDateField])) {
          this.absoluteFilter = this.absoluteFilterOptions[i];
          this.customFilter = false;
          break;
        }
      }
    }

  }

  public ngDoCheck() {
    this._evaluateTableData();
  }

  public setOperationIndex(rowIndex: number): Object {
    return { page: this.pagingSettings.currentPage, row: rowIndex };
  }

  public showPaging() {
    if (this._showPaging === false)
      return false;
    return true;
  }

  public setSort(column) {
    if (column.sort === undefined)
      return;

    let lastSort: JsonParams[] = this.columns.filter(obj => obj.id != column.id && (obj.sort == 'ASC' || obj.sort == 'DESC'));
    for (let col of lastSort)
      col.sort = true;

    column.sort = column.sort == 'ASC' ? 'DESC' : 'ASC';

    this.pageService.updateConfigParameterSort(this._tableConfig, column);

    this._startTableLoading();
    this._onChangeTable(column);
  }

  // emit pagechanged event
  public pageChange(loading: boolean = false, pageNumber: number = null) {

    if (pageNumber) {
      this.pagingSettings.currentPage = pageNumber;
      this.pageService.updateConfigParameterPaging(this._tableConfig, this.pagingSettings);
    }

    this._startTableLoading();
    if (loading) {
      this.rows.value = null;
      this.rows.originalValue = null;
      this.refreshMe = true;
      this.dataRecsNoContent = null;
      this._evaluateTableData();
      setTimeout(() => {
        this.refreshMe = false;
        this.pageChanged.emit(true);
      }, 500);
    } else {
      this.pageChanged.emit(true);
    }

  }

  /// chamada no change do select box com o numero de registos a mostrar por pagina
  public changeItemsPerPage() {
    this._startTableLoading();
    if (this.pagingSettings.currentPage != 1) {
      setTimeout(() => {
        this.pagingSettings.currentPage = 1;
        this.pageService.updateConfigParameterPaging(this._tableConfig, this.pagingSettings);
      }, 100);
    } else
      this.pageChange();
  }

  /// chamada no keyup  do input com o numero de pagina a visualizar
  public checkInputPaging(e) {

    let execute = e.which === 13;
    let inputValue = e.target.value;

    if (e.which == 38 || e.which == 39) {
      // 38 = up arrow, 39 = right arrow
      this.pagingSettings.currentPage++;
      this.pageService.updateConfigParameterPaging(this._tableConfig, this.pagingSettings);
      return;
    } else if ((e.which == 37 || e.which == 40) && this.pagingSettings.currentPage > 1) {
      // 37 = left arrow, 40 = down arrow
      this.pagingSettings.currentPage--;
      this.pageService.updateConfigParameterPaging(this._tableConfig, this.pagingSettings);
      return;
    }
    if (isNaN(inputValue)) {
      this.pagingSettings.currentPage = +this.pagingSettings.currentPage.toString().replace(/[^\d]/g, '');
      this.pageService.updateConfigParameterPaging(this._tableConfig, this.pagingSettings);
      return;
    }
    if (!execute)
      return;
    this.pagingSettings.currentPage = +inputValue;
    this.pageService.updateConfigParameterPaging(this._tableConfig, this.pagingSettings);
  }

  public checkRows(column: JsonParams, rowIndex: number = -1) {

    column.value = [];

    if (!this.checkedRows[column.id])
      this.checkedRows[column.id] = [];

    let rowChecked = this._rowCheckedIndex(rowIndex, column.id);

    if (rowIndex < 0) {
      this.checkedRows[column.id] = this.checkedRows[column.id].length != this.rows.value.length ? Object.keys(this.rows.value) : [];
    } else {
      if (rowChecked >= 0)
        this.checkedRows[column.id].splice(rowChecked, 1);
      else
        this.checkedRows[column.id].push(rowIndex.toString());
    }
    if (this.checkedRows[column.id].length > 0) {
      let pushValue: any;
      for (let i in this.checkedRows[column.id]) {
        pushValue = this.rows.originalValue[this.checkedRows[column.id][i]];
        pushValue = column.pathToValue ? this._utils.getValueFromDataForThisKey(pushValue, column.pathToValue) : pushValue;
        column.value.push(pushValue);
      }
    }

    if (column.parameters && column.parameters.length > 0) {
      let autoCheckById = this._utils.findObjectInArray(column.parameters, 'autoCheckById');
      if (autoCheckById.value && rowChecked < 0) {
        autoCheckById.value = typeof autoCheckById.value == 'string' ? [autoCheckById.value] : autoCheckById.value;
        for (let i in autoCheckById.value) {
          let checkColumn = this._utils.findObjectInArray(this.columns, autoCheckById.value[i], 'id');
          if (this._rowCheckedIndex(rowIndex, checkColumn.id) < 0)
            this.checkRows(checkColumn, rowIndex);
        }
      }
      let autoUncheckById = this._utils.findObjectInArray(column.parameters, 'autoUncheckById');
      if (autoUncheckById.value && rowChecked >= 0) {
        autoUncheckById.value = typeof autoUncheckById.value == 'string' ? [autoUncheckById.value] : autoUncheckById.value;
        for (let i in autoUncheckById.value) {
          let uncheckColumn = this._utils.findObjectInArray(this.columns, autoUncheckById.value[i], 'id');
          if (this._rowCheckedIndex(rowIndex, uncheckColumn.id) >= 0)
            this.checkRows(uncheckColumn, rowIndex);
        }
      }
    }

  }

  public isRowChecked(rowIndex: number, columnId: string = null) {
    for (let i in this.checkedRows)
      if (this._rowCheckedIndex(rowIndex, i) >= 0)
        return true;
    return false;
  }

  public makeFilter(value) {
    this.emitMakeFilter.emit(value);
  }

  public getRowColumnObject(column: JsonParams, rowIndex: number): JsonParams[] {

    let cloneRowId = '${' + this.pagingSettings.currentPage + '-' + rowIndex + '}';
    let cloneId = column.id + cloneRowId;

    if (this._clonedRowsObject[cloneId])
      return [this._clonedRowsObject[cloneId]];

    let clone = column.clone(cloneRowId);
    this._clonedRowsObject[cloneId] = clone;
    this._globalVars.setPageParameters(clone, this._componentId);

    return [clone];
  }

  private _rowCheckedIndex(rowIndex: number, columnId: string) {
    if (!this.checkedRows[columnId])
      return -1;
    return this.checkedRows[columnId].indexOf(rowIndex.toString());
  }

  private _onChangeTable(column: any) {
    this.tableChanged.emit({ sorting: [column] });
  }

  private _startTableLoading() {
    this.tableHasData = false;
    this.tableIsLoading = true;
    this._cleanColumnsValues();
    for (let eachColumn of this.columns)
      this._robot.changeParameterByDynamicProps(eachColumn, this._utils.arrToObj(this.columns));
  }

  private _evaluateColumnUrl(checkForDependencies: boolean = false) {
    for (let p in this.columns) {

      if (this.columns[p].lazyLoading)
        continue;
      if (checkForDependencies) {
        if (!this.columns[p].value) {
          if (this.columns[p].groups && this.columns[p].groups.urlResource)
            this._startParameterRequest(this.columns[p]);
          else
            this._dealWithParamApi(this.columns[p]);
        }
        continue;
      }
      if (!(this.columns[p].groups && this.columns[p].groups.urlResource))
        continue;

      this._startParameterRequest(this.columns[p]);
    }
  }

  private _cleanColumnsValues(column: JsonParams = null) {

    for (let i in this._clonedRowsObject)
      this._globalVars.deletePageParameterById(i);
    this._clonedRowsObject = new Object();

    for (let p in this.columns) {
      if (column && column.id != this.columns[p].id)
        continue;
      this.columns[p].value = this.columns[p].pathToValue ? null : this.columns[p].value;
      this.columns[p].valueList = this.columns[p].pathToValueList ? null : this.columns[p].valueList;
    }
  }

  private _evaluateTableData() {

    let last_tableHasData = this.tableHasData;

    this.tableHasData = this.rows.value && this.rows.value.length > 0;
    this.tableIsLoading = !this.rows.value;

    if (!this.tableHasData)
      this._cleanColumnsValues();
    if (!last_tableHasData && this.tableHasData)
      this._evaluateColumnUrl();

  }

  private _startParameterRequest(parameter: JsonParams) {

    parameter.lazyLoading = true;
    parameter.value = null;

    this._cleanColumnsValues(parameter);

    let urlResourceConfig = parameter.groups.urlResource.parameters;
    let formatedUrl = this.pageService.startApiConfiguration(urlResourceConfig, this.inputDataRecs);

    let forkJoin = this._utils.findObjectInArray(urlResourceConfig, 'forkJoin').value;
    if (forkJoin) {
      // let forkJoinUrl = [];
      // let forkJoinRequests = [];
      // for (let i in forkJoin) {
      //   forkJoinUrl[i] = this.pageService.startApiConfiguration(forkJoin[i], this.inputDataRecs);
      //   forkJoinRequests[i] = this._http.get(this.pageService.setMyUrlResource(parameter, forkJoinUrl[i], {}, null, this.inputDataRecs)).map((data) => data.json());
      // }
      // Observable.forkJoin(forkJoinRequests).subscribe((data) => {
      //   let forkJoinData = {};
      //   for (let i in data)
      //     forkJoinData[forkJoinUrl[i]['id'] || i] = data[i];
      //   let dataIndex = 0;
      //   for (let i in forkJoinData) {
      //     this.pageService.fillData(parameter, forkJoinData[i], this.inputDataRecs, forkJoinUrl[dataIndex], dataIndex, [], forkJoinData);
      //     dataIndex++;
      //   }
      //   parameter.lazyLoading = false;
      //   this._globalVars.setPageParameters(parameter, this.viewStructure.id);
      // });
    } else {

      this._utils
        .GetAll(this.pageService.setMyUrlResource(parameter, formatedUrl, {}, null, this._utils.arrToObj(this.columns)), formatedUrl.headers, formatedUrl, this._componentId)
        .subscribe((data) => {
          formatedUrl['_componentId'] = this._componentId;
          this._apiService.setApiHistory(formatedUrl, data);
          this._dealWithParamApi(parameter, data);
        }),
        (error) => {
          parameter.value = [];
        };

    }

  }
  private _dealWithParamApi(parameter: JsonParams, data: Object = null) {
    this._robot.evaluateParamValues(parameter, [data, this.inputDataRecs, this._apiService.getApiHistory()]);
    parameter.value = [];
    for (let r in this.rows.originalValue) {

      let pathToValueAsArray = typeof parameter.pathToValue == 'object';
      let condition = this._utils.replaceTagVars(pathToValueAsArray ? JSON.stringify(parameter.pathToValue) : parameter.pathToValue, this.rows.originalValue[r]);
      let myValue = this._utils.getValueFromDataForThisKey(parameter.valueList, pathToValueAsArray ? JSON.parse(condition) : condition);
      if (myValue) {
        parameter.value = parameter.value.concat(myValue);
        this.rows.originalValue[r][parameter.oid] = myValue;
        this.rows.value[r][parameter.oid] = this._utils.formatValues(parameter, myValue);
      }
    }
    parameter.lazyLoading = false;

    for (let eachColumn of this.columns)
      this._robot.changeParameterByDynamicProps(eachColumn, this._utils.arrToObj(this.columns));

    this._evaluateColumnUrl(true);
  }

  private _toggleRows(rowIndex) {
    let rowOpened = this.expandedRows.indexOf(rowIndex);
    if (rowOpened >= 0) {
      this.expandedRows.splice(rowOpened, 1);
      return;
    }
    this.expandedRows.push(rowIndex);
  }

  private _setConfigParameter() {

    this._tableConfig = this.pageService.createTableConfigObject(this.viewStructure);

    this.pageService.updateConfigParameterPaging(this._tableConfig, this.pagingSettings);
    this.pageService.updateConfigParameterSort(this._tableConfig, this.columns.find(obj => obj.sort == 'ASC' || obj.sort == 'DESC'));
    this._globalVars.setPageParameters(this._tableConfig, this._componentId);
  }

  private _formatFilterInterval() {

    let filterParam = this._globalVars.getPageParameter(this.filterDateField);
    if (!filterParam)
      filterParam = this._globalVars.getPageParametersAsArray().find(obj => obj.apiFieldName == this.filterDateField);

    if (!filterParam)
      return;

    this.filterIntervalFormat = filterParam.subType == 'dateTime' ? this._dateService.dateTimeFormatFriendly : this._dateService.dateFormatFriendly;
  }

}
