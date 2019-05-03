import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';

/**
 * ROBOT
 */
import { EXPORTS, DECLARATIONS } from './webct.components';
import { EXPORTS_V2, DECLARATIONS_V2 } from './webct-v2.components';
import { SharedModule } from 'foundations-webct-robot/robot/shared.module';
import { NotificationService } from 'foundations-webct-palette/components/notificationComponent/notification.component';
import { AutoCompleteDetailsService } from 'foundations-webct-palette/components/autoCompleteDetailsComponent/auto-complete-details.service';
import { ExportService } from 'foundations-webct-palette/components/tableComponent/table-export.service';
import { UploadService } from 'foundations-webct-palette/components/upload/upload.service';
import { ModalService } from 'foundations-webct-palette/components/modalComponent/modal.service';
import { BreadcrumbService } from 'foundations-webct-palette/components/breadcrumbComponent/breadcrumb.service';
import { AppHeaderService } from 'foundations-webct-palette/components/appHeaderComponent/app-header.service';
/**
 * CUSTOM COMPONENTS / SERVICES
 */
import { CustomComponentsModule } from './customComponents/custom.module';
import { ClientCustomValidatorProvider, ClientCustomUtilsProvider } from './app.custom-factory';
import { UserManagementService } from 'foundations-webct-palette/components/userManagementComponent/usermanagement.service';
import { TextboxUnicityValidatorService } from 'foundations-webct-palette/components/unicityValidatorComponent/unicity-validator.service';

import { ActivityLogService } from './customComponents/activitylog.service';
import { ImagesService } from './customComponents/images.service';
import { IxsService } from './customComponents/ixs.service';
import { StripeService } from './customComponents/stripe/stripe.service';
import { PrintService } from './customComponents/print/print.service';

import { WctNotificationService } from './components-v2/wct-notification/wct-notification.service'

import { TagInputModule } from 'ngx-chips';
import { MentionModule } from 'ngx-ui-mention';
import { TextInputHighlightModule } from 'angular-text-input-highlight';

import { DragDropModule } from '@angular/cdk/drag-drop';

//import { PROVIDERS_V2 } from './webct-v2.components';

@NgModule({
  declarations: DECLARATIONS.concat(DECLARATIONS_V2),
  imports: [ // import Angular's modules
    SharedModule,
    CustomComponentsModule,
    TagInputModule,
    MentionModule,
    TextInputHighlightModule,
    DragDropModule
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    ClientCustomValidatorProvider,
    ClientCustomUtilsProvider,
    NotificationService,
    AutoCompleteDetailsService,
    ExportService,
    UploadService,
    ModalService,
    DatePipe,
    UserManagementService,
    BreadcrumbService,
    TextboxUnicityValidatorService,
    AppHeaderService,
    ActivityLogService,
    ImagesService,
    IxsService,
    StripeService,
    PrintService,
    WctNotificationService
  ],
  exports: EXPORTS.concat(EXPORTS_V2, [DragDropModule]),
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WebctModule {
}
