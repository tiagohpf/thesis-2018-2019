import { Component, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';

import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';

import { InputService } from 'foundations-webct-robot/robot/services/input.service';
import { ComponentsService } from 'foundations-webct-robot/robot/services/components.service';
import { HighlightTag } from 'angular-text-input-highlight';
import { Subject } from 'rxjs';

@Component({
    selector: 'custom-mentions',
    templateUrl: 'custom-mentions.component.html',
    styleUrls: ['custom-mentions.component.css'],
    encapsulation: ViewEncapsulation.None
})

export class CustomMentionsComponent implements OnInit, OnDestroy {
    @Input() public inputParameters: JsonParams;
    @Input() public inputDataRecs: Object;
    @Input() public type: string = 'text';
    @Input() public control: FormControl;

    @Input() public insideFilter: string;

    public observableValue: string = '';
    public componentElementsId = {
        component: '',
        icon: '',
        description: ''
    };

    protected _minMaxValuesValidator: string = 'minMaxValue';

    private _componentId: string;
    private _subscription: any;

    private ENTITY_DELIMITER = '`';
    private ENTITY_PATTERN_GLOBAL = /\`[^`]+\`/g;
    private MENTION_CONFIG = { format: '`@`' };
    private items: any;
    private tags: HighlightTag[] = [];
    private NBR_AVAILABLE_COLORS = 12;
    private TAGS_AVAILABLE_COLORS = [
        'bg-blue',
        'bg-pink',
        'bg-lightCyan',
        'bg-LightGray',
        'bg-lightGoldenRodYellow',
        'bg-lightGreen',
        'bg-lightPink',
        'bg-lightSalmon',
        'bg-lightSeaGreen',
        'bg-lightSkyBlue',
        'bg-lightSlateGray',
        'bg-lightSteelBlue'];

    term$ = new Subject<string>();

    constructor(
        private _robot: RobotEngineModel,
        public globalVars: GlobalVarsService,
        private _utils: Utils,
        private _components: ComponentsService,
        private _pageService: PageService,
        private _inputService: InputService) {

        this._componentId = 'SELECT-' + this._utils.guid(4, '');
    }

    public ngOnInit() {
        this._setComponentIds();
        this._startComponent();
        this._subscription = this.inputParameters.observe().subscribe(param => {
            this._inputService.loadValueListFromDataRecs(
                this.inputParameters,
                this.inputDataRecs,
                this.inputParameters.valueList,
                this._componentId
            );
        });

        this.tags = this.generateTags(this.inputParameters.value);
        this.term$
            .debounceTime(1000)
            .distinctUntilChanged().subscribe(inputTxt => this.modelChanged(inputTxt));
    }

    public ngOnDestroy() {
        if (this._subscription) {
            this._subscription.unsubscribe();
        }
    }

    private _startComponent() {

        if (!this.control) {
            this.control = new FormControl();
        }

        this._setOriginalValue();

        this.items = this.inputParameters.valueList ? this.inputParameters.valueList.map(elem => elem.value) : [];
        this.inputParameters.value = this._inputService.formatMyValue(
            this.inputParameters.originalValue || this.inputParameters.value,
            false,
            {},
            false,
            this.globalVars.getPageParametersAsArray()
        );
    }

    private _setOriginalValue() {
        if (this.inputParameters.value) {
            this.inputParameters.originalValue = this._utils.cloneJsonParse(this.inputParameters.value);
        }
    }

    private _setComponentIds() {
        this.componentElementsId.component = this._components.getHtmlId(this.inputParameters);
        if (this.inputParameters.icon) {
            this.componentElementsId.icon = this._components.getHtmlId(this.inputParameters, 'input-icon');
        }
        if (this.inputParameters.description) {
            this.componentElementsId.description = this._components.getHtmlId(this.inputParameters, 'input-description')
        }
    }

    modelChanged(inputTxt: any) {
        this.inputParameters.value = inputTxt;
        this.tags = this.generateTags(inputTxt);
        this._robot.findDynamicPropsDependencies(this.inputParameters.id);
        this._components.updatePageParameters(this.inputParameters.parameters);
    }

    public generateTags(inputTxt: string) {
        let tags: HighlightTag[] = [];
        if (!inputTxt) {
            return tags;
        }

        let startIdx = 0;
        const matchedEntities = this._extractEntities(inputTxt);
        matchedEntities.forEach(entity => {
            startIdx = inputTxt.indexOf(this.ENTITY_DELIMITER + entity + this.ENTITY_DELIMITER, startIdx) + 1;
            if (startIdx !== -1) {
                tags.push(this._createTag(entity, startIdx, startIdx + entity.length + 1));
            }
            startIdx += entity.length;
        }
        );

        return tags;
    }

    private _extractEntities(text: string) {
        const parsedEntities = text.match(this.ENTITY_PATTERN_GLOBAL) || new Array();
        let matchedEntities = [];
        let entityStripped;
        parsedEntities.forEach(entity => {
            // remove '[' and ']' at the begin / end
            entityStripped = entity.slice(1, -1);
            if (this.items.indexOf(entityStripped) !== -1) { matchedEntities.push(entityStripped); }
        });
        return matchedEntities;
    }

    private _createTag(item: string, startPosition?: number, endPosition?: number) {
        return {
            indices: {
                start: startPosition,
                end: endPosition ? endPosition : (startPosition ? startPosition + item.length : null)
            },
            cssClass: this._getTagCssClass(item),
            data: { user: { id: item } }
        };
    }

    private _getTagCssClass(item: string): string {
        const itemIdx = this.items.indexOf(item);
        if (itemIdx === -1) {
            return this.TAGS_AVAILABLE_COLORS[0];
        }
        return this.TAGS_AVAILABLE_COLORS[itemIdx % this.NBR_AVAILABLE_COLORS];
    }
}
