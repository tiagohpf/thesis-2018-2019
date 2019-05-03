import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';

import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';

import { InputService } from 'foundations-webct-robot/robot/services/input.service';
import { ComponentsService } from 'foundations-webct-robot/robot/services/components.service';

@Component({
    selector: 'custom-tag-input',
    templateUrl: 'custom-tag-input.component.html'
})

export class CustomTagInputComponent implements OnInit, OnDestroy {

    @Input() public inputParameters: JsonParams;
    @Input() public inputDataRecs: Object;
    @Input() public dataRecs: Object;
    @Input() public control: FormControl;

    public valueControl: string = null;

    public observableValue: string = '';
    public componentElementsId = {
        component: '',
        icon: '',
        description: ''
    };

    private _componentId: string;
    private _subscription: any;

    private items: any;

    constructor(
        private _robot: RobotEngineModel,
        private _utils: Utils,
        private _components: ComponentsService,
        private _pageService: PageService,
        private _inputService: InputService) {

        this._componentId = 'SELECT-' + this._utils.guid(4, '');
    }

    public ngOnInit() {

        this._startComponent();
        this._subscription = this.inputParameters.observe().subscribe(param => {
            this._inputService.loadValueListFromDataRecs(this.inputParameters, this.dataRecs, this.inputParameters.valueList, this._componentId);
        });

    }

    public ngOnDestroy() {
        if (this._subscription)
            this._subscription.unsubscribe();
    }

    public addAdd(event: any) {
        this.inputParameters.value.push(event);
        this.valueControl = this.inputParameters.value.length > 0 ? '*'.repeat(this.inputParameters.value.length) : null;

        this._robot.findDynamicPropsDependencies(this.inputParameters.id, this.dataRecs);
        this._components.updatePageParameters(this.inputParameters.parameters);
    }

    public onTagEdited(event: any) {
        this.inputParameters.value[event.index].value = event.value;
        this.inputParameters.value[event.index].display = event.display;
        
        this._robot.findDynamicPropsDependencies(this.inputParameters.id, this.dataRecs);
        this._components.updatePageParameters(this.inputParameters.parameters);
    }

    public onRemove(event: any) {
        this.inputParameters.value.splice(this.inputParameters.value.findIndex(el => el.value === event.value), 1);
        this.valueControl = this.inputParameters.value.length > 0 ? '*'.repeat(this.inputParameters.value.length) : null;

        this._robot.findDynamicPropsDependencies(this.inputParameters.id, this.dataRecs);
        this._components.updatePageParameters(this.inputParameters.parameters);
    }

    private _startComponent() {

        this.componentElementsId.component = this._components.getHtmlId(this.inputParameters);
        /*if (this.inputParameters.icon)
            this.componentElementsId.icon = this._components.getHtmlId(this.inputParameters, 'input-icon');
        if (this.inputParameters.description)
            this.componentElementsId.description = this._components.getHtmlId(this.inputParameters, 'input-description')
        */
        if (this.inputParameters.value)
            this.inputParameters.value = typeof this.inputParameters.value == 'string' ? [this.inputParameters.value] : this.inputParameters.value;

        if (!this.control)
            this.control = new FormControl();

        this._setOriginalValue();

        this._inputService.loadValueListFromDataRecs(this.inputParameters, this.dataRecs, this.inputParameters.valueList, this._componentId);
        this.items = this.inputParameters.valueList ? this.inputParameters.valueList.map(elem => { return { value: elem.value, display: elem.value }; }) : [];
        this.inputParameters.value = this.items;
    }

    private _setOriginalValue() {
        if (this.inputParameters.value)
            this.inputParameters.originalValue = this._utils.cloneJsonParse(this.inputParameters.value);
    }

}
