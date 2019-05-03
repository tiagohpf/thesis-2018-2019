import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';

import { ComponentsService } from 'foundations-webct-robot/robot/services/components.service';

import { OutputLabelComponent } from 'foundations-webct-palette/components/labelComponent/label.component'
import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';
import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { ToggleElementsService } from 'foundations-webct-robot/robot/services/toggle-elements.service';
import { InputService } from 'foundations-webct-robot/robot/services/input.service';


@Component({
  selector: 'app-wct-label',
  templateUrl: './wct-label.component.html',
  styleUrls: ['./wct-label.component.css']
})
export class WctLabelComponent extends OutputLabelComponent {

  @Input() public inputParameters: JsonParams;
  @Input() public rowIndex: number = null;

  constructor(
    public _components: ComponentsService,

    // Label v1 dependencies
    public robot: RobotEngineModel,
    public utils: Utils,
    public globalVars: GlobalVarsService,
    public pageService: PageService,
    public toggle: ToggleElementsService,
    public router: Router,
    public inputService: InputService) {
    super(robot, utils, globalVars, pageService, toggle, router, inputService);
  }

  public getHtmlId = () => this._components.getHtmlId(this.inputParameters, 'label') + (this.rowIndex !== null ? '-' + this.rowIndex : '');

}
