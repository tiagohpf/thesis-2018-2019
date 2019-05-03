import { Component, OnInit, Input } from '@angular/core';

import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-wct-external',
  templateUrl: './wct-external.component.html',
  styleUrls: ['./wct-external.component.css']
})
export class WctExternalComponent implements OnInit {

  @Input() public props: JsonParams;
  @Input() public viewStructure: JsonParams;
  @Input() public inputParameters: JsonParams[];
  @Input() public inputParametersContext: JsonParams[];
  @Input() public inputDataRecs: Object;
  @Input() public baseInfoForm: FormGroup;
  @Input() public dataRecs: any;

  @Input() public filterDateInterval: any;
  @Input() public fromDefault: any;
  @Input() public toDefault: any;

  @Input() public componentIndex: number = -1;
  @Input() public loadingFromModal: boolean = false;
  @Input() public loadingFromTable: boolean = false;
  @Input() public rowIndex: number = -1;
  @Input() public parametersFormat: boolean = true;

  constructor(
    public globalVars: GlobalVarsService) { }

  ngOnInit() {
  }

  public setName(name: CustomEvent){

    console.log('nameChanged() | name ---> ', name);

    let param = this.globalVars.getPageParameter('mainPageHeaderTest');
    if (param)
      param.text = name.detail;

  }

}
