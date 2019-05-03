import { Injectable } from '@angular/core';
import { ConfigurationService } from 'foundations-webct-robot/robot/utils/configuration.service';


declare var Stripe: any;
@Injectable()
export class StripeService {

  stripe: any;
  //stripe = Stripe('pk_test_OnANvRl6ingSIjJ8Pmz571Bn');


  constructor(private _config: ConfigurationService) {
    this.stripe = Stripe(_config.getConfig("stripeKey"));
    console.info("stripe");
    console.info(this.stripe);
  }

}