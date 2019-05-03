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

@Component({
  selector: 'inline-image-component',
  templateUrl: 'inline-image.component.html',
  styles: [`
      .basic-style {
        margin-top: 8px;
        margin-bottom: 5px;
      }
      .cursor-pointer {
        cursor: pointer;
      }
    `]
})
export class InlineImageComponent implements OnInit {

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
    public _http: Http) {
  }


  public mouseEnter() {
    if (this.viewDetails)
      this.applyViewDetailMask = true;
  }
  public mouseLeave() {
    if (this.viewDetails)
      this.applyViewDetailMask = false;
  }
  public navigateToPage() {
    if (!this.viewDetails) //verificar se é suposto poder navegar para a página de detalhes
      return;
    //navegar para a página de detalhes do número
    this.router.navigateByUrl(this.detailsRoute);
  }

  public ngOnInit() {
    this.id = this.dataRecs.ctxtId;
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
    }
  }

  public ngOnDestroy() {

  }

}
