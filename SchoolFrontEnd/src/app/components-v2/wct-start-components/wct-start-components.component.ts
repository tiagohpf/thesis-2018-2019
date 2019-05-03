import { Component, NgModule, Input, Output, EventEmitter, forwardRef, SimpleChange, OnInit, DoCheck, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';

import { ApiService } from 'foundations-webct-robot/robot/services/api.service';
import { ComponentsService } from 'foundations-webct-robot/robot/services/components.service';
import { ToggleElementsService } from 'foundations-webct-robot/robot/services/toggle-elements.service';

declare let FUXI: any;

@Component({
    selector: 'app-wct-start-components',
    templateUrl: './wct-start-components.component.html',
    styleUrls: ['./wct-start-components.component.css']
})
export class WctStartComponentsComponent implements OnInit, DoCheck, OnDestroy {

    @Input() public viewStructure: JsonParams;
    @Input() public inputParameters: JsonParams[];
    @Input() public inputParametersContext: JsonParams[];
    @Input() public inputDataRecs: Object;
    @Input() public baseInfoForm: FormGroup;
    @Input() public dataRecs: any;

    @Input() public filterDateInterval: any;
    @Input() public fromDefault: any;
    @Input() public toDefault: any;

    @Input() public componentIndex: number = -1;
    @Input() public loadingFromModal: boolean = false;
    @Input() public loadingFromTable: boolean = false;
    @Input() public rowIndex: number = -1;
    @Input() public parametersFormat: boolean = true;

    @Output() public baseInfoFormChange: EventEmitter<any> = new EventEmitter();

    public groupDataRecs: Object[] = [];
    public dataRecsNoContent: any = null;

    private _componentId: string;
    private _myTrueComponents: JsonParams[] = []; // IDs dos componentes que são instanciados directamente pelo componente showParametersByType

    constructor(
        private _pageService: PageService,
        private _components: ComponentsService,
        private _toggle: ToggleElementsService,
        private _robot: RobotEngineModel,
        private _utils: Utils,
        private _apiService: ApiService,
        private _globalVars: GlobalVarsService,
        private _http: HttpClient,
        private _router: Router,
        private _fb: FormBuilder) {

        this._componentId = 'SHOWBYTYPE-' + this._utils.guid(4, '');

    }

    public getHtmlElementId = (param: JsonParams, type?: string) => this._components.getHtmlId(param, type);
    public getGroupParamsStatus = (id: string): boolean => {
        let status = this._toggle.getGroupParamsStatus(id);
        if (status === undefined) {
            this._toggle.toggleGroupParamsStatus(id);
            return true;
        }
        return status === undefined ? true : status;
    }

    public ngOnInit() {

        let formAsControls = this.baseInfoForm && Object.keys(this.baseInfoForm.value).length > 0;
        if (!this.baseInfoForm || !formAsControls) {
            this.baseInfoForm = this._pageService.configValidators(this.inputParameters, false, this.componentIndex);
            if (!formAsControls)
                this.baseInfoFormChange.emit(this.baseInfoForm);
        }


        if (!this.loadingFromTable && this.inputParameters && this.inputParameters.length > 0) {
            for (let param of this.inputParameters) {
                this._globalVars.setPageParameters(param, this._componentId);
                if (['initParameters', 'initTable', 'initCards'].indexOf(param.type) >= 0)
                    continue;

                if (param.groups && param.groups.urlResource)
                    this._startParameterRequest(param);
                else
                    this._robot.evaluateParamValues(param, [this.dataRecs, this.inputDataRecs]);
                this._myTrueComponents.push(param);
            }
        }

        this._evaluateTableObjectValue();
        this._evaluateGroupsDataRecs();

        let apiComponents: JsonParams[] = this._getComponentsWithApi();
        this._observeFilter(apiComponents);
        this._observeRefresh(apiComponents);

    }

    public ngOnDestroy() {
        this._globalVars.deletePageParametersByGroup(this._componentId);
        if (this.viewStructure && ['initTable', 'initCards'].indexOf(this.viewStructure.type) < 0)
            this._globalVars.removeFilterSubscriber(this.viewStructure);
    }

    public ngDoCheck() {
        for (let i in this.inputParameters) {

            if (!this.baseInfoForm.controls[this.inputParameters[i].id])
                this.baseInfoForm.controls[this.inputParameters[i].id] = new FormControl()

            // if (this.baseInfoForm.controls[this.inputParameters[i].id]) {
            if (this.inputParameters[i].hidden || this.inputParameters[i].disabled) {
                this.baseInfoForm.controls[this.inputParameters[i].id].disable();
                // this.baseInfoForm.controls[this.inputParameters[i].id].reset();
            } else if (this.baseInfoForm.controls[this.inputParameters[i].id].disabled) {
                this.baseInfoForm.controls[this.inputParameters[i].id].enable();
                // this.baseInfoForm.controls[this.inputParameters[i].id].reset();
            }
            // }
        }
    }

    public showComponentByIdEmited(elementId: string, components: JsonParams[]) {
        for (let i in components) {
            if (components[i].id === elementId)
                components[i].lazyLoading = false;
            components[i].hidden = !(components[i].id === elementId);
        }
    }

    public searchOnList(e, list) {
        list.map(obj => obj.hidden = obj.text.toLowerCase().indexOf(e.target.value.toLowerCase()) < 0);
    }

    public getErrors(id: string) {
        if (this.baseInfoForm.controls[id])
            return this.baseInfoForm.controls[id].errors;
        return null;
    }

    public makeFilter(parameter: JsonParams, filter: string | object) {
        filter = typeof filter == 'object' ? filter : JSON.parse(filter);
        this._startParameterRequest(parameter, filter);
    }

    public groupNavigate(e, route: string, toggleId: string) {
        if (route)
            this._utils.navigate(route, this.dataRecs, e);
        else
            this._toggle.toggleGroupParamsStatus(toggleId);
    }

    public isComponentActive = (name: string): boolean => this._globalVars.getActiveComponent(name);
    public isGroupVisible = (group: JsonParams): boolean => {
        return !!group.hidden || !group.parameters.find(gParam => {
            if (gParam.type == 'initParameters' && gParam.groups.details)
                return !!gParam.groups.details.parameters.find(dParam => !dParam.hidden)
            return !gParam.hidden;
        })
    }

    private _startParameterRequest(parameter: JsonParams, filter: Object = null) {

        parameter.lazyLoading = true;

        let urlResourceConfig = parameter.groups.urlResource.parameters;
        let formatedUrl = this._pageService.startApiConfiguration(urlResourceConfig, this.inputDataRecs);

        let forkJoin = this._utils.findObjectInArray(urlResourceConfig, 'forkJoin').value;
        if (forkJoin) {
            let forkJoinUrl = [];
            let forkJoinRequests = [];
            for (let i in forkJoin) {
                forkJoinUrl[i] = this._pageService.startApiConfiguration(forkJoin[i], this.inputDataRecs);
                forkJoinRequests[i] = this._utils.GetAll(this._pageService.setMyUrlResource(parameter, forkJoinUrl[i], {}, null, this.inputDataRecs, filter), forkJoinUrl[i].headers);
            }
            Observable.forkJoin(forkJoinRequests).subscribe((data) => {
                let forkJoinData = {};
                for (let i in data)
                    forkJoinData[forkJoinUrl[i]['id'] || i] = data[i];
                let dataIndex = 0;
                for (let i in forkJoinData) {
                    forkJoinData[i]['_componentId'] = this._componentId;
                    this._pageService.fillData(parameter, forkJoinData[i], this.inputDataRecs, forkJoinUrl[dataIndex], dataIndex, [], forkJoinData);
                    dataIndex++;
                }
                parameter.lazyLoading = false;
                this._globalVars.setPageParameters(parameter, this._componentId);
                this._pageService.updateFuxiView();
            },
                error => {
                    this.dataRecsNoContent = error;
                });
        } else {

            parameter.value = parameter.pathToValue ? null : parameter.value;
            parameter.valueList = parameter.pathToValueList ? null : parameter.valueList;

            let recycleApi = this._apiService.getApiRecycle(formatedUrl.id);
            if (recycleApi)
                this._dealWithParamApi(parameter, recycleApi, formatedUrl, urlResourceConfig);
            else {
                this._utils
                    .GetAll(this._pageService.setMyUrlResource(parameter, formatedUrl, {}, null, this.inputDataRecs, filter), formatedUrl.headers, formatedUrl, this._componentId)
                    .subscribe((data) => {
                        this._dealWithParamApi(parameter, data, formatedUrl, urlResourceConfig);
                    },
                        error => {
                            this.dataRecsNoContent = error;
                            // this._dealWithParamApi(parameter, error, formatedUrl, urlResourceConfig);
                            parameter.lazyLoading = false;
                        });
            }

        }
    }

    private _dealWithParamApi(parameter: JsonParams, data: Object, formatedUrl: Object, urlResourceConfig: JsonParams[]) {
        this.dataRecs = data;
        urlResourceConfig['_componentId'] = this._componentId;
        this._pageService.fillData(parameter, data, this.inputDataRecs, formatedUrl);
        this._globalVars.setPageParameters(parameter, this._componentId);
        parameter.lazyLoading = false;
        this._pageService.updateFuxiView();
    }

    private _evaluateGroupsDataRecs() {
        if (this.groupDataRecs && this.groupDataRecs.length == 1)
            this.inputParameters[0] = this._evaluateGroupAttr(this.inputParameters[0], this.groupDataRecs[0]);
        else if (this.inputParameters && this.inputParameters.length == 1 && this.inputParameters[0].type == 'groupParameters' && this.inputParameters[0].subType == 'duplicateGroup') {
            let cloneObj: JsonParams = this.inputParameters[0];
            this.groupDataRecs = this.dataRecs && this.dataRecs[0] ? this.dataRecs : [this.dataRecs];
            this.inputParameters = [];
            for (let i in this.groupDataRecs)
                this.inputParameters.push(this._evaluateGroupAttr(cloneObj.clone(), this.groupDataRecs[i]));
        }
    }
    private _evaluateGroupAttr(props: JsonParams, data: Object): JsonParams {
        props.id = this._utils.replaceTagVars(props.id, data);
        props.text = this._utils.replaceTagVars(props.text, data);
        return props;
    }

    public _evaluateTableObjectValue() {

        if (!this.loadingFromTable || this.rowIndex < 0)
            return;

        let param = this.inputParameters[0];
        let paramOriginalId = param.id.replace(this._utils.uniqIdRegex, '');

        param.value = param.pathToValue !== undefined ? this._utils.findValues([paramOriginalId], this.dataRecs) : undefined;
        param.valueList = param.pathToValueList !== undefined ? this._utils.findValues([paramOriginalId], this.dataRecs) : undefined;

        this._robot.changeParameterByDynamicProps(param, this.dataRecs);
    }

    private _getComponentsWithApi(): JsonParams[] {
        let ids: JsonParams[] = [];
        for (let param of this._myTrueComponents) {
            if (!param.groups.urlResource || !param.groups.urlResource.parameters && ['initTable', 'initCards'].indexOf(param.type) < 0)
                continue;
            ids.push(param);
        }
        return ids;
    }

    private _observeFilter(apiComponents: JsonParams[]) {

        if (this._getComponentsWithApi().length == 0 || this.viewStructure.data.hasFilterObserver)
            return;

        this.viewStructure.data = { hasFilterObserver: true };
        this._globalVars.getFilterById(this.viewStructure).subscribe(filters => {
            for (let id in filters) {
                let filterParam = this._utils.findObjectInArray(this._myTrueComponents, id, 'id');
                if (filterParam.id != id)
                    continue;
                this.makeFilter(filterParam, filters[id]);
            }
        });
    }

    private _observeRefresh(apiComponents: JsonParams[]) {

        apiComponents.forEach(param => {
            if (param.data.hasRefreshObserver)
                return;

            param.data = { hasRefreshObserver: true };
            param.observeRefresh().subscribe(elem => this._startParameterRequest(elem));
        });
    }

}
