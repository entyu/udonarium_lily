import { Component, Input, OnInit } from '@angular/core';

import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';

import { TabletopObject } from '@udonarium/tabletop-object';
import { GameCharacter } from '@udonarium/game-character';

@Component({
  selector: 'game-character-buff-view',
  templateUrl: './game-character-buff-view.component.html',
  styleUrls: ['./game-character-buff-view.component.css']
})
export class GameCharacterBuffViewComponent implements OnInit {

//  @Input() title: string = '';

  @Input() character: TabletopObject = null;

  constructor(
    private panelService: PanelService,
    private modalService: ModalService
  ) { }

  ngOnInit() {
/*
    Promise.resolve().then(() => {
      this.panelService.title = this.title;
      if (this.modalService.option && this.modalService.option.title != null) {
        this.modalService.title = this.modalService.option.title ? this.modalService.option.title : '';
        this.text = this.modalService.option.text ? this.modalService.option.text : '';
      }
    });
*/
  }

}
