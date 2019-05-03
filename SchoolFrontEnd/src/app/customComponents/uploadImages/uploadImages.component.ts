import {
  Component,
  OnInit,
  AfterViewInit,
  ViewEncapsulation,
  Input,
} from '@angular/core';

import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { ConfigurationService } from 'foundations-webct-robot/robot/utils/configuration.service';
import { Router } from '@angular/router';
import { Http, Response, Headers } from '@angular/http';
import { ModalService } from 'foundations-webct-palette/components/modalComponent/modal.service';
import { ActivityLogService } from '../activitylog.service';
import { ImagesService } from '../images.service';
import { WctNotificationService } from "../../components-v2/wct-notification/wct-notification.service";
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';

@Component({
  selector: 'uploadImages',
  templateUrl: 'uploadImages.component.html',
  styleUrls: ['uploadImages.component.css']
})
export class UploadImages implements OnInit {

  @Input() inputParameters;
  @Input() inputDataRecs;
  @Input() dataRecs;


  private value;
  public imageUri;
  public id;
  public name;
  public status;
  public gender;
  public language;
  public course;
  public categories;
  public entity;

  public readonly: boolean = true;
  public applyUploadPhotoMask = false;

  public labels: { [k: string]: any } = {};

  private baseUrl;
  private imagesBasePath = "{{SchoolBE}}";
  private requestsUrl;

  constructor(
    public configurationService: ConfigurationService,
    public pageService: PageService,
    public utils: Utils,
    private router: Router,
    public _globalVarsService: GlobalVarsService,
    public _http: Http,
    public _modalService: ModalService,
    public _notificationService: WctNotificationService,
    private imagesService: ImagesService,
    private activityLogService: ActivityLogService) {
  }

  public ngOnInit() {

    this.value = this.inputParameters.value;

    this.readonly = this.inputParameters.readonly === undefined ? false : this.inputParameters.readonly;

    this.id = this.value.id;
    this.name = this.value.name;
    this.status = this.value.status;
    this.imageUri = this.value.imageUri;

    this.gender = this.value.gender;
    this.language = this.value.language;
    this.course = this.value.course;
    this.categories = this.value.categories;
    this.entity = this.value.entity;



    //get activitylog url
    //let requestsBasePath = "{{AppAPIBotConfig}}/requests";
    //this.requestsUrl = this.pageService.getUrlFromConfig(this.utils.replaceTagVars(requestsBasePath, this.inputDataRecs));
    this.imagesBasePath = this.pageService.getUrlFromConfig(this.utils.replaceTagVars(this.imagesBasePath, this.inputDataRecs));
  }

  public ngOnDestroy() {

  }

  /**
   * generateJsonParams
   */
  public generateJsonParams(obj: any) {
    let parameters = [];
    let jsonParams = new JsonParams();

    jsonParams.key = "context";
    jsonParams.value = Object.keys(obj);
    parameters.push(jsonParams);

    return parameters;
  }


  public btnBackClick() {

    if (this.readonly) {
      this.router.navigateByUrl('/' + this.entity);
    } else {
      this.router.navigateByUrl('/' + + this.entity + '/' + this.id);
    }
  }

  public onFileChanged(event) {
    if (this.readonly) return;

    let file = event.target.files[0];

    let formData: FormData = new FormData();
    //formData.append('foo', file);
    formData.append('foo', file);
    formData.append('filename', file.name);
    formData.append('type', 'image');

    //verificar se o ficheiro é do tipo .png, .jpg ou .bmp
    if (file.type != "image/png" && file.type != "image/jpg" && file.type != "image/jpeg") {
      this.pageService.operationLoading = false; //desactivar o loading
      //mostrar toast de erro
      let imgUploadErrorMessage = this.pageService.i18n("generic___image___upload___invalidImage");
      this._notificationService.showError(null, imgUploadErrorMessage, { timeout: { error: -1 }, positionClass: { error: 'top-center' }, limit: { error: 1 } });
      return;//não é uma imagem válida, então não vai deixar fazer upload
    }

    this.imagesService.uploadPhoto(this.imagesBasePath, this.entity, this.id, formData)
      .subscribe(
        response => {
          this.imageUri = response.imageUri;
          this.pageService.operationLoading = false;

          //create activity log
          /*this.activityLogService.logActivity(this.requestsUrl, 'STUDENT', 'STUDENT_PHOTO_CHANGE', this.id, 'STUDENT', this.id, true)
            .subscribe(
              response => {
              },
              error => {
              }
            )
          */
        },
        error => {

          //create activity log
          /*
          this.activityLogService.logActivity(this.requestsUrl, 'STUDENT', 'STUDENT_PHOTO_CHANGE', this.id, 'STUDENT', this.id, false)
            .subscribe(
              response => {
              },
              error => {
              }
            )
          */
          switch (error.status) {
            case 403: {

              let errorBody = JSON.parse(error._body);

              if (errorBody.code === 'FILES_SIZE_LIMIT_REACHED') {

                this._notificationService.showError(
                  null,
                  this.pageService.i18n("generic___image___upload___limitReached"),
                  {
                    timeout: { error: -1 },
                    positionClass: { error: 'top-center' },
                    limit: { error: 1 }
                  });

              }

              break;
            }
            case 409: {
              this._notificationService.showError(
                null,
                this.pageService.i18n("generic___image___upload___existingFile"),
                {
                  timeout: { error: -1 },
                  positionClass: { error: 'top-center' },
                  limit: { error: 1 }
                });
              break;
            }
            default: {
              this._notificationService.showError(
                null,
                this.pageService.i18n("generic___image___upload___genericError"),
                {
                  timeout: { error: -1 },
                  positionClass: { error: 'top-center' },
                  limit: { error: 1 }
                });
              break;
            }
          }
          this.pageService.operationLoading = false;
        }
      )
  }

  public mouseEnter() {
    if (this.readonly) return;
    this.applyUploadPhotoMask = true;
  }

  public mouseLeave() {
    if (this.readonly) return;
    this.applyUploadPhotoMask = false;
  }


  public editName() {
    if (this.readonly) return;
    let operation = JSON.parse('{"size":"md", "subType":"fx-modal-xl", "id": "editStudentNameModal"}');

    let parameters = [];
    let jsonParams = new JsonParams();
    jsonParams.key = "context";
    jsonParams.value = [
      'id',
      'text',
      'imageUri'
    ];
    parameters.push(jsonParams);
    let obj = { 'id': this.id, 'text': this.name, 'imageUri': this.imageUri }
    this._modalService.openModal('student/student-edit-name', parameters, obj, operation);
  }

}
