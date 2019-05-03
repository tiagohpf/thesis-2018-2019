import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';

import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { ModalService } from 'foundations-webct-palette/components/modalComponent/modal.service';


@Component({
    selector: 'tuplelist-custom-component',
    templateUrl: 'tuplelist.custom.component.html'
})

export class TuplelistCustomComponent implements OnInit, OnDestroy {

    @Input() public propsContext: JsonParams[];
    @Input() public props: JsonParams;
    @Input() public allowCreation: boolean = true;
    @Input() public control: FormControl;

    public tupleInfoForm: FormGroup[] = [];
    public tupleIsDirty: boolean = false;

    public valueControl: string = null;
    public valueHtmlFormat: Object[] = null;

    public list: any[] = [];
    // public fields: any[] = [];

    private _componentId: string;

    constructor(
        private _modalService: ModalService,
        private _robot: RobotEngineModel,
        private _utils: Utils,
        private _globalVars: GlobalVarsService,
        private _fb: FormBuilder,
        private _pageService: PageService) {

        this._componentId = 'TUPLELIST-' + this._utils.guid(4, '');

    }

    public ngOnInit() {

        if (!this.control)
            this.control = new FormControl();

        if (!this.props.readonly) {

            let evaluateValidators = this._pageService.configValidatorsEachParam(this.props, {});
            this.control.setValidators(Validators.compose([evaluateValidators[this.props.id][1], this._validateMyTuples()]));

            if (this.props.valueList) {
                this.props.valueList = this._utils.isObjectType(this.props.valueList, 'Array') ? this.props.valueList : [this.props.valueList];
                if (this.props.value) {
                    this.props.value = this._utils.isObjectType(this.props.value, 'Array') ? this.props.value : [this.props.value];
                    for (let i in this.props.value)
                        this.addNewLine(false, this.props.value[i]);
                    this._loadPropsValue();
                } else {
                    this.props.min = this.props.min || 1;
                    for (let i = 1; i <= this.props.min; i++)
                        this.addNewLine(false);
                }
            }
        } else {
            this.props.value = this.props.value[0] ? this.props.value : [this.props.value];
            this.valueHtmlFormat = this.props.value;
        }
    }

    public ngOnDestroy() {
        this._globalVars.deletePageParametersByGroup(this._componentId);
    }

    public ngDoCheck() {
        for (let i in this.list) {
            for (let ii in this.list[i]) {
                let data = this.list[i].concat(this.propsContext);
                this._robot.changeParameterByDynamicProps(this.list[i][ii], this._utils.arrToObj(data));
            }
        }
        if (!this.props.readonly)
            this._loadPropsValue();
    }

    public addNewLine(loadProps: boolean = true, initValues = null) {

        let pushParams: JsonParams[] = [];
        let arrayPromises: Promise<JsonParams>[] = [];
        for (let i in this.props.valueList) {
            if (this.props.valueList[i] instanceof JsonParams)
                pushParams.push(this.props.valueList[i].clone());
            else
                arrayPromises.push(this._robot.loadPageParams(Object.assign({}, this.props.valueList[i]), this._componentId));
        }

        if (arrayPromises.length > 0) {
            Promise.all(arrayPromises).then(res => {
                pushParams = res;
                this._addNewLine(pushParams, loadProps, initValues);
            });
        } else
            this._addNewLine(pushParams, loadProps, initValues);
    }
    public removeLine(l) {

        if (!this.tupleInfoForm[l].dirty && this.tupleInfoForm[l].touched) {
            this.list.splice(l, 1);
            this.tupleInfoForm.splice(l, 1);
            this.props.value.splice(l, 1);
        } else {
            this._modalService.openModal("programs/program-import-from-google-docs", this.props.parameters, this._utils.arrToObj(this._globalVars.getPageParametersAsArray()), this.props);
           
        }

        if (this.list.length == 0)
            this.addNewLine(false);

        this._loadPropsValue();
        //}
        //Fazer pedido de delete á BD caso diga sim

    }
    public loadTupleName(id: string) {
        let tuple = this.props.valueList.find((obj) => { return obj.id == id; });
        return tuple ? tuple.text : id;
    }

    private _addNewLine(pushParams: JsonParams[], loadProps: boolean = true, initValues = null) {

        if (initValues)
            for (let i in pushParams)
                pushParams[i].value = initValues[pushParams[i].id];

        this.list.splice(0, 0, pushParams);
        this.tupleInfoForm.splice(0, 0, this._fb.group({}));

        if (loadProps) {
            //this.tupleIsDirty = loadProps;
            this._loadPropsValue();
        }
    }

    private _loadPropsValue() {
        let tempVal: any = this.allowCreation ? [] : {};
        let tempObj = {};
        let index = 0;
        for (let l in this.list) {
            tempObj = this._utils.arrToObj(this.list[l]);

            for (let o in tempObj) {
                if (this._utils.findObjectInArray(this.list[l], o, 'id').hidden)
                    delete tempObj[o];

                tempObj['indice'] = this.list.length - (index + 1);
                //tempObj['isDirty'] = true;
            }
            if (this.allowCreation)
                tempVal.splice(0, 0, tempObj);
            else
                tempVal = tempObj;

            index++;
        }
        this.props.value = tempVal;
        this.valueControl = this.props.value ? '*'.repeat(this.tupleInfoForm.filter(obj => obj.valid).length) : null;

        this.valueHtmlFormat = this.allowCreation ? this.props.value : [this.props.value];

        if (this.tupleIsDirty) {
            this.control.markAsTouched();
            this.control.markAsDirty();
            this.control.updateValueAndValidity();
        }

    }

    private _validateMyTuples() {
        return (control: AbstractControl): { [key: string]: any } => {
            return !!this.tupleInfoForm.find((obj) => { return obj.status == 'INVALID'; }) ? { [this.props.id]: true } : null;
        };
    }

    private onSave(){
        
    }
}