import {
  Component,
  OnInit,
  ViewEncapsulation,
  Input,
} from '@angular/core';

import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { ConfigurationService } from 'foundations-webct-robot/robot/utils/configuration.service';
import { Router } from '@angular/router';
import { Http, Response, Headers } from '@angular/http';
import {PrintService} from './print.service';

@Component({
  selector: 'print-component',
  templateUrl: 'print.component.html'
})
export class PrintComponent implements OnInit {

  @Input() inputParameters;
  @Input() inputDataRecs;
  @Input() dataRecs;


  public text;
  public id;
  public imageUri;
  public imageShape;
  public navigateTo;

  public viewDetails = false; //para saber se deve mostrar o hover do viewDetails ou não
  public detailsRoute; //rota do viewDetails
  public applyViewDetailMask = false; //mostrar, ou não, o icone do view details ao fazer hover

  constructor(
    public configurationService: ConfigurationService,
    public pageService: PageService,
    public utils: Utils,
    private router: Router,
    public globalVarsService: GlobalVarsService,
    public _http: Http,
    public printService: PrintService) {
  }
  

  //click buttons
  onPrintInvoice() {
    const invoiceIds = ['101', '102'];
    const invoice = {"id":"5c82a05f5915f926e87911cb","customerBSId":"5c62e5026a2645042c095fc2","invoice":null,"order":"or_1EBm6SANQ4XmPwDraUgFYPGq","group":"IXS.ALB.","entity":"5c5c39ff290b1f4158fc5647","amount":3000,"currency":"eur","date":"2019-03-08T17:03:25.000Z","description":"Payment for order or_1EBm6SANQ4XmPwDraUgFYPGq","receiptUrl":"https://pay.stripe.com/receipts/acct_1DtFDcANQ4XmPwDr/ch_1EBm6TANQ4XmPwDrokd0DQCK/rcpt_Ef6JANsgDWphipLzPM0GpMNdf93BfQM","paid":true}

    this.printService.data = this.inputParameters.value;

    this.printService
      //.printDocument('invoice', invoiceIds);
      .printDocument('5c5c39ff290b1f4158fc5647', "5c82a05f5915f926e87911cb");
      //.printDocument(this.inputParameters.parameters);
      
  }

  public ngOnInit() {
    console.info(this.inputParameters);
/*     this.id = this.dataRecs.ctxtId; 
    this.text = this.dataRecs.ctxtAlias;
    this.navigateTo = this.dataRecs.ctxtNavigateTo;

    // get image uri
    let imgUriProp = this.inputParameters.mockJson.imgUriProp;
    if (imgUriProp == undefined) {
      this.imageUri = this.dataRecs.ctxtImageUri
    }
    else {
      this.imageUri = this.dataRecs[imgUriProp];
    }

    this.imageShape = this.dataRecs.ctxtImageShape;

    this.viewDetails = this.inputParameters.mockJson.viewDetails; // true / false(default)
    if (this.viewDetails) {
      this.detailsRoute = this.navigateTo;
    } */
  }

  public ngOnDestroy() {

  }

}
