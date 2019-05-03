import { Component, Input, OnInit } from '@angular/core';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { ComponentsService } from 'foundations-webct-robot/robot/services/components.service';




@Component({
  selector: 'app-custom-side-menu',
  templateUrl: './custom-side-menu.component.html',
  styleUrls: ['./custom-side-menu.component.css']
})
export class CustomSideMenuComponent {

  @Input() public dataRecs;
  @Input() public inputParameters: JsonParams;

  public navigate = (contexto: any) => this._utils.navigate(this.inputParameters.navigateTo, contexto);
  public navigateStudentsList = (contexto: any) => this._utils.navigate("students", contexto);

  constructor(private _utils: Utils) {
  }
  ngOnInit() {

  }
}
