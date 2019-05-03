import { Component, OnInit, Input } from '@angular/core';

import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';

@Component({
  selector: 'survey-horizontal-chart',
  templateUrl: 'custom-survey-horizontal-chart.component.html',
  styleUrls: ['custom-survey-horizontal-chart.component.css']
})
export class SurveyHorizontalChartComponent implements OnInit {

  @Input() public inputParameters: JsonParams;
  @Input() public dataRecs: Object;

  public chartSurveyColors: string[] = [
    '#005c74',
    '#a9c00c',
    '#f37e2d',
    '#00a8c1',
    '#de2c57'
  ];

  private _total = 0;

  constructor(private _utils: Utils) {

  }

  public ngOnInit() {
    if (this.dataRecs[this.inputParameters.id]) {
      this.dataRecs[this.inputParameters.id].forEach(element => {
        this._total += element.count;
      });
    }
    this._chartSurveyColors_Parameters();
  }

  public chartSurveyTitle = answer => `${answer.option} (${this._percentage(answer.count)})`;

  public chartSurveySize = (currPoint: number, totalPoints: any[]) =>
    `calc(${(
      currPoint *
      100 /
      totalPoints.map(obj => obj.count).reduce((a, b) => a + b)
    ).toString()}%)`;

  private _percentage(value: number): string {
    return value.toString() ? ((value / this._total) * 100).toFixed(2) + ' %' : '';
  }

  private _chartSurveyColors_Parameters() {

    let colors = this._utils.findObjectInArray(this.inputParameters.parameters, 'chartSurveyColors');

    if (colors.key) {
      this.chartSurveyColors = colors.value;
    }
  }
}
