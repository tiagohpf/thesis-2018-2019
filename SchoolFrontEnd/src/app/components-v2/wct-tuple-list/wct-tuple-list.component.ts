import { Component, Input, OnInit, OnDestroy, DoCheck } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';

import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';


@Component({
  selector: 'app-wct-tuple-list',
  templateUrl: './wct-tuple-list.component.html',
  styleUrls: ['./wct-tuple-list.component.scss']
})
export class WctTupleListComponent implements OnInit {

  @Input() public propsContext: JsonParams[];
  @Input() public props: JsonParams;
  @Input() public allowCreation: boolean = true;
  @Input() public control: FormControl;

  public tupleInfoForm: FormGroup[] = [];
  public tupleIsDirty: boolean = false;

  public valueControl: string = null;
  public valueHtmlFormat: Object[] = null;

  public list: any[] = [];
  public listValues: any[] = [];
  // public fields: any[] = [];

  private _componentId: string;

  constructor(
    private _robot: RobotEngineModel,
    private _utils: Utils,
    private _globalVars: GlobalVarsService,
    private _fb: FormBuilder,
    private _pageService: PageService) {
    this._componentId = 'TUPLELIST-' + this._utils.guid(4, '');
  }

  public ngOnInit() {

    if (!this.control)
      this.control = new FormControl();

    if (!this.props.readonly) {

      let evaluateValidators = this._pageService.configValidatorsEachParam(this.props, {});
      this.control.setValidators(Validators.compose([evaluateValidators[this.props.id][1], this._validateMyTuples()]));

      this.props.value = this.props.value || new Array();

      if (this.props.groups.details.parameters) {
        // this.props.valueList = this._utils.isObjectType(this.props.valueList, 'Array') ? this.props.valueList : [this.props.valueList];
        if (this.props.valueList && this.props.valueList.length > 0) {
          this.props.valueList = this._utils.isObjectType(this.props.valueList, 'Array') ? this.props.valueList : [this.props.valueList];
          // this.props.valueList.reverse();

          for (let i in this.props.valueList)
            this.addNewLine(false, this._utils.cloneJsonParse(this.props.valueList[i]));

          this._loadPropsValue();
        } else {
          this.props.min = this.props.min !== undefined ? this.props.min : 1;
          for (let i = 1; i <= this.props.min; i++)
            this.addNewLine(false);
        }
      }
    } else {
      this.props.valueList = this._utils.isObjectType(this.props.valueList, 'Array') ? this.props.valueList : [this.props.valueList];
      this.valueHtmlFormat = this.props.valueList;
    }
  }

  public ngOnDestroy() {
    this._globalVars.deletePageParametersByGroup(this._componentId);
  }

  public ngDoCheck() {
    for (let i in this.list) {
      for (let ii in this.list[i]) {
        let data = this.list[i].concat(this.propsContext);
        this._robot.changeParameterByDynamicProps(this.list[i][ii], this._utils.arrToObj(data, 'value', true));
      }
    }
    if (!this.props.readonly)
      this._loadPropsValue();
  }

  public addNewLine(loadProps: boolean = true, initValues = null) {
    let pushParams: JsonParams[] = [];
    let arrayPromises: Promise<JsonParams>[] = [];
    for (let i in this.props.groups.details.parameters) {
      let param = this.props.groups.details.parameters[i];
      if (param instanceof JsonParams)
        pushParams.push(param.clone('${0-' + this.list.length + '}'));
      else
        arrayPromises.push(this._robot.loadPageParams(Object.assign({}, param), this._componentId));
    }

    if (arrayPromises.length > 0) {
      Promise.all(arrayPromises).then(res => {
        pushParams = res;
        this._addNewLine(pushParams, loadProps, initValues);
      });
    } else
      this._addNewLine(pushParams, loadProps, initValues);

    this._robot.findDynamicPropsDependencies(this.props.id);

  }
  public removeLine(l) {
    this.tupleIsDirty = true;
    this.list.splice(l, 1);
    this.listValues.splice(l, 1);
    this.tupleInfoForm.splice(l, 1);
    this.props.value.splice(l, 1);

    // if (this.list.length == 0)
    //   this.addNewLine(false);

    this._robot.findDynamicPropsDependencies(this.props.id);
    this._loadPropsValue();
  }
  public loadTupleName(id: string) {
    let tuple = this.props.groups.details.parameters.find(obj => obj.id == id);
    return tuple ? tuple.text : id;
  }

  private _addNewLine(pushParams: JsonParams[], loadProps: boolean = true, initValues = null) {

    // if (initValues)
    //   for (let i in pushParams)
    //     pushParams[i].value = this._utils.getValueFromDataForThisKey(initValues, pushParams[i].pathToValue);

    this.list.splice(0, 0, pushParams);
    this.listValues.splice(0, 0, initValues);
    this.tupleInfoForm.splice(0, 0, this._fb.group({}));
    if (loadProps) {
      this.tupleIsDirty = true;
      this._loadPropsValue();
    }

  }

  private _loadPropsValue() {
    let tempVal: any = this.allowCreation ? [] : {};
    let tempObj = {};
    for (let l in this.list) {
      tempObj = this._utils.arrToObj(this.list[l], 'value', true);

      for (let o in tempObj)
        if (this._utils.findObjectInArray(this.list[l], o, 'id').hidden)
          delete tempObj[o];

      if (this.allowCreation)
        tempVal.splice(0, 0, tempObj);
      else
        tempVal = tempObj;
    }


    let temp_props_value = JSON.stringify(this.props.value);
    this.props.value = this._utils.cloneObject(tempVal);

    if (temp_props_value != JSON.stringify(tempVal))
      this._robot.findDynamicPropsDependencies(this.props.id);

    this.valueControl = this.props.value ? '*'.repeat(this.tupleInfoForm.filter(obj => obj.valid).length) : null;

    this.valueHtmlFormat = this.allowCreation ? this.props.value : [this.props.value];

    if (this.tupleIsDirty) {
      this.control.markAsTouched();
      this.control.markAsDirty();
      this.control.updateValueAndValidity();
    }

  }

  private _validateMyTuples() {
    return (control: AbstractControl): { [key: string]: any } => {
      return !!this.tupleInfoForm.find((obj) => { return obj.status == 'INVALID'; }) ? { [this.props.id]: true } : null;
    };
  }

}
