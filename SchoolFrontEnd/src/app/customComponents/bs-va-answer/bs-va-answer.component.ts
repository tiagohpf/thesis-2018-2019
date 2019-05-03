import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { JsonGroups } from 'foundations-webct-robot/robot/classes/jsonGroups.class';
import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { HttpClient } from '@angular/common/http';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';

@Component({
  selector: 'app-bs-va-answer',
  templateUrl: './bs-va-answer.component.html',
  styleUrls: ['./bs-va-answer.component.scss']
})
export class BsVaAnswerComponent implements OnInit, OnDestroy {

  @Input() public inputParameters: JsonParams;

  public selectedCard: number;

  public palleteView: string = 'options';
  public answerValue: Object = new Object();
  public palette: any = [];
  public responses: any[] = new Array();

  private _canUpdateValue: boolean = false;
  private _componentId: string;

  constructor(
    private _robot: RobotEngineModel,
    private _globalVars: GlobalVarsService,
    private _utils: Utils,
    private _http: HttpClient) {
    this._componentId = this._utils.guid(4, '');
  }

  ngOnInit() {

    this._loadResponseTypes().then(data => {
      if (this.inputParameters.value && this.inputParameters.value.length > 0) {
        this._initValue().then(data => this._finishLoading());
        return;
      }
      this._finishLoading();

    });
    this.answerValue['options'] = this._utils.i18n("generic___designerFlow___options");
    this.answerValue['actions'] = this._utils.i18n("generic___designerFlow___actions");
  }

  public ngOnDestroy() {
    this._globalVars.deletePageParametersByGroup(this._componentId);
  }

  public ngDoCheck() {
    this._updateValue();
  }

  public addResponse(): Promise<any> {

    return new Promise((resolve, reject) => {

      this.responses.unshift(new Array());
      this.selectedCard = 0;

      if (!this.palette || !this.palette.default)
        return resolve(true);

      let promises = new Array();
      for (let component of this.palette.default)
        promises.push(this.appendComponent(component, undefined, true));

      Promise.all(promises).then(data => resolve(true));
    });

  }

  public appendComponent(component: any, card?: string, def?: boolean): Promise<any> {

    return new Promise((resolve, reject) => {

      let loadPageParams = (component: any, card?: string) => {
        this._robot.loadPageParams(component, this._componentId).then(data => {

          if (def)
            data.data = { default: true };

          if (data.type == 'wrapper' && !data.value)
            data.value = new Object();

          let pushComponent = () => {
            let selCard = card !== undefined ? card : this.selectedCard;
            this.responses[selCard] = this.responses[selCard] || new Array();
            let currentResponse = this.responses[selCard];

            let clone = this._utils.uniqIdRegex.test(data.id) ? data : data.clone('${' + this.responses.length + '-' + (currentResponse.length + 1) + '}');
            currentResponse.push(clone);

            this._saveParameter(clone);
            resolve(data);
          }

          if (this.responses.length == 0) {
            this.addResponse().then(data => pushComponent());
            return;
          }

          pushComponent();

        });
      }

      if (component && component.include) {
        this._http.get(this._utils.getJson(component.include))
          .subscribe(
            data => loadPageParams(data, card),
            error => reject(error));
      } else
        loadPageParams(component, card);


    });

  }
  public removeComponent = (responseIndex: number, componentIndex: number) => this.responses[responseIndex].splice(componentIndex, 1);

  public drop(event) {
    console.log('event ---> ', event);
  }

  private _loadResponseTypes() {

    return new Promise((resolve, reject) => {

      this._http.get(this._utils.getJson('designFlow/shape-process-palette'))
        .subscribe(
          data => {
            this.palette = data;
            resolve(data);
          },
          error => reject(error));

    });

  }

  public _initValue(): Promise<boolean> {

    return new Promise((resolve, reject) => {

      let initValue = this._utils.cloneJsonParse(this.inputParameters.value);
      let promises = new Array();
      for (let i in initValue) {
        this.responses[i] = new Array();
        for (let component of initValue[i])
          promises.push(this.appendComponent(component, i));
      }

      Promise.all(promises).then(data => resolve(true));
    });

  }

  public _updateValue() {

    if (!this._canUpdateValue)
      return;

    this.inputParameters.value = new Array();
    for (let i in this.responses) {



      this.inputParameters.value[i] = new Array();
      for (let param of this.responses[i]) {

        this._cloneParamRecursive(param, this.inputParameters.value[i]);

        // param.originalValue = undefined;
        // let response = this.inputParameters.value[i];
        // response.push(this._jsonParamsToJson(param));

        // // Procura componentes que tenham "details" (ex: wrapper)
        // if (param.groups.details && param.groups.details.parameters) {
        //   for (let d in param.groups.details.parameters) {
        //     param.groups.details.parameters[d].originalValue = undefined;
        //     response[response.length - 1].details[d] = this._jsonParamsToJson(param.groups.details.parameters[d]);
        //   }
        // }

        // if (param.parameters) {
        //   for (let p in param.parameters) {
        //     param.parameters[p].originalValue = undefined;
        //     response[response.length - 1].parameters[p] = this._jsonParamsToJson(param.parameters[p]);
        //   }
        // }

      }
    }

  }

  private _cloneParamRecursive(param: JsonParams, response: any, pos?: number) {

    param.originalValue = undefined;

    if (pos === undefined)
      response.push(this._jsonParamsToJson(param));
    else
      response[pos] = this._jsonParamsToJson(param);

    // Procura componentes que tenham "details" (ex: wrapper)
    if (param.groups.details && param.groups.details.parameters) {
      for (let d in param.groups.details.parameters) {
        // param.groups.details.parameters[d].originalValue = undefined;
        // response[response.length - 1].details[d] = this._jsonParamsToJson(param.groups.details.parameters[d]);

        if (!response[response.length - 1].details)
          continue;

        this._cloneParamRecursive(param.groups.details.parameters[d], response[response.length - 1].details, +d);

      }
    }

    if (param.parameters) {
      for (let p in param.parameters) {

        if (!response[response.length - 1].parameters)
          continue;

        this._cloneParamRecursive(param.parameters[p], response[response.length - 1].parameters, +p);

        // param.parameters[p].originalValue = undefined;
        // response[response.length - 1].parameters[p] = this._jsonParamsToJson(param.parameters[p]);
      }
    }

  }

  private _jsonParamsToJson = (param: JsonParams): any => {

    let template: any = this._utils.cloneJsonParse(param.mockJson);
    template.id = param.id;
    template.value = param.value;

    if (param.dynamicProps) {
      for (let i in param.dynamicProps)
        template[i] = param[i];
    }

    // if (param.groups.details && param.groups.details.parameters)
    //   for (let detailParam of param.groups.details.parameters)
    //     this._jsonParamsToJson(detailParam);

    return template;
  };

  private _finishLoading() {
    this.selectedCard = 0;
    this._canUpdateValue = true;
    this._robot.updateDynamicPropsOnPageParameters();
  }

  private _saveParameter(param: JsonParams) {

    this._globalVars.deletePageParameterById(param.id.replace(this._utils.uniqIdRegex, ''));
    this._globalVars.setPageParameters(param, this._componentId);

    let params = param.parameters ? param.parameters.filter(obj => obj.key == 'chatAnswer' || obj.key == 'chatAction') : new Array();
    for (let chatAnswer of params)
      this._saveParameter(chatAnswer);

    if (param.groups.details && param.groups.details.parameters)
      for (let detailParam of param.groups.details.parameters)
        this._saveParameter(detailParam);
  }

}
