import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';

import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { OperationsService } from 'foundations-webct-robot/robot/utils/operations.service';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';
import { NavigationService } from 'foundations-webct-robot/robot/services/navigation.service';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';

import { ModalService } from 'foundations-webct-palette/components/modalComponent/modal.service';
import { ToggleElementsService } from 'foundations-webct-robot/robot/services/toggle-elements.service';

@Component({
  selector: 'app-wct-buttons',
  templateUrl: './wct-buttons.component.html',
  styleUrls: ['./wct-buttons.component.css']
})

export class WctButtonsComponent implements OnInit, OnDestroy {

  @Input() public inputParameters: JsonParams;
  @Input() public inputParametersContext: JsonParams[];
  @Input() public operations: JsonParams;
  @Input() public dataRecs: Object[];

  @Input() public btnSize: string = ''; // btn-xs, btn-sm, btn-lg
  @Input() public btnMax: number = 1;
  @Input() public btnPrimary: boolean = true;
  @Input() public openDirection: string = 'left';
  @Input() public disabled: boolean = false;

  @Input() public tableOperations: boolean = false;
  @Input() public cardOperations: boolean = false;

  @Input() public loadingFromModal: boolean = false;

  @Input() public operationIndex: Object = null;
  @Input() public componentIndex: number = 0;

  public operationsBlock: JsonParams[] = [];
  public tableOperationsBlock: JsonParams[] = [];

  private _componentId: string;
  private _controlers: any = {};

  constructor(
    private _utils: Utils,
    private _globalVars: GlobalVarsService,
    private _navigation: NavigationService,
    private _toggle: ToggleElementsService,
    private _operations: OperationsService,
    private _modalService: ModalService,
    private _pageService: PageService,
    private _robot: RobotEngineModel,
    private _router: Router) {

    this._componentId = 'OPERATIONS-' + this._utils.guid(4, '');

    this._findControlers();
  }

  public getButtonDropdownStatus = (button: JsonParams) => this._toggle.getSubMenuStatus(button);
  public toggleButtonDropdown = (button: JsonParams) => this._toggle.toggleSubMenuStatus(button);

  public ngOnInit() {
    this.componentIndex = this.componentIndex >= 0 ? this.componentIndex : 0;
    this._evaluateOperationsInit();
  }

  public ngOnDestroy() {
    this._globalVars.deletePageParametersByGroup(this._componentId);
  }

  public disabledSubmitBtn(param: JsonParams): boolean {

    if (param.mappingId) {

      param.mappingId = <string[]>(this._utils.isObjectType(param.mappingId, 'Array') ? param.mappingId : [param.mappingId]);
      for (let str of param.mappingId) {
        if (this._controlers[str] !== undefined)
          continue;

        this._findControlers();
        break;
      }

      return this._navigation.btnStatusByMappingId(param, this._controlers);
    }

    if (param.type != 'submit' || !this._pageService['wizardFormSteps' + (this.loadingFromModal ? 'Modal' : '')][this.componentIndex])
      return false;
    return !this._pageService['wizardFormSteps' + (this.loadingFromModal ? 'Modal' : '')][this.componentIndex].valid;
  }

  public buttonClick(e, operation: JsonParams) {

    if (this.disabled || operation.disabled) return;

    this._navigation.dataRecs = this.dataRecs;
    this._navigation.dataRecsContext = this.inputParametersContext;

    this._navigation.navigateByType(e, operation, this._componentId);

  }

  public visibleOperations = (operationsGroup: JsonParams): JsonParams[] => operationsGroup.parameters.filter(obj => !obj.hidden);

  private _findControlers() {
    this._pageService['wizardFormSteps' + (this.loadingFromModal ? 'Modal' : '')].forEach(form => {
      for (let i in form.controls)
        this._controlers[i] = form.controls[i];
    });
  }

  private _evaluateOperationsInit() {

    if (this.tableOperations) {
      let operationsBlockTemp: JsonParams[] = [];

      // TODO: Reforçar esta validação com alguma indicação dada no robot, na altura da criação destes Objectos
      if ('_id' in this.operations)
        operationsBlockTemp.push(this.operationIndex ? this.operations.clone('${' + this.operationIndex['page'] + '-' + this.operationIndex['row'] + '}') : this.operations.clone());
      else {
        for (let param of (<JsonParams>this.operations).parameters)
          operationsBlockTemp.push(this.operationIndex ? param.clone('${' + this.operationIndex['page'] + '-' + this.operationIndex['row'] + '}') : param.clone());
      }
      this._evaluateTableOperations(operationsBlockTemp);

    } else
      this.operationsBlock = '_id' in this.operations ? [this.operations] : (<JsonParams>this.operations).parameters;

    for (let operationsGroup of this.operationsBlock) {
      operationsGroup.size = operationsGroup.size !== undefined ? operationsGroup.size : this.btnMax;
      operationsGroup.parameters.forEach((param) => {
        this._globalVars.setPageParameters(param, this._componentId);
      });
    }

  }

  private _evaluateTableOperations(operationsBlockTemp: JsonParams[]): void {

    let directTableOperations: JsonParams[] = operationsBlockTemp.filter(obj => obj.type === undefined);
    let rowActionsGroup: JsonParams;

    if (directTableOperations.length == 0) {

      rowActionsGroup = this.inputParameters.clone();
      rowActionsGroup.parameters = operationsBlockTemp;

      this.operationsBlock = [rowActionsGroup];

    } else
      this.operationsBlock = operationsBlockTemp;

    const tableDataRecs = {}
    for (let entry in this.dataRecs) {
      // Caso não exista valor, deve passar null (ou !undefined), de forma a não procurar o valor na coluna
      tableDataRecs[entry + '${' + this.operationIndex['page'] + '-' + this.operationIndex['row'] + '}'] = this.dataRecs[entry] || null;
    }

    this._globalVars.setDynamicPropsData(tableDataRecs);

    for (let block of this.operationsBlock) {
      this._robot.changeParameterByDynamicProps(block, tableDataRecs);
      for (let param of block.parameters)
        this._robot.changeParameterByDynamicProps(param, tableDataRecs);
    }

  }

}
