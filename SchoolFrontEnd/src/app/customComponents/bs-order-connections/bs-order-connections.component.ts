import { Component, OnInit, Input, OnDestroy, EventEmitter } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { JsonParams, newEvent } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { Connection } from '../../designerFlow/drag-component/drag-component.component';
import { RobotEngineModel } from 'foundations-webct-robot/robot/robotEngineModel';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';

@Component({
  selector: 'app-bs-order-connections',
  templateUrl: './bs-order-connections.component.html',
  styleUrls: ['./bs-order-connections.component.scss']
})
export class BsOrderConnectionsComponent implements OnInit, OnDestroy {

  @Input() public inputParameters: JsonParams;

  public connectionNameParamId: any;

  private _componentId: string;
  private _configParam: JsonParams;

  private _newEvent: EventEmitter<newEvent[]>;

  constructor(
    private _robot: RobotEngineModel,
    private _globalVars: GlobalVarsService,
    private _utils: Utils) {
    this._componentId = 'ORDERCONN-' + this._utils.guid(4, '');
  }

  /**
   * Devolve o nome actualizado da Connection que está a ser editada
   * @param conn é cada uma das connections que estão a ser ordenadas
   */
  public connectionName = (conn: Connection) => this.connectionNameParamId && this.connectionNameParamId.id == conn.id ? this.connectionNameParamId.name : conn.dataRecs.name;

  public ngOnInit() {
    if (this.inputParameters.value) {
      this.inputParameters.value.forEach(obj => {
        obj.dataRecs = obj.dataRecs || new Object();
        obj.dataRecs.priority = obj.dataRecs.priority || 0;
        obj.dataRecs.isDefault = obj.dataRecs.isDefault || false;
      });
      // Ordena a listagem de conecções pela priority
      this.inputParameters.value.sort((a, b) => a.dataRecs.priority - b.dataRecs.priority);
    }
    this._setConfigParam();
    this._evaluateDependencies();

    this._newEvent = this.inputParameters.newEvent().subscribe(data => this._handleEvent(data));
  }

  public ngOnDestroy() {
    this._globalVars.deletePageParametersByGroup(this._componentId);
  }

  /**
   * Quando um elemento é largado numa nova posição
   * @param event CdkDragDrop
   */
  public drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.inputParameters.value, event.previousIndex, event.currentIndex);
  }

  /**
   * Alteração da informação default de uma coneccção
   * @param conn conecção onde se pretende alterar a informação default
   */
  public setDefault(conn: Connection) {
    conn.dataRecs.isDefault = !conn.dataRecs.isDefault;
    this.inputParameters.value.forEach(obj => {
      if (obj.id != conn.id)
        obj.dataRecs.isDefault = false
    });
    this._evaluateDependencies();
  }

  /**
   * Criação de parâmetro auxiliar
   */
  private _setConfigParam() {
    this._configParam = new JsonParams('config::' + this.inputParameters.id, new Object());
    this._globalVars.setPageParameters(this._configParam, this._componentId);
  }

  /**
   * Guarda se existe, ou não, uma connecção default dentro da listagem de conecções
   */
  private _saveDefaultConfig() {
    this._configParam.value.hasDefault = !!this.inputParameters.value.find(obj => obj.dataRecs.isDefault === true);
  }

  /**
   * Actualiza configuração e avalia componentes dependentes
   */
  private _evaluateDependencies() {
    this._saveDefaultConfig();
    this._robot.findDynamicPropsDependencies(this.inputParameters.id);
  }

  /**
   * Trata os eventos que chegam ao componente
   * @param data é o array de eventos que foram emitidos
   */
  private _handleEvent(data: newEvent[]) {
    data.forEach(event => {
      if (event.key == 'updateConnectionName' && event.value)
        this.connectionNameParamId = event.value;
    });

  }

}
