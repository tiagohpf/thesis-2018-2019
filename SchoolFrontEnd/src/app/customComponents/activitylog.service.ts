import { Injectable } from "@angular/core";
import { Http, Response, RequestOptions, Headers } from "@angular/http";
import { Observable } from "rxjs/Observable";
import "rxjs/Rx";

@Injectable()
export class ActivityLogService {

    constructor(private http: Http) {
    }

    logActivity(url: string, entity: string, operation: string, id: string, contextEntity: string, contextEntityId, status: boolean): Observable<any> {

        let options = this.getHeaders();

		let body = {
			"requestAffectedEntity": entity,
            "requestOperation": operation,
            "requestChannel": "ABC-SM",
            "requestContextEntity": contextEntity,
            "requestContextEntityId": contextEntityId,
            "entities": [id],
            "requestUser": localStorage.getItem('preferred_username'),
            "requestToken": localStorage.getItem('token'),
            "requestDetails": {},
			"requestReasonDesc": ""
		}
		if(status) {
			body["requestStatus"] = "PROCESSED";
		}else{
			body["requestStatus"] = "ERROR";
        }

        return this.http
            .post(url, body, options)
            .map((response: Response) => {
                return <any>response.json();
            })
            .catch(this.handleError);

    }

    private handleError(error: any) {
        return Observable.throw(error);
    }

    private getHeaders() {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json'),
		headers.append('Accept', 'application/json'),
        headers.append('Authorization', 'Bearer ' + localStorage.token);
        let options = new RequestOptions({ headers: headers });
        return options;
    }
}