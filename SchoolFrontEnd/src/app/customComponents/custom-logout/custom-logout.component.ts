import { Component, OnInit } from '@angular/core';
import { AuthzService } from 'foundations-webct-robot/robot/utils/authz.service';

@Component({
  selector: 'custom-logout',
  templateUrl: './custom-logout.component.html',
  styleUrls: ['./custom-logout.component.scss']
})
export class CustomLogoutComponent implements OnInit {

  constructor(public authzService: AuthzService,
  ) { }

  ngOnInit() {

    // sessionStorage.clear();
    // let startDontShowModalAgain = localStorage.getItem('startDontShowModalAgain');
    // let has_startDontShowModalAgain = startDontShowModalAgain != null ? true : false;
    // localStorage.clear();

    // if(has_startDontShowModalAgain)
    //     localStorage.setItem('startDontShowModalAgain', 'true');

    // this._auth.keycloakJS.logout();
    this.authzService.logout();
  }

}
