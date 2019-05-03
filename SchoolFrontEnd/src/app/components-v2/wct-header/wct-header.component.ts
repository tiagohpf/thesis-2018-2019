import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';

import { ModalService } from 'foundations-webct-palette/components/modalComponent/modal.service';
import { FilterService } from 'foundations-webct-robot/robot/services/filter.service';

@Component({
  selector: 'app-wct-header',
  templateUrl: './wct-header.component.html',
  styleUrls: ['./wct-header.component.css']
})
export class WctHeaderComponent {

  @Input() public viewStructure: JsonParams;
  @Input() public dataRecs;
  @Input() public inputParameters: JsonParams[];
  @Input() public allowReload: boolean = false;
  @Input() public sideFilterId: string;

  @Output() public reloadEmit = new EventEmitter();

  public refreshMe = false;

  constructor(
    private _utils: Utils,
    private _filter: FilterService,
    private _modalService: ModalService,
    private _robot: RobotEngineModel,
    private _router: Router) {
  }

  public reloadComponent() {
    this.refreshMe = true;
    this.reloadEmit.next(true);
  }

  public toggleFilter = () => this._filter.toggleFilterStatus(this.sideFilterId)

}
