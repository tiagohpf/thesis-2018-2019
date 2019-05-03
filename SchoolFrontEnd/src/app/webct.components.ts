import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';

/**
 * ROBOT
 */
import { SharedModule } from 'foundations-webct-robot/robot/shared.module';
import { PageComponent } from 'foundations-webct-robot/robot/pageComponent/page.component';

/**
 * PALETE
 */
import { AppHeaderComponent } from 'foundations-webct-palette/components/appHeaderComponent/app-header.component';
import { AppHeaderMenuComponent } from 'foundations-webct-palette/components/appHeaderComponent/app-header-menu.component';
import { AppHeaderMenuSidebarComponent } from 'foundations-webct-palette/components/appHeaderComponent/app-header-menu-sidebar.component';
import { AppFooterComponent } from 'foundations-webct-palette/components/appFooterComponent/app-footer.component';
import { NotificationComponent } from 'foundations-webct-palette/components/notificationComponent/notification.component';
import { AppSearchComponent } from 'foundations-webct-palette/components/appSearchComponent/app-search.component';
import { TuplelistComponent } from 'foundations-webct-palette/components/tuplelistComponent/tuplelist.component';
import { BreadcrumbComponent } from 'foundations-webct-palette/components/breadcrumbComponent/breadcrumb.component';
import { UserInfoComponent } from 'foundations-webct-palette/components/appHeaderComponent/userinfo.component';
import { Ng2WizardComponent } from 'foundations-webct-palette/components/wizardComponent/ng2-wizard.component';
import { Ng2WizardTabComponent } from 'foundations-webct-palette/components/wizardComponent/ng2-wizard-tab.component';
import { Ng2WizardStepComponent } from 'foundations-webct-palette/components/wizardComponent/ng2-wizard-step.component';
import { TabsComponent } from 'foundations-webct-palette/components/tabsComponent/tabs.component';
import { TabComponent } from 'foundations-webct-palette/components/tabsComponent/tab.component';
import { ParametersFormatComponent } from 'foundations-webct-palette/components/detailsComponent/parameters-format.component';
import { LoadingComponent } from 'foundations-webct-palette/components/loadingComponent/loading.component';
import { PageHeaderComponent } from 'foundations-webct-palette/components/pageHeaderComponent/page-header.component';
import { ShowParametersByTypeComponent } from 'foundations-webct-palette/components/detailsComponent/show-parameters-by-type.component';
import { TableComponent } from 'foundations-webct-palette/components/tableComponent/table.component';
import { TableFilterComponent } from 'foundations-webct-palette/components/tableComponent/table-filter.component';
import { TableOptionsComponent } from 'foundations-webct-palette/components/tableComponent/table-options.component';
import { ModalComponent } from 'foundations-webct-palette/components/modalComponent/modal.component';
import { NgxChartsComponent } from 'foundations-webct-palette/components/chartsComponent/ngx-charts.component';
import { MapComponent } from 'foundations-webct-palette/components/mapComponent/map.component';
import { SidebarToggleRowsComponent } from 'foundations-webct-palette/components/sidebarToggleRowsComponent/sidebar-toggle-rows.component';
import { AutoCompleteDetailsComponent } from 'foundations-webct-palette/components/autoCompleteDetailsComponent/auto-complete-details.component';
import { ButtonsComponent } from 'foundations-webct-palette/components/buttonsComponent/buttons.component';
import { InputSelectComponent } from 'foundations-webct-palette/components/selectComponent/select.component';
import { InputRadioComponent } from 'foundations-webct-palette/components/radioComponent/radio.component';
import { InputCheckboxComponent } from 'foundations-webct-palette/components/checkboxComponent/checkbox.component';
import { InputTextboxComponent } from 'foundations-webct-palette/components/textboxComponent/textbox.component';
import { OutputLabelComponent } from 'foundations-webct-palette/components/labelComponent/label.component';
import { OutputTagsComponent } from 'foundations-webct-palette/components/tagsComponent/tags.component';
import { SelectFromModalComponent } from 'foundations-webct-palette/components/selectFromModalComponent/select-from-modal.component';
import { TreeViewComponent } from 'foundations-webct-palette/components/treeViewComponent/tree-view.component';
import { SliderComponent } from 'foundations-webct-palette/components/sliderComponent/slider.component';
import { CardComponent } from 'foundations-webct-palette/components/cardComponent/card.component';
import { PaginationComponent } from 'foundations-webct-palette/components/paginationComponent/pagination.component';
import { AssymetrikMapComponent } from 'foundations-webct-palette/components/assymetrikMapComponent/assymetrikMap.component';
import { DateTimePickerComponent } from 'foundations-webct-palette/components/datepickerComponent/datetimepicker.component';
import { DateTimePickerIntervalComponent } from 'foundations-webct-palette/components/datepickerIntervalComponent/datetimepickerInterval.component';
import { SelectedItemsContainerComponent } from 'foundations-webct-palette/components/selected-items-container/selected-items-container.component';
import { CaptchaComponent } from 'foundations-webct-palette/components/captchaComponent/captcha.component';
import { PlaygroundComponent } from 'foundations-webct-palette/components/playgroundComponent/playground.component';
import { DropdownComponent } from 'foundations-webct-palette/components/dropdownComponent/dropdown.component';
import { AutocompleteComponent } from 'foundations-webct-palette/components/autocompleteComponent/autocomplete.component';
import { TextboxUnicityValidatorComponent } from 'foundations-webct-palette/components/unicityValidatorComponent/unicity-validator.component';
import { WctNgSelectComponent } from 'foundations-webct-palette/components/wct-ng-select/wct-ng-select.component';


/**
 * Upload  DND Upload files
 */
import { UploadComponent } from 'foundations-webct-palette/components/upload/upload.component';
import { DndDirective } from 'foundations-webct-palette/components/upload/dnd.directive';



/**
 * CUSTOM COMPONENTS / SERVICES
 */
import { JsonComponent } from 'foundations-webct-palette/components/jsonComponent/json.component';
import { ImageComponent } from 'foundations-webct-palette/components/imageComponent/image.component';
import { ColorpickerComponent } from 'foundations-webct-palette/components/colorpickerComponent/colorpicker.component';
import { BtnIpComponent } from 'foundations-webct-palette/components/btnIpComponent/btn-ip.component';
import { ProgressbarComponent } from 'foundations-webct-palette/components/progressbarComponent/progressbar.component';
import { HtmlContainerComponent } from 'foundations-webct-palette/components/htmlContainerComponent/htmlContainer.component';
import { HighlightEditorComponent } from 'foundations-webct-palette/components/highlightEditorComponent/highlightEditor.component';

import { RolesFormComponent } from 'foundations-webct-palette/components/userManagementComponent/rolesFormComponent/roles-form.component';

import { DragComponentComponent } from './designerFlow/drag-component/drag-component.component';
import { FormHandlerComponentComponent } from './designerFlow/form-handler-component/form-handler-component.component';
import { NavbarComponentComponent } from './designerFlow/navbar-component/navbar-component.component';

import { BsOrderConnectionsComponent } from './customComponents/bs-order-connections/bs-order-connections.component';
import { BsVaAnswerComponent } from './customComponents/bs-va-answer/bs-va-answer.component';
import { BsStudentChatElementInitComponent } from './customComponents/bs-student-chat-element-init/bs-student-chat-element-init.component';


export const DECLARATIONS: any[] = [
  PageComponent,
  ModalComponent,
  AppHeaderComponent,
  AppHeaderMenuComponent,
  AppHeaderMenuSidebarComponent,
  AppFooterComponent,
  BreadcrumbComponent,
  AppSearchComponent,
  UserInfoComponent,
  NotificationComponent,
  Ng2WizardComponent,
  Ng2WizardTabComponent,
  Ng2WizardStepComponent,
  TabsComponent,
  TabComponent,
  DateTimePickerComponent,
  DateTimePickerIntervalComponent,
  ParametersFormatComponent,
  LoadingComponent,
  TuplelistComponent,
  PageHeaderComponent,
  ShowParametersByTypeComponent,
  TableComponent,
  SidebarToggleRowsComponent,
  AutoCompleteDetailsComponent,
  ButtonsComponent,
  TableFilterComponent,
  TableOptionsComponent,
  InputSelectComponent,
  InputRadioComponent,
  InputCheckboxComponent,
  InputTextboxComponent,
  OutputLabelComponent,
  OutputTagsComponent,
  SelectFromModalComponent,
  NgxChartsComponent,
  MapComponent,
  TreeViewComponent,
  SliderComponent,
  CardComponent,
  PaginationComponent,
  AssymetrikMapComponent,
  RolesFormComponent,
  UploadComponent,
  DndDirective,
  SelectedItemsContainerComponent,
  CaptchaComponent,
  PlaygroundComponent,
  DropdownComponent,
  AutocompleteComponent,
  TextboxUnicityValidatorComponent,
  WctNgSelectComponent,
  JsonComponent,
  ImageComponent,
  ColorpickerComponent,
  BtnIpComponent,
  ProgressbarComponent,
  HtmlContainerComponent,
  HighlightEditorComponent,
  DragComponentComponent,
  FormHandlerComponentComponent,
  NavbarComponentComponent,
  BsOrderConnectionsComponent,
  BsVaAnswerComponent,
  BsStudentChatElementInitComponent
];

export const EXPORTS: any[] = [
  SharedModule,
  PageComponent,
  ModalComponent,
  AppHeaderComponent,
  AppHeaderMenuComponent,
  AppHeaderMenuSidebarComponent,
  AppFooterComponent,
  BreadcrumbComponent,
  AppSearchComponent,
  UserInfoComponent,
  NotificationComponent,
  Ng2WizardComponent,
  Ng2WizardTabComponent,
  Ng2WizardStepComponent,
  TabsComponent,
  TabComponent,
  DateTimePickerComponent,
  DateTimePickerIntervalComponent,
  ParametersFormatComponent,
  LoadingComponent,
  TuplelistComponent,
  PageHeaderComponent,
  ShowParametersByTypeComponent,
  TableComponent,
  SidebarToggleRowsComponent,
  AutoCompleteDetailsComponent,
  ButtonsComponent,
  TableFilterComponent,
  TableOptionsComponent,
  InputSelectComponent,
  InputRadioComponent,
  InputCheckboxComponent,
  InputTextboxComponent,
  OutputLabelComponent,
  OutputTagsComponent,
  SelectFromModalComponent,
  NgxChartsComponent,
  MapComponent,
  TreeViewComponent,
  SliderComponent,
  CardComponent,
  PaginationComponent,
  AssymetrikMapComponent,
  RolesFormComponent,
  SelectedItemsContainerComponent,
  CaptchaComponent,
  PlaygroundComponent,
  DropdownComponent,
  AutocompleteComponent,
  TextboxUnicityValidatorComponent,
  WctNgSelectComponent,
  DragComponentComponent,
  FormHandlerComponentComponent,
  NavbarComponentComponent,
  BsOrderConnectionsComponent,
  BsVaAnswerComponent,
  BsStudentChatElementInitComponent
]
