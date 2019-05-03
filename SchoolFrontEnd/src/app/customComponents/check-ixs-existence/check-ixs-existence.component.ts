import { Component, DoCheck } from '@angular/core';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';

@Component({
  selector: 'app-check-ixs-existence',
  template: ``
})
export class CheckIxsExistenceComponent implements DoCheck {

  constructor(private _utils: Utils) { }

  ngDoCheck() {
    if (!localStorage.getItem('IXS_id') && location.pathname != '/') {
      this._utils.navigate('/');
    }
  }
}
