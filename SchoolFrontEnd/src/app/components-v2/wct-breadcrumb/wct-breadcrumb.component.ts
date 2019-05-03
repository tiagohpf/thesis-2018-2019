import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BreadcrumbService, BreadcrumbDataType } from 'foundations-webct-palette/components/breadcrumbComponent/breadcrumb.service';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';

@Component({
  selector: 'app-wct-breadcrumb',
  templateUrl: './wct-breadcrumb.component.html',
  styleUrls: ['./wct-breadcrumb.component.css']
})
export class WctBreadcrumbComponent implements OnInit {

  @Input('routeConfig') public routeConfig;
  @Input() public dataRecs: Object;

  constructor(
      public breadcrumbService: BreadcrumbService,
      private _routeParams: ActivatedRoute) {

  }

  public ngOnInit() {
      this._routeParams.data
          .subscribe((data) => {
              this.generateBreadcrumbTrail(data['breadcrumb']);
          });
  }

  public generateBreadcrumbTrail(breadcrumb: any[]): void {
      let myBreadcrumb: BreadcrumbDataType[] = [];
      if (breadcrumb) {
          for (let i in breadcrumb['trail']) {
              myBreadcrumb.push({
                  name: breadcrumb['trail'][i],
                  route: breadcrumb['trailRoutes'] ? breadcrumb['trailRoutes'][i] : null
              });
          }
      }
      this.breadcrumbService.setBreadcrumb(myBreadcrumb, this.dataRecs);
  }

}
