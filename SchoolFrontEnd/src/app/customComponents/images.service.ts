import { Injectable } from "@angular/core";
import { Http, Response, RequestOptions, Headers } from "@angular/http";
import { Observable } from "rxjs/Observable";
import "rxjs/Rx";

@Injectable()
export class ImagesService {

    constructor(private http: Http) {
    }

    uploadPhoto(baseUrl: string, entity: string, id: string, formData: FormData): Observable<any> {
        // TODO definir o endPoint a ser atacado
        let url = baseUrl + '/' + entity + '/' + id + '/upload';
        let options = this.getHeaders(id);

        return this.http
            .post(url, formData, options)
            .map((response: Response) => {
                return <any>response.json();
            })
            .catch(this.handleError);
    }

    private handleError(error: any) {
        return Observable.throw(error);
    }

    private getHeaders(id?: string) {
        let headers = new Headers();
        headers.append('Authorization', 'Bearer ' + localStorage.token);
        let options = new RequestOptions({ headers: headers });
        return options;
    }
}