import { Component, OnInit, Input } from '@angular/core';
import { Shape, Connection } from '../drag-component/drag-component.component';

@Component({
  selector: 'app-form-handler-component',
  templateUrl: './form-handler-component.component.html',
  styleUrls: ['./form-handler-component.component.scss']
})
export class FormHandlerComponentComponent implements OnInit {

  @Input() public formConfig: Shape | Connection = null;

  constructor() { }

  public ngOnInit() {
  }

}
