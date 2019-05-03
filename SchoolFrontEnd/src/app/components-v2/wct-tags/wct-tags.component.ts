import { Component, OnInit } from '@angular/core';

import { OutputTagsComponent } from 'foundations-webct-palette/components/tagsComponent/tags.component';
import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';

@Component({
  selector: 'app-wct-tags',
  templateUrl: './wct-tags.component.html',
  styleUrls: ['./wct-tags.component.css']
})
export class WctTagsComponent extends OutputTagsComponent {

  constructor(
    public robot: RobotEngineModel,
    public utils: Utils) {
    super(robot, utils);
  }

}
