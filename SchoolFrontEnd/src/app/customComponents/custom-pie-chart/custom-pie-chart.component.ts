import { Component, Input, OnInit, OnDestroy, ElementRef, DoCheck } from '@angular/core';
import { TdDigitsPipe } from '@covalent/core';

import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';
import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { DateService } from 'foundations-webct-robot/robot/services/date.service';
import { UtilsCustomService } from 'foundations-webct-robot/robot/utils/utils-webct-methods.service';

import { NgxChartsComponent } from 'foundations-webct-palette/components/chartsComponent/ngx-charts.component';

import * as d3 from 'd3';
import * as moment from 'moment/moment';

declare let FUXI: any;

@Component({
  selector: 'custom-pie-chart',
  templateUrl: 'custom-pie-chart.component.html'
})

export class CustomPieChartComponent extends NgxChartsComponent implements OnInit, OnDestroy, DoCheck {

  @Input() public inputParameters: JsonParams;
  @Input() public inputDataRecs: Object;
  @Input() public dataRecsNoContent: any = null;

  // Chart
  public single: any[];
  public multi: any[];
  public multiInverse: any[];

  public view: any[] = [350, 100];
  public showCharts = false;

  // options
  public showXAxis = true;
  public showYAxis = true;
  public gradient = false;
  public showLegend = false;
  public showXAxisLabel = true;
  public xAxisLabel = '';
  public showYAxisLabel = true;
  public yAxisLabel = '';
  public legendTitle = '';

  // pie
  public showLabels = false;
  public explodeSlices = false;
  public doughnut = false;

  public colorScheme: any = {
    domain: ['#000000', '#303030', '#484848', '#606060', '#787878', '#909090', '#A8A8A8', '#C0C0C0', '#D8D8D8', '#F0F0F0'],
  };

  protected _componentId: string;
  protected _chartContainer: HTMLElement;
  protected _chartContainerWidth = 0;

  constructor (
    public _robot: RobotEngineModel,
    public _dateService: DateService,
    public _pageService: PageService,
    public _utils: Utils,
    public _globalVars: GlobalVarsService,
    public _elRef: ElementRef,
    public _customUtils: UtilsCustomService
  ) {
    super(_robot, _dateService, _pageService, _utils, _globalVars, _elRef, _customUtils);
    this._componentId = 'CUSTOM-PIE-CHART-' + this._utils.guid(4, '');
  }

  public ngOnInit () {
    this._onInit();

    this._globalVars.getFilterById(this.inputParameters).subscribe((filters) => {
      if (filters[this.inputParameters.id]) {
        this._globalVars.setDynamiPropsHistory(this.inputParameters.id, '');
        this._globalVars.setDynamicPropsData({
          fallbacksAux: '',
          successesAux: ''
        });
        this.inputParameters.lazyLoading = true;
      }
    });
  }

  public ngOnDestroy () {
    this._globalVars.deletePageParametersByGroup(this._componentId);
  }

  public ngDoCheck() {

    const chartContainerWidth = this._chartContainer.getBoundingClientRect().width;
    if (chartContainerWidth !== this._chartContainerWidth && Math.abs(chartContainerWidth - this._chartContainerWidth) > 30) {
      this._chartContainerWidth = chartContainerWidth;
      this.changeChartView();
    }
  }

  public changeChartView() {
    this.showCharts = false;
    setTimeout(() => {
      this.showCharts = true;
      this._afterViewChecked();
    }, 100);
  }

  // ngx transform using covalent digits pipe
  public axisDigits(val: any): any {
    return new TdDigitsPipe().transform(isNaN(+val) ? +val : val);
  }

  public xAxisTickFormatting = (str) => {
    str = this._utils.convertToString(str);
    if (str.match(this._dateService.dateReg)) {
      return new Date(str).toDateString();
    }
    return str;
  }

  public formatDates = (row) => {

    const axisCfg: Object = {
      xAxisCfg: this._utils.findObjectInArray(this.inputParameters.groups.axis.parameters, 'xAxis', 'type'),
      yAxisCfg: this._utils.findObjectInArray(this.inputParameters.groups.axis.parameters, 'yAxis', 'type')
    }

    axisCfg['xAxisCfg'].key = axisCfg['xAxisCfg'].key || 'name';
    axisCfg['yAxisCfg'].key = axisCfg['yAxisCfg'].key || 'value';

    let rtnStr = '';

    Object.keys(axisCfg).forEach((axis) => {
      const axisValueFormat = this._utils.findObjectInArray(axisCfg[axis].parameters, 'dateFormat').value || this._utils.findObjectInArray(axisCfg[axis].parameters, 'valueFormat').value;

      if (!axisValueFormat) {
        rtnStr += '<p>' + row.data[axisCfg[axis].key] + '</p>';
      } else {
        switch (axisValueFormat) {

          case 'defaultDateString':
            rtnStr += '<p>' + new Date(+row.data[axisCfg[axis].key]).toDateString() + '</p>';
            break;

          case 'custom':
            const dateTemplate: string = this._utils.findObjectInArray(axisCfg[axis].parameters, 'dateTemplate').value || '';
            rtnStr += '<p>' + moment(+row.data[axisCfg[axis].key]).format(dateTemplate) + '</p>';
            break;

          default:
            const useCustomMethod = axisValueFormat.match(/^@[a-zA-Z0-9\-\_]*\(\)$/g);
            if (useCustomMethod) {
              const customMethod = axisValueFormat.match(/[a-zA-Z0-9\-\_]*/g)[1];
              const methodPath = '_customUtils.' + customMethod;
              const methodRtn = this._utils.callMethod(methodPath, this, row.data[axisCfg[axis].key]);

              rtnStr += methodRtn ? '<p>' + methodRtn + '</p>' : '<p>' + row.data[axisCfg[axis].key] + '</p>';
            } else {
              rtnStr += '<p>' + row.data[axisCfg[axis].key] + '</p>';
            }
        }
      }
    });
    return rtnStr;
  }

  public formatChartData(rows: any) {
    if (!rows) {return null};
    return rows.map((obj) => {
      obj.value = +obj.value || obj.value;
      return obj;
    });
  }

  protected _formatAxisNames(name: string, params: JsonParams[], d): string {

    if (!name) {
      return `(${d})`;
    }

    if (params.length <= 0) {
      return name;
    }

    const dateFormat = this._utils.findObjectInArray(params, 'dateFormat').value;

    switch (dateFormat) {

      case 'defaultDateString':
        return new Date(+name).toDateString();

      case 'custom':
        const dateTemplate: string = this._utils.findObjectInArray(params, 'dateTemplate').value || '';
        return moment(+name).format(dateTemplate);

      default:
        return name;
    }
  }

  protected _loadChartData(yAxis: JsonParams[], xAxis: JsonParams, chartData: Object[]): Object[] {

    let sourceData: Object[] = [];
    let series: Object[];

    const data: Object[] = [];

    for (const i in yAxis) {

      if (chartData && chartData[i] && Object.prototype.toString.call(chartData[i]) === '[object Array]') {
        sourceData = <Object[]>chartData[i];
      }
      else if (!sourceData || sourceData.length == 0) {
        sourceData = chartData;
      }
      if (sourceData && sourceData.length > 0) {
        series = [];
        for (let d in sourceData) {
          if (!sourceData[d][xAxis.id] || !sourceData[d][yAxis[i].id])
            continue;
          let obj = {
            name: this._formatAxisNames(sourceData[d][xAxis.id], xAxis.parameters, d),
            value: +sourceData[d][yAxis[i].id],
          };
          series.push(obj);
          this.single.push(obj);
        }
        this.formatChartData(series);
        data.push({
          id: yAxis[i].id,
          name: this._utils.i18n(yAxis[i].description) || `(${i})`,
          series: series
        });
      }
    }

    return data;

  }

  protected _loadChartDataInverted(yAxis: JsonParams[], xAxis: JsonParams, chartData: Object[]): Object[] {

    let sourceData: Object[] = [];
    let series: Object[];

    const data: Object[] = [];

    for (const d in chartData) {

      if (chartData[d] && Object.prototype.toString.call(chartData[d]) === '[object Array]') {
        sourceData = <Object[]>chartData[d];
      }
      else if (!sourceData || sourceData.length === 0) {
        sourceData = chartData;
      }

      if (sourceData && sourceData.length > 0) {
        series = [];
        for (let i in yAxis) {
          if (!sourceData[d][xAxis.id] || !sourceData[d][yAxis[i].id]) {
            continue;
          }
          let obj = {
            id: yAxis[i].id,
            name: this._utils.i18n(yAxis[i].description) || '',
            value: +sourceData[d][yAxis[i].id],
          };
          series.push(obj);
          // this.single.push(obj);
        }
        this.formatChartData(series);
        data.push({
          name: this._formatAxisNames(chartData[d][<string>xAxis.id], xAxis.parameters, d),
          series: series
        });
      }
    }
    return data;
  }

  protected _calcAnalyticsData(data: Object[] = []) {

    if (data.length === 0) {
      return;
    }

    const chartAnalytics = {};
    const chartTotalPoints = new Array();
    const chartTotalAnalytics: AnalyticsMetaData = {
      total: 0,
      max: undefined,
      min: undefined,
      maxPointer: [],
      minPointer: [],
      media: 0,
      range: []
    };

    const totalMaxMin: number[] = [];

    for (const group of data) {

      const groupPoints = group['series'];
      const groupPointsLength = groupPoints.length;
      const groupPointsAnalytics: AnalyticsMetaData = {
        total: 0,
        max: undefined,
        min: undefined,
        maxPointer: [],
        minPointer: [],
        media: 0,
        range: []
      };

      chartTotalPoints.push(groupPointsLength);

      for (const p in groupPoints) {

        // TOTAL
        chartTotalAnalytics.total += groupPoints[p].value;
        totalMaxMin[p] = totalMaxMin[p] === undefined ? groupPoints[p].value || 0 : totalMaxMin[p] + groupPoints[p].value;

        // CURRENT POINT
        groupPointsAnalytics.total += groupPoints[p].value;
        groupPointsAnalytics.max = groupPointsAnalytics.max === undefined ? groupPoints[p].value : Math.max(groupPoints[p].value, groupPointsAnalytics.max);
        groupPointsAnalytics.min = groupPointsAnalytics.min === undefined ? groupPoints[p].value : Math.min(groupPoints[p].value, groupPointsAnalytics.min);

      }

      if (totalMaxMin.length > 0) {
        chartTotalAnalytics.max = totalMaxMin.reduce((a, b) => Math.max(a, b));
        chartTotalAnalytics.min = totalMaxMin.reduce((a, b) => Math.min(a, b));
      }

      chartTotalAnalytics.media = chartTotalAnalytics.total / chartTotalPoints.reduce((a, b) => Math.max(a, b));
      groupPointsAnalytics.media = groupPointsAnalytics.total / chartTotalPoints.reduce((a, b) => Math.max(a, b));

      groupPointsAnalytics.maxPointer = groupPoints.filter(obj => obj.value == groupPointsAnalytics.max).map(obj => obj.name);
      groupPointsAnalytics.minPointer = groupPoints.filter(obj => obj.value == groupPointsAnalytics.min).map(obj => obj.name);

      groupPointsAnalytics.range = [groupPoints[0].name, groupPoints[groupPoints.length - 1].name];

      chartAnalytics[group['id']] = groupPointsAnalytics;

    }

    chartAnalytics['_total'] = chartTotalAnalytics;

    const chartAnalyticsParam = new JsonParams();
    chartAnalyticsParam.id = 'analyticsData::' + this.inputParameters.id;
    chartAnalyticsParam.value = JSON.stringify(chartAnalytics);

    this._globalVars.setPageParameters(chartAnalyticsParam, this._componentId).then(obj => {
      this._robot.updateDynamicPropsOnPageParameters();
    });
  }

  protected _afterViewChecked() {
    FUXI.Header.init(true);
    FUXI.Splitter.init(true);
    FUXI.FixedPositions.init(true);
    FUXI.ExpandableForm.init(true);
  }

  private _onInit () {
    this._getDataFromValueList();

    const chartData = this.inputParameters.groups.rows.originalValue;
    this._chartContainer = this._elRef.nativeElement.querySelector('.chart-container');
    this._chartContainerWidth = this._chartContainer.getBoundingClientRect().width;

    const xAxis = this._utils.findObjectInArray(this.inputParameters.groups.axis.parameters, 'xAxis', 'type');
    const yAxis = this.inputParameters.groups.axis.parameters.filter((obj) => {
      return obj.type === 'yAxis';
    });

    // this.single = [];
    this.single = chartData;
    this.multi = this._loadChartData(yAxis, xAxis, chartData);
    this.multiInverse = this._loadChartDataInverted(yAxis, xAxis, chartData);

    // this._calcAnalyticsData(this.multi);

    this.xAxisLabel = this._pageService.i18n(xAxis.text);
    this.showXAxisLabel = !!this.xAxisLabel;
    this.yAxisLabel = this._pageService.i18n(yAxis[0].text);
    this.showYAxisLabel = !!this.yAxisLabel;

    this.colorScheme.domain = this._utils.findObjectInArray(this.inputParameters.parameters, 'colorScheme').value || this.colorScheme.domain;
    this.barPadding = this._utils.findObjectInArray(this.inputParameters.parameters, 'barPadding').value || this.barPadding;
    this.showLegend = !!this._utils.findObjectInArray(this.inputParameters.parameters, 'showLegend').value;
    this.showLabels = !!this._utils.findObjectInArray(this.inputParameters.parameters, 'showLabels').value;

    this.doughnut = !!this._utils.findObjectInArray(this.inputParameters.parameters, 'doughnut').value;

    this.errorMsg = this._utils.findObjectInArray(this.inputParameters.parameters, 'errorMsg').value || null;
    this.noDataMsg = this._utils.findObjectInArray(this.inputParameters.parameters, 'noDataMsg').value || null;

    this.legendTitle = this._utils.findObjectInArray(this.inputParameters.parameters, 'legendTitle').value || '';

    this._robot.updateDynamicPropsOnPageParameters();

    this.showCharts = true;
  }

  private _getDataFromValueList () {
    this.inputParameters.groups.rows.originalValue = undefined;
    const errorMsg = 'Custom Pie chart Component - error!\nvalueList is neither a proper data array or a custom method.';
    if (!this.inputParameters.groups.rows.originalValue && this.inputParameters.valueList) {
      if (typeof this.inputParameters.valueList === 'string') {
        const tagStr: string = this.inputParameters.valueList;
        if (tagStr.indexOf('@fv()') >= 0) {
          const data = this._utils.replaceTagVars(this.inputParameters.valueList, this._globalVars.getPageParametersAsArray());
          try {
            this.inputParameters.groups.rows.originalValue = JSON.parse(data);
            this.inputParameters.groups.rows.value = JSON.parse(data);
          } catch (err) {
            console.error(errorMsg);
          }
        } else {
          console.error(errorMsg);
        }
      } else if (Array.isArray(this.inputParameters.valueList)) {
        this.inputParameters.groups.rows.originalValue = this.inputParameters.valueList;
        this.inputParameters.groups.rows.value = this.inputParameters.valueList;
      } else {
        console.error(errorMsg);
      }
    }
  }
}

interface AnalyticsMetaData {
  total: number;
  max: number;
  min: number;
  maxPointer: string[];
  minPointer: string[];
  media: number;
  range: string[];
}
