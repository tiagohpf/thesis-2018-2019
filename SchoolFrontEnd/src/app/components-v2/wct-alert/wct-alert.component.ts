import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-wct-alert',
  templateUrl: './wct-alert.component.html',
  styleUrls: ['./wct-alert.component.css']
})
export class WctAlertComponent implements OnInit {

  @Input() type: string = 'info';
  @Input() message: string;

  constructor() { }

  ngOnInit() {
  }

}
