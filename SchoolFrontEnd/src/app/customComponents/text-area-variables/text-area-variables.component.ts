/* import { Component, Input, OnInit, OnDestroy, AfterViewInit, DoCheck } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';
import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { ApiService } from 'foundations-webct-robot/robot/services/api.service';
import { ComponentsService } from 'foundations-webct-robot/robot/services/components.service';

import { InputService } from 'foundations-webct-palette/components/basicComponents/input.service';
import { InputTextboxComponent } from 'foundations-webct-palette/components/basicComponents/textbox.component'

@Component({
  selector: 'custom-textarea-variables',
  templateUrl: 'text-area-variables.component.html',
  styleUrls: ['text-area-variables.component.css'],
})

export class TextAreaVariablesComponent implements OnInit, OnDestroy {

  @Input() public inputParameters: JsonParams;
  // @Input() public inputParametersContext: JsonParams[];
  @Input() public formModel: FormGroup;

  public inputDataRecs: Object;
  public componentElementsId = {
    component: '',
    icon: '',
    description: ''
  };
  public errorMessage = '';
  public showError = false;
  public labelFor: string;
  public labelText: string;
  public required = false;

  public componentReady = false;

  private _componentId: string;

  constructor (
    public inputService: InputService,
    public pageService: PageService,
    public globalVars: GlobalVarsService,
    public utils: Utils,
    public _robot: RobotEngineModel,
    private _apiService: ApiService,
    private _components: ComponentsService,
  ) {

    this._componentId = 'CUSTOM-TEXTAREA-VARIABLES-' + this.utils.guid(4, '');
  }

  public ngOnInit () {

    this._loadDataRecs();

    this.labelText = this.inputParameters.text || '';
    this.labelFor = this._components.getHtmlId(this.inputParameters);

    console.log('labelText--->', this.labelText);
    console.log('labelFor--->', this.labelFor);

    this.componentReady = true;
  }

  public ngOnDestroy () {
    this.globalVars.deletePageParameterById(this._componentId);
  }

  public click(data) {
    const variable = '<span id="var1" style="background-color:#F0FFFF;">' + data.value + '</span> ';
    document.getElementById('diveditable-' + this.componentElementsId.component).innerHTML = variable;
    this.inputParameters.originalValue += data.key;
    this.inputParameters.value += data.value;
  }

  public valueChange (evt) {
    const currValue = document.getElementById('diveditable-' + this.componentElementsId.component).innerHTML;
    // this.inputParameters.value = currValue;
    // console.log('value--->', currValue);
    console.log('evt--->', evt);
  }

  public test () {
    console.log(this.inputParameters.value);
    console.log(this.inputParameters.originalValue);
  }

  private _loadDataRecs () {
    if (!this.inputParameters.groups.urlResource) {
      return;
    }

    const urlResourceConfig = this.inputParameters.groups.urlResource.parameters;
    const formatedUrl = this.pageService.startApiConfiguration(urlResourceConfig, this.inputDataRecs);

    this.utils.GetAll(
      this.pageService.setMyUrlResource(
        this.inputParameters,
        formatedUrl,
        {},
        null,
        this.inputDataRecs,
        this._componentId
      )
    ).subscribe(
      (data) => {
        formatedUrl['_componentId'] = this._componentId;
        this._apiService.setApiHistory(formatedUrl, data);
        this._dealWithParamApi(data);
      },
      (error) => {
        this.inputParameters.valueList = this.inputParameters.valueList && this.inputParameters.valueList.length > 0 ? this.inputParameters.valueList : []
      }
    );
  }

  private _dealWithParamApi (data) {
    this._robot.evaluateParamValues(this.inputParameters, [data, this.inputDataRecs, this._apiService.getApiHistory()]);
    // console.log('data--->', data);
    // console.log('TextAreaVariablesComponent---->', this.inputParameters);
  }
}
 */
import {
  Component,
  OnInit,
  AfterViewInit,
  DoCheck,
  Input
} from '@angular/core';

import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { ConfigurationService } from 'foundations-webct-robot/robot/utils/configuration.service';
import { Router } from '@angular/router';
import { Http, Response, Headers } from '@angular/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';

declare var confMessage: any;

@Component({
  selector: 'message-body-editor-component',
  templateUrl: 'text-area-variables.component.html',
  styleUrls: ['text-area-variables.component.css'],
})
export class MessageBodyEditorComponent implements OnInit, DoCheck, AfterViewInit {

  @Input() inputParameters;
  @Input() inputDataRecs;
  @Input() public formModel: FormGroup;
  @Input() public control: FormControl;

  public tokens = [];
  public editable = true;
  public required = false;
  public valueControl: string = null;

  public charactersFeedback = 'messages___feedback___charactersLeft';
  public warningFeedback = 'messages___feedback___warning';
  public errorFeedback = 'messages___feedback___error';
  public specialCharactersFeedback = 'messages___feedback___specialCharacters';

  public feedback = false;

  constructor(public configurationService: ConfigurationService, public pageService: PageService, public utils: Utils, private router: Router) {
  }


  public ngDoCheck() {
    this.feedback = this.inputParameters.key;
  }

  public ngOnInit() {

    if (!this.control) {
      this.control = new FormControl();
    }

    // Get tokens
    /* if (this.inputParameters.originalValue.availableOptions) {
      this.tokens = this.inputParameters.originalValue.availableOptions.tokens;
    } else if (this.inputParameters.originalValue.tokens) {
      this.tokens = this.inputParameters.originalValue.tokens;
    } */
    this.tokens = this.inputParameters.valueList || [];

    this.feedback = this.inputParameters.key;

    // Check if is required
    if (this.inputParameters.validator.required) {
      this.required = this.inputParameters.validator.required.value;
    }

    // Check if is disabled
    if (this.inputParameters.disabled) {
      this.editable = !this.inputParameters.disabled;
    }

    // Verificar se existe conteúdo na textbox (para o caso de estar na modal de edit)
    if (this.inputParameters.value && this.inputParameters.value.content != null && this.inputParameters.value.content.body.length > 0) {
      this.control.setValidators(null); /*desactivar temporariamente o validator (tem conteudo na textbox) */
      this.updateForm();
    }
  }

  ngAfterViewInit() {
    if (this.inputParameters.originalValue && this.inputParameters.originalValue.content) {
      this.array2Html(this.inputParameters.originalValue.content.body, this.tokens);
      this.inputParameters.value = this.inputParameters.originalValue.content.body;
    }
  }

  private onChange(event) {
    console.log('Change!');
  }

  public forceRefresh() {
    setTimeout(() => { // delay necessário para actualizar correctamente os dados
      const parentNode = document.getElementById('content-editable');
      // activar o validator caso não haja conteudo na caixa de texto
      if (parentNode.childNodes.length === 0) {
        this.formModel.setControl(this.inputParameters.id, new FormControl('', Validators.nullValidator));
        this.formModel.setControl(this.inputParameters.id, new FormControl('', Validators.required));
      }
    }, 1);
  }

  public onInput(event) {
    /*re-activar o validator (apenas útil caso esteja na modal de edit) */
    this.control.setValidators(Validators.required);

    const childNodes = event.target.childNodes
    this.html2Array(childNodes);


    this.updateForm();
  }

  /*usado ao clicar num botão para forçar a desactivação do validator (para indicar que tem texto lá dentro,
     mesmo quando apenas tem um token na caixa de texto) */
  public clickTokenButton() {
    this.valueControl = '*'; // nota: esta função é igual à função updateForm, com excepção desta linha
    this.control.setValue(this.valueControl);
    this.control.markAsTouched();
    this.control.markAsDirty();
    this.control.updateValueAndValidity();
  }

  // Converts contenteditable child nodes to an array
  private html2Array(childNodes) {
    this.inputParameters.value = []

    // para saber se o valor do elemento anterior era "null" para criar um parágrafo.
    let auxParagraph = false;
    // para saber se o valor do elemento anterior era "null" MAS era um token/tag/botão
    let previousElementIsTokenButton = false;

    for (const child of childNodes) {
      /*se detectou um "null" então é porque é um parágrafo, no entanto as tags também aparecem como null!
         é então usada a variável auxiliar "previousElementIsTokenButton" para detectar se o null é de um
         parágrafo, ou de um token/tag/botão*/
      // o parágrafo não é criado no caso do "null" ser de um token/tag/botão.
      if (auxParagraph === true && previousElementIsTokenButton === false) {
        this.inputParameters.value.push('<br>'); // adicionar a tag de <br> para o parágrafo
        auxParagraph = false; // reset da variável
      }
      if (child.nodeValue == null) {
        auxParagraph = true; // indica ao próximo elemento do array que deverá incluir <br> para o parágrafo
        previousElementIsTokenButton = false; // reset da variável do token/tag/botão
      }

      if (child.length > 0) { // if textNode
        this.inputParameters.value.push(child.nodeValue.replace(/\u00a0/g, ' '));
      } else if (child.type === 'button') {  // if button
        this.inputParameters.value.push(child.innerText);
        // indicar ao próximo elemento do array que o "null" anterior era de um token e não de um parágrafo.
        previousElementIsTokenButton = true;
      }
    }

  }


  // Converts array of message parts into html text nodes and token buttons
  private array2Html(messageParts, tokens) {
    let message = '';
    const contentEditable = document.getElementById('content-editable');

    // Iterate through message parts
    for (const part of messageParts) {
      let isToken = false;

      // Check if message part is a token
      for (const token of tokens) {
        if (part === token) {

          if (!this.editable) {
            message = message + '<button disabled _ngcontent-c8="" class="btn btn-default btn-xs token" data-var-token="[%SALDO%]" type="button" contenteditable="false">' + token + '</button>';
          } else {
            message = message + '<button _ngcontent-c8="" class="btn btn-default btn-xs fx-remove token" data-var-token="[%SALDO%]" type="button" contenteditable="false">' + token + '</button>';
          }

          isToken = true;
        }
      }

      // If not a token, then it is a text node
      if (!isToken) {
        message = message + part; // + "<br>"; //colocar o <br> aqui não iria afectar o print component
      }

    }

    // Add html to contenteditable
    contentEditable.innerHTML = message;

    // Add click-to-remove event listener to recently create button tokens
    const btns = contentEditable.getElementsByClassName('fx-remove');
    for (let i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', (event) => {

        this.removeToken(event);

      });
    }

    this.triggerChangeEvent(contentEditable);
    this.updateForm();

  }

  // Remove token from contenteditable
  private removeToken(event) {
    const parentNode = document.getElementById('content-editable');
    parentNode.removeChild(event.srcElement);

    this.triggerChangeEvent(parentNode);

    // desactivar o validator caso já só tivesse a tag/token na caixa de texto
    /*nota: parece que esta função só é chamada para as tags/tokens que são criadas inicialmente (as que
       que já estavam na mensagem ao abrir a modal de edit, não as que são adicionadas)*/
    if (parentNode.hasChildNodes() === false) {
      this.formModel.setControl(this.inputParameters.id, new FormControl('', Validators.nullValidator));
      this.formModel.setControl(this.inputParameters.id, new FormControl('', Validators.required));
    }

  }

  // Trigger changed event
  private triggerChangeEvent(node: HTMLElement) {
    const newEvent = document.createEvent('HTMLEvents');
    newEvent.initEvent('change', true, true);
    node.dispatchEvent(newEvent);
  }

  private updateForm() {

    this.valueControl = this.inputParameters.value.length > 0 ? '*'.repeat(this.inputParameters.value.length) : null;

    this.control.setValue(this.valueControl);

    this.control.markAsTouched();
    this.control.markAsDirty();
    this.control.updateValueAndValidity();
  }
}
