import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from 'foundations-webct-robot/robot/shared.module';
import { CustomBridgeComponent } from './custom-bridge.component';

import { CustomCSVUpload } from './csvUpload/custom-csv-upload.component';
import { CustomTableOperationComponent } from './customTableOperation/custom-table-operation.component';
import { MessageBodyEditorComponent } from './text-area-variables/text-area-variables.component';
import { CustomPieChartComponent } from './custom-pie-chart/custom-pie-chart.component';
import { SurveyHorizontalChartComponent } from './custom-survey-horizontal-chart/custom-survey-horizontal-chart.component';
import { CustomTabValidator } from './custom-tab-activator/custom-tab-activator.component';
import { CustomLinkOpenModalComponent } from './custom-link-open-modal/custom-link-open-modal.component';
import { CustomLabelInlineEdition } from './label-inline-edition/label-inline-edition.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // this is needed!

@NgModule({
  imports: [
    SharedModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    CustomBridgeComponent,
    CustomCSVUpload,
    CustomTableOperationComponent,
    MessageBodyEditorComponent,
    CustomPieChartComponent,
    SurveyHorizontalChartComponent,
    CustomTabValidator,
    CustomLinkOpenModalComponent,
    CustomLabelInlineEdition
  ],
  exports: [
    CustomBridgeComponent,
    CustomCSVUpload,
    CustomTableOperationComponent,
    MessageBodyEditorComponent,
    CustomPieChartComponent,
    SurveyHorizontalChartComponent,
    CustomTabValidator,
    CustomLinkOpenModalComponent,
    CustomLabelInlineEdition
  ]
})

export class CustomComponentsModule {
}
