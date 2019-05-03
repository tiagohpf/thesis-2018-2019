import {
  Input,
  Component,
  OnInit,
  OnChanges,
  SimpleChange,
  ViewChild,
  ElementRef
} from "@angular/core";

import { Utils } from "foundations-webct-robot/robot/utils/utils.service";
import { GlobalVarsService } from "foundations-webct-robot/robot/utils/global-vars.service";
import { JsonParams } from "foundations-webct-robot/robot/classes/jsonParams.class";
import { ModalService } from "foundations-webct-palette/components/modalComponent/modal.service";
import { AppState } from "../../app.service";

@Component({
  selector: "app-label-start",
  templateUrl: "./labelStartPopUp.component.html",
  styleUrls: ["./labelStartPopUp.component.css"]
})
export class LabelStartComponent implements OnInit {
  @Input() public inputParameters: JsonParams;

  constructor(
    private _globalVars: GlobalVarsService,
    public modalService: ModalService,
    private _utils: Utils,
    private _appService: AppState

  ) { }

  ngOnInit() {

  }

  public closeNavigateTo() {
    let checkBox = this._globalVars
      .getPageParametersAsArray()
      .find(obj => obj.key === "startModal_showCheckBox");

    if (checkBox && checkBox.value[0] == true) {
      var now = new Date();
      var time = now.getTime();
      var expireTime = time + 3600 * 1000 * 24 * 365 * 10;
      now.setTime(expireTime);

      document.cookie = "startDontShowModalAgain=true; expires=" + now.toUTCString() + "; path=/";
      //localStorage.setItem("startDontShowModalAgain", "true");
    }
    if (this.inputParameters.navigateTo) {
      this._utils.navigate(this.inputParameters.navigateTo);
    }
    let openModal = this.inputParameters.parameters.find(obj => obj.key == 'openModal');
    if (openModal && openModal.value) {
      this.modalService.openModal(openModal.value, null, null, new JsonParams(openModal.id));
      return;
    }
    sessionStorage.setItem("modalStart", "true");
    this.modalService.closeModal();
    this._appService.isStartModal = false;

  }
}
