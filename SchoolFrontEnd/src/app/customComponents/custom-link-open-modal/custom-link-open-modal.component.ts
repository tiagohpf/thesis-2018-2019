import { Component, Input, OnInit } from '@angular/core';
import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { NavigationService } from 'foundations-webct-robot/robot/services/navigation.service';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';

@Component({
  selector: 'custom-link-open-modal',
  templateUrl: 'custom-link-open-modal.component.html'
})

export class CustomLinkOpenModalComponent implements OnInit {

  @Input() public inputParameters: JsonParams;
  @Input() public inputParametersContext: JsonParams[];
  @Input() public dataRecs: Object[];

  public rowIndex = '';
  public componentReady = false;

  protected _componentId: string;
  protected _operation: JsonParams;

  constructor (
    private _utils: Utils,
    private _robot: RobotEngineModel,
    private _navigationService: NavigationService
  ) {
    this._componentId = 'CUSTOM-LINK-OPEN-MODAL-' + this._utils.guid(4, '');
  }

  public ngOnInit () {

    const rowIndexKeyObj = this._utils.findObjectInArray(this.inputParameters.parameters, 'rowIndexKeyInDataRecs').value;
    this.rowIndex = this.dataRecs[rowIndexKeyObj].toString();

    const operation = this._utils.findObjectInArray(this.inputParameters.parameters, 'operation').value;
    this._robot.loadPageParams(Object.assign({}, operation), this._componentId).then((rtn) => {
      this._operation = rtn;
      this.componentReady = true;
    });

  }

  public btClick (evt) {
    this._navigationService.dataRecs = this.dataRecs;
    this._navigationService.navigateByType(evt, this._operation);
  }
}
