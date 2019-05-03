import { WctNotificationService } from '../../components-v2/wct-notification/wct-notification.service';
import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { NgForm } from '@angular/forms';

import { StripeService } from './stripe.service'

import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { ModalService } from 'foundations-webct-palette/components/modalComponent/modal.service';
import { throwError, Subscription } from 'rxjs';

@Component({
  selector: 'stripe-card',
  templateUrl: 'stripe-card.component.html',
  styleUrls: ['./stripe-card.component.css']
})
export class StripeCard implements AfterViewInit, OnDestroy, OnInit {

  @Input() inputParameters;
  @Input() inputDataRecs;
  @Output() cancelCardCreation = new EventEmitter();
  @Output() cardCreated = new EventEmitter();

  @ViewChild('cardInfo') cardInfo: ElementRef;

  card: any;
  cardHandler = this.onChange.bind(this);
  error: string;
  stripe: any;
  elements: any
  billingURI: string;

  constructor(
    private cd: ChangeDetectorRef, 
    private stripeService: StripeService, 
    private http: HttpClient, 
    private pageService: PageService, 
    private utils: Utils,
    private modalService: ModalService,
    private notificationService: WctNotificationService) {
    this.billingURI = this.pageService.getUrlFromConfig(this.utils.replaceTagVars("{{BillingService}}", null));
  }


  ngOnInit(){
    console.info("init StipeCardList");
    this.stripe = this.stripeService.stripe
    this.elements = this.stripe.elements();
    console.info(this.inputParameters);

  }

  ngAfterViewInit() {


    this.card = this.elements.create('card');
    this.card.mount(this.cardInfo.nativeElement);

    this.card.addEventListener('change', this.cardHandler);
  }

  ngOnDestroy() {
    this.card.removeEventListener('change', this.cardHandler);
    this.card.destroy();
  }

  onChange({ error }) {
    if (error) {
      this.error = error.message;
    } else {
      this.error = null;
    }
    this.cd.detectChanges();
  }

  onNewCardCancelCkicked(){
    this.cancelCardCreation.emit();
  }

  async onSubmit(form: NgForm) {
/*
    console.info("data:")
    console.info(this.inputParameters.value);
 
    if (this.inputParameters.value.planId){
      console.info("subscription");
      this.makeSubscription();
    } else if(this.inputParameters.value.product){
      console.info("order");
      this.makeOrder();
    } */

    //this.pageService.operationLoading = true;
    const { token, error } = await this.stripe.createToken(this.card);

    if (error) {
      console.log('Stripe - Something is wrong:', error);
      //this.pageService.operationLoading = false;
    } else {
      //send token to back-end
      //this.sendToken(token.id);
      console.info("send token:");
      console.info(token);
      this.cardCreated.emit(token);
    } 
  }

  private sendToken(stripeToken:string){

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + localStorage.token
      })
    };


  this.http.put(this.billingURI+"/customers/"+this.inputParameters.value.customerId+"/cards", {token : stripeToken}, httpOptions)
  .subscribe(
    (val) => {


/*     if (this.inputParameters.value.planId){
      console.info("subscription");
      this.makeSubscription();
    } else if(this.inputParameters.value.product){
      console.info("order");
      this.makeOrder();
    } */
      
    },
    (res: HttpErrorResponse) => {
      //this.pageService.operationLoading = false;
      this.notificationService.showError("Error", "Card error",
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

  private makeSubscription(){
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + localStorage.token
      })
    };


    this.http.post(this.billingURI+"/subscriptions", {customerId: this.inputParameters.value.customerId ,planId: this.inputParameters.value.planId, entity: this.inputParameters.value.studentId  }, httpOptions)
    .subscribe(
      (val) => {

        this.modalService.closeModal();
        this.notificationService.showSuccess("Subscription done", "Your subscription has been successfully completed.",
        {
          timeout: { error: -1 },
          positionClass: { error: 'top-center' },
          limit: { error: 1 }
        });

      },
      (res: HttpErrorResponse) => {
        console.info("Subscription Error");
        this.modalService.closeModal();
        this.notificationService.showError("Subscription Error", res.error.error.message,
        {
          timeout: { error: -1 },
          positionClass: { error: 'top-center' },
          limit: { error: 1 }
        });
        
      },
      () => {
        console.log("End subscription.");
        this.modalService.closeModal();
      });
  }

/*
 * Create order for addon
 */
  private makeOrder(){
    let product = this.inputParameters.value.product
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + localStorage.token
      })
    };


    let orderBody = {
      "currency": "eur",
        customer: this.inputParameters.value.customerId,
        items: [
                 {
                     "type": "sku",
                     "parent": product.id,
                     "entity": this.inputParameters.value.studentId
                 }
           ]
      };


    this.http.post(this.billingURI+"/orders", orderBody, httpOptions)
    .subscribe(
      (val) => {

        this.modalService.closeModal();
        this.notificationService.showSuccess("Order done", "Your request to increase plan to student eas submited.",
        {
          timeout: { error: -1 },
          positionClass: { error: 'top-center' },
          limit: { error: 1 }
        });

      },
      (res: HttpErrorResponse) => {
        console.info("Order Error");
        this.modalService.closeModal();
        this.notificationService.showError("Order Error", res.error.error.message,
        {
          timeout: { error: -1 },
          positionClass: { error: 'top-center' },
          limit: { error: 1 }
        });
        
      },
      () => {
        console.log("End order.");
        this.modalService.closeModal();
      });
  }

}