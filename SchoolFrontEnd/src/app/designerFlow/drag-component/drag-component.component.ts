import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, HostListener, OnDestroy, DoCheck } from '@angular/core';
import { CdkDragDrop, CdkDragMove, CdkDragStart, CdkDragEnd, CdkDrag } from '@angular/cdk/drag-drop';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { JsonParams, newEvent } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { GlobalVarsService } from 'foundations-webct-robot/robot/utils/global-vars.service';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';
import { ConfigurationService } from 'foundations-webct-robot/robot/utils/configuration.service';
import { ModalService } from 'foundations-webct-palette/components/modalComponent/modal.service';
import { WctNotificationService } from "../../components-v2/wct-notification/wct-notification.service";
import { INotificationOptions } from "../../components-v2/wct-notification/wct-notification.component";

@Component({
  selector: 'app-drag-component',
  templateUrl: './drag-component.component.html',
  styleUrls: ['./drag-component.component.scss'],
  host: {
    // '(document:keyup)': '_onKeyUp($event)',
    '(document:mousemove)': '_mouseMove($event)'
  }
})

export class DragComponentComponent implements OnInit, OnDestroy, DoCheck {

  @Input() public inputParameters: JsonParams;

  @ViewChild('svgcanvas') svgcanvas: ElementRef;
  @ViewChild('canvasParent') canvasParent: ElementRef;
  @ViewChild('chatbotComponent') chatbotComponent: ElementRef;

  public pallete: Shape[] = new Array();
  public apis: Shape[] = new Array();
  public shapes: Shape[] = new Array();
  public connections: Connection[] = new Array();

  public tryMode: boolean = false;
  public canConnect: boolean = false;
  public lineAngle: number = -8;

  public selectedConnections: Connection[] = new Array();
  public selectedIntents: any[] = new Array();
  public selectedShapes: Shape[] = new Array();

  public isConnectionAnimationStopped: boolean = false;

  public componentIsReady: boolean = false;

  /**
   * Host para realização de operações de Importar / Exportar
   */
  private _programId: string;
  private _programByAction: boolean = false;
  private _entity: string;
  private _endpoint: string;

  private _copiedShapes: Shape[] = new Array();
  private _svgClicked: boolean = false;

  private _optionTypes: string[] = ['annotation'];

  private _mousePosition = { x: 0, y: 0 };
  private _shapesLimitToConnect: number = 2;
  private _getNewShapeId: IterableIterator<number>;
  private _getNewConnectionId: IterableIterator<number>;

  private _svgCanvasElementPosition: DOMRect;

  private _placeholderShape: Shape = null;

  private _chatComponent: HTMLElement;
  private _newEvent: EventEmitter<newEvent[]>;

  private _configParam: JsonParams;
  private _componentID: string;

  private _notificationOptions: INotificationOptions = {
    positionClass: 'top-right'
  };

  private _canvasSize = {
    x: 0,
    y: 0
  };

  constructor(
    private _http: HttpClient,
    private _globalVars: GlobalVarsService,
    private _config: ConfigurationService,
    private _modal: ModalService,
    private _notification: WctNotificationService,
    private _utils: Utils) {
    this._componentID = 'DRAG-' + this._utils.guid(4, '');
  }

  /**
   * Devolve a cor, dependendo do estado, de uma Conecção
   * @param conn Conecção
   */
  public svgColor = (conn: Connection) => conn.isHighlighted ? '#eb00fb' : conn.isSelected ? '#eb00fb' : conn.isSuggestion ? '#e5e5e5' : '#000';

  /**
   * Verifica se uma Conecção é de um determinado sub-tipo
   * @param conn Conecção
   * @param strArr Array de Sub-tipos que se pretendem validar
   */
  public connHasSubType = (conn: Connection, ...strArr: string[]): boolean => strArr.filter(str => conn.subType && conn.subType.indexOf(str) >= 0).length > 0;

  /**
   * Verifica se uma determinada Shape é uma opção de uma Shape principal
   * @param shape Shape que queremos validar
   */
  public isOptionShape = (shape: Shape) => this._optionTypes.indexOf(shape.type) >= 0;

  /**
   * Verifica se uma determinada Connection faz a ligação entre uma Shape principal e uma secundária
   * @param connection Conecção que queremos validar
   */
  public isOptionConnection = (connection: Connection) => this._optionTypes.indexOf(connection.subType) >= 0;

  public ngOnInit() {

    this._endpoint = this._config.getEndpoint('SchoolBE');
    this._programId = this._globalVars.urlParams['programID'];
    this._entity = (this.inputParameters.subType || 'program').toUpperCase();

    this._newEvent = this.inputParameters.newEvent().subscribe(data => this._handleEvent(data));

    this._createConfigParam();
    this._addChatComponentToBody();

    this.toggleFullScreen('show');
    this._loadProgramDetails();
  }

  public ngOnDestroy() {
    this._cleanComponentData();
  }

  public ngDoCheck() {
    this._loadCanvasPosition();
  }

  public toggleFullScreen(forceStatus?: 'show' | 'hide') {

    if (!this.inputParameters.class)
      this.inputParameters.class = '';

    let fullScreenClass = 'full-screen';
    let isFullScreen = this.inputParameters.class.indexOf(fullScreenClass) >= 0;

    if ((forceStatus == 'show' && isFullScreen) || (forceStatus == 'hide' && !isFullScreen))
      return;

    if (forceStatus == 'hide' || isFullScreen)
      this.inputParameters.class = this.inputParameters.class.replace(' ' + fullScreenClass, '');
    else if (forceStatus == 'show' || !isFullScreen)
      this.inputParameters.class += ' ' + fullScreenClass;
  }

  /**
   * Este método faz toggle da animação das connections
   */
  public toggleConnectionsMovement() {
    this.isConnectionAnimationStopped = !this.isConnectionAnimationStopped;
  }

  /**
   * Quando um elemento é "largado" no quadro, adiciona-se uma nova Shape ao array "this.shapes"
   * @param event CdkDragDrop event
   */
  public drop(event: CdkDragDrop<string[]>, shapes: Shape[]) {

    if (this.readOnly())
      return;

    let shape: Shape = <Shape>this._utils.cloneJsonParse(shapes[event.previousIndex]);
    shape.text = this._getUniqShapeName(shape.text || shape.type);
    shape.dataRecs = shape.dataRecs || new Object();

    this._setShapeId(shape);
    this.shapes.push(shape);

    let offset = new DOMRect();
    offset.width = shape.pos.w;
    offset.height = shape.pos.h;
    offset.y = this._mousePosition.y - (shape.pos.h / 2);
    offset.x = this._mousePosition.x - (shape.pos.w / 2);

    this._savePositionOnShape(event.item.element.nativeElement, shape, offset);
  }

  /**
   * Quando se arrasta uma Shape
   * @param event CdkDragMove event
   * @param item Shape que está a ser arrastada
   */
  public dragging(event: CdkDragMove, item: Shape) {

    let selectedShapes = this._getSelectedShapes().filter(obj => obj.id != item.id);
    if (selectedShapes.length > 0) {
      selectedShapes.forEach(shape => {

        let x = shape.pos.initX + (item.pos.x - item.pos.initX);
        let y = shape.pos.initY + (item.pos.y - item.pos.initY);

        shape.pos.x = x >= 0 ? x : 0;
        shape.pos.y = y >= 0 ? y : 0;
        this._updateLine(shape);
      });
    }
    this._savePositionOnShape(event.source.element.nativeElement, item)
    this._updateLine(item);
  }

  /**
     * Quando se inicia o drag de uma Shape, guarda a posição original de todas as Shapes seleccionadas
     * @param event CdkDragMove event
     * @param item Shape que está a ser arrastada
     */
  public startingDragging(event: CdkDragStart, item: Shape) {
    if (item.isSelected == 0) {
      this._unselectShapes();
    }
    this._getSelectedShapes().forEach(obj => {
      obj.pos.initX = obj.pos.x;
      obj.pos.initY = obj.pos.y;
    });
  }

  /**
   * Selecciona uma Shape
   * @param event MouseEvent
   * @param item Shape que se pretende seleccionar
   */
  public selectShape(event: MouseEvent, item: Shape) {

    this._closeChat();

    if (this._getSelectedShapes().findIndex(obj => obj.type == 'placeholder') >= 0)
      return;

    if (/* this.isOptionShape(item) ||  */event.target['classList'] && event.target['classList'].value.indexOf('shape-input') >= 0) {
      this._unselectShapes();
      return;
    }

    // AO seleccionar uma Shape do tipo 'dot', selecciona toda a linha
    // if (item.type == 'dot') {
    //   this.selectConnection(event, this.connections.find(obj => obj.shapes.to.id == item.id));
    //   return;
    // }

    // Toggle caso Shape já estiver seleccionada
    if (item.isSelected) {
      if (!event.ctrlKey && !event.shiftKey) {
        this._unselectShapes(item);
        this._unselectConnections();
      } else {
        item.isSelected = 0;
      }

      this._createSuggestion();
      this._setShapeQuickView();

      return;
    }

    // Permite seleccionar várias Shapes e vários Connectors ao mesmo tempo (usando os botões CTRL ou SHIFT)
    if (!event.ctrlKey && !event.shiftKey) {
      this._unselectShapes(item);
      this._unselectConnections();
    }

    item.isSelected = this._getNextSelectedShape();

    this.canConnect = this._canConnect();
    this._createSuggestion();

    this._setShapeQuickView();
  }

  /**
   * Selecciona uma Conecção
   * @param event MouseEvent
   * @param connection Conecção que se pretende seleccionar
   */
  public selectConnection(event: MouseEvent, connection: Connection) {
    // debugger;
    if (this.isOptionConnection(connection))
      return;

    if (connection.isSelected) {
      if (!event.ctrlKey && !event.shiftKey) {
        this._unselectShapes();
        this._unselectConnections(connection);
      } else {
        connection.isSelected = false;
      }

      this._selectConnectionDots(connection);

      this._setConnectionQuickView();

      return;
    }
    connection.isSelected = !connection.isSelected;

    // Permite seleccionar várias Shapes e vários Connectors ao mesmo tempo (usando os botões CTRL ou SHIFT)
    if (!event.ctrlKey && !event.shiftKey) {
      this._unselectShapes();
      this._unselectConnections(connection);
    }

    this._selectConnectionDots(connection);
    // this._toggleForm();

    this._setConnectionQuickView();
  }

  /**
   * Adiciona a uma Conecção, um novo ponto
   * @param connection Connection onde se pretende adicionar um novo ponto
   */
  public addPointToLine(connection: Connection) {

    if (this.readOnly() || this.isOptionConnection(connection))
      return;

    let shape: Shape = {
      type: 'dot'
    };
    this._setShapeId(shape);
    this.shapes.push(shape);

    let offset = new DOMRect();
    offset.width = 10;
    offset.height = 10;
    offset.y = this._mousePosition.y - (offset.width / 2);
    offset.x = this._mousePosition.x - (offset.height / 2);

    this._savePositionOnShape(null, shape, offset);
    this.connections.splice(this.connections.findIndex(obj => obj.id == connection.id), 1);

    let lines = new Array(
      this._drawLine(connection.shapes.from, shape, this._connSubType(connection.shapes.from, shape), false, connection.connectedTo || connection.id),
      this._drawLine(shape, connection.shapes.to, this._connSubType(shape, connection.shapes.to), false, connection.connectedTo || connection.id)
    );

    lines.forEach(obj => obj.lineAngle = connection.lineAngle);

    if (connection.intent && connection.intent.pos) {
      lines.filter(line => line.intent !== undefined).forEach(line => {

        if (connection.intent.name) {
          line.intent.name = connection.intent.name;
          line.intent.friendlyName = connection.intent.friendlyName;
        }

        line.dataRecs = this._utils.cloneJsonParse(connection.dataRecs);

        // Guarda a Shape final
        let lastConnOfType = this.connections.find(obj => obj.subType == 'fromDot' && obj.connectedTo == line.connectedTo);
        if (lastConnOfType)
          line.shapes.last = lastConnOfType.shapes.to;
      });
    }
    // this.connections.forEach(obj => obj.isSelected = false);
    this._unselectConnections();
    this._unselectShapes();
  }

  /**
   * Ao clicar no elemento SVG, todos os elementos são desceleccionados
   * @param event MouseEvent
   */
  public svgClick(event: MouseEvent) {

    this._closeChat();
    this._deletePlaceholderShape();
    this._deleteSuggestions();

    let path = event['path'] || new Array();
    if (path.findIndex(elem => elem.classList && elem.classList.value.indexOf('svg-element') >= 0) < 0) {
      this._unselectShapes();
      this._unselectConnections();
    }

    this.canConnect = this._canConnect();
    // this._toggleForm();
  }

  /**
   * Cria uma nova Shape e respectiva Conecção no click de uma das opções
   * @param shape Shape de onde se inicia a ligação
   */
  public createNewConnection(shape: Shape) {

  }

  /**
   * Início do "drag" de uma nova ligação
   * @param event CdkDragStart event
   * @param item Shape de onde se inicia a ligação
   */
  public startingNewConnection(event: CdkDragStart, item: Shape) {
    this._placeholderShape = {
      type: 'placeholder',
      connectedTo: item.id,
      pos: {
        w: 10,
        h: 10,
        x: this._mousePosition.x,
        y: this._mousePosition.y
      },
      dataRecs: {
        originalDotElement: event.source
      }
    };

    this._setShapeId(this._placeholderShape);
    this.shapes.push(this._placeholderShape);

    this._drawLine(item, this._placeholderShape, null, true);
  }

  /**
   * "drag" de uma nova ligação
   * @param event CdkDragMove event
   * @param item Shape de onde se inicia a ligação
   */
  public draggingNewConnection(event: CdkDragMove, item: Shape) {

    if (!this._placeholderShape)
      return;

    this._savePositionOnShape(event.source.element.nativeElement, this._placeholderShape)
    this._updateLine(this._placeholderShape);
  }

  /**
   * Detecta onde terminou o "drag" e, se for em cima de uma Shape existente, cria uma ligação entre as duas;
   * Se o "drag" terminou fora de qualquer Shape, dá ao utilizador a opção de criar uma nova Shape ou, cancelar a acção;
   * @param event CdkDragEnd event
   * @param item Shape de onde se inicia a ligação
   */
  public endingNewConnection(event: CdkDragEnd, item: Shape) {

    let mousePositionY = this._mousePosition.y - this._svgCanvasElementPosition.y;
    let mousePositionX = this._mousePosition.x - this._svgCanvasElementPosition.x;

    let hoverShape = this.shapes.find(obj => obj.type != 'placeholder' && (mousePositionY > obj.pos.y && mousePositionY < obj.pos.y + obj.pos.h) && (mousePositionX > obj.pos.x && mousePositionX < obj.pos.x + obj.pos.w));
    if (hoverShape) {
      this._updateShapeTargets(item, hoverShape);
      let line = this._drawLine(item, hoverShape);
      this._deletePlaceholderShape();
      if (line)
        this.openModalSetIntent(line, true);
    } else
      this._placeholderShape.isSelected = this._getNextSelectedShape();
  }

  /**
   * Cria uma nova Shape, ou cancela, quando arrastamos uma linha para um espaço em branco
   * @param item é a Shape de onde é arrastado o ponto
   * @param option é o tipo de Shape que queremos criar
   */
  public setShapeForNewConnection(item: Shape, option?: Shape) {

    if (!option) {
      this._deletePlaceholderShape();
      return;
    }

    let newShape = Object.assign({}, option);

    newShape.text = this._getUniqShapeName(newShape.text || newShape.type);
    newShape.pos.y = this._placeholderShape.pos.y;
    newShape.pos.x = this._placeholderShape.pos.x;

    this._setShapeId(newShape);
    this.shapes.push(newShape);

    let originShape = this.shapes.find(obj => obj.id == this._placeholderShape.connectedTo);

    this._updateShapeTargets(originShape, newShape);
    let line: Connection = this._drawLine(originShape, newShape);
    this._deletePlaceholderShape();
    this.openModalSetIntent(line, true);
  }

  /**
   * Cria uma Conecção entre as duas Shapes seleccionadas
   */
  public connectShapes() {
    let selectedShapes = this._getSelectedShapes();
    this._deleteSuggestions();
    this._updateShapeTargets(selectedShapes[0], selectedShapes[1]);
    let line = this._drawLine(selectedShapes[0], selectedShapes[1], this._connSubType(selectedShapes[0], selectedShapes[1]));

    this._unselectShapes();

    if (line)
      this.openModalSetIntent(line, true);
  }

  /**
   * Valida se é possível Exportar dados do Diagrama
   */
  public canExport = (): boolean => this.shapes.length > 0;

  /**
   * Exporta dados do Diagrama
   */
  public export(): Promise<any> {

    if (!this.canChange()) {
      console.log('Component cannot be saved!!');
      if (!this.componentIsReady)
        console.error('WARNING: Component is not ready!!');
      return;
    }

    return new Promise((resolve, reject) => {
      this._removeHighlightItems();

      let body = {
        id: this._programId,
        flow: {
          shapes: this.shapes,
          connections: this.connections
        }
      };

      this._http.put(this._endpoint + '/designer/flow', body, this._httpHeaders())
        .subscribe(
          data => {
            this._notification.notify('success', 'warnings___success', 'success___saveDesignFlow');
            resolve(data);
          },
          error => {
            this._notification.notify('error', 'warnings___error', 'errors___saveDesignFlow');
            reject(error);
          }
        );
    });

  }

  /**
   * Alteração do angulo de uma Connection
   * @param ang é o valor do ângulo pretendido
   */
  public changeAngle(ang?: number) {
    this._getSelectedConnections().forEach(obj => {
      obj.lineAngle = ang;
      this._updateIntentPosition(obj);
    });
  }

  /**
   * Executa operação de Learn
   */
  public learnProgram(isTry: boolean = false) {

    if (!this.canChange())
      return;

    return new Promise((resolve, reject) => {

      let body = {
        requestedBy: localStorage.getItem('logged-user'),
        learn: isTry ? false : true,
        parse: isTry ? true : false,
        deploy: isTry ? true : false
      };

      this._http.post(this._endpoint + `/program/${this._programId}/learnDraft`, body, this._httpHeaders())
        .subscribe(
          data => {
            this._notification.notify('success', 'warnings___success', 'success___learnProgram');
            resolve(data);
          },
          error => {
            this._notification.notify('error', 'warnings___error', 'errors___learnProgram');
            reject(error);
          }
        );

    });
  }

  /**
   * Valida se é possível Importar dados para o Diagrama
   */
  public canImport = (): boolean => true/* localStorage.shapes && localStorage.connections */;

  /**
   * Importa dados para o Diagrama
   */
  public import(): Promise<any> {

    return new Promise((resolve, reject) => {

      this._http.get(this._endpoint + '/designer/flow/' + this._programId + '?entity=' + this._entity, this._httpHeaders())
        .subscribe(
          data => {

            // TODO: Este código está a fazer reset aos IDs das Connections para garantir que programs antigos têm as Connections com IDs únicos - Podemos retirar isto quando for para produção
            this._getNewConnectionId = getNewConnectionId(this.connections);

            this.shapes = data['shapes'] || new Array();
            this.connections = data['connections'] || new Array();

            // this.shapes.forEach(obj => {

            //   if (obj.type == 'start') {
            //     obj.pos.w = 65;
            //     obj.pos.h = 65;
            //   } else if (obj.type == 'api') {
            //     obj.pos.w = 85;
            //     obj.pos.h = 62;
            //   } else if (obj.type == 'process') {
            //     obj.pos.w = 85;
            //     obj.pos.h = 54;
            //   }

            // });

            this.connections.forEach(conn => {
              conn.shapes.from = this.shapes.find(shape => shape.id == conn.shapes.from.id);
              conn.shapes.to = this.shapes.find(shape => shape.id == conn.shapes.to.id);
              // TODO: Este código está a fazer reset aos IDs das Connections para garantir que programs antigos têm as Connections com IDs únicos - Podemos retirar isto quando for para produção
              // this._setConnectionId(conn);
            });

            // TODO: Este código está a fazer reset aos IDs das Connections para garantir que programs antigos têm as Connections com IDs únicos - Podemos retirar isto quando for para produção
            // this.connections.filter(conn => conn.subType == 'toDot').forEach(conn => {
            //   this.connections.filter(obj => obj.connectedTo == conn.connectedTo).forEach(obj => obj.connectedTo = conn.id);
            // });

            this._getNewShapeId = getNewShapeId(this.shapes);
            this._getNewConnectionId = getNewConnectionId(this.connections);

            this._loadCanvasSize(true);

            console.log('this.shapes ---> ', this.shapes);
            console.log('this.connections ---> ', this.connections);

            resolve(data);

          },
          error => reject(error));

    });
  }


  //////////////////////////////////////////////
  //////////////////// SHAPE OPTIONS
  //////////////////////////////////////////////

  /**
   * Associar anotações a shapes
   * @param shape Shape à qual se pretende adicionar uma anotação
   */
  public createAnnotation(shape: Shape) {

    if (this.readOnly())
      return;

    let annotation: Shape = {
      type: 'annotation',
      connectedTo: shape.id
    };
    this._setShapeId(annotation);
    this.shapes.push(annotation);

    let offset = new DOMRect();
    offset.width = 175;
    offset.height = 60;
    offset.y = shape.pos.y - shape.pos.h;
    offset.x = shape.pos.x + (shape.pos.w / 2);

    this._savePositionOnShape(null, annotation, offset);
    this._drawLine(shape, annotation, 'annotation');
  }

  /**
   * Apaga os elementos (Shapes e Connections) seleccionados.
   * Ao apagar as Shapes seleccionadas, apaga também as Connections associadas
   */
  public deleteShapes(items?: Shape | Shape[]): void {

    if (this.readOnly())
      return;

    let itemsToDelete: Shape[] = items ? <Shape[]>(items.constructor === Object ? new Array(items) : items) : this._getSelectedShapes();
    let hasItemsToDelete = itemsToDelete.length > 0;

    itemsToDelete.filter(obj => obj.type != 'start').forEach(shape => {

      this._removeShapeFromArray(shape);

      if (shape.type == 'dot')
        return;

      // Elimina os conectores que estão associados às Shapes eliminadas
      this.connections.filter(conn => conn.shapes.from.id == shape.id || conn.shapes.to.id == shape.id)
        .forEach(conn => {
          conn.isSelected = true;
          this._selectConnectionDots(conn);
        });

      // let connIndex = this.connections.reduce((acc, conn, i) => conn.id.indexOf(selectedShape.id) >= 0 ? acc.concat(i) : acc, []);
      // this._removeIndexFromArray(this.connections, connIndex);

      // Elimina nas Shapes associadas à que está a ser eliminada, o ID desta (Source e Target)
      // this.shapes.filter(obj => obj.connections && ((obj.connections.source && obj.connections.source.indexOf(selectedShape.id) >= 0) || (obj.connections.target && obj.connections.target.indexOf(selectedShape.id) >= 0)))
      //   .forEach(obj => {
      //     let sourceIdx = obj.connections.source.indexOf(selectedShape.id);
      //     let targetIdx = obj.connections.target.indexOf(selectedShape.id);
      //     if (sourceIdx >= 0)
      //       obj.connections.source.splice(sourceIdx, 1);
      //     if (targetIdx >= 0)
      //       obj.connections.target.splice(targetIdx, 1);
      //   });

      // Elimina Shapes que estejam ligadas à que está a ser eliminada (ex: comentários)
      // let connectedShapes = this.shapes.filter(obj => obj.connectedTo === selectedShape.id);
      // if (connectedShapes.length > 0)
      //   this.deleteShapes(connectedShapes);
    });

    this._deleteSelectedConnections();
    this._evaluateConnToDeletedShapes();

    this._setConnectionQuickView();
    this._setShapeQuickView();

    if (!items)
      this._unselectShapes();
  }

  /**
   * Permite clonar uma determinada Shape
   * @param shape Shape que será clonada
   */
  public cloneShape(shape: Shape) {
    this._copiedShapes = [Object.assign(new Object(), shape)];
    this._pasteElements();
  }

  /**
   * Abre a modal com o formulário de escolha/criação de Intent
   * @param line Conecção à qual queremos associar uma nova Intent
   */
  public openModalSetIntent(line: Connection, auto: boolean = false) {

    this._unselectShapes();
    this._unselectConnections();

    if (this.readOnly())
      return;

    line.dataRecs.openNextShape = auto ? true : false;

    let context = {
      line: line,
      shapesList: this.shapes.filter(obj => obj.type != 'dot').map(obj => new Object({ key: obj.id, value: obj.text, type: obj.type }))
    };

    if (['api', 'decision', 'programIn'].indexOf(line.shapes.from.type) >= 0) {
      line.intent.friendlyName = null;
      line.intent.name = null;

      // TODO: Retirar isto - apenas existe para mapear o attr "condition" para "conditionEval" de Connections antigas
      if (line.dataRecs.condition) {
        line.dataRecs.conditionEval = line.dataRecs.condition;
        if (line.dataRecs.condition)
          delete line.dataRecs.condition;
      }

      context['fatherConnections'] = this.connections.filter(obj => obj.shapes.from.id == line.shapes.from.id);
      this._modal.openModal('designFlow/connection-evaluation-set', null, context, new JsonParams());
      return;
    }

    // Filtra as Intents que estão a ser usadas por Connections que saiam da mesma Shape que aquela que está a ser "aberta"
    context['intentsInUse'] = this.connections.filter(obj => obj.shapes.from.id == line.shapes.from.id).map(obj => obj.intent ? obj.intent.name : '').filter(str => str);

    this._modal.openModal('designFlow/connection-intent-set', null, context, new JsonParams());
  }

  public openModal(mock: string) {
    if (this.readOnly())
      return;
    this._modal.openModal(mock, null, new Object(), new JsonParams());
  }

  /**
   * Abre a modal com o formulário de configuraç\ao de cada Shape
   * @param line Shape à qual queremos alterar a editar a configuração
   */
  public openModalShape(shape: Shape) {

    this._unselectShapes();
    this._unselectConnections();

    if (!shape.mockToLoad || this.readOnly())
      return;

    let context = Object.assign({ shape }, shape.dataRecs);
    context.shapesList = this.shapes.filter(obj => obj.type != 'dot').map(obj => new Object({ key: obj.id, value: obj.text, type: obj.type }));
    context.namesInUse = this.shapes.filter(obj => obj.type != 'dot' && obj.id != shape.id).map(obj => obj.text);
    context.canMarkAsEnd = !this.connections.find(obj => obj.shapes.from.id == shape.id);

    this._modal.openModal(shape.mockToLoad, null, context, new JsonParams('shapeConfig_' + shape.type));
  }

  /**
   * Abre a modal com o json da resposta que foi obtida no ChatComponent
   * @param obj é o objecto obtido
   */
  public openModalIntentClick(obj: any) {
    this._modal.openModal('designFlow/connection-intent-detail', null, { obj }, new JsonParams());
  }

  /**
   * Devolve os valores formatados que formam uma Connection em arco
   * @param pos é a configuração da posição da Connection
   */
  public getLineArc(conn: Connection): string {

    let pos = conn.pos;
    // if (!pos.xArc && !pos.yArc)
    pos = this._getLineArc(pos.x1, pos.y1, pos.x2, pos.y2, conn);

    return 'M' + pos.x1 + ' ' + pos.y1 + ' Q ' + pos.xArc + ' ' + pos.yArc + ' ' + pos.x2 + ' ' + pos.y2;
  }

  /**
   * Devolve a label de cada Connection
   * @param conn é a Connection em questão
   */
  public getLineLabel = (conn: Connection): string => (conn.intent && conn.intent.friendlyName ? conn.intent.friendlyName : conn.dataRecs && conn.dataRecs.name ? conn.dataRecs.name : 'generic___designerFlow___clickToEdit');

  /**
   * Indica se uma Shape pode ser o início de uma Connection
   * @param shape é a shape que está a ser avaliada
   */
  public canStartConnection = (shape: Shape): boolean => ['program', 'link'].indexOf(shape.type) < 0 && (!shape.dataRecs || !shape.dataRecs.markAsEnd);

  /**
   * Indica se uma Shape pode ser o fim de uma Connection
   * @param shape é a shape que está a ser avaliada
   */
  public canEndConnection = (shape: Shape): boolean => ['start', 'programIn'].indexOf(shape.type) < 0;

  /**
   * Valida se os dados do componente podem ser alterados (ou porque as diversas configurações ainda não foram lidas ou porque há indicação de readonly)
   */
  public canChange = (): boolean => this._programId && this.componentIsReady && this.shapes.length > 0 && !this.readOnly();

  /**
   * Possibilidade de editar dados através de indicação no mock
   */
  public readOnly = (): boolean => this.inputParameters.readonly;

  /**
   * Lê toda a informação externa que é necessária para o funcionamento do DesignerFlow (Configurações, Fluxo do Programa, APIs, Variáves, Intents)
   */
  private _loadProgramDetails(): Promise<any> {

    if (!this._programId) {
      this.componentIsReady = true;
      return;
    } else
      this.componentIsReady = false;

    return new Promise((resolve, reject) => {

      this._loadConfigurations().then(data => {
        this.import().then(data => {
          this._loadFirstShape();
          this._getNewShapeId = getNewShapeId(this.shapes);
          this._getNewConnectionId = getNewConnectionId(this.connections);
          this.componentIsReady = true;
          resolve(true);
        }).catch(error => reject(error));

        this._loadApiList();
        this._loadVariables();
        this._loadTrainingPhrases();
      });

    });
  }

  /**
   * Garante que uma Shape, quando é criada, tem um nome único
   * @param str nome original da Shape
   */
  private _getUniqShapeName(str: string = '') {
    let nameExists = this.shapes.filter(obj => obj.text == str || new RegExp(str + ' \\(\\d+\\)').test(obj.text)).length;
    return str + (nameExists > 0 ? ` (${nameExists + 1})` : '');
  }

  /**
   * Valida se é há uma conecção que possa ser feita
   */
  private _canConnect(): boolean {
    if (this.readOnly())
      return false;
    let selectedShapes = this._getSelectedShapes().filter(obj => obj.type != 'dot');
    return selectedShapes.length === this._shapesLimitToConnect && (!selectedShapes[0].dataRecs || !selectedShapes[0].dataRecs.markAsEnd) && this.canStartConnection(selectedShapes[0]) && !this.isOptionShape(selectedShapes[0]) && !this.isOptionShape(selectedShapes[1])
  }

  /**
   * Remove do Array a Shape indicada
   * @param shape é a Shape a remover
   */
  private _removeShapeFromArray = (shape: Shape) => {

    if (this.readOnly())
      return;

    shape.isDeleted = true;

    let shapeIndex = this.shapes.findIndex(obj => obj.id === shape.id);
    if (shapeIndex >= 0)
      this.shapes.splice(shapeIndex, 1);
  }

  /**
   * Elimina os Connectores seleccionados (e respectivos pontos de ligação - Dots)
   */
  private _deleteSelectedConnections() {

    if (this.readOnly())
      return;

    let connIndex = this.connections.reduce((acc, conn, i) => {
      if (conn.isSelected) {
        acc = acc.concat(i);
        if (conn.shapes.from.type == 'dot')
          this._removeShapeFromArray(conn.shapes.from);
        if (conn.shapes.to.type == 'dot')
          this._removeShapeFromArray(conn.shapes.to);
      }
      return acc;
    }, []);
    this._removeIndexFromArray(this.connections, connIndex);
  }

  /**
   * Verifica Connections que estejam ligadas a Shapes que foram entretanto eliminadas
   */
  private _evaluateConnToDeletedShapes() {

    this.connections.filter(obj => obj.shapes.from.isDeleted).forEach(conn => {

      let previousConn = this.connections.find(obj => obj.shapes.to.id == conn.shapes.from.id);
      if (!previousConn)
        return;

      previousConn.shapes.to = conn.shapes.to;
      previousConn.subType = this._connSubType(conn.shapes.from, conn.shapes.to);

      if (previousConn.shapes.to.type != 'dot')
        delete previousConn.shapes.last;

      this._updateLine(conn.shapes.to);

      let connIndex = this.connections.findIndex(obj => obj.id == conn.id);
      if (connIndex >= 0)
        this._removeIndexFromArray(this.connections, [connIndex]);
    });

  }

  /**
   * Devolve o sub-tipo de Conecção que está a ser criada
   * @param item1 Shape 1 (From)
   * @param item2 Shape 2 (To)
   */
  private _connSubType = (item1: Shape, item2: Shape): string => (item1.type == 'dot' ? 'fromDot' : '') + (item2.type == 'dot' ? 'toDot' : '');

  /**
   * Devolve um array com as Shapes seleccionadas
   */
  private _getSelectedShapes = (): Shape[] => this.shapes.filter(obj => obj.isSelected && obj.isSelected > 0).sort((a, b) => a.isSelected > b.isSelected ? 1 : -1);

  /**
   * Devolve o número a colocar quando uma Shape é seleccionada
   */
  private _getNextSelectedShape = (): number => this._getSelectedShapes().length + 1;

  /**
   * Devolve um array com as Connections seleccionadas
   */
  private _getSelectedConnections = (): Connection[] => this.connections.filter(obj => obj.isSelected === true);

  /**
   * Define o "number" e o "id" na Shape recebida
   * @param shape Shape que será actualizada com o novo ID
   */
  private _setShapeId = (shape: Shape): void => {
    shape.number = this._getNewShapeId.next().value;
    shape.id = `number${shape.number}shape`;
  };

  /**
   * Define o "number" e o "id" na Connection recebida
   * @param conn Connection que será actualizada com o novo ID
   */
  private _setConnectionId = (conn: Connection): void => {
    conn.number = this._getNewConnectionId.next().value;
    conn.id = `number${conn.number}connection`;
  };

  /**
   * Guarda a posição actual do Cursor
   * @param event Mouse Event
   */
  private _mouseMove(event: MouseEvent) {
    this._mousePosition.x = event.clientX;
    this._mousePosition.y = event.clientY;
  }

  /**
   * Evento ao click
   * @param event Keyboard Event
   */
  @HostListener("click", ["$event"])
  private _onClick(event: MouseEvent) {
    this._svgClicked = event.srcElement.id == 'mainSvgContainer';
  }

  /**
   * Evento ao soltar uma tecla do teclado
   * @param event Keyboard Event
   */
  @HostListener("document:keydown", ["$event"])
  private _onKeyDown(event: KeyboardEvent) {
    // Previne o scroll do browser ao pressionar as setas do teclado quando queremos mover as Shapes
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(event.key) >= 0 && this._getSelectedShapes().length > 0)
      event.preventDefault();

    // Previne a selecção total do conteúdo do browser para que possamos apenas seleccionar as Shapes e Connections
    // TODO: não deixa, por exemplo, seleccionar todo o texto de uma textbox
    if (event.ctrlKey && event.key == 'a' && this._svgClicked)
      event.preventDefault();
  }

  /**
   * Evento ao precionar uma tecla do teclado
   * @param event Keyboard Event
   */
  @HostListener("document:keyup", ["$event"])
  private _onKeyUp(event: KeyboardEvent) {
    if (event.key == 'Escape') {
      // this.toggleFullScreen('hide');
      this._closeChat();
    }
    if (event.key == 'Delete')
      this.deleteShapes();
    else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(event.key) >= 0 && this._getSelectedShapes().length > 0)
      this._moveElements(event);
    else if (event.ctrlKey && event.key == 'c')
      this._copyElements();
    else if (event.ctrlKey && event.key == 'v')
      this._pasteElements();
    else if (event.ctrlKey && event.key == 'a' && this._svgClicked)
      this._selectAllElements(event);
  }

  /**
   * Move as Shapes seleccionadas pressionando as setas do teclado
   * @param event Keyboard Event
   */
  private _moveElements(event: KeyboardEvent): void {
    event.preventDefault();
    let pixel = event.ctrlKey ? 10 : 1;
    this._getSelectedShapes().forEach(shape => {
      shape.pos.y += event.key == 'ArrowUp' ? -pixel : event.key == 'ArrowDown' ? pixel : 0;
      shape.pos.x += event.key == 'ArrowLeft' ? -pixel : event.key == 'ArrowRight' ? pixel : 0;
      this._updateLine(shape);
    });
  }

  /**
   * Seleciona todas as Shapes e conections selecionando Ctrl + a
   */
  private _selectAllElements(event) {
    this.shapes.forEach(shape => shape.isSelected = 1);
    this.connections.forEach(connection => connection.isSelected = true);
  }

  /**
   * Copia as Shapes seleccionadas
   */
  private _copyElements() {
    this._copiedShapes = [].concat(this._getSelectedShapes());
  }

  /**
   * Cola as Shapes copiadas anteriormente, com um offset de x pixeis
   */
  private _pasteElements() {

    this._unselectShapes();
    this._copiedShapes.forEach(shape => {

      let newShape: Shape = Object.assign(new Object(), shape);
      newShape.text = this._getUniqShapeName(newShape.text || newShape.type);
      newShape.isSelected = this._getNextSelectedShape();
      newShape.pos = Object.assign(new Object(), shape.pos);
      newShape.pos.x += 50;
      newShape.pos.y += 50;

      this._setShapeId(newShape);
      this.shapes.push(newShape);
    });
    this._copiedShapes.length = 0;
  }

  /**
   * Selecciona todas as conecções que estejam relacionadas
   * @param conn é a Conecção que poderá, ou não, estar relacionada com outras
   */
  private _selectConnectionDots(conn: Connection) {
    if (!conn.connectedTo || (!conn.subType && (conn.subType.indexOf('fromDot') < 0 && conn.subType.indexOf('toDot') < 0)))
      return;

    this.connections.filter(obj => obj.connectedTo == conn.connectedTo)
      .forEach(obj => {
        obj.isSelected = true;
        if (obj.shapes.from.type == 'dot')
          obj.shapes.from.isSelected = this._getNextSelectedShape();
        if (obj.shapes.to.type == 'dot')
          obj.shapes.to.isSelected = this._getNextSelectedShape();
      });
  }

  /**
   * Guarda na Shape o posicionamento do elemento HTML
   * @param element Elemento HTML que representa o Objecto Shape
   * @param item Objecto Shape
   * @param offset Dados de posicionamento do elemento
   */
  private _savePositionOnShape(element: HTMLElement, item: Shape, offset?: DOMRect) {

    if (!offset && element)
      offset = <DOMRect>element.getBoundingClientRect();

    let x = offset.x - this._svgCanvasElementPosition.left;
    let y = offset.y - this._svgCanvasElementPosition.top;

    item.pos = {
      w: offset.width,
      h: offset.height,
      initX: item.pos ? item.pos.initX || 0 : 0,
      initY: item.pos ? item.pos.initY || 0 : 0,
      x: x >= 0 ? x : 0,
      y: y >= 0 ? y : 0
    };

    this._loadCanvasSize();
  }

  /**
   * Desenha uma conecção entre dois elementos (Shapes)
   * @param item1 Shape 1 (From)
   * @param item2 Shape 2 (To)
   * @param subType Subtipo de conecção que se pretende desenhar
   * @param suggestion Se é, ou não, uma sugestão de conecção
   */
  private _drawLine(item1: Shape, item2: Shape, subType?: string, suggestion: boolean = false, connectedTo?: string): Connection {

    if (item1.id == item2.id || (item1.dataRecs && item1.dataRecs.markAsEnd) || !this.canStartConnection(item1) || !this.canEndConnection(item2))
      return;

    let addIntent: boolean = !suggestion && (!subType || subType.indexOf('fromDot') < 0);
    let newLine: Connection = {
      type: 'line',
      subType,
      connectedTo,
      isSelected: false,
      isSuggestion: suggestion,
      dataRecs: new Object(),
      shapes: {
        from: item1,
        to: item2
      }
    };
    newLine.pos = this._getLinePositionObject(item1, item2, newLine, this.connections.filter(obj => obj.shapes.from.id == item1.id).length);

    this._setConnectionId(newLine);

    this.connections.push(newLine);

    if (addIntent) {
      newLine.intent = new Object();
      this._updateIntentPosition(newLine);
    }

    return newLine;
  }

  /**
   * Faz update do Source e Target de uma Shape (que shapes ligam à shape x; a que shapes a shape x se liga)
   * @param shape1 Shape From
   * @param shape2 Shape To
   */
  private _updateShapeTargets(shape1: Shape, shape2: Shape) {

    // [shape1, shape2].forEach(obj => {
    //   if (!obj.connections) {
    //     obj.connections = {
    //       source: new Array(),
    //       target: new Array()
    //     };
    //   }
    // });

    // shape1.connections.target.push(shape2.id);
    // shape2.connections.source.push(shape1.id);
  }

  /**
   * Actualiza o posicionamento das conecções quando uma Shape está a ser arrastada
   * @param item Shape que está a ser arrastada
   */
  private _updateLine(item: Shape) {
    let lines = this.connections.filter(obj => obj.shapes.from.id == item.id || obj.shapes.to.id == item.id);
    for (let line of lines) {
      line.pos = this._getLinePositionObject(line.shapes.from, line.shapes.to, line);
      this._updateIntentPosition(line);
    }
  }

  /**
   * Devolve o posicionamento das duas extremidades de uma conecção
   * @param item1 Shape 1 (From)
   * @param item2 Shape 2 (To)
   * @param line Ligação para a qual está a ser calculada a posição
   * @param numberOfConn Número de connecções que vêm da mesma Shape
   */
  private _getLinePositionObject(item1: Shape, item2: Shape, line: Connection, numberOfConn?: number): ConnectionPos {

    let pos = this._evaluateConnPosition(item1, item2);
    let result: ConnectionPos = {
      y1: item1.pos.y + (item1.type == 'dot' ? (item1.pos.h / 2) : (pos.y1 == 'middle' ? item1.pos.h / 2 : pos.y1 == 'top' ? 0 : item1.pos.h)),
      x1: item1.pos.x + (item1.type == 'dot' ? (item1.pos.w / 2) : (pos.y1 == 'middle' ? (pos.x1 == 'right' ? item1.pos.w : 0) : item1.pos.w / 2)),
      y2: item2.pos.y + (item2.type == 'dot' ? (item2.pos.h / 2) : (pos.y2 == 'middle' ? item2.pos.h / 2 : pos.y2 == 'top' ? 0 : item2.pos.h)),
      x2: item2.pos.x + (item2.type == 'dot' ? (item2.pos.w / 2) : (pos.y2 == 'middle' ? (pos.x2 == 'right' ? item2.pos.w : 0) : item2.pos.w / 2))
    };

    return this._getLineArc(result.x1, result.y1, result.x2, result.y2, line, numberOfConn);
  }

  /**
   * Calcula as coordenadas que formam um arco
   * @param x1 coordenada x do início da ligação
   * @param y1 coordenada y do início da ligação
   * @param x2 coordenada x do final da ligação
   * @param y2 coordenada y do final da ligação
   * @param line Ligação para a qual está a ser calculada a posição
   * @param numberOfConn Número de connecções que vêm da mesma Shape
   */
  private _getLineArc(x1: number, y1: number, x2: number, y2: number, line: Connection, numberOfConn?: number): ConnectionPos {

    // if (numberOfConn !== undefined && !line.lineAngle)
    //   line.lineAngle = this.lineAngle + numberOfConn;

    let xMed = (x1 + x2) / 2;
    let yMed = (y1 + y2) / 2;

    let vetorDirecionalY = y2 - y1;
    let vetorDirecionalX = x2 - x1;

    let m = Math.sqrt(Math.pow(xMed - x1, 2) + Math.pow(yMed - y1, 2));
    let d = (m * Math.tan(Math.PI / (line.lineAngle !== undefined ? line.lineAngle : this.lineAngle)));
    let b = vetorDirecionalX === 0 ? 0 : Math.sqrt(Math.pow(d, 2) / (Math.pow(vetorDirecionalY, 2) / Math.pow(vetorDirecionalX, 2) + 1));
    let a = vetorDirecionalX === 0 ? d : -b * vetorDirecionalY / vetorDirecionalX;

    if (vetorDirecionalY > 0) {
      a *= -1;
      b *= -1;
    }
    // if (this.lineAngle > 0) {
    //   a *= -1;
    //   b *= -1;
    // }

    let xArc = xMed + a;
    let yArc = yMed + b;

    return { y1, x1, y2, x2, xArc, yArc };
  }

  /**
   * Avalia a posição de uma Shape, relativamente a outra
   * @param item1 Shape 1 (From)
   * @param item2 Shape 2 (To)
   */
  private _evaluateConnPosition(item1: Shape, item2: Shape): any {

    let margin = 0;
    let yMiddle = (item1.pos.y + item1.pos.h > item2.pos.y - margin) && (item1.pos.y < item2.pos.y + item2.pos.h + margin);
    let xMiddle = (item1.pos.x + item1.pos.w > item2.pos.x - margin) && (item1.pos.x < item2.pos.x + item2.pos.w + margin);

    return {
      y1: yMiddle ? 'middle' : item1.pos.y < item2.pos.y ? 'bottom' : 'top',
      x1: xMiddle ? 'middle' : item1.pos.x < item2.pos.x ? 'right' : 'left',
      y2: yMiddle ? 'middle' : item2.pos.y < item1.pos.y ? 'bottom' : 'top',
      x2: xMiddle ? 'middle' : item2.pos.x < item1.pos.x ? 'right' : 'left'
    };

  }

  /**
   * Adiciona a uma Conecção uma nova Intent
   * @param connectionId id da Conecção que queremos actualizar com a nova Intent
   * @param intent informação sobre qual a Intent a associar à Conecção
   * @param isFallback indica se é uma ligação do tipo fallback (valor é recebido como string "true" | "false")
   */
  private _setIntent(connectionId: string, intent: any, isFallback: string) {

    let line = this.connections.find(obj => obj.id == connectionId);
    if (!line)
      return;

    line.intent = new Object();

    if (isFallback === 'true') {
      line.intent.friendlyName = 'generic___designerFlow___fallback';
      line.intent.isFallback = true;
    } else {
      let text = intent.label || intent.id || '';
      let limit = 30;

      line.intent.name = intent.id;
      line.intent.friendlyName = text.length > limit ? text.substring(0, 30) + '..' : text;
      line.intent.isFallback = false;
    }

    this._updateLine(line.shapes.from);
  }

  /**
   * Actualiza a posição da label Intent consoante a posição da linha
   * @param line Conecção associada à Intent que estamos a alterar
   */
  private _updateIntentPosition(line: Connection) {

    if (!line.intent)
      return;

    let labelWidth = this.getLineLabel(line).length * 5; // 5 -> estimativa do tamanho de cada caracter em px

    if (line.lineAngle === 1) {
      // TODO: linhas retas
      line.intent.pos = {
        x: line.pos.x1 - ((line.pos.x1 - line.pos.x2) / 2) - (labelWidth / 2),
        y: (line.pos.y1 + ((line.pos.y2 - line.pos.y1) / 2))/*  + (line.pos.y1 > line.pos.y2 ? -25 : 25) */
      };
    } else {
      line.intent.pos = {
        x: line.pos.x2 - (labelWidth / 2) + (Math.abs(line.pos.x1 - line.pos.x2) < 100 ? 0 : line.pos.x1 < line.pos.x2 ? -40 : 40),
        y: line.pos.y2 + (line.pos.y1 > line.pos.y2 ? 50 : -50)
      };
    }
  }

  /**
   * Descelecciona as Shapes seleccionadas
   */
  private _unselectShapes(shape?: Shape) {

    let placeholder: Shape[] = this.shapes.filter(obj => obj.type == 'placeholder' && obj.isSelected);
    if (placeholder.length > 0)
      this.deleteShapes(placeholder);

    this.shapes.forEach(obj => {
      if (!shape || obj.id != shape.id)
        obj.isSelected = 0;
    });
    this._setShapeQuickView();
  }

  /**
   * Descelecciona as Conecções seleccionadas
   * @param connection Conecção que não queremos desceleccionar
   */
  private _unselectConnections(connection?: Connection) {
    this.connections.forEach(obj => {
      if (!connection || obj.id != connection.id)
        obj.isSelected = false;
    });
    this._setConnectionQuickView();
  }

  /**
   * Constroi a informação que será mostrada na quickview da Connection
   */
  private _setConnectionQuickView = () => {

    if (!this._configParam.value['intents'])
      return;

    this.selectedConnections = this._getSelectedConnections().filter(obj => obj.shapes.from.type != 'dot');
    this.selectedIntents = new Array();
    this.selectedConnections.forEach(obj => {

      if (!obj.intent || !obj.intent.name)
        return;

      let intent = this._configParam.value['intents'].find(intent => intent.name == obj.intent.name);
      if (!this.selectedIntents.find(i => i.intent == intent.friendlyName))
        this.selectedIntents.push(new Object({ intent: obj.intent.friendlyName, trainingPhrases: intent && intent.trainingPhrases ? intent.trainingPhrases.slice(0, 5) : new Array() }));
    });

  };

  /**
   * Constroi a informação que será mostrada na quickview da Shape
   */
  private _setShapeQuickView = () => {

    this.selectedShapes = this._getSelectedShapes().filter(obj => obj.type != 'dot');
    // this.selectedConnections.forEach(obj => {

    //   if (!obj.intent || !obj.intent.name)
    //     return;

    //   let intent = this._configParam.value['intents'].find(intent => intent.name == obj.intent.name);
    //   if (!this.selectedIntents.find(i => i.intent == intent.friendlyName))
    //     this.selectedIntents.push(new Object({ intent: obj.intent.friendlyName, trainingPhrases: intent && intent.trainingPhrases ? intent.trainingPhrases.slice(0, 5) : new Array() }));
    // });

  };

  /**
   * Cria uma sugestºão de conecção entre duas Shapes seleccionadas
   */
  private _createSuggestion() {
    let selectedShapes = this._getSelectedShapes().filter(obj => obj.type != 'dot');
    this._deleteSuggestions();
    if (this._canConnect())
      this._drawLine(selectedShapes[0], selectedShapes[1], this._connSubType(selectedShapes[0], selectedShapes[1]), true);
  }

  /**
   * Apaga uma eventual sugestão de conecção
   */
  private _deleteSuggestions() {
    let connIndex = this.connections.reduce((acc, conn, i) => conn.isSuggestion ? acc.concat(i) : acc, []);
    this._removeIndexFromArray(this.connections, connIndex);
  }

  /**
   * Remove de um array, os índices indicados
   * @param arr array de onde se pretende remover um indice
   * @param index índices a remover
   */
  private _removeIndexFromArray(arr: any[], index: number[]) {

    if (!index || index.length == 0)
      return;

    for (let i = index.length - 1; i >= 0; i--)
      arr.splice(index[i], 1);
  }

  /**
   * Apaga os Objectos que guardem informação sobre a "PlaceholderShape" (Shape auxiliar para criação de novas ligações)
  */
  private _deletePlaceholderShape() {

    if (!this._placeholderShape)
      return;

    let originalDotElement: CdkDrag = this._placeholderShape.dataRecs.originalDotElement;
    if (originalDotElement) {
      originalDotElement.element.nativeElement.style.transform = 'none';
      originalDotElement['_passiveTransform'] = { x: 0, y: 0 };
    }

    this.deleteShapes(this._placeholderShape);
    this._unselectShapes();
    this._placeholderShape = null;
  }

  /**
   * Load das configurações iniciais do Designer Flow
   */
  private _loadConfigurations(): Promise<any> {

    return new Promise((resolve, reject) => {
      this._http.get(this._endpoint + '/designer/configurations', this._httpHeaders())
        .subscribe(data => {
          this.pallete = (data['shapes'] || new Array());
          resolve(data);
        });
    });

  }

  /**
   * Trata os eventos que chegam ao componente ChatComponent
   * @param event detalhes do evento recebido
   */
  private _handleCustomEvent(event: any) {
    switch (event.detail.key) {
      case 'vaMessage': this._handleVaMessage(event.detail.value); break;
      case 'intentClick': this.openModalIntentClick(event.detail.value); break;
      case 'toggleChat': this._toggleChat(event.detail.value); break;
    }
  }

  /**
   * Procura as Connections que devem ser assinaladas
   * @param message evento com os detalhes da mensagem recebida
   */
  private _handleVaMessage(message: any) {

    let handleMessage = () => {
      // Selecciona a Connection que guarda a Intent, através do connectionId
      let connectionId = this._utils.findValues(['nlpResponse', 'intent', 'connectionId'], message);
      if (!connectionId)
        return;

      console.log('connectionId ---> ', connectionId);
      console.log('this.connections.find()---> ', this.connections.find(obj => obj.id == connectionId));

      this._highlightConnection(this.connections.find(obj => obj.id == connectionId));

      // Selecciona Connections que venham referenciadas na resposta pelo ID
      if (message.optionsList && message.optionsList.length > 0)
        message.optionsList.forEach(connId => this._highlightConnection(this.connections.find(obj => obj.id == connId)));
    }

    if (!this._programId)
      this._findProgramInVaMessage(message).then(data => handleMessage());
    else
      handleMessage();
  }

  /**
   * Procura qual o program correspondente à mensagem que foi recebida no ChatComponent
   * @param message evento com os detalhes da mensagem recebida
   */
  private _findProgramInVaMessage(message: any): Promise<any> {

    return new Promise((resolve, reject) => {

      let action = message.action;
      if (!action) {
        resolve(true);
        return;
      }

      let code = action.split('_')[0];
      let version = action.split('_').pop();

      this._http.get(this._config.getEndpoint('SchoolBOT') + `/availablePrograms?rep=pj&np&keys={"_id":1}&filter={"code":"${code}","version":"${version}"}`, this._httpHeaders(new Object({ IXS: localStorage.IXS_id })))
        .subscribe(data => {

          let programId = this._utils.findValues(['[0]', '_id', '$oid'], data);
          if (programId) {
            this._programByAction = true;
            this._programId = programId;
            this._loadProgramDetails().then(data => {
              this.inputParameters.hidden = false;
            });
          }

          resolve(data);
        });

    });

  }

  /**
   * Assinala no fluxo a Connection e Shape à qual liga
   * @param message evento com os detalhes da mensagem recebida
   */
  private _highlightConnection(conn: Connection) {

    if (!conn)
      return;

    let setHighlight = (item: Shape | Connection) => !item.isHighlighted ? 1 : item.isHighlighted++;
    let removeHighlight = (item: Connection) => {
      item.isHighlighted = 0;
      item.shapes.to.isHighlighted = 0;
    };

    // Descelecciona Connections e Shapes irmãs daquela que vai ser seleccionada
    this.connections.filter(obj => obj.id != conn.id && obj.shapes.from.id == conn.shapes.from.id)
      .forEach(obj => {
        removeHighlight(obj);
        if (obj.connectedTo)
          this.connections.filter(obj2 => obj2.connectedTo == obj.connectedTo).forEach(obj => removeHighlight(obj));
      });

    conn.isHighlighted = setHighlight(conn);
    conn.shapes.to.isHighlighted = setHighlight(conn.shapes.to);

    // if (conn.shapes.to.type == 'program')
    //   this._jumpToProgram(conn.shapes.to);

    // Selecciona outras linhas que façam parte da mesma Connection (separadas por pontos)
    if (conn.connectedTo) {
      this.connections.filter(obj => obj.connectedTo == conn.connectedTo)
        .forEach(obj => {
          obj.isHighlighted = setHighlight(obj);
          obj.shapes.to.isHighlighted = setHighlight(obj.shapes.to);
        });
    }
  }

  /**
   * Lê as Shapes do novo Program
   * @param shape é a Shape que guarda a identificação do novo Program
   */
  private _jumpToProgram(shape: Shape) {

    if (!shape.dataRecs || !shape.dataRecs.jumpToProgramId)
      return;

    this._programId = shape.dataRecs.jumpToProgramId;
    this._loadConfigurations();
  }

  /**
   * Chama a API de TRY do Program em questão
   * @param isChatOpen indica se deve ou não chamar a API
   */
  private _toggleChat(isChatOpen: boolean): Promise<any> {

    if (!isChatOpen) {
      this.tryMode = false;
      this._removeHighlightItems();
      if (this._programByAction) {
        this._programId = undefined;
        this.inputParameters.hidden = true;
      }
      return;
    }

    if (!this.canChange())
      return;

    if (this._programByAction && this.inputParameters.hidden)
      this.inputParameters.hidden = false;

    // OPERAÇÃO TRY
    return new Promise((resolve, reject) => {
      this.export().then(exportData => {              // SAVE
        this.learnProgram(true).then(learnData => {   // LEARN
          this.tryMode = true;
          let startShape = this.shapes.find(obj => obj.type == 'start');
          if (startShape)
            startShape.isHighlighted = 1;
        });
      })
    });
  }

  /**
   * Trata os eventos que chegam ao componente DesignerFlow
   * @param data é o array de eventos que foram emitidos
   */
  private _handleEvent(data: newEvent[]) {
    data.forEach(event => {
      if (event.key == 'setIntent' && event.value)
        this._setIntent(event.value.connectionId, event.value.intent, event.value.isFallback);
      else if (event.key == 'setConnectionShapes' && event.value)
        this._setConnectionShapes(event.value.connectionId, event.value.from, event.value.to);
      else if (event.key == 'saveShapeName')
        this._saveShapeName(event.value);
      else if (event.key == 'saveDataRecs')
        this._saveDataRecs(event.value);
      else if (event.key == 'saveConnectionsOptions')
        this._saveConnectionsOptions(event.value)
      else if (event.key == 'try')
        this.learnProgram();
      else if (event.key == 'save')
        this.export();
      else if (event.key == 'loadVariables')
        this._loadVariables();
      else if (event.key == 'loadIntents')
        this._loadTrainingPhrases();
    });

  }

  /**
   * Guarda numa determinada Shape o seu nome
   * @param data é o ID e nome pretendido para a shape
   */
  private _saveShapeName(data: any) {

    let item: Shape = this.shapes.find(obj => obj.id == data.shapeId);
    if (!item)
      return;

    item.text = data.name;
  }

  /**
   * Guarda numa determinada Shape os dados do formiulário
   * @param data são os dados vindos do formulário da modal
   */
  private _saveDataRecs(data: any) {

    let itemId: string = data.shapeId || data.connectionId;
    if (!itemId)
      return;

    let item: Shape | Connection = data.shapeId ? this.shapes.find(obj => obj.id == itemId) : this.connections.find(obj => obj.id == itemId);
    if (!item || !data.dataRecs)
      return;

    item.dataRecs = item.dataRecs || new Object();
    for (let i in data.dataRecs) {
      item.dataRecs[i] = data.dataRecs[i];
      try {
        // Tenta fazer o parse do conteúdo (boolean, json, number, etc)
        item.dataRecs[i] = JSON.parse(item.dataRecs[i]);
      } catch (e) { }
    }

    this._updateLine(data.shapeId ? <Shape>item : (<Connection>item).shapes.from);

    // Caso seja uma Connection, verifica se deve abrir a modal da Shape seguinte
    if (data.connectionId && item.dataRecs.openNextShape) {
      this.openModalShape((<Connection>item).shapes.to);
      delete item.dataRecs.openNextShape;
    }

  }

  private _setConnectionShapes(connectionId: string, from: any, to: any) {

    let line = this.connections.find(obj => obj.id == connectionId);
    if (!line)
      return;

    if (line.shapes.from.id != from.id)
      line.shapes.from = this.shapes.find(obj => obj.id == from.id);
    if (line.shapes.to.id != to.id)
      line.shapes.to = this.shapes.find(obj => obj.id == to.id);

    this._setConnectionId(line);
    this._updateLine(line.shapes.from);
    this._updateLine(line.shapes.to);
  }

  /**
   * Guarda nas Connections do tipo evaluation a sua ordem de avaliação
   * @param data são os dados vindos do formulário da modal
   */
  private _saveConnectionsOptions(data: any) {
    for (let i in data) {
      let connection = this.connections.find(obj => obj.id == data[i].id);
      if (!connection)
        continue;

      connection.dataRecs = connection.dataRecs || new Object();
      connection.dataRecs.priority = +i + 1;
      connection.dataRecs.isDefault = data[i].dataRecs.isDefault;
    }
  }

  /**
   * Actualiza a posição do canvas relativamente ao browser
   */
  private _loadCanvasPosition() {
    this._svgCanvasElementPosition = this.svgcanvas.nativeElement.getBoundingClientRect();
  }

  /**
   * Actualiza a posição do canvas relativamente ao browser
   */
  private _loadCanvasSize(reset: boolean = false) {

    let offset = 150;

    if (reset) {
      this._canvasSize.x = 0;
      this._canvasSize.y = 0;
    }

    this.shapes.forEach(shape => {
      let maxShapeX = shape.pos.x + shape.pos.w + offset;
      if (maxShapeX > this._canvasSize.x) {
        this._canvasSize.x = maxShapeX;
        this.svgcanvas.nativeElement.style.width = maxShapeX + 'px';
      }
      let maxShapeY = shape.pos.y + shape.pos.h + offset;
      if (maxShapeY > this._canvasSize.y) {
        this._canvasSize.y = maxShapeY;
        this.svgcanvas.nativeElement.style.height = maxShapeY + 'px';
      }
    });
  }

  /**
   * Load das APIs que podem ser usadas
   */
  private _loadApiList(): Promise<any> {

    return new Promise((resolve, reject) => {

      this._http.get(this._endpoint + `/services`, this._httpHeaders(new Object({ IXS: localStorage.IXS_id })))
        .subscribe(
          data => {
            if (!data['services']) {
              reject(data);
              return;
            };

            this.apis = data['services'].map(api => ({ type: 'api', icon: 'api', text: api.name, pos: { w: 85, h: 62 }, mockToLoad: 'designFlow/shape-api', dataRecs: api }));
            resolve(data);
          },
          error => reject(error)
        );

    });
  }

  /**
   * Cria o parâmetro auxiliar de configurações do componente
   */
  private _createConfigParam() {
    this._configParam = new JsonParams('config::' + this.inputParameters.id, new Object());
    this._globalVars.setPageParameters(this._configParam, this._componentID);
  }

  /**
   * Guarda todas as varíaveis de sistema no parâmetro auxiliar de configurações
   */
  private _loadVariables(): Promise<any> {

    return new Promise((resolve, reject) => {

      this._http.get(this._endpoint + `/designer/variables/${this._programId}/all?entity=${this._entity}`, this._httpHeaders())
        .subscribe(
          data => {
            this._configParam.value['variables'] = data || new Array();
            resolve(data);
          },
          error => reject(error)
        );

    });

  }

  /**
   * Guarda todas as Intents e Training Phrases
   */
  private _loadTrainingPhrases(): Promise<any> {

    return new Promise((resolve, reject) => {

      this._http.get(this._endpoint + `/designer/intents/${this._programId}?entity=${this._entity}`, this._httpHeaders())
        .subscribe(
          data => {
            this._configParam.value['intents'] = data['intents'] || new Array();
            resolve(data);
          },
          error => reject(error)
        );

    });

  }

  /**
   * Nome do evento que o ChatComponent emite
   */
  private _chatComponentListenerEvent = () => /* 'chatCustomEvent' ||  */'chatCustomEvent_' + this._componentID.substr(-16);

  /**
   * Adiciona ao Body da App o elemento chat-component
   */
  private _addChatComponentToBody() {

    if (!this.inputParameters.value || !this.inputParameters.value.apiKeys || this._chatComponent)
      return;

    this._cleanChatComponent();

    this._chatComponent = document.getElementById('chatbotComponent');
    if (!this._chatComponent)
      return;

    this._chatComponent.addEventListener(this._chatComponentListenerEvent(), data => this._handleCustomEvent(data));

    let chatKeyConfig = {
      detail: {
        customEventName: this._chatComponentListenerEvent(),
        chatKey: this.inputParameters.value.apiKeys.private || this.inputParameters.value.apiKeys.public,
        entityType: this._entity,
        image: this._config.getEndpoint('ImageService') + '/programs/' + this.inputParameters.value._id.$oid,
        appIpAddress: location.origin,
        appIpSocket: this._config.getEndpoint('ChatComponentSocketIp')
      }
    };

    this._chatComponent.dispatchEvent(new CustomEvent('changeChatKey', chatKeyConfig));
  }

  /**
   * Elimina referência ao elemento e respectivos eventos do ChatComponent
   */
  private _cleanChatComponent() {
    if (!this._chatComponent)
      return;

    this._chatComponent.dispatchEvent(new CustomEvent('changeChatKey', { detail: {} }));
    this._chatComponent.removeEventListener(this._chatComponentListenerEvent(), null);
  }

  /**
   * Fecha o componente Chat
   */
  private _closeChat() {
    if (this._chatComponent)
      this._chatComponent.dispatchEvent(new Event('closeChat'));
  }

  /**
   * Retira o highlight de todas as Shapes e todas as Connections
   */
  private _removeHighlightItems() {
    this._unselectShapes();
    this._unselectConnections();
    this.shapes.forEach(obj => obj.isHighlighted = 0);
    this.connections.forEach(obj => obj.isHighlighted = 0);
  }

  /**
   * Limpa da memória dados gerados pelo componente
   */
  private _cleanComponentData() {
    this._globalVars.deletePageParametersByGroup(this._componentID);
    this._cleanChatComponent();
    if (this._newEvent)
      this._newEvent.unsubscribe();
  }

  /**
   * Headers necessários dos pedidos feitos no componente
   */
  private _httpHeaders = (extraHeaders: Object = new Object()): any => new Object({
    headers: new HttpHeaders(Object.assign({ 'Authorization': `Bearer ${localStorage.token}` }, extraHeaders))
  });

  /**
   * No caso de não existirem Shapes no programa, é automaticamente colocada uma Shape Start
   */
  private _loadFirstShape() {

    if (this.shapes.length > 0)
      return;

    let shape: Shape = this.pallete.find(obj => obj.type == 'start');
    this._setShapeId(shape);
    this.shapes.push(shape);

    let offset = new DOMRect();
    offset.width = shape.pos.w,
      offset.height = shape.pos.h,
      offset.y = this._svgCanvasElementPosition.top + 50;
    offset.x = this._svgCanvasElementPosition.left + (this.canvasParent.nativeElement.getBoundingClientRect().width / 2) - (shape.pos.w / 2);

    this._savePositionOnShape(null, shape, offset);
  }

}

/**
 * Gerenciador de IDs para as Shapes criadas
 * @param shapes Array de Shapes
 */
function* getNewShapeId(shapes?: Shape[]): IterableIterator<number> {
  let max = Math.max(...shapes.map(obj => obj.number || 0));
  let index = shapes && shapes.length > 0 ? (isNaN(max) ? 0 : max) + 1 : 0;
  while (true)
    yield index++;
}

/**
 * Gerenciador de IDs para as Connections criadas
 * @param shapes Array de Shapes
 */
function* getNewConnectionId(connections?: Connection[]): IterableIterator<number> {
  let max = Math.max(...connections.map(obj => obj.number || 0));
  let index = connections && connections.length > 0 ? (isNaN(max) ? 0 : max) + 1 : 0;
  while (true)
    yield index++;
}

export interface Shape {
  type: string;
  icon?: string;
  faCode?: string;
  text?: string;
  id?: string;
  number?: number;
  mockToLoad?: string;
  dataRecs?: any;
  connectedTo?: string;
  isHighlighted?: number;
  isSelected?: number;      // É do tipo "number" para se saber a ordem de seleção
  isDeleted?: boolean;
  // connections?: {
  //   source: string[];
  //   target: string[];
  // };
  pos?: {
    initX?: number;
    initY?: number;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
  }
}

export interface Connection {
  type: string;
  subType?: string;
  id?: string;
  number?: number;
  isHighlighted?: number;
  isSelected?: boolean;
  isSuggestion?: boolean;
  mockToLoad?: string;
  connectedTo?: string;
  dataRecs?: any;
  lineAngle?: number;
  intent?: {
    name?: string;
    friendlyName?: string;
    isFallback?: boolean;
    pos?: {
      x: number;
      y: number;
    }
  };
  shapes: {
    from: Shape;
    to: Shape;
    last?: Shape
  };
  pos?: ConnectionPos;
}

export interface ConnectionPos {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  xArc?: number;
  yArc?: number;
}

