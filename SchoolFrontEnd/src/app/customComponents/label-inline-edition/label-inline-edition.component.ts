import { Input, Component, OnInit, OnChanges, SimpleChange, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';

import { InputService } from 'foundations-webct-robot/robot/services/input.service';
import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { ToggleElementsService } from 'foundations-webct-robot/robot/services/toggle-elements.service';
import { ComponentsService } from 'foundations-webct-robot/robot/services/components.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'custom-label-inline-edition',
  templateUrl: './label-inline-edition.component.html',
  styleUrls: ['./label-inline-edition.component.css']
})
export class CustomLabelInlineEdition implements OnInit {
  @Input() public inputParameters: JsonParams;
  @Input() public inputDetails: JsonParams[];
  @Input() public viewStructure: any;
  @Input() public inputValue;
  @Input() public dataRecs;
  @Input() public dataRecsFormated;
  @Input() public textboxAlign: boolean = false;
  @Input() public tableDisplay: boolean = false;
  @Input() public rowIndex: number = 0;
  @Input() public updateParamWithVal: boolean = true;
  @Input() public showTitle: boolean = false;

  @Input() public formModel: FormGroup;

  @ViewChild('openQuickView') openQuickView: ElementRef;
  @ViewChild('quickviewPopupPositionSimulator') quickviewPopupPositionSimulator: ElementRef;

  public myValue: any;
  public myTitle: string = '';
  public componentId: string;
  public componentQuickViewId: string;
  public componentQuickViewOnRight: boolean = false;
  public componentQuickViewOnTop: boolean = false;

  private _noValueChar: string = '';
  private _componentId: string;
  private _subscription: any;
  public _editionMode: boolean;

  constructor(
    private _http: HttpClient,
    private _robot: RobotEngineModel,
    private _utils: Utils,
    private _globalVars: GlobalVarsService,
    private _pageService: PageService,
    private _toggle: ToggleElementsService,
    private _router: Router,
    private _inputService: InputService) {

    this._componentId = 'LABEL-' + this._utils.guid(4, '');

  }

  public clearHtml = (str: string) => str ? str.toString().replace(this._utils.htmlTagsReg, '').replace(/&nbsp;/g, '').replace(this._utils.mustacheReg, '') : '';

  public ngOnInit() {

    console.log('inputParameters -----> ', this.inputParameters.parameters[0].value);

    this._editionMode = false;

    if (!this.formModel) {
      this.formModel = new FormGroup({});
    }
    if (this.inputParameters.value == null) {
      this.formModel.markAsTouched();
    }

    if (this.inputParameters && this.inputParameters.id) {
      this._subscription = this.inputParameters.observe().subscribe(obj => {
        this._startComponent();
      });
    }
    this._startComponent();
  }

  public ngOnDestroy() {
    this._globalVars.deletePageParametersByGroup(this._componentId);
    if (this._subscription)
      this._subscription.unsubscribe();
  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    if (changes['inputValue'])
      this._startComponent();
  }

  public printValue = () => this.myValue || this.inputParameters.value || this._noValueChar;

  private _startComponent() {
    if (!this.inputParameters) {
      this.inputParameters = new JsonParams();
      this.inputParameters.value = this.inputValue;
      return;
    }

    let suffix: string;
    if (this.tableDisplay) {

      this.myValue = this._utils.formatValues(this.inputParameters, this._pageService.i18n(this.inputValue), true);
      this.myValue = this._inputService.formatMyValue(this.myValue, this.inputParameters, false, this.dataRecs, this._globalVars.getPageParametersAsArray());

      if (this.showTitle)
        this._evaluateTitle(this.myValue);

      suffix = '${1-' + this.rowIndex + '}';
      let tableParam = new JsonParams();
      tableParam.id = this.inputParameters.id + '${1-' + this.rowIndex + '}';
      tableParam.value = this.inputValue;

      this._globalVars.setPageParameters(tableParam, this._componentId);

    } else {

      this.myValue = this.inputValue || this._utils.formatValues(this.inputParameters, this.inputParameters.value, true);
      this.myValue = this._findValueInValueList(this.myValue);
      this.myValue = this._utils.replaceTagVars(this._pageService.i18n(this.myValue), this.dataRecs);

      // ------ TODO: Linha necesária para quando tag do i18n depende da API, e valor no i18n dessa tag, depende também da API
      this.myValue = this._utils.replaceTagVars(this._pageService.i18n(this.myValue), this.dataRecs);
      // ------

      this.myValue = this._inputService.formatMyValue(this.myValue, this.inputParameters, null, this.dataRecs, this._globalVars.getPageParametersAsArray());

      this._evaluateTitle(this.inputParameters.title);

      if (this.updateParamWithVal) {
        this.inputParameters.value = this.myValue;
        this.myValue = undefined;
      }

    }

    if (this.myValue)
      this.myValue = this._formatValue(this.myValue);
    else
      this.inputParameters.value = this._formatValue(this.inputParameters.value);

    this._robot.findDynamicPropsDependencies(this.inputParameters.id, this.dataRecs, suffix);

  }

  private _findValueInValueList(text: any): any {
    for (let i in this.inputParameters.valueList) {
      if (!this.inputParameters.valueList[i][text])
        continue;
      return this.inputParameters.valueList[i][text];
    }
    
    return text;
  }

  private _evaluateTitle(title: string) {
    if (!title) return;
    this.myTitle = this.clearHtml(this._utils.replaceTagVars(title, this.dataRecs));
  }

  private _formatValue(value: any) {

    if (!value)
      return value;

    let maskConfig = this._utils.findObjectInArray(this.inputParameters.parameters, 'mask');
    if (maskConfig.key && maskConfig.value) {
      let maskChar = maskConfig.text || '*';
      let initMaskIndex = +(this._utils.convertToString(maskConfig.value[0], ['number']) || 0);
      let endMaxkIndex = +(this._utils.convertToString(maskConfig.value[1], ['number']) || value.length);
      endMaxkIndex = endMaxkIndex + 1 <= value.length ? endMaxkIndex + 1 : value.length;
      if (maskConfig.value.length > endMaxkIndex)
        value = value.substring(0, initMaskIndex) + Array((endMaxkIndex - initMaskIndex) + 1).join(maskChar) + value.substring(endMaxkIndex);
    }

    // TODO: Validar codições de conversão de valores
    let convertConfig = this._utils.findObjectInArray(this.inputParameters.parameters, 'convert');
    if (convertConfig.key) {
      let unit: string;
      if (convertConfig.pathToValue)
        unit = this._utils.getValueFromDataForThisKey(this.dataRecsFormated || this._utils.arrToObj(this._globalVars.getPageParametersAsArray()), convertConfig.pathToValue);
      else
        unit = convertConfig.value;

      if (unit) {
        if (unit.toLowerCase() == 'volume' || unit.toLowerCase() == 'bytes')
          value = !isNaN(+value) ? this._bytesToSize(+value) : value;
        else if (unit.toLowerCase() == 'time' || unit.toLowerCase() == 'seconds')
          value = !isNaN(+value) ? this._secondsToHours(+value) : value;
        else
          value += ' ' + unit;
      }

    }
    return this._utils.replaceTagVars(value, this.dataRecs);
  }

  private _bytesToSize(bytes: number) {

    // console.warn('WARNING: The option "convert" in OutputLabelComponent is deprecated. Use custom methods instead - @bytesToSize(bytes: number).');

    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0)
      return '0 Bytes';
    let i = Math.floor(Math.log(bytes) / Math.log(1000));
    return Math.round(bytes / Math.pow(1000, i)) + ' ' + sizes[i];
  }

  private _secondsToHours(seconds: number) {

    // console.warn('WARNING: The option "convert" in OutputLabelComponent is deprecated. Use custom methods instead - @secondsToHours(seconds: number).');

    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor(seconds % 3600 / 60);
    var seconds = Math.floor(seconds % 3600 % 60);
    return ((hours > 0 ? hours + "h:" + (minutes < 10 ? "0" : "") : "") + minutes + "m:" + (seconds < 10 ? "0" : "") + seconds + "s");
  }

  private toogleEditionMode(_editionMode: boolean) {
    this._editionMode = !_editionMode;
    return _editionMode;
  }
  // POST -> this._http.post(endpoint, body, { headers: headers, observe: 'response' })

  public setValue(val: boolean) {

    if (val) {
      this.formModel.markAsTouched();
      this.formModel.markAsDirty();
      this.formModel.updateValueAndValidity();
    } else {
      this.formModel.markAsUntouched();
      this.formModel.markAsPristine();
      this.formModel.updateValueAndValidity();
    }
  }

  private onSave(data: any) {

    //Save data

    //this._http.post("endpoint", body, { headers: headers, observe: 'response' })




    console.log('data -----> ', data);
  }
}