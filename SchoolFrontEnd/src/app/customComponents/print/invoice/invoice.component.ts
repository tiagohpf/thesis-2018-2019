import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PrintService} from '../print.service';
import * as moment from "moment/moment";

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent implements OnInit {
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  customer: any;
  payment: any;

  constructor(route: ActivatedRoute,
              private printService: PrintService) {
    console.info("InvoiceComponent.constructor");
    console.info(route.snapshot.params);
/*     this.invoiceIds = route.snapshot.params['invoiceIds']
      .split(','); */
    //this.paymentId = route.snapshot.params['paymentId']
  }

  ngOnInit() {
    console.info("InvoiceComponent.ngOnInit(data):");
    console.info(this.printService.data);
    this.customer = this.printService.data.customer;
    this.payment = this.printService.data.payment;

    this.payment.formatedDate = moment(this.payment.date).format("DD-MM-YYYY HH:mm:ss") ;

    this.payment.amount = this.printService.data.payment.amount/100 + "€";


//    this.invoiceDetails = this.invoiceIds.map(id => this.getInvoiceDetails(id));
//    Promise.all(this.invoiceDetails).then(() => this.printService.onDataReady());

    this.printService.onDataReady()
  }

  getInvoiceDetails(invoiceId) {
    console.info("InvoiceComponent.getInvoiceDetails");
    const amount = Math.floor((Math.random() * 100));
    return new Promise(resolve =>
      setTimeout(() => resolve({amount}), 1000)
    );
  }


  getPaymentDetails(paymentId) {
    console.info("InvoiceComponent.getPaymentDetails");
    const amount = Math.floor((Math.random() * 100));
    return new Promise(resolve =>
      setTimeout(() => resolve({amount}), 1000)
    );
  }

}
