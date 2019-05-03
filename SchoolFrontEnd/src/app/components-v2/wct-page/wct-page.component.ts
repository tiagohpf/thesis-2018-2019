import { Component } from "@angular/core";

import { PageComponent } from "foundations-webct-robot/robot/pageComponent/page.component";
import { PageService } from "foundations-webct-robot/robot/pageComponent/page.service";
import { ModalService } from "foundations-webct-palette/components/modalComponent/modal.service";
import { ConfigurationService } from "foundations-webct-robot/robot/utils/configuration.service";
import { AuthzService } from "foundations-webct-robot/robot/utils/authz.service";
import { FormBuilder } from "@angular/forms";
import { Utils } from "foundations-webct-robot/robot/utils/utils.service";
import { ApiService } from "foundations-webct-robot/robot/services/api.service";
import { ToggleElementsService } from "foundations-webct-robot/robot/services/toggle-elements.service";
import { FilterService } from "foundations-webct-robot/robot/services/filter.service";
import { GlobalVarsService } from "foundations-webct-robot/robot/utils/global-vars.service";
import { OperationsService } from "foundations-webct-robot/robot/utils/operations.service";
import { ActivatedRoute, Router } from "@angular/router";
import { AutoCompleteDetailsService } from "foundations-webct-palette/components/autoCompleteDetailsComponent/auto-complete-details.service";
import { ComponentsService } from "foundations-webct-robot/robot/services/components.service";
import { HttpClient } from "@angular/common/http";
import { PageObjectsService } from "foundations-webct-robot/robot/page-objects.service";
import { JsonParams } from "foundations-webct-robot/robot/classes/jsonParams.class";
import { forkJoin } from "rxjs";

@Component({
  selector: "app-wct-page",
  templateUrl: "./wct-page.component.html",
  styleUrls: ["./wct-page.component.css"]
})
export class WctPageComponent extends PageComponent {
  private _pageObjects: PageObjectsService;
  private _activeSideNav: string;

  constructor(
    private _components: ComponentsService,
    private _http: HttpClient,
    public pageService: PageService,
    public modalService: ModalService,
    public configService: ConfigurationService,
    public authzService: AuthzService,
    public fb: FormBuilder,
    public utils: Utils,
    public apiService: ApiService,
    public toggle: ToggleElementsService,
    public filterService: FilterService,
    public globalVars: GlobalVarsService,
    public operations: OperationsService,
    public routeParams: ActivatedRoute,
    public router: Router,
    public acService: AutoCompleteDetailsService
  ) {
    super(
      pageService,
      modalService,
      configService,
      authzService,
      fb,
      utils,
      apiService,
      toggle,
      filterService,
      globalVars,
      operations,
      routeParams,
      router,
      acService
    );

    this._pageObjects = new PageObjectsService();
  }

  public getHtmlId = (parameter: JsonParams, type: string) =>
    this._components.getHtmlId(parameter, type);
  public getFilterStatus = (id: string) =>
    this.filterService.getFilterStatus(id);

  /**
   * SIDENAV
   */
  public isActiveSideNav(param: JsonParams): boolean {
    let element = this.globalVars.getPageParameter(<string>param.mappingId);
    if (element) return !element.lazyLoading && !element.hidden;

    return false;
  }
  public sideNavClick(param: JsonParams) {
    if (param.navigateTo)
      return this.utils.navigate(param.navigateTo, this.dataRecs);

    let updatePage = this.utils.findObjectInArray(
      param.parameters,
      "updatePageParameter"
    );
    if (updatePage.key) {
      this._components.updateParameterById(updatePage.value, this.dataRecs);
      this._activeSideNav = param.internalId;
    }
  }
  protected _loadLayer(response = null) {
    let loadPageData = (res: JsonParams) => {
      this._mainStructure = res;
      this._robot.updatePageWithData(this._mainStructure);
      this.viewStructure = this._robot.view;

      // if (this.firstLevelLayer)
      //     this._pageObjects.init(this.viewStructure);

      this._evaluateTableConfig();

      if (["initTable", "initCards"].indexOf(this.viewStructure.type) >= 0) {
        this._observeFilter();
        this._observeRefresh();
        this._observeNewEvent();
      }

      let myParameters = this._globalVars.getPageParametersByGroup(
        this.viewStructure.id
      );
      for (let param of myParameters)
        this._robot.changeParameterByDynamicProps(
          param,
          this._utils.arrToObj(this._globalVars.getPageParametersAsArray())
        );

      if (response && this.inputParameters) {
        this._mainStructure.lazyLoading = this.inputParameters.lazyLoading;
        this._mainStructure.hidden = this.inputParameters.hidden;
      }

      if (this.firstLevelLayer) {
        if (this.loadingFromModal) {
          this.modalService.newMockStructure = [];
          this.modalService.viewStructure = this.viewStructure;
        } else {
          this.pageService.newMockStructure = [];
          this.pageService.viewStructure = this.viewStructure;
        }
      } else if (response) {
        if (this.loadingFromModal)
          this.modalService.newMockStructure.push(this.viewStructure);
        else this.pageService.newMockStructure.push(this.viewStructure);
      }

      this.pagingSettings.id = this.viewStructure.id;
      this.colapsedSidebar = this.isHorizontalFilter();

      if (this.firstLevelLayer && this.loadingFromModal)
        this.pageService.wizardFormStepsModal = [];
      else if (this.firstLevelLayer) this.pageService.wizardFormSteps = [];

      if (
        (!this.inputParameters || this.componentIndex >= 0) &&
        this._robot.paramsToValidate.length > 0
      ) {
        this.baseInfoForm = this.pageService.configValidators(
          this._robot.paramsToValidate,
          this.loadingFromModal,
          this.componentIndex,
          false,
          this.viewStructure.id
        );
      }
      if (
        this.viewStructure &&
        this.viewStructure.groups &&
        this.firstLevelLayer
      ) {
        this.pageService.setButtonsConfig(
          this.viewStructure.groups.buttons,
          "modal"
        );
      }

      this._evaluateInitFilterConfig();

      if (this.viewStructure.groups.urlResource) {
        let forkJoinConfig = this._utils.findObjectInArray(
          this.viewStructure.groups.urlResource.parameters,
          "forkJoin"
        ).value;
        if (forkJoinConfig) {
          let forkJoinUrl = [];
          let forkJoinRequests = [];

          this._offset = this._getOffset();

          for (let i in forkJoinConfig) {
            forkJoinUrl[i] = this._startApiConfiguration(forkJoinConfig[i]);
            forkJoinRequests[i] = this._utils.GetAll(
              this.pageService.setMyUrlResource(
                this.viewStructure,
                forkJoinUrl[i],
                {
                  page: { page: this.pagingSettings.currentPage },
                  offset: this._offset
                },
                this.pagingSettings,
                this.inputDataRecs,
                this.getFilterValues()
              ),
              forkJoinUrl[i].headers
            );
          }
          forkJoin(forkJoinRequests).subscribe(data => {
            let forkJoinData = {};
            for (let i in data)
              forkJoinData[forkJoinUrl[i]["id"] || i] = data[i];
            let dataIndex = 0;
            for (let i in forkJoinData) {
              this._fillData(
                data[dataIndex],
                dataIndex,
                forkJoinUrl[dataIndex],
                forkJoinData
              );
              dataIndex++;
            }
          });
        } else
          this._dealWithApiData(
            this.viewStructure.groups.urlResource.parameters
          );
      } else this._dealWithApiData();

      setTimeout(() => this.pageService.updateFuxiView(), 100);
    };

    if (response)
      this._robot
        .loadPageParams(response, this.componentId, this.cloneAs)
        .then(res => loadPageData(res));
    else loadPageData(this.inputParameters);
  }
}
