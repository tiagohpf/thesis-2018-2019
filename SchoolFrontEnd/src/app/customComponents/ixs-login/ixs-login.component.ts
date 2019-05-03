import { Component, Input, OnInit } from '@angular/core';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';
import { IxsService } from '../ixs.service';

@Component({
  selector: 'app-ixs-login',
  templateUrl: './ixs-login.component.html',
  styleUrls: ['./ixs-login.component.css']
})
export class IxsLoginComponent implements OnInit {

  @Input() public dataRecs;
  @Input() public inputParameters: JsonParams;
  public showHtml: boolean = false;
  public hasDataToShow: boolean = true;

  public noAccount: boolean = false;

  public navigate = (contexto: any) => !this.isDisabled(contexto) ? this._utils.navigate(this.inputParameters.navigateTo, contexto) : null;

  constructor(private _utils: Utils, private _globalVars: GlobalVarsService, public ixsService:IxsService) {
  }
  ngOnInit() {
    if (
      this.inputParameters.valueList &&
      this._utils.isObjectType(this.inputParameters.valueList, 'Array') &&
      this.inputParameters.valueList.length == 1 &&
      this.inputParameters.valueList[0].status === 'ACTIVE')
      this.ixsClicked(this.inputParameters.valueList[0]);
    else if (this.inputParameters.valueList &&
      this._utils.isObjectType(this.inputParameters.valueList, 'Array') &&
      this.inputParameters.valueList.length == 0) {
      this.hasDataToShow = false;
      this.showHtml = true;
    }
    else
      this.showHtml = true;

    if (!this.inputParameters.valueList){
      this.noAccount = true;
    }

    if(this.noAccount){
      this.createAccount();
    }
    console.log(this.hasDataToShow);
  }

  public isDisabled = (item: any): boolean => item.status !== 'ACTIVE';
  public insertStatus = (item: any): string => this.inputParameters.icon[item.status] || "";

  public ixsClicked(item: any) {

    this._globalVars.setLocalStorage('IXS_id', item.id);
    this._globalVars.setLocalStorage('IXS_name', item.name);


    console.log(localStorage.IXS);
    this._utils.navigate(this.inputParameters.navigateTo, item);
  }

  private createAccount(){
    let auth_user_info : any = JSON.parse(localStorage.getItem('auth_user_info'));
    this.ixsService.addCustomerAccount(auth_user_info);
  }

}
