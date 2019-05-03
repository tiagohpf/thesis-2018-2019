import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from "@angular/core";
//import { Http, Response, RequestOptions, Headers } from "@angular/http";
import { Observable } from "rxjs/Observable";
import "rxjs/Rx";


import { v4 as uuid } from 'uuid';
import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';


@Injectable()
export class IxsService {

    public noAccount: boolean = false;
    userManagementURI: string;
    

    constructor(private http: HttpClient, private pageService: PageService, private utils: Utils) {
        this.userManagementURI = this.pageService.getUrlFromConfig(this.utils.replaceTagVars("{{IxsService}}/api/v1/fulfillment/subscriptions/", null));

    }


    public addCustomerAccount(auth_user_info: any)  {
    
        let account = new Account();
    
        //going to set new Customer form
        account.id = uuid();
        account.billingDay = 1;
        account.status = "active";
        account.client.id = uuid();
        account.client.email = auth_user_info.email;
        account.client.locale = "pt_PT"; //to be reviewed
        account.client.name = auth_user_info.name;//"user1" + ' ' + "user1";
        account.client.phone = "999999999";
        account.client.operatorId = "0";
        account.client.status = "active";
    
        //return this.createAccount(account);
        return this.http.post(this.userManagementURI, account, {headers: this.getHeaders()})
        .subscribe(
          (val) => {
            this.addServiceAccount(account);
          },
          (res: Response) => {
            console.log(res);
          },
          () => {
            console.log("The POST observable is now completed.");
          });
    
      }
    
    
      createAccount(account: Account):any  {
        console.info("createAccount");
    
        return this.http.post(this.userManagementURI, account, {headers: this.getHeaders()})
          .subscribe(
            (val) => {
              console.log("POST call successful value returned in body", val);
              this.addServiceAccount(account);

            },
            (res: Response) => {
              console.log(res);

            },
            () => {
              console.log("The POST observable is now completed.");
            });
      }
    
      public addServiceAccount(account: Account)  {

        let serviceAccount: ServiceAccount = new ServiceAccount();

        serviceAccount.administrator.name = account.client.name;
        serviceAccount.administrator.email = account.client.email;
        serviceAccount.administrator.login = account.client.email;
        serviceAccount.administrator.mobile = "999999999";
        serviceAccount.id = 'BOT' + uuid();
        serviceAccount.level = "String";
        serviceAccount.maxUsers = 50;
        serviceAccount.operatorId = "0";
        serviceAccount.resourceOrderMaxQty = 50;
        serviceAccount.resourceOrderMinQty = 5;
        serviceAccount.type = "BOT";
        serviceAccount.status = "active";
    
        let serviceAccountArray: ServiceAccount[] = [];
        serviceAccountArray.push(serviceAccount);
    
        return this.createServiceAccount(this.userManagementURI + account.id + '/services?channel=external', serviceAccountArray);
    
      }
    
      createServiceAccount(UserManagementURI: string, serviceAccountArray: ServiceAccount[]) {
        console.info("createServiceAccount");
        return this.http.post(UserManagementURI, serviceAccountArray, {headers: this.getHeaders()})
          .subscribe(
            (data) => {

              console.info("redirecting...")
              this.utils.navigate("students");
              return data;
            });
      }
    
    

    private handleError(error: any) {
        return Observable.throw(error);
    }

    private getHeaders() : HttpHeaders{
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/json');
        headers = headers.set('Accept', 'application/json');
        headers = headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
        headers = headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token');
        headers = headers.set('Authorization', 'Bearer ' + localStorage.token);

        return headers;
      }
}


class Account {

    id: string;
    status: string;
    billingDay: number;
    client: Customer;
  
    constructor() {
      this.client = new Customer();
    }
  }
  
  class Customer{
    operatorId: string;
    name: string;
    phone: string;
    email: string;
    locale: string;
    status: string;
    id: string;
  
    constructor() {
    }
  }
  
  export class ServiceAccount {
    id: string;
    level: string;
    maxUsers: number;
    name: string;
    operatorId: string;
    resourceOrderMaxQty: number;
    resourceOrderMinQty: number;
    status: string;
    type: string;
    administrator: Administrator;
  
    constructor() {
      this.administrator = new Administrator();
    }
  };
  
  
  class Administrator {
    email: string;
    login: string;
    name: string;
    mobile: string;
    constructor() {
    }
  
  };