import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-navbar-component',
  templateUrl: './navbar-component.component.html',
  styleUrls: ['./navbar-component.component.scss']
})
export class NavbarComponentComponent implements OnInit {

  @Input() public canImport: boolean = false;
  @Input() public canExport: boolean = false;
  @Input() public canConnect: boolean = false;

  @Output() public import: EventEmitter<any> = new EventEmitter();
  @Output() public export: EventEmitter<any> = new EventEmitter();
  @Output() public connect: EventEmitter<any> = new EventEmitter();

  constructor() { }

  public ngOnInit() {
  }

  public emitImport = () => this.import.emit(true);
  public emitExport = () => this.export.emit(true);
  public emitConnect = () => this.connect.emit(true);

}
