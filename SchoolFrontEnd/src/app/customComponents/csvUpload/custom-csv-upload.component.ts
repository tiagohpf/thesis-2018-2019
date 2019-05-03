import { Component, Input, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Http, Response, Headers } from '@angular/http';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { ModalService } from 'foundations-webct-palette/components/modalComponent/modal.service';
import { WctNotificationService } from "../../components-v2/wct-notification/wct-notification.service";

@Component({
  selector: 'custom-csv-upload',
  templateUrl: 'custom-csv-upload.component.html',
  styleUrls: ['custom-csv-upload.component.css']
})
// servico utils importar , method replaceTagVars('[[name]]')
export class CustomCSVUpload implements OnInit {
  @Input() inputParameters: JsonParams;
  @Input() inputParametersContext: JsonParams[];

  public myModalService;

  public viewExample: Object;
  public fileName = '';

  public _componentId: string;

  private url;
  private headers;
  private programName;

  constructor(
    private utils: Utils,
    private http: Http,
    private notificationService: WctNotificationService,
    private pageService: PageService,
    private modalService: ModalService
  ) {
    this.myModalService = this.modalService;
    this._componentId = 'CUSTOM-CSV-UPLOAD-' + this.utils.guid(4, '');
  }

  public ngOnInit() {
    this.viewExample =
      this.utils.findObjectInArray(
        this.inputParameters.parameters,
        'viewExample'
      ).value || null;
    if (this.viewExample['url']) {
      this.viewExample['url'] = this.utils.replaceTagVars(this.viewExample['url']);
    }
  }

  public closeModal() {
    this.modalService.closeModal();
  }

  public getFileName(evt: Event) {
    this.fileName = evt.target['files'][0].name;
  }

  public submitForm() {
    this.programName = this.utils.replaceTagVars('[[name]]');
    const rawUrl = this.utils.findObjectInArray(
      this.inputParameters.parameters,
      'urlResource'
    );
    const formattedUrl = this.pageService.startApiConfiguration(
      rawUrl.value,
      {}
    );
    const url = this.pageService.setMyUrlResource(
      this.inputParameters,
      formattedUrl,
      {},
      null,
      null
    );
    this.url = url + '/' + this.programName;
    this.makeFileRequest(
      this.url,
      [],
      document.forms['myForm']['csvFile'].files
    );
  }

  public makeFileRequest(url: string, params: string[], files: File[]) {
    const formData: FormData = new FormData(),
      xhr: XMLHttpRequest = new XMLHttpRequest();

    xhr.addEventListener('load', this.transferComplete.bind(this), false);
    xhr.addEventListener('error', this.transferFailed.bind(this), false);

    for (let i = 0; i < files.length; i++) {
      formData.append('csvFile', files[i], files[i].name);
    }

    xhr.open('POST', url, true);
    xhr.send(formData);
  }

  public transferComplete(evt) {
    if (evt.target.status >= 200 && evt.target.status < 300) {
      this.notificationService.showSuccess('Success', 'Upload complete!', {
        timeout: { error: -1 },
        positionClass: { error: 'top-center' },
        limit: { error: 1 }
      });
    } else {
      const errorText =
        '<br/>Error code: ' +
        evt.target.status +
        ' (' +
        evt.target.statusText +
        ').';
      this.notificationService.showError(
        'Error',
        'Upload failed!' + errorText,
        {
          timeout: { error: -1 },
          positionClass: { error: 'top-center' },
          limit: { error: 1 }
        }
      );
    }
    this.modalService.closeModal();
  }

  public transferFailed(evt) {
    this.modalService.closeModal();
    this.notificationService.showError('Error', 'Upload failed!', {
      timeout: { error: -1 },
      positionClass: { error: 'top-center' },
      limit: { error: 1 }
    });
  }
}
