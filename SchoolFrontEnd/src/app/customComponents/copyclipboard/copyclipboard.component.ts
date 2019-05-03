import { Component, OnInit, Input } from '@angular/core';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { WctNotificationService } from "../../components-v2/wct-notification/wct-notification.service";
import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';

@Component({
  selector: 'copyclip-board',
  templateUrl: './copyclipboard.component.html',
  styleUrls: ['./copyclipboard.component.scss']
})
export class CopyclipboardComponent implements OnInit {

  @Input() public inputParameters: JsonParams;

  constructor(
    private _globalVars: GlobalVarsService,
    private _notificationService: WctNotificationService,
    public pageService: PageService,
  ) { }

  ngOnInit() {
  }

  copy() {

    let toCopyObj = new JsonParams;

    if (typeof this.inputParameters.mappingId != 'string') {
      toCopyObj = this._globalVars.getPageParameter(this.inputParameters.mappingId[0]); // garante que o mappingId é uma string
    }
    else
      toCopyObj = this._globalVars.getPageParameter(this.inputParameters.mappingId);

    console.log('toCopyObj -----> ', this.inputParameters);
    if (toCopyObj.value || toCopyObj.value != "") {

      this.getValueToCopy(toCopyObj);

      this.notificationHasValue(true);
    } else {
      this.notificationHasValue(false);
    }
  }


  /**
    * obter o valor do campo que quero copiar
    * @param element DOM event
    */
  private getValueToCopy(element: JsonParams) {

    var el = document.createElement('textarea');
    el.style.position = 'fixed';
    el.style.left = '0';
    el.style.top = '0';
    el.style.opacity = '0';
    el.value = element.value;
    document.body.appendChild(el);
    el.select();

    document.execCommand('copy');

    document.body.removeChild(el);

  }

  /**
    * mostrar notification caso tenha value to copy ou não
    * @param element DOM event
    */
  private notificationHasValue(hasValue: boolean) {

    switch (hasValue) {
      case true:
        this._notificationService.showInfo(
          null,
          this.pageService.i18n("generic___operations___successfullyCopiedTag"),
          {
            timeout: { error: -1 },
            positionClass: { error: 'top-center' },
            limit: { error: 1 }
          });
        break;

      case false:
        this._notificationService.showError(
          null,
          this.pageService.i18n("generic___operations___noValueToCopy"),
          {
            timeout: { error: -1 },
            positionClass: { error: '' },
            limit: { error: 1 }
          });
        break;

    }

  }

}
