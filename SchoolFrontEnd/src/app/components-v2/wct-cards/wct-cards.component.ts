import { Component, OnInit, IterableDiffers, KeyValueDiffers } from '@angular/core';

import { CardComponent } from 'foundations-webct-palette/components/cardComponent/card.component';
import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';
import { ModalService } from 'foundations-webct-palette/components/modalComponent/modal.service';
import { ComponentsService } from 'foundations-webct-robot/robot/services/components.service';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { JsonGroups } from 'foundations-webct-robot/robot/classes/jsonGroups.class';

@Component({
  selector: 'app-wct-cards',
  templateUrl: './wct-cards.component.html',
  styleUrls: ['./wct-cards.component.css']
})
export class WctCardsComponent extends CardComponent {

  public selectable: boolean = false;
  public structArrAsObj: Object[];

  private _selectedCards = new Object();
  private _selectMultiple: boolean = false;

  constructor(
    public pageService: PageService,
    public robot: RobotEngineModel,
    public iterableDiffers: IterableDiffers,
    public keyValueDiffers: KeyValueDiffers,
    public utils: Utils,
    public globalVars: GlobalVarsService,
    public modalService: ModalService,
    private _components: ComponentsService) {
    super(pageService, robot, iterableDiffers, keyValueDiffers, utils, globalVars, modalService, pageService);
  }

  public ngOnInit() {

    this.selectable = this.inputParameters.subType == 'card-container-radio' || this.inputParameters.subType == 'card-container-checkBox';
    this._selectMultiple = this.selectable && this.inputParameters.subType == 'card-container-checkBox';

    this._updatePage();
    this._updateInitValue();

  }

  public getHtmlId = (param: JsonParams, type?: string) => this._components.getHtmlId(param, type);

  public isMyCardSelected = (i: number) => this._selectedCards[this.pagingSettings.currentPage] && this._selectedCards[this.pagingSettings.currentPage].indexOf(i) >= 0;
  public selectCard(i: number, value: Object) {

    if (!this.selectable) {

      if (this.inputParameters.navigateTo)
        this.utils.navigate(this.inputParameters.navigateTo, value);
      else {

        let openModal = this.utils.findObjectInArray(this.inputParameters.parameters, 'openModal');
        if (openModal.value) {
          this.modalService.openModal(openModal.value, null, value, new JsonParams(openModal.id));
          return;
        }
      }

      return;
    }

    let page = this.pagingSettings.currentPage;

    this._selectedCards[page] = this._selectedCards[page] || [];

    let findIndex = this._selectedCards[page].indexOf(i);
    if (findIndex < 0) {
      // Is not selected, must add

      this._addToValue(value);
      if (this._selectMultiple)
        this._selectedCards[page].push(i);
      else
        this._selectedCards[page] = [i];

    } else {
      // Is selected, must remove
      this._removeFromValue(value);
      this._selectedCards[page].splice(findIndex, 1);
    }

    this.robot.findDynamicPropsDependencies(this.inputParameters.id);
    this._components.updatePageParameters(this.inputParameters.parameters);

  }

  protected _updatePage() {

    if (this.dataRecsNoContent)
      return;

    if (this.utils.isObjectType(this.inputParameters.valueList, 'Array')) {
      this.dataRecsNoContent = null;
      this.valueArr = this.inputParameters.valueList;
    } else if (this.utils.isObjectType(this.inputParameters.valueList, 'Object')) {
      this.dataRecsNoContent = null;
      this.valueArr.push(this.inputParameters.valueList);
    }

    this.dataRecsNoContent = null;
    this.structArr = new Array();
    this.structArrAsObj = new Array();

    if (this.inputParameters.valueList && this.inputParameters.valueList.length > 0) {

      // console.log('--> ',this.valueArr);

      // ////////////////////////////////////////////////////////////
      for (let i in this.valueArr) {

        this.structArr[i] = new JsonParams();
        this.structArr[i].id = this.inputParameters.id + '-${' + this.pagingSettings.currentPage + '-' + i + '}';
        this.structArr[i].groups = new JsonGroups();
        this.structArr[i].groups.details = new JsonParams();
        this.structArr[i].groups.details.parameters = [];

        for (let param of this.inputParameters.groups.details.parameters)
          this.structArr[i].groups.details.parameters.push(param.clone('${' + this.pagingSettings.currentPage + '-' + i + '}'));

        this.robot.updatePageWithData(this.structArr[i], this.valueArr[i]);

        this.structArrAsObj[i] = this.utils.arrToObj(this.structArr[i].groups.details.parameters, 'value', true);
        if (this.inputParameters.id)
          this.structArrAsObj[i][this.inputParameters.id] = this.valueArr[i];
      }

      this.robot.updateDynamicPropsOnPageParameters();

      // ///////////////////////////////////////////////////////////////
    } else if (this.inputParameters.pathToValueList === undefined) {
      // this.robot.updatePageWithData(null, null);
      this.structArr.push(this.inputParameters);
    }

    // if (this.valueArr || Object.keys(this.valueArr).length > 0) {
    //   for (let i in this.valueArr) {
    //     this.valueRows['originalValue'][i] = {};
    //     this.valueRows['value'][i] = {};
    //     for (let p in this.inputParameters.groups.details.parameters) {
    //       let currParam = this.inputParameters.groups.details.parameters[p];
    //       this.valueRows['originalValue'][i][
    //         currParam.id
    //       ] = currParam.pathToValue
    //           ? this.utils.getValueFromDataForThisKey(
    //             this.valueArr[i],
    //             currParam.pathToValue
    //           )
    //           : currParam.originalValue;
    //       this.valueRows['value'][i][currParam.id] = this.utils.formatValues(
    //         currParam,
    //         this.valueRows['originalValue'][i][currParam.id]
    //       );
    //     }
    //   }
    // }

    // this.evaluateCardData();
  }

  private _updateInitValue() {

    if (!this.selectable)
      return;

    if (!this.inputParameters.value)
      this.inputParameters.value = this._selectMultiple ? new Array() : new Object();
    else {

      let initValue = this.utils.cloneJsonParse(this.inputParameters.value);
      initValue = this.utils.isObjectType(initValue, 'Array') ? initValue : [initValue];
      this.inputParameters.value = null;

      for (let value of <Object[]>initValue) {
        let pos = this.structArrAsObj.findIndex(obj => JSON.stringify(obj[this.inputParameters.id]) == JSON.stringify(value));
        this.selectCard(pos, value);
      }

    }

  }

  private _addToValue(value: object): void {
    if (this._selectMultiple) {
      this.inputParameters.value = this.inputParameters.value || [];
      this.inputParameters.value.push(value);
    } else
      this.inputParameters.value = value;
  }

  private _removeFromValue(value: Object): void {
    if (this._selectMultiple) {
      let position = this.inputParameters.value.findIndex(obj => JSON.stringify(obj) == JSON.stringify(value));
      this.inputParameters.value.splice(position, 1);
    } else
      this.inputParameters.value = new Object();
  }

}
