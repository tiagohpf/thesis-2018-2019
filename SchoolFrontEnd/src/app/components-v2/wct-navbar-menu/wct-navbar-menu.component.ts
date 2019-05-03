import { Component, Input } from '@angular/core';

import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { AppHeaderService } from 'foundations-webct-palette/components/appHeaderComponent/app-header.service';

@Component({
  selector: 'app-wct-navbar-menu',
  templateUrl: './wct-navbar-menu.component.html',
  styleUrls: ['./wct-navbar-menu.component.css']
})
export class WctNavbarMenuComponent {

  @Input() public viewStructure: JsonParams;

  public showResponsiveMenu: boolean = false;

  private _matchActive: Object = new Object();

  constructor(private _header: AppHeaderService) { }

  public navigateTo = (e, menu: JsonParams) => this._header.navigateTo(e, menu);
  public toggleSubMenuStatus = (menu: JsonParams) => this._header.toggleSubMenuStatus(menu);
  public getSubMenuStatus = (menu: JsonParams) => this._header.getSubMenuStatus(menu);
  public checkActivatedRoute = (menu: JsonParams) => this._header.checkActivatedRoute(menu, 'top');
  public menuHasActions = (menu: JsonParams): boolean => !!menu.navigateTo || menu.type == 'openModal' || menu.type == 'submit' || menu.type == 'execute' || menu.type == 'updatePage' || menu.type == 'logout'

}
