import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';

@Component({
    selector: 'custom-bridge-component',
    templateUrl: 'custom-bridge.component.html'
})

export class CustomBridgeComponent {

    // Parametros Mock do teu Componente
    @Input() public inputParameters: JsonParams;
    // Contexto de parâmetros onde o teu Componente se encontra    
    @Input() public inputParametersContext: JsonParams[];
    // Dados de contexto no qual o teu Componente é instanciado
    @Input() public dataRecs: Object;
    @Input() public inputDataRecs: Object;
    // Formulário activo onde o teu Componente é instanciado
    @Input() public formModel: FormGroup;

    constructor(
        private _pageService: PageService,
        private _utils: Utils,
        private _globalVars: GlobalVarsService) {

    }

    public change1(e) {

        let param = this._utils.findObjectInArray(this._globalVars.getPageParametersAsArray(), 'selectbox1', 'id');
        param.type = e.target.value;

    }

    public change2(e) {

        let param = this._utils.findObjectInArray(this._globalVars.getPageParametersAsArray(), 'caixadetexto', 'id');
        param.value = e.target.value;

        let customerHeaderTitle = this._globalVars.getPageParameter('customerHeaderTitle');
        if (customerHeaderTitle)
            customerHeaderTitle.text = e.target.value;

    }

}
