import { Component, OnInit, Renderer2 } from '@angular/core';
import { ModalComponent } from 'foundations-webct-palette/components/modalComponent/modal.component';
import { ModalService } from 'foundations-webct-palette/components/modalComponent/modal.service';
import { ComponentsService } from 'foundations-webct-robot/robot/services/components.service';

@Component({
  selector: 'app-wct-modal',
  templateUrl: './wct-modal.component.html',
  styleUrls: ['./wct-modal.component.scss']
})

export class WctModalComponent extends ModalComponent implements OnInit {

  constructor(
    public modalService: ModalService,
    public rd: Renderer2,
    public components: ComponentsService) {
    super(modalService, rd, components);
  }

}
