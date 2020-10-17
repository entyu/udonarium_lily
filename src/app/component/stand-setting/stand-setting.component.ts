import { animate, keyframes, style, transition, trigger } from '@angular/animations'; 
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EventSystem } from '@udonarium/core/system';
import { PanelService } from 'service/panel.service';
import { DataElement } from '@udonarium/data-element';
import { GameCharacter } from '@udonarium/game-character';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ModalService } from 'service/modal.service';
import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';

import { StandElementComponent } from 'component/stand-element/stand-element.component'

@Component({
  selector: 'app-stand-setting',
  templateUrl: './stand-setting.component.html',
  styleUrls: ['./stand-setting.component.css'],
  animations: [
    trigger('bounceInOut', [
      transition('void => *', [
        animate('600ms ease', keyframes([
          style({ transform: 'scale3d(0, 0, 0)', offset: 0 }),
          style({ transform: 'scale3d(1.5, 1.5, 1.5)', offset: 0.5 }),
          style({ transform: 'scale3d(0.75, 0.75, 0.75)', offset: 0.75 }),
          style({ transform: 'scale3d(1.125, 1.125, 1.125)', offset: 0.875 }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0)', offset: 1.0 })
        ]))
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'scale3d(0, 0, 0)' }))
      ])
    ]),
    trigger('slideInOut', [
      transition('void => *', [
        animate('600ms ease', keyframes([
          style({ transform: 'scale3d(0, 1.0, 1.0)', offset: 0 }),
          style({ transform: 'scale3d(1.5, 1.5, 1.5)', offset: 0.5 }),
          style({ transform: 'scale3d(0.75, 0.75, 0.75)', offset: 0.75 }),
          style({ transform: 'scale3d(1.125, 1.125, 1.125)', offset: 0.875 }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0)', offset: 1.0 })
        ]))
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'scale3d(0, 1.0, 1.0)' }))
      ])
    ]),
  ]
})
export class StandSettingComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() character: GameCharacter = null;

  constructor(
    private panelService: PanelService,
    private modalService: ModalService
  ) { }

  get stands(): DataElement[] {
    return this.character.standList.stands;
  }

  ngOnInit() {
    Promise.resolve().then(() => this.updatePanelTitle());
    EventSystem.register(this)
      .on('DELETE_GAME_OBJECT', -1000, event => {
        if (this.character && this.character.identifier === event.data.identifier) {
          this.panelService.close();
        }
      });
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  updatePanelTitle() {
    this.panelService.title = this.character.name + ' の立ち絵設定';
  }

  add() {
    this.character.standList.add();
  }

  remove(stand: DataElement) {
    this.character.standList.remove(stand);
  }

  setStandImage(dataElm: DataElement) {
    this.modalService.open<string>(FileSelecterComponent, { isAllowedEmpty: false }).then(value => {
      if (!value) return;
      dataElm.value = value;
    });
  }

  imageElementToFile(dataElm: DataElement): ImageFile {
    if (!dataElm) return ImageFile.Empty;
    return ImageStorage.instance.get(<string>dataElm.value);
  }
}
