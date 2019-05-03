import { ApiService } from 'foundations-webct-robot/robot/services/api.service';
import { FormControl } from '@angular/forms';
import { InputService } from 'foundations-webct-robot/robot/services/input.service';
import { ComponentsService } from 'foundations-webct-robot/robot/services/components.service';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { WctNotificationService } from "../../components-v2/wct-notification/wct-notification.service";
import { Component, OnInit, Input } from '@angular/core';

import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { NgForm } from '@angular/forms';

import { StripeService } from './stripe.service'

import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { ModalService } from 'foundations-webct-palette/components/modalComponent/modal.service';
import { throwError, Subscription } from 'rxjs';
import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';

@Component({
  selector: 'stripe-card-list',
  templateUrl: 'stripe-card-list.component.html',
  styleUrls: ['./stripe-card-list.component.css']
})
export class StripeCardList implements OnInit {

  cardsList: any[];

  @Input() public inputParameters: JsonParams;
  @Input() public inputDataRecs: Object;
  @Input() public dataRecs: Object;
  @Input() public control;

  public addCard: Boolean =  false;

  public valueControl: string = null;
  public elementId: string;

  private _componentId: string;
  private _subscription: any;
  billingURI: string;

  constructor(
    private _robot: RobotEngineModel,
    private _utils: Utils,
    private _components: ComponentsService,
    private _pageService: PageService,
    private _http: HttpClient, 
    private _inputService: InputService,
    private _apiService: ApiService,
    private _globalVars: GlobalVarsService,
    private _notificationService: WctNotificationService) {

    this._componentId = 'STRIPE-CARD-' + this._utils.guid(4, '');

    console.info("constructor");
    this.billingURI = this._pageService.getUrlFromConfig(this._utils.replaceTagVars("{{BillingService}}", null));

  }


  public ngOnInit() {
    console.info(this.inputParameters);
    this._startComponent();
    this.cardsList = this.inputParameters.valueList;

    this._subscription = this.inputParameters.observe().subscribe(param => this._startComponent());
  }

  public ngOnDestroy() {
    if (this._subscription)
      this._subscription.unsubscribe();
  }

  public updateParameters(option: any) {

    if (this.inputParameters.disabled || option.disabled)
      return;

    this.inputParameters.value = option.id ? (option.value || option.id) : option.key;
    if (option && option['updateParameter']) {
      for (let i in option['updateParameter']) {
        this.inputParameters[i] = !option['updateParameter'][i].match(/{{\s*[\w\.\-\_]+\s*}}/g) ? option['updateParameter'][i] : '';
      }
    }

    this.setValueControl();

    this.addCard = false;

  }

  public setValueControl() {
    this.valueControl = this.inputParameters.value;
    this._robot.findDynamicPropsDependencies(this.inputParameters.id, this.dataRecs);
    this._components.updatePageParameters(this.inputParameters.parameters);
  }

  private _startComponent() {

    this.elementId = this._components.getHtmlId(this.inputParameters);

    if (!this.control)
      this.control = new FormControl();

    this.setValueControl();
    //this._inputService.loadValueListFromDataRecs(this.inputParameters, this.dataRecs, this.inputParameters.valueList, this._componentId);
  }


  public addNewCard(){
    this.addCard = !this.addCard;
    this.resetCardSelection();
  }

  public cancelCardCreation(){
    this.addCard = false;
  }

  public cardCreated(token: any){
    this.sendToken(token);
    this.addCard = false;
  }

  private resetCardSelection(){
    this.inputParameters.value = null;
    this.setValueControl();
  }



  private sendToken(stripeToken:any){

    const customerId = this._utils.findObjectInArray(this.inputParameters.parameters, 'customerId').value;
    console.log("parent ----> ", customerId);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + localStorage.token
      })
    };


  this._http.put(this.billingURI+"/customers/"+customerId+"/cards", {token : stripeToken.id}, httpOptions)
  .subscribe(
    (val) => {
      this.addNewCardToList(val['response']);
    },
    (res: HttpErrorResponse) => {
      //this.pageService.operationLoading = false;
      this._notificationService.showError("Error", "Card error",
      {
        timeout: { error: -1 },
        positionClass: { error: 'top-center' },
        limit: { error: 1 }
      });

    },
    () => {
      //this.pageService.operationLoading = false;
    });
  }

  private addNewCardToList(card:any){
    this.cardsList.push(card.item);
  }

}