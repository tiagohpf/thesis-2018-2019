import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';
import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { WctNotificationService } from "../../components-v2/wct-notification/wct-notification.service";
import { OperationsService } from 'foundations-webct-robot/robot/utils/operations.service';
import { ModalService } from 'foundations-webct-palette/components/modalComponent/modal.service';
import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';

@Component({
  selector: 'custom-table-operation',
  templateUrl: 'custom-table-operation.component.html'
})

export class CustomTableOperationComponent implements OnInit, OnDestroy {

  @Input() public inputParameters: JsonParams;
  @Input() public inputParametersContext: JsonParams[];
  @Input() public dataRecs: Object;
  @Input() public inputDataRecs: Object;

  public operation: JsonParams;
  private _componentId: string;

  constructor(
    private _pageService: PageService,
    private _utils: Utils,
    private _globalVars: GlobalVarsService,
    private _notificationService: WctNotificationService,
    private _operationsService: OperationsService,
    private _modalService: ModalService,
    private _robot: RobotEngineModel) {

    this._componentId = 'CUSTOM-TABLE-OPERATION-' + this._utils.guid(4, '');

  }

  public ngOnInit () {
    this.operation = this.inputParameters.groups.operations.parameters[0].parameters[0].clone();
    this._globalVars.setPageParameters(this.operation, this._componentId);

    if (!this._globalVars.getPageParameter('removedTranslation').value) this._globalVars.getPageParameter('removedTranslation').value = [];

    this._robot.changeParameterByDynamicProps(this.operation, this.dataRecs);
  }

  public ngOnDestroy() {
    this._globalVars.deletePageParameterById(this._componentId);
  }

  public click() {
    if (this.operation.type === 'updatePage') {
      let itemAllreadyRemoved = -1;
      itemAllreadyRemoved = this._globalVars.getPageParameter('removedTranslation').value.findIndex((itm) => {
        return itm['translationColumn'] === this.dataRecs['translationColumn'];
      });
      if (itemAllreadyRemoved < 0) this._globalVars.getPageParameter('removedTranslation').value.push(this.dataRecs);
      this._operationsService.updateSistemParameters(this.operation.parameters);
    }

    if (!this.operation.parameters || this._utils.findObjectInArray(this.operation.parameters, 'keepModal').value !== true) {
      this._modalService.closeModal();
    }
  }
}
