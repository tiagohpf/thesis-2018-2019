import { Component, NgModule, Input, OnChanges, ViewChild, ElementRef, ViewChildren, ContentChild, ContentChildren } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { ComponentsService } from 'foundations-webct-robot/robot/services/components.service';

@Component({
  selector: 'app-wct-fields-format',
  templateUrl: './wct-fields-format.component.html',
  styleUrls: ['./wct-fields-format.component.css']
})
export class WctFieldsFormatComponent implements OnChanges {

  @Input() public inputParameters: JsonParams;
  @Input() public parametersFormat: boolean = true;
  @Input() public labelText: string = '';
  @Input() public inputErrors: string;
  @Input() public labelFor: string;
  @Input() public hidden: boolean = false;
  @Input() public formModel: FormGroup;
  @Input() public required: boolean = false;
  @Input() public size: number = 2;
  @Input() public fixedSize: boolean = false;
  @Input() public loadingFromTable: boolean = false;
  @Input() public datarecs: any;

  public errorMessage: string = '';
  public showError: boolean = false;
  public inlineHelp: any = {visible: false};

  constructor(
      private _utils: Utils,
      private _components: ComponentsService,
      private _pageService: PageService) {

  }

  public ngOnInit() {
      this.labelFor = this._components.getHtmlId(this.inputParameters);
      this.labelText = this._utils.replaceTagVars(this.labelText, this.datarecs);

      if (this.inputParameters.parameters.length > 0){

        let inlineHelpConf = this._utils.findObjectInArray(this.inputParameters.parameters, 'inlineHelp');

        if (inlineHelpConf.key) {
            this.inlineHelp.visible = true;
            this.inlineHelp.text = inlineHelpConf.value.text;
            console.info('inlineHelpConf');
            console.info(inlineHelpConf);
        }


        
      }

  }

  public ngOnChanges(changes: any): void {
      if (!changes.inputErrors) {
          return;
      }

      if (changes.inputErrors) {
          let errors: any = changes.inputErrors.currentValue;
          this.errorMessage = '';
          this.showError = false;

          let errorDefs = this._pageService.errorDefs[this.inputParameters.id];

          if (errors && errorDefs) {
              // console.error("parameters-format", errors);
              Object.keys(errorDefs).some((key) => {
                  if (errors[key]) {
                      this.errorMessage = errorDefs[key];
                      this.showError = this.formModel.controls[this.inputParameters.id].invalid && this.formModel.controls[this.inputParameters.id].dirty;
                      return true;
                  }
              });
          }
      }
  }
}
